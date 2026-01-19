import { useState, useRef } from 'react';
import { useCompanyProfile, defaultCompanyProfile, CompanyProfileInput, StitchingMachine } from '@/hooks/useCompanyProfile';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  Scissors,
  Settings2,
  CheckCircle2,
  Flame,
  Zap,
  Package,
  Users,
  Save,
  Eye,
  Download,
  Edit,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import CompanyProfilePreview from '@/components/admin/company-profile/CompanyProfilePreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImage from '@/assets/logo.png';

const MACHINE_TYPES = [
  'Overlock',
  'Flatlock',
  'Single Needle',
  'Trimmer',
  'Kansai',
  'Button Hole',
  'Button Attach',
  'Bar Tack',
  'Feed of Arm',
  'Zigzag',
  'Other',
];

export default function CompanyProfile() {
  const { profile, isLoading, saveProfile } = useCompanyProfile();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<CompanyProfileInput>(defaultCompanyProfile);
  const [activeTab, setActiveTab] = useState('basic');
  const [isInitialized, setIsInitialized] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize form data when profile loads
  if (profile && !isInitialized) {
    setFormData({
      ...defaultCompanyProfile,
      ...profile,
    });
    setIsInitialized(true);
  }

  const updateField = <K extends keyof CompanyProfileInput>(field: K, value: CompanyProfileInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMachine = () => {
    const newMachine: StitchingMachine = {
      id: crypto.randomUUID(),
      type: '',
      count: 1,
      brand: '',
      notes: '',
    };
    updateField('stitching_machines', [...(formData.stitching_machines || []), newMachine]);
  };

  const updateMachine = (id: string, updates: Partial<StitchingMachine>) => {
    const machines = (formData.stitching_machines || []).map(m =>
      m.id === id ? { ...m, ...updates } : m
    );
    updateField('stitching_machines', machines);
  };

  const removeMachine = (id: string) => {
    const machines = (formData.stitching_machines || []).filter(m => m.id !== id);
    updateField('stitching_machines', machines);
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
    
    toast.loading('Generating PDF...');
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Calculate pages
      const pageHeight = pdfHeight * imgWidth / pdfWidth;
      let heightLeft = imgHeight;
      let position = 0;
      
      // First page
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeight;
      }
      
      pdf.save('Feather-Fashions-Company-Profile.pdf');
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Preview Mode</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <CompanyProfilePreview ref={previewRef} data={formData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
            Company Infrastructure Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Document your manufacturing capabilities and infrastructure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saveProfile.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Scissors className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cutting Tables</p>
                <p className="text-2xl font-bold">{formData.cutting_tables_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Settings2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Machines</p>
                <p className="text-2xl font-bold">{totalMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{formData.total_employees || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Capacity</p>
                <p className="text-2xl font-bold">{formData.daily_production_capacity || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-2">
            <ScrollArea className="w-full">
              <TabsList className="w-full justify-start gap-1 h-auto flex-wrap">
                <TabsTrigger value="basic" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Basic Details</span>
                </TabsTrigger>
                <TabsTrigger value="cutting" className="gap-2">
                  <Scissors className="h-4 w-4" />
                  <span className="hidden sm:inline">Cutting</span>
                </TabsTrigger>
                <TabsTrigger value="stitching" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Stitching</span>
                </TabsTrigger>
                <TabsTrigger value="checking" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Checking</span>
                </TabsTrigger>
                <TabsTrigger value="ironing" className="gap-2">
                  <Flame className="h-4 w-4" />
                  <span className="hidden sm:inline">Ironing</span>
                </TabsTrigger>
                <TabsTrigger value="utilities" className="gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Utilities</span>
                </TabsTrigger>
                <TabsTrigger value="packing" className="gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Packing</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Staff</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Basic Details */}
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    placeholder="Feather Fashions"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input
                    value={formData.brand_name || ''}
                    onChange={(e) => updateField('brand_name', e.target.value)}
                    placeholder="Feather Fashions Garments"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Tirupur"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="Tamil Nadu"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={formData.contact_person || ''}
                    onChange={(e) => updateField('contact_person', e.target.value)}
                    placeholder="Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 9988322555"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="hello@featherfashions.in"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="www.featherfashions.in"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input
                    value={formData.gst_number || ''}
                    onChange={(e) => updateField('gst_number', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Code</Label>
                  <Input
                    value={formData.company_code || ''}
                    onChange={(e) => updateField('company_code', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Cutting Section */}
            <TabsContent value="cutting" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Number of Cutting Tables</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.cutting_tables_count || 0}
                    onChange={(e) => updateField('cutting_tables_count', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cutting Table Size (e.g., 6ft x 3ft)</Label>
                  <Input
                    value={formData.cutting_table_size || ''}
                    onChange={(e) => updateField('cutting_table_size', e.target.value)}
                    placeholder="6ft x 3ft"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fabric Inspection Tables Count</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.fabric_inspection_tables_count || 0}
                    onChange={(e) => updateField('fabric_inspection_tables_count', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fabric Inspection Table Size</Label>
                  <Input
                    value={formData.fabric_inspection_table_size || ''}
                    onChange={(e) => updateField('fabric_inspection_table_size', e.target.value)}
                    placeholder="Size"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.cutting_notes || ''}
                  onChange={(e) => updateField('cutting_notes', e.target.value)}
                  placeholder="Additional notes about cutting section..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Stitching Section */}
            <TabsContent value="stitching" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Stitching Machines</h3>
                  <p className="text-sm text-muted-foreground">Add your machine inventory</p>
                </div>
                <Button onClick={addMachine} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Machine
                </Button>
              </div>

              {(formData.stitching_machines || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Settings2 className="h-12 w-12 mx-auto opacity-30 mb-2" />
                  <p>No machines added yet</p>
                  <Button onClick={addMachine} variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Machine
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(formData.stitching_machines || []).map((machine, index) => (
                    <Card key={machine.id} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                              <Label>Machine Type</Label>
                              <Select
                                value={machine.type}
                                onValueChange={(v) => updateMachine(machine.id, { type: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MACHINE_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Count</Label>
                              <Input
                                type="number"
                                min="1"
                                value={machine.count}
                                onChange={(e) => updateMachine(machine.id, { count: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Brand (Optional)</Label>
                              <Input
                                value={machine.brand || ''}
                                onChange={(e) => updateMachine(machine.id, { brand: e.target.value })}
                                placeholder="Brand name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Notes</Label>
                              <Input
                                value={machine.notes || ''}
                                onChange={(e) => updateMachine(machine.id, { notes: e.target.value })}
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeMachine(machine.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
                    <span className="font-medium">Total Machines</span>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      {totalMachines}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Stitching Section Notes</Label>
                <Textarea
                  value={formData.stitching_notes || ''}
                  onChange={(e) => updateField('stitching_notes', e.target.value)}
                  placeholder="Additional notes about stitching section..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Checking Section */}
            <TabsContent value="checking" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Checking Tables Count</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.checking_tables_count || 0}
                    onChange={(e) => updateField('checking_tables_count', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Checking Table Size</Label>
                  <Input
                    value={formData.checking_table_size || ''}
                    onChange={(e) => updateField('checking_table_size', e.target.value)}
                    placeholder="Size"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Measurement Tools Available</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: 'tape', label: 'Measuring Tape' },
                    { key: 'gsm_cutter', label: 'GSM Cutter' },
                    { key: 'shade_card', label: 'Shade Card' },
                    { key: 'needle_detector', label: 'Needle Detector' },
                  ].map(tool => (
                    <div key={tool.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={tool.key}
                        checked={(formData.measurement_tools as any)?.[tool.key] || false}
                        onCheckedChange={(checked) => {
                          updateField('measurement_tools', {
                            ...(formData.measurement_tools || {}),
                            [tool.key]: checked,
                          } as any);
                        }}
                      />
                      <Label htmlFor={tool.key} className="font-normal cursor-pointer">
                        {tool.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.checking_notes || ''}
                  onChange={(e) => updateField('checking_notes', e.target.value)}
                  placeholder="Additional notes about checking section..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Ironing Section */}
            <TabsContent value="ironing" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ironing Tables Count</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.ironing_tables_count || 0}
                    onChange={(e) => updateField('ironing_tables_count', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Steam Iron Count</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.steam_iron_count || 0}
                    onChange={(e) => updateField('steam_iron_count', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div>
                    <Label>Vacuum Table Available</Label>
                    <p className="text-sm text-muted-foreground">Industrial vacuum ironing table</p>
                  </div>
                  <Switch
                    checked={formData.vacuum_table_available || false}
                    onCheckedChange={(checked) => updateField('vacuum_table_available', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div>
                    <Label>Boiler Available</Label>
                    <p className="text-sm text-muted-foreground">Steam boiler system</p>
                  </div>
                  <Switch
                    checked={formData.boiler_available || false}
                    onCheckedChange={(checked) => updateField('boiler_available', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.ironing_notes || ''}
                  onChange={(e) => updateField('ironing_notes', e.target.value)}
                  placeholder="Additional notes about ironing section..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Utilities Section */}
            <TabsContent value="utilities" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Generator Available</Label>
                      <Switch
                        checked={formData.generator_available || false}
                        onCheckedChange={(checked) => updateField('generator_available', checked)}
                      />
                    </div>
                    {formData.generator_available && (
                      <div className="space-y-2">
                        <Label>Generator Capacity</Label>
                        <Input
                          value={formData.generator_capacity || ''}
                          onChange={(e) => updateField('generator_capacity', e.target.value)}
                          placeholder="e.g., 50 KVA"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Compressor Available</Label>
                      <Switch
                        checked={formData.compressor_available || false}
                        onCheckedChange={(checked) => updateField('compressor_available', checked)}
                      />
                    </div>
                    {formData.compressor_available && (
                      <div className="space-y-2">
                        <Label>Compressor Capacity</Label>
                        <Input
                          value={formData.compressor_capacity || ''}
                          onChange={(e) => updateField('compressor_capacity', e.target.value)}
                          placeholder="e.g., 5 HP"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Power Connection Type</Label>
                <Input
                  value={formData.power_connection_type || ''}
                  onChange={(e) => updateField('power_connection_type', e.target.value)}
                  placeholder="e.g., 3-Phase Industrial"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.utilities_notes || ''}
                  onChange={(e) => updateField('utilities_notes', e.target.value)}
                  placeholder="Additional notes about utilities..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Packing Section */}
            <TabsContent value="packing" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label>Packing Tables Count</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.packing_tables_count || 0}
                  onChange={(e) => updateField('packing_tables_count', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <Label>Polybag Sealing Machine</Label>
                  <Switch
                    checked={formData.polybag_sealing_available || false}
                    onCheckedChange={(checked) => updateField('polybag_sealing_available', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <Label>Tagging/Barcode Support</Label>
                  <Switch
                    checked={formData.tagging_barcode_support || false}
                    onCheckedChange={(checked) => updateField('tagging_barcode_support', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <Label>Storage Racks Available</Label>
                  <Switch
                    checked={formData.storage_racks_available || false}
                    onCheckedChange={(checked) => updateField('storage_racks_available', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.packing_notes || ''}
                  onChange={(e) => updateField('packing_notes', e.target.value)}
                  placeholder="Additional notes about packing section..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Staff Section */}
            <TabsContent value="staff" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label>Total Employees</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.total_employees || 0}
                  onChange={(e) => updateField('total_employees', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cutting Staff</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.cutting_staff || 0}
                    onChange={(e) => updateField('cutting_staff', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stitching Staff</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stitching_staff || 0}
                    onChange={(e) => updateField('stitching_staff', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Checking Staff</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.checking_staff || 0}
                    onChange={(e) => updateField('checking_staff', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ironing Staff</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.ironing_staff || 0}
                    onChange={(e) => updateField('ironing_staff', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Packing Staff</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.packing_staff || 0}
                    onChange={(e) => updateField('packing_staff', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Daily Production Capacity (approx)</Label>
                <Input
                  value={formData.daily_production_capacity || ''}
                  onChange={(e) => updateField('daily_production_capacity', e.target.value)}
                  placeholder="e.g., 500-800 pcs"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.staff_notes || ''}
                  onChange={(e) => updateField('staff_notes', e.target.value)}
                  placeholder="Additional notes about staff..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* General Remarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            General Remarks
          </CardTitle>
          <CardDescription>Additional notes or remarks about your company infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.general_remarks || ''}
            onChange={(e) => updateField('general_remarks', e.target.value)}
            placeholder="Enter any additional remarks..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
