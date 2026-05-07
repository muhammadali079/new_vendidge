import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    const [rows] = await db.query(
      `SELECT 
                id, user_id, business_id AS sellerBusinessId, product_description, hsCode, 
                singleUnitPrice, internalSinglePrice, transactionTypeId, transactionType, 
                sroScheduleId, sroSchedule, sroItemId, sroItemSerialNo, 
                rateId, rate, rateDesc, unit, internalUOM,
                fixedNotifiedValueOrRetailPrice, furtherTax, extraTax, 
                salesTaxWithheldAtSource, fedPayable, allowed
             FROM product 
             WHERE user_id = ? 
             ORDER BY id DESC`,
      [userId],
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET Product Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(
      "busines id ",
      body.sellerBusinessId,
      typeof body.sellerBusinessId,
    );
    const [result] = await db.query(
      `INSERT INTO product (
                user_id, business_id, product_description, hsCode, singleUnitPrice, internalSinglePrice,
                transactionTypeId, transactionType, sroScheduleId, sroSchedule,
                sroItemId, sroItemSerialNo, rateId, rate, rateDesc, unit, internalUOM,
                fixedNotifiedValueOrRetailPrice, furtherTax, extraTax, salesTaxWithheldAtSource, fedPayable, allowed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.user_id,
        body.sellerBusinessId,
        body.product_description || "",
        body.hsCode || "",
        parseFloat(body.singleUnitPrice) || 0,
        parseFloat(body.internalSinglePrice) || 0,
        body.transactionTypeId || 0,
        body.transactionType || "",
        body.sroScheduleId || 0,
        body.sroSchedule || "",
        body.sroItemId || 0,
        body.sroItemSerialNo || "",
        body.rateId || 0,
        body.rate || "",
        body.rateDesc || "",
        body.unit || "",
        body.internalUOM || "",
        parseFloat(body.fixedNotifiedValueOrRetailPrice) || 0,
        parseFloat(body.furtherTax) || 0,
        parseFloat(body.extraTax) || 0,
        parseFloat(body.salesTaxWithheldAtSource) || 0,
        parseFloat(body.fedPayable) || 0,
        body.allowed ? 1 : 0,
      ],
    );

    return NextResponse.json({
      message: "Product created",
      id: result.insertId,
    });
  } catch (error) {
    console.error("POST Product Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    await db.query(
      `UPDATE product SET 
                product_description=?, business_id=?, hsCode=?, singleUnitPrice=?, internalSinglePrice=?,
                transactionTypeId=?, transactionType=?, sroScheduleId=?, sroSchedule=?,
                sroItemId=?, sroItemSerialNo=?, rateId=?, rate=?, rateDesc=?, unit=?, internalUOM=?,
                fixedNotifiedValueOrRetailPrice=?, furtherTax=?, extraTax=?, salesTaxWithheldAtSource=?, fedPayable=?, allowed=?
            WHERE id = ? AND user_id = ?`,
      [
        body.product_description || "",
        body.sellerBusinessId,
        body.hsCode || "",
        parseFloat(body.singleUnitPrice) || 0,
        parseFloat(body.internalSinglePrice) || 0,
        body.transactionTypeId || 0,
        body.transactionType || "",
        body.sroScheduleId || 0,
        body.sroSchedule || "",
        body.sroItemId || 0,
        body.sroItemSerialNo || "",
        body.rateId || 0,
        body.rate || "",
        body.rateDesc || "",
        body.unit || "",
        body.internalUOM || "",
        parseFloat(body.fixedNotifiedValueOrRetailPrice) || 0,
        parseFloat(body.furtherTax) || 0,
        parseFloat(body.extraTax) || 0,
        parseFloat(body.salesTaxWithheldAtSource) || 0,
        parseFloat(body.fedPayable) || 0,
        body.allowed ? 1 : 0,
        body.id,
        body.user_id,
      ],
    );

    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.error("PUT Product Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await db.query("DELETE FROM product WHERE id = ?", [id]);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE Product Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
