import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Building2, Users, Scissors, Settings2, Package, Zap, FileText } from 'lucide-react';

interface ProfileData {
  id?: string;
  company_name: string;
  brand_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  gst_number: string | null;
  contact_person: string | null;
  total_employees: number | null;
  daily_production_capacity: string | null;
  cutting_tables_count: number | null;
  cutting_table_size: string | null;
  cutting_staff: number | null;
  cutting_notes: string | null;
  fabric_inspection_tables_count: number | null;
  fabric_inspection_table_size: string | null;
  stitching_staff: number | null;
  stitching_notes: string | null;
  checking_tables_count: number | null;
  checking_table_size: string | null;
  checking_staff: number | null;
  checking_notes: string | null;
  ironing_tables_count: number | null;
  ironing_staff: number | null;
  ironing_notes: string | null;
  steam_iron_count: number | null;
  vacuum_table_available: boolean | null;
  boiler_available: boolean | null;
  packing_tables_count: number | null;
  packing_staff: number | null;
  packing_notes: string | null;
  polybag_sealing_available: boolean | null;
  tagging_barcode_support: boolean | null;
  storage_racks_available: boolean | null;
  generator_available: boolean | null;
  generator_capacity: string | null;
  compressor_available: boolean | null;
  compressor_capacity: string | null;
  power_connection_type: string | null;
  staff_notes: string | null;
  general_remarks: string | null;
}

const defaultProfile: ProfileData = {
  company_name: '',
  brand_name: null,
  address: null,
  city: null,
  state: null,
  country: 'India',
  phone: null,
  email: null,
  website: null,
  gst_number: null,
  contact_person: null,
  total_employees: null,
  daily_production_capacity: null,
  cutting_tables_count: null,
  cutting_table_size: null,
  cutting_staff: null,
  cutting_notes: null,
  fabric_inspection_tables_count: null,
  fabric_inspection_table_size: null,
  stitching_staff: null,
  stitching_notes: null,
  checking_tables_count: null,
  checking_table_size: null,
  checking_staff: null,
  checking_notes: null,
  ironing_tables_count: null,
  ironing_staff: null,
  ironing_notes: null,
  steam_iron_count: null,
  vacuum_table_available: false,
  boiler_available: false,
  packing_tables_count: null,
  packing_staff: null,
  packing_notes: null,
  polybag_sealing_available: false,
  tagging_barcode_support: false,
  storage_racks_available: false,
  generator_available: false,
  generator_capacity: null,
  compressor_available: false,
  compressor_capacity: null,
  power_connection_type: null,
  staff_notes: null,
  general_remarks: null,
};

