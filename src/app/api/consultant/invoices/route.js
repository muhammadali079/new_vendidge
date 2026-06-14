// import { NextResponse } from "next/server";
// import { db } from "../../../../../lib/db";

// export async function GET(req) {
//   try {
//     const isProd = req.cookies.get("isProd")?.value === "1";
//     const { searchParams } = new URL(req.url);

//     const consultantId = searchParams.get("consultantId");
//     const clientsParam = searchParams.get("clients");
//     const startDate = searchParams.get("startDate");
//     const endDate = searchParams.get("endDate");
//     const search = searchParams.get("search");

//     if (!consultantId) {
//       return NextResponse.json(
//         { message: "consultantId required" },
//         { status: 400 },
//       );
//     }

//     const [consultantData] = await db.query(
//       `SELECT id, parent_id FROM consultant WHERE id = ? LIMIT 1`,
//       [consultantId],
//     );
//     const targetRefCode = consultantData[0].parent_id || consultantData[0].id;

//     const targetTable = isProd ? "new_invoices_prod" : "new_invoices";
//     const targetRowTable = isProd
//       ? "new_invoices_rows_prod"
//       : "new_invoices_rows";

//     // 1. BASE QUERY (WITHOUT ORDER BY)
//     let query = `
//       SELECT 
//         inv.*, 
//         ubi.business_name AS business_name,
//         ubi.address AS address,
//         ubi.province AS province,
//         ubi.province_id AS province_id,
//         u.token AS client_token,
//         u.cnic_ntn AS seller_ntn,
//         u.invoice_ntn AS seller_invoice_ntn,
//         nc.ntn AS customer_ntn,
//         cl.customer_address,
//         cl.customer_name
//       FROM ${targetTable} inv
//       INNER JOIN new_users u ON inv.user_id = u.id
//       LEFT JOIN new_customers nc ON inv.customer_id = nc.id
//       LEFT JOIN new_users_business_info ubi ON inv.sellerBusinessId = ubi.id
//       LEFT JOIN (
//         SELECT 
//           customer_id, 
//           address AS customer_address, 
//           business_name AS customer_name 
//         FROM new_customers_locations
//         WHERE id IN (
//           SELECT MIN(id) FROM new_customers_locations GROUP BY customer_id
//         )
//       ) cl ON inv.customer_id = cl.customer_id
//       WHERE u.ref_code = ?
//     `;

//     const queryParams = [targetRefCode];

//     // 2. DYNAMIC FILTERS
//     if (clientsParam) {
//       query += ` AND inv.user_id IN (?)`;
//       queryParams.push(clientsParam.split(",").map((id) => parseInt(id)));
//     }
//     if (startDate && endDate) {
//       query += ` AND inv.invoice_date >= ? AND inv.invoice_date <= ?`;
//       queryParams.push(startDate, endDate);
//     }
//     if (search) {
//       query += ` AND inv.invoice_no LIKE ?`;
//       queryParams.push(`%${search}%`);
//     }

//     // 3. ADD ORDER BY AT THE VERY END
//     query += ` ORDER BY inv.invoice_date DESC, inv.invoice_no DESC`;

//     const [invoices] = await db.query(query, queryParams);

//     if (invoices && invoices.length > 0) {
//       const invoiceIds = invoices.map((inv) => inv.id);
//       const userIds = [...new Set(invoices.map((inv) => inv.user_id))];

//       // 4. Hydrate metadata in parallel
//       const [allRows, allLocations, unpostedResult] = await Promise.all([
//         db.query(`SELECT * FROM ${targetRowTable} WHERE invoice_id IN (?)`, [
//           invoiceIds,
//         ]),
//         db.query(`SELECT * FROM new_users_business_info WHERE user_id IN (?)`, [
//           userIds,
//         ]),
//         db.query(
//           `SELECT user_id, MIN(invoice_no) as minUnposted FROM ${targetTable} WHERE user_id IN (?) AND status != 'Success' GROUP BY user_id`,
//           [userIds],
//         ),
//       ]);

//       // Mappings
//       const rowsByInvoice = allRows[0].reduce((acc, row) => {
//         if (!acc[row.invoice_id]) acc[row.invoice_id] = [];
//         acc[row.invoice_id].push(row);
//         return acc;
//       }, {});

