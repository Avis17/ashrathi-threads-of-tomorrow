import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import heroImage from "@/assets/event-collection.jpg";

export default function EventApparel() {
  const measurements = [
    { size: "XS", chest: "34", height: "26" },
    { size: "S", chest: "36", height: "27" },
    { size: "M", chest: "38", height: "28" },
    { size: "L", chest: "40", height: "29" },
    { size: "XL", chest: "42", height: "30" },
    { size: "XXL", chest: "44", height: "31" },
    { size: "XXXL", chest: "46", height: "32" },
  ];

  const specifications = [
    { label: "EVENT TYPES", value: "Festivals, Concerts, Marathons, Conferences, Weddings" },
    { label: "PRINTING", value: "Screen Print, DTG, Vinyl Transfer, Sublimation" },
    { label: "COLORS", value: "Full Rainbow Spectrum - Any Color Available" },
    { label: "CUSTOMIZATION", value: "Event Logo, Sponsor Branding, Custom Graphics" },
    { label: "MOQ", value: "100 pcs & above per design" },
    { label: "RUSH ORDERS", value: "Available with 10-12 days turnaround" },
  ];

  return (
    <VibrantCategoryLayout
      title="EVENT APPAREL"
      subtitle="Make Your Event Memorable!"
      description="Eye-catching custom event merchandise in vibrant colors. From music festivals to corporate events, we create wearable memories that stand out."
      heroImage={heroImage}
      measurements={measurements}
      specifications={specifications}
      gradientFrom="from-pink-500"
      gradientVia="via-purple-500"
      gradientTo="to-blue-500"
      accentColor="bg-pink-400"
    />
  );
}
