import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const consultantId = searchParams.get("consultantId");

  if (!consultantId) {
    return NextResponse.json(
      { error: "Consultant ID required" },
      { status: 400 },
    );
  }

  try {
    // 1. Fetch User data joined with Business Info
    // We use a LEFT JOIN to ensure users show up even if they don't have extra business info yet
    const [rows] = await db.query(
      `SELECT 
        u.id, 
        u.seller_name, 
        u.root_domain, 
        u.cnic_ntn, 
        u.provinceId, 
        u.province, 
        u.token,
        u.address,
        b.id AS business_info_id,
        b.business_name AS business_name,
        b.province_id AS province_id,
        b.province AS province,
        b.address AS address
      FROM new_users u
      LEFT JOIN new_users_business_info b ON u.id = b.user_id
      WHERE u.ref_code = ? AND u.isAllowed = 1`,
      [consultantId],
    );

    // 2. Group the locations under each unique user
    const clientsMap = {};

    rows.forEach((row) => {
      if (!clientsMap[row.id]) {
        clientsMap[row.id] = {
          id: row.id,
          seller_name: row.seller_name,
          business_name: row.business_name,
          root_domain: row.root_domain,
          cnic_ntn: row.cnic_ntn,
          provinceId: row.provinceId,
          province: row.province,
          token: row.token,
          address: row.address,
          businesses: [], // Array to hold multiple business locations
        };
      }

      // If a business info record exists for this user, add it to the businesses array
      if (row.business_info_id) {
        clientsMap[row.id].businesses.push({
          id: row.business_info_id,
          business_name: row.business_name,
          province_id: row.province_id,
          province: row.province,
          address: row.address,
        });
      }
    });

    // Convert the map back into a flat array for the frontend
    const result = Object.values(clientsMap);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch Consultant Clients Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}
