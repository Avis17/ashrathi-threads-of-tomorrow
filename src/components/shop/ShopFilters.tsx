import { useState } from "react";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface ShopFiltersProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  availableColors: { name: string; hex: string }[];
  availableSizes: string[];
  onClearFilters: () => void;
}

const FilterSection = ({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-border/50 pb-5 mb-5 last:border-b-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const FilterContent = ({
  categories,
  activeCategory,
  setActiveCategory,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  priceRange,
  setPriceRange,
  maxPrice,
  availableColors,
  availableSizes,
  onClearFilters,
}: ShopFiltersProps) => {
  const hasFilters = 
    activeCategory !== "All" || 
    selectedColors.length > 0 || 
    selectedSizes.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < maxPrice;

  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter(c => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  return (
    <div className="space-y-0">
      {/* Clear Filters */}
      {hasFilters && (
        <div className="pb-4 mb-4 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto font-medium"
          >
            <X className="h-3 w-3 mr-1.5" />
            Clear all filters
          </Button>
        </div>
      )}

      {/* Category Filter */}
      <FilterSection title="Category">
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-3">
              <Checkbox
                id={`category-${category}`}
                checked={activeCategory === category}
                onCheckedChange={() => setActiveCategory(category)}
                className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors font-normal"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2.5">
            {availableColors.map((color) => {
              const isSelected = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`group relative w-8 h-8 rounded-full transition-all duration-200 ${
                    isSelected 
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" 
                      : "hover:ring-2 hover:ring-muted-foreground/50 hover:ring-offset-2 hover:ring-offset-background"
                  }`}
                  title={color.name}
                >
                  <span
                    className="absolute inset-0.5 rounded-full border border-border/20"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              );
            })}
          </div>
          {selectedColors.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedColors.map(color => (
                <span
                  key={color}
                  className="text-xs px-2 py-1 bg-muted rounded-sm text-muted-foreground flex items-center gap-1"
                >
                  {color}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-foreground" 
                    onClick={() => toggleColor(color)}
                  />
                </span>
              ))}
            </div>
          )}
        </FilterSection>
      )}

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`min-w-[40px] h-10 px-3 text-xs font-medium border transition-all duration-200 ${
                    isSelected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <Slider
            value={priceRange}
            min={0}
            max={maxPrice}
            step={50}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">₹{priceRange[0]}</span>
            <span className="text-xs text-muted-foreground/60">—</span>
            <span className="font-medium">₹{priceRange[1]}</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );
};

export const ShopFilters = (props: ShopFiltersProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-card p-6 border border-border/50 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6 pb-4 border-b border-border/50">
            Filters
          </h3>
          <FilterContent {...props} />
        </div>
      </aside>

      {/* Mobile Filter Button & Sheet */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className="rounded-full px-6 py-6 shadow-xl bg-foreground text-background hover:bg-foreground/90 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(props.activeCategory !== "All" || props.selectedColors.length > 0 || props.selectedSizes.length > 0) && (
                <span className="ml-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                  {(props.activeCategory !== "All" ? 1 : 0) + props.selectedColors.length + props.selectedSizes.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 border-b border-border/50">
              <SheetTitle className="text-sm font-bold uppercase tracking-widest">
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              <FilterContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default ShopFilters;
