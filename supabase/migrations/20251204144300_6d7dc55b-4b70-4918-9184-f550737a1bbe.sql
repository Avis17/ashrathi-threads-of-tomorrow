-- Update Common Tasks descriptions
UPDATE external_job_tasks SET description = 'Removing excess loose threads after stitching for a clean, professional finish' WHERE task_name = 'Excess Thread Cutting';
UPDATE external_job_tasks SET description = 'Final touches including pressing, folding, and quality finishing of the garment' WHERE task_name = 'Finishing';
UPDATE external_job_tasks SET description = 'Inspecting garment for defects, measurement accuracy, and overall finish quality' WHERE task_name = 'Quality Check';
UPDATE external_job_tasks SET description = 'Trimming loose threads from seams and stitch endpoints' WHERE task_name = 'Thread Cutting';

-- Update Leggings Tasks descriptions
UPDATE external_job_tasks SET description = 'Joining elastic band ends to create a continuous, seamless waistband' WHERE task_name = 'Belt Elastic Joint';
UPDATE external_job_tasks SET description = 'Stitching diamond-shaped crotch panel for added comfort and better fit' WHERE task_name = 'Gusset Pouch';
UPDATE external_job_tasks SET description = 'Sewing inner leg seam from crotch point down to ankle/hem' WHERE task_name = 'Inseam';
UPDATE external_job_tasks SET description = 'Hemming and finishing the leg opening at the bottom' WHERE task_name = 'Leg Tower';
UPDATE external_job_tasks SET description = 'Overlocking pocket panel edges to prevent fraying and ensure durability' WHERE task_name = 'Pocket Overlock Round';
UPDATE external_job_tasks SET description = 'Attaching side pocket panel to the main body of legging' WHERE task_name = 'Pocket Tower';
UPDATE external_job_tasks SET description = 'Stitching front and back rise seam from waistband to crotch' WHERE task_name = 'Rise';
UPDATE external_job_tasks SET description = 'Joining front and back panels along the outer side from waist to hem' WHERE task_name = 'Side Seam';
UPDATE external_job_tasks SET description = 'Stitching the V-shaped junction point at the crotch area' WHERE task_name = 'V Join';
UPDATE external_job_tasks SET description = 'Attaching elastic waistband to the legging body with proper stretch' WHERE task_name = 'Waistband Attachment';
UPDATE external_job_tasks SET description = 'Attaching drawstring cord channel to waistband' WHERE task_name = 'Drawstring Channel';
UPDATE external_job_tasks SET description = 'Creating reinforced waistband with double layer for extra support' WHERE task_name = 'Double Waistband';
UPDATE external_job_tasks SET description = 'Attaching pre-made cuff to ankle opening' WHERE task_name = 'Ankle Cuff';
UPDATE external_job_tasks SET description = 'Securing waistband elastic with bar tack stitches' WHERE task_name = 'Elastic Bar Tack';

-- Update T-Shirt Tasks descriptions
UPDATE external_job_tasks SET description = 'Folding and stitching the bottom edge of garment for clean finish' WHERE task_name = 'Hem Finish';
UPDATE external_job_tasks SET description = 'Sewing brand label and care instructions to the neckline area' WHERE task_name = 'Label Attachment';
UPDATE external_job_tasks SET description = 'Attaching ribbed binding to neckline for stretch and durability' WHERE task_name = 'Neck Binding';
UPDATE external_job_tasks SET description = 'Joining front and back shoulder panels together' WHERE task_name = 'Shoulder Join';
UPDATE external_job_tasks SET description = 'Setting sleeves into the armhole with proper ease and alignment' WHERE task_name = 'Sleeve Attachment';
UPDATE external_job_tasks SET description = 'Hemming and finishing the sleeve openings' WHERE task_name = 'Sleeve Hem';
UPDATE external_job_tasks SET description = 'Attaching pre-made collar to the neckline with proper positioning' WHERE task_name = 'Collar Attachment';
UPDATE external_job_tasks SET description = 'Creating the button placket opening at front neckline' WHERE task_name = 'Placket Stitching';
UPDATE external_job_tasks SET description = 'Sewing buttons onto the placket at marked positions' WHERE task_name = 'Button Attachment';
UPDATE external_job_tasks SET description = 'Attaching pocket to front chest area with reinforced corners' WHERE task_name = 'Chest Pocket';
UPDATE external_job_tasks SET description = 'Stitching decorative or functional tape along neckline or shoulders' WHERE task_name = 'Neck Tape';
UPDATE external_job_tasks SET description = 'Reinforcing armhole seam with additional stitching for durability' WHERE task_name = 'Armhole Reinforcement';
UPDATE external_job_tasks SET description = 'Attaching ribbed cuff to sleeve opening for snug fit' WHERE task_name = 'Sleeve Cuff';
UPDATE external_job_tasks SET description = 'Attaching ribbed hem band to bottom of garment' WHERE task_name = 'Bottom Rib';

-- Update Kids specific tasks
UPDATE external_job_tasks SET description = 'Attaching snap buttons for easy dressing of children' WHERE task_name = 'Snap Button';
UPDATE external_job_tasks SET description = 'Creating envelope neckline for easy head passage' WHERE task_name = 'Envelope Neck';
UPDATE external_job_tasks SET description = 'Attaching decorative applique or patch to garment' WHERE task_name = 'Applique Attachment';

-- Update general/common stitching tasks
UPDATE external_job_tasks SET description = 'Stitching side panels from underarm to bottom hem' WHERE task_name = 'Body Side Seam';
UPDATE external_job_tasks SET description = 'Creating buttonhole opening with reinforced edges' WHERE task_name = 'Buttonhole';
UPDATE external_job_tasks SET description = 'Attaching zipper to garment opening' WHERE task_name = 'Zipper Attachment';
UPDATE external_job_tasks SET description = 'Securing seam ends with reinforced back-tacking' WHERE task_name = 'Bar Tacking';
UPDATE external_job_tasks SET description = 'Decorative topstitching along seams or edges' WHERE task_name = 'Topstitch';
UPDATE external_job_tasks SET description = 'Finishing raw edges with overlock stitch to prevent fraying' WHERE task_name = 'Edge Overlock';
UPDATE external_job_tasks SET description = 'Stitching flat seam with two parallel lines of stitching' WHERE task_name = 'Flatlock Seam';