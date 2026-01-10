import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
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
}

const BASE_URL = "https://featherfashions.in";

// ManufacturingBusiness Schema for B2B focus
const manufacturingBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ManufacturingBusiness",
  "name": "Feather Fashions",
  "alternateName": "Feather Fashions India",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "image": `${BASE_URL}/og-image.jpg`,
  "description": "Leading activewear and sportswear manufacturer in Tirupur, India. Specializing in private label, white label, and wholesale activewear production with low MOQ.",
  "telephone": "+91-9876543210",
  "email": "info@featherfashions.in",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Tirupur Textile Hub",
    "addressLocality": "Tirupur",
    "addressRegion": "Tamil Nadu",
    "postalCode": "641604",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "11.1085",
    "longitude": "77.3411"
  },
  "areaServed": [
    { "@type": "Country", "name": "India" },
    { "@type": "Country", "name": "United States" },
    { "@type": "Country", "name": "United Kingdom" },
    { "@type": "Country", "name": "Australia" },
    { "@type": "Country", "name": "United Arab Emirates" }
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
    "name": "Activewear Manufacturing Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Private Label Activewear Manufacturing",
          "description": "Custom branded activewear production with your own labels and designs"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "White Label Sportswear",
          "description": "Ready-to-brand sportswear and athleisure products"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Wholesale Activewear",
          "description": "Bulk activewear orders with competitive pricing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Export Quality Garments",
          "description": "International standard garment manufacturing for global markets"
        }
      }
    ]
  },
  "knowsAbout": [
    "Activewear Manufacturing",
    "Sportswear Production",
    "Private Label Clothing",
    "White Label Apparel",
    "Wholesale Garments",
    "Athleisure Wear",
    "Performance Fabrics",
    "Sustainable Fashion"
  ]
};

const SEO = ({
  title = "Activewear Manufacturer in Tirupur, India | Feather Fashions",
  description = "Leading activewear and sportswear manufacturer in Tirupur, India. We offer private label, white label, and wholesale activewear production with low MOQ. Premium quality leggings, sports bras, track pants, and more.",
  canonicalUrl,
  ogImage = "/og-image.jpg",
  ogType = "website",
  productData,
  noIndex = false,
}: SEOProps) => {
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
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="activewear manufacturer India, sportswear manufacturer Tirupur, private label activewear, white label sportswear, wholesale leggings, bulk order gym wear, OEM activewear, athleisure manufacturer, performance wear supplier, low MOQ garments" />
      <meta name="author" content="Feather Fashions" />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content="Feather Fashions - Premium Activewear Manufacturer" />
      <meta property="og:site_name" content="Feather Fashions" />
      <meta property="og:locale" content="en_IN" />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@featherfashions" />
      <meta name="twitter:creator" content="@featherfashions" />
      
      {/* Additional Meta */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Tirupur" />
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
