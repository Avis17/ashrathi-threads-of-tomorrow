import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Scissors, Shirt, CheckCircle, Flame, Package, Users } from 'lucide-react';
import { CompanyProfile, CompanyProfileInsert } from './useProfileData';

interface ProfileFormProps {
  formData: Partial<CompanyProfileInsert>;
  onChange: (field: string, value: any) => void;
}

export const ProfileForm = ({ formData, onChange }: ProfileFormProps) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-7 mb-6">
        <TabsTrigger value="basic" className="text-xs"><Building2 className="h-4 w-4 mr-1" />Basic</TabsTrigger>
        <TabsTrigger value="cutting" className="text-xs"><Scissors className="h-4 w-4 mr-1" />Cutting</TabsTrigger>
        <TabsTrigger value="stitching" className="text-xs"><Shirt className="h-4 w-4 mr-1" />Stitching</TabsTrigger>
        <TabsTrigger value="checking" className="text-xs"><CheckCircle className="h-4 w-4 mr-1" />Checking</TabsTrigger>
        <TabsTrigger value="ironing" className="text-xs"><Flame className="h-4 w-4 mr-1" />Ironing</TabsTrigger>
        <TabsTrigger value="packing" className="text-xs"><Package className="h-4 w-4 mr-1" />Packing</TabsTrigger>
        <TabsTrigger value="staff" className="text-xs"><Users className="h-4 w-4 mr-1" />Staff</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <BasicDetailsForm formData={formData} onChange={onChange} />
      </TabsContent>
      <TabsContent value="cutting">
        <CuttingForm formData={formData} onChange={onChange} />
      </TabsContent>
      <TabsContent value="stitching">
        <StitchingForm formData={formData} onChange={onChange} />
      </TabsContent>
      <TabsContent value="checking">
        <CheckingForm formData={formData} onChange={onChange} />
      </TabsContent>
      <TabsContent value="ironing">
        <IroningForm formData={formData} onChange={onChange} />
      </TabsContent>
      <TabsContent value="packing">
        <PackingForm formData={formData} onChange={onChange} />
      </TabsContent>
      <TabsContent value="staff">
        <StaffForm formData={formData} onChange={onChange} />
      </TabsContent>
    </Tabs>
  );
};

const BasicDetailsForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Company Name *</Label><Input value={formData.company_name || ''} onChange={(e) => onChange('company_name', e.target.value)} /></div>
      <div><Label>Brand Name</Label><Input value={formData.brand_name || ''} onChange={(e) => onChange('brand_name', e.target.value)} /></div>
      <div><Label>Contact Person</Label><Input value={formData.contact_person || ''} onChange={(e) => onChange('contact_person', e.target.value)} /></div>
      <div><Label>Phone</Label><Input value={formData.phone || ''} onChange={(e) => onChange('phone', e.target.value)} /></div>
      <div><Label>Email</Label><Input value={formData.email || ''} onChange={(e) => onChange('email', e.target.value)} /></div>
      <div><Label>Website</Label><Input value={formData.website || ''} onChange={(e) => onChange('website', e.target.value)} /></div>
      <div><Label>GST Number</Label><Input value={formData.gst_number || ''} onChange={(e) => onChange('gst_number', e.target.value)} /></div>
      <div><Label>Daily Production Capacity</Label><Input value={formData.daily_production_capacity || ''} onChange={(e) => onChange('daily_production_capacity', e.target.value)} /></div>
      <div className="col-span-2"><Label>Address</Label><Textarea value={formData.address || ''} onChange={(e) => onChange('address', e.target.value)} /></div>
      <div><Label>City</Label><Input value={formData.city || ''} onChange={(e) => onChange('city', e.target.value)} /></div>
      <div><Label>State</Label><Input value={formData.state || ''} onChange={(e) => onChange('state', e.target.value)} /></div>
      <div><Label>Country</Label><Input value={formData.country || ''} onChange={(e) => onChange('country', e.target.value)} /></div>
      <div><Label>Power Connection Type</Label><Input value={formData.power_connection_type || ''} onChange={(e) => onChange('power_connection_type', e.target.value)} /></div>
      <div className="flex items-center gap-2"><Switch checked={formData.generator_available || false} onCheckedChange={(v) => onChange('generator_available', v)} /><Label>Generator Available</Label></div>
      {formData.generator_available && <div><Label>Generator Capacity</Label><Input value={formData.generator_capacity || ''} onChange={(e) => onChange('generator_capacity', e.target.value)} /></div>}
      <div className="flex items-center gap-2"><Switch checked={formData.compressor_available || false} onCheckedChange={(v) => onChange('compressor_available', v)} /><Label>Compressor Available</Label></div>
      {formData.compressor_available && <div><Label>Compressor Capacity</Label><Input value={formData.compressor_capacity || ''} onChange={(e) => onChange('compressor_capacity', e.target.value)} /></div>}
      <div className="flex items-center gap-2"><Switch checked={formData.boiler_available || false} onCheckedChange={(v) => onChange('boiler_available', v)} /><Label>Boiler Available</Label></div>
    </CardContent>
  </Card>
);

const CuttingForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Scissors className="h-5 w-5" />Cutting Section</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Number of Cutting Tables</Label><Input type="number" value={formData.cutting_tables_count || 0} onChange={(e) => onChange('cutting_tables_count', parseInt(e.target.value) || 0)} /></div>
      <div><Label>Cutting Table Size</Label><Input value={formData.cutting_table_size || ''} onChange={(e) => onChange('cutting_table_size', e.target.value)} placeholder="e.g., 12ft x 4ft" /></div>
      <div><Label>Fabric Inspection Tables</Label><Input type="number" value={formData.fabric_inspection_tables_count || 0} onChange={(e) => onChange('fabric_inspection_tables_count', parseInt(e.target.value) || 0)} /></div>
      <div><Label>Fabric Inspection Table Size</Label><Input value={formData.fabric_inspection_table_size || ''} onChange={(e) => onChange('fabric_inspection_table_size', e.target.value)} /></div>
      <div><Label>Cutting Staff Count</Label><Input type="number" value={formData.cutting_staff || 0} onChange={(e) => onChange('cutting_staff', parseInt(e.target.value) || 0)} /></div>
      <div className="col-span-2"><Label>Cutting Notes</Label><Textarea value={formData.cutting_notes || ''} onChange={(e) => onChange('cutting_notes', e.target.value)} /></div>
    </CardContent>
  </Card>
);

const StitchingForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Shirt className="h-5 w-5" />Stitching Section</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Stitching Staff Count</Label><Input type="number" value={formData.stitching_staff || 0} onChange={(e) => onChange('stitching_staff', parseInt(e.target.value) || 0)} /></div>
      <div className="col-span-2"><Label>Stitching Notes</Label><Textarea value={formData.stitching_notes || ''} onChange={(e) => onChange('stitching_notes', e.target.value)} placeholder="Machine types, counts, brands..." /></div>
    </CardContent>
  </Card>
);

const CheckingForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />Checking Section</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Number of Checking Tables</Label><Input type="number" value={formData.checking_tables_count || 0} onChange={(e) => onChange('checking_tables_count', parseInt(e.target.value) || 0)} /></div>
      <div><Label>Checking Table Size</Label><Input value={formData.checking_table_size || ''} onChange={(e) => onChange('checking_table_size', e.target.value)} /></div>
      <div><Label>Checking Staff Count</Label><Input type="number" value={formData.checking_staff || 0} onChange={(e) => onChange('checking_staff', parseInt(e.target.value) || 0)} /></div>
      <div className="col-span-2"><Label>Checking Notes</Label><Textarea value={formData.checking_notes || ''} onChange={(e) => onChange('checking_notes', e.target.value)} /></div>
    </CardContent>
  </Card>
);

const IroningForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" />Ironing Section</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Number of Ironing Tables</Label><Input type="number" value={formData.ironing_tables_count || 0} onChange={(e) => onChange('ironing_tables_count', parseInt(e.target.value) || 0)} /></div>
      <div><Label>Steam Iron Count</Label><Input type="number" value={formData.steam_iron_count || 0} onChange={(e) => onChange('steam_iron_count', parseInt(e.target.value) || 0)} /></div>
      <div className="flex items-center gap-2"><Switch checked={formData.vacuum_table_available || false} onCheckedChange={(v) => onChange('vacuum_table_available', v)} /><Label>Vacuum Table Available</Label></div>
      <div><Label>Ironing Staff Count</Label><Input type="number" value={formData.ironing_staff || 0} onChange={(e) => onChange('ironing_staff', parseInt(e.target.value) || 0)} /></div>
      <div className="col-span-2"><Label>Ironing Notes</Label><Textarea value={formData.ironing_notes || ''} onChange={(e) => onChange('ironing_notes', e.target.value)} /></div>
    </CardContent>
  </Card>
);

const PackingForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Packing Section</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Number of Packing Tables</Label><Input type="number" value={formData.packing_tables_count || 0} onChange={(e) => onChange('packing_tables_count', parseInt(e.target.value) || 0)} /></div>
      <div><Label>Packing Staff Count</Label><Input type="number" value={formData.packing_staff || 0} onChange={(e) => onChange('packing_staff', parseInt(e.target.value) || 0)} /></div>
      <div className="flex items-center gap-2"><Switch checked={formData.storage_racks_available || false} onCheckedChange={(v) => onChange('storage_racks_available', v)} /><Label>Storage Racks Available</Label></div>
      <div className="flex items-center gap-2"><Switch checked={formData.polybag_sealing_available || false} onCheckedChange={(v) => onChange('polybag_sealing_available', v)} /><Label>Polybag Sealing Available</Label></div>
      <div className="flex items-center gap-2"><Switch checked={formData.tagging_barcode_support || false} onCheckedChange={(v) => onChange('tagging_barcode_support', v)} /><Label>Tagging/Barcode Support</Label></div>
      <div className="col-span-2"><Label>Packing Notes</Label><Textarea value={formData.packing_notes || ''} onChange={(e) => onChange('packing_notes', e.target.value)} /></div>
    </CardContent>
  </Card>
);

const StaffForm = ({ formData, onChange }: ProfileFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Staff & General</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><Label>Total Employees</Label><Input type="number" value={formData.total_employees || 0} onChange={(e) => onChange('total_employees', parseInt(e.target.value) || 0)} /></div>
      <div className="col-span-2"><Label>Staff Notes</Label><Textarea value={formData.staff_notes || ''} onChange={(e) => onChange('staff_notes', e.target.value)} /></div>
      <div className="col-span-2"><Label>General Remarks</Label><Textarea value={formData.general_remarks || ''} onChange={(e) => onChange('general_remarks', e.target.value)} rows={4} /></div>
    </CardContent>
  </Card>
);
