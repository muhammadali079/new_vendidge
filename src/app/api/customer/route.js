import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const connection = await db.getConnection();
  try {
    const body = await req.json();
    const {
      userId,
      customer_name,
      cnic,
      ntn,
      strn,
      contact,
      email,
      allowed,
      locations,
    } = body;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connection.beginTransaction();

    const [result] = await connection.query(
      `SELECT customer_id FROM new_customers WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
      [userId],
    );
    console.log("Last customer_id for user:", result);
    let nextNum;

    if (result.length === 0) {
      nextNum = "CUST-001"; // Default starting ID
    } else {
      const lastId = result[0].customer_id; // e.g., 'CUST-002'

      // Extract only the digits using Regex
      const numericPart = lastId.match(/\d+/);

      if (numericPart) {
        const nextInt = parseInt(numericPart[0]) + 1;
        // Rebuild the string with the prefix and padding (e.g., CUST-003)
        nextNum = `CUST-${String(nextInt).padStart(3, "0")}`;
      } else {
        // Fallback if the format is corrupted
        nextNum = "CUST-001";
      }
    }

    const [custResult] = await connection.query(
      `INSERT INTO new_customers 
              (user_id, customer_id, customer_name, cnic, ntn, strn, contact, email, allowed, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        nextNum,
        customer_name || null,
        cnic || null,
        ntn,
        strn || null,
        contact || null,
        email || null,
        allowed ? 1 : 0,
      ],
    );
    const newDbId = custResult.insertId;

    if (locations && locations.length > 0) {
      const locationValues = locations.map((loc) => [
        newDbId,
        loc.business_name, // <-- Added here
        loc.province_id,
        loc.province_name,
        loc.address,
        new Date(),
      ]);
      await connection.query(
        `INSERT INTO new_customers_locations (customer_id, business_name, province_id, province_name, address, created_at) VALUES ?`,
        [locationValues],
      );
    }

    await connection.commit();
    return NextResponse.json(
      { success: true, customer_id: nextNum },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();
    console.error("Add customer error:", error);
    return NextResponse.json(
      { error: "Failed to add customer" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

export async function PUT(req) {
  const connection = await db.getConnection();
  try {
    const body = await req.json();
    const {
      userId,
      id,
      customer_name,
      cnic,
      ntn,
      strn,
      contact,
      email,
      allowed,
      locations,
      deletedLocationIds,
    } = body;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE new_customers 
             SET customer_name = ?, cnic = ?, ntn = ?, strn = ?, contact = ?, email = ?, allowed = ?, updated_at = NOW() 
             WHERE id = ? AND user_id = ?`,
      [
        customer_name || null,
        cnic || null,
        ntn,
        strn || null,
        contact || null,
        email || null,
        allowed ? 1 : 0,
        id,
        userId,
      ],
    );

    if (deletedLocationIds && deletedLocationIds.length > 0) {
      await connection.query(
        `DELETE FROM new_customers_locations WHERE id IN (?) AND customer_id = ?`,
        [deletedLocationIds, id],
      );
    }

    for (const loc of locations) {
      if (loc.id) {
        await connection.query(
          `UPDATE new_customers_locations SET business_name = ?, province_id = ?, province_name = ?, address = ?, updated_at = NOW() WHERE id = ? AND customer_id = ?`,
          [
            loc.business_name,
            loc.province_id,
            loc.province_name,
            loc.address,
            loc.id,
            id,
          ],
        );
      } else {
        await connection.query(
          `INSERT INTO new_customers_locations (customer_id, business_name, province_id, province_name, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            id,
            loc.business_name,
            loc.province_id,
            loc.province_name,
            loc.address,
          ],
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Update customer error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const [rows] = await db.query(
      `SELECT 
                c.id, c.user_id, c.customer_id, c.customer_name, 
                c.cnic, c.ntn, c.strn, c.contact, c.email, c.allowed,
                l.id as loc_id, l.business_name as loc_business_name, l.province_id, l.province_name, l.address
            FROM new_customers c
            LEFT JOIN new_customers_locations l ON c.id = l.customer_id
            WHERE c.user_id = ?
            ORDER BY c.id DESC`,
      [userId],
    );

    const customersMap = rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          user_id: row.user_id,
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          cnic: row.cnic,
          ntn: row.ntn,
          strn: row.strn,
          contact: row.contact,
          email: row.email,
          allowed: row.allowed === 1,
          locations: [],
        };
      }

      if (row.loc_id) {
        acc[row.id].locations.push({
          id: row.loc_id,
          business_name: row.loc_business_name,
          province_id: row.province_id,
          province_name: row.province_name,
          address: row.address,
        });
      }
      return acc;
    }, {});
    console.log("customers map:", customersMap);

    return NextResponse.json(Object.values(customersMap));
  } catch (error) {
    console.error("Fetch customer error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
