function routeUsers(action, data, id) {
  switch (action) {
    case 'getAll':
      return { success: true, data: DB.getAllRecords('Users') };
    case 'getById':
      return { success: true, data: DB.getRecordById('Users', id) };
    case 'create':
      var newUser = DB.createRecord('Users', data);
      logActivity('Created', 'Created new user: ' + newUser.name);
      return { success: true, data: newUser };
    case 'update':
      var updatedUser = DB.updateRecord('Users', id, data);
      logActivity('Updated', 'Updated user: ' + updatedUser.name);
      return { success: true, data: updatedUser };
    case 'delete':
      var deleted = DB.deleteRecord('Users', id);
      if (deleted) logActivity('Deleted', 'Deleted user: ' + id);
      return { success: deleted };
    default:
      return { success: false, message: 'Unknown action for users: ' + action };
  }
}
