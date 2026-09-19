# AdminLayout
sed -i '' 's/overflow-hidden"/overflow-y-auto custom-scrollbar"/g' src/dashboard/layouts/AdminLayout.tsx

# DashboardLayout
sed -i '' 's/overflow-hidden"/overflow-y-auto custom-scrollbar"/g' src/dashboard/layouts/DashboardLayout.tsx

# AdminDashboard
sed -i '' 's/flex-1 min-h-0/flex-1/g' src/dashboard/pages/admin/AdminDashboard.tsx
sed -i '' 's/lg:col-span-8 xl:col-span-9 space-y-6 overflow-y-auto pr-2 pb-8 custom-scrollbar/lg:col-span-8 xl:col-span-9 space-y-6 pr-2 pb-8/g' src/dashboard/pages/admin/AdminDashboard.tsx

sed -i '' 's/lg:col-span-4 xl:col-span-3 space-y-6 overflow-y-auto pr-2 pb-8 custom-scrollbar/lg:col-span-4 xl:col-span-3 space-y-6 overflow-y-auto pr-2 pb-8 custom-scrollbar sticky top-0 h-[calc(100vh-120px)]/g' src/dashboard/pages/admin/AdminDashboard.tsx

