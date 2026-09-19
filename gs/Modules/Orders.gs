function routeOrders(action, data, id) {
  switch (action) {
    case 'getAll':
      return { success: true, data: DB.getAllRecords('Orders') };
    case 'getById':
      return { success: true, data: DB.getRecordById('Orders', id) };
    case 'create':
      var newOrder = DB.createRecord('Orders', data);
      logActivity('Created', 'Created new order: ' + newOrder.id);
      return { success: true, data: newOrder };
    case 'updateStatus':
      var updatedOrder = DB.updateRecord('Orders', id, { status: data.status });
      logActivity('Updated', 'Updated order status: ' + updatedOrder.id + ' to ' + updatedOrder.status);
      return { success: true, data: updatedOrder };
    case 'update':
      var updatedOrder2 = DB.updateRecord('Orders', id, data);
      logActivity('Updated', 'Updated order: ' + updatedOrder2.id);
      return { success: true, data: updatedOrder2 };
    case 'delete':
      var deleted = DB.deleteRecord('Orders', id);
      if (deleted) logActivity('Deleted', 'Deleted order: ' + id);
      return { success: deleted };
    default:
      return { success: false, message: 'Unknown action for orders: ' + action };
  }
}
