// import { NextResponse } from "next/server";
// import { db } from "../../../../lib/db";
// // import bcrypt from 'bcryptjs';

// export async function POST(req) {
//   try {
//     const { identifier, password } = await req.json();

//     if (!identifier || !password) {
//       return NextResponse.json(
//         { message: "Identifier and password required" },
//         { status: 400 },
//       );
//     }

//     const parts = identifier.split("@");
//     if (parts.length !== 2) {
//       return NextResponse.json(
//         { message: "Invalid format. Use domain@username" },
//         { status: 400 },
//       );
//     }

//     const [domainPart, rootUserPart] = parts;
//     console.log(
//       "Login attempt for domain:",
//       domainPart,
//       "and root username:",
//       rootUserPart,
//     );
//     let user = null;
//     let roleFound = "";

//     // 1. Check Admin (new_users)
//     const [adminRows] = await db.query(
//       "SELECT * FROM new_users WHERE root_username = ? AND root_domain = ?",
//       [domainPart, rootUserPart],
//     );

//     if (adminRows.length > 0) {
//       user = adminRows[0];
//       roleFound = "admin";
//     } else {
//       // 2. Check Sub-User (new_sub_users)
//       const [subRows] = await db.query(
//         `SELECT s.*, p.isAllowed as parentAllowed, p.reason as parentReason , p.token as token, p.cnic_ntn, p.invoice_ntn
//          FROM new_sub_users s
//          JOIN new_users p ON s.parent_id = p.id
//          WHERE s.domain_name = ? AND p.root_domain = ?`,
//         [domainPart, rootUserPart],
//       );

//       if (subRows.length > 0) {
//         user = subRows[0];
//         roleFound = "sub_user";
//       }
//     }

//     if (!user) {
//       const [consultantRows] = await db.query(
//         `SELECT c.*, ci.business_name, ci.cnic_ntn, ci.address, ci.email, ci.contact
//          FROM consultant c
//          LEFT JOIN consultant_info ci ON c.id = ci.consultant_id
//          WHERE c.domain_name = ? AND c.deleted_at IS NULL`,
//         [identifier],
//       );

//       if (consultantRows.length > 0) {
//         user = consultantRows[0];
//         // If parent_id exists, they are a sub-consultant
//         roleFound = user.parent_id ? "sub_consultant" : "consultant";
//       }
//     }

//     // --- STOP IF NOT FOUND ---
//     if (!user) {
//       return NextResponse.json(
//         { message: "Invalid domain or username combination" },
//         { status: 404 },
//       );
//     }

//     // 3. Status/Restriction Check
//     let isRestricted = false;
//     let restrictionReason = "";

//     if (roleFound === "sub_user") {
//       if (user.is_active !== 1 || user.parentAllowed !== 1) {
//         isRestricted = true;
//         restrictionReason =
//           user.parentAllowed !== 1
//             ? user.parentReason
//             : "Sub-user account is inactive";
//       }
//     } else if (roleFound === "admin") {
//       if (user.isAllowed !== 1) {
//         isRestricted = true;
//         restrictionReason = user.reason;
//       }
//     }

//     if (isRestricted) {
//       return NextResponse.json(
//         {
//           message: "Account restricted.",
//           reason: restrictionReason || "No reason provided.",
//         },
//         { status: 403 },
//       );
//     }

//     // 4. Password Check
//     if (password !== user.password) {
//       return NextResponse.json(
//         { message: "Invalid credentials" },
//         { status: 401 },
//       );
//     }

//     // 5. FETCH PERMISSIONS
//     const [permissionRows] = await db.query(
//       "SELECT * FROM new_users_permissions WHERE user_id = ? AND role = ?",
//       [user.id, roleFound],
//     );

//     // Default permissions if none are found in the table
//     const permissions =
//       permissionRows.length > 0
//         ? permissionRows[0]
//         : {
//             can_view_invoice: 0,
//             can_edit_invoice: 0,
//             can_create_invoice: 0,
//             can_delete_invoice: 0,
//             can_post_invoice: 0,
//           };

