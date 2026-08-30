-- =========================================================
-- NutriScan Log
-- Automatic Serving-Size Calculation
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

    -- Get the food row we want to log.
    SELECT *
    INTO v_food
    FROM foods
    WHERE food_id = p_food_id;


    -- Stop if the food ID does not exist.
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Food ID % does not exist', p_food_id;
    END IF;


    -- Calculate how much of one serving was consumed.
    v_scale_factor :=
        p_consumed_amount / v_food.serving_size_value;


    -- Insert the calculated nutrition into food_logs.
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
        p_food_id,
        p_consumed_amount,
        v_food.serving_size_unit,
        v_scale_factor,

        ROUND(v_food.calories * v_scale_factor, 2),
        ROUND(v_food.protein_g * v_scale_factor, 2),
        ROUND(v_food.carbs_g * v_scale_factor, 2),
        ROUND(v_food.fat_g * v_scale_factor, 2)
    )
    RETURNING log_id INTO v_log_id;


    RETURN v_log_id;

END;
$$;