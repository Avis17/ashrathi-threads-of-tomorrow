import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CMTTrim } from '@/types/cmt-quotation';

interface CMTTrimsTableProps {
  trims: CMTTrim[];
  onTrimsChange: (trims: CMTTrim[]) => void;
}

export function CMTTrimsTable({ trims, onTrimsChange }: CMTTrimsTableProps) {
  const addTrim = () => {
    const newTrim: CMTTrim = {
      id: crypto.randomUUID(),
      trimName: '',
      providedBy: 'Buyer',
      remarks: '',
    };
    onTrimsChange([...trims, newTrim]);
  };

  const removeTrim = (id: string) => {
    onTrimsChange(trims.filter(t => t.id !== id));
  };

  const updateTrim = (id: string, field: keyof CMTTrim, value: string) => {
    const updated = trims.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onTrimsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Trims & Accessories</h3>
        <Button onClick={addTrim} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trim
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Trim / Accessory Name</TableHead>
              <TableHead className="w-40">Provided By</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No trims added. Click "Add Trim" to specify accessories.
                </TableCell>
              </TableRow>
            ) : (
              trims.map((trim) => (
                <TableRow key={trim.id} className="group">
                  <TableCell>
                    <Input
                      value={trim.trimName}
                      onChange={(e) => updateTrim(trim.id, 'trimName', e.target.value)}
                      placeholder="e.g., Main Label, Care Label, Hangtag"
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={trim.providedBy}
                      onValueChange={(value) => updateTrim(trim.id, 'providedBy', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buyer">Buyer</SelectItem>
                        <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={trim.remarks}
                      onChange={(e) => updateTrim(trim.id, 'remarks', e.target.value)}
                      placeholder="Any specific notes..."
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={() => removeTrim(trim.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
