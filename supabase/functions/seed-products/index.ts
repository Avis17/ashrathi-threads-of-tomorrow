import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductTemplate {
  name: string;
  category: string;
  fabric: string;
  description: string;
  imagePrompt: string;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  price: number;
  quality_tier: 'elite' | 'smart_basics';
}

const productTemplates: ProductTemplate[] = [
  // Ladies Tops
  {
    name: "Floral Print Women's Top",
    category: "Women's Tops",
    fabric: "Cotton",
    description: "Beautiful floral printed top perfect for casual wear",
    imagePrompt: "High-quality product photo of a women's casual cotton top with elegant floral print pattern, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Pink Floral", hex: "#FFB6C1" },
      { name: "Blue Floral", hex: "#87CEEB" },
      { name: "Yellow Floral", hex: "#FFD700" },
      { name: "Green Floral", hex: "#90EE90" }
    ],
    price: 599,
    quality_tier: "smart_basics"
  },
  {
    name: "Striped Casual Top",
    category: "Women's Tops",
    fabric: "Cotton Blend",
    description: "Comfortable striped top for everyday wear",
    imagePrompt: "High-quality product photo of a women's casual striped cotton top, horizontal stripes, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy Stripes", hex: "#000080" },
      { name: "Red Stripes", hex: "#DC143C" },
      { name: "Black Stripes", hex: "#000000" },
      { name: "Green Stripes", hex: "#228B22" }
    ],
    price: 549,
    quality_tier: "smart_basics"
  },
  {
    name: "Solid Color V-Neck Top",
    category: "Women's Tops",
    fabric: "Premium Cotton",
    description: "Classic v-neck top in solid colors",
    imagePrompt: "High-quality product photo of a women's v-neck cotton top, solid color, elegant and simple, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#000080" },
      { name: "Maroon", hex: "#800000" },
      { name: "Olive", hex: "#808000" }
    ],
    price: 499,
    quality_tier: "smart_basics"
  },
  {
    name: "Printed Designer Top",
    category: "Women's Tops",
    fabric: "Rayon",
    description: "Trendy designer print top for stylish look",
    imagePrompt: "High-quality product photo of a women's designer rayon top with modern abstract print, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Multi Print 1", hex: "#FF6B9D" },
      { name: "Multi Print 2", hex: "#C44569" },
      { name: "Multi Print 3", hex: "#8B78E6" },
      { name: "Multi Print 4", hex: "#0FBCF9" }
    ],
    price: 799,
    quality_tier: "elite"
  },
  
  // Gents T-Shirts
  {
    name: "Classic Polo T-Shirt",
    category: "Men's T-Shirts",
    fabric: "Cotton Pique",
    description: "Premium polo t-shirt for men",
    imagePrompt: "High-quality product photo of a men's polo t-shirt, collar, solid color, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Navy Blue", hex: "#000080" },
      { name: "Maroon", hex: "#800000" },
      { name: "Olive Green", hex: "#556B2F" },
      { name: "Sky Blue", hex: "#87CEEB" },
      { name: "Charcoal Grey", hex: "#36454F" },
      { name: "Royal Blue", hex: "#4169E1" }
    ],
    price: 699,
    quality_tier: "elite"
  },
  {
    name: "Round Neck Basic T-Shirt",
    category: "Men's T-Shirts",
    fabric: "100% Cotton",
    description: "Comfortable round neck t-shirt for daily wear",
    imagePrompt: "High-quality product photo of a men's round neck t-shirt, solid color, simple and clean, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Grey Melange", hex: "#808080" },
      { name: "Navy Blue", hex: "#000080" },
      { name: "Bottle Green", hex: "#006A4E" },
      { name: "Maroon", hex: "#800000" },
      { name: "Mustard", hex: "#FFDB58" },
      { name: "Rust Orange", hex: "#CD5C5C" }
    ],
    price: 399,
    quality_tier: "smart_basics"
  },
  {
    name: "V-Neck Designer T-Shirt",
    category: "Men's T-Shirts",
    fabric: "Cotton Blend",
    description: "Stylish v-neck t-shirt with modern fit",
    imagePrompt: "High-quality product photo of a men's v-neck t-shirt, modern fit, solid color, on white background, professional ecommerce style",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#000080" },
      { name: "Charcoal", hex: "#36454F" },
      { name: "Burgundy", hex: "#800020" },
      { name: "Teal", hex: "#008080" },
      { name: "Stone Grey", hex: "#8B8680" }
    ],
    price: 549,
    quality_tier: "smart_basics"
  },
  
  // Kids Sets
  {
    name: "Kids Cotton Combo Set",
    category: "Kids Wear",
    fabric: "Soft Cotton",
    description: "Comfortable cotton top and bottom set for kids",
    imagePrompt: "High-quality product photo of a kids' clothing set with top and bottom, colorful and playful, on white background, professional ecommerce style",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: [
      { name: "Blue Set", hex: "#4169E1" },
      { name: "Pink Set", hex: "#FF69B4" },
      { name: "Green Set", hex: "#32CD32" },
      { name: "Yellow Set", hex: "#FFD700" }
    ],
    price: 799,
    quality_tier: "smart_basics"
  },
  {
    name: "Printed Kids Night Suit",
    category: "Kids Wear",
    fabric: "Cotton",
    description: "Cute printed night suit set for comfortable sleep",
    imagePrompt: "High-quality product photo of a kids' pajama set with fun cartoon prints, full sleeve top and pajama bottom, on white background, professional ecommerce style",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: [
      { name: "Cartoon Blue", hex: "#5DADE2" },
      { name: "Cartoon Pink", hex: "#F1948A" },
      { name: "Cartoon Green", hex: "#82E0AA" }
    ],
    price: 649,
    quality_tier: "smart_basics"
  },
  {
    name: "Kids Party Wear Set",
    category: "Kids Wear",
    fabric: "Premium Cotton",
    description: "Stylish party wear set for special occasions",
    imagePrompt: "High-quality product photo of a kids' party wear outfit set, elegant and festive, on white background, professional ecommerce style",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: [
      { name: "Royal Blue", hex: "#4169E1" },
      { name: "Maroon", hex: "#800000" },
      { name: "Cream Gold", hex: "#FFFDD0" },
      { name: "Navy", hex: "#000080" }
    ],
    price: 999,
    quality_tier: "elite"
  }
];

