import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export interface InvoiceItem {
  description: string;
  price: number;
}

export interface InvoicePdfPayload {
  invoiceId: number;
  invoiceCode: string;
  createdAtISO: string;
  dueDateISO: string;
  customerName: string;
  customerAddress?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  dpp: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
}

// Generate PDF mirip template contoh, tapi hanya field yang kita punya dari input
export const generateInvoicePdf = (
  payload: InvoicePdfPayload
): Promise<{ filename: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const publicDir = path.join(__dirname, "..", "..", "public", "invoices");
      fs.mkdirSync(publicDir, { recursive: true });

      const filename = `invoice-${payload.invoiceCode}.pdf`;
      const fullPath = path.join(publicDir, filename);

      const doc = new PDFDocument({ margin: 40 });
      const stream = fs.createWriteStream(fullPath);
      doc.pipe(stream);

      // Header - Nama perusahaan (dummy / bisa diganti dari profile)
      doc
        .fontSize(14)
        .text("PT. YOUR COMPANY NAME", { align: "left" })
        .moveDown(0.5);
      doc
        .fontSize(9)
        .text("Alamat perusahaan anda di sini", { align: "left" })
        .moveDown(0.5);
      doc.text("Phone : -", { align: "left" });

      // Title "INVOICE"
      doc
        .fontSize(18)
        .text("INVOICE", 0, 60, { align: "center" })
        .moveDown(1.5);

      const created = new Date(payload.createdAtISO);
      const due = new Date(payload.dueDateISO);

      // Info kanan (Number, Date, Due Date)
      doc
        .fontSize(9)
        .text(`Number : ${payload.invoiceCode}`, { align: "right" })
        .text(`Inv. Date : ${created.toLocaleDateString()}`, { align: "right" })
        .text(`Due Date : ${due.toLocaleDateString()}`, { align: "right" })
        .moveDown(1);

      // Customer block
      doc
        .fontSize(10)
        .text(`Customer : ${payload.customerName}`, { align: "left" });
      if (payload.customerAddress) {
        doc.text(`Address : ${payload.customerAddress}`, { align: "left" });
      }
      if (payload.customerPhone) {
        doc.text(`Phone : ${payload.customerPhone}`, { align: "left" });
      }
      if (payload.customerEmail) {
        doc.text(`Email : ${payload.customerEmail}`, { align: "left" });
      }

      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

      // Table header
      doc.moveDown(0.7);
      doc.fontSize(9).text("No.", 40, doc.y, { width: 30 });
      doc.text("Product Description", 70, doc.y, { width: 240 });
      doc.text("Unit Price", 310, doc.y, { width: 80, align: "right" });
      doc.text("Net Amount", 400, doc.y, { width: 80, align: "right" });
      doc.moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

      // Table rows
      let index = 1;
      payload.items.forEach((item) => {
        const y = doc.y + 4;
        doc.text(String(index), 40, y, { width: 30 });
        doc.text(item.description, 70, y, { width: 240 });
        doc.text(item.price.toLocaleString(), 310, y, {
          width: 80,
          align: "right",
        });
        doc.text(item.price.toLocaleString(), 400, y, {
          width: 80,
          align: "right",
        });
        doc.moveDown(1);
        index += 1;
      });

      doc.moveDown(1);

      // Summary (Subtotal, Discount, Tax 11%, Net Total)
      const rightX = 350;

      doc.text("Subtotal", rightX, doc.y, { width: 120, align: "right" });
      doc.text(payload.subtotal.toLocaleString(), 480, doc.y, {
        width: 80,
        align: "right",
      });

      doc.moveDown(0.5);
      doc.text("Discount", rightX, doc.y, { width: 120, align: "right" });
      doc.text(`-${payload.discount.toLocaleString()}`, 480, doc.y, {
        width: 80,
        align: "right",
      });

      doc.moveDown(0.5);
      doc.text(`Tax (${payload.taxRate * 100}%)`, rightX, doc.y, {
        width: 120,
        align: "right",
      });
      doc.text(payload.taxAmount.toLocaleString(), 480, doc.y, {
        width: 80,
        align: "right",
      });

      doc.moveDown(0.7);
      doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      doc.fontSize(10).text("Net Total", rightX, doc.y, {
        width: 120,
        align: "right",
      });
      doc.text(payload.grandTotal.toLocaleString(), 480, doc.y, {
        width: 80,
        align: "right",
      });

      doc.end();

      stream.on("finish", () => {
        resolve({ filename });
      });
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

type InvoiceItem = {
  description: string;
  price: number;
};

type GeneratePdfArgs = {
  invoiceId: number;
  invoiceCode: string;
  createdAtISO: string;
  dueDateISO?: string;
  customerName?: string;
  customerAddress?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  dpp: number;
  taxRate: number; // 0.11
  taxAmount: number;
  grandTotal: number;
};

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export async function generateInvoicePdf(args: GeneratePdfArgs) {
  const publicDir = path.join(__dirname, "..", "..", "public", "invoices");
  fs.mkdirSync(publicDir, { recursive: true });

  const filename = `invoice-${args.invoiceId}.pdf`;
  const fullPath = path.join(publicDir, filename);

  return await new Promise<{ fullPath: string; filename: string }>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(fullPath);

    stream.on("finish", () => resolve({ fullPath, filename }));
    stream.on("error", reject);

    doc.pipe(stream);

    // Header
    doc.fontSize(18).text("INVOICE", 0, 40, { align: "center" });
    doc.moveDown(0.5);

    // Left header (issuer placeholder)
    doc.fontSize(10).text("FUFU Invoice System", 40, 70);
    doc.fontSize(9).fillColor("#444").text("Auto-generated invoice PDF", 40, 84);
    doc.fillColor("#000");

    // Right header fields (hide if empty)
    const rightX = 360;
    let rightY = 70;
    const line = (label: string, value?: string) => {
      if (!value) return;
      doc.fontSize(9).text(`${label}: ${value}`, rightX, rightY);
      rightY += 14;
    };

    line("Number", args.invoiceCode);
    line("Inv. Date", args.createdAtISO.slice(0, 10));
    if (args.dueDateISO) line("Due Date", args.dueDateISO);

    // Divider
    doc.moveTo(40, 130).lineTo(555, 130).strokeColor("#cccccc").stroke();
    doc.strokeColor("#000");

    // Customer block (hide missing lines)
    let customerY = 145;
    if (
      args.customerName ||
      args.customerAddress ||
      args.customerEmail ||
      (args.customerPhone && args.customerPhone !== "0")
    ) {
      doc.fontSize(10).text("Customer", 40, customerY);
      customerY += 14;
      doc.fontSize(9);
      if (args.customerName) doc.text(args.customerName, 40, customerY), (customerY += 12);
      if (args.customerAddress) doc.text(args.customerAddress, 40, customerY), (customerY += 12);
      if (args.customerEmail) doc.text(`Email: ${args.customerEmail}`, 40, customerY), (customerY += 12);
      if (args.customerPhone && args.customerPhone !== "0")
        doc.text(`Phone: ${args.customerPhone}`, 40, customerY), (customerY += 12);
    }

    // Table header
    const tableTop = 220;
    doc.moveTo(40, tableTop).lineTo(555, tableTop).strokeColor("#000").stroke();
    doc.fontSize(9).text("No.", 40, tableTop + 8);
    doc.text("Product Description", 70, tableTop + 8);
    doc.text("Net Amount", 470, tableTop + 8, { width: 85, align: "right" });
    doc.moveTo(40, tableTop + 26).lineTo(555, tableTop + 26).strokeColor("#000").stroke();

    // Items
    let y = tableTop + 36;
    const rowH = 16;
    args.items.forEach((it, idx) => {
      const desc = (it.description || "Item").trim();
      doc.fontSize(9).text(String(idx + 1), 40, y);
      doc.text(desc, 70, y, { width: 380 });
      doc.text(money(Number(it.price || 0)), 470, y, { width: 85, align: "right" });
      y += rowH;
    });

    // Totals block (right)
    const totalsX = 360;
    let totalsY = Math.max(y + 10, 420);
    const totalLine = (label: string, value: string, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      doc.text(label, totalsX, totalsY);
      doc.text(value, 470, totalsY, { width: 85, align: "right" });
      totalsY += 14;
    };

    totalLine("Gross Total", money(args.subtotal));
    if (args.discount > 0) totalLine("Discount Total", `- ${money(args.discount)}`);
    totalLine("DPP", money(args.dpp));
    totalLine(`Tax (${Math.round(args.taxRate * 100)}%)`, money(args.taxAmount));
    doc.moveTo(totalsX, totalsY + 2).lineTo(555, totalsY + 2).strokeColor("#000").stroke();
    totalsY += 8;
    totalLine("Net Total", money(args.grandTotal), true);

    // Footer note
    doc.font("Helvetica").fontSize(8).fillColor("#666");
    doc.text(
      "Generated by FUFU. Fields not provided by user are hidden automatically.",
      40,
      780,
      { width: 515, align: "center" }
    );
    doc.fillColor("#000");

    doc.end();
  });
}


