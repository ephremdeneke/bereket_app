// API Service for moshaga Cafe Manager
// Handles communication with the Google Apps Script backend backed by Google Sheets.

const SCRIPT_URL_KEY = 'moshaga_script_url';
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylfJKbOWOJaEdn0VJxqJRjzm3dgsQnPj72uoFwEuEhsbA0sjxGGSG5DC78n5py2_mv_Q/exec';

export const getScriptUrl = () => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SCRIPT_URL) || '';
  let url = (envUrl || localStorage.getItem(SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL).trim();
  if (url.endsWith('/execc')) {
    url = url.slice(0, -1);
  }
  return url;
};

export const setScriptUrl = (url) => {
  if (url) {
    localStorage.setItem(SCRIPT_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(SCRIPT_URL_KEY);
  }
};

// Test connection to Google Apps Script Web App URL
export const testScriptConnection = async (testUrl) => {
  const url = testUrl || getScriptUrl();
  if (!url) {
    return { success: false, message: 'No Google Apps Script Web App URL provided.' };
  }

  try {
    const res = await fetch(`${url}?action=ping`, { method: 'GET', mode: 'cors', credentials: 'omit', redirect: 'follow' });
    const json = await res.json();
    if (json.success) {
      return { success: true, message: 'Successfully connected to Google Sheet API!' };
    }
    return { success: false, message: json.error || 'Server error returned.' };
  } catch (err) {
    return { success: false, message: 'Could not connect. Ensure Web App access is set to "Anyone" and CORS is allowed.' };
  }
};

// Send request to the Apps Script Web App
const fetchAPI = async (action, postBody = null) => {
  const url = getScriptUrl();

  if (!url) {
    throw new Error('Google Apps Script Web App URL is not configured. Please configure it in Sheets Setup.');
  }

  try {
    let res;
    if (postBody) {
      res = await fetch(`${url}?action=${encodeURIComponent(action)}`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action, ...postBody })
      });
    } else {
      res = await fetch(`${url}?action=${encodeURIComponent(action)}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow'
      });
    }

    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || `Request failed for action "${action}".`);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Could not connect to Google Apps Script action "${action}". Check Web App deployment access ("Anyone"), internet connection, and browser extensions.`);
    }
    throw err;
  }
};

// Date normalization helper
const normalizeDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string') {
    if (d.includes('T')) return d.split('T')[0];
    if (d.length >= 10 && d.charAt(4) === '-' && d.charAt(7) === '-') return d.slice(0, 10);
  }
  const dateObj = new Date(d);
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(d);
};

// Normalize backend records for the UI and payloads for the backend
const mapProduct = (p) => ({
  ...p,
  id: p.productId || p.id,
  name: p.productName || p.name,
  sellingPrice: Number(p.sellingPrice) || 0
});

const mapInventoryItem = (i) => ({
  ...i,
  id: i.itemId || i.id,
  name: i.itemName || i.name,
  currentQuantity: Number(i.currentQuantity) || 0,
  minimumStock: Number(i.minimumStock) || 0,
  purchaseCost: Number(i.purchaseCost) || 0,
  supplierName: i.supplierName || ''
});

const mapSupplier = (s) => ({
  ...s,
  id: s.supplierId || s.id,
  name: s.supplierName || s.name
});

const mapExpense = (e) => ({
  ...e,
  id: e.expenseId || e.id,
  amount: Number(e.amount) || 0,
  date: normalizeDate(e.date)
});

const mapTransaction = (t) => ({
  ...t,
  id: t.transactionId || t.id,
  quantity: Number(t.quantity) || 0,
  unitCost: Number(t.unitCost) || 0,
  date: normalizeDate(t.date)
});

const mapSale = (s) => ({
  ...s,
  id: s.salesId || s.id,
  date: normalizeDate(s.date),
  calculatedSales: Number(s.calculatedSales) || 0,
  cashSales: Number(s.cashSales) || 0,
  bankSales: Number(s.bankSales) || 0,
  recordedTotal: Number(s.recordedTotal) || 0,
  difference: Number(s.difference) || 0,
  items: (s.items || []).map(item => ({
    ...item,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    calculatedAmount: Number(item.calculatedAmount) || 0
  }))
});

