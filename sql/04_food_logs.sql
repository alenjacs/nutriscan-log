-- =========================================================
-- NutriScan Log
-- Food Log Data + JOIN
-- =========================================================


-- Log 250 g of Greek Yogurt.
-- Label serving size: 175 g
-- Scale factor: 250 / 175 = 1.4286

INSERT INTO food_logs (
    food_id,
    consumed_amount,
    consumed_unit,
    scale_factor,
    logged_calories,
    logged_protein_g,
    logged_carbs_g,
    logged_fat_g
)
VALUES (
    1,
    250,
    'g',
    1.4286,
    142.86,
    24.29,
    10.00,
    0
);


-- Combine food information with its logged consumption.
SELECT
    food_logs.log_id,
    foods.name,
    foods.brand,
    food_logs.consumed_amount,
    food_logs.consumed_unit,
    food_logs.logged_calories,
    food_logs.logged_protein_g,
    food_logs.logged_at
FROM food_logs
JOIN foods
    ON food_logs.food_id = foods.food_id;