import os
import re

LUCIDE_ICONS = [
    "ClipboardList", "Clock", "Truck", "XCircle", "Filter", "Plus", "Eye", 
    "Edit2", "Download", "ArrowRight", "AlertCircle", "Banknote", "Headset", 
    "ShoppingCart", "Trash2", "PackageX", "Upload", "Info", "Settings2", 
    "MapPin", "CheckCircle", "MoreVertical", "ImageIcon", "Bell", "Users",
    "LayoutDashboard", "Package", "FileText", "Settings", "LifeBuoy", "Menu",
    "Search", "Sun", "Moon", "LogOut", "ChevronRight", "Activity", "Calendar",
    "MessageSquare", "Phone", "Mail", "Globe", "Briefcase", "User",
    "UserPlus", "Edit", "Ban", "Lock", "ChevronLeft", "RefreshCw", "LogIn",
    "X", "ArrowLeft", "Building2", "ShieldCheck", "CheckCircle2", "Receipt",
    "Folder", "File", "History",
    "PlusCircle", "BarChart", "FileWarning", "FolderOpen", "Book", "Wrench",
    "Share2", "Maximize", "Refrigerator", "Microwave", "ExternalLink", "Loader2",
    "CreditCard", "Archive", "AlertTriangle", "ChefHat", "Thermometer", "Droplets",
    "TrendingUp", "Timer", "Zap", "Wind", "Landmark", "RefreshCcw", "Printer",
    "Star", "ChevronDown", "Grid", "List"
]

def fix_lucide_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all used Lucide icons in the file
    used_icons = set()
    for icon in LUCIDE_ICONS:
        if re.search(r'<\s*' + icon + r'\b', content) or re.search(r'\b' + icon + r'\b', content):
            used_icons.add(icon)
            
    if not used_icons:
        return

    if "from 'lucide-react'" in content or 'from "lucide-react"' in content:
        import_str = f"import {{ {', '.join(sorted(used_icons))} }} from 'lucide-react';"
        content = re.sub(r'import\s+\{([^}]*)\}\s+from\s+[\'"]lucide-react[\'"];?', import_str, content)
    else:
        import_str = f"import {{ {', '.join(sorted(used_icons))} }} from 'lucide-react';\n"
        content = import_str + content

    with open(filepath, 'w') as f:
        f.write(content)

def traverse(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                fix_lucide_imports(os.path.join(root, file))

traverse('src')

# Fix duplicate User import in mockData and userService
for file in ['src/dashboard/services/mockData.ts', 'src/dashboard/services/userService.ts']:
    with open(file, 'r') as f:
        content = f.read()
    content = re.sub(r"import\s*\{\s*User\s*\}\s*from\s*'../types';\s*import\s*\{\s*User\s*\}\s*from\s*'../types';\n", "import { User } from '../types';\n", content)
    with open(file, 'w') as f:
        f.write(content)
