function addRow() {
  const table = document.getElementById('productTable');
  const newRow = table.insertRow(table.rows.length - 1); // Add at end
  const rowCount = table.rows.length - 2; // Exclude header

  for (let i = 0; i < 7; i++) {
    const cell = newRow.insertCell(i);
    cell.contentEditable = "true";

    // Center-align for specific columns
    if ([2, 3, 4, 5, 6].includes(i)) {
      cell.style.textAlign = "center";
    }

    if (i === 0) {
      cell.textContent = rowCount; // S.No.
    } else if (i === 3 || i === 5) {
      // Qty or Rate: recalculate on blur
      cell.addEventListener("blur", () => calculateRowAmount(newRow));
    } else if (i === 6) {
      // Amount cell - calculated only
      cell.contentEditable = "false";
      cell.textContent = "0.00";
    }
  }
}

// Function to calculate amount (Qty * Rate) when focus is lost
function calculateRowAmount(row) {
  const qtyCell = row.cells[3];
  const rateCell = row.cells[5];
  const amountCell = row.cells[6];  

  const qty = parseFloat(qtyCell.textContent.trim()) || 0;
  const rate = parseFloat(rateCell.textContent.trim()) || 0;
  const amount = qty * rate;

  amountCell.textContent = amount.toFixed(2);

  // ➕ Now recalculate the totals
  calculateTotalAmount();
}

function calculateTotalAmount() {
  const table = document.getElementById('productTable');
  let total = 0;

  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];

    // Skip rows that don’t have at least 7 cells
    if (row.cells.length < 7) continue;

    const amountText = row.cells[6].textContent.trim().replace(/,/g, '');
    const amount = parseFloat(amountText) || 0;
    total += amount;
  }

  document.querySelector("#total + td").textContent = total.toFixed(2);

  updateSubTotalAndTaxes();
}

function updateSubTotalAndTaxes() {
  const total = parseFloat(document.querySelector("#total + td").textContent) || 0;
  const loadingChargeCell = document.querySelector("#load-charge + td");
  const cleanValue = loadingChargeCell.textContent.replace(/[^0-9.\-]/g, '');
  const loadingCharge = parseFloat(cleanValue) || 0;

  const subTotal = total + loadingCharge;
  document.querySelector("#sub-total + td").textContent = subTotal.toFixed(2);

  const sgst = subTotal * 0.09;
  const cgst = subTotal * 0.09;

  document.querySelector("#sgst + td").textContent = sgst.toFixed(2);
  document.querySelector("#cgst + td").textContent = cgst.toFixed(2);

  const grandTotal = subTotal + sgst + cgst;
  document.querySelector("#grand-total + td").textContent = grandTotal.toFixed(2);

  const grandTotalWords = numberToWords(grandTotal);
  document.getElementById('amount-words').textContent = grandTotalWords;
}

// Attach listener to Loading Charge field to trigger recalculations
window.addEventListener("DOMContentLoaded", () => {
  const loadChargeCell = document.querySelector("#load-charge + td");
  loadChargeCell.setAttribute("contenteditable", "true");
  loadChargeCell.addEventListener("blur", updateSubTotalAndTaxes);
});

function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
    'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? '-' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  };

  if (num === 0) return 'Zero';
  const [rupees, paise] = num.toFixed(2).split('.');
  let words = inWords(parseInt(rupees)) + ' Rupees';
  if (parseInt(paise) > 0) {
    words += ' and ' + inWords(parseInt(paise)) + ' Paise';
  }
  return words + ' Only';
}
