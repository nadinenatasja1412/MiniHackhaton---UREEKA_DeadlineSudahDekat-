import mysql from 'mysql2';

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fufu'
});

db.connect(() => {
  console.log("MySQL Connected");
});
