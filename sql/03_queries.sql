-- =========================================================
-- NutriScan Log
-- Basic PostgreSQL Queries
-- =========================================================


-- Select specific columns from the foods table.
SELECT name, calories, protein_g
FROM foods;


-- Filter foods based on protein content.
SELECT name, calories, protein_g
FROM foods
WHERE protein_g >= 10;


-- Sort foods from highest to lowest protein.
SELECT name, calories, protein_g
FROM foods
ORDER BY protein_g DESC;