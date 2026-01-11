import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOProps {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "product" | "article";
  productData?: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    sku?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
  };
  noIndex?: boolean;
  keywords?: string;
  keywordsAr?: string;
}

const BASE_URL = "https://featherfashions.in";

// ManufacturingBusiness Schema for B2B focus - Export Oriented
const manufacturingBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ManufacturingBusiness",
  "name": "Feather Fashions",
  "alternateName": "Feather Fashions India - Garment Exporter",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "image": `${BASE_URL}/og-image.jpg`,
  "description": "Export-oriented garment manufacturer from Tiruppur, India. Specializing in wholesale nightwear, kidswear, cotton T-shirts, pyjamas & OEM apparel for global markets including UAE, Saudi Arabia, and South Africa.",
  "telephone": "+91-9988322555",
  "email": "info@featherfashions.in",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "251/1, Vadivel Nagar, Thottipalayam, Pooluvapatti",
    "addressLocality": "Tiruppur",
    "addressRegion": "Tamil Nadu",
    "postalCode": "641602",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "11.1085",
    "longitude": "77.3411"
  },
  "areaServed": [
    { "@type": "Country", "name": "United Arab Emirates" },
    { "@type": "Country", "name": "Saudi Arabia" },
    { "@type": "Country", "name": "South Africa" },
    { "@type": "Country", "name": "India" },
    { "@type": "Country", "name": "Qatar" },
    { "@type": "Country", "name": "Kuwait" },
    { "@type": "Country", "name": "Oman" },
    { "@type": "Country", "name": "Bahrain" }
  ],
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.facebook.com/featherfashions",
    "https://www.instagram.com/featherfashions",
    "https://www.linkedin.com/company/featherfashions"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Export Garment Manufacturing Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Women's Nightwear Manufacturing",
          "description": "Premium women's night pants, tops, pyjamas and loungewear for export"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Kidswear Manufacturing",
          "description": "Colorful kids cotton sets, nightwear and export-ready children's apparel"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Cotton T-Shirts & Casual Wear",
          "description": "Wholesale cotton T-shirts, pyjamas and casual apparel manufacturing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "OEM & Private Label Manufacturing",
          "description": "Custom branded garment production with your own labels and designs"
        }
      }
    ]
  },
  "knowsAbout": [
    "Garment Export from India",
    "Wholesale Nightwear Manufacturing",
    "Kidswear Export",
    "Cotton T-Shirt Manufacturing",
    "OEM Garment Production",
    "Private Label Clothing",
    "Export Apparel Tiruppur",
    "Bulk Garment Manufacturing"
  ]
};

const SEO = ({
  title,
  titleAr,
  description,
  descriptionAr,
  canonicalUrl,
  ogImage = "/og-image.jpg",
  ogType = "website",
  productData,
  noIndex = false,
  keywords,
  keywordsAr,
}: SEOProps) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // Default SEO content
  const defaultTitle = "Garment Exporter from India | Wholesale Nightwear & Kidswear Manufacturer";
  const defaultTitleAr = "مصنع ملابس للتصدير من الهند | ملابس نوم نسائية وملابس أطفال بالجملة";
  const defaultDescription = "Export-ready garment manufacturer from Tiruppur, India. Wholesale nightwear, kidswear, cotton T-shirts, pyjamas & OEM apparel for UAE, Saudi Arabia, South Africa & global markets.";
  const defaultDescriptionAr = "مصنع ملابس للتصدير من تيروبور، الهند. ملابس نوم نسائية، ملابس أطفال، تي شيرتات قطنية وملابس بالجملة للإمارات والسعودية وجنوب أفريقيا والأسواق العالمية.";
  const defaultKeywords = "garment exporter from India, apparel manufacturer India, wholesale garment manufacturer Tiruppur, export ready garment manufacturer, OEM garment manufacturer India, private label clothing manufacturer India, women nightwear manufacturer India, ladies night pants exporter, kidswear manufacturer India, kids clothing exporter, cotton t shirt manufacturer India, wholesale t shirt exporter, pyjamas manufacturer India, garment exporter to UAE, garment exporter to Saudi Arabia, garment exporter to South Africa";
  const defaultKeywordsAr = "مصنع ملابس في الهند, مُصنّع ملابس للتصدير, ملابس أطفال للتصدير, ملابس نوم نسائية, ملابس قطنية بالجملة, مصنع ملابس OEM, تصدير ملابس إلى الإمارات, تصدير ملابس إلى السعودية, مورد ملابس للأطفال الخليج";

  // Select content based on language
  const finalTitle = isArabic ? (titleAr || defaultTitleAr) : (title || defaultTitle);
  const finalDescription = isArabic ? (descriptionAr || defaultDescriptionAr) : (description || defaultDescription);
  const finalKeywords = isArabic ? (keywordsAr || defaultKeywordsAr) : (keywords || defaultKeywords);
  
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : undefined;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;

  // Generate Product Schema if productData is provided
  const productSchema = productData
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productData.name,
        "description": productData.description,
        "image": productData.image.startsWith("http") 
          ? productData.image 
          : `${BASE_URL}${productData.image}`,
        "brand": {
          "@type": "Brand",
          "name": "Feather Fashions"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "Feather Fashions",
          "url": BASE_URL
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": productData.currency || "INR",
          "price": productData.price,
          "availability": `https://schema.org/${productData.availability || "InStock"}`,
          "seller": {
            "@type": "Organization",
            "name": "Feather Fashions"
          }
        },
        ...(productData.sku && { "sku": productData.sku })
      }
    : null;

  return (
    <Helmet>
      {/* Language */}
      <html lang={isArabic ? "ar" : "en"} dir={isArabic ? "rtl" : "ltr"} />
      
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="Feather Fashions" />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Alternate language versions */}
      {fullCanonicalUrl && (
        <>
          <link rel="alternate" hrefLang="en" href={fullCanonicalUrl} />
          <link rel="alternate" hrefLang="ar" href={`${fullCanonicalUrl}?lang=ar`} />
          <link rel="alternate" hrefLang="x-default" href={fullCanonicalUrl} />
        </>
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content="Feather Fashions - Export Garment Manufacturer from India" />
      <meta property="og:site_name" content="Feather Fashions" />
      <meta property="og:locale" content={isArabic ? "ar_AE" : "en_IN"} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@featherfashions" />
      <meta name="twitter:creator" content="@featherfashions" />
      
      {/* Additional Meta */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Tiruppur" />
      <meta name="geo.position" content="11.1085;77.3411" />
      <meta name="ICBM" content="11.1085, 77.3411" />
      
      {/* ManufacturingBusiness Schema */}
      <script type="application/ld+json">
        {JSON.stringify(manufacturingBusinessSchema)}
      </script>
      
      {/* Product Schema (if applicable) */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
