"use client";

import { Product } from '../types';
import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onEdit, onAddToCart }: ProductCardProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handlePressStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onEdit(product);
    }, 500); // 500ms para long press
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    // Solo agregar al carrito si no fue un long press
    if (!isLongPress.current) {
      onAddToCart(product);
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 h-[160px] group select-none bg-muted"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
      >
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <h3 className="text-base font-bold text-center group-hover:text-primary transition-colors">
            {product.name.split(/(con papas|doble carne)/i).map((part, index) => (
              ['con papas', 'doble carne'].includes(part.toLowerCase()) ? (
                <span key={index} className="block text-blue-800 uppercase text-lg mt-1">
                  {part}
                </span>
              ) : (
                <span key={index}>{part}</span>
              )
            ))}
          </h3>
          <p className="text-2xl font-bold text-center text-foreground">
            ${product.price.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
