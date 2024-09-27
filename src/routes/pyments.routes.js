import { Router } from "express"
import { authenticateToken } from "../middleware/authMiddleware";
import {  makePayment,getTotalAmountPaid, getTotalAndRemainingAmount } from "../controllers/payment";


const paymentRouter = Router()

paymentRouter.post('/make-payment/:postId',authenticateToken, makePayment);
paymentRouter.get('/get-payment/:userId',authenticateToken, getTotalAmountPaid);
paymentRouter.get('/get-amount/',authenticateToken, getTotalAndRemainingAmount);

export default paymentRouter;