import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Plus, FileType, Eye, FolderOpen, ChevronRight, FolderPlus, Settings2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  folder_path: string;
}

interface PieceLibraryTabProps {
  onAddToCanvas: (piece: Omit<PieceDef, 'id' | 'xInches' | 'yInches' | 'rotation'>) => void;
}

const PIECE_COLORS = [
  'hsl(210, 70%, 75%)', 'hsl(150, 60%, 70%)', 'hsl(40, 80%, 75%)',
  'hsl(0, 70%, 75%)', 'hsl(270, 60%, 75%)', 'hsl(180, 50%, 70%)',
  'hsl(330, 60%, 75%)', 'hsl(60, 70%, 75%)',
];

// Build a tree structure from folder paths
interface FolderNode {
  name: string;
  path: string;
  children: Record<string, FolderNode>;
  pieceCount: number;
}

function buildFolderTree(pieces: LibraryPiece[]): FolderNode {
  const root: FolderNode = { name: 'All Pieces', path: '', children: {}, pieceCount: pieces.length };

  for (const piece of pieces) {
    const folderPath = (piece.folder_path || '').trim();
    if (!folderPath) continue;

    const parts = folderPath.split('/').filter(Boolean);
    let current = root;
    let pathSoFar = '';

    for (const part of parts) {
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
      if (!current.children[part]) {
        current.children[part] = { name: part, path: pathSoFar, children: {}, pieceCount: 0 };
      }
      current.children[part].pieceCount++;
      current = current.children[part];
    }
  }

  return root;
}

