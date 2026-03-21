const fs = require('fs');

const fileNames = [
  'PosPage.jsx',
  '../customers/ClientsPage.jsx'
];

for (const fn of fileNames) {
  const file = `c:/Users/jonat/Asesoria/saas-tienda-ropa/saas-tienda-ropa/frontend/src/modules/pos/${fn}`;
  let content = fs.readFileSync(file, 'utf8');

  // Replace import axios
  content = content.replace(/import axios from "axios";[\s\S]*?const api = axios\.create\(\{[\s\S]*?baseURL: import\.meta\.env\.VITE_API_URL[\s\S]*?\}\);/m, 'import api from "../../utils/api";');

  // Remove auth headers block
  content = content.replace(/  const tenant = localStorage\.getItem\("tenant"\) \|\| "modashop";\r?\n\r?\n  const authHeaders = \{\r?\n    Authorization: `Bearer \$\{token\}`,\r?\n    "X-Tenant": tenant\r?\n  \};\r?\n/m, '');

  content = content.replace(/, \{ headers: authHeaders \}/g, '');
  content = content.replace(/,\r?\n\s+\{ headers: authHeaders \}/g, '');

  fs.writeFileSync(file, content);
}

console.log("Reemplazado pos y clients ok");
