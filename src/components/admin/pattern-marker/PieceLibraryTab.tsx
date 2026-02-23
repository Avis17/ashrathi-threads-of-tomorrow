import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Plus, FileType, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { parseDxfToSvg, type DxfParseResult } from '@/utils/dxf-to-svg';
import type { PieceDef } from '@/pages/admin/PatternMarker';

interface LibraryPiece {
  id: string;
  name: string;
  garment_type: string;
  size: string;
  set_type: string;
  grain_line: string;
  quantity_per_garment: number;
  width_inches: number;
  height_inches: number;
  svg_path_data: string;
  original_filename: string | null;
}

interface PieceLibraryTabProps {
  onAddToCanvas: (piece: Omit<PieceDef, 'id' | 'x' | 'y' | 'rotation'>) => void;
}

const PIECE_COLORS = [
  'hsl(210, 70%, 75%)', 'hsl(150, 60%, 70%)', 'hsl(40, 80%, 75%)',
  'hsl(0, 70%, 75%)', 'hsl(270, 60%, 75%)', 'hsl(180, 50%, 70%)',
  'hsl(330, 60%, 75%)', 'hsl(60, 70%, 75%)',
];

const PieceLibraryTab = ({ onAddToCanvas }: PieceLibraryTabProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [pieceName, setPieceName] = useState('');
  const [garmentType, setGarmentType] = useState('pant');
  const [size, setSize] = useState('M');
  const [setType, setSetType] = useState('individual');
  const [grainLine, setGrainLine] = useState('lengthwise');
  const [quantityPerGarment, setQuantityPerGarment] = useState(1);
  const [dxfScale, setDxfScale] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<DxfParseResult | null>(null);

  // Library state
  const [pieces, setPieces] = useState<LibraryPiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marker_piece_library')
      .select('id, name, garment_type, size, set_type, grain_line, quantity_per_garment, width_inches, height_inches, svg_path_data, original_filename')
      .order('created_at', { ascending: false });
    if (data) setPieces(data as LibraryPiece[]);
    if (error) console.error('Load library error:', error);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!pieceName) setPieceName(f.name.replace(/\.dxf$/i, ''));

    // Parse preview
    try {
      const text = await f.text();
      const result = parseDxfToSvg(text, dxfScale);
      setPreview(result);
    } catch (err: any) {
      toast({ title: 'DXF Parse Error', description: err.message, variant: 'destructive' });
      setPreview(null);
    }
  };

  // Re-parse when scale changes
  const handleScaleChange = async (newScale: number) => {
    setDxfScale(newScale);
    if (file) {
      try {
        const text = await file.text();
        const result = parseDxfToSvg(text, newScale);
        setPreview(result);
      } catch { /* ignore */ }
    }
  };

  const handleUpload = async () => {
    if (!file || !pieceName.trim() || !preview) {
      toast({ title: 'Fill all fields', description: 'Select a DXF file and enter piece name', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      // Upload DXF to pp-assets bucket
      const filePath = `marker-pieces/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('pp-assets').upload(filePath, file);
      const dxfUrl = uploadErr ? null : supabase.storage.from('pp-assets').getPublicUrl(filePath).data.publicUrl;

      // Insert into database
      const { error: dbErr } = await supabase.from('marker_piece_library').insert({
        name: pieceName.trim(),
        garment_type: garmentType,
        size,
        set_type: setType,
        grain_line: grainLine,
        quantity_per_garment: quantityPerGarment,
        width_inches: preview.widthInches,
        height_inches: preview.heightInches,
        svg_path_data: preview.svgPath,
        original_filename: file.name,
        dxf_file_url: dxfUrl,
        created_by: user?.id || null,
      } as any);

      if (dbErr) throw dbErr;

      toast({ title: 'Piece saved to library!' });
      // Reset form
      setFile(null);
      setPieceName('');
      setPreview(null);
      const fileInput = document.getElementById('dxf-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      loadLibrary();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const deletePiece = async (id: string) => {
    await supabase.from('marker_piece_library').delete().eq('id', id);
    loadLibrary();
    toast({ title: 'Piece removed from library' });
  };

  const addToCanvas = (piece: LibraryPiece) => {
    onAddToCanvas({
      name: `${piece.name} (${piece.size})`,
      widthInches: Number(piece.width_inches),
      heightInches: Number(piece.height_inches),
      color: PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)],
      svgPathData: piece.svg_path_data,
      libraryPieceId: piece.id,
    });
    toast({ title: `${piece.name} added to canvas` });
  };

  const renderSvgPreview = (svgPath: string, w: number, h: number, size: number = 100) => {
    const aspect = w / h;
    const viewW = aspect >= 1 ? size : size * aspect;
    const viewH = aspect >= 1 ? size / aspect : size;
    return (
      <svg
        width={viewW}
        height={viewH}
        viewBox={`0 0 ${w} ${h}`}
        className="border rounded bg-muted/30"
      >
        <path
          d={svgPath}
          fill="hsl(210, 70%, 85%)"
          stroke="hsl(210, 70%, 40%)"
          strokeWidth={Math.max(w, h) * 0.01}
          fillOpacity={0.6}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload DXF Piece
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">DXF File</Label>
            <Input
              id="dxf-file-input"
              type="file"
              accept=".dxf"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Piece Name</Label>
              <Input
                placeholder="e.g. Front Panel"
                value={pieceName}
                onChange={(e) => setPieceName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Input
                placeholder="e.g. M, L, XL"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Garment Type</Label>
              <Select value={garmentType} onValueChange={setGarmentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pant">Pant</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                  <SelectItem value="dress">Dress</SelectItem>
                  <SelectItem value="jacket">Jacket</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Set Type</Label>
              <Select value={setType} onValueChange={setSetType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set Item</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Grain Line</Label>
              <Select value={grainLine} onValueChange={setGrainLine}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lengthwise">Lengthwise</SelectItem>
                  <SelectItem value="crosswise">Crosswise</SelectItem>
                  <SelectItem value="bias">Bias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Qty / Garment</Label>
              <Input
                type="number"
                min={1}
                value={quantityPerGarment}
                onChange={(e) => setQuantityPerGarment(+e.target.value || 1)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">DXF Scale (in/unit)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.01}
                value={dxfScale}
                onChange={(e) => handleScaleChange(+e.target.value || 1)}
              />
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Parsed: {preview.widthInches.toFixed(1)}" × {preview.heightInches.toFixed(1)}"
                </span>
              </div>
              <div className="flex justify-center">
                {renderSvgPreview(preview.svgPath, preview.widthInches, preview.heightInches, 150)}
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading || !preview} className="w-full gap-2">
            <Upload className="h-4 w-4" />
            {uploading ? 'Saving...' : 'Save to Library'}
          </Button>
        </CardContent>
      </Card>

      {/* Library Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileType className="h-4 w-4" /> Piece Library
            <Badge variant="secondary" className="ml-auto">{pieces.length} pieces</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading library...</p>
          ) : pieces.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pieces uploaded yet. Upload a DXF file to get started.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {pieces.map((piece) => (
                <div key={piece.id} className="flex items-center gap-3 p-2 border rounded-md">
                  <div className="flex-shrink-0">
                    {renderSvgPreview(piece.svg_path_data, Number(piece.width_inches), Number(piece.height_inches), 50)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{piece.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {piece.garment_type} · {piece.size} · {piece.set_type}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {Number(piece.width_inches).toFixed(1)}" × {Number(piece.height_inches).toFixed(1)}" · ×{piece.quantity_per_garment}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="outline" onClick={() => addToCanvas(piece)} className="gap-1">
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deletePiece(piece.id)}>
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
  );
};

export default PieceLibraryTab;
