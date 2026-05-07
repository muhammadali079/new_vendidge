import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json(
        { message: "Parent ID is required" },
        { status: 400 },
      );
    }

    // Join with permissions if you want to see their access levels immediately
    const [subUsers] = await db.query(
      `SELECT s.id, s.username, s.domain_name, s.is_active, s.created_at,
              p.can_view_invoice, p.can_edit_invoice, p.can_create_invoice, p.can_delete_invoice, p.can_post_invoice
       FROM new_sub_users s
       LEFT JOIN new_users_permissions p ON s.id = p.user_id AND p.role = 'sub_user'
       WHERE s.parent_id = ?`,
      [parentId],
    );
    console.log("Fetched sub-users:", subUsers);
    return NextResponse.json(subUsers);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, is_active, permissions } = await req.json();

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Update Sub-User
      await connection.query(
        "UPDATE new_sub_users SET is_active = ? WHERE id = ?",
        [is_active ? 1 : 0, id],
      );

      // 2. Update Permissions (Upsert)
      await connection.query(
        `INSERT INTO new_users_permissions 
         (user_id, role, can_view_invoice, can_edit_invoice, can_create_invoice, can_delete_invoice, can_post_invoice)
         VALUES (?, 'sub_user', ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         can_view_invoice = VALUES(can_view_invoice),
         can_edit_invoice = VALUES(can_edit_invoice),
         can_create_invoice = VALUES(can_create_invoice),
         can_delete_invoice = VALUES(can_delete_invoice),
         can_post_invoice = VALUES(can_post_invoice)`,
        [
          id,
          permissions.can_view_invoice,
          permissions.can_edit_invoice,
          permissions.can_create_invoice,
          permissions.can_delete_invoice,
          permissions.can_post_invoice,
        ],
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
