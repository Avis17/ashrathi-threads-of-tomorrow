import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, colorName, colorHex } = await req.json();
    
    if (!productId || !colorName) {
      throw new Error('productId and colorName are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, description, category, image_url, available_colors')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    console.log(`Generating color image for ${product.name} - ${colorName}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate image with color specification
    const prompt = `${product.description || product.name}
Primary garment color: ${colorName}${colorHex ? ` (${colorHex})` : ''}.
Use ${colorName} as the dominant color for the clothing item.
Category: ${product.category}
White background, professional ecommerce product photography, realistic fabric texture, studio lighting.`;

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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Convert base64 to blob and upload to storage
    const base64Data = imageUrl.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const slugColor = colorName.toLowerCase().replace(/\s+/g, '-');
    const fileName = `${productId}-${slugColor}-${Date.now()}.png`;
    
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

    // Update product's available_colors with the new image URL
    const availableColors = product.available_colors || [];
    const colorIndex = availableColors.findIndex(
      (c: any) => c.name.toLowerCase() === colorName.toLowerCase()
    );

    if (colorIndex !== -1) {
      availableColors[colorIndex].image_url = publicUrl;
    } else if (colorHex) {
      // Add new color if not found and hex is provided
      availableColors.push({
        name: colorName,
        hex: colorHex,
        image_url: publicUrl
      });
    }

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update({ available_colors: availableColors })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product:', updateError);
    }

    console.log(`Color image generated and saved: ${publicUrl}`);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl }),
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
