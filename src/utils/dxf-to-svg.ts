import DxfParser from 'dxf-parser';

interface DxfEntity {
  type: string;
  vertices?: Array<{ x: number; y: number; bulge?: number }>;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  center?: { x: number; y: number };
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  shape?: boolean;
  // spline
  controlPoints?: Array<{ x: number; y: number }>;
  fitPoints?: Array<{ x: number; y: number }>;
  degreeOfSplineCurve?: number;
}

export interface DxfParseResult {
  svgPath: string;
  widthInches: number;
  heightInches: number;
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function arcToSvg(
  cx: number, cy: number, r: number,
  startAngleDeg: number, endAngleDeg: number
): string {
  // DXF angles are counter-clockwise from positive X
  const startRad = degToRad(startAngleDeg);
  const endRad = degToRad(endAngleDeg);

  const sx = cx + r * Math.cos(startRad);
  const sy = cy + r * Math.sin(startRad);
  const ex = cx + r * Math.cos(endRad);
  const ey = cy + r * Math.sin(endRad);

  // Determine sweep
  let sweep = endAngleDeg - startAngleDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;

  // SVG arcs: counter-clockwise = sweep-flag 0
  return `M ${sx},${sy} A ${r},${r} 0 ${largeArc} 0 ${ex},${ey}`;
}

function bulgeArcToSvg(
  x1: number, y1: number,
  x2: number, y2: number,
  bulge: number
): string {
  // Bulge = tan(included_angle / 4)
  const dx = x2 - x1;
  const dy = y2 - y1;
  const chordLen = Math.sqrt(dx * dx + dy * dy);
  const sagitta = Math.abs(bulge) * chordLen / 2;
  const r = (chordLen * chordLen / 4 + sagitta * sagitta) / (2 * sagitta);
  const largeArc = Math.abs(bulge) > 1 ? 1 : 0;
  const sweepFlag = bulge > 0 ? 0 : 1;
  return `A ${r},${r} 0 ${largeArc} ${sweepFlag} ${x2},${y2}`;
}

function entityToSvgPath(entity: DxfEntity): string {
  switch (entity.type) {
    case 'LINE': {
      if (!entity.startPoint || !entity.endPoint) return '';
      const { x: x1, y: y1 } = entity.startPoint;
      const { x: x2, y: y2 } = entity.endPoint;
      return `M ${x1},${-y1} L ${x2},${-y2}`;
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      if (!entity.vertices || entity.vertices.length < 2) return '';
      const verts = entity.vertices;
      let path = `M ${verts[0].x},${-verts[0].y}`;
      for (let i = 0; i < verts.length - 1; i++) {
        const v = verts[i];
        const next = verts[i + 1];
        if (v.bulge && v.bulge !== 0) {
          path += ' ' + bulgeArcToSvg(v.x, -v.y, next.x, -next.y, v.bulge);
        } else {
          path += ` L ${next.x},${-next.y}`;
        }
      }
      // Close if shape flag
      if (entity.shape) {
        const last = verts[verts.length - 1];
        const first = verts[0];
        if (last.bulge && last.bulge !== 0) {
          path += ' ' + bulgeArcToSvg(last.x, -last.y, first.x, -first.y, last.bulge);
        }
        path += ' Z';
      }
      return path;
    }

    case 'ARC': {
      if (!entity.center || entity.radius === undefined) return '';
      return arcToSvg(
        entity.center.x, -entity.center.y,
        entity.radius,
        -(entity.endAngle || 0),
        -(entity.startAngle || 0)
      );
    }

    case 'CIRCLE': {
      if (!entity.center || entity.radius === undefined) return '';
      const cx = entity.center.x;
      const cy = -entity.center.y;
      const r = entity.radius;
      // Draw circle as two arcs
      return `M ${cx - r},${cy} A ${r},${r} 0 1 0 ${cx + r},${cy} A ${r},${r} 0 1 0 ${cx - r},${cy} Z`;
    }

    case 'SPLINE': {
      const pts = entity.fitPoints || entity.controlPoints;
      if (!pts || pts.length < 2) return '';
      // Approximate as polyline through points
      let path = `M ${pts[0].x},${-pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        path += ` L ${pts[i].x},${-pts[i].y}`;
      }
      return path;
    }

    default:
      return '';
  }
}

function getPathBounds(pathStr: string): { minX: number; minY: number; maxX: number; maxY: number } {
  // Extract all numeric coordinate pairs from the path
  const numRegex = /[-+]?[0-9]*\.?[0-9]+/g;
  const commands = pathStr.match(/[MLACQSTHVZ][^MLACQSTHVZ]*/gi) || [];
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const cmd of commands) {
    const type = cmd.charAt(0).toUpperCase();
    if (type === 'Z') continue;
    
    const nums = cmd.slice(1).match(numRegex);
    if (!nums) continue;
    
    const values = nums.map(Number);
    
    if (type === 'M' || type === 'L') {
      for (let i = 0; i < values.length - 1; i += 2) {
        minX = Math.min(minX, values[i]);
        maxX = Math.max(maxX, values[i]);
        minY = Math.min(minY, values[i + 1]);
        maxY = Math.max(maxY, values[i + 1]);
      }
    } else if (type === 'A') {
      // For arcs, use the endpoint (last two values)
      if (values.length >= 7) {
        const ex = values[values.length - 2];
        const ey = values[values.length - 1];
        minX = Math.min(minX, ex);
        maxX = Math.max(maxX, ex);
        minY = Math.min(minY, ey);
        maxY = Math.max(maxY, ey);
      }
    } else {
      // For other commands, treat pairs as coordinates
      for (let i = 0; i < values.length - 1; i += 2) {
        minX = Math.min(minX, values[i]);
        maxX = Math.max(maxX, values[i]);
        minY = Math.min(minY, values[i + 1]);
        maxY = Math.max(maxY, values[i + 1]);
      }
    }
  }
  
  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

function translatePath(pathStr: string, dx: number, dy: number): string {
  // Translate all coordinate values in the path
  const result = pathStr.replace(/([MLCSQTA])\s*([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/gi,
    (_match, cmd, x, y) => {
      return `${cmd} ${(parseFloat(x) + dx).toFixed(4)},${(parseFloat(y) + dy).toFixed(4)}`;
    }
  );
  return result;
}

export function parseDxfToSvg(dxfContent: string, scaleInput: number = 1): DxfParseResult {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfContent);
  
  if (!dxf || !dxf.entities || dxf.entities.length === 0) {
    throw new Error('No entities found in DXF file. Please check the file format.');
  }

  // Convert entities to SVG path segments
  const pathSegments: string[] = [];
  for (const entity of dxf.entities as DxfEntity[]) {
    const seg = entityToSvgPath(entity);
    if (seg) pathSegments.push(seg);
  }

  if (pathSegments.length === 0) {
    throw new Error('Could not extract any drawable entities from DXF file.');
  }

  let combinedPath = pathSegments.join(' ');

  // Get bounding box
  const bounds = getPathBounds(combinedPath);
  
  // Normalize to origin (0,0)
  combinedPath = translatePath(combinedPath, -bounds.minX, -bounds.minY);

  const rawWidth = bounds.maxX - bounds.minX;
  const rawHeight = bounds.maxY - bounds.minY;

  // Apply scale: scaleInput = how many inches per 1 DXF unit
  const widthInches = rawWidth * scaleInput;
  const heightInches = rawHeight * scaleInput;

  return {
    svgPath: combinedPath,
    widthInches: Math.max(widthInches, 0.1),
    heightInches: Math.max(heightInches, 0.1),
  };
}
