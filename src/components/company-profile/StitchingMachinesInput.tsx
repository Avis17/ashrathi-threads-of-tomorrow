import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export interface StitchingMachine {
  id: string;
  type: string;
  customType?: string;
  count: number;
  brand?: string;
  notes?: string;
}

const MACHINE_TYPES = [
  'Singer / Single Needle',
  'Overlock',
  'Flatlock',
  'Trimmer',
  'Kansai',
  'Button Hole',
  'Button Attach',
  'Bar Tack',
  'Feed of Arm',
  'Zigzag',
  'Interlock',
  'Double Needle',
  'Others',
] as const;

interface StitchingMachinesInputProps {
  value: StitchingMachine[];
  onChange: (machines: StitchingMachine[]) => void;
}

export const StitchingMachinesInput = ({ value = [], onChange }: StitchingMachinesInputProps) => {
  const [machines, setMachines] = useState<StitchingMachine[]>(
    value.length > 0 ? value : []
  );

  const updateMachines = (newMachines: StitchingMachine[]) => {
    setMachines(newMachines);
    onChange(newMachines);
  };

  const addMachine = () => {
    const newMachine: StitchingMachine = {
      id: crypto.randomUUID(),
      type: 'Singer / Single Needle',
      count: 1,
      brand: '',
      notes: '',
    };
    updateMachines([...machines, newMachine]);
  };

  const removeMachine = (id: string) => {
    updateMachines(machines.filter(m => m.id !== id));
  };

  const updateMachine = (id: string, field: keyof StitchingMachine, value: any) => {
    updateMachines(machines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const totalMachines = machines.reduce((sum, m) => sum + (m.count || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Stitching Machines</Label>
        <Button type="button" variant="outline" size="sm" onClick={addMachine}>
          <Plus className="h-4 w-4 mr-1" />
          Add Machine
        </Button>
      </div>

      {machines.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
          <p className="text-muted-foreground text-sm">No machines added yet</p>
          <Button type="button" variant="ghost" size="sm" onClick={addMachine} className="mt-2">
            <Plus className="h-4 w-4 mr-1" />
            Add your first machine
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {machines.map((machine, index) => (
            <div 
              key={machine.id} 
              className="grid grid-cols-12 gap-2 items-start p-3 bg-muted/30 rounded-lg border"
            >
              <div className="col-span-4">
                <Label className="text-xs text-muted-foreground">Machine Type</Label>
                <Select 
                  value={machine.type} 
                  onValueChange={(v) => updateMachine(machine.id, 'type', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MACHINE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {machine.type === 'Others' && (
                  <Input
                    className="mt-1 h-8"
                    placeholder="Specify machine type"
                    value={machine.customType || ''}
                    onChange={(e) => updateMachine(machine.id, 'customType', e.target.value)}
                  />
                )}
              </div>

              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Count</Label>
                <Input
                  type="number"
                  min="1"
                  className="h-9"
                  value={machine.count}
                  onChange={(e) => updateMachine(machine.id, 'count', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="col-span-3">
                <Label className="text-xs text-muted-foreground">Brand (Optional)</Label>
                <Input
                  className="h-9"
                  placeholder="e.g., Juki, Brother"
                  value={machine.brand || ''}
                  onChange={(e) => updateMachine(machine.id, 'brand', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Input
                  className="h-9"
                  placeholder="Optional"
                  value={machine.notes || ''}
                  onChange={(e) => updateMachine(machine.id, 'notes', e.target.value)}
                />
              </div>

              <div className="col-span-1 flex items-end justify-center pb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeMachine(machine.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {machines.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold">
            Total Machines: {totalMachines}
          </div>
        </div>
      )}
    </div>
  );
};
