import re

with open('src/dashboard/pages/admin/LeadsManagement.tsx', 'r') as f:
    content = f.read()

# Add useLeads imports
content = re.sub(
    r"import { Quotation, CRMActivity, FollowUpTask, leadService } from '../../services/leadService';",
    "import { Quotation, CRMActivity, FollowUpTask } from '../../services/leadService';\nimport { useLeads, useCRMActivities, useFollowUpTasks, useDeleteLead } from '../../hooks/queries';",
    content
)

# Replace the component body up to the return statement
new_body = """export function LeadsManagement() {
  const { data: leadsData, isLoading: loadingLeads, error: leadsError, refetch } = useLeads();
  const { data: activitiesData, isLoading: loadingActivities } = useCRMActivities();
  const { data: followUpsData, isLoading: loadingFollowUps } = useFollowUpTasks();
  const deleteLeadMutation = useDeleteLead();

  const leads = leadsData?.data || [];
  const activities = activitiesData?.data || [];
  const followUps = followUpsData?.data || [];
  const [quotations, setQuotations] = useState<Quotation[]>([]); // Keep if not fetched
  
  const loading = loadingLeads || loadingActivities || loadingFollowUps;
  const error = leadsError ? "Failed to load CRM data." : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <ErrorState message={error} onRetry={() => refetch()} />
      </div>
    );
  }

"""

content = re.sub(
    r"export function LeadsManagement\(\) \{[\s\S]*?useEffect\(\(\) => \{\n    fetchData\(\);\n  \}, \[\]\);",
    new_body,
    content
)

with open('src/dashboard/pages/admin/LeadsManagement.tsx', 'w') as f:
    f.write(content)
