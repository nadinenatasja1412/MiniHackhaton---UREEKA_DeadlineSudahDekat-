import express from "express";
import {
  createInvoice,
  listInvoiceStatus,
  searchCompanies,
  getCompanyById,
} from "../controllers/invoiceControllers";

const router = express.Router();

router.post("/", createInvoice);
router.get("/status", listInvoiceStatus);
router.get("/companies/search", searchCompanies);
router.get("/companies/:id", getCompanyById);

export default router;


