// lib/db.config.ts
export const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
};

// Verify config is loaded
console.log("DB Config loaded:", {
  user: dbConfig.user,
  connectString: dbConfig.connectString,
  hasPassword: !!dbConfig.password
});