"use client";

import { supabase } from "../lib/supabaseClient";
import React, { useState, useEffect } from "react";
import Clock from './components/Clock';
import ProductCard from './components/ProductCard';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';

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
      <header className="bg-gray-800 text-white p-4 text-center shadow-md">
        <h1 className="text-3xl font-bold">Robby's Burger</h1>
        <p className="text-sm mt-2">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }).replace(/^\w/, c => c.toUpperCase())} - <Clock />
        </p>
      </header>

      <div className="container mx-auto mt-4">
        <section className="bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Menú</h2>
            <button 
              className="bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => setShowAddProduct(true)}
            >
              Agregar Nuevo Producto
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={setEditingProduct}
                onDelete={deleteProduct}
              />
            ))}
          </div>
        </section>

        <AddProductModal
          show={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onSubmit={addProduct}
          product={newProduct}
          onProductChange={setNewProduct}
        />

        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={updateProduct}
        />
      </div>
    </div>
  );
}
