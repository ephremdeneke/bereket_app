// Pure Google Apps Script backend code export for moshaga Cafe Manager

/**
 * WARNING: This is a React/Vite module for displaying and copying the Apps Script code.
 * Do NOT paste this wrapper line into Google Apps Script.
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * moshaga Cafe Manager - Google Apps Script Backend API
 * Database: Google Sheets
 * SpreadSheet URL: https://docs.google.com/spreadsheets/d/1QKC8zPRQS2UG5nijS4oZw_2hoHZKGWLeoghlUpzqXhk/edit?usp=sharing
 */

// Initialize / setup database sheet structure
function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetsToCreate = [
    {
      name: 'Products',
      headers: ['Product ID', 'Product Name', 'Category', 'Selling Price', 'Status', 'Created At', 'Updated At']
    },
    {
      name: 'DailySales',
      headers: ['Sales ID', 'Date', 'Calculated Sales', 'Cash Sales', 'Bank Sales', 'Recorded Total', 'Difference', 'Reconciliation Status', 'Notes', 'Created At', 'Updated At']
    },
    {
      name: 'DailySalesItems',
      headers: ['Sales Item ID', 'Sales ID', 'Date', 'Product ID', 'Product Name', 'Quantity', 'Unit Price', 'Calculated Amount']
    },
    {
      name: 'Inventory',
      headers: ['Item ID', 'Item Name', 'Category', 'Unit', 'Current Quantity', 'Minimum Stock', 'Purchase Cost', 'Supplier ID', 'Status', 'Created At', 'Updated At']
    },
    {
      name: 'InventoryTransactions',
      headers: ['Transaction ID', 'Date', 'Item ID', 'Item Name', 'Transaction Type', 'Quantity', 'Unit Cost', 'Description', 'Created At']
    },
    {
      name: 'Expenses',
      headers: ['Expense ID', 'Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Created At', 'Updated At']
    },
    {
      name: 'Suppliers',
      headers: ['Supplier ID', 'Supplier Name', 'Contact', 'Items Supplied', 'Status', 'Created At']
    },
    {
      name: 'Settings',
      headers: ['Key', 'Value']
    },
    {
      name: 'Users',
      headers: ['User ID', 'Username', 'Password Hash', 'Role', 'Status', 'Created At', 'Updated At']
    }
  ];

  sheetsToCreate.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(item.headers);
      sheet.getRange(1, 1, 1, item.headers.length).setFontWeight("bold").setBackground("#f3f4f6");
    }
  });

  // Seed default products if empty
  var productSheet = ss.getSheetByName('Products');
  if (productSheet.getLastRow() <= 1) {
    var defaultProducts = [
      ['PROD-001', 'Macchiato', 'Hot Coffee', 80, 'Active', new Date().toISOString(), new Date().toISOString()],
      ['PROD-002', 'Milk', 'Beverage', 50, 'Active', new Date().toISOString(), new Date().toISOString()],
      ['PROD-003', 'Tea', 'Hot Tea', 40, 'Active', new Date().toISOString(), new Date().toISOString()],
      ['PROD-004', 'Normal Coffee', 'Hot Coffee', 50, 'Active', new Date().toISOString(), new Date().toISOString()],
      ['PROD-005', 'Moshaga Coffee', 'Speciality', 100, 'Active', new Date().toISOString(), new Date().toISOString()]
    ];
    defaultProducts.forEach(function(row) { productSheet.appendRow(row); });
  }

  // Seed default admin user if none exists
  var userSheet = ss.getSheetByName('Users');
  if (userSheet && userSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    userSheet.appendRow(['USER-001', 'admin', sha256Hex('admin123'), 'Admin', 'Active', now, now]);
  }

  return "Database structure successfully setup!";
}

