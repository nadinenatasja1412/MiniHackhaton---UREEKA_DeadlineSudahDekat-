import express from "express";
import {
  createInvoice,
  listInvoiceStatus,
  searchCompanies,
  getCompanyById,
  setDueDate,
  sendInvoiceEmailController,
} from "../controllers/invoiceControllers";

const router = express.Router();

router.post("/", createInvoice);
router.get("/status", listInvoiceStatus);
router.get("/companies/search", searchCompanies);
router.get("/companies/:id", getCompanyById);
router.post("/due-date", setDueDate);
router.post("/send-email", sendInvoiceEmailController);

export default router;


