import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import CurrencyConverter from "./CurrencyConverter";

const FooterB2B = () => {
  const { t } = useTranslation();
  const handleWhatsApp = () => {
    window.open("https://wa.me/919988322555?text=Hello, I'm interested in bulk orders from Feather Fashions.", "_blank");
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-athletic font-bold tracking-[0.2em] mb-4">FEATHER FASHIONS</h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6">
              {t('footer.brandDescription')}
            </p>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {t('footer.whatsappUs')}
            </button>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-6 uppercase">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.productCategories')}</Link></li>
              <li><Link to="/manufacturing" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.manufacturing')}</Link></li>
              <li><Link to="/compliance" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.complianceCertifications')}</Link></li>
              <li><Link to="/about" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.contactEnquiry')}</Link></li>
              <li><Link to="/size-guide" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2"><Ruler className="h-3 w-3" />{t('footer.sizeGuide')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-6 uppercase">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:hello@featherfashions.in" className="hover:text-accent transition-colors">hello@featherfashions.in</a>
                  <a href="mailto:info@featherfashions.in" className="hover:text-accent transition-colors">info@featherfashions.in</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <div className="flex flex-col">
                  <span>+91 9988322555 (WhatsApp)</span>
                  <span>+91 9789225510</span>
                  <span>+91 421-6610850</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <span>251/1, Vadivel Nagar,<br />Thottipalayam, Pooluvapatti,<br />Tiruppur, Tamil Nadu 641602<br />India</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-6 uppercase">
              {t('footer.exportMarkets')}
            </h4>
            <ul className="space-y-3">
              <li><Link to="/export-garments-to-uae" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.exportToUAE')}</Link></li>
              <li><Link to="/export-garments-to-saudi-arabia" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.exportToSaudiArabia')}</Link></li>
              <li><Link to="/export-garments-to-south-africa" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">{t('footer.exportToSouthAfrica')}</Link></li>
            </ul>
            
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mt-6 mb-4 uppercase">
              {t('footer.registrations')}
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><span className="text-primary-foreground/50">GSTIN:</span> <span className="font-mono text-xs">33FWTPS1281P1ZJ</span></li>
              <li><span className="text-primary-foreground/50">IEC:</span> <span className="font-mono text-xs">FWTPS1281P</span></li>
            </ul>
          </div>

          {/* Currency Converter */}
          <div>
            <CurrencyConverter />
          </div>
        </div>
      </div>

      {/* SEO Text Block - Indexable for search engines */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 py-4">
          <p className="text-[10px] text-primary-foreground/30 leading-relaxed text-center max-w-4xl mx-auto">
            {t('footer.seoText')}
          </p>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/50 text-center md:text-start">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              <Link to="/terms-and-conditions" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t('footer.terms')}</Link>
              <span className="text-primary-foreground/30">•</span>
              <Link to="/privacy-policy" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t('footer.privacy')}</Link>
              <span className="text-primary-foreground/30">•</span>
              <Link to="/disclaimer" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t('footer.disclaimer')}</Link>
              <span className="text-primary-foreground/30">•</span>
              <Link to="/shipping-export-policy" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t('footer.shipping')}</Link>
              <span className="text-primary-foreground/30">•</span>
              <Link to="/refund-cancellation-policy" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t('footer.refunds')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterB2B;
