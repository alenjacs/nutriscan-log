-- =========================================================
-- NutriScan Log
-- Sample Data
-- =========================================================

INSERT INTO foods (
    name,
    brand,
    serving_size_value,
    serving_size_unit,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    sugar_g,
    sodium_mg,
    potassium_mg,
    fiber_g
)
VALUES
(
    'Greek Yogurt',
    'Oikos',
    175,
    'g',
    100,
    17,
    7,
    0,
    5,
    65,
    220,
    0
),
(
    'Peanut Butter',
    'Kraft',
    32,
    'g',
    190,
    7,
    7,
    16,
    3,
    140,
    180,
    2
),
(
    'Whole Wheat Bread',
    'Dempsters',
    70,
    'g',
    180,
    7,
    32,
    2,
    4,
    310,
    160,
    4
);