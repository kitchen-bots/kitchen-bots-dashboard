# DashboardHome
sed -i '' 's/flex-1 min-h-0/flex-1/g' src/dashboard/pages/customer/DashboardHome.tsx
sed -i '' 's/lg:col-span-8 space-y-8 overflow-y-auto pr-2 pb-8 custom-scrollbar/lg:col-span-8 space-y-8 pr-2 pb-8/g' src/dashboard/pages/customer/DashboardHome.tsx
sed -i '' 's/lg:col-span-4 space-y-8 overflow-y-auto pr-2 pb-8 custom-scrollbar/lg:col-span-4 space-y-8 overflow-y-auto pr-2 pb-8 custom-scrollbar sticky top-0 h-\[calc(100vh-120px)\]/g' src/dashboard/pages/customer/DashboardHome.tsx
