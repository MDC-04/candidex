// This script runs on first MongoDB initialization only.
// It creates a dedicated application user (not root) for the candidex database.
// The root user is created automatically by MONGO_INITDB_ROOT_USERNAME/PASSWORD.
//
// Credentials are read from environment variables so no secret is hard-coded.

const dbName = process.env.MONGODB_DATABASE || 'candidex';
const appUser = process.env.MONGODB_APP_USERNAME || 'candidex_user';
const appPwd = process.env.MONGODB_APP_PASSWORD;

if (!appPwd) {
  throw new Error('MONGODB_APP_PASSWORD environment variable is required to initialize the database user.');
}

db = db.getSiblingDB(dbName);

db.createUser({
  user: appUser,
  pwd: appPwd,
  roles: [
    { role: 'readWrite', db: dbName }
  ]
});
