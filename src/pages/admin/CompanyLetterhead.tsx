import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Printer, 
  FileText, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Type,
  Calendar,
  Upload,
  Stamp,
  PenTool,
  Save,
  List,
  ArrowLeft,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LetterheadPreview from '@/components/letterhead/LetterheadPreview';
import LetterheadHeader from '@/components/letterhead/LetterheadHeader';
import LetterheadFooter from '@/components/letterhead/LetterheadFooter';
import LetterheadEditor from '@/components/letterhead/LetterheadEditor';
import { useLetterheadPagination } from '@/components/letterhead/useLetterheadPagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Letterhead {
  id: string;
  letter_date: string;
  reference_no: string | null;
  recipient_name: string | null;
  recipient_address: string | null;
  subject: string | null;
  salutation: string | null;
  letter_body: string | null;
  closing: string | null;
  seal_image: string | null;
  signature_image: string | null;
  show_seal: boolean;
  show_signature: boolean;
  created_at: string;
  updated_at: string;
}

const CompanyLetterhead = () => {
  const [view, setView] = useState<'editor' | 'list'>('editor');
  const [letterheads, setLetterheads] = useState<Letterhead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [letterDate, setLetterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [salutation, setSalutation] = useState('Dear Sir/Madam,');
  const [letterBody, setLetterBody] = useState('');
  const [closing, setClosing] = useState('Yours faithfully,');
  const [referenceNo, setReferenceNo] = useState('');
  
  const [sealImage, setSealImage] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSeal, setShowSeal] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  
  const letterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const paginationInput = {
    letterDate,
    referenceNo,
    recipientName,
    recipientAddress,
    subject,
    salutation,
    letterBody,
    closing,
    showSignature,
    signatureImage,
    showSeal,
    sealImage
  };

  const pages = useLetterheadPagination(paginationInput);

  useEffect(() => {
    if (view === 'list') {
      fetchLetterheads();
    }
  }, [view]);

  const fetchLetterheads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_letterheads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetterheads(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch letterheads: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'seal' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'seal') {
          setSealImage(reader.result as string);
          toast.success('Company seal uploaded');
        } else {
          setSignatureImage(reader.result as string);
          toast.success('Signature uploaded');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFormat = (command: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = letterBody.substring(start, end);
      
      let formattedText = selectedText;
      switch (command) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
      }
      
      const newBody = letterBody.substring(0, start) + formattedText + letterBody.substring(end);
      setLetterBody(newBody);
    }
  };

  const handleSave = async () => {
    if (!subject && !letterBody) {
      toast.error('Please add at least a subject or letter body');
      return;
    }

    setIsLoading(true);
    try {
      const letterData = {
        letter_date: letterDate,
        reference_no: referenceNo || null,
        recipient_name: recipientName || null,
        recipient_address: recipientAddress || null,
        subject: subject || null,
        salutation: salutation || null,
        letter_body: letterBody || null,
        closing: closing || null,
        seal_image: sealImage,
        signature_image: signatureImage,
        show_seal: showSeal,
        show_signature: showSignature,
      };

      if (editingId) {
        const { error } = await supabase
          .from('company_letterheads')
          .update(letterData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Letterhead updated successfully');
      } else {
        const { error } = await supabase
          .from('company_letterheads')
          .insert([letterData]);

        if (error) throw error;
        toast.success('Letterhead saved successfully');
      }

      clearForm();
      setEditingId(null);
    } catch (error: any) {
      toast.error('Failed to save letterhead: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (letterhead: Letterhead) => {
    setEditingId(letterhead.id);
    setLetterDate(letterhead.letter_date);
    setReferenceNo(letterhead.reference_no || '');
    setRecipientName(letterhead.recipient_name || '');
    setRecipientAddress(letterhead.recipient_address || '');
    setSubject(letterhead.subject || '');
    setSalutation(letterhead.salutation || 'Dear Sir/Madam,');
    setLetterBody(letterhead.letter_body || '');
    setClosing(letterhead.closing || 'Yours faithfully,');
    setSealImage(letterhead.seal_image);
    setSignatureImage(letterhead.signature_image);
    setShowSeal(letterhead.show_seal);
    setShowSignature(letterhead.show_signature);
    setView('editor');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('company_letterheads')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      toast.success('Letterhead deleted successfully');
      setLetterheads(letterheads.filter(l => l.id !== deleteId));
    } catch (error: any) {
      toast.error('Failed to delete letterhead: ' + error.message);
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    // Generate HTML for all pages
    const generatePageHTML = (page: typeof pages[0]) => {
      const metaSection = page.showMeta ? `
        <div class="letter-meta">
          ${referenceNo ? `<p><strong>Ref:</strong> ${referenceNo}</p>` : ''}
          <p><strong>Date:</strong> ${letterDate ? format(new Date(letterDate), 'dd MMMM yyyy') : ''}</p>
        </div>
      ` : '';

      const recipientSection = page.showRecipient && (recipientName || recipientAddress) ? `
        <div class="recipient">
          <p><strong>To,</strong></p>
          ${recipientName ? `<p class="font-medium">${recipientName}</p>` : ''}
          ${recipientAddress ? `<p class="whitespace-pre-line">${recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
      ` : '';

      const subjectSection = page.showSubject && subject ? `
        <div class="subject">
          <p><strong>Subject:</strong> <span class="underline">${subject}</span></p>
        </div>
      ` : '';

      const salutationSection = page.showSalutation && salutation ? `
        <p class="salutation">${salutation}</p>
      ` : '';

      const bodySection = page.content ? `
        <div class="letter-body">
          ${page.content}
        </div>
      ` : '';

      const closingSection = page.showClosing && closing ? `
        <div class="closing">
          <p>${closing}</p>
          <div class="signature-section">
            <div class="signature-info">
              ${showSignature && signatureImage ? `<img src="${signatureImage}" alt="Signature" class="signature-img" />` : ''}
              <p class="signature-name">Sivasubramanian Vadivel</p>
              <p class="signature-title">Proprietor</p>
              <p class="signature-auth">Authorized Signatory</p>
            </div>
            ${showSeal && sealImage ? `<div class="seal-section"><img src="${sealImage}" alt="Company Seal" class="seal-img" /></div>` : ''}
          </div>
        </div>
      ` : '';

      return `
        <div class="letterhead-page">
          <div class="header">
            <div class="logo-section">
              <img src="${(document.querySelector('.logo-section img') as HTMLImageElement)?.src || ''}" alt="Feather Fashions" class="logo" />
            </div>
            <div class="company-info">
              <p class="brand">Feather Fashions</p>
              <p>251/1, Vadivel Nagar, Thottipalayam</p>
              <p>Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
              <p class="gold-accent">+91 9789225510 | hello@featherfashions.in</p>
            </div>
          </div>
          
          <div class="body-content">
            ${metaSection}
            ${recipientSection}
            ${subjectSection}
            ${salutationSection}
            ${bodySection}
            ${closingSection}
          </div>
          
          <div class="footer">
            <p>251/1, Vadivel Nagar, Thottipalayam, Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
            <p class="gold-accent">featherfashions.in | hello@featherfashions.in | +91 9789225510</p>
            ${pages.length > 1 ? `<p class="page-number">Page ${page.pageNumber} of ${pages.length}</p>` : ''}
          </div>
        </div>
      `;
    };

    const allPagesHTML = pages.map(page => generatePageHTML(page)).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Company Letterhead - Feather Fashions</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
              }
              
              .letterhead-page {
                page-break-after: always;
              }
              
              .letterhead-page:last-child {
                page-break-after: auto;
              }
              
              .letter-body p {
                page-break-inside: avoid;
              }
            }
            
            body {
              font-family: 'Inter', 'Roboto', 'Source Sans Pro', Arial, Helvetica, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: #1a1a1a;
              background: #fff;
            }
            
            .letterhead-page {
              width: 210mm;
              min-height: 297mm;
              height: 297mm;
              padding: 25mm 20mm 20mm 20mm;
              background: #fff;
              position: relative;
              display: flex;
              flex-direction: column;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 16px;
              margin-bottom: 24px;
              border-bottom: 2px solid #2D4057;
            }
            
            .logo {
              width: 110px;
              height: auto;
            }
            
            .company-info {
              text-align: right;
              font-size: 11px;
              color: #4a5568;
              line-height: 1.3;
            }
            
            .company-info .brand {
              font-size: 15px;
              font-weight: 600;
              color: #2D4057;
              margin-bottom: 4px;
            }
            
            .gold-accent {
              color: #B8860B;
            }
            
            .body-content {
              flex: 1;
            }
            
            .letter-meta {
              margin-bottom: 16px;
              font-size: 11px;
            }
            
            .letter-meta p {
              margin-bottom: 2px;
            }
            
            .recipient {
              margin-bottom: 16px;
              font-size: 12px;
            }
            
            .recipient p {
              margin-bottom: 2px;
            }
            
            .recipient .font-medium {
              font-weight: 500;
            }
            
            .subject {
              margin-bottom: 16px;
              font-size: 12px;
            }
            
            .subject .underline {
              text-decoration: underline;
            }
            
            .salutation {
              margin-bottom: 12px;
              font-size: 12px;
            }
            
            .letter-body {
              text-align: justify;
              font-size: 12px;
              line-height: 1.5;
            }
            
            .letter-body p {
              margin-bottom: 12px;
            }
            
            /* Ordered list - proper hanging indent for wrapped text */
            .letter-body ol {
              list-style: none;
              counter-reset: list-counter;
              padding-left: 0;
              margin-left: 0;
              margin-bottom: 12px;
            }
            
            .letter-body ol > li {
              counter-increment: list-counter;
              position: relative;
              padding-left: 28px;
              margin-bottom: 8px;
              text-align: justify;
            }
            
            .letter-body ol > li::before {
              content: counter(list-counter) ". ";
              position: absolute;
              left: 0;
              top: 0;
              font-weight: normal;
            }
            
            .letter-body ol > li p {
              margin-bottom: 0;
              display: inline;
            }
            
            /* Unordered list - proper hanging indent */
            .letter-body ul {
              list-style: none;
              padding-left: 0;
              margin-left: 0;
              margin-bottom: 12px;
            }
            
            .letter-body ul > li {
              position: relative;
              padding-left: 20px;
              margin-bottom: 6px;
              text-align: justify;
            }
            
            .letter-body ul > li::before {
              content: "•";
              position: absolute;
              left: 0;
              top: 0;
            }
            
            .letter-body ul > li p {
              margin-bottom: 0;
              display: inline;
            }
            
            /* Hide page break markers */
            .letter-body .page-break-marker,
            .letter-body [data-page-break] {
              display: none !important;
            }
            
            .closing {
              margin-top: 32px;
              font-size: 12px;
            }
            
            .signature-section {
              margin-top: 24px;
              display: flex;
              align-items: flex-end;
              gap: 24px;
            }
            
            .signature-info {
              flex: 1;
            }
            
            .signature-img {
              height: 40px;
              width: auto;
              margin-bottom: 4px;
            }
            
            .signature-name {
              font-weight: 600;
              color: #2D4057;
              font-size: 12px;
            }
            
            .signature-title {
              color: #4a5568;
              font-size: 11px;
            }
            
            .signature-auth {
              color: #718096;
              font-size: 10px;
              margin-top: 4px;
            }
            
            .seal-img {
              height: 64px;
              width: auto;
              opacity: 0.9;
            }
            
            .footer {
              margin-top: auto;
              text-align: center;
              font-size: 10px;
              color: #718096;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              line-height: 1.3;
            }
            
            .page-number {
              margin-top: 4px;
              font-size: 9px;
              color: #a0aec0;
            }
          </style>
        </head>
        <body>
          ${allPagesHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const clearForm = () => {
    setLetterDate(format(new Date(), 'yyyy-MM-dd'));
    setRecipientName('');
    setRecipientAddress('');
    setSubject('');
    setSalutation('Dear Sir/Madam,');
    setLetterBody('');
    setClosing('Yours faithfully,');
    setReferenceNo('');
    setSealImage(null);
    setSignatureImage(null);
    setShowSeal(true);
    setShowSignature(true);
    setEditingId(null);
    if (sealInputRef.current) sealInputRef.current.value = '';
    if (signatureInputRef.current) signatureInputRef.current.value = '';
    toast.success('Form cleared');
  };

  const removeSeal = () => {
    setSealImage(null);
    if (sealInputRef.current) sealInputRef.current.value = '';
    toast.success('Seal removed');
  };

  const removeSignature = () => {
    setSignatureImage(null);
    if (signatureInputRef.current) signatureInputRef.current.value = '';
    toast.success('Signature removed');
  };

  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Saved Letterheads</h1>
            <p className="text-muted-foreground mt-1">View, edit, or delete your saved letters</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setView('editor')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <Button onClick={() => { clearForm(); setView('editor'); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Letter
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : letterheads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No saved letterheads found
                    </TableCell>
                  </TableRow>
                ) : (
                  letterheads.map((letterhead) => (
                    <TableRow key={letterhead.id}>
                      <TableCell>{format(new Date(letterhead.letter_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{letterhead.reference_no || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {letterhead.recipient_name || '-'}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {letterhead.subject || '-'}
                      </TableCell>
                      <TableCell>{format(new Date(letterhead.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(letterhead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(letterhead.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Letterhead</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this letterhead? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {editingId ? 'Edit Letterhead' : 'Company Letterhead'}
          </h1>
          <p className="text-muted-foreground mt-1">Create and print professional business letters</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setView('list')}>
            <List className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button variant="outline" onClick={clearForm}>
            <Undo className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="secondary" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {editingId ? 'Update' : 'Save'}
          </Button>
          <Button onClick={handlePrint} className="bg-primary">
            <Printer className="h-4 w-4 mr-2" />
            Print Letter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Letter Editor
            </div>
            
            <Separator />

            {/* Date & Reference */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input 
                  type="date" 
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Reference No.</Label>
                <Input 
                  placeholder="FF/2024/001"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label>Recipient Name / Company</Label>
              <Input 
                placeholder="Enter recipient name or company"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Textarea 
                placeholder="Enter complete address"
                rows={3}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                placeholder="Enter letter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Salutation */}
            <div className="space-y-2">
              <Label>Salutation</Label>
              <Input 
                placeholder="Dear Sir/Madam,"
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
              />
            </div>

            {/* Letter Body - TipTap Rich Text Editor */}
            <div className="space-y-2">
              <Label>Letter Body</Label>
              <LetterheadEditor 
                value={letterBody}
                onChange={setLetterBody}
              />
            </div>

            {/* Closing */}
            <div className="space-y-2">
              <Label>Closing</Label>
              <Input 
                placeholder="Yours faithfully,"
                value={closing}
                onChange={(e) => setClosing(e.target.value)}
              />
            </div>

            <Separator />

            {/* Seal & Signature Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Stamp className="h-4 w-4 text-primary" />
                Seal & Signature
              </div>

              {/* Company Seal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Stamp className="h-4 w-4" />
                    Company Seal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-seal" className="text-xs text-muted-foreground">Show in print</Label>
                    <Switch id="show-seal" checked={showSeal} onCheckedChange={setShowSeal} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={sealInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'seal')}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => sealInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {sealImage ? 'Change Seal' : 'Upload Seal'}
                  </Button>
                  {sealImage && (
                    <Button type="button" variant="destructive" size="sm" onClick={removeSeal}>
                      Remove
                    </Button>
                  )}
                </div>
                {sealImage && (
                  <div className="p-2 border rounded-md bg-muted/50">
                    <img src={sealImage} alt="Company Seal" className="h-16 w-auto mx-auto" />
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Signature
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-signature" className="text-xs text-muted-foreground">Show in print</Label>
                    <Switch id="show-signature" checked={showSignature} onCheckedChange={setShowSignature} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={signatureInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'signature')}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => signatureInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {signatureImage ? 'Change Signature' : 'Upload Signature'}
                  </Button>
                  {signatureImage && (
                    <Button type="button" variant="destructive" size="sm" onClick={removeSignature}>
                      Remove
                    </Button>
                  )}
                </div>
                {signatureImage && (
                  <div className="p-2 border rounded-md bg-muted/50">
                    <img src={signatureImage} alt="Signature" className="h-12 w-auto mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="border-2 bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Type className="h-5 w-5 text-primary" />
                Live Preview
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">A4 Format</span>
                {pages.length > 1 && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium">
                    {pages.length} Pages
                  </span>
                )}
              </div>
            </div>
            
            {/* Multi-page Letterhead Preview */}
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden" style={{ minHeight: '500px' }}>
              <LetterheadPreview
                ref={letterRef}
                {...paginationInput}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyLetterhead;
