import re
import os

files_to_fix = [
    'src/dashboard/api/base.api.ts',
    'src/dashboard/api/users.api.ts',
    'src/dashboard/components/CommandPalette/CommandPalette.tsx',
    'src/dashboard/components/common/ActivityTimeline.tsx',
    'src/dashboard/components/common/FileUpload.tsx',
    'src/dashboard/components/common/QuickActionsFAB.tsx',
    'src/dashboard/components/Modals/ProductModal.tsx',
    'src/dashboard/components/NotificationSystem/NotificationSystem.tsx',
    'src/dashboard/pages/admin/AdminDashboard.tsx',
    'src/dashboard/pages/admin/LeadsManagement.tsx',
    'src/dashboard/pages/admin/ProductsManagement.tsx',
    'src/dashboard/pages/customer/AddOrder.tsx',
    'src/dashboard/pages/customer/EditProduct.tsx',
    'src/dashboard/pages/customer/OrderDetails.tsx',
    'src/dashboard/pages/customer/UserDetails.tsx',
    'src/dashboard/services/ticketService.ts'
]

# Common fix function
def remove_unused(file, removes):
    with open(file, 'r') as f:
        content = f.read()

    # remove unused lucide react imports
    lucide_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];", content)
    if lucide_match:
        imports = [i.strip() for i in lucide_match.group(1).split(',')]
        imports = [i for i in imports if i.split(' as ')[0] not in removes]
        
        if imports:
            new_import_str = "import { " + ", ".join(imports) + " } from 'lucide-react';"
            content = content[:lucide_match.start()] + new_import_str + content[lucide_match.end():]
        else:
            content = content[:lucide_match.start()] + content[lucide_match.end():]

    # special removes
    if file == 'src/dashboard/pages/customer/AddOrder.tsx':
        content = content.replace("import { Link, useNavigate, useLocation } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';")
    elif file == 'src/dashboard/pages/customer/OrderDetails.tsx':
        content = content.replace("import { Link, useParams, useNavigate } from 'react-router-dom';", "import { useParams, useNavigate } from 'react-router-dom';")
    elif file == 'src/dashboard/pages/customer/UserDetails.tsx':
        content = content.replace("import { Link, useParams } from 'react-router-dom';", "import { Link } from 'react-router-dom';")
    elif file == 'src/dashboard/services/ticketService.ts':
        content = re.sub(r"import\s*\{\s*api\s*\}\s*from\s*['\"]../api['\"];\n", "", content)
    elif file == 'src/dashboard/api/base.api.ts':
        content = content.replace("options?: RequestInit", "/*options?: RequestInit*/")
    elif file == 'src/dashboard/api/users.api.ts':
        content = re.sub(r"import\s*\{\s*User\s*\}\s*from\s*['\"]lucide-react['\"];\n", "", content)
    elif file == 'src/dashboard/components/NotificationSystem/NotificationSystem.tsx':
        content = content.replace("const [activeFilter, activesetActiveFilter] = useState('all');", "const [activeFilter, setActiveFilter] = useState('all');")
        content = content.replace("const [activeFilter, setActiveFilter] = useState<string>('all');", "const [activeFilter, setActiveFilter] = useState('all');") # just in case
    elif file == 'src/dashboard/components/common/FileUpload.tsx':
        content = content.replace("onaccept", "accept")
        content = content.replace("Upload(", "onUpload(")
        content = content.replace("UploadCloud", "Upload") # rollback from UploadCloud to Upload in imports
        
    elif file == 'src/dashboard/components/Modals/ProductModal.tsx':
        content = content.replace("../../../types", "../../types")
        content = content.replace("(prev) =>", "(prev: any) =>")
    elif file == 'src/dashboard/pages/admin/ProductsManagement.tsx':
        content = content.replace("import { useLocation } from 'react-router-dom';", "")
        content = content.replace("Math.abs(product.price - (product.originalPrice || product.price))", "Math.abs(Number(product.price) - Number(product.originalPrice || product.price))")
    elif file == 'src/dashboard/pages/admin/LeadsManagement.tsx':
        content = re.sub(r"import\s*\{\s*Lead\s*\}\s*from\s*['\"]../../services/leadService['\"];\n", "", content)
    elif file == 'src/dashboard/pages/customer/EditProduct.tsx':
        content = content.replace("status: data.status,", "status: data.status as ProductStatus,")
        content = content.replace("if (!id) return;", "if (!id) return;")

    with open(file, 'w') as f:
        f.write(content)

remove_unused('src/dashboard/api/base.api.ts', [])
remove_unused('src/dashboard/api/users.api.ts', ['User'])
remove_unused('src/dashboard/components/CommandPalette/CommandPalette.tsx', ['Filter', 'List', 'User'])
remove_unused('src/dashboard/components/common/ActivityTimeline.tsx', [])
remove_unused('src/dashboard/components/common/FileUpload.tsx', ['File', 'UploadCloud'])
remove_unused('src/dashboard/components/common/QuickActionsFAB.tsx', ['Settings', 'Upload', 'User'])
remove_unused('src/dashboard/components/Modals/ProductModal.tsx', [])
remove_unused('src/dashboard/components/NotificationSystem/NotificationSystem.tsx', ['AlertCircle'])
remove_unused('src/dashboard/pages/admin/AdminDashboard.tsx', [])
remove_unused('src/dashboard/pages/admin/LeadsManagement.tsx', [])
remove_unused('src/dashboard/pages/admin/ProductsManagement.tsx', [])
remove_unused('src/dashboard/pages/customer/AddOrder.tsx', [])
remove_unused('src/dashboard/pages/customer/EditProduct.tsx', [])
remove_unused('src/dashboard/pages/customer/OrderDetails.tsx', [])
remove_unused('src/dashboard/pages/customer/UserDetails.tsx', [])
remove_unused('src/dashboard/services/ticketService.ts', [])

# FileUpload.tsx needs Upload added to lucide react
with open('src/dashboard/components/common/FileUpload.tsx', 'r') as f:
    fc = f.read()
fc = fc.replace("import { X } from 'lucide-react';", "import { X, UploadCloud } from 'lucide-react';")
with open('src/dashboard/components/common/FileUpload.tsx', 'w') as f:
    f.write(fc)

