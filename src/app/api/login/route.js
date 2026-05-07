import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
// import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Identifier and password required" },
        { status: 400 },
      );
    }

    const parts = identifier.split("@");
    if (parts.length !== 2) {
      return NextResponse.json(
        { message: "Invalid format. Use domain@username" },
        { status: 400 },
      );
    }

    const [domainPart, rootUserPart] = parts;
    console.log(
      "Login attempt for domain:",
      domainPart,
      "and root username:",
      rootUserPart,
    );
    let user = null;
    let roleFound = "";

    // 1. Check Admin (new_users)
    const [adminRows] = await db.query(
      "SELECT * FROM new_users WHERE root_username = ? AND root_domain = ?",
      [domainPart, rootUserPart],
    );

    if (adminRows.length > 0) {
      user = adminRows[0];
      roleFound = "admin";
    } else {
      // 2. Check Sub-User (new_sub_users)
      const [subRows] = await db.query(
        `SELECT s.*, p.isAllowed as parentAllowed, p.reason as parentReason , p.token as token, p.cnic_ntn, p.invoice_ntn
         FROM new_sub_users s
         JOIN new_users p ON s.parent_id = p.id
         WHERE s.domain_name = ? AND p.root_domain = ?`,
        [domainPart, rootUserPart],
      );

      if (subRows.length > 0) {
        user = subRows[0];
        roleFound = "sub_user";
      }
    }

    if (!user) {
      const [consultantRows] = await db.query(
        `SELECT c.*, ci.business_name, ci.cnic_ntn, ci.address, ci.email, ci.contact
         FROM consultant c
         LEFT JOIN consultant_info ci ON c.id = ci.consultant_id
         WHERE c.domain_name = ? AND c.deleted_at IS NULL`,
        [identifier],
      );

      if (consultantRows.length > 0) {
        user = consultantRows[0];
        // If parent_id exists, they are a sub-consultant
        roleFound = user.parent_id ? "sub_consultant" : "consultant";
      }
    }

    // --- STOP IF NOT FOUND ---
    if (!user) {
      return NextResponse.json(
        { message: "Invalid domain or username combination" },
        { status: 404 },
      );
    }

    // 3. Status/Restriction Check
    let isRestricted = false;
    let restrictionReason = "";

    if (roleFound === "sub_user") {
      if (user.is_active !== 1 || user.parentAllowed !== 1) {
        isRestricted = true;
        restrictionReason =
          user.parentAllowed !== 1
            ? user.parentReason
            : "Sub-user account is inactive";
      }
    } else if (roleFound === "admin") {
      if (user.isAllowed !== 1) {
        isRestricted = true;
        restrictionReason = user.reason;
      }
    }

    if (isRestricted) {
      return NextResponse.json(
        {
          message: "Account restricted.",
          reason: restrictionReason || "No reason provided.",
        },
        { status: 403 },
      );
    }

    // 4. Password Check
    if (password !== user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 5. FETCH PERMISSIONS
    const [permissionRows] = await db.query(
      "SELECT * FROM new_users_permissions WHERE user_id = ? AND role = ?",
      [user.id, roleFound],
    );

    // Default permissions if none are found in the table
    const permissions =
      permissionRows.length > 0
        ? permissionRows[0]
        : {
            can_view_invoice: 0,
            can_edit_invoice: 0,
            can_create_invoice: 0,
            can_delete_invoice: 0,
            can_post_invoice: 0,
          };

    // 6. Response (Cleanup sensitive data)
    const { password: _, ...userData } = user;

    const ownerId = roleFound === "admin" ? user.id : user.parent_id;

    const [businessRows] = await db.query(
      "SELECT * FROM new_users_business_info WHERE user_id = ?",
      [ownerId],
    );

    console.log(
      "Login successful for user:",
      userData,
      "with role:",
      roleFound,
      permissions,
      "businesses:",
      businessRows,
    );

    return NextResponse.json({
      message: "Login successful",
      user: {
        ...userData,
        role: roleFound,
        permissions: permissions,
        businesses: businessRows,
      },
    });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
