import express from "express";
import cors from "cors";
import path from "path";
import authRoute from "./routes/auth";
import invoiceRoute from "./routes/invoice";
import profileRoute from "./routes/profile";

const app = express();

app.use(cors());
app.use(express.json());

// Static untuk file PDF invoice
app.use(
  "/public",
  express.static(path.join(__dirname, "..", "public"))
);

app.use("/auth", authRoute);
app.use("/invoice", invoiceRoute);
app.use("/profile", profileRoute);

app.listen(3000, () => {
  console.log("Server jalan di 3000");
});
