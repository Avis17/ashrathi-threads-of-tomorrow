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
import letterheadLogo from '@/assets/feather-letterhead-logo.png';
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
    const printContent = letterRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    // Format the reference and date for continuation header
    const formattedDate = letterDate ? format(new Date(letterDate), 'dd MMM yyyy') : '';
    const refDisplay = referenceNo || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Company Letterhead - Feather Fashions</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            @page {
              size: A4;
              margin: 15mm 20mm 20mm 20mm;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #1a1a1a;
            }
            
            .letterhead-page {
              width: 100%;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #2D4057;
            }
            
            .logo-section img {
              height: 120px;
              width: auto;
            }
            
            .company-info {
              text-align: right;
              font-size: 9pt;
              color: #4a5568;
            }
            
            .company-info .brand {
              font-family: 'Playfair Display', serif;
              font-size: 14pt;
              font-weight: 600;
              color: #2D4057;
              margin-bottom: 4px;
            }
            
            .letter-meta {
              margin: 20px 0;
            }
            
            .letter-meta p {
              margin-bottom: 3px;
              font-size: 10pt;
            }
            
            .recipient {
              margin: 15px 0;
            }
            
            .recipient p {
              margin-bottom: 2px;
              white-space: pre-line;
              font-size: 10pt;
            }
            
            .subject {
              margin: 15px 0;
              font-weight: 600;
              font-size: 10pt;
            }
            
            .subject span {
              text-decoration: underline;
            }
            
            .salutation {
              margin: 15px 0 10px 0;
              font-size: 10pt;
            }
            
            .letter-body {
              margin: 10px 0;
              text-align: justify;
              white-space: pre-wrap;
              font-size: 10pt;
            }
            
            .closing {
              margin-top: 30px;
              font-size: 10pt;
            }
            
            .signature-section {
              margin-top: 15px;
              display: flex;
              align-items: flex-end;
              gap: 20px;
            }
            
            .signature-section img {
              height: auto;
              max-height: 45px;
              width: auto;
            }
            
            .seal-section img {
              height: 60px;
              width: auto;
              opacity: 0.9;
            }
            
            .signature-name {
              font-weight: 600;
              color: #2D4057;
              font-size: 10pt;
            }
            
            .signature-title {
              font-size: 9pt;
              color: #4a5568;
            }
            
            /* Hide preview footer */
            .preview-footer {
              display: none !important;
            }
            
            /* Running footer on all pages */
            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 8pt;
              color: #718096;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              padding-bottom: 3px;
              background: white;
            }
            
            .print-footer .gold-accent {
              color: #B8860B;
            }
            
            /* Running header for page 2 onwards */
            .print-continuation-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              display: none;
              background: white;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            
            .continuation-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 8px;
              border-bottom: 1px solid #2D4057;
            }
            
            .brand-mini {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .brand-mini img {
              height: 35px;
              width: auto;
            }
            
            .brand-mini .brand-name {
              font-family: 'Playfair Display', serif;
              font-size: 11pt;
              font-weight: 600;
              color: #2D4057;
            }
            
            .page-info {
              font-size: 8pt;
              color: #4a5568;
              text-align: right;
            }
            
            .page-info .ref {
              color: #B8860B;
              font-weight: 500;
            }
            
            /* Page break handling */
            .content-wrapper {
              padding-bottom: 50px; /* Space for footer */
            }
            
            @media print {
              @page {
                margin: 15mm 20mm 20mm 20mm;
              }
              
              /* First page doesn't need continuation header */
              @page :first {
                margin-top: 15mm;
              }
              
              /* Pages 2+ show continuation header */
              .print-continuation-header {
                display: block;
              }
              
              .print-footer {
                position: fixed;
                bottom: 0;
              }
            }
          </style>
        </head>
        <body>
          <!-- Continuation header for pages 2+ -->
          <div class="print-continuation-header">
            <div class="continuation-content">
              <div class="brand-mini">
                <span class="brand-name">Feather Fashions</span>
              </div>
              <div class="page-info">
                ${refDisplay ? `<span class="ref">Ref: ${refDisplay}</span><br>` : ''}
                <span>Date: ${formattedDate}</span>
                <br><span style="font-style: italic;">...continued</span>
              </div>
            </div>
          </div>
          
          <div class="content-wrapper">
            ${printContent.innerHTML}
          </div>
          
          <!-- Fixed footer on all pages -->
          <div class="print-footer">
            <p>538-C, Vadivel Nagar, Boyampalayam, PO, Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
            <p class="gold-accent">featherfashions.in | hello@featherfashions.in | +91 9789225510</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

            {/* Letter Body */}
            <div className="space-y-2">
              <Label>Letter Body</Label>
              <div className="flex gap-1 mb-2 p-2 bg-muted rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => applyFormat('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => applyFormat('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => applyFormat('underline')}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-8" />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
              <Textarea 
                ref={textareaRef}
                placeholder="Write your letter content here..."
                rows={10}
                className="font-normal"
                value={letterBody}
                onChange={(e) => setLetterBody(e.target.value)}
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
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Scrollable Preview</span>
            </div>
            
            {/* Letterhead Preview - Scrollable container */}
            <div 
              className="bg-white shadow-xl rounded-lg overflow-y-auto"
              style={{ 
                maxHeight: '800px',
                width: '100%'
              }}
            >
              <div 
                ref={letterRef}
                className="letterhead-page p-8 min-h-full flex flex-col text-sm" 
                style={{ fontFamily: "'Inter', sans-serif", minWidth: '100%' }}
              >
                {/* Header */}
                <div className="header flex justify-between items-start pb-4 border-b-2" style={{ borderColor: '#2D4057' }}>
                  <div className="logo-section">
                    <img src={letterheadLogo} alt="Feather Fashions" className="h-20" />
                  </div>
                  <div className="company-info text-right text-xs" style={{ color: '#4a5568' }}>
                    <p className="font-semibold text-base mb-1" style={{ color: '#2D4057', fontFamily: "'Playfair Display', serif" }}>
                      Feather Fashions
                    </p>
                    <p>538-C, Vadivel Nagar, Boyampalayam, PO</p>
                    <p>Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
                    <p className="mt-1" style={{ color: '#B8860B' }}>+91 9789225510 | hello@featherfashions.in</p>
                  </div>
                </div>

                {/* Letter Content */}
                <div className="flex-1 py-6 text-xs leading-relaxed">
                  {/* Date & Reference */}
                  <div className="letter-meta mb-4">
                    {referenceNo && <p><strong>Ref:</strong> {referenceNo}</p>}
                    <p><strong>Date:</strong> {letterDate ? format(new Date(letterDate), 'dd MMMM yyyy') : ''}</p>
                  </div>

                  {/* Recipient */}
                  {(recipientName || recipientAddress) && (
                    <div className="recipient mb-4">
                      <p><strong>To,</strong></p>
                      {recipientName && <p className="font-medium">{recipientName}</p>}
                      {recipientAddress && (
                        <p className="whitespace-pre-line">{recipientAddress}</p>
                      )}
                    </div>
                  )}

                  {/* Subject */}
                  {subject && (
                    <div className="subject mb-4">
                      <p><strong>Subject:</strong> <span className="underline">{subject}</span></p>
                    </div>
                  )}

                  {/* Salutation */}
                  {salutation && (
                    <p className="salutation mb-3">{salutation}</p>
                  )}

                  {/* Body */}
                  {letterBody && (
                    <div className="letter-body whitespace-pre-wrap text-justify">
                      {letterBody}
                    </div>
                  )}

                  {/* Closing */}
                  {closing && (
                    <div className="closing mt-8">
                      <p>{closing}</p>
                      
                      {/* Signature & Seal Section */}
                      <div className="signature-section mt-6 flex items-end gap-6">
                        <div className="flex-1">
                          {showSignature && signatureImage && (
                            <img src={signatureImage} alt="Signature" className="h-10 w-auto mb-1" />
                          )}
                          <p className="font-semibold" style={{ color: '#2D4057' }}>Sivasubramanian Vadivel</p>
                          <p className="text-xs" style={{ color: '#4a5568' }}>Proprietor</p>
                          <p className="text-xs mt-1" style={{ color: '#718096' }}>Authorized Signatory</p>
                        </div>
                        {showSeal && sealImage && (
                          <div className="seal-section">
                            <img src={sealImage} alt="Company Seal" className="h-16 w-auto opacity-90" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer - Preview only, print footer is handled in handlePrint */}
                <div className="preview-footer text-center text-xs border-t pt-3 mt-auto" style={{ color: '#718096', borderColor: '#e2e8f0' }}>
                  <p>538-C, Vadivel Nagar, Boyampalayam, PO, Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
                  <p style={{ color: '#B8860B' }}>featherfashions.in | hello@featherfashions.in | +91 9789225510</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyLetterhead;