function renderSvgPreview(svgPath: string, w: number, h: number, size: number = 100) {
  const aspect = w / h;
  const viewW = aspect >= 1 ? size : size * aspect;
  const viewH = aspect >= 1 ? size / aspect : size;
  return (
    <svg width={viewW} height={viewH} viewBox={`0 0 ${w} ${h}`} className="border rounded bg-muted/30">
      <path
        d={svgPath}
        fill="hsl(210, 70%, 85%)"
        stroke="hsl(210, 70%, 40%)"
        strokeWidth={Math.max(w, h) * 0.01}
        fillOpacity={0.6}
      />
    </svg>
  );
}

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
  const [folderPath, setFolderPath] = useState('');

  // Library state
  const [pieces, setPieces] = useState<LibraryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marker_piece_library')
      .select('id, name, garment_type, size, set_type, grain_line, quantity_per_garment, width_inches, height_inches, svg_path_data, original_filename, folder_path')
      .order('created_at', { ascending: false });
    if (data) setPieces(data as LibraryPiece[]);
    if (error) console.error('Load library error:', error);
    setLoading(false);
  };

  const folderTree = useMemo(() => buildFolderTree(pieces), [pieces]);

  // Pieces visible in the current folder
  const filteredPieces = useMemo(() => {
    if (!currentFolder) return pieces;
    return pieces.filter((p) => {
      const fp = (p.folder_path || '').trim();
      return fp === currentFolder || fp.startsWith(currentFolder + '/');
    });
  }, [pieces, currentFolder]);

  // Direct children pieces (exact folder match)
  const directPieces = useMemo(() => {
    return pieces.filter((p) => {
      const fp = (p.folder_path || '').trim();
      if (!currentFolder) return !fp; // root shows pieces with no folder
      return fp === currentFolder;
    });
  }, [pieces, currentFolder]);

  // Get child folders of current path
  const childFolders = useMemo(() => {
    const children: { name: string; path: string; count: number }[] = [];
    const prefix = currentFolder ? currentFolder + '/' : '';

    const seen = new Set<string>();
    for (const piece of pieces) {
      const fp = (piece.folder_path || '').trim();
      if (!fp) continue;

      if (currentFolder ? fp.startsWith(prefix) && fp !== currentFolder : true) {
        const remaining = currentFolder ? fp.slice(prefix.length) : fp;
        const nextPart = remaining.split('/')[0];
        if (nextPart && !seen.has(nextPart)) {
          seen.add(nextPart);
          const childPath = prefix + nextPart;
          const count = pieces.filter((pp) => {
            const f = (pp.folder_path || '').trim();
            return f === childPath || f.startsWith(childPath + '/');
          }).length;
          children.push({ name: nextPart, path: childPath, count });
        }
      }
    }

    return children.sort((a, b) => a.name.localeCompare(b.name));
  }, [pieces, currentFolder]);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    if (!currentFolder) return [];
    return currentFolder.split('/').filter(Boolean);
  }, [currentFolder]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!pieceName) setPieceName(f.name.replace(/\.dxf$/i, ''));

    try {
      const text = await f.text();
      const result = parseDxfToSvg(text, dxfScale);
      setPreview(result);
    } catch (err: any) {
      toast({ title: 'DXF Parse Error', description: err.message, variant: 'destructive' });
      setPreview(null);
    }
  };

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
      const filePath = `marker-pieces/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('pp-assets').upload(filePath, file);
      const dxfUrl = uploadErr ? null : supabase.storage.from('pp-assets').getPublicUrl(filePath).data.publicUrl;

      const cleanFolder = folderPath.trim().replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');

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
        folder_path: cleanFolder,
        created_by: user?.id || null,
      } as any);

      if (dbErr) throw dbErr;

      toast({ title: 'Piece saved to library!' });
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
            <Input id="dxf-file-input" type="file" accept=".dxf" onChange={handleFileChange} />
          </div>

          {/* Folder Path */}
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <FolderPlus className="h-3 w-3" /> Folder Path
            </Label>
            <Input
              placeholder="e.g. ladies/pyjama/set/lps-112"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">Use "/" to create nested folders</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Piece Name</Label>
              <Input placeholder="e.g. Front Panel" value={pieceName} onChange={(e) => setPieceName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Input placeholder="e.g. M, L, XL" value={size} onChange={(e) => setSize(e.target.value)} />
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

          <div className="grid grid-cols-2 gap-3">
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
              <Input type="number" min={1} value={quantityPerGarment} onChange={(e) => setQuantityPerGarment(+e.target.value || 1)} />
            </div>
          </div>

          {/* Advanced: DXF Scale override */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs text-muted-foreground h-7">
                <Settings2 className="h-3 w-3" /> Advanced Settings
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-1">
                <Label className="text-xs">DXF Scale Override (default 1)</Label>
                <Input type="number" step="0.01" min={0.01} value={dxfScale} onChange={(e) => handleScaleChange(+e.target.value || 1)} />
                <p className="text-[10px] text-muted-foreground">Only change if auto-detected units are wrong</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Preview */}
          {preview && (
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Parsed: {preview.widthInches.toFixed(2)}" × {preview.heightInches.toFixed(2)}"
                </span>
                <Badge variant="outline" className="text-[10px] ml-auto">
                  Units: {preview.detectedUnits}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Raw DXF: {preview.rawWidth.toFixed(2)} × {preview.rawHeight.toFixed(2)} {preview.detectedUnits.split(' ')[0].toLowerCase()}
              </p>
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

      {/* Library Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileType className="h-4 w-4" /> Piece Library
            <Badge variant="secondary" className="ml-auto">{pieces.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs mb-3 flex-wrap">
            <button
              onClick={() => setCurrentFolder('')}
              className={`hover:underline ${!currentFolder ? 'font-bold text-primary' : 'text-muted-foreground'}`}
            >
              📁 Root
            </button>
            {breadcrumb.map((part, i) => {
              const path = breadcrumb.slice(0, i + 1).join('/');
              const isLast = i === breadcrumb.length - 1;
              return (
                <span key={path} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <button
                    onClick={() => setCurrentFolder(path)}
                    className={`hover:underline ${isLast ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                  >
                    {part}
                  </button>
                </span>
              );
            })}
            {filteredPieces.length > 0 && (
              <Badge variant="outline" className="ml-2 text-[10px]">{filteredPieces.length} pieces</Badge>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading library...</p>
          ) : (
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {/* Child folders */}
              {childFolders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => setCurrentFolder(folder.path)}
                  className="w-full flex items-center gap-2 p-2 border rounded-md hover:bg-muted/50 text-left"
                >
                  <FolderOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">{folder.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{folder.count}</Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}

              {/* Pieces in current folder */}
              {directPieces.length === 0 && childFolders.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {pieces.length === 0 ? 'No pieces uploaded yet. Upload a DXF file to get started.' : 'No pieces in this folder.'}
                </p>
              )}
              {directPieces.map((piece) => (
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
