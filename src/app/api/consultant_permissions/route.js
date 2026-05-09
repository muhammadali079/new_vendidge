import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

const PERMISSION_FIELDS = [
  "can_view_invoice",
  "can_edit_invoice",
  "can_create_invoice",
  "can_delete_invoice",
  "can_post_invoice",
  "can_view_product",
  "can_edit_product",
  "can_create_product",
  "can_delete_product",
  "can_view_customer",
  "can_edit_customer",
  "can_create_customer",
  "can_delete_customer",
  "can_edit_single_unit_price",
  "can_edit_transaction_type",
  "can_edit_rate",
  "can_edit_retail_price",
  "can_edit_sro_schedule",
  "can_edit_sro_item",
  "can_edit_furthur_tax",
  "can_edit_extra_tax",
  "can_edit_sales_tax",
  "can_edit_fed_payable",
  "can_edit_internal_single_unit_price",
  "can_edit_internal_uom",
  "can_edit_print_orientation",
  "can_edit_print_internal_single_unit",
  "can_edit_print_internal_qty",
  "can_edit_print_retail_price",
  "can_edit_print_extra_tax",
  "can_edit_print_furthur_tax",
  "can_edit_print_fed_payable",
  "can_edit_print_sales_tax",
  "can_edit_print_seller_name",
  "can_edit_print_seller_address",
  "can_edit_print_seller_ntn",
  "can_edit_print_invoice_date",
  "can_edit_print_challan_no",
  "can_edit_print_challan_date",
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId)
      return NextResponse.json(
        { message: "Admin ID missing" },
        { status: 400 },
      );

    const [adminRows] = await db.query(
      "SELECT ref_code FROM new_users WHERE id = ?",
      [adminId],
    );

    if (!adminRows.length || !adminRows[0].ref_code) {
      console.log("No ref_code found for Admin:", adminId);
      return NextResponse.json(null);
    }

    // 2. Convert to Integer in JS to kill collation issues
    const consultantId = parseInt(adminRows[0].ref_code);

    // 3. Use the Integer ID for the main data query
    const fieldsSelection = PERMISSION_FIELDS.map((f) => `p.${f}`).join(", ");

    const [consultantData] = await db.query(
      `SELECT
        p.user_id as id,
        ci.business_name, 
        ci.cnic_ntn, 
        ${fieldsSelection}
       FROM new_users_permissions p
       LEFT JOIN consultant_info ci ON ci.consultant_id = p.user_id
          
       WHERE p.user_id = ? AND p.role = 'admin_consultant'`,
      [consultantId],
    );

    console.log("Final Consultant Data:", consultantData);

    return NextResponse.json(consultantData[0] || null);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const body = await req.json();

    // Extract ID (from the Admin's ref_code)
    const consultantId = body.consultantId || body.id;

    if (!consultantId) {
      return NextResponse.json(
        { message: "Consultant ID is required" },
        { status: 400 },
      );
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. UPSERT PARENT CONSULTANT PERMISSIONS
      // Role is 'admin_consultant' for the main consultant assigned to the Admin
      const columns = ["user_id", "role", ...PERMISSION_FIELDS].join(", ");
      const placeholders = [
        "?",
        "'admin_consultant'",
        ...PERMISSION_FIELDS.map(() => "?"),
      ].join(", ");
      const updates = PERMISSION_FIELDS.map((f) => `${f} = VALUES(${f})`).join(
        ", ",
      );

      const parentValues = [
        consultantId,
        ...PERMISSION_FIELDS.map((f) =>
          body[f] === 1 || body[f] === true ? 1 : 0,
        ),
      ];

      await connection.query(
        `INSERT INTO new_users_permissions (${columns}) 
         VALUES (${placeholders}) 
         ON DUPLICATE KEY UPDATE ${updates}`,
        parentValues,
      );

      // 2. CASCADE REVOKES TO CHILD CONSULTANTS
      // We look at the 'consultant' table you provided where parent_id = consultantId
      for (const field of PERMISSION_FIELDS) {
        const isRevoked = body[field] === 0 || body[field] === false;

        if (isRevoked) {
          /**
           * Using INSERT ... SELECT ... ON DUPLICATE KEY UPDATE
           * This finds all children in the 'consultant' table and forces their
           * permission to 0 in the 'new_users_permissions' table.
           */
          await connection.query(
            `INSERT INTO new_users_permissions (user_id, role, ${field})
             SELECT id, 'sub_consultant', 0 
             FROM consultant 
             WHERE parent_id = ?
             ON DUPLICATE KEY UPDATE ${field} = 0`,
            [consultantId],
          );
        }
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        message: "Consultant and Child permissions synced successfully.",
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error("PUT Transaction Error:", err);
      throw err;
    }
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
