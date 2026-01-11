interface LetterheadFooterProps {
  forPrint?: boolean;
  isAbsolute?: boolean;
}

const LetterheadFooter = ({ forPrint = false, isAbsolute = false }: LetterheadFooterProps) => {
  return (
    <div 
      className={`text-center border-t pt-2 ${isAbsolute ? 'absolute bottom-0 left-0 right-0' : ''}`}
      style={{ 
        color: '#718096', 
        borderColor: '#e2e8f0',
        fontSize: forPrint ? '10px' : '10px',
        lineHeight: '1.3',
        paddingLeft: isAbsolute ? '20mm' : '0',
        paddingRight: isAbsolute ? '20mm' : '0',
        paddingBottom: isAbsolute ? '15mm' : '0',
        backgroundColor: '#fff'
      }}
    >
      <p>251/1, Vadivel Nagar, Thottipalayam, Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
      <p style={{ color: '#B8860B' }}>featherfashions.in | hello@featherfashions.in | +91 9988322555</p>
    </div>
  );
};

export default LetterheadFooter;
