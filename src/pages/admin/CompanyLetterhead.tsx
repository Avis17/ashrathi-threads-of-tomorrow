import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Printer, 
  FileText, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import letterheadLogo from '@/assets/feather-letterhead-logo.png';

const CompanyLetterhead = () => {
  const [letterDate, setLetterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [salutation, setSalutation] = useState('Dear Sir/Madam,');
  const [letterBody, setLetterBody] = useState('');
  const [closing, setClosing] = useState('Yours faithfully,');
  const [referenceNo, setReferenceNo] = useState('');
  
  const letterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handlePrint = () => {
    const printContent = letterRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

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
              margin: 0;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #1a1a1a;
            }
            
            .letterhead-page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm 25mm;
              background: #fff;
              position: relative;
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
              height: 60px;
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
              margin: 25px 0;
            }
            
            .letter-meta p {
              margin-bottom: 3px;
              font-size: 11pt;
            }
            
            .recipient {
              margin: 20px 0;
            }
            
            .recipient p {
              margin-bottom: 2px;
            }
            
            .subject {
              margin: 20px 0;
              font-weight: 600;
            }
            
            .subject span {
              text-decoration: underline;
            }
            
            .salutation {
              margin: 20px 0 15px 0;
            }
            
            .letter-body {
              margin: 15px 0;
              text-align: justify;
              white-space: pre-wrap;
            }
            
            .closing {
              margin-top: 40px;
            }
            
            .signature-section {
              margin-top: 60px;
            }
            
            .signature-name {
              font-weight: 600;
              color: #2D4057;
            }
            
            .signature-title {
              font-size: 10pt;
              color: #4a5568;
            }
            
            .footer {
              position: absolute;
              bottom: 15mm;
              left: 25mm;
              right: 25mm;
              text-align: center;
              font-size: 8pt;
              color: #718096;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }
            
            .gold-accent {
              color: #B8860B;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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
    toast.success('Form cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Letterhead</h1>
          <p className="text-muted-foreground mt-1">Create and print professional business letters</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={clearForm}>
            <Undo className="h-4 w-4 mr-2" />
            Clear
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
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">A4 Format</span>
            </div>
            
            {/* Letterhead Preview */}
            <div 
              ref={letterRef}
              className="bg-white shadow-xl rounded-lg overflow-hidden"
              style={{ 
                aspectRatio: '210/297',
                maxHeight: '800px'
              }}
            >
              <div className="letterhead-page p-8 h-full flex flex-col text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Header */}
                <div className="header flex justify-between items-start pb-4 border-b-2" style={{ borderColor: '#2D4057' }}>
                  <div className="logo-section">
                    <img src={letterheadLogo} alt="Feather Fashions" className="h-14" />
                  </div>
                  <div className="company-info text-right text-xs" style={{ color: '#4a5568' }}>
                    <p className="font-semibold text-base mb-1" style={{ color: '#2D4057', fontFamily: "'Playfair Display', serif" }}>
                      Feather Fashions
                    </p>
                    <p>Vadivel Nagar, 538-C, Boyampalayam, PO</p>
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
                      <div className="signature-section mt-12">
                        <p className="font-semibold" style={{ color: '#2D4057' }}>Sivasubramanian Vadivel</p>
                        <p className="text-xs" style={{ color: '#4a5568' }}>Proprietor</p>
                        <p className="text-xs mt-1" style={{ color: '#718096' }}>Authorized Signatory</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="footer text-center text-xs border-t pt-3" style={{ color: '#718096', borderColor: '#e2e8f0' }}>
                  <p>Vadivel Nagar, 538-C, Boyampalayam, PO, Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
                  <p style={{ color: '#B8860B' }}>www.featherfashions.in | hello@featherfashions.in | +91 9789225510</p>
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
