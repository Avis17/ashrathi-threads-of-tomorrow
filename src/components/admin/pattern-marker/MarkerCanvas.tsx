import { useRef, useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Path } from 'react-konva';
import type { PieceDef } from '@/pages/admin/PatternMarker';

interface MarkerCanvasProps {
  pieces: PieceDef[];
  fabricWidthInches: number;
  fabricBufferInches: number;
  scale: number; // pixels per inch
  onPieceMove: (id: string, xInches: number, yInches: number) => void;
  onPieceRotate: (id: string) => void;
  onPieceDelete: (id: string) => void;
}

const MIN_CANVAS_HEIGHT = 800;

const MarkerCanvas = ({
  pieces,
  fabricWidthInches,
  fabricBufferInches,
  scale,
  onPieceMove,
  onPieceRotate,
  onPieceDelete,
}: MarkerCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived pixel values for canvas chrome only
  const fabricWidthPx = fabricWidthInches * scale;
  const fabricBufferPx = fabricBufferInches * scale;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const totalCanvasWidth = fabricWidthPx + fabricBufferPx * 2;

  // Dynamic canvas height based on piece positions (all math in inches, convert to px at end)
  const canvasHeight = useMemo(() => {
    if (pieces.length === 0) return MIN_CANVAS_HEIGHT;
    const maxBottomInches = Math.max(
      ...pieces.map((p) => {
        const isRotated = p.rotation === 90 || p.rotation === 270;
        const h = isRotated ? p.widthInches : p.heightInches;
        return p.yInches + h;
      })
    );
    return Math.max(MIN_CANVAS_HEIGHT, maxBottomInches * scale + 200);
  }, [pieces, scale]);

  // Collision detection — all in inches
  const collisions = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < pieces.length; i++) {
      const a = pieces[i];
      const aRotated = a.rotation === 90 || a.rotation === 270;
      const aw = aRotated ? a.heightInches : a.widthInches;
      const ah = aRotated ? a.widthInches : a.heightInches;

      // Boundary check in inches
      if (
        a.xInches < fabricBufferInches ||
        a.xInches + aw > fabricBufferInches + fabricWidthInches ||
        a.yInches < 0
      ) {
        set.add(a.id);
      }

      for (let j = i + 1; j < pieces.length; j++) {
        const b = pieces[j];
        const bRotated = b.rotation === 90 || b.rotation === 270;
        const bw = bRotated ? b.heightInches : b.widthInches;
        const bh = bRotated ? b.widthInches : b.heightInches;

        if (
          a.xInches < b.xInches + bw &&
          a.xInches + aw > b.xInches &&
          a.yInches < b.yInches + bh &&
          a.yInches + ah > b.yInches
        ) {
          set.add(a.id);
          set.add(b.id);
        }
      }
    }
    return set;
  }, [pieces, fabricBufferInches, fabricWidthInches]);

  // Grid lines — step every 5 inches
  const gridLines = useMemo(() => {
    const lines: { points: number[]; dash?: number[] }[] = [];
    for (let inch = 0; inch <= fabricWidthInches; inch += 5) {
      const x = fabricBufferPx + inch * scale;
      lines.push({ points: [x, 0, x, canvasHeight], dash: [2, 4] });
    }
    const canvasHeightInches = canvasHeight / scale;
    for (let inch = 0; inch <= canvasHeightInches; inch += 5) {
      const y = inch * scale;
      lines.push({ points: [fabricBufferPx, y, fabricBufferPx + fabricWidthPx, y], dash: [2, 4] });
    }
    return lines;
  }, [fabricBufferPx, fabricWidthPx, fabricWidthInches, scale, canvasHeight]);

  // Ruler ticks — every 5 inches
  const rulerTicks = useMemo(() => {
    const ticks: { x: number; label: string }[] = [];
    for (let inch = 0; inch <= fabricWidthInches; inch += 5) {
      ticks.push({ x: fabricBufferPx + inch * scale, label: `${inch}"` });
    }
    return ticks;
  }, [fabricBufferPx, fabricWidthInches, scale]);

  return (
    <div
      ref={containerRef}
      className="w-full border rounded-md bg-muted/30 overflow-auto relative"
      style={{ maxHeight: '75vh' }}
    >
      {/* Controls for selected piece */}
      {selectedId && (
        <div className="sticky top-2 right-2 z-10 flex gap-1 bg-background/90 p-1 rounded border shadow-sm ml-auto w-fit mr-2 mt-2">
          <button
            onClick={() => onPieceRotate(selectedId)}
            className="p-1.5 rounded hover:bg-muted text-xs flex items-center gap-1"
            title="Rotate 90°"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8" />
            </svg>
            Rotate
          </button>
          <button
            onClick={() => { onPieceDelete(selectedId); setSelectedId(null); }}
            className="p-1.5 rounded hover:bg-destructive/10 text-destructive text-xs flex items-center gap-1"
            title="Remove piece"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Remove
          </button>
        </div>
      )}

      <Stage
        width={totalCanvasWidth + 40}
        height={canvasHeight}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) setSelectedId(null);
        }}
      >
        <Layer>
          {/* Full background */}
          <Rect x={0} y={0} width={totalCanvasWidth + 40} height={canvasHeight} fill="hsl(0,0%,96%)" />

          {/* Buffer zones */}
          <Rect x={0} y={0} width={fabricBufferPx} height={canvasHeight} fill="hsl(0,60%,92%)" opacity={0.5} />
          <Rect x={fabricBufferPx + fabricWidthPx} y={0} width={fabricBufferPx + 40} height={canvasHeight} fill="hsl(0,60%,92%)" opacity={0.5} />

          {/* Usable fabric area */}
          <Rect x={fabricBufferPx} y={0} width={fabricWidthPx} height={canvasHeight} fill="hsl(60,30%,95%)" />

          {/* Grid */}
          {gridLines.map((line, i) => (
            <Line key={i} points={line.points} stroke="hsl(0,0%,85%)" strokeWidth={0.5} dash={line.dash} />
          ))}

          {/* Boundary lines */}
          <Line points={[fabricBufferPx, 0, fabricBufferPx, canvasHeight]} stroke="hsl(0,70%,50%)" strokeWidth={2} dash={[6, 3]} />
          <Line points={[fabricBufferPx + fabricWidthPx, 0, fabricBufferPx + fabricWidthPx, canvasHeight]} stroke="hsl(0,70%,50%)" strokeWidth={2} dash={[6, 3]} />

          {/* Ruler */}
          {rulerTicks.map((tick, i) => (
            <Group key={i}>
              <Line points={[tick.x, 0, tick.x, 8]} stroke="hsl(0,0%,40%)" strokeWidth={1} />
              <Text x={tick.x - 10} y={10} text={tick.label} fontSize={9} fill="hsl(0,0%,40%)" />
            </Group>
          ))}

          {/* Pieces */}
          {pieces.map((piece) => {
            const isColliding = collisions.has(piece.id);
            const isSelected = selectedId === piece.id;

            // For SVG pieces: path is in raw DXF units, need to scale raw→inches→pixels
            // For rect pieces: dimensions are in inches, scale inches→pixels
            const hasSvg = !!piece.svgPathData;
            const rawW = piece.rawWidth || piece.widthInches;
            const rawH = piece.rawHeight || piece.heightInches;
            // rawToInch converts 1 raw DXF unit to inches
            const rawToInch = piece.widthInches / rawW;
            // For SVG pieces, group scale converts raw DXF units → pixels
            // For rect pieces, rawToInch === 1, so groupScale === scale
            const groupScale = rawToInch * scale;

            // Offset for center-pivot rotation (in group-local units)
            // For SVG: offset in raw DXF units; for rect: offset in inches
            const offsetX = rawW / 2;
            const offsetY = rawH / 2;

            return (
              <Group
                key={piece.id}
                x={piece.xInches * scale + offsetX * groupScale}
                y={piece.yInches * scale + offsetY * groupScale}
                offsetX={offsetX}
                offsetY={offsetY}
                rotation={piece.rotation}
                scaleX={groupScale}
                scaleY={groupScale}
                draggable
                onDragEnd={(e) => {
                  const newXInches = (e.target.x() - offsetX * groupScale) / scale;
                  const newYInches = (e.target.y() - offsetY * groupScale) / scale;
                  onPieceMove(piece.id, newXInches, newYInches);
                }}
                onClick={() => setSelectedId(piece.id)}
                onTap={() => setSelectedId(piece.id)}
                onDblClick={() => onPieceRotate(piece.id)}
                onDblTap={() => onPieceRotate(piece.id)}
              >
                {hasSvg ? (
                  <Path
                    data={piece.svgPathData!}
                    fill={isColliding ? 'hsl(0,70%,80%)' : piece.color}
                    stroke={isSelected ? 'hsl(210,80%,50%)' : isColliding ? 'hsl(0,70%,40%)' : 'hsl(0,0%,50%)'}
                    strokeWidth={1 / groupScale}
                    opacity={0.85}
                  />
                ) : (
                  <>
                    <Rect
                      width={piece.widthInches}
                      height={piece.heightInches}
                      fill={isColliding ? 'hsl(0,70%,80%)' : piece.color}
                      stroke={isSelected ? 'hsl(210,80%,50%)' : isColliding ? 'hsl(0,70%,40%)' : 'hsl(0,0%,50%)'}
                      strokeWidth={(isSelected ? 3 : 1) / groupScale}
                      cornerRadius={2 / groupScale}
                      opacity={0.85}
                      shadowColor="black"
                      shadowBlur={isSelected ? 6 / groupScale : 2 / groupScale}
                      shadowOpacity={0.15}
                    />
                    {/* Grain line */}
                    <Line
                      points={[piece.widthInches / 2, 0.2, piece.widthInches / 2, piece.heightInches - 0.2]}
                      stroke="hsl(0,0%,30%)"
                      strokeWidth={1 / groupScale}
                      dash={[3 / groupScale, 3 / groupScale]}
                      opacity={0.4}
                    />
                  </>
                )}
                {/* Label */}
                <Text
                  x={0.2 / rawToInch}
                  y={0.2 / rawToInch}
                  text={piece.name}
                  fontSize={Math.min(0.55, piece.widthInches / 6) / rawToInch}
                  fill="hsl(0,0%,15%)"
                  fontStyle="bold"
                  width={(piece.widthInches - 0.4) / rawToInch}
                  ellipsis
                  wrap="none"
                />
                {/* Dimensions */}
                <Text
                  x={0.2 / rawToInch}
                  y={(piece.heightInches - 0.8) / rawToInch}
                  text={`${piece.widthInches.toFixed(1)}" × ${piece.heightInches.toFixed(1)}"`}
                  fontSize={0.4 / rawToInch}
                  fill="hsl(0,0%,35%)"
                />
                {piece.rotation !== 0 && (
                  <Text
                    x={(piece.widthInches - 1.1) / rawToInch}
                    y={0.2 / rawToInch}
                    text={`${piece.rotation}°`}
                    fontSize={0.4 / rawToInch}
                    fill="hsl(210,80%,50%)"
                    fontStyle="bold"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default MarkerCanvas;
