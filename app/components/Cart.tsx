import { Product } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { printReceipt } from '../utils/printReceipt';

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (productId: number, newQuantity: number) => void;
  completeSale: () => void;
  clearCart: () => void;
}

export default function Cart({ cartItems, updateQuantity, completeSale, clearCart }: CartProps) {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const calculateChange = useCallback(() => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid);
    if (!paid || isNaN(paid)) return 0;
    return paid - total;
  }, [amountPaid, calculateTotal]);

  const handleCompleteSale = async () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid);

    if (!paid || paid < total) {
      setError('El monto pagado debe ser mayor o igual al total');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          total,
          amountPaid: paid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Imprimir el recibo con los datos de la venta
        printReceipt({
          id: data.saleId,
          timestamp: new Date(),
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total,
          amountPaid: paid,
          change: calculateChange()
        });
        
        completeSale();
        setAmountPaid('');
      } else {
        setError('Error al procesar la venta');
      }
    } catch {
      setError('Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const change = calculateChange();
    if (change >= 0) {
      setError('');
    }
  }, [calculateChange]);

  return (
    <section className="bg-white p-4 rounded-lg shadow-md w-full lg:w-1/3 h-fit lg:sticky lg:top-4">
      <h2 className="text-xl font-bold text-black mb-4">Cuenta Actual</h2>
      <div className="space-y-2">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 border-b">
            <div className="flex-1">
              <h3 className="font-semibold text-black">{item.name}</h3>
              <p className="text-black">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="text-black w-8 text-center">{item.quantity}</span>
              <button 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-black">Total:</h3>
          <span className="text-xl font-bold text-black">${calculateTotal().toFixed(2)}</span>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto Pagado
          </label>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            placeholder="Ingrese el monto pagado"
          />
        </div>

        {amountPaid && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-black">Cambio:</h3>
            <span className={`text-xl font-bold ${calculateChange() < 0 ? 'text-red-500' : 'text-green-500'}`}>
              ${calculateChange().toFixed(2)}
            </span>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm mb-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <button 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm font-bold disabled:bg-gray-400"
            onClick={handleCompleteSale}
            disabled={isProcessing || !amountPaid || cartItems.length === 0 || calculateChange() < 0}
          >
            {isProcessing ? 'Procesando...' : 'Completar Venta'}
          </button>
          <button 
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors text-sm font-bold"
            onClick={clearCart}
            disabled={isProcessing}
          >
            Cancelar Venta
          </button>
        </div>
      </div>
    </section>
  );
} 