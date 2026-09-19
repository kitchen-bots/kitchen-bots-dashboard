import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove `import React from 'react';`
    content = re.sub(r"import\s+React\s+from\s+['\"]react['\"];\n", "", content)
    # Remove `React, ` from `import React, { useState } from 'react';`
    content = re.sub(r"import\s+React\s*,\s*\{\s*(.*?)\s*\}\s+from\s+['\"]react['\"];", r"import { \1 } from 'react';", content)

    # AuthContext - Add addresses and wishlist to mock user
    if "AuthContext.tsx" in filepath:
        content = content.replace("role: 'admin',", "role: 'admin',\n        addresses: [],\n        wishlist: [],")

    # AddProduct & EditProduct
    if "AddProduct.tsx" in filepath or "EditProduct.tsx" in filepath:
        content = re.sub(r"'active'\s*\|\s*'draft'\s*\|\s*'archived'", "ProductStatus", content)
        content = re.sub(r"'active'\s*\|\s*'draft'", "ProductStatus", content)
        content = content.replace("'active'", "'Active'")
        content = content.replace("'draft'", "'Draft'")
        content = content.replace("'archived'", "'Archived'")

    # ProductManagement
    if "ProductManagement.tsx" in filepath:
        content = content.replace("'active'", "'Active'")
        content = content.replace("'draft'", "'Draft'")

    # Remove some specific unused lucide icons that are common
    unused_icons = [
        "Info", "Filter", "MoreVertical", "Bell", "CheckCircle", "ImageIcon",
        "Trash2", "Upload", "Eye", "Settings2", "MapPin", "Edit2", "Download"
    ]
    for icon in unused_icons:
        content = re.sub(rf"{icon},\s*", "", content)

    # Remove unused variables
    if "AdminDashboard.tsx" in filepath:
        content = content.replace("(order, index)", "(order)")
    if "LeadsManagement.tsx" in filepath:
        content = content.replace("(lead, idx)", "(lead)")
        content = content.replace("import { leadService, Lead }", "import { leadService }\nimport { Lead }")
    if "ProductsManagement.tsx" in filepath:
        content = content.replace("const location = useLocation();\n", "")
        content = content.replace("(entry, index)", "(_, index)")
    if "OrdersManagement.tsx" in filepath:
        content = content.replace("const [isLoading, setIsLoading] = useState(true);", "const [, setIsLoading] = useState(true);")
    if "UserDetails.tsx" in filepath:
        content = content.replace("const { id } = useParams();\n", "")
    if "ContentManagement.tsx" in filepath:
        content = re.sub(r"import \{ QuickActionsFAB \} from '.*?QuickActionsFAB';\n", "", content)

    with open(filepath, 'w') as f:
        f.write(content)

def traverse(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                fix_file(os.path.join(root, file))

traverse('src')
