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
  detectedUnits: string;
  rawWidth: number;
  rawHeight: number;
}

/**
 * Convert $INSUNITS value to a multiplier that converts to inches.
 */
function getUnitMultiplierToInch(insUnits?: number): { multiplier: number; label: string } {
  switch (insUnits) {
    case 1: return { multiplier: 1, label: 'Inches' };
    case 2: return { multiplier: 12, label: 'Feet' };
    case 4: return { multiplier: 1 / 25.4, label: 'Millimeters' };
    case 5: return { multiplier: 1 / 2.54, label: 'Centimeters' };
    case 6: return { multiplier: 1 / 0.0254, label: 'Meters' };
    default: return { multiplier: 1, label: insUnits === undefined ? 'Unknown (assuming Inches)' : `Code ${insUnits} (assuming Inches)` };
  }
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

function sampleSpline(entity: any, segments = 40) {
  if (!entity.controlPoints || entity.controlPoints.length < 4) return [];

  const pts = entity.controlPoints;

  function cubic(p0: any, p1: any, p2: any, p3: any, t: number) {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  }

  const out: any[] = [];
  for (let i = 0; i < pts.length - 3; i += 3) {
    for (let t = 0; t <= 1; t += 1 / segments) {
      out.push(cubic(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], t));
    }
  }
  return out;
}

