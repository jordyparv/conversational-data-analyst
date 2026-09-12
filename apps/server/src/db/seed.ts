import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DATABASE_PATH ?? './data/banking.db';
const resolved = path.resolve(dbPath);
fs.mkdirSync(path.dirname(resolved), { recursive: true });

const db = new Database(resolved);
db.pragma('foreign_keys = ON');

db.exec(`
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS onboarding_applications;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS branches;

CREATE TABLE branches (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  segment TEXT NOT NULL CHECK(segment IN ('Retail', 'SME')),
  branch_id INTEGER NOT NULL,
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);

CREATE TABLE onboarding_applications (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  branch_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('approved', 'rejected', 'pending')),
  applied_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  branch_id INTEGER NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  transacted_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);
`);

const branches = [
  [1, 'Connaught Place', 'Delhi'],
  [2, 'Indirapuram', 'Ghaziabad'],
  [3, 'Bandra', 'Mumbai'],
  [4, 'Whitefield', 'Bengaluru'],
  [5, 'Salt Lake', 'Kolkata'],
];

const customers = [
  [1, 'Aarav Mehta', 'Retail', 1],
  [2, 'Diya Sharma', 'Retail', 2],
  [3, 'Kabir Singh', 'Retail', 3],
  [4, 'Meera Iyer', 'Retail', 4],
  [5, 'Rohan Gupta', 'Retail', 5],
  [6, 'Northstar Foods', 'SME', 1],
  [7, 'BluePeak Logistics', 'SME', 2],
  [8, 'UrbanNest Retail', 'SME', 3],
  [9, 'GreenGrid Energy', 'SME', 4],
  [10, 'Apex Tools', 'SME', 5],
];

const insertBranch = db.prepare(
  'INSERT INTO branches(id, name, city) VALUES (?, ?, ?)'
);
const insertCustomer = db.prepare(
  'INSERT INTO customers(id, name, segment, branch_id) VALUES (?, ?, ?, ?)'
);
const insertApplication = db.prepare(
  'INSERT INTO onboarding_applications(id, customer_id, branch_id, status, applied_at) VALUES (?, ?, ?, ?, ?)'
);
const insertTransaction = db.prepare(
  'INSERT INTO transactions(id, customer_id, branch_id, amount, transacted_at) VALUES (?, ?, ?, ?, ?)'
);

const seed = db.transaction(() => {
  for (const branch of branches) insertBranch.run(...branch);
  for (const customer of customers) insertCustomer.run(...customer);

  let applicationId = 1;
  let transactionId = 1;

  // 12 months of onboarding applications.
  // Status distribution intentionally varies by branch so rejection-rate questions
  // produce a meaningful ranking rather than identical percentages.
  const rejectionBiasByBranch: Record<number, number> = {
    1: 0.12,
    2: 0.28,
    3: 0.18,
    4: 0.34,
    5: 0.22,
  };

  for (let month = 1; month <= 12; month++) {
    for (const customer of customers) {
      const customerId = customer[0] as number;
      const branchId = customer[3] as number;
      const rejectionBias = rejectionBiasByBranch[branchId];
      const score = (customerId * 17 + month * 13) % 100;

      let status: 'approved' | 'rejected' | 'pending';
      if (score < rejectionBias * 100) status = 'rejected';
      else if (score < rejectionBias * 100 + 8) status = 'pending';
      else status = 'approved';

      const day = ((customerId * 2 + month) % 24) + 1;
      const appliedAt = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      insertApplication.run(applicationId++, customerId, branchId, status, appliedAt);
    }
  }

  // 12 months x 10 customers x 4 transactions = 480 deterministic transactions.
  for (let month = 1; month <= 12; month++) {
    for (const customer of customers) {
      const customerId = customer[0] as number;
      const branchId = customer[3] as number;
      const segment = customer[2] as string;

      for (let n = 0; n < 4; n++) {
        const segmentMultiplier = segment === 'SME' ? 2.6 : 1;
        const amount = Math.round(
          (8500 + customerId * 1450 + month * 900 + n * 1250) * segmentMultiplier * 100
        ) / 100;
        const day = 3 + n * 7;
        const transactedAt = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        insertTransaction.run(transactionId++, customerId, branchId, amount, transactedAt);
      }
    }
  }
});

seed();

type CountRow = { count: number };
const branchCount = db.prepare('SELECT COUNT(*) AS count FROM branches').get() as CountRow;
const customerCount = db.prepare('SELECT COUNT(*) AS count FROM customers').get() as CountRow;
const applicationCount = db.prepare('SELECT COUNT(*) AS count FROM onboarding_applications').get() as CountRow;
const transactionCount = db.prepare('SELECT COUNT(*) AS count FROM transactions').get() as CountRow;

db.close();

console.log('Database seeded successfully.');
console.log(`Branches: ${branchCount.count}`);
console.log(`Customers: ${customerCount.count}`);
console.log(`Onboarding applications: ${applicationCount.count}`);
console.log(`Transactions: ${transactionCount.count}`);
