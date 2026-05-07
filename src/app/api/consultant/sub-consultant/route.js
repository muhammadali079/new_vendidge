import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    if (!parentId)
      return NextResponse.json(
        { error: "Parent ID required" },
        { status: 400 },
      );

    // 1. Fetch Sub-Consultants
    const subsSql = `
            SELECT id, name, domain_name, created_at,
                   can_create_user_invoice, can_view_user_invoice, 
                   can_edit_user_invoice, can_delete_user_invoice, 
                   can_post_user_invoice
            FROM consultant WHERE parent_id = ? ORDER BY id DESC`;

    // 2. Fetch Parent Info (To avoid sessionStorage dependency)
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
  try {
    const body = await req.json();
    const { name, domain_name, password, parent_id } = body;

    // Force parent_id from session/params to prevent unauthorized assignment
    const [result] = await db.execute(
      `INSERT INTO consultant (parent_id, name, domain_name, password, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [parent_id, name, domain_name, password],
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, password, permissions } = body;

    let sql = `UPDATE consultant SET name = ?, updated_at = NOW()`;
    let params = [name];

    if (password?.trim()) {
      sql += `, password = ?`;
      params.push(password);
    }

    // Handle permissions update if provided
    if (permissions) {
      sql += `, can_create_user_invoice = ?, can_view_user_invoice = ?, 
                     can_edit_user_invoice = ?, can_delete_user_invoice = ?, 
                     can_post_user_invoice = ?`;
      params.push(
        permissions.can_create,
        permissions.can_view,
        permissions.can_edit,
        permissions.can_delete,
        permissions.can_post,
      );
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await db.execute(sql, params);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
