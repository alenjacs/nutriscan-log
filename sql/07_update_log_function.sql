-- =========================================================
-- NutriScan Log
-- Update Serving Calculation for Full Nutrition Data
-- =========================================================

CREATE OR REPLACE FUNCTION log_food_consumption(
    p_food_id BIGINT,
    p_consumed_amount NUMERIC
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_food foods%ROWTYPE;
    v_scale_factor NUMERIC(10, 4);
    v_log_id BIGINT;
BEGIN

    SELECT *
    INTO v_food
    FROM foods
    WHERE food_id = p_food_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Food ID % does not exist', p_food_id;
    END IF;

    v_scale_factor :=
        p_consumed_amount / v_food.serving_size_value;

    INSERT INTO food_logs (
        food_id,
        consumed_amount,
        consumed_unit,
        scale_factor,

        logged_calories,
        logged_protein_g,
        logged_carbs_g,
        logged_fat_g,

        logged_sugar_g,
        logged_sodium_mg,
        logged_potassium_mg,
        logged_fiber_g,
        logged_saturated_fat_g,
        logged_trans_fat_g,
        logged_cholesterol_mg,
        logged_calcium_mg,
        logged_iron_mg,
        logged_vitamin_d_mcg
    )
    VALUES (
        p_food_id,
        p_consumed_amount,
        v_food.serving_size_unit,
        v_scale_factor,

        ROUND(v_food.calories * v_scale_factor, 2),
        ROUND(COALESCE(v_food.protein_g, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.carbs_g, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.fat_g, 0) * v_scale_factor, 2),

        ROUND(COALESCE(v_food.sugar_g, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.sodium_mg, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.potassium_mg, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.fiber_g, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.saturated_fat_g, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.trans_fat_g, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.cholesterol_mg, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.calcium_mg, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.iron_mg, 0) * v_scale_factor, 2),
        ROUND(COALESCE(v_food.vitamin_d_mcg, 0) * v_scale_factor, 2)
    )
    RETURNING log_id INTO v_log_id;

    RETURN v_log_id;

END;
$$;