import { Router } from 'express';
import {
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription
} from './subscriptions.controller.js';

const router = Router();

// Subscription management routes
router.get('/status', getSubscriptionStatus);
router.post('/cancel', cancelSubscription);
router.post('/reactivate', reactivateSubscription);

export default router;
