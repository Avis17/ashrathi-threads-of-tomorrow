import letterheadLogo from '@/assets/feather-letterhead-logo.png';

interface LetterheadHeaderProps {
  forPrint?: boolean;
}

const LetterheadHeader = ({ forPrint = false }: LetterheadHeaderProps) => {
  const logoWidth = forPrint ? '110px' : '110px';
  
  return (
    <div 
      className="flex justify-between items-start pb-4 border-b-2"
      style={{ 
        borderColor: '#2D4057',
        marginBottom: forPrint ? '24px' : '20px'
      }}
    >
      <div className="logo-section">
        <img 
          src={letterheadLogo} 
          alt="Feather Fashions" 
          style={{ width: logoWidth, height: 'auto' }}
        />
      </div>
      <div 
        className="company-info text-right"
        style={{ 
          color: '#4a5568',
          fontSize: forPrint ? '11px' : '11px',
          lineHeight: '1.3'
        }}
      >
        <p 
          className="font-semibold mb-1"
          style={{ 
            color: '#2D4057', 
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: forPrint ? '15px' : '14px'
          }}
        >
          Feather Fashions
        </p>
        <p>251/1, Vadivel Nagar, Thottipalayam</p>
        <p>Pooluvapatti, Tiruppur, Tamil Nadu 641602</p>
        <p className="mt-1" style={{ color: '#B8860B' }}>+91 9789225510 | hello@featherfashions.in</p>
      </div>
    </div>
  );
};

export default LetterheadHeader;
