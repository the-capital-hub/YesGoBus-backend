import express from "express";
import {
  initiatePaymentController,
  checkPaymentStatusController,
  refundPaymentController,
  paymentCashfreeStatus
} from "../controllers/payment.controller.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/initiatePayment", initiatePaymentController);
router.post("/checkPaymentStatus/:merchantTransactionId", checkPaymentStatusController);
router.post("/cashfreePayment", paymentCashfreeStatus )

router.use(authenticateUser);

router.post("/refundPayment", refundPaymentController);

export default router;