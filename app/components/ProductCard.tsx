import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Product, ProductType } from '../types';
import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface ProductCardProps {
  product: Product;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, products, onEdit, onDelete, onAddToCart }: ProductCardProps) {
  const [showFriesDialog, setShowFriesDialog] = useState(false);
  const [showDoubleDialog, setShowDoubleDialog] = useState(false);

  const handleCardClick = async (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.action-buttons')) {
      if (product.tipo === ProductType.TORTA && !product.name.toLowerCase().includes('papas')) {
        setShowFriesDialog(true);
      } else if (product.tipo === ProductType.HAMBURGUESA  && !product.name.toLowerCase().includes('doble carne')) {
        setShowDoubleDialog(true);
      } else {
        onAddToCart(product);
      }
    }
  };

  const handleFriesConfirm = () => {
    onAddToCart(product);
    const friesProduct = products.find(p => p.id === 15);
    if (friesProduct) {
      onAddToCart(friesProduct);
    }
    setShowFriesDialog(false);
  };

  const handleDoubleConfirm = () => {
    onAddToCart(product);
    const doubleProduct = products.find(p => p.id === 16);
    if (doubleProduct) {
      onAddToCart(doubleProduct);
    }
    setShowDoubleDialog(false);
  };

  const handleFriesCancel = () => {
    onAddToCart(product);
    setShowFriesDialog(false);
  };

  const handleDoubleCancel = () => {
    onAddToCart(product);
    setShowDoubleDialog(false);
  };

  return (
    <>
      <div 
        className="bg-gray-100 rounded-lg shadow-md p-4 flex flex-col hover:bg-blue-500 transition-colors group cursor-pointer h-full"
        onClick={handleCardClick}
      >
        <div className="flex-grow text-center">
          <h3 className="text-xl font-bold text-black mb-2">{product.name}</h3>
          <p className="text-black font-semibold mb-4">${product.price.toFixed(2)}</p>
        </div>
        <div className="flex gap-2 action-buttons">
          <button 
            className="flex-1 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors text-sm" 
            onClick={() => onEdit(product)}
            title="Editar"
          >
            <FontAwesomeIcon icon={faPen}/>
          </button>
          <button 
            className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors text-sm" 
            onClick={() => onDelete(product.id)}
            title="Eliminar"
          >
            <FontAwesomeIcon icon={faTrash}/>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showFriesDialog}
        message="¿Con papas?"
        onConfirm={handleFriesConfirm}
        onCancel={handleFriesCancel}
      />

      <ConfirmDialog
        isOpen={showDoubleDialog}
        message="¿Doble Carne?"
        onConfirm={handleDoubleConfirm}
        onCancel={handleDoubleCancel}
      />
    </>
  );
} 