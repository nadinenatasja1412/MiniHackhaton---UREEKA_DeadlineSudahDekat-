import mysql from 'mysql2';

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fufu'
});

db.connect(() => {
  console.log("MySQL Connected");

  // Buat tabel yang dibutuhkan jika belum ada
  db.query(
    `CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      address VARCHAR(255),
      email VARCHAR(150) UNIQUE,
      phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    () => {}
  );

  db.query(
    `CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      company_id INT,
      raw_text TEXT,
      items_json JSON,
      total_amount DECIMAL(12,2),
      discount DECIMAL(12,2),
      invoice_code VARCHAR(20) UNIQUE,
      status ENUM('PENDING','PAID','OVERDUE') DEFAULT 'PENDING',
      payment_link VARCHAR(255),
      due_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    () => {}
  );

  db.query(
    `CREATE TABLE IF NOT EXISTS company_profiles (
      user_id INT PRIMARY KEY,
      company_name VARCHAR(150),
      company_address VARCHAR(255),
      company_phone VARCHAR(50),
      company_email VARCHAR(150)
    )`,
    () => {}
  );
});