// Enable Web API handling
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var output = { success: false, data: null, error: null };
  
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var postData = null;

    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch(err) {
        postData = e.postData.contents;
      }
    } else if (params.payload) {
      try {
        postData = JSON.parse(params.payload);
      } catch(err) {
        postData = params.payload;
      }
    }

    var action = params.action || (postData && postData.action ? postData.action : '');

    switch (action) {
      case 'ping':
        output.success = true;
        output.message = "moshaga Cafe Apps Script Service active";
        break;
        
      case 'getProducts':
        output.data = getSheetData('Products');
        output.success = true;
        break;

      case 'addProduct':
        output.data = addRecord('Products', (postData && postData.data) ? postData.data : {});
        output.success = true;
        break;

      case 'updateProduct':
        output.data = updateRecord('Products', 'Product ID', postData.id, postData.updates || {});
        output.success = true;
        break;

      case 'getDailySales':
        output.data = getDailySalesData();
        output.success = true;
        break;

      case 'saveDailySales':
        output.data = saveDailySalesRecord((postData && postData.data) ? postData.data : {});
        output.success = true;
        break;

      case 'getInventory':
        var suppliersForInventory = getSheetData('Suppliers');
        output.data = getSheetData('Inventory').map(function(item) {
          var supplier = suppliersForInventory.find(function(s) { return String(s.supplierId) == String(item.supplierId); });
          item.supplierName = supplier ? supplier.supplierName : '';
          return item;
        });
        output.success = true;
        break;

      case 'addInventoryItem':
        output.data = addRecord('Inventory', (postData && postData.data) ? postData.data : {});
        output.success = true;
        break;

      case 'updateInventoryItem':
        output.data = updateRecord('Inventory', 'Item ID', postData.id, postData.updates || {});
        output.success = true;
        break;

      case 'addInventoryTransaction':
        output.data = processInventoryTransaction((postData && postData.data) ? postData.data : {});
        output.success = true;
        break;

      case 'getInventoryHistory':
        output.data = getSheetData('InventoryTransactions');
        output.success = true;
        break;

      case 'getExpenses':
        output.data = getSheetData('Expenses');
        output.success = true;
        break;

      case 'addExpense':
        output.data = addRecord('Expenses', (postData && postData.data) ? postData.data : {});
        output.success = true;
        break;

      case 'updateExpense':
        output.data = updateRecord('Expenses', 'Expense ID', postData.id, postData.updates || {});
        output.success = true;
        break;

      case 'deleteExpense':
        output.data = deleteRecord('Expenses', 'Expense ID', postData.id);
        output.success = true;
        break;

      case 'getSuppliers':
        output.data = getSheetData('Suppliers');
        output.success = true;
        break;

      case 'setup':
        output.message = setupDatabaseSheets();
        output.success = true;
        break;

      case 'login':
        output.data = loginUser(postData || {});
        output.success = true;
        break;

      case 'getUsers':
        output.data = getSheetData('Users').map(function(u) {
          delete u.passwordHash;
          return u;
        });
        output.success = true;
        break;

      case 'addUser':
        output.data = addUserRecord((postData && postData.data) ? postData.data : {});
        output.success = true;
        break;

      default:
        output.error = 'Invalid action requested: ' + action;
    }
  } catch (err) {
    output.success = false;
    output.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// Utility: Read Sheet to Array of JSON Objects
function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var data = [];
  var timeZone = ss.getSpreadsheetTimeZone() || "GMT";
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var isEmpty = row.every(function(cell) { return cell === "" || cell === null || cell === undefined; });
    if (isEmpty) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = camelCase(headers[j]);
      var val = row[j];

      if (val instanceof Date) {
        val = Utilities.formatDate(val, timeZone, "yyyy-MM-dd");
      }
      obj[key] = val;
    }
    data.push(obj);
  }
  return data;
}

// Utility: Add Record to Sheet
function addRecord(sheetName, itemObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  var now = new Date().toISOString();

  for (var i = 0; i < headers.length; i++) {
    var key = camelCase(headers[i]);
    var value = itemObj[key];

    if (value === undefined && itemObj.id !== undefined && /id$/i.test(headers[i])) {
      value = itemObj.id;
    }

    if (value === undefined || value === null || value === "") {
      if (/created at/i.test(headers[i]) || /updated at/i.test(headers[i])) {
        value = now;
      } else if (/id$/i.test(headers[i])) {
        value = generateId(key);
      }
    }

    row.push(value !== undefined ? value : "");
    itemObj[key] = value;
  }
  sheet.appendRow(row);
  return itemObj;
}

function generateId(key) {
  var prefixByKey = {
    productId: 'PROD',
    itemId: 'INV',
    transactionId: 'TXN',
    expenseId: 'EXP',
    supplierId: 'SUP',
    salesId: 'SALE',
    salesItemId: 'ITEM',
    userId: 'USER'
  };
  var prefix = prefixByKey[key] || 'ID';
  return prefix + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Utility: Update Record
function updateRecord(sheetName, idColumnHeader, idValue, updates) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return false;
  var headers = values[0];
  
  var idColIndex = -1;
  for (var c = 0; c < headers.length; c++) {
    if (headers[c] === idColumnHeader || camelCase(headers[c]) === camelCase(idColumnHeader)) {
      idColIndex = c;
      break;
    }
  }
  if (idColIndex === -1) throw new Error("Column header not found: " + idColumnHeader);

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idColIndex]).trim() === String(idValue).trim()) {
      for (var key in updates) {
        for (var j = 0; j < headers.length; j++) {
          if (camelCase(headers[j]) === key) {
            sheet.getRange(i + 1, j + 1).setValue(updates[key]);
            break;
          }
        }
      }
      return true;
    }
  }
  return false;
}

