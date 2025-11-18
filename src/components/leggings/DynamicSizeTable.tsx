import { LeggingType } from "@/pages/LeggingsSizeChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader className={`bg-gradient-to-r ${selectedType.color} text-white`}>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>{selectedType.name}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Size Chart
          </Badge>
        </CardTitle>
        <p className="text-white/90 text-sm mt-2">
          All measurements are in inches
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold sticky left-0 bg-muted/50 z-10">
                  Size
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col} className="font-bold text-center">
                    {formatColumnName(col)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedType.sizes.map((sizeData, index) => (
                <TableRow
                  key={sizeData.size}
                  className={`
                    ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                    hover:bg-primary/5 transition-colors
                    ${isPopularSize(sizeData.size) ? 'font-medium' : ''}
                  `}
                >
                  <TableCell className="font-bold sticky left-0 bg-inherit z-10">
                    <div className="flex items-center gap-2">
                      {sizeData.size}
                      {isPopularSize(sizeData.size) && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className="text-center">
                      {sizeData[col]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 bg-muted/30 border-t">
          <h4 className="font-semibold mb-3">Measurement Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Waist:</strong> Measure around the narrowest part of your natural waistline</li>
            <li>• <strong>Hips:</strong> Measure around the fullest part of your hips</li>
            <li>• <strong>Inseam:</strong> Measure from the crotch to the desired length</li>
            <li>• For best results, measure over light clothing or undergarments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
