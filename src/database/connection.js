import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database.sqlite", (error) => {
  if (error) {
    console.error(error.message);
    return;
  }

  console.log("Connected to SQLite database");
});

export default db;
