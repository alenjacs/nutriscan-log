-- =========================================================
-- NutriScan Log
-- Daily Nutrition Totals
-- =========================================================

CREATE OR REPLACE VIEW daily_nutrition_totals AS
SELECT
    logged_at::date AS log_date,

    ROUND(SUM(logged_calories), 2) AS total_calories,
    ROUND(SUM(logged_protein_g), 2) AS total_protein_g,
    ROUND(SUM(logged_carbs_g), 2) AS total_carbs_g,
    ROUND(SUM(logged_fat_g), 2) AS total_fat_g,

    ROUND(SUM(logged_sugar_g), 2) AS total_sugar_g,
    ROUND(SUM(logged_sodium_mg), 2) AS total_sodium_mg,
    ROUND(SUM(logged_potassium_mg), 2) AS total_potassium_mg,
    ROUND(SUM(logged_fiber_g), 2) AS total_fiber_g

FROM food_logs

GROUP BY logged_at::date;