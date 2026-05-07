// import { NextResponse } from "next/server";
// import { db } from "../../../../../lib/db";

// export async function GET(req) {
//   try {
//     const isProd = req.cookies.get("isProd")?.value;
//     const { searchParams } = new URL(req.url);

//     const consultantId = searchParams.get("consultantId");
//     const clientsParam = searchParams.get("clients"); // e.g., "12,15,18"
//     const startDate = searchParams.get("startDate");
//     const endDate = searchParams.get("endDate");
//     const search = searchParams.get("search");

//     if (!consultantId) {
//       return NextResponse.json(
//         { message: "consultantId is required" },
//         { status: 400 },
//       );
//     }

//     // 1. Determine if this is a parent consultant or sub-consultant (Shared Pool Logic)
//     const [consultantData] = await db.query(
//       `SELECT id, parent_id FROM consultant WHERE id = ? LIMIT 1`,
//       [consultantId],
//     );

//     if (consultantData.length === 0) {
//       return NextResponse.json(
//         { message: "Consultant not found" },
//         { status: 404 },
//       );
//     }

//     const consultant = consultantData[0];
//     const targetRefCode =
//       consultant.parent_id !== null ? consultant.parent_id : consultant.id;

//     // 2. Set Target Tables based on Production/Sandbox mode
//     const targetTable =
//       isProd === "1" || isProd === "true"
//         ? "new_invoices_prod"
//         : "new_invoices";

//     // 3. Build Dynamic Query
//     // We INNER JOIN with new_users to absolutely guarantee the Consultant only sees their own assigned users.
//     let query = `
//       SELECT
//         inv.*,
//         c.business_name AS customer_name,
//         c.cnic_ntn AS ntn_cnic
//       FROM ${targetTable} inv
//       INNER JOIN new_users u ON inv.user_id = u.id
//       LEFT JOIN new_customers c ON inv.customer_id = c.id
//       WHERE u.ref_code = ?
//     `;

//     const queryParams = [targetRefCode];

//     // 4. Apply Advanced Filters

//     // A. Multi-Select Client Filter
//     if (clientsParam) {
//       const clientIds = clientsParam
//         .split(",")
//         .map((id) => parseInt(id))
//         .filter((id) => !isNaN(id));
//       if (clientIds.length > 0) {
//         query += ` AND inv.user_id IN (?)`;
//         queryParams.push(clientIds);
//       }
//     }

//     // B. Date Range Filter
//     if (startDate && endDate) {
//       query += ` AND inv.invoice_date >= ? AND inv.invoice_date <= ?`;
//       queryParams.push(startDate, endDate);
//     } else if (startDate) {
//       query += ` AND inv.invoice_date >= ?`;
//       queryParams.push(startDate);
//     } else if (endDate) {
//       query += ` AND inv.invoice_date <= ?`;
//       queryParams.push(endDate);
//     }

//     // C. Search Bar Filter (Invoice No)
//     if (search) {
//       query += ` AND inv.invoice_no LIKE ?`;
//       queryParams.push(`%${search}%`);
//     }

//     // 5. Order the results consistently
//     query += `
//       ORDER BY
//         CASE WHEN inv.status = 'Success' THEN 1 ELSE 0 END ASC,
//         CASE WHEN inv.status != 'Success' THEN inv.invoice_date END ASC,
//         CASE WHEN inv.status != 'Success' THEN inv.invoice_no END ASC,
//         CASE WHEN inv.status = 'Success' THEN inv.invoice_date END DESC,
//         CASE WHEN inv.status = 'Success' THEN inv.invoice_no END DESC
//     `;

//     // 6. Execute Query
//     const [invoices] = await db.query(query, queryParams);

//     // Note: For the Master Ledger, we are only fetching the parent invoice headers.
//     // We don't fetch the inner line items (new_invoices_rows) here because the Consultant
//     // ledger table only displays the total amount (inclTax), saving massive database load.

