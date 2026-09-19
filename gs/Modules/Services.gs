function routeServices(action, data, id) {
  switch (action) {
    case 'getAll':
      return { success: true, data: DB.getAllRecords('Services') };
    case 'getById':
      return { success: true, data: DB.getRecordById('Services', id) };
    case 'create':
      var newTicket = DB.createRecord('Services', data);
      logActivity('Created', 'Created new service ticket: ' + newTicket.title);
      return { success: true, data: newTicket };
    case 'update':
      var updatedTicket = DB.updateRecord('Services', id, data);
      logActivity('Updated', 'Updated service ticket: ' + updatedTicket.title);
      return { success: true, data: updatedTicket };
    case 'delete':
      var deleted = DB.deleteRecord('Services', id);
      if (deleted) logActivity('Deleted', 'Deleted service ticket: ' + id);
      return { success: deleted };
    default:
      return { success: false, message: 'Unknown action for services: ' + action };
  }
}
