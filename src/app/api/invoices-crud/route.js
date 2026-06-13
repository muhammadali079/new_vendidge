import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  // 1. Get a dedicated connection from the pool for transaction control
  const connection = await db.getConnection();

  try {
    const isProd = req.cookies.get("isProd")?.value === "1";
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      internal_inv_ref_no,
      sellerNTNCNIC,
      sellerBusinessId,
      sellerBusinessName,
      sellerAddress,
      userId,
      customerId,
      buyerProvince,
      sellerProvince,
      sellerProvinceId,
      scenarioCode,
      saleType,
      buyerType,
      fbrInvoiceRefNo,
      date,
      challanNo,
      challanDate,
      exclTax,
      tax,
      inclTax,
      tax236H,
      grandTotal,
      items,
    } = body;

    // 2. Validate mandatory fields (ignoring invoiceNo from frontend as we generate it here)
    if (
      !userId ||
      !customerId ||
      !date ||
      !buyerProvince ||
      !sellerProvince ||
      !sellerProvinceId ||
      !buyerType ||
      !saleType ||
      !items
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 3. Start the Transaction on the dedicated connection
    await connection.beginTransaction();

    console.log("seller business id ", sellerBusinessId);
    console.log("seller business name", sellerBusinessName);
    console.log("seller business address", sellerAddress);

    const targetTable = isProd ? "new_invoices_prod" : "new_invoices";
    const targetRowTable = isProd
      ? "new_invoices_rows_prod"
      : "new_invoices_rows";

    // 3. Safely calculate and LOCK the next invoice roundTo2Num for this user
    const [rowResult] = await connection.query(
      `SELECT COALESCE(MAX(invoice_no), 0) + 1 AS nextNo 
       FROM ${targetTable} 
       WHERE user_id = ? 
       FOR UPDATE`,
      [userId],
    );

    const nextInvoiceNo = rowResult[0].nextNo;

    // 4. Insert the main invoice (without the items JSON)
    const [result] = await connection.query(
      `INSERT INTO ${targetTable} (
        invoice_no, 
        internal_inv_ref_no,
        user_id, 
        invoice_date, 
        customer_id, 
        buyerProvince, 
        sellerProvince, 
        sellerProvinceId, 
        sellerBusinessId, 
        sellerBusinessName, 
        sellerBusinessAddress, 
        scenario_code, 
        saleType, 
        buyerType, 
        fbrInvoiceRefNo,
        challanNo,
        challanDate,
        exclTax,
        tax,
        inclTax,
        tax236H,
        grandTotal,
        invoice_created_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        nextInvoiceNo,
        internal_inv_ref_no,
        userId,
        date,
        customerId,
        buyerProvince,
        sellerProvince,
        sellerProvinceId,
        sellerBusinessId,
        sellerBusinessName,
        sellerAddress,
        scenarioCode,
        saleType,
        buyerType,
        fbrInvoiceRefNo,
        challanNo || null,
        challanDate || null,
        exclTax || "0.0",
        tax || "0.0",
        inclTax || "0.0",
        tax236H || "0.0",
        grandTotal || "0.0",
      ],
    );

    const newInvoiceId = result.insertId;

    // 5. Bulk Insert the rows into the new table
    if (items && items.length > 0) {
      const rowValues = items.map((item) => [
        newInvoiceId,
        nextInvoiceNo,
        item.hsCode,
        item.description,
        item.productId,
        item.product_description,
        item.singleUnitPrice,
        item.qty || "0.00",
        item.rateId,
        item.rate,
        item.rateDesc,
        item.unit,
        item.totalValues,
        item.valueSalesExcludingST,
        item.fixedNotifiedValueOrRetailPrice || "0.00",
        item.salesTaxApplicable,
        item.salesTaxWithheldAtSource || "0.00",
        item.extraTax || "0.00",
        item.furtherTax || "0.00",
        item.sroScheduleNo,
        item.sroScheduleId,
        item.fedPayable || "0.00",
        item.discount || "0.00",
        item.TransactionTypeId,
        item.TransactionType,
        item.sroItemSerialNo,
        item.sroItemId,
        item.internalQty,
        item.internalSinglePrice,
        item.internalUOM,
      ]);

      await connection.query(
        `INSERT INTO ${targetRowTable} (
          invoice_id, invoice_no, hsCode, description, productId, product_description,
          singleUnitPrice, qty, rateId, rate, rateDesc, unit, totalValues,
          valueSalesExcludingST, fixedNotifiedValueOrRetailPrice, salesTaxApplicable,
          salesTaxWithheldAtSource, extraTax, furtherTax, sroScheduleNo, sroScheduleId,
          fedPayable, discount, TransactionTypeId, TransactionType, sroItemSerialNo,
          sroItemId, internalQty, internalSinglePrice, internalUOM
        ) VALUES ?`,
        [rowValues],
      );
    }

    // 6. Commit the transaction to make the new invoice and roundTo2Num permanent
    await connection.commit();

    return NextResponse.json(
      {
        message: "Invoice saved successfully",
        invoiceId: result.insertId,
        invoiceNo: nextInvoiceNo,
      },
      { status: 200 },
    );
  } catch (error) {
    // 7. If any step fails, rollback all changes on this connection
    if (connection) await connection.rollback();
    console.error("Database Transaction Error:", error);

    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  } finally {
    // 8. Always release the connection back to the pool
    if (connection) connection.release();
  }
}

// export async function GET(req) {
//   try {
//     const isProd = req.cookies.get('isProd')?.value;

//     console.log('isProd:', isProd);

//     const { searchParams } = new URL(req.url);

//     const page = parseInt(searchParams.get('page')) || 1;
//     const pageSize = parseInt(searchParams.get('pageSize')) || 10;
//     const userId = parseInt(searchParams.get('userId'));
//     console.log('userId:', userId);
//     if (page < 1 || pageSize < 1) {
//       return NextResponse.json(
//         { message: 'Invalid pagination parameters' },
//         { status: 400 }
//       );
//     }
//     let rows;
//     if (isProd === '1' || isProd === 'true') {
//       console.log('Running in Production mode');
//       [rows] = await db.query(
//         `CALL get_invoices_by_status_order_paginated_prod(?, ?, ?)`,
//         [page, pageSize, userId]
//       );
//     } else {
//       console.log('Running in Development mode');
//       [rows] = await db.query(
//         `CALL get_new_invoices_by_status_order_paginated(?, ?, ?)`,
//         [page, pageSize, userId]
//       );

//     }
//     const invoices = rows[0];

//     return NextResponse.json(
//       {
//         data: invoices,
//         page,
//         pageSize,
//         count: invoices.length
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.warn('Error fetching invoices:', error);
//     return NextResponse.json(
//       { message: 'Internal server error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req) {
  try {
    const isProd = req.cookies.get("isProd")?.value;
    const { searchParams } = new URL(req.url);

    const userId = parseInt(searchParams.get("userId"));
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Missing userId, startDate, or endDate" },
        { status: 400 },
      );
    }

    const targetTable =
      isProd === "1" || isProd === "true"
        ? "new_invoices_prod"
        : "new_invoices";

    const targetRowTable =
      isProd === "1" || isProd === "true"
        ? "new_invoices_rows_prod"
        : "new_invoices_rows";

    const unpostedQuery = `
      SELECT MIN(invoice_no) as minUnposted 
      FROM ${targetTable} 
      WHERE user_id = ? AND status != 'Success'
    `;
    const [unpostedResult] = await db.query(unpostedQuery, [userId]);
    const minUnpostedInvoiceNo = unpostedResult[0].minUnposted || null;
    const query = `
      SELECT 
        inv.*, 
        cl.business_name AS customer_name, 
        c.ntn AS ntn
      FROM ${targetTable} inv
      LEFT JOIN new_customers c ON inv.customer_id = c.id
      left join new_customers_locations cl on c.id = cl.customer_id
      WHERE inv.user_id = ? 
        AND inv.invoice_date >= ? 
        AND inv.invoice_date <= ?
      ORDER BY 
        CASE WHEN inv.status = 'Success' THEN 1 ELSE 0 END ASC,
        CASE WHEN inv.status != 'Success' THEN inv.invoice_date END ASC,
        CASE WHEN inv.status != 'Success' THEN inv.invoice_no END ASC,
        CASE WHEN inv.status = 'Success' THEN inv.invoice_date END DESC,
        CASE WHEN inv.status = 'Success' THEN inv.invoice_no END DESC
    `;

    const [invoices] = await db.query(query, [userId, startDate, endDate]);
    if (invoices.length > 0) {
      const invoiceIds = invoices.map((inv) => inv.id);

      const [rows] = await db.query(
        `SELECT * FROM ${targetRowTable} WHERE invoice_id IN (?)`,
        [invoiceIds],
      );

      // Group rows by invoice_id
      const rowsByInvoice = rows.reduce((acc, row) => {
        if (!acc[row.invoice_id]) acc[row.invoice_id] = [];
        acc[row.invoice_id].push(row);
        return acc;
      }, {});

      // Attach rows to their parent invoices
      invoices.forEach((inv) => {
        inv.items = rowsByInvoice[inv.id] || [];
      });
    }
    console.dir(invoices, { depth: null });
    return NextResponse.json(
      {
        data: invoices,
        count: invoices.length,
        minUnpostedInvoiceNo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.warn("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  const connection = await db.getConnection();
  try {
    const isProd = req.cookies.get("isProd")?.value === "1";
    //const isProd = req.cookies.get('isProd')?.value;

    console.log("isProd:", isProd, typeof isProd);
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 },
      );
    }
    const token = authHeader.replace(/^Bearer\s+/i, "");
    console.log("Token:", token);

    const body = await req.json();
    const {
      invoiceId,
      invoiceNo,
      internal_inv_ref_no,
      sellerNTNCNIC,
      sellerBusinessId,
      sellerBusinessName,
      sellerAddress,
      date,
      customerId,
      buyerProvince,
      sellerProvince,
      sellerProvinceId,
      scenarioCode,
      scenarioCodeId,
      saleType,
      buyerType,
      fbrInvoiceRefNo,
      items,
      status,
      toValidate,
      challanDate,
      challanNo,
      exclTax,
      tax,
      inclTax,
      tax236H,
      grandTotal,
    } = body;
    console.log(
      JSON.stringify(
        {
          toValidate,
          invoiceId,
          invoiceNo,
          sellerNTNCNIC,
          sellerBusinessName,
          sellerAddress,
          date,
          customerId,
          buyerProvince,
          sellerProvince,
          sellerProvinceId,
          scenarioCode,
          saleType,
          buyerType,
          fbrInvoiceRefNo,
          items,
          status,
        },
        null,
        2,
      ),
    );

    console.log("to Validate:", toValidate);
    if (!invoiceId) {
      return NextResponse.json(
        { message: "invoiceId is required" },
        { status: 400 },
      );
    }
    const FBR_VALIDATE_URL = isProd
      ? process.env.VALIDATE_TO_FBR_PRODUCTION
      : process.env.VALIDATE_TO_FBR_SANDBOX;

    const [buyerInfoRows] = await connection.query(
      `SELECT 
      nc.ntn AS buyerNTNCNIC,
      ncl.business_name AS buyerBusinessName,
      ncl.address AS buyerAddress,
      ncl.province_name AS buyerProvince
   FROM new_customers nc
   LEFT JOIN new_customers_locations ncl 
        ON ncl.id = (
            SELECT id 
            FROM new_customers_locations 
            WHERE customer_id = nc.id 
            ORDER BY id ASC 
            LIMIT 1
        )
   WHERE nc.id = ?`,
      [customerId],
    );
    const buyerInfo = buyerInfoRows[0];
    console.log("Buyer Info:", buyerInfo);

    const [sellerInfoRows] = await connection.query(
      `SELECT 
     id as userId
   FROM new_users 
   WHERE cnic_ntn = ?`,
      [sellerNTNCNIC],
    );

    const sellerInfo = sellerInfoRows[0];
    console.log("Seller Info:", sellerInfo);
    //   const [scenarioCodeRow] = awaitse db.query(
    //     `SELECT
    //    code
    //  FROM scenario_codes
    //  WHERE id = ?`,
    //     [scenarioCodeId]
    //   );
    //   const scenarioCode = scenarioCodeRow[0];
    //   console.log("Scenario Code:", scenarioCode.code);
const roundTo4Num = (num) => Math.round(roundTo2Num(num || 0) * 10000) / 10000;
const roundTo2Num = (num) => Math.round(roundTo2Num(num || 0) * 100) / 100;
    const fbrPayload = (() => {
      switch (scenarioCode) {
        case "SN001":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
             valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
          
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              // extraTax: roundTo2Num(item.extraTax || ""),
              extraTax: roundTo2Num(item.extraTax) > 0 ? roundTo2Num(item.extraTax) : "",
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN002":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              // extraTax: roundTo2Num(item.extraTax || ""),
              extraTax: roundTo2Num(item.extraTax) > 0 ? roundTo2Num(item.extraTax) : "",
              furtherTax: NuroundTo2Nummber(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN003":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN004":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN005":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              // extraTax: roundTo2Num(item.extraTax || ""),
              extraTax: roundTo2Num(item.extraTax) > 0 ? roundTo2Num(item.extraTax) : "",
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN006":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              // extraTax: roundTo2Num(item.extraTax || ""),
              extraTax: roundTo2Num(item.extraTax) > 0 ? roundTo2Num(item.extraTax) : "",
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN007":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN008":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN009":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN010":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN011":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            dataSource: "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN012":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN013":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN014":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN015":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            additional1: "",
            additional2: "",
            additional3: "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN016":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN017":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN018":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN019":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN020":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN021":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN022":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN023":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN024":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN025":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              // extraTax: roundTo2Num(item.extraTax || ""),
              extraTax: roundTo2Num(item.extraTax) > 0 ? roundTo2Num(item.extraTax) : "",
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN026":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN027":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        case "SN028":
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            ...(!isProd && { scenarioId: scenarioCode }),
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              // extraTax: roundTo2Num(item.extraTax || ""),
              extraTax: roundTo2Num(item.extraTax) > 0 ? roundTo2Num(item.extraTax) : "",

              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
        default:
          return {
            invoiceType: saleType,
            invoiceDate: date,
            sellerNTNCNIC: sellerNTNCNIC,
            sellerBusinessName: sellerBusinessName,
            sellerProvince: sellerProvince,
            sellerAddress: sellerAddress,
            buyerNTNCNIC: buyerInfo.buyerNTNCNIC,
            buyerBusinessName: buyerInfo.buyerBusinessName,
            buyerProvince: buyerInfo.buyerProvince,
            buyerAddress: buyerInfo.buyerAddress,
            buyerRegistrationType: buyerType,
            invoiceRefNo: fbrInvoiceRefNo || "",
            sourceInvoiceNo: internal_inv_ref_no,
            items: items.map((item) => ({
              hsCode: item.hsCode,
              productDescription: item.description,
              rate: item.rateDesc,
              uoM: item.unit,
              quantity: roundTo4Num(item.qty),
              totalValues: roundTo2Num(item.totalValues || item.valueInclTax || 0),
              valueSalesExcludingST: roundTo2Num(item.valueSalesExcludingST),
              fixedNotifiedValueOrRetailPrice: roundTo2Num(
                item.fixedNotifiedValueOrRetailPrice || 0,
              ),
              salesTaxApplicable: roundTo2Num(item.salesTaxApplicable || 0),
              salesTaxWithheldAtSource: roundTo2Num(
                item.salesTaxWithheldAtSource || 0,
              ),
              extraTax: roundTo2Num(item.extraTax || 0),
              furtherTax: roundTo2Num(item.furtherTax || 0),
              sroScheduleNo: item.sroScheduleNo || "",
              fedPayable: roundTo2Num(item.fedPayable || 0),
              discount: roundTo2Num(item.discount || 0),
              saleType: item.TransactionType || "",
              sroItemSerialNo: item.sroItemSerialNo || "",
            })),
          };
      }
    })();

    if (toValidate) {
      console.log("FBR Validation Payload:", fbrPayload);
      const fbrResponse = await fetch(FBR_VALIDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fbrPayload),
      });
      if (fbrResponse.status === 503 || fbrResponse.status === 504) {
        return NextResponse.json(
          {
            message:
              "FBR Service is currently unavailable. Status reset to Pending.",
            success: false,
          },
          { status: 503 },
        );
      }
      // const rawText = await fbrResponse.text();
      // const fbrResult = await fbrResponse.json();
      // const rawText = await fbrResponse.text();

      let fbrResult;
      try {
        // fbrResult = JSON.parse(rawText);
        fbrResult = await fbrResponse.json();
      } catch (e) {
        console.error("FBR returned non-JSON:", fbrResult);

        return NextResponse.json(
          {
            message: "Invalid response from FBR",
            rawResponse: rawText,
          },
          { status: 502 },
        );
      }

      console.log(
        "FBR Validation Response:",
        JSON.stringify(fbrResult, null, 2),
      );
      const fbrstatus = fbrResult.validationResponse.status;
      console.log("FBR Validation Status:", fbrstatus, typeof fbrstatus);
      if (fbrstatus !== "Valid") {
        if (isProd) {
          await connection.query(
            `UPDATE new_invoices_prod SET status = 'Failed' WHERE id = ?`,
            [invoiceId],
          );
        } else {
          await connection.query(
            `UPDATE new_invoices SET status = 'Failed' WHERE id = ?`,
            [invoiceId],
          );
        }
        let errorData = [];

        if (
          fbrResult.validationResponse.invoiceStatuses &&
          fbrResult.validationResponse.invoiceStatuses.length > 0
        ) {
          errorData = fbrResult.validationResponse.invoiceStatuses;
        } else {
          errorData = [
            {
              itemSNo: "0",
              statusCode: fbrResult.validationResponse.statusCode,
              status: fbrResult.validationResponse.status,
              errorCode: fbrResult.validationResponse.errorCode,
              error: fbrResult.validationResponse.error,
            },
          ];
        }
        let errorTable = isProd
          ? "new_invoices_prod_error"
          : "new_invoices_error";
        await connection.query(
          `INSERT INTO ${errorTable} (userid, invoiceid, error) 
   VALUES (?, ?, ?) 
   ON DUPLICATE KEY UPDATE error = VALUES(error)`,
          [sellerInfo.userId, invoiceId, JSON.stringify(errorData)],
        );
        return NextResponse.json(
          {
            message: "FBR validation failed, See Error Logs",
            fbrResponse: fbrResult,
          },
          { status: 400 },
        );
      } else {
        if (isProd) {
          await connection.query(
            `UPDATE new_invoices_prod SET status = 'Validated' WHERE id = ?`,
            [invoiceId],
          );
        } else {
          await connection.query(
            `UPDATE new_invoices SET status = 'Validated' WHERE id = ?`,
            [invoiceId],
          );
        }
        return NextResponse.json(
          { message: "Invoice validated successfully" },
          { status: 200 },
        );
      }
    }
    // Build the update depending on provided fields
    const updates = [];
    const params = [];

    if (typeof invoiceNo !== "undefined") {
      updates.push("invoice_no = ?");
      params.push(invoiceNo);
    }
    if (typeof internal_inv_ref_no !== "undefined") {
      updates.push("internal_inv_ref_no = ?");
      params.push(internal_inv_ref_no);
    }
    if (typeof date !== "undefined") {
      updates.push("invoice_date = ?");
      params.push(date);
    }
    if (typeof customerId !== "undefined") {
      updates.push("customer_id = ?");
      params.push(customerId);
    }
    if (typeof buyerProvince !== "undefined") {
      updates.push("buyerProvince = ?");
      params.push(buyerProvince);
    }
    if (typeof sellerBusinessId !== "undefined") {
      updates.push("sellerBusinessId = ?");
      params.push(sellerBusinessId);
    }
    if (typeof sellerBusinessName !== "undefined") {
      updates.push("sellerBusinessName = ?");
      params.push(sellerBusinessName);
    }
    if (typeof sellerAddress !== "undefined") {
      updates.push("sellerBusinessAddress = ?");
      params.push(sellerAddress);
    }
    if (typeof sellerProvinceId !== "undefined") {
      updates.push("sellerProvinceId = ?");
      params.push(sellerProvinceId);
    }
    if (typeof sellerProvince !== "undefined") {
      updates.push("sellerProvince = ?");
      params.push(sellerProvince);
    }
    if (typeof scenarioCode !== "undefined") {
      updates.push("scenario_code = ?");
      params.push(scenarioCode);
    }
    if (typeof saleType !== "undefined") {
      updates.push("saleType = ?");
      params.push(saleType);
    }
    if (typeof buyerType !== "undefined") {
      updates.push("buyerType = ?");
      params.push(buyerType);
    }
    if (typeof fbrInvoiceRefNo !== "undefined") {
      updates.push("fbrInvoiceRefNo = ?");
      params.push(fbrInvoiceRefNo);
    }
    // if (typeof items !== "undefined") {
    //   updates.push("items = ?");
    //   params.push(JSON.stringify(items));
    // }
    if (typeof status !== "undefined") {
      updates.push("status = ?");
      params.push(status);
    }
    if (typeof challanNo !== "undefined") {
      updates.push("challanNo = ?");
      params.push(challanNo === "" ? null : challanNo);
    }
    if (typeof challanDate !== "undefined") {
      updates.push("challanDate = ?");
      params.push(challanDate === "" ? null : challanDate);
    }
    if (typeof exclTax !== "undefined") {
      updates.push("exclTax = ?");
      params.push(exclTax || "0.0");
    }
    if (typeof tax !== "undefined") {
      updates.push("tax = ?");
      params.push(tax || "0.0");
    }
    if (typeof inclTax !== "undefined") {
      updates.push("inclTax = ?");
      params.push(inclTax || "0.0");
    }
    if (typeof tax236H !== "undefined") {
      updates.push("tax236H = ?");
      params.push(tax236H || "0.0");
    }
    if (typeof grandTotal !== "undefined") {
      updates.push("grandTotal = ?");
      params.push(grandTotal || "0.0");
    }
    if (typeof inclTax !== "undefined") {
      updates.push("inclTax = ?");
      params.push(inclTax || "0.0");
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 },
      );
    }
    let sql;
    if (isProd) {
      sql = `UPDATE new_invoices_prod SET ${updates.join(", ")} WHERE id = ?`;
    } else {
      sql = `UPDATE new_invoices SET ${updates.join(", ")} WHERE id = ?`;
    }

    params.push(invoiceId);

    if (!toValidate) {
      await connection.query(sql, params);
      if (isProd) {
        await connection.query(
          `UPDATE invoices_prod SET status = 'Pending' WHERE id = ?`,
          [invoiceId],
        );
      } else {
        await connection.query(
          `UPDATE new_invoices SET status = 'Pending' WHERE id = ?`,
          [invoiceId],
        );
      }
      const targetRowTable = isProd
        ? "new_invoices_rows_prod"
        : "new_invoices_rows";
      if (items && items.length > 0) {
        await connection.query(
          `DELETE FROM ${targetRowTable} WHERE invoice_id = ?`,
          [invoiceId],
        );

        const rowValues = items.map((item) => [
          invoiceId,
          invoiceNo,
          item.hsCode,
          item.description,
          item.productId,
          item.product_description,
          item.singleUnitPrice,
          item.qty || "0.0000",
          item.rateId,
          item.rate,
          item.rateDesc,
          item.unit,
          item.totalValues,
          item.valueSalesExcludingST,
          item.fixedNotifiedValueOrRetailPrice || "0.00",
          item.salesTaxApplicable,
          item.salesTaxWithheldAtSource || "0.00",
          item.extraTax || "0.00",
          item.furtherTax || "0.00",
          item.sroScheduleNo,
          item.sroScheduleId,
          item.fedPayable || "0.00",
          item.discount || "0.00",
          item.TransactionTypeId,
          item.TransactionType,
          item.sroItemSerialNo,
          item.sroItemId,
          item.internalQty,
          item.internalSinglePrice,
          item.internalUOM,
        ]);

        await connection.query(
          `INSERT INTO ${targetRowTable} (
            invoice_id, invoice_no, hsCode, description, productId, product_description,
            singleUnitPrice, qty, rateId, rate, rateDesc, unit, totalValues,
            valueSalesExcludingST, fixedNotifiedValueOrRetailPrice, salesTaxApplicable,
            salesTaxWithheldAtSource, extraTax, furtherTax, sroScheduleNo, sroScheduleId,
            fedPayable, discount, TransactionTypeId, TransactionType, sroItemSerialNo,
            sroItemId, internalQty, internalSinglePrice, internalUOM
            ) VALUES ?`,
          [rowValues],
        );
      }
      return NextResponse.json(
        { message: "Invoice  saved successfully" },
        { status: 200 },
      );
    }
  } catch (error) {
    console.warn("Error updating invoice:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  const connection = await db.getConnection();

  try {
    const isProd = req.cookies.get("isProd")?.value === "1";

    console.log("isProd:", isProd);

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    console.log("invoice id ", invoiceId);

    if (!invoiceId) {
      return NextResponse.json(
        { message: "invoiceId is required" },
        { status: 400 },
      );
    }

    const targetTable = isProd ? "new_invoices_prod" : "new_invoices";
    const targetRowTable = isProd
      ? "new_invoices_rows_prod"
      : "new_invoices_rows";

    await connection.beginTransaction();
    let rows;
    if (isProd === "1" || isProd === "true") {
      [rows] = await connection.query(
        `SELECT invoice_no, status, user_id 
       FROM new_invoices_prod 
       WHERE id = ? 
       FOR UPDATE`,
        [invoiceId],
      );
    } else {
      [rows] = await connection.query(
        `SELECT invoice_no, status, user_id 
       FROM new_invoices 
       WHERE id = ? 
       FOR UPDATE`,
        [invoiceId],
      );
    }

    if (rows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    const { invoice_no, status, user_id } = rows[0];
    console.log(invoice_no, status, user_id);

    if (status === "Success") {
      await connection.rollback();
      return NextResponse.json(
        { message: "Success invoice cannot be deleted" },
        { status: 403 },
      );
    }

    await connection.query(
      `DELETE FROM ${targetRowTable} WHERE invoice_id = ?`,
      [invoiceId],
    );

    // 3. Delete parent invoice
    await connection.query(`DELETE FROM ${targetTable} WHERE id = ?`, [
      invoiceId,
    ]);

    // 4. Rearrange remaining invoice roundTo2Nums in Parent Table
    await connection.query(
      `UPDATE ${targetTable} SET invoice_no = invoice_no - 1 WHERE user_id = ? AND invoice_no > ?`,
      [user_id, invoice_no],
    );
    await connection.query(
      `UPDATE ${targetRowTable} r 
       JOIN ${targetTable} p ON r.invoice_id = p.id 
       SET r.invoice_no = r.invoice_no - 1 
       WHERE p.user_id = ? AND r.invoice_no > ?`,
      [user_id, invoice_no],
    );

    await connection.commit();

    return NextResponse.json(
      { message: "Invoice deleted and invoice roundTo2Nums rearranged" },
      { status: 200 },
    );
  } catch (error) {
    await connection.rollback();
    console.warn("Error deleting invoice:", error);

    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
