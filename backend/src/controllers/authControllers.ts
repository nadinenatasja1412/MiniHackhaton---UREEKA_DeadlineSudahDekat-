import { Request, Response } from "express";
import { db } from "../configdb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = "rahasia";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    (err) => {
      if (err) return res.json({ message: "Email sudah ada" });

      res.json({ message: "Register sukses" });
    }
  );
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result: any) => {
      if (result.length === 0)
        return res.json({ message: "User tidak ada" });

      const user = result[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid)
        return res.json({ message: "Password salah" });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET
      );

      res.json({
        message: "Login sukses",
        token
      });
    }
  );
};

export const regEmployee = async (req: Request, res: Response) => {
  const { name, jabatan, salary } = req.body;
  db.query(
    "INSERT INTO msEmployee (name, jabatan, salary) VALUES (?, ?, ?)",
    [name, jabatan, salary],
    (err) => {
      if (err) return res.json({ message: "Karyawan sudah ada" });

      res.json({ message: "Register karyawan sukses" });
    }
  );
};