//       const locationsByUser = allLocations[0].reduce((acc, loc) => {
//         if (!acc[loc.user_id]) acc[loc.user_id] = [];
//         acc[loc.user_id].push(loc);
//         return acc;
//       }, {});

//       const minUnpostedByUser = unpostedResult[0].reduce((acc, res) => {
//         acc[res.user_id] = res.minUnposted;
//         return acc;
//       }, {});

//       // Final Merge
//       invoices.forEach((inv) => {
//         inv.items = rowsByInvoice[inv.id] || [];
//         inv.locations = locationsByUser[inv.user_id] || [];
//         inv.minUnpostedForUser = minUnpostedByUser[inv.user_id] || null;
//       });
//     }

//     // Fixed Debug Log
//     if (invoices) {
//       console.log(
//         `Successfully fetched ${invoices.length} invoices for Consultant ${consultantId}`,
//       );
//       console.dir(invoices); // Uncomment if you need deep object inspection
//     }

//     return NextResponse.json(
//       { data: invoices || [], count: invoices ? invoices.length : 0 },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("SQL Error in Consultant Invoices:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
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

    // 1. Resolve Consultant Hierarchy References
    const [consultantData] = await db.query(
      `SELECT id, parent_id FROM consultant WHERE id = ? LIMIT 1`,
      [consultantId],
    );
    if (!consultantData || consultantData.length === 0) {
      return NextResponse.json({ message: "Consultant not found" }, { status: 404 });
    }
    const targetRefCode = consultantData[0].parent_id || consultantData[0].id;

    // 2. Identify Target Clients
    let targetUserIds = [];
    if (clientsParam) {
      targetUserIds = clientsParam.split(",").map((id) => parseInt(id));
    } else {
      // If no explicit clients filter is passed, fetch all user IDs tied to this consultant code
      const [allUsers] = await db.query(
        `SELECT id FROM new_users WHERE ref_code = ?`,
        [targetRefCode]
      );
      targetUserIds = allUsers.map((u) => u.id);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ data: [], count: 0 }, { status: 200 });
    }

    // 3. Look up environmental configurations for each client from your users table
    // Adjust the 'isProd' column target selection to match your exact users table schema
    const [userConfigs] = await db.query(
      `SELECT id, isProd FROM new_users WHERE id IN (?)`,
      [targetUserIds]
    );

    const prodUserIds = [];
    const sandboxUserIds = [];

    userConfigs.forEach((u) => {
      const isUserProd = u.isProd === 1 || u.isProd === true || u.isProd === "1" || u.isProd === "true";
      if (isUserProd) {
        prodUserIds.push(u.id);
      } else {
        sandboxUserIds.push(u.id);
      }
    });

    // 4. Construct a dynamic UNION query strategy
    let unionQueries = [];
    const queryParams = [];

    // Base sub-query structural component template
    const makeSubQuery = (tableName) => `
      SELECT 
        inv.*, 
        '${tableName === "new_invoices_prod" ? "PROD" : "SANDBOX"}' as env_mode,
        ubi.business_name AS business_name,
        ubi.address AS address,
        ubi.province AS province,
        ubi.province_id AS province_id,
        u.token AS client_token,
        u.cnic_ntn AS seller_ntn,
        u.invoice_ntn AS seller_invoice_ntn,
        nc.ntn AS customer_ntn,
        cl.customer_address,
        cl.customer_name
      FROM ${tableName} inv
      INNER JOIN new_users u ON inv.user_id = u.id
      LEFT JOIN new_customers nc ON inv.customer_id = nc.id
      LEFT JOIN new_users_business_info ubi ON inv.sellerBusinessId = ubi.id
      LEFT JOIN (
        SELECT 
          customer_id, 
          address AS customer_address, 
          business_name AS customer_name 
        FROM new_customers_locations
        WHERE id IN (
          SELECT MIN(id) FROM new_customers_locations GROUP BY customer_id
        )
      ) cl ON inv.customer_id = cl.customer_id
      WHERE u.ref_code = ? AND inv.user_id IN (?)
    `;

    // Inject production user array parameters
    if (prodUserIds.length > 0) {
      let sub = makeSubQuery("new_invoices_prod");
      queryParams.push(targetRefCode, prodUserIds);
      
      if (startDate && endDate) {
        sub += ` AND inv.invoice_date >= ? AND inv.invoice_date <= ?`;
        queryParams.push(startDate, endDate);
      }
      if (search) {
        sub += ` AND inv.invoice_no LIKE ?`;
        queryParams.push(`%${search}%`);
      }
      unionQueries.push(sub);
    }

    // Inject sandbox user array parameters
    if (sandboxUserIds.length > 0) {
      let sub = makeSubQuery("new_invoices");
      queryParams.push(targetRefCode, sandboxUserIds);
      
      if (startDate && endDate) {
        sub += ` AND inv.invoice_date >= ? AND inv.invoice_date <= ?`;
        queryParams.push(startDate, endDate);
      }
      if (search) {
        sub += ` AND inv.invoice_no LIKE ?`;
        queryParams.push(`%${search}%`);
      }
      unionQueries.push(sub);
    }

    // Combine sections together with a final global order constraint
    let finalQuery = unionQueries.join(" UNION ALL ");
    finalQuery += ` ORDER BY invoice_date DESC, invoice_no DESC`;

    const [invoices] = await db.query(finalQuery, queryParams);

    // 5. Hydrate metadata in parallel across environments cleanly
    if (invoices && invoices.length > 0) {
      const invoiceIdsByEnv = invoices.reduce((acc, inv) => {
        if (!acc[inv.env_mode]) acc[inv.env_mode] = [];
        acc[inv.env_mode].push(inv.id);
        return acc;
      }, { PROD: [], SANDBOX: [] });

      const userIds = [...new Set(invoices.map((inv) => inv.user_id))];

      // Run sub-hydration requests concurrently
      const promises = [
        db.query(`SELECT * FROM new_users_business_info WHERE user_id IN (?)`, [userIds]),
      ];

      // Query production database rows if items are present
      if (invoiceIdsByEnv.PROD.length > 0) {
        promises.push(db.query(`SELECT * FROM new_invoices_rows_prod WHERE invoice_id IN (?)`, [invoiceIdsByEnv.PROD]));
        promises.push(db.query(`SELECT user_id, MIN(invoice_no) as minUnposted FROM new_invoices_prod WHERE user_id IN (?) AND status != 'Success' GROUP BY user_id`, [prodUserIds]));
      } else {
        promises.push(Promise.resolve([[]]));
        promises.push(Promise.resolve([[]]));
      }

      // Query sandbox database rows if items are present
      if (invoiceIdsByEnv.SANDBOX.length > 0) {
        promises.push(db.query(`SELECT * FROM new_invoices_rows WHERE invoice_id IN (?)`, [invoiceIdsByEnv.SANDBOX]));
        promises.push(db.query(`SELECT user_id, MIN(invoice_no) as minUnposted FROM new_invoices WHERE user_id IN (?) AND status != 'Success' GROUP BY user_id`, [sandboxUserIds]));
      } else {
        promises.push(Promise.resolve([[]]));
        promises.push(Promise.resolve([[]]));
      }

      const [allLocations, prodRows, prodMinUnposted, sandboxRows, sandboxMinUnposted] = await Promise.all(promises);

      // Consolidate child tracking properties
      const combinedRows = [...(prodRows[0] || []), ...(sandboxRows[0] || [])];
      const rowsByInvoice = combinedRows.reduce((acc, row) => {
        if (!acc[row.invoice_id]) acc[row.invoice_id] = [];
        acc[row.invoice_id].push(row);
        return acc;
      }, {});

      const locationsByUser = allLocations[0].reduce((acc, loc) => {
        if (!acc[loc.user_id]) acc[loc.user_id] = [];
        acc[loc.user_id].push(loc);
        return acc;
      }, {});

      const minUnpostedByUser = {};
      const appendMinUnposted = (rowsArray) => {
        if (Array.isArray(rowsArray)) {
          rowsArray.forEach((r) => { minUnpostedByUser[r.user_id] = r.minUnposted; });
        }
      };
      appendMinUnposted(prodMinUnposted[0]);
      appendMinUnposted(sandboxMinUnposted[0]);

      // Map references back onto parent dataset array
      invoices.forEach((inv) => {
        inv.items = rowsByInvoice[inv.id] || [];
        inv.locations = locationsByUser[inv.user_id] || [];
        inv.minUnpostedForUser = minUnpostedByUser[inv.user_id] || null;
      });
    }

    return NextResponse.json(
      { data: invoices || [], count: invoices ? invoices.length : 0 },
      { status: 200 },
    );
  } catch (error) {
    console.error("SQL Error in Consultant Multi-Tenant Union Engine:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}