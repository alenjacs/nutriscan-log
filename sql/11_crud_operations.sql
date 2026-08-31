-- =========================================================
-- NutriScan Log
-- Edit and Delete Operations
-- =========================================================


-- ---------------------------------------------------------
-- UPDATE
-- ---------------------------------------------------------
-- Example:
-- OCR reads a nutrition label incorrectly.
-- The user fixes the values on the review screen.
--
-- RETURNING gives the application the corrected row back
-- immediately after the UPDATE.

UPDATE foods
SET
    calories = 105,
    protein_g = 18,
    sodium_mg = 60
WHERE food_id = 1
RETURNING
    food_id,
    name,
    calories,
    protein_g,
    sodium_mg;


-- ---------------------------------------------------------
-- CREATE A TEST LOG
-- ---------------------------------------------------------

SELECT log_food_consumption(1, 175);


-- ---------------------------------------------------------
-- DELETE
-- ---------------------------------------------------------
-- Delete the newest log for food_id = 1.
--
-- RETURNING lets the application know exactly which
-- record PostgreSQL deleted.

DELETE FROM food_logs
WHERE log_id = (
    SELECT MAX(log_id)
    FROM food_logs
    WHERE food_id = 1
)
RETURNING
    log_id,
    food_id,
    consumed_amount,
    logged_calories;