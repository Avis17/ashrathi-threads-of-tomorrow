import { LeggingType } from "@/pages/LeggingsSizeChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicSizeTableProps {
  selectedType: LeggingType;
}

export default function DynamicSizeTable({ selectedType }: DynamicSizeTableProps) {
  // Get all measurement columns (excluding 'size')
  const columns = selectedType.sizes.length > 0
    ? Object.keys(selectedType.sizes[0]).filter(key => key !== 'size')
    : [];

  const formatColumnName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const isPopularSize = (size: string) => ['S', 'M', 'L'].includes(size);

  const Icon = selectedType.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      {/* Header */}
      <div className={cn("p-6 lg:p-8 bg-gradient-to-r", selectedType.color)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-1">
                {selectedType.name}
              </h2>
              <p className="text-white/80 text-sm">
                {selectedType.bestFor}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Info className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">All measurements in inches</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-bold sticky left-0 bg-secondary/50 z-10 text-foreground">
                Size
              </TableHead>
              {columns.map((col) => (
                <TableHead key={col} className="font-bold text-center text-foreground">
                  {formatColumnName(col)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedType.sizes.map((sizeData, index) => (
              <TableRow
                key={sizeData.size}
                className={cn(
                  "transition-colors",
                  index % 2 === 0 ? 'bg-background' : 'bg-secondary/20',
                  "hover:bg-accent/5",
                  isPopularSize(sizeData.size) && "font-medium"
                )}
              >
                <TableCell className="font-bold sticky left-0 bg-inherit z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sizeData.size}</span>
                    {isPopularSize(sizeData.size) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                  </div>
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col} className="text-center text-muted-foreground">
                    <span className="font-medium text-foreground">{sizeData[col]}</span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Measurement Tips */}
      <div className="p-6 lg:p-8 bg-secondary/30 border-t border-border">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Info className="w-4 h-4 text-accent" />
          </div>
          How to Measure
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
            <div>
              <p className="font-medium text-foreground text-sm">Waist</p>
              <p className="text-muted-foreground text-sm">Measure around the narrowest part of your natural waistline</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <p className="font-medium text-foreground text-sm">Hips</p>
              <p className="text-muted-foreground text-sm">Measure around the fullest part of your hips</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <p className="font-medium text-foreground text-sm">Inseam</p>
              <p className="text-muted-foreground text-sm">Measure from the crotch to the desired length</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
            <div>
              <p className="font-medium text-foreground text-sm">Tip</p>
              <p className="text-muted-foreground text-sm">Measure over light clothing for best results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
