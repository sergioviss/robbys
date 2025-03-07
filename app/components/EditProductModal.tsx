import { useState, useEffect } from 'react';
import { ProductType } from '../types';

interface Product {
  id: number;
  name: string;
  price: number;
  tipo: ProductType;
}

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmit: (product: Product) => void;
}

export default function EditProductModal({ product, onClose, onSubmit }: EditProductModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    tipo: ProductType.TORTA
  });

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    }
  }, [product]);

  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-black text-center">Editar Producto</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(editedProduct);
        }}>
          <div className="space-y-4">
            <input
              type="text"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
              className="border border-gray-300 rounded p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del Producto"
            />
            <input
              type="number"
              value={editedProduct.price}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Precio"
            />
            <select
              value={editedProduct.tipo}
              onChange={(e) => setEditedProduct({ ...editedProduct, tipo: e.target.value as ProductType })}
              className="border border-gray-300 rounded p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ProductType.TORTA}>Torta</option>
              <option value={ProductType.HAMBURGUESA}>Hamburguesa</option>
              <option value={ProductType.ANTOJITOS}>Antojitos</option>
              <option value={ProductType.PROMO}>Promo</option>
              <option value={ProductType.ENVIO}>Envio</option>
            </select>
          </div>
          <div className="flex justify-between mt-6">
            <button 
              type="button" 
              className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600 transition-colors" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 