//     // 6. Response (Cleanup sensitive data)
//     const { password: _, ...userData } = user;

//     const ownerId = roleFound === "admin" ? user.id : user.parent_id;

//     const [businessRows] = await db.query(
//       "SELECT * FROM new_users_business_info WHERE user_id = ?",
//       [ownerId],
//     );

//     console.log(
//       "Login successful for user:",
//       userData,
//       "with role:",
//       roleFound,
//       permissions,
//       "businesses:",
//       businessRows,
//     );

//     return NextResponse.json({
//       message: "Login successful",
//       user: {
//         ...userData,
//         role: roleFound,
//         permissions: permissions,
//         businesses: businessRows,
//       },
//     });
//   } catch (error) {
//     console.error("Auth Error:", error);
//     return NextResponse.json({ message: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

// THE FULL 39+ FIELDS LIST FOR FALLBACKS
const ALL_PERMISSION_FIELDS = [
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

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Credentials required" },
        { status: 400 },
      );
    }

    const parts = identifier.split("@");
    let user = null;
    let roleFound = "";

    // --- 1. IDENTIFY USER AND ROLE ---
    if (parts.length === 2) {
      const [domainPart, rootUserPart] = parts;

      // Check Admin
      const [adminRows] = await db.query(
        "SELECT * FROM new_users WHERE root_username = ? AND root_domain = ?",
        [domainPart, rootUserPart],
      );

      if (adminRows.length > 0) {
        user = adminRows[0];
        roleFound = "admin";
      } else {
        // Check Sub-User
        const [subRows] = await db.query(
          `SELECT s.*, p.isAllowed as parentAllowed, p.reason as parentReason 
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
    }

    // Check Consultant/Sub-Consultant if not found yet
    if (!user) {
      const [consultantRows] = await db.query(
        `SELECT c.*, ci.business_name, ci.cnic_ntn FROM consultant c
         LEFT JOIN consultant_info ci ON c.id = ci.consultant_id
         WHERE c.domain_name = ? AND c.deleted_at IS NULL`,
        [identifier],
      );

      if (consultantRows.length > 0) {
        user = consultantRows[0];
        // CRITICAL: Map to the roles used in your permissions table
        roleFound = user.parent_id ? "sub_consultant" : "admin_consultant";
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 },
      );
    }

    // --- 2. AUTH & RESTRICTION CHECKS ---
    if (password !== user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (roleFound === "admin" && user.isAllowed !== 1) {
      return NextResponse.json(
        { message: "Account restricted", reason: user.reason },
        { status: 403 },
      );
    }

    if (
      roleFound === "sub_user" &&
      (user.is_active !== 1 || user.parentAllowed !== 1)
    ) {
      return NextResponse.json(
        { message: "Access denied", reason: user.parentReason || "Inactive" },
        { status: 403 },
      );
    }

    // --- 3. FETCH ALL 39+ PERMISSIONS ---
    // We fetch EVERYTHING (*) from the permissions table for this specific user and role
    const [permissionRows] = await db.query(
      "SELECT * FROM new_users_permissions WHERE user_id = ? AND role = ?",
      [user.id, roleFound],
    );

    let permissions = {};
    if (permissionRows.length > 0) {
      permissions = permissionRows[0];
    } else {
      // Fallback: Default everything to 0 if no record exists
      ALL_PERMISSION_FIELDS.forEach((field) => {
        permissions[field] = 0;
      });
    }

    // --- 4. BUSINESS INFO (Optional but helpful) ---
    const ownerId = roleFound === "admin" ? user.id : user.parent_id;
    const [businessRows] = await db.query(
      "SELECT * FROM new_users_business_info WHERE user_id = ?",
      [ownerId],
    );

    // --- 5. CLEANUP & RESPONSE ---
    const { password: _, ...userData } = user;

    return NextResponse.json({
      message: "Login successful",
      user: {
        ...userData,
        role: roleFound, // Returns 'admin', 'sub_user', 'admin_consultant', or 'sub_consultant'
        permissions: permissions, // This now contains all 39 fields
        businesses: businessRows,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