//     return NextResponse.json(
//       {
//         data: invoices,
//         count: invoices.length,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.warn("Error fetching consultant master invoices:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: error.message },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
    const isProd = req.cookies.get("isProd")?.value === "1";
    const { searchParams } = new URL(req.url);

    const consultantId = searchParams.get("consultantId");
    const clientsParam = searchParams.get("clients");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    if (!consultantId) {
      return NextResponse.json(
        { message: "consultantId required" },
        { status: 400 },
      );
    }

    const [consultantData] = await db.query(
      `SELECT id, parent_id FROM consultant WHERE id = ? LIMIT 1`,
      [consultantId],
    );
    const targetRefCode = consultantData[0].parent_id || consultantData[0].id;

    const targetTable = isProd ? "new_invoices_prod" : "new_invoices";
    const targetRowTable = isProd
      ? "new_invoices_rows_prod"
      : "new_invoices_rows";

    // 1. Fetch Invoices with Metadata
    // Note: We join 'ubi' on 'sellerBusinessId' to get the specific business used for the invoice,
    // which prevents duplication compared to joining on user_id.
    let query = `
      SELECT 
        inv.*, 
        ubi.business_name AS business_name,
        ubi.address AS address,
        ubi.province AS province,
        ubi.province_id AS province_id,
        c.business_name AS customer_name, 
        c.cnic_ntn AS ntn_cnic,
        u.token as client_token,
        u.cnic_ntn as seller_ntn,
        u.invoice_ntn as seller_invoice_ntn,
        (SELECT address FROM new_customers_locations WHERE customer_id = inv.customer_id LIMIT 1) AS customer_address
      FROM ${targetTable} inv
      INNER JOIN new_users u ON inv.user_id = u.id
      LEFT JOIN new_customers c ON inv.customer_id = c.id
      LEFT JOIN new_users_business_info ubi ON inv.sellerBusinessId = ubi.id
      WHERE u.ref_code = ?
    `;

    const queryParams = [targetRefCode];

    if (clientsParam) {
      query += ` AND inv.user_id IN (?)`;
      queryParams.push(clientsParam.split(",").map((id) => parseInt(id)));
    }
    if (startDate && endDate) {
      query += ` AND inv.invoice_date >= ? AND inv.invoice_date <= ?`;
      queryParams.push(startDate, endDate);
    }
    if (search) {
      query += ` AND inv.invoice_no LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY inv.invoice_date DESC, inv.invoice_no DESC`;

    const [invoices] = await db.query(query, queryParams);

    if (invoices.length > 0) {
      const invoiceIds = invoices.map((inv) => inv.id);
      const userIds = [...new Set(invoices.map((inv) => inv.user_id))];

      // 2. Hydrate Line Items
      const [allRows] = await db.query(
        `SELECT * FROM ${targetRowTable} WHERE invoice_id IN (?)`,
        [invoiceIds],
      );

      // 3. Hydrate ALL Business Locations for each client (for your sessionStorage)
      const [allLocations] = await db.query(
        `SELECT * FROM new_users_business_info WHERE user_id IN (?)`,
        [userIds],
      );
      //console.log(allLocations, "All Locations for Users:", userIds);
      // 4. Calculate Min Unposted Invoice No PER USER
      const [unpostedResult] = await db.query(
        `SELECT user_id, MIN(invoice_no) as minUnposted 
         FROM ${targetTable} 
         WHERE user_id IN (?) AND status != 'Success'
         GROUP BY user_id`,
        [userIds],
      );

      console.log(unpostedResult, "Min Unposted Invoice No by User:", userIds);

      // Grouping data for merging
      const rowsByInvoice = allRows.reduce((acc, row) => {
        if (!acc[row.invoice_id]) acc[row.invoice_id] = [];
        acc[row.invoice_id].push(row);
        return acc;
      }, {});

      const locationsByUser = allLocations.reduce((acc, loc) => {
        if (!acc[loc.user_id]) acc[loc.user_id] = [];
        acc[loc.user_id].push(loc);
        return acc;
      }, {});

      const minUnpostedByUser = unpostedResult.reduce((acc, res) => {
        acc[res.user_id] = res.minUnposted;
        return acc;
      }, {});

      // 5. Final Merge
      invoices.forEach((inv) => {
        inv.items = rowsByInvoice[inv.id] || [];
        // This 'locations' array is what you need for sessionStorage 'businesses'
        inv.locations = locationsByUser[inv.user_id] || [];
        inv.minUnpostedForUser = minUnpostedByUser[inv.user_id] || null;
      });
    }

    return NextResponse.json(
      { data: invoices, count: invoices.length },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
