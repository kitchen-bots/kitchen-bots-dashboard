function logActivity(type, message, user) {
  try {
    var data = {
      id: 'act_' + new Date().getTime(),
      type: type,
      message: message,
      timestamp: new Date().toISOString(),
      user: user || { name: 'System', avatar: 'https://ui-avatars.com/api/?name=Sys&background=e5e7eb&color=374151' }
    };
    DB.createRecord('ActivityLogs', data);
  } catch (e) {
    // Ignore logging errors so they don't break the main flow
    Logger.log("Failed to log activity: " + e.toString());
  }
}
