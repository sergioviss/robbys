// import logo from '@/public/LOGO.png';

interface SaleData {
  id: string;
  timestamp: Date;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  amountPaid: number;
  change: number;
}

export function printReceipt(sale: SaleData) {
  const receiptContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket de Venta - Robby's Burger</title>
        <style>
            @page {
                size: 57.5mm auto;
                margin: 0mm;
            }
            body {
                font-family: 'Courier New', monospace;
                padding: 8px;
                width: 57.5mm;
                margin: 0 auto;
                color: #000000;
                font-weight: bold;
                font-size: 14px;
            }
            .header {
                text-align: center;
                margin-bottom: 10px;
            }
            .logo {
                width: 100%;
                max-width: 120px;
                height: auto;
                margin: 0 auto;
                display: block;
            }
            .items {
                margin: 10px 0;
            }
            .item {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
            }
            .total {
                border-top: 1px dashed #000;
                margin-top: 5px;
                padding-top: 5px;
            }
            .payment-details {
                margin-top: 5px;
                padding-top: 5px;
                border-top: 1px dashed #000;
            }
            .footer {
                text-align: center;
                margin-top: 10px;
                font-size: 12px;
            }
            @media print {
                body { 
                    margin: 0;
                    padding: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <img src="https://media-hosting.imagekit.io//1e8b128120244df3/ROBBYSBURGUER%20REDONDO.png?Expires=1834253300&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=2PUlfSXADIK2J56ylWkfWvkLXYSbVuZYQRWlsAKCLoAxpmsp~-dzMgWikCrSrVwWyhFUl-1V2WLlya843Sx4P913q9~jkFblxJGgnJTvLR0l9b8RN2aC5aRPLPKL1t76I1bQXzC56HHLSXV3PTrxnzjxB7lSCw1~rYvwqppryGX3YjzfODICNR60s159ck8JwX83IZnLauLCuD9x2oHvmZa4xW80KAYIN6v2PptWKdMKrRE7WxuMCm0hx1xohoH07IFgNWzBpkBCCVAPbPO2qIBmrdK4mCxnsi9PMcR8gDm~Nnk7STcNvywLt5IS-SNJOMcNRjG6lvxZGpL-ZmqP1g__" alt="Logo" class="logo">
                <h2>TICKET DE VENTA</h2>
                <p>${sale.timestamp.toLocaleDateString()} ${sale.timestamp.toLocaleTimeString()}</p>
                <p>Folio: #${sale.id}</p>
            </div>
            
            <div class="items">
                ${sale.items.map(item => `
                    <div class="item">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="total">
                <div class="item">
                    <strong>TOTAL</strong>
                    <strong>$${sale.total.toFixed(2)}</strong>
                </div>
            </div>

            <div class="payment-details">
                <div class="item">
                    <span>Pagó con:</span>
                    <span>$${sale.amountPaid.toFixed(2)}</span>
                </div>
                <div class="item">
                    <span>Cambio:</span>
                    <span>$${sale.change.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>¡Gracias por su compra!</p>
                <p>Le esperamos pronto</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    const receiptWindow = window.open('', '_blank', 'width=300,height=600');
    if (receiptWindow) {
      receiptWindow.document.open();
      receiptWindow.document.write(receiptContent);
      receiptWindow.document.close();
      receiptWindow.setTimeout(() => {
        try {
          receiptWindow.print();
        } catch (printError) {
          console.error('Error printing receipt:', printError);
          alert('Error al imprimir el ticket. Por favor, intente de nuevo.');
        }
      }, 1000);
    } else {
      throw new Error('Could not open receipt window');
    }
  } catch (error) {
    console.error('Error creating receipt:', error);
    alert('Error al generar el ticket. Por favor, revise si tiene bloqueados los popups.');
  }
} 