import { Router } from 'express';
import {
  handleMercadoPagoWebhook,
  verifyWebhookSignature
} from './mercadopago.controller.js';

const router = Router();

// MercadoPago webhook endpoint
// POST /api/webhooks/mercadopago
router.post('/mercadopago', verifyWebhookSignature, handleMercadoPagoWebhook);

export default router;
