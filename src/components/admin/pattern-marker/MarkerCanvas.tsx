import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Path } from 'react-konva';
import type { PieceDef } from '@/pages/admin/PatternMarker';

interface MarkerCanvasProps {
  pieces: PieceDef[];
  fabricWidthPx: number;
  fabricBufferPx: number;
  scale: number;
  onPieceMove: (id: string, x: number, y: number) => void;
  onPieceRotate: (id: string) => void;
  onPieceDelete: (id: string) => void;
}

const CANVAS_HEIGHT = 800;

const MarkerCanvas = ({
  pieces,
  fabricWidthPx,
  fabricBufferPx,
  scale,
  onPieceMove,
  onPieceRotate,
  onPieceDelete,
}: MarkerCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  const stageWidth = Math.min(containerWidth, totalCanvasWidth + 40);
  const stageScale = stageWidth / (totalCanvasWidth + 40);

  // Check collisions
  const getCollisions = () => {
    const collisions = new Set<string>();
    for (let i = 0; i < pieces.length; i++) {
      const a = pieces[i];
      const aRotated = a.rotation === 90 || a.rotation === 270;
      const aw = (aRotated ? a.heightInches : a.widthInches) * scale;
      const ah = (aRotated ? a.widthInches : a.heightInches) * scale;

      // Boundary check
      if (a.x < fabricBufferPx || a.x + aw > fabricBufferPx + fabricWidthPx || a.y < 0) {
        collisions.add(a.id);
      }

      for (let j = i + 1; j < pieces.length; j++) {
        const b = pieces[j];
        const bRotated = b.rotation === 90 || b.rotation === 270;
        const bw = (bRotated ? b.heightInches : b.widthInches) * scale;
        const bh = (bRotated ? b.widthInches : b.heightInches) * scale;

        if (a.x < b.x + bw && a.x + aw > b.x && a.y < b.y + bh && a.y + ah > b.y) {
          collisions.add(a.id);
          collisions.add(b.id);
        }
      }
    }
    return collisions;
  };

  const collisions = getCollisions();

  // Grid lines
  const gridLines: { points: number[]; dash?: number[] }[] = [];
  for (let x = fabricBufferPx; x <= fabricBufferPx + fabricWidthPx; x += scale * 5) {
    gridLines.push({ points: [x, 0, x, CANVAS_HEIGHT], dash: [2, 4] });
  }
  for (let y = 0; y <= CANVAS_HEIGHT; y += scale * 5) {
    gridLines.push({ points: [fabricBufferPx, y, fabricBufferPx + fabricWidthPx, y], dash: [2, 4] });
  }

  // Ruler ticks
  const rulerTicks: { x: number; label: string }[] = [];
  for (let inch = 0; inch <= fabricWidthPx / scale; inch += 5) {
    rulerTicks.push({ x: fabricBufferPx + inch * scale, label: `${inch}"` });
  }

  return (
    <div ref={containerRef} className="w-full border rounded-md bg-muted/30 overflow-auto relative">
      {/* Controls for selected piece */}
      {selectedId && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/90 p-1 rounded border shadow-sm">
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
        width={stageWidth}
        height={CANVAS_HEIGHT}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) setSelectedId(null);
        }}
      >
        <Layer>
          {/* Full background */}
          <Rect x={0} y={0} width={totalCanvasWidth + 40} height={CANVAS_HEIGHT} fill="hsl(0,0%,96%)" />

          {/* Buffer zones */}
          <Rect x={0} y={0} width={fabricBufferPx} height={CANVAS_HEIGHT} fill="hsl(0,60%,92%)" opacity={0.5} />
          <Rect x={fabricBufferPx + fabricWidthPx} y={0} width={fabricBufferPx + 40} height={CANVAS_HEIGHT} fill="hsl(0,60%,92%)" opacity={0.5} />

          {/* Usable fabric area */}
          <Rect x={fabricBufferPx} y={0} width={fabricWidthPx} height={CANVAS_HEIGHT} fill="hsl(60,30%,95%)" />

          {/* Grid */}
          {gridLines.map((line, i) => (
            <Line key={i} points={line.points} stroke="hsl(0,0%,85%)" strokeWidth={0.5} dash={line.dash} />
          ))}

          {/* Boundary lines */}
          <Line points={[fabricBufferPx, 0, fabricBufferPx, CANVAS_HEIGHT]} stroke="hsl(0,70%,50%)" strokeWidth={2} dash={[6, 3]} />
          <Line points={[fabricBufferPx + fabricWidthPx, 0, fabricBufferPx + fabricWidthPx, CANVAS_HEIGHT]} stroke="hsl(0,70%,50%)" strokeWidth={2} dash={[6, 3]} />

          {/* Ruler */}
          {rulerTicks.map((tick, i) => (
            <Group key={i}>
              <Line points={[tick.x, 0, tick.x, 8]} stroke="hsl(0,0%,40%)" strokeWidth={1} />
              <Text x={tick.x - 10} y={10} text={tick.label} fontSize={9} fill="hsl(0,0%,40%)" />
            </Group>
          ))}

          {/* Pieces */}
          {pieces.map((piece) => {
            const isRotated = piece.rotation === 90 || piece.rotation === 270;
            const displayW = (isRotated ? piece.heightInches : piece.widthInches) * scale;
            const displayH = (isRotated ? piece.widthInches : piece.heightInches) * scale;
            const isColliding = collisions.has(piece.id);
            const isSelected = selectedId === piece.id;

            return (
              <Group
                key={piece.id}
                x={piece.x}
                y={piece.y}
                draggable
                onDragEnd={(e) => {
                  onPieceMove(piece.id, e.target.x(), e.target.y());
                }}
                onClick={() => setSelectedId(piece.id)}
                onTap={() => setSelectedId(piece.id)}
                onDblClick={() => onPieceRotate(piece.id)}
                onDblTap={() => onPieceRotate(piece.id)}
              >
                {piece.svgPathData ? (
                  <Path
                    data={piece.svgPathData}
                    fill={isColliding ? 'hsl(0,70%,80%)' : piece.color}
                    stroke={isSelected ? 'hsl(210,80%,50%)' : isColliding ? 'hsl(0,70%,40%)' : 'hsl(0,0%,50%)'}
                    strokeWidth={(isSelected ? 3 : 1) / (displayW / piece.widthInches)}
                    opacity={0.85}
                    scaleX={displayW / piece.widthInches}
                    scaleY={displayH / piece.heightInches}
                  />
                ) : (
                  <>
                    <Rect
                      width={displayW}
                      height={displayH}
                      fill={isColliding ? 'hsl(0,70%,80%)' : piece.color}
                      stroke={isSelected ? 'hsl(210,80%,50%)' : isColliding ? 'hsl(0,70%,40%)' : 'hsl(0,0%,50%)'}
                      strokeWidth={isSelected ? 3 : 1}
                      cornerRadius={2}
                      opacity={0.85}
                      shadowColor="black"
                      shadowBlur={isSelected ? 6 : 2}
                      shadowOpacity={0.15}
                    />
                    {/* Grain line */}
                    <Line
                      points={[displayW / 2, 4, displayW / 2, displayH - 4]}
                      stroke="hsl(0,0%,30%)"
                      strokeWidth={1}
                      dash={[3, 3]}
                      opacity={0.4}
                    />
                  </>
                )}
                {/* Label */}
                <Text
                  x={4}
                  y={4}
                  text={piece.name}
                  fontSize={Math.min(11, displayW / 6)}
                  fill="hsl(0,0%,15%)"
                  fontStyle="bold"
                  width={displayW - 8}
                  ellipsis
                  wrap="none"
                />
                {/* Dimensions */}
                <Text
                  x={4}
                  y={displayH - 16}
                  text={`${piece.widthInches.toFixed(1)}" × ${piece.heightInches.toFixed(1)}"`}
                  fontSize={8}
                  fill="hsl(0,0%,35%)"
                />
                {piece.rotation !== 0 && (
                  <Text
                    x={displayW - 22}
                    y={4}
                    text={`${piece.rotation}°`}
                    fontSize={8}
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
