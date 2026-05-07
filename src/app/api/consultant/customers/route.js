import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    const clientsParam = searchParams.get("clients");

    if (!consultantId)
      return NextResponse.json(
        { message: "consultantId required" },
        { status: 400 },
      );

    const [consultant] = await db.query(
      `SELECT id, parent_id FROM consultant WHERE id = ?`,
      [consultantId],
    );
    const targetRefCode = consultant[0].parent_id || consultant[0].id;

    // Fetch Customers + Client Portfolio Details
    let query = `
      SELECT 
        c.*, 
        u.token AS client_token, 
        u.cnic_ntn AS seller_ntn,
        ubi.business_name AS seller_name
      FROM new_customers c
      INNER JOIN new_users u ON c.user_id = u.id
      LEFT JOIN new_users_business_info ubi ON u.id = ubi.user_id AND ubi.id = (
          SELECT id FROM new_users_business_info WHERE user_id = u.id LIMIT 1
      )
      WHERE u.ref_code = ?
    `;

    const queryParams = [targetRefCode];
    if (clientsParam) {
      query += ` AND c.user_id IN (?)`;
      queryParams.push(clientsParam.split(",").map((id) => parseInt(id)));
    }

    const [customers] = await db.query(
      query + " ORDER BY c.id DESC",
      queryParams,
    );

    // Hydrate Locations and User-Businesses for Context
    if (customers.length > 0) {
      const custIds = customers.map((c) => c.id);
      const userIds = [...new Set(customers.map((c) => c.user_id))];

      const [locations] = await db.query(
        `SELECT * FROM new_customers_locations WHERE customer_id IN (?)`,
        [custIds],
      );
      const [userBiz] = await db.query(
        `SELECT * FROM new_users_business_info WHERE user_id IN (?)`,
        [userIds],
      );

      const locMap = locations.reduce((acc, l) => {
        (acc[l.customer_id] = acc[l.customer_id] || []).push(l);
        return acc;
      }, {});
      const bizMap = userBiz.reduce((acc, b) => {
        (acc[b.user_id] = acc[b.user_id] || []).push(b);
        return acc;
      }, {});

      customers.forEach((c) => {
        c.locations = locMap[c.id] || [];
        c.all_client_businesses = bizMap[c.user_id] || [];
      });
    }

    return NextResponse.json(customers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
