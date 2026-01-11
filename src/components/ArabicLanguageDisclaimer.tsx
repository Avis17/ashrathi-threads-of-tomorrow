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
    <div className="bg-muted/60 border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            {/* Arabic Title */}
            <p className="text-sm font-semibold text-foreground mb-1" dir="rtl">
              تنويه هام
            </p>
            
            {/* Arabic Content */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-2" dir="rtl">
              تمت ترجمة هذا المحتوى إلى اللغة العربية للتسهيل فقط.
              تُعد اللغة الإنجليزية هي اللغة الرسمية لأغراض الأعمال والعقود والتعاملات التجارية.
              في حال وجود أي اختلاف في التفسير، يُعتد بالنص الإنجليزي.
            </p>
            
            {/* English Supporting Line */}
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed" dir="ltr">
              Arabic translation is provided for convenience only. English is the official language for business and export communication.
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArabicLanguageDisclaimer;
