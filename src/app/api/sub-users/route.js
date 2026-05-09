import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

// exhaustive list of permission fields from your SQL schema
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
    const parentId = searchParams.get("parentId");
    if (!parentId)
      return NextResponse.json(
        { message: "Parent ID is required" },
        { status: 400 },
      );

    const fieldsSelection = PERMISSION_FIELDS.map((f) => `p.${f}`).join(", ");
    const [subUsers] = await db.query(
      `SELECT s.id, s.username, s.domain_name, s.is_active, s.created_at, ${fieldsSelection}
       FROM new_sub_users s
       LEFT JOIN new_users_permissions p ON s.id = p.user_id AND p.role = 'sub_user'
       WHERE s.parent_id = ?`,
      [parentId],
    );

    console.log("sub user", subUsers);
    return NextResponse.json(subUsers);
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, is_active, ...permissions } = body; // Fix: Destructure flat body

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query(
        "UPDATE new_sub_users SET is_active = ? WHERE id = ?",
        [is_active ? 1 : 0, id],
      );

      const columns = ["user_id", "role", ...PERMISSION_FIELDS].join(", ");
      const placeholders = [
        "?",
        "'sub_user'",
        ...PERMISSION_FIELDS.map(() => "?"),
      ].join(", ");
      const updates = PERMISSION_FIELDS.map((f) => `${f} = VALUES(${f})`).join(
        ", ",
      );

      const values = [
        id,
        ...PERMISSION_FIELDS.map((f) =>
          permissions[f] === 1 || permissions[f] === true ? 1 : 0,
        ),
      ];

      await connection.query(
        `INSERT INTO new_users_permissions (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`,
        values,
      );

      await connection.commit();
      connection.release();
      return NextResponse.json({ message: "Updated successfully" });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
