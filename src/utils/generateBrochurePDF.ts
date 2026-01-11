// Lazy-loaded PDF generation to reduce main bundle size
// jsPDF is ~200KB+ and should only load when user downloads brochure

// Import images as base64 for PDF
import womenNightwearImg from "@/assets/brochure/women-nightwear-brochure.jpg";
import kidsClothingImg from "@/assets/brochure/kids-clothing-brochure.jpg";

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const generateExportBrochure = async (): Promise<void> => {
  // Dynamically import jsPDF only when needed
  const { default: jsPDF } = await import("jspdf");
  
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const goldColor = "#D4AF37";
  const darkBg = "#1A1A1A";
  const textLight = "#FFFFFF";
  const textMuted = "#9CA3AF";

  // Background
  pdf.setFillColor(darkBg);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // ===== HEADER =====
  let yPos = margin;

  // Gold accent line
  pdf.setFillColor(goldColor);
  pdf.rect(margin, yPos, contentWidth, 1, "F");
  yPos += 8;

  // Company name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(textLight);
  pdf.text("FEATHER FASHIONS", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // Tagline
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(goldColor);
  pdf.text("Premium Garment Manufacturer & Export Supplier", pageWidth / 2, yPos, { align: "center" });
  yPos += 5;

  pdf.setFontSize(8);
  pdf.setTextColor(textMuted);
  pdf.text("Manufactured in Tiruppur | Export-Ready | Wholesale Focused", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Gold accent line
  pdf.setFillColor(goldColor);
  pdf.rect(margin, yPos, contentWidth, 0.5, "F");
  yPos += 12;

  // ===== HERO STATEMENT =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(textLight);
  pdf.text("Export-Quality Nightwear & Kidswear", pageWidth / 2, yPos, { align: "center" });
  yPos += 7;
  pdf.setTextColor(goldColor);
  pdf.text("Manufactured for Global Markets", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(textMuted);
  const heroText = "Feather Fashions is a Tiruppur-based garment manufacturer supplying high-volume, consistent-quality apparel for exporters, buying houses, distributors, and retail chains.";
  const heroLines = pdf.splitTextToSize(heroText, contentWidth - 20);
  pdf.text(heroLines, pageWidth / 2, yPos, { align: "center" });
  yPos += heroLines.length * 4 + 8;

  // ===== PRODUCT SECTIONS =====
  const sectionHeight = 45;
  const halfWidth = (contentWidth - 5) / 2;

  // Women's Nightwear Section
  pdf.setFillColor("#2A2A2A");
  pdf.roundedRect(margin, yPos, halfWidth, sectionHeight, 3, 3, "F");

  // Try to add image
  try {
    const img = await loadImage(womenNightwearImg);
    pdf.addImage(img, "JPEG", margin + 2, yPos + 2, halfWidth - 4, 20, undefined, "FAST");
  } catch (e) {
    // Fallback - no image
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(textLight);
  pdf.text("WOMEN'S NIGHTWEAR", margin + halfWidth / 2, yPos + 26, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(textMuted);
  const womenItems = ["Night Pants • Night Tops • Lounge Sets", "✓ Breathable cotton fabrics", "✓ Color-fast dyeing", "✓ Consistent sizing"];
  womenItems.forEach((item, i) => {
    pdf.text(item, margin + halfWidth / 2, yPos + 31 + i * 3.5, { align: "center" });
  });

  // Kids Section
  pdf.setFillColor("#2A2A2A");
  pdf.roundedRect(margin + halfWidth + 5, yPos, halfWidth, sectionHeight, 3, 3, "F");

  try {
    const img = await loadImage(kidsClothingImg);
    pdf.addImage(img, "JPEG", margin + halfWidth + 7, yPos + 2, halfWidth - 4, 20, undefined, "FAST");
  } catch (e) {
    // Fallback
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(textLight);
  pdf.text("KIDS COLORFUL CLOTHING", margin + halfWidth + 5 + halfWidth / 2, yPos + 26, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(textMuted);
  const kidsItems = ["Kids Sets • Pyjamas • Casual Wear", "✓ Skin-friendly fabrics", "✓ Vibrant colors", "✓ Print & solid options"];
  kidsItems.forEach((item, i) => {
    pdf.text(item, margin + halfWidth + 5 + halfWidth / 2, yPos + 31 + i * 3.5, { align: "center" });
  });

  yPos += sectionHeight + 10;

  // ===== WHY CHOOSE US =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(goldColor);
  pdf.text("WHY EXPORTERS CHOOSE FEATHER FASHIONS", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  const benefits = [
    ["✓ Manufacturer-direct pricing", "✓ Consistent bulk production", "✓ MOQ flexibility"],
    ["✓ Quality control at every stage", "✓ Reliable delivery timelines", "✓ Private export handling"]
  ];

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textLight);

  benefits.forEach((row, rowIndex) => {
    row.forEach((item, colIndex) => {
      const x = margin + (contentWidth / 3) * colIndex + contentWidth / 6;
      pdf.text(item, x, yPos + rowIndex * 5, { align: "center" });
    });
  });

  yPos += 15;

  // ===== MANUFACTURING & QUALITY =====
  pdf.setFillColor("#2A2A2A");
  pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(goldColor);
  pdf.text("MANUFACTURING & QUALITY", margin + 5, yPos + 6);

  const mfgItems = [
    "• In-house production & sourcing",
    "• Fabric inspection & process control", 
    "• Size, shade & finish consistency",
    "• Export-ready packing support",
    "• Scalable capacity for repeat programs"
  ];

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(textMuted);
  mfgItems.forEach((item, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = margin + 5 + col * (contentWidth / 2);
    pdf.text(item, x, yPos + 11 + row * 4);
  });

  yPos += 30;

  // ===== COMPLIANCE =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(goldColor);
  pdf.text("COMPLIANCE & BUSINESS DETAILS", margin, yPos);
  yPos += 6;

  const compliance = ["✓ GST Registered", "✓ Made in India – Tiruppur", "✓ Export documentation support", "✓ Bulk packing & labeling"];
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(textMuted);
  compliance.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    pdf.text(item, margin + col * (contentWidth / 2), yPos + row * 4);
  });

  yPos += 12;

  // ===== CONTACT =====
  pdf.setFillColor(goldColor);
  pdf.rect(margin, yPos, contentWidth, 0.5, "F");
  yPos += 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(textLight);
  pdf.text("CONTACT FOR EXPORT ENQUIRIES", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textMuted);

  const contactInfo = [
    "Feather Fashions",
    "📍 Vadivel Nagar, Thottipalayam, Pooluvapatti, Tiruppur – 641602, Tamil Nadu, India",
    "📧 info@featherfashions.shop | 📞 +91 99883 22555 | 🌐 www.featherfashions.in"
  ];
  contactInfo.forEach((line, i) => {
    pdf.text(line, pageWidth / 2, yPos + i * 5, { align: "center" });
  });

  yPos += 20;

  // ===== CTA =====
  pdf.setFillColor("#2A2A2A");
  pdf.roundedRect(margin, yPos, contentWidth, 18, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(goldColor);
  pdf.text("Looking for a reliable garment manufacturer for export?", pageWidth / 2, yPos + 7, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textLight);
  pdf.text("Contact us to receive catalogs, pricing & production details.", pageWidth / 2, yPos + 13, { align: "center" });

  // Save
  pdf.save("Feather-Fashions-Export-Brochure.pdf");
};
