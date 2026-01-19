import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Download, Save } from 'lucide-react';
import { useProfileData, defaultProfile, CompanyProfileInsert } from '@/components/company-profile/useProfileData';
import { ProfileForm } from '@/components/company-profile/ProfileForm';
import { ProfilePreview } from '@/components/company-profile/ProfilePreview';
import { ProfilePreviewPrint } from '@/components/company-profile/ProfilePreviewPrint';
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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      
      // Get all section cards for individual rendering
      const sections = previewRef.current.querySelectorAll('.section-card');
      const header = previewRef.current.querySelector('.profile-container > div:first-child');
      const contactStrip = previewRef.current.querySelector('.profile-container > div:nth-child(2)');
      const footer = previewRef.current.querySelector('.footer-section');
      
      // Margins in mm
      const marginTop = 5;
      const marginBottom = 20;
      const marginLeft = 5;
      const contentWidth = pdfWidth - (marginLeft * 2);
      const usableHeight = pdfPageHeight - marginTop - marginBottom;
      
      let currentY = marginTop;
      let pageNumber = 1;
      
      // Helper function to add element to PDF
      const addElementToPDF = async (element: Element, isFirstPage: boolean = false) => {
        const canvas = await html2canvas(element as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const aspectRatio = canvas.height / canvas.width;
        const imgHeight = contentWidth * aspectRatio;
        
        // Check if element fits on current page
        if (currentY + imgHeight > pdfPageHeight - marginBottom && !isFirstPage) {
          pdf.addPage();
          pageNumber++;
          currentY = marginTop;
        }
        
        pdf.addImage(imgData, 'PNG', marginLeft, currentY, contentWidth, imgHeight);
        currentY += imgHeight;
        
        return imgHeight;
      };
      
      // Add header
      if (header) {
        await addElementToPDF(header, true);
      }
      
      // Add contact strip
      if (contactStrip) {
        await addElementToPDF(contactStrip, true);
      }
      
      // Add each section card (they won't be split)
      for (const section of sections) {
        await addElementToPDF(section);
      }
      
      // Add footer at the bottom of the last page
      if (footer) {
        const footerCanvas = await html2canvas(footer as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0f172a',
        });
        
        const footerImgData = footerCanvas.toDataURL('image/png');
        const footerAspectRatio = footerCanvas.height / footerCanvas.width;
        const footerHeight = pdfWidth * footerAspectRatio;
        
        // Position footer at the very bottom of the last page
        const footerY = pdfPageHeight - footerHeight;
        pdf.addImage(footerImgData, 'PNG', 0, footerY, pdfWidth, footerHeight);
      }
      
      pdf.save(`Company_Profile_${formData.company_name || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
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
        <>
          {/* Visible preview for screen */}
          <div className="overflow-auto bg-slate-200 p-8 rounded-lg">
            <ProfilePreview profile={formData} />
          </div>
          {/* Hidden print-optimized version for PDF generation */}
          <div className="absolute left-[-9999px] top-0">
            <ProfilePreviewPrint ref={previewRef} profile={formData} />
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyProfile;
