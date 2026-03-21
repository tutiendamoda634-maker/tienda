import jwt from 'jsonwebtoken';

/**
 * Simple admin authentication middleware
 * Checks for admin API key or JWT token
 */
export function requireAdminAuth(req, res, next) {
  // Check for API key in header
  const apiKey = req.headers['x-admin-key'];
  const adminKey = process.env.ADMIN_API_KEY || 'cloudshop-admin-2026';

  if (apiKey === adminKey) {
    req.isAdmin = true;
    return next();
  }

  // Check for admin JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token has admin role
      if (decoded.role === 'SUPERADMIN') {
        req.adminUser = decoded;
        req.isAdmin = true;
        return next();
      }
    } catch (err) {
      // Token invalid, continue to reject
    }
  }

  // For development/demo, allow access with simple password in body
  const adminPassword = req.headers['x-admin-password'];
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin2026';

  if (adminPassword === expectedPassword) {
    req.isAdmin = true;
    return next();
  }

  return res.status(401).json({
    error: 'No autorizado',
    code: 'ADMIN_AUTH_REQUIRED',
    message: 'Se requiere autenticación de administrador'
  });
}

/**
 * Generate admin JWT token
 */
export function generateAdminToken(adminId, email) {
  return jwt.sign(
    {
      sub: adminId,
      email,
      role: 'SUPERADMIN',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}
