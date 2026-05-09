// import { NextResponse } from "next/server";
// import { db } from "../../../../../lib/db";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const consultantId = searchParams.get("consultantId");

//     // Fetch only Admins assigned to this consultant
//     const [admins] = await db.execute(
//       `SELECT
//           u.id as user_id, u.seller_name as name, 'admin' as role,
//           p.can_create_invoice as can_create, p.can_view_invoice as can_view,
//           p.can_edit_invoice as can_edit, p.can_delete_invoice as can_delete,
//           p.can_post_invoice as can_post
//        FROM new_users u
//        LEFT JOIN new_users_permissions p ON u.id = p.user_id AND p.role = 'admin'
//        WHERE u.ref_code = ?
//        ORDER BY u.id DESC`,
//       [consultantId],
//     );

//     // Default missing permissions to 1 (Allowed)
//     console.log("Fetched admins:", admins);
//     const result = (admins || []).map((admin) => ({
//       ...admin,
//       can_create: admin.can_create ?? 0,
//       can_view: admin.can_view ?? 0,
//       can_edit: admin.can_edit ?? 0,
//       can_delete: admin.can_delete ?? 0,
//       can_post: admin.can_post ?? 0,
//     }));

//     return NextResponse.json(result);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PUT(req) {
//   let conn;
//   try {
//     const { updates } = await req.json();
//     conn = await db.getConnection();
//     await conn.beginTransaction();

//     for (const item of updates) {
//       // 1. Update the Admin's specific permissions
//       await conn.execute(
//         `INSERT INTO new_users_permissions (user_id, role, can_create_invoice, can_view_invoice, can_edit_invoice, can_delete_invoice, can_post_invoice, updated_at)
//          VALUES (?, 'admin', ?, ?, ?, ?, ?, NOW())
//          ON DUPLICATE KEY UPDATE
//             can_create_invoice = VALUES(can_create_invoice), can_view_invoice = VALUES(can_view_invoice),
//             can_edit_invoice = VALUES(can_edit_invoice), can_delete_invoice = VALUES(can_delete_invoice),
//             can_post_invoice = VALUES(can_post_invoice), updated_at = NOW()`,
//         [
//           item.user_id,
//           item.can_create,
//           item.can_view,
//           item.can_edit,
//           item.can_delete,
//           item.can_post,
//         ],
//       );

//       // 2. BACKGROUND ENFORCEMENT: Automatically sync all Sub-Users
//       // This enforces that sub-users inherit restrictions from the Admin
//       await conn.execute(
//         `INSERT INTO new_users_permissions
//    (user_id, role, can_create_invoice, can_view_invoice, can_edit_invoice, can_delete_invoice, can_post_invoice, updated_at)
//    SELECT
//       s.id, 'sub_user',
//       IF(? = 0, 0, COALESCE(p.can_create_invoice, 1)),
//       IF(? = 0, 0, COALESCE(p.can_view_invoice, 1)),
//       IF(? = 0, 0, COALESCE(p.can_edit_invoice, 1)),
//       IF(? = 0, 0, COALESCE(p.can_delete_invoice, 1)),
//       IF(? = 0, 0, COALESCE(p.can_post_invoice, 1)),
//       NOW()
//    FROM new_sub_users s
//    LEFT JOIN new_users_permissions p
//      ON s.id = p.user_id AND p.role = 'sub_user'
//    WHERE s.parent_id = ?
//    ON DUPLICATE KEY UPDATE
//       can_create_invoice = VALUES(can_create_invoice),
//       can_view_invoice = VALUES(can_view_invoice),
//       can_edit_invoice = VALUES(can_edit_invoice),
//       can_delete_invoice = VALUES(can_delete_invoice),
//       can_post_invoice = VALUES(can_post_invoice),
//       updated_at = NOW()`,
//         [
//           item.can_create,
//           item.can_view,
//           item.can_edit,
//           item.can_delete,
//           item.can_post,
//           item.user_id,
//         ],
//       );
//     }

//     await conn.commit();
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     if (conn) await conn.rollback();
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   } finally {
//     if (conn) conn.release();
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
    const consultantId = searchParams.get("consultantId");

    const fieldsSelection = PERMISSION_FIELDS.map((f) => `p.${f}`).join(", ");

    /**
     * UPDATED QUERY:
     * 1. Uses CONVERT to bridge the latin1/utf8mb4 gap.
     * 2. Added WHERE filter to skip 'self_managed' users.
     */
    const [admins] = await db.execute(
      `SELECT 
          u.id as user_id, u.seller_name as name, u.business_name, ${fieldsSelection}
       FROM new_users u
       LEFT JOIN new_users_permissions p ON u.id = p.user_id AND p.role = 'admin'
       WHERE CONVERT(u.ref_code USING utf8mb4) = CONVERT(? USING utf8mb4)
       AND (u.user_type != 'self_managed' OR u.user_type IS NULL)
       ORDER BY u.id DESC`,
      [consultantId],
    );

    const result = (admins || []).map((admin) => {
      const normalized = { ...admin };
      PERMISSION_FIELDS.forEach((f) => {
        normalized[f] = admin[f] ?? 0;
      });
      return normalized;
    });
    console.log("user perm for consultant ", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  let conn;
  try {
    const { updates } = await req.json();
    conn = await db.getConnection();
    await conn.beginTransaction();

    const columns = [
      "user_id",
      "role",
      ...PERMISSION_FIELDS,
      "updated_at",
    ].join(", ");
    const placeholders = [
      "?",
      "'admin'",
      ...PERMISSION_FIELDS.map(() => "?"),
      "NOW()",
    ].join(", ");
    const updatesSql =
      PERMISSION_FIELDS.map((f) => `${f} = VALUES(${f})`).join(", ") +
      ", updated_at = NOW()";

    for (const item of updates) {
      // 1. Upsert Admin Permissions
      const adminValues = [
        item.user_id,
        ...PERMISSION_FIELDS.map((f) => (item[f] == 1 ? 1 : 0)),
      ];

      await conn.execute(
        `INSERT INTO new_users_permissions (${columns}) VALUES (${placeholders}) 
         ON DUPLICATE KEY UPDATE ${updatesSql}`,
        adminValues,
      );

      // 2. Cascade Revokes to Sub-Users (Enforcement)
      // If a permission is set to 0 for Admin, it must be 0 for all their sub-users
      for (const field of PERMISSION_FIELDS) {
        if (item[field] == 0) {
          await conn.execute(
            `INSERT INTO new_users_permissions (user_id, role, ${field}, updated_at)
             SELECT id, 'sub_user', 0, NOW() 
             FROM new_sub_users 
             WHERE parent_id = ?
             ON DUPLICATE KEY UPDATE ${field} = 0, updated_at = NOW()`,
            [item.user_id],
          );
        }
      }
    }

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (conn) await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
