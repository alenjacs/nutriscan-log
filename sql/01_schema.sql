-- =========================================================
-- NutriScan Log
-- PostgreSQL Database Schema
-- =========================================================

-- Stores nutrition information for each food product.
CREATE TABLE foods (
    food_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    brand VARCHAR(150),

    serving_size_value NUMERIC(8, 2) NOT NULL,
    serving_size_unit VARCHAR(20) NOT NULL,

    calories NUMERIC(8, 2) NOT NULL,
    protein_g NUMERIC(8, 2) DEFAULT 0,
    carbs_g NUMERIC(8, 2) DEFAULT 0,
    fat_g NUMERIC(8, 2) DEFAULT 0,
    sugar_g NUMERIC(8, 2) DEFAULT 0,
    sodium_mg NUMERIC(8, 2) DEFAULT 0,
    potassium_mg NUMERIC(8, 2) DEFAULT 0,
    fiber_g NUMERIC(8, 2) DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_serving_size
        CHECK (serving_size_value > 0),

    CONSTRAINT non_negative_calories
        CHECK (calories >= 0)
);


-- Stores each time a food is consumed.
CREATE TABLE food_logs (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    food_id BIGINT NOT NULL,

    consumed_amount NUMERIC(8, 2) NOT NULL,
    consumed_unit VARCHAR(20) NOT NULL,

    scale_factor NUMERIC(10, 4) NOT NULL,

    logged_calories NUMERIC(8, 2) NOT NULL,
    logged_protein_g NUMERIC(8, 2) DEFAULT 0,
    logged_carbs_g NUMERIC(8, 2) DEFAULT 0,
    logged_fat_g NUMERIC(8, 2) DEFAULT 0,

    logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id),

    CONSTRAINT positive_consumed_amount
        CHECK (consumed_amount > 0)
);