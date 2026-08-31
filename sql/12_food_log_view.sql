-- =========================================================
-- NutriScan Log
-- Food Log Display View
-- =========================================================

-- Combines food information with consumption logs.
-- The website can query this view for the food-log table.

CREATE OR REPLACE VIEW food_log_details AS
SELECT
    fl.log_id,
    fl.logged_at,

    f.food_id,
    f.name AS food_name,
    f.brand,

    fl.consumed_amount,
    fl.consumed_unit,

    fl.logged_calories,
    fl.logged_protein_g,
    fl.logged_carbs_g,
    fl.logged_fat_g,
    fl.logged_sugar_g,
    fl.logged_sodium_mg,
    fl.logged_potassium_mg,
    fl.logged_fiber_g

FROM food_logs AS fl

JOIN foods AS f
    ON fl.food_id = f.food_id;