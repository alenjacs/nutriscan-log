-- =========================================================
-- NutriScan Log
-- Indexes and Data Validation
-- =========================================================


-- ---------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------

-- Speeds up JOINs between foods and food_logs.
CREATE INDEX idx_food_logs_food_id
ON food_logs(food_id);


-- Speeds up queries that filter/sort logs by date.
CREATE INDEX idx_food_logs_logged_at
ON food_logs(logged_at);


-- Speeds up food-name searches.
CREATE INDEX idx_foods_name
ON foods(name);


-- ---------------------------------------------------------
-- DATA VALIDATION
-- ---------------------------------------------------------

-- Nutrition values should never be negative.
ALTER TABLE foods
ADD CONSTRAINT non_negative_nutrition
CHECK (
    protein_g >= 0
    AND carbs_g >= 0
    AND fat_g >= 0
    AND sugar_g >= 0
    AND sodium_mg >= 0
    AND potassium_mg >= 0
    AND fiber_g >= 0

    AND (saturated_fat_g IS NULL OR saturated_fat_g >= 0)
    AND (trans_fat_g IS NULL OR trans_fat_g >= 0)
    AND (cholesterol_mg IS NULL OR cholesterol_mg >= 0)
    AND (calcium_mg IS NULL OR calcium_mg >= 0)
    AND (iron_mg IS NULL OR iron_mg >= 0)
    AND (vitamin_d_mcg IS NULL OR vitamin_d_mcg >= 0)
);


-- A calculated scale factor must be greater than zero.
ALTER TABLE food_logs
ADD CONSTRAINT positive_scale_factor
CHECK (scale_factor > 0);