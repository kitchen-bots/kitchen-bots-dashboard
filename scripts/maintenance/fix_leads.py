import re

with open('src/dashboard/pages/admin/LeadsManagement.tsx', 'r') as f:
    leads = f.read()

# Add the loading and error blocks back
new_blocks = """  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <ErrorState message={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return ("""

leads = leads.replace("  return (", new_blocks, 1)

with open('src/dashboard/pages/admin/LeadsManagement.tsx', 'w') as f:
    f.write(leads)
