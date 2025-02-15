interface Product {
  name: string;
  price: number;
}

interface AddProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  product: Product;
  onProductChange: (product: Product) => void;
}

export default function AddProductModal({ 
  show, 
  onClose, 
  onSubmit, 
  product, 
  onProductChange 
}: AddProductModalProps) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-black text-center">Agregar Nuevo Producto</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(product);
        }}>
          <div className="space-y-4">
            <input
              type="text"
              value={product.name}
              onChange={(e) => onProductChange({ ...product, name: e.target.value })}
              className="border border-gray-300 rounded p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del Producto"
            />
            <input
              type="number"
              value={product.price}
              onChange={(e) => onProductChange({ ...product, price: parseFloat(e.target.value) })}
              className="border border-gray-300 rounded p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Precio"
            />
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
              Agregar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}