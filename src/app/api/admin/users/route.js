import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import bcrypt from "bcryptjs";

function hashPasswordIfNeeded(password) {
  if (!password || password.trim() === "") return null;

  // Regex to check if the password is already a valid bcrypt hash
  // (60 characters long, starts with $2a$, $2b$, or $2y$)
  const isAlreadyHashed = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(
    password.trim(),
  );

  if (isAlreadyHashed) {
    return password.trim(); // Return as-is if it's already a bcrypt hash
  }

  // Otherwise, generate a fresh salt and hash the plain text password synchronously
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export async function GET() {
  try {
    // 1. Fetch all main users
    const [users] = await db.execute(
      `SELECT * FROM new_users ORDER BY id DESC`,
    );

    // 2. Fetch all sub-users and business info in parallel for better performance
    const [[subUsers], [businessInfos]] = await Promise.all([
      db.execute(`SELECT * FROM new_sub_users`),
      db.execute(`SELECT * FROM new_users_business_info`),
    ]);

    // 3. Group sub-users by their parent_id for fast access
    const subUsersByParent = subUsers.reduce((acc, sub) => {
      if (!acc[sub.parent_id]) acc[sub.parent_id] = [];
      acc[sub.parent_id].push({
        id: sub.id,
        domain_name: sub.domain_name,
        username: sub.username,
        password: sub.password,
        contact: sub.contact,
        email: sub.email,
        address: sub.address,
        designation: sub.designation,
        is_active: Boolean(sub.is_active),
      });
      return acc;
    }, {});

    // 4. Group business info by user_id
    const businessByParent = businessInfos.reduce((acc, biz) => {
      if (!acc[biz.user_id]) acc[biz.user_id] = [];
      acc[biz.user_id].push({
        id: biz.id,
        business_name: biz.business_name,
        province_id: biz.province_id,
        province: biz.province,
        address: biz.address,
      });
      return acc;
    }, {});

    // 5. Format the final output
    const formattedUsers = users.map((user) => {
      let formattedExpire = null;
      if (user.expire) {
        const d = new Date(user.expire);
        formattedExpire = d.toISOString().split("T")[0]; // Cleaner YYYY-MM-DD
      }

      return {
        ...user,
        isAllowed: Boolean(user.isAllowed),
        isProd: Boolean(user.isProd),
        isPaid: Boolean(user.isPaid),
        amount: user.amount ? Math.floor(user.amount).toString() : "0",
        expire: formattedExpire,
        // Direct lookup instead of .filter()
        children: subUsersByParent[user.id] || [],
        businesses: businessByParent[user.id] || [],
      };
    });
    console.log("Formatted Users:", formattedUsers[0]); // Log the last user for verification
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
export async function POST(req) {
  const conn = await db.getConnection();

  try {
    const v = (val) => (val === undefined ? null : val);
    const body = await req.json();
    const {
      business_name,
      business_logo,
      seller_name,
      root_domain,
      root_username,
      password,
      designation,
      cnic_ntn,
      invoice_ntn,
      strn,
      token,
      email,
      contact,
      provinceId,
      province,
      address,
      amount,
      expire,
      cycle,
      reason,
      isPaid,
      isAllowed,
      isProd,
      ref_code,
      alert,
      leverage,
      company_type,
      user_type,
      businesses,
    } = body;

    // Basic Validation
    if (!password || !root_domain) {
      return NextResponse.json(
        { error: "Missing required identity fields" },
        { status: 400 },
      );
    }

    await conn.beginTransaction();

    const securedPassword = hashPasswordIfNeeded(password);

    // 1. Insert into new_users
    const userSql = `
            INSERT INTO new_users (
                business_name, business_logo, seller_name, root_domain, 
                root_username, password, cnic_ntn, invoice_ntn, 
                strn, token, email, contact, 
                designation, provinceId, province, address, 
                amount, expire, cycle, reason, 
                isPaid, isAllowed, isProd, ref_code, 
                alert, company_type, user_type, leverage, 
                created_at
            ) VALUES (
             ?, ?, ?, ?, 
             ?, ?, ?, ?, 
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             NOW())
        `;

    const userValues = [
      v(business_name),
      v(business_logo),
      seller_name,
      root_domain,
      root_username || "admin",
      securedPassword,
      v(cnic_ntn),
      v(invoice_ntn),
      v(strn),
      v(token),
      v(email),
      v(contact),
      v(designation),
      v(provinceId),
      v(province),
      v(address),
      amount ? Math.floor(amount) : 0,
      expire || null,
      v(cycle),
      v(reason),
      isPaid ? 1 : 0,
      isAllowed ? 1 : 0,
      isProd ? 1 : 0,
      v(ref_code),
      alert ? Math.floor(alert) : 0,
      v(company_type),
      v(user_type),
      leverage ? Math.floor(leverage) : 0,
    ];
    console.log(
      "Inserting new user with values:",
      userValues,
      userValues.length,
    );
    const [userResult] = await conn.execute(userSql, userValues);
    const newUserId = userResult.insertId;
    console.log("New user created with ID:", newUserId);
    console.log("Business units to insert:", businesses);
    // 2. Handle Business Units Array (Multiple Branches)
    if (businesses && Array.isArray(businesses)) {
      for (const biz of businesses) {
        console.log(`Processing business unit: ${biz.business_name} : ${biz}`);
        // Only insert if the branch has a name
        if (biz.business_name && biz.business_name.trim() !== "") {
          await conn.execute(
            `INSERT INTO new_users_business_info (user_id, business_name, province_id, province, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              newUserId,
              biz.business_name,
              biz.provinceId,
              biz.province,
              biz.address,
            ],
          );
        }
      }
    }

    console.log("Inserted business units for user ID:", newUserId);
    // 3. Set Default Permissions for the main user
    await conn.execute(
      `INSERT INTO new_users_permissions (user_id, role, created_at) VALUES (?, ?, NOW())`,
      [newUserId, "admin"],
    );
    console.log("Inserted default permissions for user ID:", newUserId);
    await conn.execute(
      `
    INSERT INTO new_user_choosable_fields (user_id, field_id, \`show\`, show_if_value, hide)
    SELECT ?, f.id, 1, 0, 0
    FROM choosable_fields f
`,
      [newUserId],
    );
    console.log("Inserted choosable fields for user ID:", newUserId);
    await conn.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Business User and business units created successfully",
        userId: newUserId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("User Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 },
    );
  } finally {
    if (conn) conn.release();
  }
}
export async function PUT(req) {
  const conn = await db.getConnection();
  try {
    const body = await req.json();
    const {
      user_id,
      business_name,
      business_logo,
      password,
      seller_name,
      root_domain,
      root_username, // Added these
      cnic_ntn,
      invoice_ntn,
      strn,
      token,
      email,
      contact,
      designation,
      provinceId,
      province,
      address,
      amount,
      expire,
      cycle,
      reason,
      isPaid,
      isAllowed,
      isProd,
      ref_code,
      alert,
      leverage,
      company_type,
      user_type,
      children,
      businesses,
      deleted_businesses,
    } = body;

    await conn.beginTransaction();
    const securedPassword = hashPasswordIfNeeded(password);
    const v = (val) => (val === undefined ? null : val);

    const updateFields = [
      v(business_name),
      v(business_logo),
      seller_name,
      root_domain,
      root_username,
      v(cnic_ntn),
      v(invoice_ntn),
      v(strn),
      v(token),
      v(email),
      v(contact),
      v(designation),
      v(provinceId),
      v(province),
      v(address),
      amount ? Math.floor(amount) : 0,
      expire || null,
      v(cycle),
      v(reason),
      isPaid ? 1 : 0,
      isAllowed ? 1 : 0,
      isProd ? 1 : 0,
      v(ref_code),
      alert ? Math.floor(alert) : 0,
      leverage ? Math.floor(leverage) : 0,
      v(company_type),
      v(user_type),
    ];
    console.log("Received PUT Body for User ID:", updateFields);
    let sql = `
            UPDATE new_users SET 
                business_name=?, business_logo=?, seller_name=?, root_domain=?, root_username=?, 
                cnic_ntn=?, invoice_ntn=?, strn=? , token=?, 
                email=?, contact=?, designation=?, provinceId=?, province=?, address=?,
                amount=?, expire=?, cycle=?, reason=?,
                isPaid=?, isAllowed=?, isProd=?, ref_code=?, alert=?, leverage=?, company_type=?, user_type=?, updated_at = NOW()
        `;

    if (password && password.trim() !== "") {
      sql += `, password=? WHERE id=?`;
      updateFields.push(securedPassword, user_id);
    } else {
      sql += ` WHERE id=?`;
      updateFields.push(user_id);
    }

    await conn.execute(sql, updateFields);
    console.log("Updated user form", deleted_businesses);

    // --- HANDLE BUSINESS INFO (Deletion & Upsert) ---
    if (deleted_businesses && deleted_businesses.length > 0) {
      const placeholders = deleted_businesses.map(() => "?").join(",");
      await conn.execute(
        `DELETE FROM new_users_business_info WHERE id IN (${placeholders}) AND user_id = ?`,
        [...deleted_businesses, user_id],
      );
    }
    console.log("Updated deleted business form");

    console.log("Businesses to upsert:", businesses);
    if (businesses && Array.isArray(businesses)) {
      for (const biz of businesses) {
        const bId = biz.id ? biz.id : null;
        console.log(`business , JSON: ${JSON.stringify(biz)}`);
        console.log(
          `Processing business: ${biz.business_name} with ID: ${bId}`,
        );
        if (bId) {
          await conn.execute(
            `UPDATE new_users_business_info SET business_name=?, province_id=?, province=?, address=?, updated_at=NOW() WHERE id=?`,
            [
              biz.business_name,
              biz.province_id,
              biz.province,
              biz.address,
              bId,
            ],
          );
        } else {
          await conn.execute(
            `INSERT INTO new_users_business_info (user_id, business_name, province_id, province, address, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              user_id,
              biz.business_name,
              biz.province_id,
              biz.province,
              biz.address,
            ],
          );
        }
      }
    }
    console.log("Updated business form");
    // 2. Handle Children Array (Sub-Users)
    if (children && Array.isArray(children)) {
      for (const child of children) {
        if (child.id) {
          // Update existing child (Status toggle)
          let childSql = `UPDATE new_sub_users SET username = ?, domain_name = ?, contact=?, email=?, address=?, designation=?, is_active = ? , updated_at = NOW()`;
          let params = [
            child.username,
            child.domain_name,
            child.contact ? child.contact : null,
            child.email ? child.email : null,
            child.address ? child.address : null,
            child.designation ? child.designation : null,
            child.is_active ? 1 : 0,
          ];

          // Only update password if user actually typed a new one
          if (child.password && child.password.trim() !== "") {
            childSql += `, password = ?`;
            params.push(child.password);
          }

          childSql += ` WHERE id = ?`;
          params.push(child.id);

          await conn.execute(childSql, params);
        } else {
          // Insert new child (if username and password are provided)
          if (child.username && child.password) {
            const [childResult] = await conn.execute(
              `INSERT INTO new_sub_users (parent_id, username, domain_name, contact, email, address, designation, password, is_active , created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
              [
                user_id,
                child.username,
                child.domain_name,
                child.password,
                child.contact ? child.contact : null,
                child.email ? child.email : null,
                child.address ? child.address : null,
                child.designation ? child.designation : null,
              ],
            );

            // Auto-insert default permissions for the new child
            await conn.execute(
              `INSERT INTO new_users_permissions (user_id , role, created_at) VALUES (?, ?, NOW())`,
              [childResult.insertId, "sub_user"],
            );

            await conn.execute(
              `
    INSERT INTO new_user_choosable_fields (user_id, role, field_id, \`show\`, show_if_value, hide)
    SELECT ?, ?, f.id, 1, 0, 0
    FROM choosable_fields f
`,
              [childResult.insertId, "sub_user"],
            );
          }
        }
      }
    }

    await conn.commit();
    return NextResponse.json({ success: true, message: "Update successful" });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Put User Error:", error);
    return NextResponse.json(
      { error: "Failed to update user", details: error.message },
      { status: 500 },
    );
  } finally {
    if (conn) conn.release();
  }
}
