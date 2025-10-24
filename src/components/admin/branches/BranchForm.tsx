import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const BUILDING_TYPES = [
  "Commercial Complex",
  "Industrial Building",
  "Standalone Structure",
  "Warehouse",
  "Factory",
  "Retail Space",
  "Others"
];

const FACILITIES = [
  "Parking",
  "Power Backup",
  "Security",
  "Loading Dock",
  "Air Conditioning",
  "Cafeteria",
  "Restrooms",
  "Storage Room"
];

const branchSchema = z.object({
  building_name: z.string().min(1, "Building name is required"),
  owner_name: z.string().min(1, "Owner name is required"),
  monthly_rent: z.string().min(1, "Monthly rent is required"),
  building_size: z.string().min(1, "Building size is required"),
  address: z.string().min(1, "Address is required"),
  owner_number: z.string().min(10, "Valid phone number is required"),
  is_main_building: z.boolean().default(false),
  is_outlet: z.boolean().default(true),
  is_manufacturing_unit: z.boolean().default(false),
  facilities: z.array(z.string()).default([]),
  building_type: z.string().min(1, "Building type is required"),
  electricity_sanctioned: z.string().optional(),
  notes: z.string().optional(),
});

export type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  onSubmit: (data: BranchFormData) => void;
  initialData?: Partial<BranchFormData>;
  isLoading?: boolean;
}

export const BranchForm = ({ onSubmit, initialData, isLoading }: BranchFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      is_main_building: false,
      is_outlet: true,
      is_manufacturing_unit: false,
      facilities: [],
      ...initialData,
    },
  });

  const selectedFacilities = watch("facilities") || [];
  const buildingType = watch("building_type");

  const toggleFacility = (facility: string) => {
    const current = selectedFacilities;
    const updated = current.includes(facility)
      ? current.filter((f) => f !== facility)
      : [...current, facility];
    setValue("facilities", updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="building_name">Building Name *</Label>
          <Input id="building_name" {...register("building_name")} />
          {errors.building_name && (
            <p className="text-sm text-destructive">{errors.building_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_name">Owner Name *</Label>
          <Input id="owner_name" {...register("owner_name")} />
          {errors.owner_name && (
            <p className="text-sm text-destructive">{errors.owner_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Monthly Rent (₹) *</Label>
          <Input id="monthly_rent" type="number" step="0.01" {...register("monthly_rent")} />
          {errors.monthly_rent && (
            <p className="text-sm text-destructive">{errors.monthly_rent.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="building_size">Building Size (sq ft) *</Label>
          <Input id="building_size" type="number" step="0.01" {...register("building_size")} />
          {errors.building_size && (
            <p className="text-sm text-destructive">{errors.building_size.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_number">Owner Contact Number *</Label>
          <Input id="owner_number" {...register("owner_number")} />
          {errors.owner_number && (
            <p className="text-sm text-destructive">{errors.owner_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="building_type">Building Type *</Label>
          <Select
            value={buildingType}
            onValueChange={(value) => setValue("building_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select building type" />
            </SelectTrigger>
            <SelectContent>
              {BUILDING_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.building_type && (
            <p className="text-sm text-destructive">{errors.building_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="electricity_sanctioned">Electricity Sanctioned</Label>
          <Input id="electricity_sanctioned" placeholder="e.g., 50 KW" {...register("electricity_sanctioned")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea id="address" rows={3} {...register("address")} />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Property Configuration</Label>
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_main_building">Main Building</Label>
              <p className="text-sm text-muted-foreground">Only one main building allowed</p>
            </div>
            <Switch
              id="is_main_building"
              checked={watch("is_main_building")}
              onCheckedChange={(checked) => setValue("is_main_building", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_outlet">Outlet</Label>
            <Switch
              id="is_outlet"
              checked={watch("is_outlet")}
              onCheckedChange={(checked) => setValue("is_outlet", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_manufacturing_unit">Manufacturing Unit</Label>
            <Switch
              id="is_manufacturing_unit"
              checked={watch("is_manufacturing_unit")}
              onCheckedChange={(checked) => setValue("is_manufacturing_unit", checked)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Facilities</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FACILITIES.map((facility) => (
            <div key={facility} className="flex items-center space-x-2">
              <Checkbox
                id={facility}
                checked={selectedFacilities.includes(facility)}
                onCheckedChange={() => toggleFacility(facility)}
              />
              <label
                htmlFor={facility}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {facility}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={4} {...register("notes")} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Branch" : "Add Branch"}
        </Button>
      </div>
    </form>
  );
};
