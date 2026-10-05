// Calculation functions for moshaga Cafe Manager

/**
 * Calculates itemized and total daily sales based on product quantities and current prices
 */
export const calculateDailySalesTotal = (items = [], products = []) => {
  const productsMap = {};
  products.forEach(p => {
    productsMap[p.id] = Number(p.sellingPrice) || 0;
  });

  let totalCalculatedSales = 0;
  const itemBreakdown = items.map(item => {
    const unitPrice = productsMap[item.productId] !== undefined 
      ? productsMap[item.productId] 
      : (Number(item.unitPrice) || 0);
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const calculatedAmount = quantity * unitPrice;
    
    totalCalculatedSales += calculatedAmount;

    return {
      ...item,
      quantity,
      unitPrice,
      calculatedAmount
    };
  });

  return {
    items: itemBreakdown,
    totalCalculatedSales
  };
};

/**
 * Performs Cash and Bank sales reconciliation against calculated product sales
 */
export const calculateReconciliation = (calculatedSales, cashSales, bankSales) => {
  const cash = Math.max(0, Number(cashSales) || 0);
  const bank = Math.max(0, Number(bankSales) || 0);
  const recordedTotal = cash + bank;
  const difference = recordedTotal - (Number(calculatedSales) || 0);
  const status = difference === 0 ? 'Matched' : 'Mismatch';

  return {
    cashSales: cash,
    bankSales: bank,
    recordedTotal,
    difference,
    status
  };
};

/**
 * Calculates Net Income
 */
export const calculateNetIncome = (totalSales, totalExpenses) => {
  return (Number(totalSales) || 0) - (Number(totalExpenses) || 0);
};

/**
 * Evaluates low stock status for inventory items
 */
export const isLowStock = (currentQty, minStock) => {
  return (Number(currentQty) || 0) <= (Number(minStock) || 0);
};
