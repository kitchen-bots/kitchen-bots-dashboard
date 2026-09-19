npm init -y

npm install react react-dom react-router-dom lucide-react recharts framer-motion clsx tailwind-merge date-fns
npm install -D vite @vitejs/plugin-react typescript tailwindcss postcss autoprefixer @types/react @types/react-dom @types/node

cat << 'VITE_EOF' > vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
VITE_EOF

cat << 'TSCONFIG_EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
TSCONFIG_EOF

cat << 'TSCONFIG_NODE_EOF' > tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
TSCONFIG_NODE_EOF

cat << 'TAILWIND_EOF' > tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#def0e6',
          200: '#c0e0ce',
          300: '#95cab1',
          400: '#64ac8e',
          500: '#408f71',
          600: '#2f7259',
          700: '#265b49',
          800: '#21493c',
          900: '#1c3d33',
        }
      }
    },
  },
  plugins: [],
}
TAILWIND_EOF

cat << 'POSTCSS_EOF' > postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS_EOF

cat << 'HTML_EOF' > index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KitchenBots Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML_EOF

cat << 'CSS_EOF' > src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
CSS_EOF

cat << 'APP_EOF' > src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoutes } from './dashboard/routes/AdminRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
APP_EOF

cat << 'MAIN_EOF' > src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAIN_EOF

sed -i '' 's/"main": "index.js"/"type": "module", "scripts": {"dev": "vite", "build": "tsc && vite build", "preview": "vite preview"}/' package.json

echo "Setup complete"
