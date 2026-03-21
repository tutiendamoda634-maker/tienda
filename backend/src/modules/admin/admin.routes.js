import { Router } from 'express';
import {
  getAllTenants,
  getMetrics,
  updateTenantStatus,
  getTenantDetails,
  getRevenueAnalytics
} from './admin.controller.js';
import { requireAdminAuth } from '../../middleware/adminAuth.js';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdminAuth);

// Tenants
router.get('/tenants', getAllTenants);
router.get('/tenants/:id', getTenantDetails);
router.post('/tenants/:id/status', updateTenantStatus);

// Metrics
router.get('/metrics', getMetrics);

// Revenue
router.get('/revenue', getRevenueAnalytics);

export default router;
