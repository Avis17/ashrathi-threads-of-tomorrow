import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, RotateCw, Trash2, Plus, Download, Ruler, BarChart3, FileType } from 'lucide-react';
import MarkerCanvas from '@/components/admin/pattern-marker/MarkerCanvas';
import PieceLibraryTab from '@/components/admin/pattern-marker/PieceLibraryTab';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SCALE = 20; // 1 inch = 20 pixels

export interface PieceDef {
  id: string;
  name: string;
  widthInches: number;
  heightInches: number;
  xInches: number;
  yInches: number;
  rotation: number;
  color: string;
  svgPathData?: string;
  libraryPieceId?: string;
  /** Raw DXF bounding box width (in original DXF units, before inch conversion). Used to compute SVG→inch scale. */
  rawWidth?: number;
  /** Raw DXF bounding box height (in original DXF units, before inch conversion). Used to compute SVG→inch scale. */
  rawHeight?: number;
}

interface MeasurementRow {
  piece: string;
  measurements: Record<string, number>;
}

const GARMENT_TEMPLATES: Record<string, { pieces: string[]; fields: string[] }> = {
  pant: {
    pieces: ['Front Panel', 'Back Panel', 'Waistband', 'Pocket', 'Fly Piece'],
    fields: ['Length', 'Waist', 'Hip', 'Front Rise', 'Leg Open'],
  },
  top: {
    pieces: ['Front Body', 'Back Body', 'Sleeve (L)', 'Sleeve (R)', 'Collar'],
    fields: ['Chest', 'Shoulder', 'Sleeve Length', 'Armhole', 'Body Length'],
  },
  shorts: {
    pieces: ['Front Panel', 'Back Panel', 'Waistband', 'Pocket'],
    fields: ['Length', 'Waist', 'Hip', 'Leg Open'],
  },
};

const PIECE_COLORS = [
  'hsl(210, 70%, 75%)', 'hsl(150, 60%, 70%)', 'hsl(40, 80%, 75%)',
  'hsl(0, 70%, 75%)', 'hsl(270, 60%, 75%)', 'hsl(180, 50%, 70%)',
  'hsl(330, 60%, 75%)', 'hsl(60, 70%, 75%)',
];

