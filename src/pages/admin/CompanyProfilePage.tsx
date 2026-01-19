import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Save, Building2, Users, Scissors, Settings2, Package, Zap, FileText,
  Eye, Edit3, Download, Phone, Mail, Globe, MapPin, Calendar, CheckCircle2,
  XCircle, Factory, Gauge, Flame
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '@/assets/logo.png';

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

const StatusBadge = ({ available, label }: { available: boolean | null; label: string }) => (
  <div className="flex items-center gap-2">
    {available ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    )}
    <span className={available ? 'text-green-700 font-medium' : 'text-muted-foreground'}>{label}</span>
  </div>
);

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

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

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.company_name || 'Company'}_Infrastructure_Profile.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const getTotalTables = () => {
    return (profile.cutting_tables_count || 0) + 
           (profile.fabric_inspection_tables_count || 0) + 
           (profile.checking_tables_count || 0) + 
           (profile.ironing_tables_count || 0) + 
           (profile.packing_tables_count || 0);
  };

  const getTotalStaff = () => {
    return (profile.cutting_staff || 0) + 
           (profile.stitching_staff || 0) + 
           (profile.checking_staff || 0) + 
           (profile.ironing_staff || 0) + 
           (profile.packing_staff || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background sticky top-0 z-10 py-4 border-b">
          <Button variant="outline" onClick={() => setIsPreviewMode(false)} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button onClick={downloadPDF} disabled={downloading} className="gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800">
            <Download className="h-4 w-4" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>

        <div ref={previewRef} className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <img src={logo} alt="Logo" className="h-20 w-auto" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{profile.company_name || 'Company Name'}</h1>
                  {profile.brand_name && <p className="text-amber-400 font-medium text-lg mt-1">{profile.brand_name}</p>}
                  <p className="text-slate-300 mt-2">Manufacturing Infrastructure Profile</p>
                </div>
              </div>
              <div className="text-right text-sm text-slate-300">
                <p className="flex items-center justify-end gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                {profile.gst_number && <p className="mt-1 font-mono text-xs">GST: {profile.gst_number}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-white text-sm">
              {profile.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{profile.phone}</span></div>}
              {profile.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{profile.email}</span></div>}
              {profile.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><span>{profile.website}</span></div>}
              {(profile.city || profile.state) && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</span></div>}
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{profile.total_employees || getTotalStaff() || '-'}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Total Staff</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><Factory className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{getTotalTables() || '-'}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Work Tables</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg"><Gauge className="h-5 w-5 text-amber-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{profile.daily_production_capacity || '-'}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Daily Capacity</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><Flame className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{profile.steam_iron_count || '-'}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Steam Irons</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {profile.address && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" />Full Address</h3>
                <p className="text-slate-600">{profile.address}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2"><Scissors className="h-4 w-4" />Cutting Department</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Tables:</span><span className="ml-2 font-medium">{profile.cutting_tables_count || '-'}</span></div>
                    <div><span className="text-slate-500">Size:</span><span className="ml-2 font-medium">{profile.cutting_table_size || '-'}</span></div>
                    <div><span className="text-slate-500">Staff:</span><span className="ml-2 font-medium">{profile.cutting_staff || '-'}</span></div>
                    <div><span className="text-slate-500">Inspection:</span><span className="ml-2 font-medium">{profile.fabric_inspection_tables_count || '-'}</span></div>
                  </div>
                  {profile.cutting_notes && <p className="text-xs text-slate-500 italic border-t pt-2 mt-2">{profile.cutting_notes}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2"><Settings2 className="h-4 w-4" />Stitching Department</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Staff:</span><span className="ml-2 font-medium">{profile.stitching_staff || '-'}</span></div>
                  </div>
                  {profile.stitching_notes && <p className="text-xs text-slate-500 italic border-t pt-2 mt-2">{profile.stitching_notes}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2"><FileText className="h-4 w-4" />Quality Checking</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Tables:</span><span className="ml-2 font-medium">{profile.checking_tables_count || '-'}</span></div>
                    <div><span className="text-slate-500">Size:</span><span className="ml-2 font-medium">{profile.checking_table_size || '-'}</span></div>
                    <div><span className="text-slate-500">Staff:</span><span className="ml-2 font-medium">{profile.checking_staff || '-'}</span></div>
                  </div>
                  {profile.checking_notes && <p className="text-xs text-slate-500 italic border-t pt-2 mt-2">{profile.checking_notes}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2"><Flame className="h-4 w-4" />Ironing & Finishing</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Tables:</span><span className="ml-2 font-medium">{profile.ironing_tables_count || '-'}</span></div>
                    <div><span className="text-slate-500">Staff:</span><span className="ml-2 font-medium">{profile.ironing_staff || '-'}</span></div>
                    <div><span className="text-slate-500">Steam Irons:</span><span className="ml-2 font-medium">{profile.steam_iron_count || '-'}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <StatusBadge available={profile.vacuum_table_available} label="Vacuum Table" />
                    <StatusBadge available={profile.boiler_available} label="Boiler" />
                  </div>
                  {profile.ironing_notes && <p className="text-xs text-slate-500 italic border-t pt-2 mt-2">{profile.ironing_notes}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2"><Package className="h-4 w-4" />Packing Department</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Tables:</span><span className="ml-2 font-medium">{profile.packing_tables_count || '-'}</span></div>
                    <div><span className="text-slate-500">Staff:</span><span className="ml-2 font-medium">{profile.packing_staff || '-'}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <StatusBadge available={profile.polybag_sealing_available} label="Polybag Sealing" />
                    <StatusBadge available={profile.tagging_barcode_support} label="Tagging/Barcode" />
                    <StatusBadge available={profile.storage_racks_available} label="Storage Racks" />
                  </div>
                  {profile.packing_notes && <p className="text-xs text-slate-500 italic border-t pt-2 mt-2">{profile.packing_notes}</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2"><Zap className="h-4 w-4" />Utilities & Power</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-sm">
                    <span className="text-slate-500">Power Connection:</span>
                    <span className="ml-2 font-medium">{profile.power_connection_type || '-'}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <StatusBadge available={profile.generator_available} label={`Generator ${profile.generator_capacity ? `(${profile.generator_capacity})` : ''}`} />
                    <StatusBadge available={profile.compressor_available} label={`Compressor ${profile.compressor_capacity ? `(${profile.compressor_capacity})` : ''}`} />
                  </div>
                </div>
              </div>
            </div>

            {profile.general_remarks && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">General Remarks</h3>
                <p className="text-amber-900 text-sm">{profile.general_remarks}</p>
              </div>
            )}

            {profile.staff_notes && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Staff Notes</h3>
                <p className="text-blue-900 text-sm">{profile.staff_notes}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-100 px-8 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <p>Generated by Feather Fashions Dashboard</p>
              <p>© {new Date().getFullYear()} {profile.company_name || 'Company'} - All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(true)} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveProfile} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="basic" className="gap-1"><Building2 className="h-4 w-4 hidden sm:block" />Basic</TabsTrigger>
          <TabsTrigger value="cutting" className="gap-1"><Scissors className="h-4 w-4 hidden sm:block" />Cutting</TabsTrigger>
          <TabsTrigger value="stitching" className="gap-1"><Settings2 className="h-4 w-4 hidden sm:block" />Stitching</TabsTrigger>
          <TabsTrigger value="checking" className="gap-1"><FileText className="h-4 w-4 hidden sm:block" />Checking</TabsTrigger>
          <TabsTrigger value="ironing" className="gap-1"><Zap className="h-4 w-4 hidden sm:block" />Ironing</TabsTrigger>
          <TabsTrigger value="packing" className="gap-1"><Package className="h-4 w-4 hidden sm:block" />Packing</TabsTrigger>
          <TabsTrigger value="staff" className="gap-1"><Users className="h-4 w-4 hidden sm:block" />Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader><CardTitle>Basic Company Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Company Name *</Label><Input value={profile.company_name} onChange={(e) => updateField('company_name', e.target.value)} placeholder="Enter company name" /></div>
              <div className="space-y-2"><Label>Brand Name</Label><Input value={profile.brand_name || ''} onChange={(e) => updateField('brand_name', e.target.value)} placeholder="Enter brand name" /></div>
              <div className="space-y-2"><Label>Contact Person</Label><Input value={profile.contact_person || ''} onChange={(e) => updateField('contact_person', e.target.value)} placeholder="Enter contact person" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="Enter phone" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={profile.email || ''} onChange={(e) => updateField('email', e.target.value)} placeholder="Enter email" /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={profile.website || ''} onChange={(e) => updateField('website', e.target.value)} placeholder="Enter website" /></div>
              <div className="space-y-2"><Label>GST Number</Label><Input value={profile.gst_number || ''} onChange={(e) => updateField('gst_number', e.target.value)} placeholder="Enter GST" /></div>
              <div className="space-y-2"><Label>City</Label><Input value={profile.city || ''} onChange={(e) => updateField('city', e.target.value)} placeholder="Enter city" /></div>
              <div className="space-y-2"><Label>State</Label><Input value={profile.state || ''} onChange={(e) => updateField('state', e.target.value)} placeholder="Enter state" /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={profile.country || ''} onChange={(e) => updateField('country', e.target.value)} placeholder="Enter country" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea value={profile.address || ''} onChange={(e) => updateField('address', e.target.value)} placeholder="Enter full address" rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cutting">
          <Card>
            <CardHeader><CardTitle>Cutting Department</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Cutting Tables Count</Label><Input type="number" value={profile.cutting_tables_count || ''} onChange={(e) => updateField('cutting_tables_count', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of tables" /></div>
              <div className="space-y-2"><Label>Cutting Table Size</Label><Input value={profile.cutting_table_size || ''} onChange={(e) => updateField('cutting_table_size', e.target.value)} placeholder="e.g., 12ft x 4ft" /></div>
              <div className="space-y-2"><Label>Cutting Staff Count</Label><Input type="number" value={profile.cutting_staff || ''} onChange={(e) => updateField('cutting_staff', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of staff" /></div>
              <div className="space-y-2"><Label>Fabric Inspection Tables</Label><Input type="number" value={profile.fabric_inspection_tables_count || ''} onChange={(e) => updateField('fabric_inspection_tables_count', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of tables" /></div>
              <div className="space-y-2"><Label>Fabric Inspection Table Size</Label><Input value={profile.fabric_inspection_table_size || ''} onChange={(e) => updateField('fabric_inspection_table_size', e.target.value)} placeholder="e.g., 8ft x 4ft" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Cutting Notes</Label><Textarea value={profile.cutting_notes || ''} onChange={(e) => updateField('cutting_notes', e.target.value)} placeholder="Additional notes" rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stitching">
          <Card>
            <CardHeader><CardTitle>Stitching Department</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Stitching Staff Count</Label><Input type="number" value={profile.stitching_staff || ''} onChange={(e) => updateField('stitching_staff', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of staff" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Stitching Notes</Label><Textarea value={profile.stitching_notes || ''} onChange={(e) => updateField('stitching_notes', e.target.value)} placeholder="Details about machines, capacity, etc." rows={4} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checking">
          <Card>
            <CardHeader><CardTitle>Quality Checking Department</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Checking Tables Count</Label><Input type="number" value={profile.checking_tables_count || ''} onChange={(e) => updateField('checking_tables_count', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of tables" /></div>
              <div className="space-y-2"><Label>Checking Table Size</Label><Input value={profile.checking_table_size || ''} onChange={(e) => updateField('checking_table_size', e.target.value)} placeholder="e.g., 6ft x 3ft" /></div>
              <div className="space-y-2"><Label>Checking Staff Count</Label><Input type="number" value={profile.checking_staff || ''} onChange={(e) => updateField('checking_staff', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of staff" /></div>
              <div className="space-y-2 md:col-span-2"><Label>Checking Notes</Label><Textarea value={profile.checking_notes || ''} onChange={(e) => updateField('checking_notes', e.target.value)} placeholder="Quality control notes" rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ironing">
          <Card>
            <CardHeader><CardTitle>Ironing & Finishing Department</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Ironing Tables Count</Label><Input type="number" value={profile.ironing_tables_count || ''} onChange={(e) => updateField('ironing_tables_count', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of tables" /></div>
              <div className="space-y-2"><Label>Ironing Staff Count</Label><Input type="number" value={profile.ironing_staff || ''} onChange={(e) => updateField('ironing_staff', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of staff" /></div>
              <div className="space-y-2"><Label>Steam Iron Count</Label><Input type="number" value={profile.steam_iron_count || ''} onChange={(e) => updateField('steam_iron_count', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of steam irons" /></div>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2"><Switch checked={profile.vacuum_table_available || false} onCheckedChange={(checked) => updateField('vacuum_table_available', checked)} /><Label>Vacuum Table</Label></div>
                <div className="flex items-center gap-2"><Switch checked={profile.boiler_available || false} onCheckedChange={(checked) => updateField('boiler_available', checked)} /><Label>Boiler</Label></div>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Ironing Notes</Label><Textarea value={profile.ironing_notes || ''} onChange={(e) => updateField('ironing_notes', e.target.value)} placeholder="Additional notes" rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packing">
          <Card>
            <CardHeader><CardTitle>Packing Department</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Packing Tables Count</Label><Input type="number" value={profile.packing_tables_count || ''} onChange={(e) => updateField('packing_tables_count', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of tables" /></div>
              <div className="space-y-2"><Label>Packing Staff Count</Label><Input type="number" value={profile.packing_staff || ''} onChange={(e) => updateField('packing_staff', e.target.value ? parseInt(e.target.value) : null)} placeholder="Number of staff" /></div>
              <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg md:col-span-2">
                <div className="flex items-center gap-2"><Switch checked={profile.polybag_sealing_available || false} onCheckedChange={(checked) => updateField('polybag_sealing_available', checked)} /><Label>Polybag Sealing</Label></div>
                <div className="flex items-center gap-2"><Switch checked={profile.tagging_barcode_support || false} onCheckedChange={(checked) => updateField('tagging_barcode_support', checked)} /><Label>Tagging/Barcode</Label></div>
                <div className="flex items-center gap-2"><Switch checked={profile.storage_racks_available || false} onCheckedChange={(checked) => updateField('storage_racks_available', checked)} /><Label>Storage Racks</Label></div>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Packing Notes</Label><Textarea value={profile.packing_notes || ''} onChange={(e) => updateField('packing_notes', e.target.value)} placeholder="Additional notes" rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Staff & Capacity</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2"><Label>Total Employees</Label><Input type="number" value={profile.total_employees || ''} onChange={(e) => updateField('total_employees', e.target.value ? parseInt(e.target.value) : null)} placeholder="Total employee count" /></div>
                <div className="space-y-2"><Label>Daily Production Capacity</Label><Input value={profile.daily_production_capacity || ''} onChange={(e) => updateField('daily_production_capacity', e.target.value)} placeholder="e.g., 1000 pieces/day" /></div>
                <div className="space-y-2"><Label>Staff Notes</Label><Textarea value={profile.staff_notes || ''} onChange={(e) => updateField('staff_notes', e.target.value)} placeholder="Additional staff information" rows={3} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Utilities</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2"><Label>Power Connection Type</Label><Input value={profile.power_connection_type || ''} onChange={(e) => updateField('power_connection_type', e.target.value)} placeholder="e.g., 3-Phase" /></div>
                <div className="flex items-center gap-4"><Switch checked={profile.generator_available || false} onCheckedChange={(checked) => updateField('generator_available', checked)} /><Label>Generator</Label></div>
                {profile.generator_available && <div className="space-y-2"><Label>Generator Capacity</Label><Input value={profile.generator_capacity || ''} onChange={(e) => updateField('generator_capacity', e.target.value)} placeholder="e.g., 50 KVA" /></div>}
                <div className="flex items-center gap-4"><Switch checked={profile.compressor_available || false} onCheckedChange={(checked) => updateField('compressor_available', checked)} /><Label>Compressor</Label></div>
                {profile.compressor_available && <div className="space-y-2"><Label>Compressor Capacity</Label><Input value={profile.compressor_capacity || ''} onChange={(e) => updateField('compressor_capacity', e.target.value)} placeholder="e.g., 5 HP" /></div>}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>General Remarks</CardTitle></CardHeader>
              <CardContent><Textarea value={profile.general_remarks || ''} onChange={(e) => updateField('general_remarks', e.target.value)} placeholder="Any additional remarks about the facility..." rows={4} /></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfilePage;
