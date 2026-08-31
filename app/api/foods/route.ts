import pool from "@/src/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM foods
      ORDER BY food_id;
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);

    return Response.json(
      { error: "Failed to load foods" },
      { status: 500 }
    );
  }
}