-- =========================================================
-- NutriScan Log
-- Expand Nutrition Fields
-- =========================================================


-- Add additional nutrition-label information to foods.
ALTER TABLE foods
ADD COLUMN saturated_fat_g NUMERIC(8, 2),
ADD COLUMN trans_fat_g NUMERIC(8, 2),
ADD COLUMN cholesterol_mg NUMERIC(8, 2),
ADD COLUMN calcium_mg NUMERIC(8, 2),
ADD COLUMN iron_mg NUMERIC(8, 2),
ADD COLUMN vitamin_d_mcg NUMERIC(8, 2),
ADD COLUMN raw_ocr_text TEXT,
ADD COLUMN image_url TEXT;


-- Store the corresponding calculated values when a food is logged.
ALTER TABLE food_logs
ADD COLUMN logged_sugar_g NUMERIC(8, 2),
ADD COLUMN logged_sodium_mg NUMERIC(8, 2),
ADD COLUMN logged_potassium_mg NUMERIC(8, 2),
ADD COLUMN logged_fiber_g NUMERIC(8, 2),
ADD COLUMN logged_saturated_fat_g NUMERIC(8, 2),
ADD COLUMN logged_trans_fat_g NUMERIC(8, 2),
ADD COLUMN logged_cholesterol_mg NUMERIC(8, 2),
ADD COLUMN logged_calcium_mg NUMERIC(8, 2),
ADD COLUMN logged_iron_mg NUMERIC(8, 2),
ADD COLUMN logged_vitamin_d_mcg NUMERIC(8, 2);