const CompanyProfile = () => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data as ProfileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (profile.id) {
        const { error } = await supabase
          .from('company_profiles')
          .update(profile)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_profiles')
          .insert([profile]);
        if (error) throw error;
      }
      toast.success('Profile saved successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string | number | boolean | null) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Company Infrastructure Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your manufacturing facility details</p>
          </div>
        </div>
        <Button onClick={saveProfile} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="basic" className="gap-1">
            <Building2 className="h-4 w-4 hidden sm:block" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="cutting" className="gap-1">
            <Scissors className="h-4 w-4 hidden sm:block" />
            Cutting
          </TabsTrigger>
          <TabsTrigger value="stitching" className="gap-1">
            <Settings2 className="h-4 w-4 hidden sm:block" />
            Stitching
          </TabsTrigger>
          <TabsTrigger value="checking" className="gap-1">
            <FileText className="h-4 w-4 hidden sm:block" />
            Checking
          </TabsTrigger>
          <TabsTrigger value="ironing" className="gap-1">
            <Zap className="h-4 w-4 hidden sm:block" />
            Ironing
          </TabsTrigger>
          <TabsTrigger value="packing" className="gap-1">
            <Package className="h-4 w-4 hidden sm:block" />
            Packing
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-1">
            <Users className="h-4 w-4 hidden sm:block" />
            Staff
          </TabsTrigger>
        </TabsList>

        {/* Basic Details */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Company Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={profile.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input
                  value={profile.brand_name || ''}
                  onChange={(e) => updateField('brand_name', e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={profile.contact_person || ''}
                  onChange={(e) => updateField('contact_person', e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={profile.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="Enter website URL"
                />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  value={profile.gst_number || ''}
                  onChange={(e) => updateField('gst_number', e.target.value)}
                  placeholder="Enter GST number"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={profile.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={profile.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={profile.country || ''}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={profile.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cutting Section */}
        <TabsContent value="cutting">
          <Card>
            <CardHeader>
              <CardTitle>Cutting Department</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cutting Tables Count</Label>
                <Input
                  type="number"
                  value={profile.cutting_tables_count || ''}
                  onChange={(e) => updateField('cutting_tables_count', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of tables"
                />
              </div>
              <div className="space-y-2">
                <Label>Cutting Table Size</Label>
                <Input
                  value={profile.cutting_table_size || ''}
                  onChange={(e) => updateField('cutting_table_size', e.target.value)}
                  placeholder="e.g., 12ft x 4ft"
                />
              </div>
              <div className="space-y-2">
                <Label>Cutting Staff Count</Label>
                <Input
                  type="number"
                  value={profile.cutting_staff || ''}
                  onChange={(e) => updateField('cutting_staff', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of staff"
                />
              </div>
              <div className="space-y-2">
                <Label>Fabric Inspection Tables</Label>
                <Input
                  type="number"
                  value={profile.fabric_inspection_tables_count || ''}
                  onChange={(e) => updateField('fabric_inspection_tables_count', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of inspection tables"
                />
              </div>
              <div className="space-y-2">
                <Label>Fabric Inspection Table Size</Label>
                <Input
                  value={profile.fabric_inspection_table_size || ''}
                  onChange={(e) => updateField('fabric_inspection_table_size', e.target.value)}
                  placeholder="e.g., 8ft x 4ft"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Cutting Notes</Label>
                <Textarea
                  value={profile.cutting_notes || ''}
                  onChange={(e) => updateField('cutting_notes', e.target.value)}
                  placeholder="Additional notes about cutting department"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stitching Section */}
        <TabsContent value="stitching">
          <Card>
            <CardHeader>
              <CardTitle>Stitching Department</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Stitching Staff Count</Label>
                <Input
                  type="number"
                  value={profile.stitching_staff || ''}
                  onChange={(e) => updateField('stitching_staff', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of staff"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Stitching Notes</Label>
                <Textarea
                  value={profile.stitching_notes || ''}
                  onChange={(e) => updateField('stitching_notes', e.target.value)}
                  placeholder="Details about machines, capacity, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checking Section */}
        <TabsContent value="checking">
          <Card>
            <CardHeader>
              <CardTitle>Quality Checking Department</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Checking Tables Count</Label>
                <Input
                  type="number"
                  value={profile.checking_tables_count || ''}
                  onChange={(e) => updateField('checking_tables_count', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of tables"
                />
              </div>
              <div className="space-y-2">
                <Label>Checking Table Size</Label>
                <Input
                  value={profile.checking_table_size || ''}
                  onChange={(e) => updateField('checking_table_size', e.target.value)}
                  placeholder="e.g., 6ft x 3ft"
                />
              </div>
              <div className="space-y-2">
                <Label>Checking Staff Count</Label>
                <Input
                  type="number"
                  value={profile.checking_staff || ''}
                  onChange={(e) => updateField('checking_staff', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of staff"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Checking Notes</Label>
                <Textarea
                  value={profile.checking_notes || ''}
                  onChange={(e) => updateField('checking_notes', e.target.value)}
                  placeholder="Quality control process notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ironing Section */}
        <TabsContent value="ironing">
          <Card>
            <CardHeader>
              <CardTitle>Ironing & Finishing Department</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ironing Tables Count</Label>
                <Input
                  type="number"
                  value={profile.ironing_tables_count || ''}
                  onChange={(e) => updateField('ironing_tables_count', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of tables"
                />
              </div>
              <div className="space-y-2">
                <Label>Ironing Staff Count</Label>
                <Input
                  type="number"
                  value={profile.ironing_staff || ''}
                  onChange={(e) => updateField('ironing_staff', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of staff"
                />
              </div>
              <div className="space-y-2">
                <Label>Steam Iron Count</Label>
                <Input
                  type="number"
                  value={profile.steam_iron_count || ''}
                  onChange={(e) => updateField('steam_iron_count', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of steam irons"
                />
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.vacuum_table_available || false}
                    onCheckedChange={(checked) => updateField('vacuum_table_available', checked)}
                  />
                  <Label>Vacuum Table</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.boiler_available || false}
                    onCheckedChange={(checked) => updateField('boiler_available', checked)}
                  />
                  <Label>Boiler Available</Label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ironing Notes</Label>
                <Textarea
                  value={profile.ironing_notes || ''}
                  onChange={(e) => updateField('ironing_notes', e.target.value)}
                  placeholder="Additional notes about ironing department"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packing Section */}
        <TabsContent value="packing">
          <Card>
            <CardHeader>
              <CardTitle>Packing Department</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Packing Tables Count</Label>
                <Input
                  type="number"
                  value={profile.packing_tables_count || ''}
                  onChange={(e) => updateField('packing_tables_count', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of tables"
                />
              </div>
              <div className="space-y-2">
                <Label>Packing Staff Count</Label>
                <Input
                  type="number"
                  value={profile.packing_staff || ''}
                  onChange={(e) => updateField('packing_staff', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Number of staff"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg md:col-span-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.polybag_sealing_available || false}
                    onCheckedChange={(checked) => updateField('polybag_sealing_available', checked)}
                  />
                  <Label>Polybag Sealing</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.tagging_barcode_support || false}
                    onCheckedChange={(checked) => updateField('tagging_barcode_support', checked)}
                  />
                  <Label>Tagging/Barcode</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.storage_racks_available || false}
                    onCheckedChange={(checked) => updateField('storage_racks_available', checked)}
                  />
                  <Label>Storage Racks</Label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Packing Notes</Label>
                <Textarea
                  value={profile.packing_notes || ''}
                  onChange={(e) => updateField('packing_notes', e.target.value)}
                  placeholder="Additional notes about packing department"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff & Utilities Section */}
        <TabsContent value="staff">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Staff & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label>Total Employees</Label>
                  <Input
                    type="number"
                    value={profile.total_employees || ''}
                    onChange={(e) => updateField('total_employees', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Total employee count"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Production Capacity</Label>
                  <Input
                    value={profile.daily_production_capacity || ''}
                    onChange={(e) => updateField('daily_production_capacity', e.target.value)}
                    placeholder="e.g., 1000 pieces/day"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Staff Notes</Label>
                  <Textarea
                    value={profile.staff_notes || ''}
                    onChange={(e) => updateField('staff_notes', e.target.value)}
                    placeholder="Additional staff information"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilities</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label>Power Connection Type</Label>
                  <Input
                    value={profile.power_connection_type || ''}
                    onChange={(e) => updateField('power_connection_type', e.target.value)}
                    placeholder="e.g., 3-Phase, Industrial"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={profile.generator_available || false}
                    onCheckedChange={(checked) => updateField('generator_available', checked)}
                  />
                  <Label>Generator Available</Label>
                </div>
                {profile.generator_available && (
                  <div className="space-y-2">
                    <Label>Generator Capacity</Label>
                    <Input
                      value={profile.generator_capacity || ''}
                      onChange={(e) => updateField('generator_capacity', e.target.value)}
                      placeholder="e.g., 50 KVA"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Switch
                    checked={profile.compressor_available || false}
                    onCheckedChange={(checked) => updateField('compressor_available', checked)}
                  />
                  <Label>Compressor Available</Label>
                </div>
                {profile.compressor_available && (
                  <div className="space-y-2">
                    <Label>Compressor Capacity</Label>
                    <Input
                      value={profile.compressor_capacity || ''}
                      onChange={(e) => updateField('compressor_capacity', e.target.value)}
                      placeholder="e.g., 5 HP"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>General Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={profile.general_remarks || ''}
                  onChange={(e) => updateField('general_remarks', e.target.value)}
                  placeholder="Any additional remarks about the facility..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
