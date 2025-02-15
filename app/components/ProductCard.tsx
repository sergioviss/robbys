import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4 flex flex-col hover:bg-blue-500 hover:text-white transition-colors group cursor-pointer">
      <div className="flex-grow text-center">
        <h3 className="text-xl font-bold text-black group-hover:text-white mb-2">{product.name}</h3>
        <p className="text-black font-semibold group-hover:text-white mb-4">${product.price.toFixed(2)}</p>
      </div>
      <div className="flex gap-2">
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
  );
} 