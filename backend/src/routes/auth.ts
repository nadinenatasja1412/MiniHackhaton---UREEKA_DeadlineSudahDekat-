import express from "express";
import { login, regEmployee, register } from "../controllers/authControllers";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/regEmployee", regEmployee)

export default router;