const PatternMarker = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fabric controls
  const [fabricWidth, setFabricWidth] = useState(60);
  const [fabricBuffer, setFabricBuffer] = useState(1);
  const usableWidth = fabricWidth - fabricBuffer * 2;

  // Garment type
  const [garmentType, setGarmentType] = useState('pant');
  const template = GARMENT_TEMPLATES[garmentType];

  // Measurement rows
  const [measurements, setMeasurements] = useState<MeasurementRow[]>(() =>
    buildDefaultMeasurements('pant')
  );

  // Pieces on canvas
  const [pieces, setPieces] = useState<PieceDef[]>([]);

  // Style management
  const [styleName, setStyleName] = useState('');
  const [savedStyles, setSavedStyles] = useState<{ id: string; name: string }[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);

  function buildDefaultMeasurements(type: string): MeasurementRow[] {
    const t = GARMENT_TEMPLATES[type];
    return t.pieces.map((p) => ({
      piece: p,
      measurements: Object.fromEntries(t.fields.map((f) => [f, 10])),
    }));
  }

  // When garment type changes, reset measurements
  useEffect(() => {
    setMeasurements(buildDefaultMeasurements(garmentType));
    setPieces([]);
  }, [garmentType]);

  // Load saved styles on mount
  useEffect(() => {
    loadSavedStyles();
  }, []);

  const loadSavedStyles = async () => {
    setLoadingStyles(true);
    const { data } = await supabase
      .from('calculator_entries')
      .select('id, inputs')
      .eq('calculator_type', 'pattern_marker')
      .order('created_at', { ascending: false });
    if (data) {
      setSavedStyles(
        data.map((d) => ({
          id: d.id,
          name: (d.inputs as any)?.styleName || 'Untitled',
        }))
      );
    }
    setLoadingStyles(false);
  };

  const updateMeasurement = (pieceIdx: number, field: string, value: number) => {
    setMeasurements((prev) => {
      const next = [...prev];
      next[pieceIdx] = {
        ...next[pieceIdx],
        measurements: { ...next[pieceIdx].measurements, [field]: value },
      };
      return next;
    });
  };

  // Generate pieces from measurements
  const generatePieces = useCallback(() => {
    const newPieces: PieceDef[] = measurements.map((row, i) => {
      const vals = Object.values(row.measurements);
      const w = Math.max(...vals.slice(0, 2), 8);
      const h = vals[0] || 10;
      return {
        id: `piece-${i}`,
        name: row.piece,
        widthInches: w,
        heightInches: h,
        xInches: fabricBuffer + (i % 3) * (w + 1),
        yInches: 1 + Math.floor(i / 3) * (h + 1),
        rotation: 0,
        color: PIECE_COLORS[i % PIECE_COLORS.length],
      };
    });
    setPieces(newPieces);
    toast({ title: 'Pieces Generated', description: `${newPieces.length} pieces placed on canvas` });
  }, [measurements, fabricBuffer, toast]);

  const handlePieceMove = (id: string, xInches: number, yInches: number) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, xInches, yInches } : p)));
  };

  const handlePieceRotate = (id: string) => {
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newRotation = (p.rotation + 90) % 360;
        return {
          ...p,
          rotation: newRotation,
        };
      })
    );
  };

  const handlePieceDelete = (id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddFromLibrary = (piece: Omit<PieceDef, 'id' | 'xInches' | 'yInches' | 'rotation'>) => {
    // Center the piece on the visible fabric area
    const centerX = fabricBuffer + (fabricWidth / 2) - (piece.widthInches / 2);
    const centerY = 10; // Place near top-center of canvas (10 inches from top)
    const newPiece: PieceDef = {
      ...piece,
      id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      xInches: centerX,
      yInches: centerY,
      rotation: 0,
    };
    setPieces((prev) => [...prev, newPiece]);
  };

  // Analytics calculations
  const totalPieceArea = pieces.reduce((sum, p) => sum + p.widthInches * p.heightInches, 0);
  const maxY = pieces.length > 0
    ? Math.max(
        ...pieces.map((p) => {
          const isRotated = p.rotation === 90 || p.rotation === 270;
          const h = isRotated ? p.widthInches : p.heightInches;
          return p.yInches + h;
        })
      )
    : 0;
  const markerLengthInches = maxY;
  const markerLengthMeters = markerLengthInches * 0.0254;
  const fabricArea = usableWidth * markerLengthInches;
  const efficiency = fabricArea > 0 ? (totalPieceArea / fabricArea) * 100 : 0;
  const numSets = 1;
  const avgConsumption = numSets > 0 ? markerLengthMeters / numSets : 0;

  // Save style
  const saveStyle = async () => {
    if (!styleName.trim()) {
      toast({ title: 'Enter a style name', variant: 'destructive' });
      return;
    }
    const payload = {
      calculator_type: 'pattern_marker',
      inputs: {
        styleName,
        garmentType,
        fabricWidth,
        fabricBuffer,
        measurements,
        pieces: pieces.map(({ id, name, widthInches, heightInches, xInches, yInches, rotation, color, svgPathData, libraryPieceId, rawWidth, rawHeight }) => ({
          id, name, widthInches, heightInches, xInches, yInches, rotation, color, svgPathData, libraryPieceId, rawWidth, rawHeight,
        })),
      } as any,
      results: {
        markerLengthMeters: +markerLengthMeters.toFixed(3),
        efficiency: +efficiency.toFixed(1),
        avgConsumption: +avgConsumption.toFixed(3),
        totalPieceArea,
      } as any,
      created_by: user?.id || null,
    };
    const { error } = await supabase.from('calculator_entries').insert(payload);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Style saved!' });
      loadSavedStyles();
    }
  };

  // Load style
  const loadStyle = async (id: string) => {
    const { data } = await supabase
      .from('calculator_entries')
      .select('inputs')
      .eq('id', id)
      .single();
    if (data) {
      const inputs = data.inputs as any;
      setStyleName(inputs.styleName || '');
      setGarmentType(inputs.garmentType || 'pant');
      setFabricWidth(inputs.fabricWidth || 60);
      setFabricBuffer(inputs.fabricBuffer || 1);
      setMeasurements(inputs.measurements || []);
      setPieces(inputs.pieces || []);
      toast({ title: 'Style loaded!' });
    }
  };

  // Delete style
  const deleteStyle = async (id: string) => {
    await supabase.from('calculator_entries').delete().eq('id', id);
    loadSavedStyles();
    toast({ title: 'Style deleted' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Parametric Marker</h1>
          <p className="text-muted-foreground text-sm">Digital cutting master — define, optimize & deploy marker layouts</p>
        </div>
      </div>

      {/* Fabric Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Garment Type</Label>
              <Select value={garmentType} onValueChange={setGarmentType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pant">Pant</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fabric Width (inches)</Label>
              <Input
                type="number"
                className="w-[100px]"
                value={fabricWidth}
                onChange={(e) => setFabricWidth(+e.target.value || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Buffer/Margin (inches)</Label>
              <Input
                type="number"
                className="w-[100px]"
                value={fabricBuffer}
                onChange={(e) => setFabricBuffer(+e.target.value || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Usable Width</Label>
              <Badge variant="secondary" className="h-10 px-4 flex items-center text-sm font-mono">
                {usableWidth}" ({(usableWidth * 2.54).toFixed(1)} cm)
              </Badge>
            </div>
            <Button onClick={generatePieces} className="gap-2">
              <Ruler className="h-4 w-4" /> Generate Pieces
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="canvas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="canvas">Canvas & Layout</TabsTrigger>
          <TabsTrigger value="measurements">Measurement Table</TabsTrigger>
          <TabsTrigger value="analytics">Analytics HUD</TabsTrigger>
          <TabsTrigger value="library" className="gap-1"><FileType className="h-3 w-3" /> Piece Library</TabsTrigger>
          <TabsTrigger value="styles">Style Management</TabsTrigger>
        </TabsList>

        {/* Canvas Tab */}
        <TabsContent value="canvas">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Marker Canvas
                <Badge variant="outline" className="font-mono text-xs">1" = {SCALE}px</Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  Fabric: {usableWidth}" wide
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <MarkerCanvas
                pieces={pieces}
                fabricWidthInches={usableWidth}
                fabricBufferInches={fabricBuffer}
                scale={SCALE}
                onPieceMove={handlePieceMove}
                onPieceRotate={handlePieceRotate}
                onPieceDelete={handlePieceDelete}
              />
            </CardContent>
          </Card>

          {/* Quick Analytics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Marker Length</p>
              <p className="text-lg font-bold font-mono">{markerLengthMeters.toFixed(3)} m</p>
              <p className="text-xs text-muted-foreground">{markerLengthInches.toFixed(1)}"</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className={`text-lg font-bold font-mono ${efficiency >= 80 ? 'text-green-600' : efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {efficiency.toFixed(1)}%
              </p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Piece Area</p>
              <p className="text-lg font-bold font-mono">{totalPieceArea.toFixed(0)} sq.in</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg Consumption</p>
              <p className="text-lg font-bold font-mono">{avgConsumption.toFixed(3)} m/set</p>
            </Card>
          </div>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Measurement Matrix — {garmentType.charAt(0).toUpperCase() + garmentType.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Piece</TableHead>
                      {template.fields.map((f) => (
                        <TableHead key={f} className="text-center">{f} (in)</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.piece}</TableCell>
                        {template.fields.map((field) => (
                          <TableCell key={field} className="text-center">
                            <Input
                              type="number"
                              className="w-[80px] mx-auto text-center"
                              value={row.measurements[field] || ''}
                              onChange={(e) => updateMeasurement(i, field, +e.target.value || 0)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Button onClick={generatePieces} className="gap-2">
                  <Ruler className="h-4 w-4" /> Apply & Generate Pieces
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Production Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Marker Length</span>
                    <span className="font-mono font-medium">{markerLengthMeters.toFixed(3)} m ({markerLengthInches.toFixed(1)}")</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fabric Usable Width</span>
                    <span className="font-mono font-medium">{usableWidth}" ({(usableWidth * 2.54).toFixed(1)} cm)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fabric Area Used</span>
                    <span className="font-mono font-medium">{fabricArea.toFixed(0)} sq.in</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Piece Area</span>
                    <span className="font-mono font-medium">{totalPieceArea.toFixed(0)} sq.in</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wasted Area</span>
                    <span className="font-mono font-medium text-destructive">{(fabricArea - totalPieceArea).toFixed(0)} sq.in</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Efficiency Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold font-mono" style={{
                    color: efficiency >= 80 ? 'hsl(var(--chart-2))' : efficiency >= 60 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))'
                  }}>
                    {efficiency.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">Marker Efficiency</p>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  <p>Formula: (Total Piece Area / Fabric Area) × 100</p>
                  <p className="font-mono mt-1">({totalPieceArea.toFixed(0)} / {fabricArea.toFixed(0)}) × 100</p>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Avg Consumption per Set</span>
                  <span className="font-mono font-medium">{avgConsumption.toFixed(3)} meters</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sets on Canvas</span>
                  <span className="font-mono font-medium">{numSets}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Pieces Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {pieces.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No pieces generated yet. Go to Measurement Table and generate pieces.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Piece</TableHead>
                        <TableHead className="text-center">Width (in)</TableHead>
                        <TableHead className="text-center">Height (in)</TableHead>
                        <TableHead className="text-center">Area (sq.in)</TableHead>
                        <TableHead className="text-center">Rotation</TableHead>
                        <TableHead className="text-center">Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pieces.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
                              {p.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono">{p.widthInches.toFixed(1)}</TableCell>
                          <TableCell className="text-center font-mono">{p.heightInches.toFixed(1)}</TableCell>
                          <TableCell className="text-center font-mono">{(p.widthInches * p.heightInches).toFixed(1)}</TableCell>
                          <TableCell className="text-center font-mono">{p.rotation}°</TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            ({p.xInches.toFixed(1)}", {p.yInches.toFixed(1)}")
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Piece Library Tab */}
        <TabsContent value="library">
          <PieceLibraryTab onAddToCanvas={handleAddFromLibrary} />
        </TabsContent>

        {/* Style Management Tab */}
        <TabsContent value="styles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Current Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Style Name / Code</Label>
                  <Input
                    placeholder="e.g. LPS-116"
                    value={styleName}
                    onChange={(e) => setStyleName(e.target.value)}
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Garment: {garmentType} | Fabric: {fabricWidth}" | Pieces: {pieces.length}</p>
                  <p>Efficiency: {efficiency.toFixed(1)}% | Consumption: {avgConsumption.toFixed(3)} m</p>
                </div>
                <Button onClick={saveStyle} className="w-full gap-2">
                  <Save className="h-4 w-4" /> Save Style Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Saved Styles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStyles ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : savedStyles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved styles yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {savedStyles.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="text-sm font-medium">{s.name}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => loadStyle(s.id)}>
                            <Upload className="h-3 w-3 mr-1" /> Load
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteStyle(s.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternMarker;
