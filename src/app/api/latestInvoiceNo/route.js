import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const isProd = req.cookies.get("isProd")?.value;

  console.log("isProd:", isProd);
  console.log("user_id:", user_id);

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const targetTable =
      isProd === "1" || isProd === "true"
        ? "new_invoices_prod"
        : "new_invoices";

    console.log("Target table for latest invoice query:", targetTable);
    const [rows] = await db.query(
      `
  SELECT internal_inv_ref_no AS latest_invoice
  FROM ${targetTable}
   WHERE user_id = ? 
     AND internal_inv_ref_no IS NOT NULL 
     AND TRIM(internal_inv_ref_no) != ''
   ORDER BY id DESC 
   LIMIT 1`,
      [user_id],
    );
    console.log("Latest invoice rows:", rows);
    const latestInvoice = rows[0]?.latest_invoice ?? 0;
    console.log("Latest invoice number:", latestInvoice);
    return NextResponse.json({ latestInvoice });
  } catch (err) {
    console.warn(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
