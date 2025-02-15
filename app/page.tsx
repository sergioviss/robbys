"use client";

import { supabase } from "../lib/supabaseClient";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0
  });

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error("Error fetching products:", error);
    else setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert([product]);
    if (error) console.error("Error adding product:", error);
    else {
      fetchProducts();
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        price: 0
      });
    }
  };

  const updateProduct = async (product: Product) => {
    const { error } = await supabase.from('products').update(product).eq('id', product.id);
    if (error) console.error("Error updating product:", error);
    else {
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const deleteProduct = async (id: number) => {
    const confirmed = window.confirm("¿Estás seguro que deseas eliminar este producto?");
    if (!confirmed) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error("Error deleting product:", error);
    else fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <header className="bg-gray-500 text-white p-4 text-center shadow-md">
        <h1 className="text-3xl font-bold">Robbys Burger</h1>
      </header>

      <div className="container mx-auto mt-4">
        <section className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">Menú</h2>
          <button 
            className="mb-4 bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => setShowAddProduct(true)}
          >
            Agregar Nuevo Producto
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-light p-4 rounded shadow hover:bg-accent hover:text-white">
                <h3 className="text-black text-lg font-bold mt-2">{product.name}</h3>
                <p className="text-gray-700">${product.price.toFixed(2)}</p>
                <button className="mt-2 bg-yellow-500 text-white py-1 px-4 rounded" onClick={() => setEditingProduct(product)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="mt-2 bg-red-500 text-white py-1 px-4 rounded" onClick={() => deleteProduct(product.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-black">Agregar Nuevo Producto</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                addProduct(newProduct);
              }}>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="border p-2 mb-2 w-full text-black"
                  placeholder="Nombre del Producto"
                />
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="border p-2 mb-2 w-full text-black"
                  placeholder="Precio"
                />
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
                  Agregar Producto
                </button>
                <button type="button" className="bg-gray-500 text-white py-2 px-4 rounded ml-2" onClick={() => setShowAddProduct(false)}>
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-black">Editar Producto</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateProduct(editingProduct);
              }}>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="border p-2 mb-2 w-full text-black"
                  placeholder="Nombre del Producto"
                />
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="border p-2 mb-2 w-full text-black"
                  placeholder="Precio"
                />
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
                  Guardar Cambios
                </button>
                <button type="button" className="bg-gray-500 text-white py-2 px-4 rounded ml-2" onClick={() => setEditingProduct(null)}>
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
