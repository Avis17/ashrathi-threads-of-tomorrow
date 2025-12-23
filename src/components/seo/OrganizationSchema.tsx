import { Helmet } from "react-helmet";

const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Feather Fashions",
    "alternateName": "Feather Fashions India",
    "url": "https://featherfashions.in",
    "logo": "https://featherfashions.in/logo.png",
    "description": "Premium garment manufacturer in Tirupur, India specializing in men's, women's, and kids sportswear, activewear, innerwear, and export-quality apparel.",
    "foundingDate": "2018",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Tirupur",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tirupur Textile Hub",
      "addressLocality": "Tirupur",
      "addressRegion": "Tamil Nadu",
      "postalCode": "641604",
      "addressCountry": "IN"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-9876543210",
        "contactType": "sales",
        "availableLanguage": ["English", "Hindi", "Tamil"]
      },
      {
        "@type": "ContactPoint",
        "telephone": "+91-9876543210",
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi", "Tamil"]
      }
    ],
    "sameAs": [
      "https://www.facebook.com/featherfashions",
      "https://www.instagram.com/featherfashions",
      "https://www.linkedin.com/company/featherfashions"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "brand": {
      "@type": "Brand",
      "name": "Feather Fashions"
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Private Label Manufacturing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Bulk Garment Orders"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Export Quality Apparel"
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default OrganizationSchema;
