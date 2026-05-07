import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      "SELECT id, name FROM company_type ORDER BY name ASC",
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company types" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
