import { Router } from 'express';
import {
  registerTenant,
  loginTenant,
  checkSlugAvailability
} from './tenants.controller.js';

const router = Router();

// Public routes (no auth required)
router.post('/register', registerTenant);
router.post('/login', loginTenant);
router.get('/check-slug/:slug', checkSlugAvailability);

export default router;
