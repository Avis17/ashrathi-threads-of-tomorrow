import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Car, Plus, Trash2, Edit, Loader2, Bike, Truck as TruckIcon } from 'lucide-react';
import { 
  useCompanyVehicles, 
  useCreateCompanyVehicle, 
  useUpdateCompanyVehicle, 
  useDeleteCompanyVehicle,
  type CompanyVehicle 
} from '@/hooks/useCompanyVehicles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const VEHICLE_TYPE_LABELS = {
  '2_wheeler': '2 Wheeler',
  '3_wheeler': '3 Wheeler',
  '4_wheeler': '4 Wheeler',
};

const OWNERSHIP_TYPE_LABELS = {
  own: 'Own Board',
  commercial: 'Commercial',
};

const VehicleIcon = ({ type }: { type: string }) => {
  switch (type) {
    case '2_wheeler':
      return <Bike className="h-4 w-4" />;
    case '3_wheeler':
      return <TruckIcon className="h-4 w-4" />;
    case '4_wheeler':
      return <Car className="h-4 w-4" />;
    default:
      return <Car className="h-4 w-4" />;
  }
};

interface VehicleFormData {
  vehicle_number: string;
  vehicle_type: '2_wheeler' | '3_wheeler' | '4_wheeler';
  ownership_type: 'own' | 'commercial';
  driver_name: string;
  driver_phone: string;
  is_active: boolean;
  notes: string;
}

const initialFormData: VehicleFormData = {
  vehicle_number: '',
  vehicle_type: '4_wheeler',
  ownership_type: 'own',
  driver_name: '',
  driver_phone: '',
  is_active: true,
  notes: '',
};

export default function CompanyVehiclesSettings() {
  const { data: vehicles = [], isLoading } = useCompanyVehicles(false);
  const createVehicle = useCreateCompanyVehicle();
  const updateVehicle = useUpdateCompanyVehicle();
  const deleteVehicle = useDeleteCompanyVehicle();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<CompanyVehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenDialog = (vehicle?: CompanyVehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicle_number: vehicle.vehicle_number,
        vehicle_type: vehicle.vehicle_type,
        ownership_type: vehicle.ownership_type,
        driver_name: vehicle.driver_name || '',
        driver_phone: vehicle.driver_phone || '',
        is_active: vehicle.is_active,
        notes: vehicle.notes || '',
      });
    } else {
      setEditingVehicle(null);
      setFormData(initialFormData);
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.vehicle_number) return;
    
    const data = {
      vehicle_number: formData.vehicle_number.toUpperCase(),
      vehicle_type: formData.vehicle_type,
      ownership_type: formData.ownership_type,
      driver_name: formData.driver_name || null,
      driver_phone: formData.driver_phone || null,
      is_active: formData.is_active,
      notes: formData.notes || null,
    };
    
    if (editingVehicle) {
      await updateVehicle.mutateAsync({ id: editingVehicle.id, ...data });
    } else {
      await createVehicle.mutateAsync(data as any);
    }
    
    setShowDialog(false);
    setFormData(initialFormData);
    setEditingVehicle(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteVehicle.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Company Vehicles
              </CardTitle>
              <CardDescription>
                Manage your company-owned vehicles for deliveries
              </CardDescription>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Vehicle Number *</Label>
                    <Input
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                      placeholder="e.g., KA01AB1234"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle Type *</Label>
                      <Select
                        value={formData.vehicle_type}
                        onValueChange={(v) => setFormData({ ...formData, vehicle_type: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2_wheeler">2 Wheeler</SelectItem>
                          <SelectItem value="3_wheeler">3 Wheeler</SelectItem>
                          <SelectItem value="4_wheeler">4 Wheeler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ownership Type *</Label>
                      <Select
                        value={formData.ownership_type}
                        onValueChange={(v) => setFormData({ ...formData, ownership_type: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Own Board</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Driver Name</Label>
                      <Input
                        value={formData.driver_name}
                        onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                        placeholder="Driver's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Driver Phone</Label>
                      <Input
                        value={formData.driver_phone}
                        onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full"
                    disabled={!formData.vehicle_number || createVehicle.isPending || updateVehicle.isPending}
                  >
                    {(createVehicle.isPending || updateVehicle.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No vehicles added yet</p>
              <p className="text-sm">Add your company vehicles to use in Delivery Challans</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ownership</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-mono font-semibold">
                        {vehicle.vehicle_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <VehicleIcon type={vehicle.vehicle_type} />
                          {VEHICLE_TYPE_LABELS[vehicle.vehicle_type]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={vehicle.ownership_type === 'own' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                          {OWNERSHIP_TYPE_LABELS[vehicle.ownership_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicle.driver_name || '-'}</TableCell>
                      <TableCell>{vehicle.driver_phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.is_active ? 'default' : 'secondary'}>
                          {vehicle.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(vehicle)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(vehicle.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
