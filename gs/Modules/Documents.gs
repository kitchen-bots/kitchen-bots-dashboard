function routeDocuments(action, data, id) {
  switch (action) {
    case 'getAll':
      return { success: true, data: DB.getAllRecords('Documents') };
    case 'getById':
      return { success: true, data: DB.getRecordById('Documents', id) };
    case 'create':
      var newDoc = DB.createRecord('Documents', data);
      logActivity('Created', 'Created new document: ' + newDoc.name);
      return { success: true, data: newDoc };
    case 'update':
      var updatedDoc = DB.updateRecord('Documents', id, data);
      logActivity('Updated', 'Updated document: ' + updatedDoc.name);
      return { success: true, data: updatedDoc };
    case 'delete':
      var deleted = DB.deleteRecord('Documents', id);
      if (deleted) logActivity('Deleted', 'Deleted document: ' + id);
      return { success: deleted };
    default:
      return { success: false, message: 'Unknown action for documents: ' + action };
  }
}
