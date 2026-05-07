import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const sql = `
            SELECT c.id, c.parent_id, c.name, c.domain_name,
                   ci.business_name, ci.cnic_ntn, ci.address, ci.contact, ci.email
            FROM consultant c
            LEFT JOIN consultant_info ci ON c.id = ci.consultant_id
            WHERE c.id = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [id]);

    const result = rows[0] || {};
    // Clean the domain for the UI: remove admin@ prefix if present
    if (result.domain_name && result.domain_name.includes("@")) {
      result.domain_name = result.domain_name.split("@")[1];
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const conn = await db.getConnection();
  try {
    const body = await req.json();
    const {
      id,
      name,
      domain_name,
      password,
      business_name,
      cnic_ntn,
      address,
      contact,
      email,
    } = body;

    // Database stores the full identity: admin@root.com
    const finalDomain = `admin@${domain_name.replace("admin@", "")}`;

    await conn.beginTransaction();

    // 1. Update Core Table
    let cSql = `UPDATE consultant SET name = ?, domain_name = ?, updated_at = NOW()`;
    let cParams = [name, finalDomain];
    if (password?.trim()) {
      cSql += `, password = ?`;
      cParams.push(password);
    }
    cSql += ` WHERE id = ?`;
    cParams.push(id);
    await conn.execute(cSql, cParams);

    // 2. Upsert Info Table (Now works due to Unique Index)
    const iSql = `
            INSERT INTO consultant_info (consultant_id, business_name, cnic_ntn, address, contact, email)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                business_name = VALUES(business_name), cnic_ntn = VALUES(cnic_ntn),
                address = VALUES(address), contact = VALUES(contact), email = VALUES(email)`;
    await conn.execute(iSql, [
      id,
      business_name,
      cnic_ntn,
      address,
      contact,
      email,
    ]);

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
