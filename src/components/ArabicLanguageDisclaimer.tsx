import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Info } from "lucide-react";

const ArabicLanguageDisclaimer = () => {
  const { i18n } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if previously dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('arabic-disclaimer-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('arabic-disclaimer-dismissed', 'true');
  };

  // Only show for Arabic language
  if (i18n.language !== 'ar' || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-50 border-b border-amber-200/60 shadow-sm">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            {/* Arabic Title */}
            <p className="text-sm font-semibold text-amber-900 mb-0.5" dir="rtl">
              تنويه هام
            </p>
            
            {/* Arabic Content */}
            <p className="text-xs text-amber-800/80 leading-relaxed mb-1" dir="rtl">
              تمت ترجمة هذا المحتوى إلى اللغة العربية للتسهيل فقط.
              تُعد اللغة الإنجليزية هي اللغة الرسمية لأغراض الأعمال والعقود والتعاملات التجارية.
              في حال وجود أي اختلاف في التفسير، يُعتد بالنص الإنجليزي.
            </p>
            
            {/* English Supporting Line */}
            <p className="text-[11px] text-amber-700/70 leading-relaxed" dir="ltr">
              Arabic translation is provided for convenience only. English is the official language for business and export communication.
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-amber-100 rounded transition-colors flex-shrink-0"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4 text-amber-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to get disclaimer height for layout adjustments
export const useArabicDisclaimerVisible = () => {
  const { i18n } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('arabic-disclaimer-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
    
    // Listen for storage changes
    const handleStorage = () => {
      const dismissed = sessionStorage.getItem('arabic-disclaimer-dismissed');
      setIsDismissed(dismissed === 'true');
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return i18n.language === 'ar' && !isDismissed;
};

export default ArabicLanguageDisclaimer;
