// HSN Code mappings for product categories
// HSN 6109: T-shirts, singlets and other vests, knitted or crocheted
// HSN 6110: Jerseys, pullovers, cardigans, waistcoats and similar articles
// HSN 6204: Women's suits, ensembles, jackets, blazers, dresses, skirts, etc.
// HSN 6209: Babies' garments and clothing accessories

export const HSN_CODE_MAP: Record<string, string> = {
  "Men's T-Shirts": "6109",
  "Men's Wear": "6109",
  "Men's Polo": "6109",
  "Men's Shirts": "6205",
  "Women's Tops": "6109",
  "Women's Wear": "6204",
  "Women's Leggings": "6104",
  "Kids Wear": "6209",
  "Kids Apparel": "6209",
  "Innerwear": "6108",
  "Track Pants": "6103",
  "Sportswear": "6112",
};

export const getHSNCodeByCategory = (category: string): string => {
  return HSN_CODE_MAP[category] || "6109"; // Default to T-shirts HSN
};