const omitUndefined = (obj) => {
  const out = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) out[key] = obj[key];
  });
  return out;
};

const toBackendProduct = (data) => omitUndefined({
  productName: data.name !== undefined ? data.name : data.productName,
  category: data.category,
  sellingPrice: data.sellingPrice,
  status: data.status,
  productId: data.productId !== undefined ? data.productId : data.id
});

const toBackendInventoryItem = (data) => {
  const currentQuantity = data.currentQuantity === undefined ? undefined : Number(data.currentQuantity) || 0;
  const minimumStock = data.minimumStock === undefined ? undefined : Number(data.minimumStock) || 0;
  return omitUndefined({
    itemId: data.itemId !== undefined ? data.itemId : data.id,
    itemName: data.name !== undefined ? data.name : data.itemName,
    category: data.category,
    unit: data.unit,
    currentQuantity,
    minimumStock,
    purchaseCost: data.purchaseCost === undefined ? undefined : Number(data.purchaseCost) || 0,
    supplierId: data.supplierId,
    status: data.status !== undefined
      ? data.status
      : (currentQuantity !== undefined && minimumStock !== undefined
        ? (currentQuantity <= minimumStock ? 'Low Stock' : 'Active')
        : undefined)
  });
};

const toBackendExpense = (data) => omitUndefined({
  date: normalizeDate(data.date),
  category: data.category,
  description: data.description,
  amount: data.amount === undefined ? undefined : Number(data.amount) || 0,
  paymentMethod: data.paymentMethod
});

const toBackendTransaction = (data) => omitUndefined({
  transactionId: data.transactionId,
  date: normalizeDate(data.date),
  itemId: data.itemId !== undefined ? data.itemId : data.id,
  itemName: data.itemName !== undefined ? data.itemName : data.name,
  transactionType: data.transactionType,
  quantity: data.quantity === undefined ? undefined : Number(data.quantity) || 0,
  unitCost: data.unitCost === undefined ? undefined : Number(data.unitCost) || 0,
  description: data.description
});

// Export API Object
export const api = {
  login: (username, password) => fetchAPI('login', { username, password }),
  getUsers: () => fetchAPI('getUsers'),
  addUser: (data) => fetchAPI('addUser', { data }),

  getProducts: async () => (await fetchAPI('getProducts')).map(mapProduct),
  addProduct: (data) => fetchAPI('addProduct', { data: toBackendProduct(data) }),
  updateProduct: (id, updates) => fetchAPI('updateProduct', { id, updates: toBackendProduct(updates) }),

  getDailySales: async () => (await fetchAPI('getDailySales')).map(mapSale),
  saveDailySales: (data) => fetchAPI('saveDailySales', { data }),

  getInventory: async () => (await fetchAPI('getInventory')).map(mapInventoryItem),
  addInventoryItem: (data) => fetchAPI('addInventoryItem', { data: toBackendInventoryItem(data) }),
  updateInventoryItem: (id, updates) => fetchAPI('updateInventoryItem', { id, updates: toBackendInventoryItem(updates) }),
  addInventoryTransaction: (data) => fetchAPI('addInventoryTransaction', { data: toBackendTransaction(data) }),
  getInventoryHistory: async () => (await fetchAPI('getInventoryHistory')).map(mapTransaction),

  getExpenses: async () => (await fetchAPI('getExpenses')).map(mapExpense),
  addExpense: (data) => fetchAPI('addExpense', { data: toBackendExpense(data) }),
  updateExpense: (id, updates) => fetchAPI('updateExpense', { id, updates: toBackendExpense(updates) }),
  deleteExpense: (id) => fetchAPI('deleteExpense', { id }),

  getSuppliers: async () => (await fetchAPI('getSuppliers')).map(mapSupplier)
};
