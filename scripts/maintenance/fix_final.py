import re

# base.api.ts
with open('src/dashboard/api/base.api.ts', 'r') as f: content = f.read()
content = content.replace("options?: RequestInit", "/*options?: RequestInit*/")
content = re.sub(r",\s*options", "", content) # removes the passing of options
with open('src/dashboard/api/base.api.ts', 'w') as f: f.write(content)

# ActivityTimeline.tsx
with open('src/dashboard/components/common/ActivityTimeline.tsx', 'r') as f: content = f.read()
content = content.replace("index", "_index")
with open('src/dashboard/components/common/ActivityTimeline.tsx', 'w') as f: f.write(content)

# FileUpload.tsx
with open('src/dashboard/components/common/FileUpload.tsx', 'r') as f: content = f.read()
content = content.replace("ononUpload", "onUpload")
with open('src/dashboard/components/common/FileUpload.tsx', 'w') as f: f.write(content)

# NotificationSystem.tsx
with open('src/dashboard/components/NotificationSystem/NotificationSystem.tsx', 'r') as f: content = f.read()
content = content.replace("const [activeFilter, activesetActiveFilter] = useState('all');", "const [activeFilter, setActiveFilter] = useState('all');")
content = content.replace("activesetActiveFilter", "setActiveFilter")
with open('src/dashboard/components/NotificationSystem/NotificationSystem.tsx', 'w') as f: f.write(content)

# AdminDashboard.tsx
with open('src/dashboard/pages/admin/AdminDashboard.tsx', 'r') as f: content = f.read()
content = re.sub(r"\(activity, index\)", "(activity)", content)
with open('src/dashboard/pages/admin/AdminDashboard.tsx', 'w') as f: f.write(content)

# LeadsManagement.tsx
with open('src/dashboard/pages/admin/LeadsManagement.tsx', 'r') as f: content = f.read()
content = content.replace("import { Lead } from '../../services/leadService';", "")
content = re.sub(r"\(lead, idx\)", "(lead)", content)
with open('src/dashboard/pages/admin/LeadsManagement.tsx', 'w') as f: f.write(content)

# ProductsManagement.tsx
with open('src/dashboard/pages/admin/ProductsManagement.tsx', 'r') as f: content = f.read()
content = content.replace("import { useLocation } from 'react-router-dom';", "")
content = content.replace("Math.abs(product.price - (product.originalPrice || product.price))", "Math.abs(Number(product.price) - Number(product.originalPrice || product.price))")
with open('src/dashboard/pages/admin/ProductsManagement.tsx', 'w') as f: f.write(content)

# EditProduct.tsx
with open('src/dashboard/pages/customer/EditProduct.tsx', 'r') as f: content = f.read()
content = content.replace("sku: data.sku,", "sku: data.sku || '',")
with open('src/dashboard/pages/customer/EditProduct.tsx', 'w') as f: f.write(content)

# UserDetails.tsx
with open('src/dashboard/pages/customer/UserDetails.tsx', 'r') as f: content = f.read()
content = content.replace("import { useParams } from 'react-router-dom';", "")
with open('src/dashboard/pages/customer/UserDetails.tsx', 'w') as f: f.write(content)

# ticketService.ts
with open('src/dashboard/services/ticketService.ts', 'r') as f: content = f.read()
content = re.sub(r"import\s*\{\s*api\s*\}\s*from\s*['\"]../api['\"];\n", "", content)
with open('src/dashboard/services/ticketService.ts', 'w') as f: f.write(content)

