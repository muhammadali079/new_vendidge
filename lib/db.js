// import mysql from 'mysql2/promise';

// export const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

import mysql from "mysql2/promise";

// 1. Configure the pool settings
const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max simultaneous connections per pool
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// 2. Prevent multiple pools in development (Hot Reloading)
let pool;

if (process.env.NODE_ENV === "production") {
  pool = mysql.createPool(poolConfig);
} else {
  console.log("----------------------------------");
  console.log("DEV MODE DB");
  console.log("----------------------------------");
  // In development, use a global variable so the pool
  // is preserved across hot-reloads.
  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool(poolConfig);
  }
  pool = global.mysqlPool;
}

export const db = pool;
