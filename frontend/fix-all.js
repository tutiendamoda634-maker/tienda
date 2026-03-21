const fs = require('fs');

const filesToProcess = [
  'src/arqueo/CashRegisterPage.jsx',
  'src/modules/reports/ReportsPage.jsx',
  'src/modules/providers/ProvidersPage.jsx',
  'src/modules/promotions/PromotionsPage.jsx',
  'src/modules/dashboard/Dashboard.jsx',
  'src/modules/auth/Login.jsx'
];

for (const f of filesToProcess) {
  const file = `c:/Users/jonat/Asesoria/saas-tienda-ropa/saas-tienda-ropa/frontend/${f}`;
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  // Replace import axios
  content = content.replace(/import axios from "axios";[\s\S]*?const api = axios\.create\(\{[\s\S]*?baseURL: import\.meta\.env\.VITE_API_URL[\s\S]*?\}\);/m, 'import api from "../../utils/api";');
  content = content.replace(/import axios from "axios";/g, 'import api from "../../utils/api";');

  // Replace manual API_URL combinations
  content = content.replace(/`\$\{API_URL\}\//g, '`/');
  content = content.replace(/API_URL\s*\+\s*"\//g, '"/');
  
  // Replace axios.get, axios.post, etc with api.get, api.post
  content = content.replace(/axios\.get/g, 'api.get');
  content = content.replace(/axios\.post/g, 'api.post');
  content = content.replace(/axios\.put/g, 'api.put');
  content = content.replace(/axios\.delete/g, 'api.delete');
  content = content.replace(/axios\.patch/g, 'api.patch');

  // Remove auth headers logic
  content = content.replace(/const getAuthHeaders = \(\) => \{[\s\S]*?X-Tenant[\s\S]*?return \{[\s\S]*?\}\s*\};\r?\n?/g, '');
  content = content.replace(/,\s*\{\s*headers:\s*getAuthHeaders\(\)\s*\}/g, '');
  content = content.replace(/const headers = getAuthHeaders\(\);\r?\n?/g, '');
  content = content.replace(/,\s*\{\s*headers\s*\}/g, '');

  fs.writeFileSync(file, content);
}
console.log("Refactoring completado en el resto de páginas.");
