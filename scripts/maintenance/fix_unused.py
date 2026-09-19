import re
import sys

def fix_imports(filepath, removes, adds=None):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the lucide-react import
    lucide_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];", content)
    if lucide_match:
        imports = [i.strip() for i in lucide_match.group(1).split(',')]
        for r in removes:
            if r in imports:
                imports.remove(r)
        if adds:
            for a in adds:
                if a not in imports:
                    imports.append(a)
        imports = sorted(imports)
        new_import_str = "import { " + ", ".join(imports) + " } from 'lucide-react';"
        content = content[:lucide_match.start()] + new_import_str + content[lucide_match.end():]
        
    with open(filepath, 'w') as f:
        f.write(content)

fix_imports('src/dashboard/pages/customer/OrderDetails.tsx', ['Link', 'Info'])
fix_imports('src/dashboard/pages/customer/OrdersManagement.tsx', ['Grid'])
fix_imports('src/dashboard/pages/customer/ProductManagement.tsx', ['Edit', 'Menu'])
fix_imports('src/dashboard/pages/customer/StaffManagement.tsx', ['User'])
fix_imports('src/dashboard/pages/customer/UserDetails.tsx', ['Activity', 'Edit', 'Grid', 'User'])

# For UserDetails, we also need to remove useParams
with open('src/dashboard/pages/customer/UserDetails.tsx', 'r') as f:
    ud_content = f.read()
ud_content = ud_content.replace("import { useParams } from 'react-router-dom';", "")
ud_content = ud_content.replace("import { Link, useParams } from 'react-router-dom';", "import { Link } from 'react-router-dom';")
with open('src/dashboard/pages/customer/UserDetails.tsx', 'w') as f:
    f.write(ud_content)

# AdminRoutes.tsx: remove unused imports
with open('src/dashboard/routes/AdminRoutes.tsx', 'r') as f:
    ar = f.read()
ar = re.sub(r"import\s+\{\s*Settings,\s*Users\s*\}\s+from\s+['\"]lucide-react['\"];\n", "", ar)
with open('src/dashboard/routes/AdminRoutes.tsx', 'w') as f:
    f.write(ar)

# Services:
def remove_import_line(filepath, pattern):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    with open(filepath, 'w') as f:
        for line in lines:
            if not re.search(pattern, line):
                f.write(line)

remove_import_line('src/dashboard/services/activityService.ts', r"lucide-react")
remove_import_line('src/dashboard/services/contentService.ts', r"lucide-react")
remove_import_line('src/dashboard/services/mockData.ts', r"lucide-react")
remove_import_line('src/dashboard/services/notificationService.ts', r"lucide-react")
remove_import_line('src/dashboard/services/ticketService.ts', r"import\s+\{\s*api\s*\}\s+from\s+['\"]../api['\"];")
remove_import_line('src/dashboard/services/uploadService.ts', r"lucide-react")
remove_import_line('src/dashboard/services/userService.ts', r"lucide-react")

