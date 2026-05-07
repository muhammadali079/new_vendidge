import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
export async function PUT(req) {
  const connection = await db.getConnection();
  try {
    const body = await req.json();
    const {
      id,
      seller_name,
      strn,
      email,
      contact,
      bearer_token,
      invoice_type,
      businesses,
      deleted_businesses,
    } = body;
    const isProd = invoice_type === "production" ? 1 : 0;

    await connection.beginTransaction();

    // 1. Update Primary User Table
    await connection.execute(
      `UPDATE new_users SET seller_name = ? , strn=? ,email = ?, contact = ?, token = ?, isProd = ?, updated_at = NOW() WHERE id = ?`,
      [seller_name, strn, email, contact, bearer_token, isProd, id],
    );

    // 2. Handle Deleted Businesses (Your specific logic)
    if (deleted_businesses && deleted_businesses.length > 0) {
      const placeholders = deleted_businesses.map(() => "?").join(",");
      await connection.execute(
        `DELETE FROM new_users_business_info WHERE id IN (${placeholders}) AND user_id = ?`,
        [...deleted_businesses, id],
      );
    }

    // 3. Handle Multi-Business Loop (Insert or Update)
    for (const biz of businesses) {
      if (biz.isNew) {
        await connection.execute(
          `INSERT INTO new_users_business_info (user_id, business_name, province_id, province, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
          [id, biz.business_name, biz.province_id, biz.province, biz.address],
        );
      } else {
        await connection.execute(
          `UPDATE new_users_business_info SET business_name = ?, province_id = ?, province = ?, address = ?, updated_at = NOW() WHERE id = ?`,
          [
            biz.business_name,
            biz.province_id,
            biz.province,
            biz.address,
            biz.id,
          ],
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    console.log("user id ", userId);

    // 1. Get Main User Data
    const [userRows] = await db.query(
      `SELECT id, seller_name, root_domain, password, cnic_ntn, invoice_ntn, strn, email, contact, token, isProd FROM new_users WHERE id = ?`,
      [userId],
    );

    if (userRows.length === 0)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    console.log("user", userRows);
    // 2. Get All Businesses for this User
    const [businessRows] = await db.query(
      `SELECT * FROM new_users_business_info WHERE user_id = ?`,
      [userId],
    );

    // Combine them

    console.log("business ", businessRows);
    const userData = {
      ...userRows[0],
      businesses: businessRows,
    };

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}
