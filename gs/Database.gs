var DB = (function() {
  function getSheet(sheetName) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    return ss.getSheetByName(sheetName);
  }

  function getHeaders(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  function parseCell(val) {
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  }

  function stringifyCell(val) {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val === undefined ? "" : val;
  }

  function getAllRecords(sheetName) {
    var sheet = getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    var headers = getHeaders(sheet);
    var data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

    var records = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      var isEmpty = true;
      for (var j = 0; j < headers.length; j++) {
        if (headers[j]) {
          var val = row[j];
          if (val !== "") isEmpty = false;
          obj[headers[j]] = parseCell(val);
        }
      }
      if (!isEmpty) {
        records.push(obj);
      }
    }
    return records;
  }

  function getRecordById(sheetName, id) {
    var records = getAllRecords(sheetName);
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) {
        return records[i];
      }
    }
    return null;
  }

  function createRecord(sheetName, data) {
    var sheet = getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);

    var headers = getHeaders(sheet);
    
    // Auto-generate ID if not present
    if (!data.id) {
      data.id = sheetName.toLowerCase().substring(0,3) + '_' + new Date().getTime();
    }
    // Auto-generate createdAt/updatedAt if missing
    if (!data.createdAt) data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    var rowToInsert = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      rowToInsert.push(stringifyCell(data[header]));
    }

    sheet.appendRow(rowToInsert);
    return data;
  }

  function updateRecord(sheetName, id, data) {
    var sheet = getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) throw new Error("Record not found: " + id);

    var headers = getHeaders(sheet);
    var idColIndex = headers.indexOf("id") + 1;
    if (idColIndex === 0) throw new Error("No 'id' column in sheet");

    var ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
    var rowIndex = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        rowIndex = i + 2; // +2 because data starts at row 2, and i is 0-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error("Record not found: " + id);
    }

    // Read existing row to merge updates
    var existingRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    var updatedRecord = {};
    
    data.updatedAt = new Date().toISOString();

    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var existingVal = parseCell(existingRow[j]);
      var newVal = data[header] !== undefined ? data[header] : existingVal;
      updatedRecord[header] = newVal;
      existingRow[j] = stringifyCell(newVal);
    }

    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([existingRow]);
    return updatedRecord;
  }

  function deleteRecord(sheetName, id) {
    var sheet = getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;

    var headers = getHeaders(sheet);
    var idColIndex = headers.indexOf("id") + 1;
    if (idColIndex === 0) throw new Error("No 'id' column in sheet");

    var ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
    var rowIndex = -1;
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        rowIndex = i + 2;
        break;
      }
    }

    if (rowIndex !== -1) {
      sheet.deleteRow(rowIndex);
      return true;
    }
    return false;
  }

  return {
    getAllRecords: getAllRecords,
    getRecordById: getRecordById,
    createRecord: createRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
  };
})();
