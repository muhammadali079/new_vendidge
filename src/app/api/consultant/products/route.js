import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
    const isProd = req.cookies.get("isProd")?.value === "1";
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    const clientsParam = searchParams.get("clients"); // e.g., "12,15"

    if (!consultantId) {
      return NextResponse.json(
        { message: "consultantId required" },
        { status: 400 },
      );
    }

    // 1. Identify Pool (Parent or Sub)
    const [consultantData] = await db.query(
      `SELECT id, parent_id FROM consultant WHERE id = ? LIMIT 1`,
      [consultantId],
    );
    const targetRefCode = consultantData[0].parent_id || consultantData[0].id;

    // 2. Fetch Products with Client Information
    let query = `
      SELECT 
        p.*, 
        u.cnic_ntn AS client_ntn,
        u.token AS client_token,
        ubi.business_name AS seller_business_name,
        ubi.address AS seller_address,
        ubi.province AS seller_province,
        ubi.province_id AS seller_province_id
      FROM product p
      INNER JOIN new_users u ON p.user_id = u.id
      LEFT JOIN new_users_business_info ubi ON p.business_id = ubi.id
      WHERE u.ref_code = ?
    `;

    const queryParams = [targetRefCode];

    if (clientsParam) {
      const ids = clientsParam.split(",").map((id) => parseInt(id));
      query += ` AND p.user_id IN (?)`;
      queryParams.push(ids);
    }

    query += ` ORDER BY p.id DESC`;

    const [products] = await db.query(query, queryParams);

    // 3. Hydrate all business locations for each user (for context switching)
    if (products.length > 0) {
      const userIds = [...new Set(products.map((p) => p.user_id))];
      const [allLocations] = await db.query(
        `SELECT * FROM new_users_business_info WHERE user_id IN (?)`,
        [userIds],
      );

      const locationsByUser = allLocations.reduce((acc, loc) => {
        if (!acc[loc.user_id]) acc[loc.user_id] = [];
        acc[loc.user_id].push(loc);
        return acc;
      }, {});

      products.forEach((p) => {
        p.all_client_locations = locationsByUser[p.user_id] || [];
      });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
