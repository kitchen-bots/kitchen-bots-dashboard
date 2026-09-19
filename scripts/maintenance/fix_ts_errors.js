const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove unused React imports (since React 17+ doesn't need them if they aren't used)
    content = content.replace(/import\s+React\s+from\s+['"]react['"];\n/g, '');
    content = content.replace(/import\s+React,\s*{\s*(.*?)\s*}\s+from\s+['"]react['"];/g, (match, p1) => {
        return `import { ${p1} } from 'react';`;
    });

    // Replace specific unused imports or variables from tsc output
    if (filePath.includes('NotificationSystem.tsx')) {
        content = content.replace(/Info,\s*/, '').replace(/Filter,\s*/, '');
    }
    if (filePath.includes('Tables/index.tsx')) {
        content = content.replace(/MoreVertical,\s*/, '');
    }
    if (filePath.includes('Header.tsx')) {
        content = content.replace(/Bell,\s*/, '');
    }
    if (filePath.includes('AdminDashboard.tsx')) {
        content = content.replace(/CheckCircle,\s*/, '');
        content = content.replace(/\{orders.map\(\(order, index\)/, '{orders.map((order)');
    }
    if (filePath.includes('ContentManagement.tsx')) {
        content = content.replace(/ImageIcon,\s*/, '');
        content = content.replace(/import\s*{\s*QuickActionsFAB\s*}\s*from\s*'.*QuickActionsFAB';\n/, '');
    }
    if (filePath.includes('LeadsManagement.tsx')) {
        content = content.replace(/MoreVertical,\s*/, '').replace(/Trash2,\s*/, '');
        content = content.replace(/import\s*{\s*leadService,\s*Lead\s*}\s*from\s*'\.\.\/\.\.\/services\/leadService';/, "import { leadService } from '../../services/leadService';\nimport { Lead } from '../../types';");
        content = content.replace(/\(lead, idx\)/, '(lead)');
    }
    if (filePath.includes('ProductsManagement.tsx')) {
        content = content.replace(/Upload,\s*/, '');
        content = content.replace(/MoreVertical,\s*/, '');
        content = content.replace(/const\s+location\s*=\s*useLocation\(\);\n/, '');
        content = content.replace(/\(entry,\s*index\)\s*=>/, '(_, index) =>');
        // Fix TS2362 in ProductsManagement.tsx (Math.random() * '2000' -> Math.random() * 2000)
        content = content.replace(/Math\.random\(\)\s*\*\s*'2000'/g, 'Math.random() * 2000');
    }
    if (filePath.includes('AddOrder.tsx')) {
        content = content.replace(/Link,\s*/, '');
        content = content.replace(/Eye,\s*/, '').replace(/Upload,\s*/, '').replace(/Info,\s*/, '').replace(/Settings2,\s*/, '').replace(/MapPin,\s*/, '');
    }
    if (filePath.includes('AddProduct.tsx')) {
        content = content.replace(/Link,\s*/, '');
        // Fix ProductStatus "active" -> "Active"
        content = content.replace(/'active'\s*\|\s*'draft'/g, "'Active' | 'Draft'");
        content = content.replace(/setStatus\('active'\)/g, "setStatus('Active')");
        content = content.replace(/status:\s*'active'/g, "status: 'Active'");
        content = content.replace(/status:\s*'draft'/g, "status: 'Draft'");
    }
    if (filePath.includes('EditProduct.tsx')) {
        // 'ProductStatus' is not assignable to type '"active" | "draft" | "archived"'
        content = content.replace(/'active'\s*\|\s*'draft'\s*\|\s*'archived'/g, "ProductStatus");
        content = content.replace(/'active'/g, "'Active'").replace(/'draft'/g, "'Draft'").replace(/'archived'/g, "'Archived'");
        // status: string | undefined -> string
        content = content.replace(/status:\s*e\.target\.value/, "status: e.target.value as ProductStatus");
        content = content.replace(/id:\s*id,/g, "id: id || '',");
    }
    if (filePath.includes('OrdersManagement.tsx')) {
        content = content.replace(/Edit2,\s*/, '').replace(/Download,\s*/, '');
        content = content.replace(/const\s+\[isLoading,\s*setIsLoading\]\s*=\s*useState\(true\);/, 'const [, setIsLoading] = useState(true);');
    }
    if (filePath.includes('ProductManagement.tsx')) {
        content = content.replace(/MoreVertical,\s*/, '');
        content = content.replace(/product\.status\s*===\s*'active'/g, "product.status === 'Active'");
        content = content.replace(/product\.status\s*===\s*'draft'/g, "product.status === 'Draft'");
    }
    if (filePath.includes('UserDetails.tsx')) {
        content = content.replace(/const\s+{\s*id\s*}\s*=\s*useParams\(\);/, '');
    }
    if (filePath.includes('ticketService.ts')) {
        content = content.replace(/import\s*api\s*from\s*'.*api';\n/, '');
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            fixFile(fullPath);
        }
    }
}

traverse(srcDir);
