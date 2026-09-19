function routeProducts(action, data, id) {
  switch (action) {
    case 'getAll':
      return { success: true, data: DB.getAllRecords('Products') };
    case 'getById':
      return { success: true, data: DB.getRecordById('Products', id) };
    case 'create':
      var newProd = DB.createRecord('Products', data);
      logActivity('Created', 'Created new product: ' + newProd.name);
      return { success: true, data: newProd };
    case 'update':
      var updatedProd = DB.updateRecord('Products', id, data);
      logActivity('Updated', 'Updated product: ' + updatedProd.name);
      return { success: true, data: updatedProd };
    case 'delete':
      var deleted = DB.deleteRecord('Products', id);
      if (deleted) logActivity('Deleted', 'Deleted product: ' + id);
      return { success: deleted };
    default:
      return { success: false, message: 'Unknown action for products: ' + action };
  }
}
