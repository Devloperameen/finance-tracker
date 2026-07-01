const puppeteer = require('puppeteer');

exports.generateMonthlyStatement = async (transactionData) => {
  // 1. የኋላ ታሪክ ብሮውዘር (Headless Browser) መክፈት
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // 2. ለፒዲኤፉ የሚሆን የHTML እና የTailwind ዲዛይን ማዘጋጀት
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    </head>
    <body class="p-10 font-sans text-gray-800">
      <div class="flex justify-between items-center border-b pb-6 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-indigo-600">FinTrack</h1>
          <p class="text-sm text-gray-500">የግል ፋይናንስ እና ሀብት መከታተያ</p>
        </div>
        <div class="text-right">
          <p class="font-semibold text-lg text-gray-700">የሂሳብ መግለጫ ሪፖርት</p>
          <p class="text-sm text-gray-500">የተዘጋጀበት ቀን: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-indigo-50">
            <th class="p-3 text-sm font-semibold text-indigo-900">ቀን</th>
            <th class="p-3 text-sm font-semibold text-indigo-900">መግለጫ</th>
            <th class="p-3 text-sm font-semibold text-indigo-900">ምድብ</th>
            <th class="p-3 text-sm font-semibold text-indigo-900 text-right">የገንዘብ መጠን</th>
          </tr>
        </thead>
        <tbody>
          ${transactionData.map(tx => `
            <tr class="border-b border-gray-100">
              <td class="p-3 text-sm text-gray-600">${new Date(tx.date).toLocaleDateString()}</td>
              <td class="p-3 text-sm font-medium text-gray-800">${tx.description}</td>
              <td class="p-3 text-sm text-gray-600">${tx.category}</td>
              <td class="p-3 text-sm text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}">
                ${tx.amount > 0 ? '+' : ''}$${tx.amount.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // 3. HTML ኮዱን ብሮውዘሩ ላይ መጫን
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // 4. ወደ ፒዲኤፍ (A4 Format) መቀየር
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });

  await browser.close();
  return pdfBuffer; // የፒዲኤፉን ዳታ (Binary) መልሶ ይልካል
};