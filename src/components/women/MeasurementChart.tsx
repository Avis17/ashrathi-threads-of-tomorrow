import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Package, Truck, Users } from "lucide-react";

interface MeasurementData {
  size: string;
  chest?: string;
  height?: string;
  waist?: string;
  hips?: string;
}

interface SpecificationItem {
  label: string;
  value: string;
}

interface MeasurementChartProps {
  measurements: MeasurementData[];
  specifications: SpecificationItem[];
  productType: string;
}

export function MeasurementChart({ measurements, specifications, productType }: MeasurementChartProps) {
  const columns = measurements.length > 0 ? Object.keys(measurements[0]).filter(key => key !== 'size') : [];
  
  const icons = [
    { Icon: Ruler, label: "100% Premium Cotton" },
    { Icon: Package, label: "Strong & Durable" },
    { Icon: Truck, label: "Customizable to Any Styles" },
    { Icon: Users, label: "Unisex Design" }
  ];

  return (
    <div className="space-y-12 py-16">
      {/* Size Chart */}
      <Card className="overflow-hidden border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <CardTitle className="text-3xl font-bold text-center">Size Chart</CardTitle>
          <p className="text-center text-sm text-muted-foreground uppercase tracking-wide mt-2">
            All measurements are in inches
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold text-lg">Size</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col} className="font-bold text-lg capitalize">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-base">{row.size}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col} className="text-base">
                        {row[col as keyof MeasurementData]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* General Product Specification */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center uppercase tracking-wide">
          General Product Specification
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {specifications.map((spec, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="font-bold text-secondary text-lg shrink-0">{spec.label}:</span>
              <span className="text-foreground text-lg">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Product Features Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          {icons.map(({ Icon, label }, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-muted/40 to-muted/60 hover:from-muted/60 hover:to-muted/80 transition-all hover:scale-105">
              <Icon className="w-12 h-12 text-secondary" />
              <p className="text-sm text-center font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
