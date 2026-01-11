import { ReactNode } from "react";
import NavbarB2B from "./NavbarB2B";
import FooterB2B from "./FooterB2B";
import ArabicLanguageDisclaimer, { useArabicDisclaimerVisible } from "./ArabicLanguageDisclaimer";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const isDisclaimerVisible = useArabicDisclaimerVisible();
  
  // Adjust top padding based on disclaimer visibility
  // Navbar height: 76px, Disclaimer height: ~85px
  const mainPaddingTop = isDisclaimerVisible ? "pt-[161px]" : "pt-[76px]";
  const navbarTopOffset = isDisclaimerVisible ? "top-[85px]" : "top-0";

  return (
    <div className="flex flex-col min-h-screen">
      <ArabicLanguageDisclaimer />
      <NavbarB2B topOffset={navbarTopOffset} />
      <main className={`flex-1 ${mainPaddingTop}`}>
        {children}
      </main>
      <FooterB2B />
    </div>
  );
};

export default PublicLayout;
