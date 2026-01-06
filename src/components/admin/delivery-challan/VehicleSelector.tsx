import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Car, Bike, Truck as TruckIcon, Loader2 } from 'lucide-react';
import { useCompanyVehicles, type CompanyVehicle } from '@/hooks/useCompanyVehicles';

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

interface VehicleSelectorProps {
  onSelect: (vehicle: {
    vehicle_number: string;
    driver_name: string;
    driver_mobile: string;
  }) => void;
}

export default function VehicleSelector({ onSelect }: VehicleSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: vehicles = [], isLoading } = useCompanyVehicles(true);

  const handleSelect = (vehicle: CompanyVehicle) => {
    onSelect({
      vehicle_number: vehicle.vehicle_number,
      driver_name: vehicle.driver_name || '',
      driver_mobile: vehicle.driver_phone || '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Car className="h-4 w-4" />
          Own Vehicles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Select Company Vehicle
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No company vehicles available</p>
              <p className="text-sm">Add vehicles in Settings → Company Vehicles</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ownership</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow 
                      key={vehicle.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelect(vehicle)}
                    >
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
                        <Badge 
                          variant="outline" 
                          className={vehicle.ownership_type === 'own' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                          }
                        >
                          {OWNERSHIP_TYPE_LABELS[vehicle.ownership_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicle.driver_name || '-'}</TableCell>
                      <TableCell>{vehicle.driver_phone || '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
