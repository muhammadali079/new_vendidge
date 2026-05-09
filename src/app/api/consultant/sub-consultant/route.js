// import { NextResponse } from "next/server";
// import { db } from "../../../../../lib/db";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const parentId = searchParams.get("parentId");

//     if (!parentId)
//       return NextResponse.json(
//         { error: "Parent ID required" },
//         { status: 400 },
//       );

//     // 1. Fetch Sub-Consultants
//     const subsSql = `
//             SELECT id, name, domain_name, created_at,
//                    can_create_user_invoice, can_view_user_invoice,
//                    can_edit_user_invoice, can_delete_user_invoice,
//                    can_post_user_invoice
//             FROM consultant WHERE parent_id = ? ORDER BY id DESC`;

//     // 2. Fetch Parent Info (To avoid sessionStorage dependency)
//     const parentSql = `SELECT name, domain_name FROM consultant WHERE id = ? LIMIT 1`;

//     const [subs] = await db.execute(subsSql, [parentId]);
//     const [parent] = await db.execute(parentSql, [parentId]);

//     return NextResponse.json({
//       subs,
//       parent: parent[0] || null,
//     });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { name, domain_name, password, parent_id } = body;

//     // Force parent_id from session/params to prevent unauthorized assignment
//     const [result] = await db.execute(
//       `INSERT INTO consultant (parent_id, name, domain_name, password, created_at, updated_at)
//              VALUES (?, ?, ?, ?, NOW(), NOW())`,
//       [parent_id, name, domain_name, password],
//     );

//     return NextResponse.json({ success: true, id: result.insertId });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PUT(req) {
//   try {
//     const body = await req.json();
//     const { id, name, password, permissions } = body;

//     let sql = `UPDATE consultant SET name = ?, updated_at = NOW()`;
//     let params = [name];

//     if (password?.trim()) {
//       sql += `, password = ?`;
//       params.push(password);
//     }

//     // Handle permissions update if provided
//     if (permissions) {
//       sql += `, can_create_user_invoice = ?, can_view_user_invoice = ?,
//                      can_edit_user_invoice = ?, can_delete_user_invoice = ?,
//                      can_post_user_invoice = ?`;
//       params.push(
//         permissions.can_create,
//         permissions.can_view,
//         permissions.can_edit,
//         permissions.can_delete,
//         permissions.can_post,
//       );
//     }

//     sql += ` WHERE id = ?`;
//     params.push(id);

//     await db.execute(sql, params);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

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
        { error: "Parent ID required" },
        { status: 400 },
      );

    const fieldsSelection = PERMISSION_FIELDS.map((f) => `p.${f}`).join(", ");

    // Fetch Sub-Consultants + Their 39 Granular Permissions
    const subsSql = `
        SELECT c.id, c.name, c.domain_name, c.created_at, ${fieldsSelection}
        FROM consultant c
        LEFT JOIN new_users_permissions p ON c.id = p.user_id AND p.role = 'sub_consultant'
        WHERE c.parent_id = ? 
        ORDER BY c.id DESC`;

    const parentSql = `SELECT name, domain_name FROM consultant WHERE id = ? LIMIT 1`;

    const [subs] = await db.execute(subsSql, [parentId]);
    const [parent] = await db.execute(parentSql, [parentId]);

    return NextResponse.json({
      subs,
      parent: parent[0] || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const connection = await db.getConnection();
  try {
    const body = await req.json();
    const { name, domain_name, password, parent_id, ...permissions } = body;

    await connection.beginTransaction();

    // 1. Create Sub-Consultant Identity
    const [result] = await connection.execute(
      `INSERT INTO consultant (parent_id, name, domain_name, password, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [parent_id, name, domain_name, password],
    );
    const subId = result.insertId;

    // 2. Initialize the 39 permissions for this new sub-consultant
    const columns = ["user_id", "role", ...PERMISSION_FIELDS].join(", ");
    const placeholders = [
      "?",
      "'sub_consultant'",
      ...PERMISSION_FIELDS.map(() => "?"),
    ].join(", ");

    const permValues = [
      subId,
      ...PERMISSION_FIELDS.map((f) =>
        permissions[f] === 1 || permissions[f] === true ? 1 : 0,
      ),
    ];

    await connection.execute(
      `INSERT INTO new_users_permissions (${columns}) VALUES (${placeholders})`,
      permValues,
    );

    await connection.commit();
    return NextResponse.json({ success: true, id: subId });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function PUT(req) {
  const connection = await db.getConnection();
  try {
    const body = await req.json();
    const { id, name, password, ...permissions } = body;

    await connection.beginTransaction();

    // 1. Update basic info in consultant table
    let sql = `UPDATE consultant SET name = ?, updated_at = NOW()`;
    let params = [name];

    if (password?.trim()) {
      sql += `, password = ?`;
      params.push(password);
    }
    sql += ` WHERE id = ?`;
    params.push(id);
    await connection.execute(sql, params);

    // 2. Upsert (Insert or Update) the 39 granular permissions
    const columns = ["user_id", "role", ...PERMISSION_FIELDS].join(", ");
    const placeholders = [
      "?",
      "'sub_consultant'",
      ...PERMISSION_FIELDS.map(() => "?"),
    ].join(", ");
    const updates = PERMISSION_FIELDS.map((f) => `${f} = VALUES(${f})`).join(
      ", ",
    );

    const permValues = [
      id,
      ...PERMISSION_FIELDS.map((f) =>
        permissions[f] === 1 || permissions[f] === true ? 1 : 0,
      ),
    ];

    await connection.execute(
      `INSERT INTO new_users_permissions (${columns}) 
       VALUES (${placeholders}) 
       ON DUPLICATE KEY UPDATE ${updates}`,
      permValues,
    );

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}
