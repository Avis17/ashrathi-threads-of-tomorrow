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
  const skipTypes = new Set(['DIMENSION', 'MTEXT', 'TEXT', 'POINT', 'INSERT', 'HATCH', 'VIEWPORT', 'ATTRIB', 'ATTDEF']);
  
  const pathSegments: string[] = [];
  for (const entity of dxf.entities as DxfEntity[]) {
    const layer = ((entity as any).layer || '').toLowerCase();
    if (skipLayers.has(layer)) continue;
    if (skipTypes.has(entity.type)) continue;
    const seg = entityToSvgPath(entity);
    if (seg) pathSegments.push(seg);
  }

  if (pathSegments.length === 0) {
    throw new Error('Could not extract any drawable entities from DXF file.');
  }

  let combinedPath = pathSegments.join(' ');

  // Get bounding box in raw DXF units
  const bounds = getPathBounds(combinedPath);
  
  // Normalize to origin (0,0)
  combinedPath = translatePath(combinedPath, -bounds.minX, -bounds.minY);

  const rawWidth = bounds.maxX - bounds.minX;
  const rawHeight = bounds.maxY - bounds.minY;

  // Convert to inches using unit detection + user scale
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
