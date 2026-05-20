import Database from "better-sqlite3";

const db = new Database("./database.sqlite");

db.pragma("journal_mode = WAL");

console.log("Connected to SQLite database");

export default db;
