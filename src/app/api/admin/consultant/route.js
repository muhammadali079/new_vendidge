import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "../../../../../lib/db";

export async function POST(req) {
  const conn = await db.getConnection();
  try {
    const body = await req.json();
    const {
      name,
      domain_name,
      designation,
      password,
      parent_id,
      business_name,
      cnic_ntn,
      address,
      email,
      contact,
    } = body;

    console.log(name, password, domain_name);
    if (!name || !password || !domain_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await conn.beginTransaction();
    //const hashedPassword = await bcrypt.hash(password, 10);

    const safeDomain =
      domain_name && parent_id == null ? `admin@${domain_name}` : domain_name;
    const query = `
            INSERT INTO consultant (
                parent_id, 
                name, 
                domain_name, 
                designation,
                password, 
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;

    const values = [parent_id || null, name, safeDomain, designation, password];

    const [result] = await conn.execute(query, values);

    const newConsultantId = result.insertId;

    if (!parent_id) {
      const infoQuery = `
                INSERT INTO consultant_info (
                    consultant_id, 
                    business_name, 
                    cnic_ntn,
                    address, 
                    contact, 
                    email
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

      const infoValues = [
        newConsultantId,
        business_name,
        cnic_ntn,
        address ? address : null,
        contact ? contact : null,
        email ? email : null,
      ];

      await conn.execute(infoQuery, infoValues);
    }

    await conn.execute(
      `INSERT INTO new_users_permissions (user_id , role, created_at) VALUES (?, ?, NOW())`,
      [newConsultantId, parent_id ? "sub_consultant" : "admin_consultant"],
    );

    await conn.execute(
      `
    INSERT INTO new_user_choosable_fields (user_id, role, field_id, \`show\`, show_if_value, hide)
    SELECT ?, ?, f.id, 1, 0, 0
    FROM choosable_fields f
`,
      [newConsultantId, parent_id ? "sub_consultant" : "admin_consultant"],
    );
    await conn.commit();

    return NextResponse.json(
      {
        success: true,
        message: parent_id
          ? "Child Consultant created"
          : "Parent Consultant created",
        consultantId: result.insertId,
      },
      { status: 201 },
    );
  } catch (error) {
    await conn.rollback();
    console.error("Consultant Creation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// export async function PUT(req) {
//     try {
//         const body = await req.json();
//         const { id, name, domain_name, password, parent_id } = body;

//         if (!parent_id) {
//             const parentQuery = password?.trim()
//                 ? `UPDATE consultant SET name = ?, domain_name = ?, password = ?, updated_at = NOW() WHERE id = ?`
//                 : `UPDATE consultant SET name = ?, domain_name = ?, updated_at = NOW() WHERE id = ?`;

//             const parentValues = password?.trim() ? [name, domain_name, password, id] : [name, domain_name, id];
//             await db.execute(parentQuery, parentValues);

//             const syncQuery = `
//                 UPDATE consultant
//                SET domain_name = CONCAT(
//                  SUBSTRING_INDEX(domain_name, '@', 1), '@',
//                  SUBSTRING_INDEX(?, '@', -1) ),
//                 updated_at = NOW()
//                 WHERE parent_id = ?
//             `;
//             await db.execute(syncQuery, [domain_name, id]);
//         }
//         else {
//             const childQuery = password?.trim()
//                 ? `UPDATE consultant SET name = ?, password = ?, updated_at = NOW() WHERE id = ?`
//                 : `UPDATE consultant SET name = ?, updated_at = NOW() WHERE id = ?`;

//             const childValues = password?.trim() ? [name, password, id] : [name, id];
//             await db.execute(childQuery, childValues);
//         }

//         return NextResponse.json({ success: true });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

export async function PUT(req) {
  let conn;
  try {
    const body = await req.json();
    const {
      id,
      name,
      domain_name,
      designation,
      password,
      business_name,
      cnic_ntn,
      address,
      email,
      contact,
    } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 },
      );
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // 🔍 Get consultant to determine parent/child
    const [[consultant]] = await conn.execute(
      `SELECT parent_id FROM consultant WHERE id = ?`,
      [id],
    );

    if (!consultant) {
      throw new Error("Consultant not found");
    }

    const isParent = !consultant.parent_id;
    console.log("is parent ", isParent, domain_name, designation);
    // ========================
    // 🔹 UPDATE CONSULTANT
    // ========================
    let query = `UPDATE consultant SET name = ?, designation = ?, updated_at = NOW()`;
    let values = [name, designation];

    if (isParent && domain_name) {
      query += `, domain_name = ?`;
      values.push(`admin@${domain_name}`);
    } else {
      query += `, domain_name = ?`;
      values.push(`${domain_name}`);
    }

    if (password?.trim()) {
      query += `, password = ?`;
      values.push(password);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    await conn.execute(query, values);

    // ========================
    // 🔹 SYNC CHILD DOMAIN
    // ========================
    if (isParent && domain_name) {
      await conn.execute(
        `UPDATE consultant 
                 SET domain_name = CONCAT(
                    SUBSTRING_INDEX(domain_name, '@', 1), '@', 
                    SUBSTRING_INDEX(?, '@', -1)
                 ),
                 updated_at = NOW()
                 WHERE parent_id = ?`,
        [domain_name, id],
      );
    }

    // ========================
    // 🔹 UPDATE CONSULTANT INFO (ONLY PARENT)
    // ========================
    if (isParent) {
      await conn.execute(
        `UPDATE consultant_info SET
                    business_name = ?,
                    cnic_ntn = ?,
                    address = ?,
                    contact = ?,
                    email = ?
                 WHERE consultant_id = ?`,
        [
          business_name || null,
          cnic_ntn || null,
          address || null,
          contact || null,
          email || null,
          id,
        ],
      );
    }

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: isParent ? "Parent updated" : "Child updated",
    });
  } catch (error) {
    if (conn) await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
export async function GET() {
  try {
    const sql = `
            SELECT 
                c1.id, 
                c1.parent_id, 
                c1.name, 
                c1.domain_name, 
                c1.designation,
                c1.password,
                c1.can_create_user_invoice, 
                c1.can_view_user_invoice, 
                c1.can_edit_user_invoice, 
                c1.can_delete_user_invoice, 
                c1.can_post_user_invoice,
                c1.created_at,
                -- Info from the consultant_info table for the current record
                ci.business_name AS business_name,
                ci.cnic_ntn,
                ci.contact,
                ci.email,
                ci.address,
                -- Join to get the Parent Name for Children
                c2.name as parent_name,
           
                -- Logic to label the level for the frontend
                CASE 
                    WHEN c1.parent_id IS NULL THEN 'Root Parent' 
                    ELSE 'Sub-Consultant' 
                END AS hierarchy_level
            FROM consultant c1
            LEFT JOIN consultant c2 ON c1.parent_id = c2.id
            LEFT JOIN consultant_info ci ON c1.id = ci.consultant_id
            ORDER BY c1.parent_id ASC, c1.id DESC;
        `;
    const [rows] = await db.execute(sql);

    console.log("rows", rows);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
