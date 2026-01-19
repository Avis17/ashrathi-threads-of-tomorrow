import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Download, Save } from 'lucide-react';
import { useProfileData, defaultProfile, CompanyProfileInsert } from '@/components/company-profile/useProfileData';
import { ProfileForm } from '@/components/company-profile/ProfileForm';
import { ProfilePreview } from '@/components/company-profile/ProfilePreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const CompanyProfile = () => {
  const { profile, isLoading, saveProfile, isSaving } = useProfileData();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [formData, setFormData] = useState<Partial<CompanyProfileInsert>>(defaultProfile);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.company_name) {
      toast.error('Company name is required');
      return;
    }
    saveProfile(formData);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;
      
      // Add additional pages if content exceeds one page
      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }
      
      pdf.save(`Company_Profile_${formData.company_name || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company infrastructure details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'edit' ? 'default' : 'outline'}
            onClick={() => setMode('edit')}
          >
            <Edit className="h-4 w-4 mr-2" />Edit
          </Button>
          <Button
            variant={mode === 'preview' ? 'default' : 'outline'}
            onClick={() => setMode('preview')}
          >
            <Eye className="h-4 w-4 mr-2" />Preview
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {mode === 'preview' && (
            <Button onClick={handleDownloadPDF} variant="secondary">
              <Download className="h-4 w-4 mr-2" />Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {mode === 'edit' ? (
        <ProfileForm formData={formData} onChange={handleChange} />
      ) : (
        <div className="overflow-auto bg-slate-200 p-8 rounded-lg">
          <ProfilePreview ref={previewRef} profile={formData} />
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
