function routeLeads(action, data, id) {
  switch (action) {
    case 'getAll':
      return { success: true, data: DB.getAllRecords('Leads') };
    case 'getById':
      return { success: true, data: DB.getRecordById('Leads', id) };
    case 'create':
      var newLead = DB.createRecord('Leads', data);
      logActivity('Created', 'Created new lead: ' + newLead.name);
      return { success: true, data: newLead };
    case 'update':
      var updatedLead = DB.updateRecord('Leads', id, data);
      logActivity('Updated', 'Updated lead: ' + updatedLead.name);
      return { success: true, data: updatedLead };
    case 'delete':
      var deleted = DB.deleteRecord('Leads', id);
      if (deleted) logActivity('Deleted', 'Deleted lead: ' + id);
      return { success: deleted };
    default:
      return { success: false, message: 'Unknown action for leads: ' + action };
  }
}
