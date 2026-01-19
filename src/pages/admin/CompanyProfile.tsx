import { useState, useEffect, useRef } from 'react';
import { useCompanyProfile, defaultCompanyProfile, CompanyProfileInput, StitchingMachine, defaultMeasurementTools } from '@/hooks/useCompanyProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Scissors, Settings2, CheckCircle2, Flame, Zap, Package, Users, Save, Eye, Download, Edit, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import logoImage from '@/assets/logo.png';

const MACHINE_TYPES = ['Overlock', 'Flatlock', 'Single Needle', 'Trimmer', 'Kansai', 'Button Hole', 'Button Attach', 'Bar Tack', 'Feed of Arm', 'Zigzag', 'Other'];

export default function CompanyProfile() {
  const { profile, isLoading, saveProfile } = useCompanyProfile();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<CompanyProfileInput>(defaultCompanyProfile);
  const [activeTab, setActiveTab] = useState('basic');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({ ...defaultCompanyProfile, ...profile });
    }
  }, [profile]);

  const updateField = <K extends keyof CompanyProfileInput>(field: K, value: CompanyProfileInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMachine = () => {
    const newMachine: StitchingMachine = { id: crypto.randomUUID(), type: '', count: 1, brand: '', notes: '' };
    updateField('stitching_machines', [...(formData.stitching_machines || []), newMachine]);
  };

  const updateMachine = (id: string, updates: Partial<StitchingMachine>) => {
    const machines = (formData.stitching_machines || []).map(m => m.id === id ? { ...m, ...updates } : m);
    updateField('stitching_machines', machines);
  };

  const removeMachine = (id: string) => {
    updateField('stitching_machines', (formData.stitching_machines || []).filter(m => m.id !== id));
  };

  const totalMachines = (formData.stitching_machines || []).reduce((sum, m) => sum + (m.count || 0), 0);

  const handleSave = () => {
    if (!formData.company_name) {
      toast.error('Company name is required');
      return;
    }
    saveProfile.mutate(formData);
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PDF...');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      pdf.save(`${formData.company_name || 'company'}-profile.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Company Profile Preview</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
            <Button onClick={handleExportPDF}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
          </div>
        </div>
        <div ref={previewRef} className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-2xl p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6">
            <div className="flex items-center justify-between">
              <img src={logoImage} alt="Logo" className="h-16 w-16 object-contain bg-white rounded-lg p-1" />
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold tracking-wide">FEATHER FASHIONS GARMENTS</h1>
                <p className="text-amber-400 text-sm mt-1 font-medium">Company Infrastructure Profile</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-stone-400">Date</p>
                <p className="font-medium">{format(new Date(), 'dd MMM yyyy')}</p>
                {formData.company_code && <><p className="text-stone-400 mt-2">Code</p><p className="font-medium">{formData.company_code}</p></>}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-800 mb-3"><Building2 className="h-5 w-5" />Company Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{formData.company_name}</span></div>
                <div><span className="text-muted-foreground">Brand:</span> <span className="font-medium">{formData.brand_name}</span></div>
                <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{formData.contact_person}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{formData.address}, {formData.city}, {formData.state}, {formData.country}</span></div>
              </div>
            </div>

            {/* Cutting */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-800 mb-3"><Scissors className="h-5 w-5" />Cutting Section</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Cutting Tables:</span> <span className="font-medium">{formData.cutting_tables_count} ({formData.cutting_table_size})</span></div>
                <div><span className="text-muted-foreground">Fabric Inspection:</span> <span className="font-medium">{formData.fabric_inspection_tables_count} tables</span></div>
              </div>
            </div>

            {/* Stitching */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-800 mb-3"><Settings2 className="h-5 w-5" />Stitching Machines ({totalMachines} total)</h2>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {(formData.stitching_machines || []).map(m => (
                  <div key={m.id} className="bg-stone-50 p-2 rounded"><span className="font-medium">{m.type}:</span> {m.count}</div>
                ))}
              </div>
            </div>

            {/* Staff */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-800 mb-3"><Users className="h-5 w-5" />Staff & Capacity</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Total:</span> <span className="font-medium">{formData.total_employees}</span></div>
                <div><span className="text-muted-foreground">Cutting:</span> <span className="font-medium">{formData.cutting_staff}</span></div>
                <div><span className="text-muted-foreground">Stitching:</span> <span className="font-medium">{formData.stitching_staff}</span></div>
                <div><span className="text-muted-foreground">Checking:</span> <span className="font-medium">{formData.checking_staff}</span></div>
                <div><span className="text-muted-foreground">Ironing:</span> <span className="font-medium">{formData.ironing_staff}</span></div>
                <div><span className="text-muted-foreground">Packing:</span> <span className="font-medium">{formData.packing_staff}</span></div>
              </div>
              <div className="mt-2 text-sm"><span className="text-muted-foreground">Daily Capacity:</span> <span className="font-medium">{formData.daily_production_capacity}</span></div>
            </div>

            {formData.general_remarks && (
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-800 mb-3"><FileText className="h-5 w-5" />Remarks</h2>
                <p className="text-sm">{formData.general_remarks}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-stone-100 p-4 text-center text-xs text-muted-foreground mt-auto">
            <p>Generated by Feather Fashions Dashboard • {format(new Date(), 'dd MMM yyyy HH:mm')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">Company Infrastructure Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your company's manufacturing infrastructure details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(true)}><Eye className="h-4 w-4 mr-2" />Preview</Button>
          <Button onClick={handleSave} disabled={saveProfile.isPending}><Save className="h-4 w-4 mr-2" />{saveProfile.isPending ? 'Saving...' : 'Save Profile'}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-lg"><Scissors className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Cutting Tables</p><p className="text-2xl font-bold">{formData.cutting_tables_count || 0}</p></div></div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg"><Settings2 className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Total Machines</p><p className="text-2xl font-bold">{totalMachines}</p></div></div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-lg"><Users className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Total Staff</p><p className="text-2xl font-bold">{formData.total_employees || 0}</p></div></div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-lg"><Package className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Daily Capacity</p><p className="text-lg font-bold">{formData.daily_production_capacity || '0'}</p></div></div></CardContent>
        </Card>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader><TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
            <TabsTrigger value="basic"><Building2 className="h-4 w-4 mr-1 hidden md:inline" />Basic</TabsTrigger>
            <TabsTrigger value="cutting"><Scissors className="h-4 w-4 mr-1 hidden md:inline" />Cutting</TabsTrigger>
            <TabsTrigger value="stitching"><Settings2 className="h-4 w-4 mr-1 hidden md:inline" />Stitching</TabsTrigger>
            <TabsTrigger value="checking"><CheckCircle2 className="h-4 w-4 mr-1 hidden md:inline" />Checking</TabsTrigger>
            <TabsTrigger value="ironing"><Flame className="h-4 w-4 mr-1 hidden md:inline" />Ironing</TabsTrigger>
            <TabsTrigger value="utilities"><Zap className="h-4 w-4 mr-1 hidden md:inline" />Utilities</TabsTrigger>
            <TabsTrigger value="packing"><Package className="h-4 w-4 mr-1 hidden md:inline" />Packing</TabsTrigger>
            <TabsTrigger value="staff"><Users className="h-4 w-4 mr-1 hidden md:inline" />Staff</TabsTrigger>
          </TabsList></CardHeader>

          <CardContent className="space-y-6">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Company Name *</Label><Input value={formData.company_name} onChange={e => updateField('company_name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Brand Name</Label><Input value={formData.brand_name || ''} onChange={e => updateField('brand_name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Contact Person</Label><Input value={formData.contact_person || ''} onChange={e => updateField('contact_person', e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone || ''} onChange={e => updateField('phone', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email || ''} onChange={e => updateField('email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={formData.website || ''} onChange={e => updateField('website', e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea value={formData.address || ''} onChange={e => updateField('address', e.target.value)} rows={2} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={formData.city || ''} onChange={e => updateField('city', e.target.value)} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={formData.state || ''} onChange={e => updateField('state', e.target.value)} /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={formData.country || ''} onChange={e => updateField('country', e.target.value)} /></div>
                <div className="space-y-2"><Label>GST Number</Label><Input value={formData.gst_number || ''} onChange={e => updateField('gst_number', e.target.value)} /></div>
                <div className="space-y-2"><Label>Company Code</Label><Input value={formData.company_code || ''} onChange={e => updateField('company_code', e.target.value)} /></div>
              </div>
            </TabsContent>

            <TabsContent value="cutting" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Cutting Tables Count</Label><Input type="number" value={formData.cutting_tables_count || 0} onChange={e => updateField('cutting_tables_count', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Cutting Table Size</Label><Input placeholder="e.g., 6ft x 3ft" value={formData.cutting_table_size || ''} onChange={e => updateField('cutting_table_size', e.target.value)} /></div>
                <div className="space-y-2"><Label>Fabric Inspection Tables</Label><Input type="number" value={formData.fabric_inspection_tables_count || 0} onChange={e => updateField('fabric_inspection_tables_count', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Inspection Table Size</Label><Input value={formData.fabric_inspection_table_size || ''} onChange={e => updateField('fabric_inspection_table_size', e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={formData.cutting_notes || ''} onChange={e => updateField('cutting_notes', e.target.value)} rows={3} /></div>
              </div>
            </TabsContent>

            <TabsContent value="stitching" className="space-y-4 mt-0">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium">Stitching Machines</h3><Button onClick={addMachine} size="sm"><Plus className="h-4 w-4 mr-1" />Add Machine</Button></div>
              <div className="space-y-3">
                {(formData.stitching_machines || []).map((machine, idx) => (
                  <Card key={machine.id} className="p-4">
                    <div className="grid gap-3 md:grid-cols-4 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Machine Type</Label>
                        <Select value={machine.type} onValueChange={v => updateMachine(machine.id, { type: v })}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>{MACHINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">Count</Label><Input type="number" min="1" value={machine.count} onChange={e => updateMachine(machine.id, { count: parseInt(e.target.value) || 1 })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Brand</Label><Input value={machine.brand || ''} onChange={e => updateMachine(machine.id, { brand: e.target.value })} /></div>
                      <Button variant="destructive" size="sm" onClick={() => removeMachine(machine.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
              {(formData.stitching_machines || []).length > 0 && <div className="flex justify-end"><Badge variant="secondary" className="text-lg px-4 py-2">Total: {totalMachines} machines</Badge></div>}
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.stitching_notes || ''} onChange={e => updateField('stitching_notes', e.target.value)} rows={3} /></div>
            </TabsContent>

            <TabsContent value="checking" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Checking Tables Count</Label><Input type="number" value={formData.checking_tables_count || 0} onChange={e => updateField('checking_tables_count', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Checking Table Size</Label><Input value={formData.checking_table_size || ''} onChange={e => updateField('checking_table_size', e.target.value)} /></div>
              </div>
              <div className="space-y-3">
                <Label>Measurement Tools Available</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['tape', 'gsm_cutter', 'shade_card', 'needle_detector'] as const).map(tool => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox checked={formData.measurement_tools?.[tool] || false} onCheckedChange={c => updateField('measurement_tools', { ...(formData.measurement_tools || defaultMeasurementTools), [tool]: !!c })} />
                      <Label className="capitalize">{tool.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.checking_notes || ''} onChange={e => updateField('checking_notes', e.target.value)} rows={3} /></div>
            </TabsContent>

            <TabsContent value="ironing" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Ironing Tables Count</Label><Input type="number" value={formData.ironing_tables_count || 0} onChange={e => updateField('ironing_tables_count', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Steam Iron Count</Label><Input type="number" value={formData.steam_iron_count || 0} onChange={e => updateField('steam_iron_count', parseInt(e.target.value) || 0)} /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Vacuum Table Available</Label><Switch checked={formData.vacuum_table_available || false} onCheckedChange={c => updateField('vacuum_table_available', c)} /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Boiler Available</Label><Switch checked={formData.boiler_available || false} onCheckedChange={c => updateField('boiler_available', c)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.ironing_notes || ''} onChange={e => updateField('ironing_notes', e.target.value)} rows={3} /></div>
            </TabsContent>

            <TabsContent value="utilities" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Generator Available</Label><Switch checked={formData.generator_available || false} onCheckedChange={c => updateField('generator_available', c)} /></div>
                <div className="space-y-2"><Label>Generator Capacity</Label><Input value={formData.generator_capacity || ''} onChange={e => updateField('generator_capacity', e.target.value)} disabled={!formData.generator_available} /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Compressor Available</Label><Switch checked={formData.compressor_available || false} onCheckedChange={c => updateField('compressor_available', c)} /></div>
                <div className="space-y-2"><Label>Compressor Capacity</Label><Input value={formData.compressor_capacity || ''} onChange={e => updateField('compressor_capacity', e.target.value)} disabled={!formData.compressor_available} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Power Connection Type</Label><Input value={formData.power_connection_type || ''} onChange={e => updateField('power_connection_type', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.utilities_notes || ''} onChange={e => updateField('utilities_notes', e.target.value)} rows={3} /></div>
            </TabsContent>

            <TabsContent value="packing" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Packing Tables Count</Label><Input type="number" value={formData.packing_tables_count || 0} onChange={e => updateField('packing_tables_count', parseInt(e.target.value) || 0)} /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Polybag Sealing Machine</Label><Switch checked={formData.polybag_sealing_available || false} onCheckedChange={c => updateField('polybag_sealing_available', c)} /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Tagging/Barcode Support</Label><Switch checked={formData.tagging_barcode_support || false} onCheckedChange={c => updateField('tagging_barcode_support', c)} /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg"><Label>Storage Racks Available</Label><Switch checked={formData.storage_racks_available || false} onCheckedChange={c => updateField('storage_racks_available', c)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.packing_notes || ''} onChange={e => updateField('packing_notes', e.target.value)} rows={3} /></div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Total Employees</Label><Input type="number" value={formData.total_employees || 0} onChange={e => updateField('total_employees', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Cutting Staff</Label><Input type="number" value={formData.cutting_staff || 0} onChange={e => updateField('cutting_staff', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Stitching Staff</Label><Input type="number" value={formData.stitching_staff || 0} onChange={e => updateField('stitching_staff', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Checking Staff</Label><Input type="number" value={formData.checking_staff || 0} onChange={e => updateField('checking_staff', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Ironing Staff</Label><Input type="number" value={formData.ironing_staff || 0} onChange={e => updateField('ironing_staff', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Packing Staff</Label><Input type="number" value={formData.packing_staff || 0} onChange={e => updateField('packing_staff', parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-2 md:col-span-3"><Label>Daily Production Capacity</Label><Input placeholder="e.g., 500-1000 pieces/day" value={formData.daily_production_capacity || ''} onChange={e => updateField('daily_production_capacity', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.staff_notes || ''} onChange={e => updateField('staff_notes', e.target.value)} rows={3} /></div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />General Remarks</CardTitle><CardDescription>Additional notes about your company infrastructure</CardDescription></CardHeader>
        <CardContent><Textarea value={formData.general_remarks || ''} onChange={e => updateField('general_remarks', e.target.value)} placeholder="Enter any additional remarks..." rows={4} /></CardContent>
      </Card>
    </div>
  );
}