// Helper to add delay between requests to avoid rate limits
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(prompt: string, supabase: any): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      modalities: ["image", "text"]
    })
  });

  const data = await response.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!imageUrl) {
    throw new Error('No image generated');
  }

  // Upload to storage
  const base64Data = imageUrl.split(',')[1];
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  
  const { error: uploadError } = await supabase.storage
    .from('style-images')
    .upload(fileName, binaryData, {
      contentType: 'image/png',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('style-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const createdProducts = [];

    for (const template of productTemplates) {
      console.log(`Generating images for: ${template.name}`);
      
      // Generate main product image
      const imageUrl = await generateImage(template.imagePrompt, supabase);
      await delay(2000);
      
      // Generate color-specific images
      const colorImages: Record<string, string> = {};
      const additionalImages: string[] = [];
      
      for (const color of template.colors) {
        try {
          const colorPrompt = `${template.imagePrompt}
Primary garment color: ${color.name} (${color.hex}).
Use ${color.name} as the dominant color for the clothing item.
White background, professional ecommerce product photography, realistic fabric texture, studio lighting.`;
          
          console.log(`  - Generating ${color.name} variant`);
          const colorImageUrl = await generateImage(colorPrompt, supabase);
          colorImages[color.name] = colorImageUrl;
          additionalImages.push(colorImageUrl);
          await delay(2000);
        } catch (colorError) {
          console.error(`  - Failed for ${color.name}:`, colorError);
        }
      }
      
      // Build colors with image URLs
      const colorsWithImages = template.colors.map(c => ({
        ...c,
        image_url: colorImages[c.name] || imageUrl
      }));
      
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: template.name,
          category: template.category,
          fabric: template.fabric,
          description: template.description,
          image_url: imageUrl,
          additional_images: additionalImages.length > 0 ? additionalImages : [],
          price: template.price,
          quality_tier: template.quality_tier,
          available_sizes: template.sizes,
          available_colors: colorsWithImages,
          is_featured: false,
          is_active: true,
          display_order: 0,
          discount_percentage: 0,
          offer_messages: [],
          combo_offers: []
        })
        .select()
        .single();

      if (productError) {
        console.error(`Error creating product ${template.name}:`, productError);
        continue;
      }

      // Create inventory for each size-color combination
      const inventoryEntries = [];
      for (const size of template.sizes) {
        for (const color of template.colors) {
          inventoryEntries.push({
            product_id: product.id,
            size: size,
            color: color.name,
            original_quantity: 100,
            available_quantity: 100,
            reserved_quantity: 0,
            ordered_quantity: 0
          });
        }
      }

      const { error: inventoryError } = await supabase
        .from('product_inventory')
        .insert(inventoryEntries);

      if (inventoryError) {
        console.error(`Error creating inventory for ${template.name}:`, inventoryError);
      } else {
        // Update product's current_total_stock
        const totalStock = inventoryEntries.reduce((sum, entry) => sum + entry.available_quantity, 0);
        const { error: stockError } = await supabase
          .from('products')
          .update({ current_total_stock: totalStock })
          .eq('id', product.id);
        
        if (stockError) {
          console.error(`Error updating stock for ${template.name}:`, stockError);
        }
      }

      createdProducts.push({
        name: template.name,
        id: product.id,
        imageUrl,
        colorVariants: Object.keys(colorImages).length
      });

      console.log(`Created: ${template.name} with ${Object.keys(colorImages).length} color variants`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Created ${createdProducts.length} products`,
        products: createdProducts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
