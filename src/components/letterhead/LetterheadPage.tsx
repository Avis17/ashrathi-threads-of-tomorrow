import { ReactNode } from 'react';
import LetterheadHeader from './LetterheadHeader';
import LetterheadFooter from './LetterheadFooter';

interface LetterheadPageProps {
  children: ReactNode;
  pageNumber: number;
  totalPages: number;
  forPrint?: boolean;
}

const LetterheadPage = ({ children, pageNumber, totalPages, forPrint = false }: LetterheadPageProps) => {
  return (
    <div 
      className="letterhead-page bg-white relative"
      style={{ 
        width: '210mm',
        minHeight: '297mm',
        height: '297mm',
        padding: '25mm 20mm 20mm 20mm',
        fontFamily: "'Inter', 'Roboto', 'Source Sans Pro', Arial, Helvetica, sans-serif",
        fontSize: '12px',
        lineHeight: '1.5',
        color: '#1a1a1a',
        boxSizing: 'border-box',
        pageBreakAfter: forPrint ? 'always' : 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header - Fixed at top */}
      <LetterheadHeader forPrint={forPrint} />
      
      {/* Body Content - Dynamic height */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ 
          paddingTop: '8px',
          paddingBottom: '8px'
        }}
      >
        {children}
      </div>
      
      {/* Footer - Fixed at bottom */}
      <div className="mt-auto pt-2">
        <LetterheadFooter forPrint={forPrint} />
        {totalPages > 1 && (
          <div 
            className="text-center mt-1"
            style={{ fontSize: '9px', color: '#a0aec0' }}
          >
            Page {pageNumber} of {totalPages}
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterheadPage;
