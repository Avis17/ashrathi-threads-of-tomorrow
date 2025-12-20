import { forwardRef } from 'react';
import { format } from 'date-fns';
import LetterheadPage from './LetterheadPage';
import { useLetterheadPagination, PaginationInput } from './useLetterheadPagination';

interface LetterheadPreviewProps extends PaginationInput {
  forPrint?: boolean;
}

const LetterheadPreview = forwardRef<HTMLDivElement, LetterheadPreviewProps>(({
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
  sealImage,
  forPrint = false
}, ref) => {
  const pages = useLetterheadPagination({
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
  });

  const renderPageContent = (page: typeof pages[0]) => {
    return (
      <div 
        className="letter-content"
        style={{ 
          fontSize: '12px',
          lineHeight: '1.5'
        }}
      >
        {/* Date & Reference - Only on first page */}
        {page.showMeta && (
          <div className="letter-meta mb-4" style={{ fontSize: '11px' }}>
            {referenceNo && <p><strong>Ref:</strong> {referenceNo}</p>}
            <p><strong>Date:</strong> {letterDate ? format(new Date(letterDate), 'dd MMMM yyyy') : ''}</p>
          </div>
        )}

        {/* Recipient - Only on first page */}
        {page.showRecipient && (recipientName || recipientAddress) && (
          <div className="recipient mb-4" style={{ fontSize: '12px' }}>
            <p><strong>To,</strong></p>
            {recipientName && <p className="font-medium">{recipientName}</p>}
            {recipientAddress && (
              <p className="whitespace-pre-line">{recipientAddress}</p>
            )}
          </div>
        )}

        {/* Subject - Only on first page */}
        {page.showSubject && subject && (
          <div className="subject mb-4" style={{ fontSize: '12px' }}>
            <p><strong>Subject:</strong> <span className="underline">{subject}</span></p>
          </div>
        )}

        {/* Salutation - Only on first page */}
        {page.showSalutation && salutation && (
          <p className="salutation mb-3" style={{ fontSize: '12px' }}>{salutation}</p>
        )}

        {/* Body Content - renders HTML from TipTap editor */}
        {page.content && (
          <div 
            className="letter-body text-justify"
            style={{ 
              fontSize: '12px',
              lineHeight: '1.5',
            }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* Closing - Only on last page */}
        {page.showClosing && closing && (
          <div className="closing mt-8">
            <p style={{ fontSize: '12px' }}>{closing}</p>
            
            {/* Signature & Seal Section */}
            <div className="signature-section mt-6 flex items-end gap-6">
              <div className="flex-1">
                {showSignature && signatureImage && (
                  <img 
                    src={signatureImage} 
                    alt="Signature" 
                    style={{ height: '40px', width: 'auto', marginBottom: '4px' }}
                  />
                )}
                <p className="font-semibold" style={{ color: '#2D4057', fontSize: '12px' }}>
                  Sivasubramanian Vadivel
                </p>
                <p style={{ color: '#4a5568', fontSize: '11px' }}>Proprietor</p>
                <p className="mt-1" style={{ color: '#718096', fontSize: '10px' }}>Authorized Signatory</p>
              </div>
              {showSeal && sealImage && (
                <div className="seal-section">
                  <img 
                    src={sealImage} 
                    alt="Company Seal" 
                    style={{ height: '64px', width: 'auto', opacity: 0.9 }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={ref}
      className={forPrint ? '' : 'overflow-y-auto max-h-[850px]'}
      style={{ 
        fontFamily: "'Inter', 'Roboto', 'Source Sans Pro', Arial, Helvetica, sans-serif"
      }}
    >
      <div className={forPrint ? '' : 'space-y-6'}>
        {pages.map((page, index) => (
          <div 
            key={page.pageNumber}
            className={forPrint ? '' : 'shadow-xl rounded-lg overflow-hidden'}
            style={!forPrint ? { 
              transform: 'scale(0.45)',
              transformOrigin: 'top left',
              width: '210mm',
              marginBottom: index < pages.length - 1 ? '-380px' : '0'
            } : {}}
          >
            <LetterheadPage 
              pageNumber={page.pageNumber} 
              totalPages={pages.length}
              forPrint={forPrint}
            >
              {renderPageContent(page)}
            </LetterheadPage>
          </div>
        ))}
      </div>
    </div>
  );
});

LetterheadPreview.displayName = 'LetterheadPreview';

export default LetterheadPreview;
