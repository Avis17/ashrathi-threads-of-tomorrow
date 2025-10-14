-- Insert all available products from assets
INSERT INTO public.products (name, category, fabric, description, image_url, additional_images, hsn_code, product_code, is_active, is_featured, display_order, price) VALUES
-- Women's/Loungewear Products
('Cloud Whisper Lounge Set', 'Loungewear', 'Premium Cotton Blend', 'Luxuriously soft lounge set perfect for relaxation and comfort', 'products/cloud-whisper-lounge-set.jpg', '["products/cloud-whisper-lounge-set-2.png"]'::jsonb, '6108', 'CW-LS-001', true, true, 1, 1299),
('Serenity Cardigan', 'Women''s Wear', 'Soft Knit Cotton', 'Elegant cardigan for all-day comfort and style', 'products/serenity-cardigan.jpg', '["products/serenity-cardigan-2.png"]'::jsonb, '6110', 'SR-CD-001', true, false, 2, 899),
('Feathersoft Lounge Tee', 'Loungewear', 'Organic Cotton', 'Ultimate comfort tee available in multiple colors', 'products/feathersoft-lounge-tee.jpg', '["products/feathersoft-lounge-tee-2.png", "products/feathersoft-lounge-tee-3.png", "products/feathersoft-lounge-tee-sage.png"]'::jsonb, '6109', 'FS-LT-001', true, true, 3, 549),
('Dreamease Night Pants', 'Sleepwear', 'Breathable Cotton', 'Comfortable night pants for peaceful sleep', 'products/dreamease-night-pants.jpg', '["products/dreamease-night-pants-2.png"]'::jsonb, '6107', 'DE-NP-001', true, false, 4, 649),
('Featherflow Coord Set', 'Activewear', 'Athletic Cotton Blend', 'Stylish coordinated set for active lifestyle', 'products/featherflow-coord-set.jpg', '["products/featherflow-coord-set-2.png"]'::jsonb, '6211', 'FF-CS-001', true, true, 5, 1399),
('Cloudyday Cotton Set', 'Loungewear', 'Premium Cotton', 'All-day comfort set in breathable cotton', 'products/cloudyday-cotton-set.jpg', '["products/cloudyday-cotton-set-2.png", "products/cloudyday-cotton-set-3.png", "products/cloudyday-cotton-set-4.png"]'::jsonb, '6211', 'CD-CS-001', true, false, 6, 1199),
('Dreamnest Pyjama Set', 'Sleepwear', 'Soft Cotton', 'Cozy pyjama set for restful nights', 'products/dreamnest-pyjama-set.jpg', '["products/dreamnest-teal-feather.png"]'::jsonb, '6108', 'DN-PS-001', true, false, 7, 999),

-- Kids Wear Products
('Dream Weaver Kids Set', 'Kids Wear', 'Soft Organic Cotton', 'Adorable and comfortable kids set for all-day play', 'products/dream-weaver-kids-set.jpg', '["products/dream-weaver-kids-set-2.png"]'::jsonb, '6209', 'DW-KS-001', true, true, 8, 799),
('Little Explorer Kids Set', 'Kids Wear', 'Durable Cotton Blend', 'Adventure-ready kids clothing set built for active children', 'products/little-explorer-kids-set.jpg', '["products/little-explorer-blue-feather.png"]'::jsonb, '6209', 'LE-KS-001', true, false, 9, 749),
('Featherflow Kids Green Set', 'Kids Wear', 'Soft Cotton', 'Vibrant green kids coord set for everyday comfort', 'products/featherflow-kids-green.png', '[]'::jsonb, '6209', 'FF-KG-001', true, false, 10, 699),
('Boys Shorts', 'Kids Wear', 'Cotton Blend', 'Comfortable and durable shorts for boys', 'products/boys-shorts-1.jpg', '[]'::jsonb, '6203', 'BS-SH-001', true, false, 11, 449),
('Girls Leggings', 'Kids Wear', 'Stretch Cotton', 'Comfortable leggings for active girls', 'products/girls-leggings-1.jpg', '[]'::jsonb, '6204', 'GL-LG-001', true, false, 12, 399),

-- Men's Wear Products
('Free Spirit T-Shirt', 'Men''s Wear', 'Premium Cotton', 'Classic tee for everyday comfort', 'products/free-spirit-tshirt.jpg', '["products/free-spirit-white-vneck.png"]'::jsonb, '6109', 'FS-TS-001', true, false, 13, 499),
('Men''s Track Pants - Teal', 'Activewear', 'Athletic Cotton Blend', 'Comfortable track pants for active lifestyle', 'products/mens-track-pants-teal.png', '[]'::jsonb, '6203', 'MT-TP-TEA', true, false, 14, 799),
('Men''s Track Pants - Navy', 'Activewear', 'Athletic Cotton Blend', 'Navy track pants for sports and leisure', 'products/mens-track-pants-navy.jpg', '[]'::jsonb, '6203', 'MT-TP-NAV', true, false, 15, 799),
('Men''s Track Pants - Beige', 'Activewear', 'Athletic Cotton Blend', 'Versatile beige track pants for any occasion', 'products/mens-track-pants-beige.jpg', '[]'::jsonb, '6203', 'MT-TP-BEI', true, false, 16, 799),
('Men''s Shorts - Teal', 'Activewear', 'Breathable Cotton', 'Comfortable shorts for casual wear and workouts', 'products/mens-shorts-teal.png', '[]'::jsonb, '6203', 'MS-SH-TEA', true, false, 17, 549),
('Men''s Polo - Orange', 'Men''s Wear', 'Premium Pique Cotton', 'Classic polo shirt in vibrant orange', 'products/mens-polo-orange.png', '[]'::jsonb, '6105', 'MP-PO-ORA', true, false, 18, 699),
('Men''s T-Shirt - Charcoal', 'Men''s Wear', 'Soft Cotton', 'Essential charcoal grey tee for everyday wear', 'products/mens-tshirt-charcoal.jpg', '[]'::jsonb, '6109', 'MT-TS-CHA', true, false, 19, 499),
('Men''s Lounge Set - Sage', 'Loungewear', 'Premium Cotton Blend', 'Relaxed lounge set in sage green', 'products/mens-lounge-set-sage.jpg', '[]'::jsonb, '6107', 'ML-LS-SAG', true, false, 20, 1299),
('Men''s Henley - Moss', 'Men''s Wear', 'Soft Cotton Jersey', 'Classic henley in moss green for casual style', 'products/mens-henley-moss.jpg', '[]'::jsonb, '6109', 'MH-HL-MOS', true, false, 21, 649),
('Men''s Coord Set - Black/White', 'Men''s Wear', 'Cotton Blend', 'Stylish coordinated set in monochrome', 'products/mens-coord-set-bw.jpg', '[]'::jsonb, '6211', 'MC-CS-BW', true, false, 22, 1499);