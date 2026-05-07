import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");

    // Fetch only Admins assigned to this consultant
    const [admins] = await db.execute(
      `SELECT 
          u.id as user_id, u.seller_name as name, 'admin' as role,
          p.can_create_invoice as can_create, p.can_view_invoice as can_view, 
          p.can_edit_invoice as can_edit, p.can_delete_invoice as can_delete, 
          p.can_post_invoice as can_post
       FROM new_users u
       LEFT JOIN new_users_permissions p ON u.id = p.user_id AND p.role = 'admin'
       WHERE u.ref_code = ?
       ORDER BY u.id DESC`,
      [consultantId],
    );

    // Default missing permissions to 1 (Allowed)
    console.log("Fetched admins:", admins);
    const result = (admins || []).map((admin) => ({
      ...admin,
      can_create: admin.can_create ?? 0,
      can_view: admin.can_view ?? 0,
      can_edit: admin.can_edit ?? 0,
      can_delete: admin.can_delete ?? 0,
      can_post: admin.can_post ?? 0,
    }));

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

    for (const item of updates) {
      // 1. Update the Admin's specific permissions
      await conn.execute(
        `INSERT INTO new_users_permissions (user_id, role, can_create_invoice, can_view_invoice, can_edit_invoice, can_delete_invoice, can_post_invoice, updated_at)
         VALUES (?, 'admin', ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
            can_create_invoice = VALUES(can_create_invoice), can_view_invoice = VALUES(can_view_invoice),
            can_edit_invoice = VALUES(can_edit_invoice), can_delete_invoice = VALUES(can_delete_invoice),
            can_post_invoice = VALUES(can_post_invoice), updated_at = NOW()`,
        [
          item.user_id,
          item.can_create,
          item.can_view,
          item.can_edit,
          item.can_delete,
          item.can_post,
        ],
      );

      // 2. BACKGROUND ENFORCEMENT: Automatically sync all Sub-Users
      // This enforces that sub-users inherit restrictions from the Admin
      await conn.execute(
        `INSERT INTO new_users_permissions 
   (user_id, role, can_create_invoice, can_view_invoice, can_edit_invoice, can_delete_invoice, can_post_invoice, updated_at)
   SELECT 
      s.id, 'sub_user', 
      IF(? = 0, 0, COALESCE(p.can_create_invoice, 1)), 
      IF(? = 0, 0, COALESCE(p.can_view_invoice, 1)),
      IF(? = 0, 0, COALESCE(p.can_edit_invoice, 1)),
      IF(? = 0, 0, COALESCE(p.can_delete_invoice, 1)),
      IF(? = 0, 0, COALESCE(p.can_post_invoice, 1)),
      NOW()
   FROM new_sub_users s
   LEFT JOIN new_users_permissions p 
     ON s.id = p.user_id AND p.role = 'sub_user'
   WHERE s.parent_id = ?
   ON DUPLICATE KEY UPDATE 
      can_create_invoice = VALUES(can_create_invoice),
      can_view_invoice = VALUES(can_view_invoice),
      can_edit_invoice = VALUES(can_edit_invoice),
      can_delete_invoice = VALUES(can_delete_invoice),
      can_post_invoice = VALUES(can_post_invoice),
      updated_at = NOW()`,
        [
          item.can_create,
          item.can_view,
          item.can_edit,
          item.can_delete,
          item.can_post,
          item.user_id,
        ],
      );
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
