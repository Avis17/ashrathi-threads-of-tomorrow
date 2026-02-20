import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get all files in the bucket
  const { data: files, error: listError } = await supabase.storage
    .from('style-images')
    .list('', { limit: 1000 });

  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get all referenced image URLs from job_styles
  const { data: styles, error: dbError } = await supabase
    .from('job_styles')
    .select('style_image_url, measurement_sheet_url, style_images');

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Extract all used filenames from URLs
  const usedFilenames = new Set<string>();
  for (const style of styles || []) {
    const extractName = (url: string | null) => {
      if (!url) return;
      const parts = url.split('/style-images/');
      if (parts[1]) usedFilenames.add(parts[1]);
    };

    extractName(style.style_image_url);
    extractName(style.measurement_sheet_url);

    const extraImages = style.style_images;
    if (Array.isArray(extraImages)) {
      extraImages.forEach((url: string) => extractName(url));
    }
  }

  // Find unused files
  const unusedFiles = (files || [])
    .filter((f) => !usedFilenames.has(f.name))
    .map((f) => f.name);

  if (unusedFiles.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No unused files found.', deleted: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Delete unused files
  const { error: deleteError } = await supabase.storage
    .from('style-images')
    .remove(unusedFiles);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      message: `Successfully deleted ${unusedFiles.length} unused files.`,
      deleted: unusedFiles.length,
      files: unusedFiles,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
