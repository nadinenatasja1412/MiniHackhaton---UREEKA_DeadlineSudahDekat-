import { Request, Response } from "express";
import { db } from "../configdb";

// GET /profile (sementara pakai userId 1)
export const getProfile = (req: Request, res: Response) => {
  const userId = 1;
  db.query(
    "SELECT user_id, company_name, company_address, company_phone, company_email FROM company_profiles WHERE user_id = ? LIMIT 1",
    [userId],
    (err, result: any[]) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Gagal mengambil profile" });
      }
      if (!result || result.length === 0) {
        return res.json({
          user_id: userId,
          company_name: "",
          company_address: "",
          company_phone: "",
          company_email: "",
        });
      }
      res.json(result[0]);
    }
  );
};

// POST /profile
export const saveProfile = (req: Request, res: Response) => {
  const userId = 1;
  const { company_name, company_address, company_phone, company_email } =
    req.body;

  db.query(
    `INSERT INTO company_profiles 
      (user_id, company_name, company_address, company_phone, company_email)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
      company_name = VALUES(company_name),
      company_address = VALUES(company_address),
      company_phone = VALUES(company_phone),
      company_email = VALUES(company_email)`,
    [userId, company_name, company_address, company_phone, company_email],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Gagal menyimpan profile" });
      }
      res.json({ message: "Profile perusahaan berhasil disimpan" });
    }
  );
};


