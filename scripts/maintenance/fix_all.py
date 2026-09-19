import os
import re

missing_imports = {
    'src/dashboard/components/Forms/index.tsx': ['UploadCloud'],
    'src/dashboard/components/Modals/ProductModal.tsx': [],
    'src/dashboard/components/NotificationSystem/NotificationSystem.tsx': [],
    'src/dashboard/layouts/Sidebar.tsx': ['Megaphone', 'HelpCircle'],
    'src/dashboard/pages/admin/AdminDashboard.tsx': ['IndianRupee', 'Box', 'Target', 'TrendingDown'],
    'src/dashboard/pages/admin/AdminSettings.tsx': ['User as UserIcon', 'Shield', 'Blocks', 'Check'],
    'src/dashboard/pages/admin/LeadsManagement.tsx': ['PhoneCall', 'UserCheck'],
    'src/dashboard/pages/admin/ProductsManagement.tsx': ['LayoutGrid', 'Copy'],
    'src/dashboard/pages/admin/ServicesManagement.tsx': ['Ticket'],
    'src/dashboard/pages/customer/AddOrder.tsx': [],
    'src/dashboard/pages/customer/EditProduct.tsx': [],
}

unused_imports = {
    'src/dashboard/components/Modals/ProductModal.tsx': ['Edit'],
    'src/dashboard/components/NotificationSystem/NotificationSystem.tsx': ['AlertCircle', 'activesetActiveFilter'],
    'src/dashboard/context/AuthContext.tsx': ['User'],
    'src/dashboard/context/DashboardContext.tsx': ['User'],
    'src/dashboard/pages/admin/AdminDashboard.tsx': ['Activity', 'User'],
    'src/dashboard/pages/admin/AdminSettings.tsx': ['History', 'Settings', 'User'],
    'src/dashboard/pages/admin/ContentManagement.tsx': ['Settings'],
    'src/dashboard/pages/admin/LeadsManagement.tsx': ['Activity', 'Archive', 'Info', 'Phone'],
    'src/dashboard/pages/admin/ProductsManagement.tsx': ['Activity', 'Grid'],
    'src/dashboard/pages/admin/ServicesManagement.tsx': ['Activity', 'Grid'],
    'src/dashboard/pages/customer/AddOrder.tsx': ['Link'],
    'src/dashboard/pages/customer/OrderDetails.tsx': ['Link'],
    'src/dashboard/pages/customer/UserDetails.tsx': ['useParams'],
    'src/dashboard/services/ticketService.ts': ['api']
}

for file in set(list(missing_imports.keys()) + list(unused_imports.keys())):
    if not os.path.exists(file): continue
    with open(file, 'r') as f:
        content = f.read()

    lucide_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];", content)
    if lucide_match:
        imports = [i.strip() for i in lucide_match.group(1).split(',')]
        
        # Add missing
        if file in missing_imports:
            for i in missing_imports[file]:
                # If we need alias like User as UserIcon
                base_name = i.split(' as ')[0]
                if not any(imp.startswith(base_name) for imp in imports):
                    imports.append(i)
                elif ' as ' in i and not any(imp == i for imp in imports):
                    # Replace existing base name with alias
                    imports = [imp for imp in imports if imp != base_name]
                    imports.append(i)

        # Remove unused
        if file in unused_imports:
            for r in unused_imports[file]:
                if r in imports:
                    imports.remove(r)

        imports = sorted(imports)
        new_import_str = "import { " + ", ".join(imports) + " } from 'lucide-react';"
        content = content[:lucide_match.start()] + new_import_str + content[lucide_match.end():]
        
        with open(file, 'w') as f:
            f.write(content)