// Utility: Delete Record
function deleteRecord(sheetName, idColumnHeader, idValue) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return false;
  var headers = values[0];

  var idColIndex = -1;
  for (var c = 0; c < headers.length; c++) {
    if (headers[c] === idColumnHeader || camelCase(headers[c]) === camelCase(idColumnHeader)) {
      idColIndex = c;
      break;
    }
  }
  if (idColIndex === -1) return false;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idColIndex]).trim() === String(idValue).trim()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// Complex helper for DailySales & DailySalesItems
function getDailySalesData() {
  var sales = getSheetData('DailySales');
  var items = getSheetData('DailySalesItems');

  sales.forEach(function(sale) {
    sale.items = items.filter(function(it) {
      return String(it.salesId).trim() === String(sale.salesId).trim();
    });
  });

  return sales;
}

function saveDailySalesRecord(salesData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var salesSheet = ss.getSheetByName('DailySales');
  var itemsSheet = ss.getSheetByName('DailySalesItems');

  // Check if existing record for this sales ID
  deleteRecord('DailySales', 'Sales ID', salesData.salesId);
  
  // Remove previous items for this sales ID
  if (itemsSheet && itemsSheet.getLastRow() > 1) {
    var itemValues = itemsSheet.getDataRange().getValues();
    var headers = itemValues[0];
    var salesIdCol = -1;
    for (var c = 0; c < headers.length; c++) {
      if (camelCase(headers[c]) === 'salesId') {
        salesIdCol = c;
        break;
      }
    }
    if (salesIdCol !== -1) {
      for (var i = itemValues.length - 1; i >= 1; i--) {
        if (String(itemValues[i][salesIdCol]).trim() === String(salesData.salesId).trim()) {
          itemsSheet.deleteRow(i + 1);
        }
      }
    }
  }

  // Add master sale record
  addRecord('DailySales', salesData);

  // Add individual item records
  if (salesData.items && salesData.items.length) {
    salesData.items.forEach(function(item) {
      addRecord('DailySalesItems', {
        salesItemId: 'ITEM-' + Math.random().toString(36).substr(2, 9),
        salesId: salesData.salesId,
        date: salesData.date,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        calculatedAmount: item.calculatedAmount
      });
    });
  }

  return salesData;
}

function processInventoryTransaction(txnData) {
  if (!txnData.transactionId) txnData.transactionId = generateId('transactionId');
  if (!txnData.createdAt) txnData.createdAt = new Date().toISOString();
  addRecord('InventoryTransactions', txnData);

  // Update Inventory Quantity
  var invData = getSheetData('Inventory');
  var item = invData.find(function(i) { return String(i.itemId).trim() === String(txnData.itemId).trim(); });
  
  if (item) {
    var newQty = Number(item.currentQuantity) || 0;
    var change = Number(txnData.quantity) || 0;

    if (txnData.transactionType === 'Stock In') {
      newQty += change;
    } else if (txnData.transactionType === 'Stock Out') {
      newQty = Math.max(0, newQty - change);
    } else if (txnData.transactionType === 'Adjustment') {
      newQty = change; // set direct quantity
    }

    var minStock = Number(item.minimumStock) || 0;
    var newStatus = newQty <= minStock ? 'Low Stock' : 'Active';

    updateRecord('Inventory', 'Item ID', txnData.itemId, {
      currentQuantity: newQty,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  }

  return txnData;
}

function loginUser(credentials) {
  var username = String(credentials.username || '').trim();
  var password = String(credentials.password || '');

  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  var users = getSheetData('Users');
  var user = users.find(function(u) {
    return String(u.username || '').trim().toLowerCase() === username.toLowerCase();
  });

  if (!user || String(user.status || '').toLowerCase() !== 'active') {
    throw new Error('Invalid username or password.');
  }

  if (user.passwordHash !== sha256Hex(password)) {
    throw new Error('Invalid username or password.');
  }

  return {
    userId: user.userId,
    username: user.username,
    role: user.role || 'User'
  };
}

function addUserRecord(userData) {
  var username = String(userData.username || '').trim();
  var password = String(userData.password || '');

  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  var now = new Date().toISOString();
  var newUser = addRecord('Users', {
    userId: 'USER-' + Math.random().toString(36).substr(2, 9),
    username: username,
    passwordHash: sha256Hex(password),
    role: userData.role || 'User',
    status: userData.status || 'Active',
    createdAt: now,
    updatedAt: now
  });

  delete newUser.passwordHash;
  return newUser;
}

function sha256Hex(value) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  var hex = [];
  for (var i = 0; i < digest.length; i++) {
    var v = digest[i] < 0 ? digest[i] + 256 : digest[i];
    hex.push(('0' + v.toString(16)).slice(-2));
  }
  return hex.join('');
}

function camelCase(str) {
  return String(str || '').toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(m, chr) {
    return chr.toUpperCase();
  });
}
}`;
