-- =========================================================
-- NutriScan Log
-- Test Full Nutrition Data
-- =========================================================

-- Add more complete nutrition-label data to Greek Yogurt.
UPDATE foods
SET
    saturated_fat_g = 0,
    trans_fat_g = 0,
    cholesterol_mg = 10,
    calcium_mg = 200,
    iron_mg = 0,
    vitamin_d_mcg = 0
WHERE food_id = 1;


-- Log 350 g of Greek Yogurt.
-- Serving size = 175 g
-- Scale factor = 350 / 175 = 2

SELECT log_food_consumption(1, 350);


-- Check the calculated result.
SELECT
    log_id,
    food_id,
    consumed_amount,
    scale_factor,
    logged_calories,
    logged_protein_g,
    logged_calcium_mg,
    logged_cholesterol_mg
FROM food_logs
ORDER BY log_id DESC
LIMIT 1;