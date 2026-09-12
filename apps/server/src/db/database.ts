import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DATABASE_PATH ?? './data/banking.db';
const resolved = path.resolve(dbPath);
fs.mkdirSync(path.dirname(resolved), { recursive: true });

export const db = new Database(resolved);
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  segment TEXT NOT NULL CHECK(segment IN ('Retail','SME')),
  branch_id INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS onboarding_applications (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  branch_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('approved','rejected','pending')),
  applied_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  branch_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  transacted_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);
`);

const count = db.prepare('SELECT COUNT(*) AS count FROM customers').get() as { count: number };
if (count.count === 0) seed();

function seed() {
  const insertBranch = db.prepare('INSERT INTO branches(id,name,city) VALUES(?,?,?)');
  [
    [1, 'Connaught Place', 'Delhi'], [2, 'Indirapuram', 'Ghaziabad'], [3, 'Bandra', 'Mumbai'], [4, 'Whitefield', 'Bengaluru'], [5, 'Salt Lake', 'Kolkata']
  ].forEach(row => insertBranch.run(...row));

  const insertCustomer = db.prepare('INSERT INTO customers(id,name,segment,branch_id) VALUES(?,?,?,?)');
  [
    [1,'Aarav Mehta','Retail',1],[2,'Diya Sharma','Retail',2],[3,'Kabir Singh','Retail',3],[4,'Meera Iyer','Retail',4],[5,'Rohan Gupta','Retail',5],
    [6,'Northstar Foods','SME',1],[7,'BluePeak Logistics','SME',2],[8,'UrbanNest Retail','SME',3],[9,'GreenGrid Energy','SME',4],[10,'Apex Tools','SME',5]
  ].forEach(row => insertCustomer.run(...row));

  const insertOnboarding = db.prepare('INSERT INTO onboarding_applications(id,customer_id,branch_id,status,applied_at) VALUES(?,?,?,?,?)');
  const statuses = ['approved','approved','rejected','pending','approved','rejected','approved','approved','rejected','approved'];
  let id = 1;
  for (let month = 1; month <= 6; month++) {
    for (let customer = 1; customer <= 10; customer++) {
      const branch = ((customer - 1) % 5) + 1;
      const status = statuses[(id - 1) % statuses.length];
      const date = `2026-${String(month).padStart(2,'0')}-${String(((customer * 2) % 24) + 1).padStart(2,'0')}`;
      insertOnboarding.run(id++, customer, branch, status, date);
    }
  }

  const insertTx = db.prepare('INSERT INTO transactions(id,customer_id,branch_id,amount,transacted_at) VALUES(?,?,?,?,?)');
  id = 1;
  for (let month = 1; month <= 6; month++) {
    for (let customer = 1; customer <= 10; customer++) {
      for (let n = 0; n < 3; n++) {
        const branch = ((customer - 1) % 5) + 1;
        const amount = 10000 + customer * 2300 + month * 1700 + n * 900;
        const date = `2026-${String(month).padStart(2,'0')}-${String(5 + n * 7).padStart(2,'0')}`;
        insertTx.run(id++, customer, branch, amount, date);
      }
    }
  }
}
