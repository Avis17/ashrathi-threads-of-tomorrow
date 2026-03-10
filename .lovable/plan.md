

# CAD Piece Upload System for Pattern Marker

## Overview
Add a **Piece Library** tab to the Pattern Marker page where you can upload DXF files of individual pattern pieces. Each uploaded piece stores its parsed outline (as SVG path data) along with metadata (name, size, garment type, grain line, quantity). These library pieces can then be placed onto the marker canvas as **actual shaped outlines** instead of plain rectangles.

---

## What You'll Do
1. Upload a `.dxf` file for each pattern piece (e.g., "Front Panel - M", "Back Panel - L")
2. Fill in piece details: name, size, garment type, grain line direction, quantity per garment, set or individual
3. The system parses the DXF client-side, extracts the outline, and stores it
4. From the Piece Library, you pick pieces and place them on the marker canvas
5. Pieces render as their actual CAD shapes (curves, notches) -- draggable and rotatable

---

## Implementation Steps

### Step 1: New Database Table -- `marker_piece_library`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `name` | TEXT | e.g. "Front Panel" |
| `garment_type` | TEXT | pant, top, shorts, etc. |
| `size` | TEXT | M, L, XL, etc. |
| `set_type` | TEXT | "set" or "individual" |
| `grain_line` | TEXT | lengthwise, crosswise, bias |
| `quantity_per_garment` | INT | e.g. 2 for sleeves |
| `width_inches` | NUMERIC | Bounding box width from DXF |
| `height_inches` | NUMERIC | Bounding box height from DXF |
| `svg_path_data` | TEXT | The parsed SVG path `d` attribute |
| `original_filename` | TEXT | The uploaded DXF filename |
| `dxf_file_url` | TEXT | URL in pp-assets bucket |
| `metadata` | JSONB | Any extra info |
| `created_by` | UUID | Auth user |
| `created_at` | TIMESTAMPTZ | Default now() |

RLS: Authenticated users can CRUD their own rows.

### Step 2: Install `dxf-parser` npm package

Use the `dxf-parser` library to parse DXF content client-side in the browser. It reads DXF text into a JS object with entities (LINE, LWPOLYLINE, ARC, CIRCLE, SPLINE, etc.).

### Step 3: DXF-to-SVG Path Converter Utility

Create `src/utils/dxf-to-svg.ts`:
- Read the DXF file as text
- Parse with `dxf-parser`
- Extract all entities from the DXF (lines, polylines, arcs, circles, splines)
- Convert each entity to SVG path commands (`M`, `L`, `A`, `C`)
- Compute bounding box to determine `width_inches` and `height_inches`
- Normalize the path so it starts at origin (0,0)
- Accept a `scaleInput` parameter (user specifies what 1 unit in their DXF equals in inches)
- Return: `{ svgPath: string, widthInches: number, heightInches: number }`

### Step 4: New Component -- `PieceLibraryTab`

Create `src/components/admin/pattern-marker/PieceLibraryTab.tsx`:

**Upload Form:**
- File input (accept `.dxf`)
- Piece Name (text)
- Garment Type (dropdown: pant, top, shorts, custom)
- Size (text, e.g. M / L / XL)
- Set Type (radio: Set Item / Individual)
- Grain Line Direction (dropdown: Lengthwise / Crosswise / Bias)
- Quantity per Garment (number, default 1)
- DXF Scale (number -- how many inches = 1 DXF unit, default 1)

**Upload Flow:**
1. User selects DXF file and fills metadata
2. On submit: parse DXF client-side, extract SVG path + bounding box
3. Upload original DXF file to `pp-assets` bucket under `marker-pieces/`
4. Insert row into `marker_piece_library` with parsed SVG path data
5. Show a small preview of the parsed outline shape

**Library Grid:**
- List all saved pieces as cards with shape preview (rendered as inline SVG), name, size, garment type
- Delete button on each card
- "Add to Canvas" button to place the piece onto the marker

### Step 5: Update `PieceDef` Interface

Extend the existing `PieceDef` to support SVG path pieces:

```text
PieceDef {
  ...existing fields...
  svgPathData?: string    // If present, render as shape instead of rectangle
  libraryPieceId?: string // Reference to marker_piece_library row
}
```

### Step 6: Update `MarkerCanvas` to Render SVG Shapes

When a piece has `svgPathData`:
- Use Konva's `Path` component instead of `Rect`
- Scale the path to match the piece's `widthInches * scale` and `heightInches * scale`
- Keep all existing behavior: draggable, 90-degree rotation, collision detection (using bounding box), selection, delete

When a piece does NOT have `svgPathData` (measurement-generated pieces):
- Continue rendering as rectangles (no change)

### Step 7: Add "Piece Library" Tab to PatternMarker Page

Add a new tab alongside Canvas, Measurements, Analytics, and Styles:
- Tab label: "Piece Library"
- Renders `PieceLibraryTab`
- Passes a callback `onAddToCanvas(piece)` that converts a library piece into a `PieceDef` and adds it to the canvas pieces array

---

## Technical Details

**DXF Parsing Strategy:**
- Use `dxf-parser` (well-maintained, supports LINE, LWPOLYLINE, ARC, CIRCLE, SPLINE, INSERT)
- Entity-to-SVG mapping:
  - `LINE` -> `M x1,y1 L x2,y2`
  - `LWPOLYLINE` / `POLYLINE` -> `M x0,y0 L x1,y1 L x2,y2 ... Z`
  - `ARC` -> SVG arc command `A rx,ry rotation large-arc sweep ex,ey`
  - `CIRCLE` -> Two arc commands forming a full circle
  - `SPLINE` -> Approximate with cubic bezier `C` commands
- DXF Y-axis is flipped vs SVG; the converter will negate Y values

**Collision Detection:**
- For shaped pieces, collision detection will still use the bounding box (width x height) for performance. Pixel-perfect collision with arbitrary paths is too expensive for real-time dragging.

**Storage:**
- Original DXF files stored in `pp-assets` bucket (already public)
- SVG path data stored as TEXT in the database (typically a few KB per piece)

**Files to create/modify:**
- Create: `src/utils/dxf-to-svg.ts`
- Create: `src/components/admin/pattern-marker/PieceLibraryTab.tsx`
- Modify: `src/pages/admin/PatternMarker.tsx` (add tab, extend PieceDef, add-to-canvas handler)
- Modify: `src/components/admin/pattern-marker/MarkerCanvas.tsx` (render Path when svgPathData exists)
- Migration: Create `marker_piece_library` table with RLS