function entityToSvgPath(entity: DxfEntity): string {
  switch (entity.type) {
    case 'LINE': {
      if (!entity.startPoint || !entity.endPoint) return '';
      const { x: x1, y: y1 } = entity.startPoint;
      const { x: x2, y: y2 } = entity.endPoint;
      return `L ${x2},${-y2}`;
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

    case 'ELLIPSE': {
      const c = (entity as any).center;
      const major = (entity as any).majorAxisEndPoint;
      const ratio = (entity as any).axisRatio || 1;

      if (!c || !major) return '';

      const rx = Math.hypot(major.x, major.y);
      const ry = rx * ratio;

      const start = (entity as any).startAngle || 0;
      const end = (entity as any).endAngle || Math.PI * 2;

      const sx = c.x + rx * Math.cos(start);
      const sy = -(c.y + ry * Math.sin(start));
      const ex = c.x + rx * Math.cos(end);
      const ey = -(c.y + ry * Math.sin(end));

      return `M ${sx},${sy} A ${rx},${ry} 0 1 0 ${ex},${ey}`;
    }

    case 'ARC': {
      if (!entity.center || entity.radius === undefined) return '';

      const cx = entity.center.x;
      const cy = -entity.center.y;
      const r = entity.radius;

      const start = (entity.startAngle ?? 0) * Math.PI / 180;
      const end = (entity.endAngle ?? 0) * Math.PI / 180;

      const sx = cx + r * Math.cos(start);
      const sy = cy + r * Math.sin(start);
      const ex = cx + r * Math.cos(end);
      const ey = cy + r * Math.sin(end);

      let delta = end - start;
      if (delta < 0) delta += Math.PI * 2;

      const largeArcFlag = delta > Math.PI ? 1 : 0;
      const sweepFlag = 1; // DXF arcs go CCW

      console.log('ARC', {
        start: entity.startAngle,
        end: entity.endAngle,
        r: entity.radius
      });

      return `A ${r},${r} 0 ${largeArcFlag} ${sweepFlag} ${ex},${ey}`;
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
      console.log('SPLINE ENTITY FOUND', entity);
      const sampled = sampleSpline(entity, 60);
      console.log('SPLINE SAMPLED POINTS:', sampled.length);
      if (sampled.length < 2) return '';
      let path = `M ${sampled[0].x},${-sampled[0].y}`;
      for (let i = 1; i < sampled.length; i++) {
        path += ` L ${sampled[i].x},${-sampled[i].y}`;
      }
      return path;
    }

    default:
      return '';
  }
}

function getPathBounds(pathStr: string): { minX: number; minY: number; maxX: number; maxY: number } {
  const numRegex = /[-+]?[0-9]*\.?[0-9]+/g;
  const nums = pathStr.match(numRegex);

  if (!nums) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  const values = nums.map(Number);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < values.length - 1; i += 2) {
    const x = values[i];
    const y = values[i + 1];

    if (isFinite(x) && isFinite(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  if (!isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  return { minX, minY, maxX, maxY };
}

function translatePath(pathStr: string, dx: number, dy: number): string {
  const result = pathStr.replace(/([MLCSQTA])\s*([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/gi,
    (_match, cmd, x, y) => {
      return `${cmd} ${(parseFloat(x) + dx).toFixed(4)},${(parseFloat(y) + dy).toFixed(4)}`;
    }
  );
  return result;
}

/**
 * Scale all coordinate values in an SVG path string by a factor.
 * This converts path coordinates from raw DXF units to inches.
 */
function scalePath(pathStr: string, factor: number): string {
  if (factor === 1) return pathStr;
  return pathStr.replace(/([MLCSQTA])\s*([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/gi,
    (_match, cmd, x, y) => {
      return `${cmd} ${(parseFloat(x) * factor).toFixed(4)},${(parseFloat(y) * factor).toFixed(4)}`;
    }
  ).replace(/(A)\s*([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/gi,
    (_match, cmd, rx, ry, rot, large, sweep, ex, ey) => {
      return `${cmd} ${(parseFloat(rx) * factor).toFixed(4)},${(parseFloat(ry) * factor).toFixed(4)} ${rot} ${large} ${sweep} ${(parseFloat(ex) * factor).toFixed(4)},${(parseFloat(ey) * factor).toFixed(4)}`;
    }
  );
}

function normalizeSvgPath(path: string) {
  const numbers = path.match(/-?\d*\.?\d+/g);
  if (!numbers || numbers.length < 2) return path;

  const vals = numbers.map(n => Number(n)).filter(n => Number.isFinite(n));
  if (vals.length < 2) return path;

  let minX = Infinity;
  let minY = Infinity;

  for (let i = 0; i < vals.length - 1; i += 2) {
    minX = Math.min(minX, vals[i]);
    minY = Math.min(minY, vals[i + 1]);
  }

  if (!isFinite(minX) || !isFinite(minY)) return path;

  if (minX >= 0 && minY >= 0) return path;

  return path.replace(
    /([MLA])\s*(-?\d*\.?\d+),(-?\d*\.?\d+)/gi,
    (_, cmd, x, y) => {
      const nx = Number(x);
      const ny = Number(y);
      if (!isFinite(nx) || !isFinite(ny)) return `${cmd} ${x},${y}`;
      return `${cmd} ${(nx - minX).toFixed(4)},${(ny - minY).toFixed(4)}`;
    }
  );
}

/**
 * Preprocess DXF content to remove extended data blocks that dxf-parser cannot handle.
 * Strips 102 group code blocks (ACAD_REACTORS, ACAD_XDICTIONARY) and 1001+ xdata.
 */
function preprocessDxf(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Skip 102 { ... 102 } blocks (ACAD_REACTORS, ACAD_XDICTIONARY)
    if (trimmed === '102') {
      const nextLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
      if (nextLine.startsWith('{')) {
        // Skip until matching 102 }
        i += 2; // skip '102' and '{...'
        while (i < lines.length) {
          const t = lines[i].trim();
          if (t === '102') {
            const next = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
            if (next === '}') {
              i += 2; // skip closing '102' and '}'
              break;
            }
          }
          i++;
        }
        continue;
      }
    }

    // Skip xdata groups (1001, 1002, 1000, 1070, 1040, 1071, 1010, 1020, 1030)
    const groupCode = parseInt(trimmed, 10);
    if (groupCode >= 1000 && groupCode <= 1071) {
      i += 2; // skip group code + value
      continue;
    }

    result.push(lines[i]);
    i++;
  }

  return result.join('\n');
}

export function parseDxfToSvg(dxfContent: string, scaleInput: number = 1): DxfParseResult {
  const parser = new DxfParser();
  const cleanedContent = preprocessDxf(dxfContent);
  const dxf = parser.parseSync(cleanedContent);

  if (!dxf || !dxf.entities || dxf.entities.length === 0) {
    throw new Error('No entities found in DXF file. Please check the file format.');
  }

  // Detect DXF units from header
  const insUnits = dxf.header?.['$INSUNITS'] as number | undefined;
  const { multiplier: unitFactor, label: detectedUnits } = getUnitMultiplierToInch(insUnits);
  const finalScale = unitFactor * scaleInput;

  // Filter out non-geometry entities (dimensions, text, points, etc.)
  // and skip annotation layers like AM_5, Defpoints
  const skipLayers = new Set(['am_5', 'defpoints', 'am_bor']);
  const skipTypes = new Set(['DIMENSION', 'MTEXT', 'TEXT', 'POINT', 'HATCH', 'VIEWPORT', 'ATTRIB', 'ATTDEF']);

  // Helper: process a single entity, returning svg path segment with optional translation
  function processEntity(entity: DxfEntity, tx = 0, ty = 0): string {
    const layer = ((entity as any).layer || '').toLowerCase();
    if (skipLayers.has(layer)) return '';
    if (skipTypes.has(entity.type)) return '';

    // Handle INSERT → expand block entities
    if (entity.type === 'INSERT') {
      const insertEnt = entity as any;
      const blockName = insertEnt.name;
      const block = (dxf as any).blocks?.[blockName];
      if (!block || !block.entities) {
        console.log('INSERT block not found:', blockName);
        return '';
      }
      console.log('INSERT block:', blockName);
      console.log('Block entity count:', block.entities.length);

      const ix = (insertEnt.position?.x || 0) + tx;
      const iy = (insertEnt.position?.y || 0) + ty;

      let blockPath = '';
      for (const bEntity of block.entities) {
        blockPath += processEntity(bEntity as DxfEntity, ix, iy);
      }
      return blockPath;
    }

    let seg = entityToSvgPath(entity);
    if (!seg) return '';

    // Apply translation from INSERT position
    if (tx !== 0 || ty !== 0) {
      seg = translatePath(seg, tx, -ty);
    }

    return seg + ' ';
  }

  let combinedPath = '';
  let isFirst = true;
  for (const entity of dxf.entities as DxfEntity[]) {
    const seg = processEntity(entity);
    if (!seg) continue;

    if (isFirst) {
      const match = seg.match(/-?\d*\.?\d+/g);
      if (match && match.length >= 2) {
        combinedPath += `M ${match[0]},${match[1]} `;
        isFirst = false;
      }
    }

    combinedPath += seg;
  }

  combinedPath = normalizeSvgPath(combinedPath);
  console.log("POST NORMALIZE PATH START", combinedPath.slice(0, 120));
  // Get bounding box in raw DXF units
  const bounds = getPathBounds(combinedPath);

  // Normalize to origin (0,0)
  combinedPath = translatePath(combinedPath, -bounds.minX, -bounds.minY);

  const rawWidth = bounds.maxX - bounds.minX;
  const rawHeight = bounds.maxY - bounds.minY;

  // Convert dimensions to inches (but do NOT scale the path coordinates)
  const widthInches = rawWidth * finalScale;
  const heightInches = rawHeight * finalScale;

  // Debug logging for validation
  console.log('[DXF Parser]', {
    insUnits,
    detectedUnits,
    unitFactor,
    userScale: scaleInput,
    finalScale,
    rawWidth: rawWidth.toFixed(4),
    rawHeight: rawHeight.toFixed(4),
    widthInches: widthInches.toFixed(4),
    heightInches: heightInches.toFixed(4),
  });

  return {
    svgPath: combinedPath,
    widthInches: Math.max(widthInches, 0.1),
    heightInches: Math.max(heightInches, 0.1),
    detectedUnits,
    rawWidth,
    rawHeight,
  };
}
