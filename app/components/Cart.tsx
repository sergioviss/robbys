"use client";

import { Product } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { printReceipt } from '../utils/printReceipt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (productId: number, newQuantity: number) => void;
  completeSale: (amountPaid: number) => void;
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
    const amount = parseFloat(amountPaid);

    if (isNaN(amount) || amount < total) {
      setError('Monto inválido o insuficiente');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Imprimir el recibo con los datos de la venta
      printReceipt({
        id: Date.now().toString(), // ID temporal para el recibo
        timestamp: new Date(),
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        amountPaid: amount,
        change: calculateChange()
      });

      completeSale(amount);
      setAmountPaid('');
    } catch (error) {
      setError('Error al procesar la venta' + error);
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
    <Card className="w-full lg:w-1/3 h-fit lg:sticky lg:top-4 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Cuenta Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cartItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay productos en la cuenta
            </p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Total:</h3>
            <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Monto Pagado
            </label>
            <Input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Ingrese el monto pagado"
              className="text-lg"
            />
          </div>

          {amountPaid && (
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
              <h3 className="text-lg font-bold">Cambio:</h3>
              <span className={`text-2xl font-bold ${calculateChange() < 0 ? 'text-destructive' : 'text-green-600'}`}>
                ${calculateChange().toFixed(2)}
              </span>
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCompleteSale}
              disabled={isProcessing || !amountPaid || cartItems.length === 0 || calculateChange() < 0}
            >
              {isProcessing ? 'Procesando...' : 'Completar Venta'}
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={clearCart}
              disabled={isProcessing || cartItems.length === 0}
            >
              Cancelar Venta
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}