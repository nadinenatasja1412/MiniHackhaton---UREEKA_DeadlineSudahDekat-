import { Request, Response } from "express";
import { db } from "../configdb";
import axios from "axios";
import crypto from "crypto";
import { generateInvoicePdf } from "../utils/pdf";

// Helper untuk generate payment link dummy
const generatePaymentLink = (invoiceId: number | string) => {
  return `https://pay.fufu.ai/invoice/${invoiceId}`;
};

// POST /invoice
// Body: { rawText, customerName, customerAddress, customerEmail, phone, discount, userId, companyId? }
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const {
      rawText,
      customerName,
      customerAddress,
      customerEmail,
      phone,
      discount = 0,
      userId,
      companyId,
    } = req.body;

    // Panggil AI service Python untuk analisa text invoice
    const aiResponse = await axios.post("http://localhost:5001/analyze", {
      text: rawText,
      discount,
    });

    const { items, totalAmount, suggestedDueDate } = aiResponse.data;

    const subtotal = (items || []).reduce(
      (acc: number, it: any) => acc + Number(it?.price || 0),
      0
    );
    const disc = Number(discount || 0);
    const dpp = Math.max(subtotal - disc, 0);
    const taxRate = 0.11;
    const taxAmount = dpp * taxRate;
    const grandTotal = dpp + taxAmount;

    const saveInvoiceForCompany = (finalCompanyId: number) => {
      const invoiceCode = crypto.randomBytes(3).toString("hex").toUpperCase();
      db.query(
        "INSERT INTO invoices (user_id, company_id, raw_text, items_json, total_amount, discount, invoice_code, status, payment_link, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)",
        [
          userId,
          finalCompanyId,
          rawText,
          JSON.stringify(items),
          grandTotal,
          disc,
          invoiceCode,
          "", // placeholder, akan diupdate setelah insert
          suggestedDueDate,
        ],
        (err2, result2: any) => {
          if (err2) {
            console.error(err2);
            return res
              .status(500)
              .json({ message: "Gagal menyimpan invoice" });
          }

          const invoiceId = result2.insertId;
          const paymentLink = generatePaymentLink(invoiceId);
          const createdAtISO = new Date().toISOString();

          generateInvoicePdf({
            invoiceId,
            invoiceCode,
            createdAtISO,
            dueDateISO: suggestedDueDate,
            customerName,
            customerAddress,
            customerEmail,
            customerPhone: phone,
            items: (items || []).map((it: any) => ({
              description: String(it?.description || "Item"),
              price: Number(it?.price || 0),
            })),
            subtotal,
            discount: disc,
            dpp,
            taxRate,
            taxAmount,
            grandTotal,
          })
            .then(({ filename }) => {
              const pdfUrl = `http://localhost:3000/public/invoices/${filename}`;

              db.query(
                "UPDATE invoices SET payment_link = ? WHERE id = ?",
                [paymentLink, invoiceId],
                (err3) => {
                  if (err3) {
                    console.error(err3);
                  }

                  res.json({
                    message: "Invoice berhasil dibuat",
                    invoiceId,
                    invoiceCode,
                    paymentLink,
                    pdfUrl,
                    subtotal,
                    discount: disc,
                    taxAmount,
                    totalAmount: grandTotal,
                    items,
                    suggestedDueDate,
                  });
                }
              );
            })
            .catch((pdfErr) => {
              console.error(pdfErr);
              db.query(
                "UPDATE invoices SET payment_link = ? WHERE id = ?",
                [paymentLink, invoiceId],
                () => {
                  res.json({
                    message: "Invoice berhasil dibuat (PDF gagal dibuat)",
                    invoiceId,
                    invoiceCode,
                    paymentLink,
                    subtotal,
                    discount: disc,
                    taxAmount,
                    totalAmount: grandTotal,
                    items,
                    suggestedDueDate,
                  });
                }
              );
            });
        }
      );
    };

    // Jika companyId dikirim (past company) → update data lalu buat invoice
    if (companyId) {
      db.query(
        "UPDATE companies SET name = ?, address = ?, email = ?, phone = ? WHERE id = ?",
        [customerName, customerAddress, customerEmail, phone, companyId],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Gagal mengupdate company" });
          }
          saveInvoiceForCompany(companyId);
        }
      );
    } else {
      // Company baru atau berdasarkan email (auto update alamat/telpon)
      db.query(
        "INSERT INTO companies (name, address, email, phone) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE address = VALUES(address), phone = VALUES(phone), name = VALUES(name)",
        [customerName, customerAddress, customerEmail, phone],
        (err, result: any) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Gagal menyimpan company" });
          }

          if (result.insertId && result.insertId !== 0) {
            // company baru
            saveInvoiceForCompany(result.insertId);
          } else {
            // company sudah ada, ambil id berdasarkan email
            db.query(
              "SELECT id FROM companies WHERE email = ? LIMIT 1",
              [customerEmail],
              (errSel, rows: any[]) => {
                if (errSel || rows.length === 0) {
                  console.error(errSel);
                  return res
                    .status(500)
                    .json({ message: "Gagal menemukan company" });
                }
                saveInvoiceForCompany(rows[0].id);
              }
            );
          }
        }
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat membuat invoice" });
  }
};

// GET /invoice/status
export const listInvoiceStatus = (req: Request, res: Response) => {
  db.query(
    `SELECT i.id, i.invoice_code, i.created_at, c.name as company_name, c.email as company_email, i.status 
     FROM invoices i 
     JOIN companies c ON i.company_id = c.id
     ORDER BY i.created_at DESC`,
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Gagal mengambil status invoice" });
      }
      res.json(result);
    }
  );
};

// GET /companies/search?query=abc
export const searchCompanies = (req: Request, res: Response) => {
  const { query } = req.query;
  db.query(
    "SELECT id, name, address, email, phone FROM companies WHERE name LIKE ? ORDER BY name LIMIT 20",
    [`%${query || ""}%`],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Gagal mencari company" });
      }
      res.json(result);
    }
  );
};

// GET /companies/:id
export const getCompanyById = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query(
    "SELECT id, name, address, email, phone FROM companies WHERE id = ? LIMIT 1",
    [id],
    (err, result: any[]) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Gagal mengambil data company" });
      }
      if (!result || result.length === 0) {
        return res.status(404).json({ message: "Company tidak ditemukan" });
      }
      res.json(result[0]);
    }
  );
};


