"use client";

import { supabase } from "../lib/supabaseClient";
import React, { useState, useEffect } from "react";
import Clock from './components/Clock';
import ProductCard from './components/ProductCard';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import Cart from './components/Cart';
import { printReceipt, generateDailyReport } from "@/app/utils/printReceipt";
import { Product, ProductType } from './types';

interface CartItem extends Product {
  quantity: number;
}

interface Sale {
  id: number;
  items: CartItem[];
  total: number;
  amount_paid: number;
  change: number;
  timestamp: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    tipo: ProductType.TORTA
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchProducts = async () => {
    console.log('Intentando conectar a Supabase...');
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    
    console.log('Respuesta de Supabase:', { data, error });
    setProducts(data || []);
  };

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error("Error al obtener las ventas:", error);
    } else {
      setSales(data || []);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    console.log('Intentando agregar producto:', product);
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();  // Agregamos .select() para ver la respuesta
      
    if (error) {
      console.error("Error adding product:", error.message, error.details);
      alert(`Error al agregar producto: ${error.message}`);
      return;
    }
    
    console.log('Producto agregado exitosamente:', data);
    fetchProducts();
    setShowAddProduct(false);
    setNewProduct({
      name: '',
      price: 0,
      tipo: ProductType.TORTA
    });
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

  const addToCart = (product: Product) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setCartItems(currentItems =>
        currentItems.filter(item => item.id !== productId)
      );
      return;
    }
    
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const completeSale = async (amountPaid: number) => {
    const total = calculateTotal();
    
    if (isNaN(amountPaid) || amountPaid < total) {
      alert(`Monto inválido o insuficiente, monto a pagar: $${total.toFixed(2)}\nmonto pagado: $${amountPaid.toFixed(2)}`);
      return;
    }

    const saleData = {
      items: cartItems,
      total: total,
      amount_paid: amountPaid,
      change: amountPaid - total
    };

    const { error } = await supabase.from('sales').insert([saleData]);
    
    if (error) {
      console.error("Error al registrar la venta:", error);
      alert('Error al completar la venta');
    } else {
      alert(`Venta completada\nCambio a devolver: $${(amountPaid - total).toFixed(2)}`);
      setCartItems([]);
      fetchSales();
    }
  };

  const deleteSale = async (id: number) => {
    const confirmed = window.confirm("¿Estás seguro que deseas eliminar esta venta?");
    if (!confirmed) return;

    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) {
      console.error("Error al eliminar la venta:", error);
      alert('Error al eliminar la venta');
    } else {
      fetchSales();
    }
  };

  const reprintTicket = (sale: Sale) => {
    printReceipt({
      id: sale.id.toString(),
      timestamp: new Date(sale.timestamp),
      items: sale.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: sale.total,
      amountPaid: sale.amount_paid,
      change: sale.change
    });
  };

  const filteredSales = sales.filter(sale => {
    if (!selectedDate) return true;
    
    // Convertir la fecha de la venta a la zona horaria local
    const saleDate = new Date(sale.timestamp);
    const localSaleDate = new Date(saleDate.getTime() - saleDate.getTimezoneOffset() * 60000);
    const saleDateString = localSaleDate.toISOString().split('T')[0];
    
    return saleDateString === selectedDate;
  });

  const generateDailyClose = () => {
    if (!selectedDate) {
        alert('Por favor selecciona una fecha para generar el corte.');
        return;
    }
    
    const selectedSales = sales.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        const localSaleDate = new Date(saleDate.getTime() - saleDate.getTimezoneOffset() * 60000);
        const saleDateString = localSaleDate.toISOString().split('T')[0];
        return saleDateString === selectedDate;
    });

    if (selectedSales.length === 0) {
        alert('No hay ventas registradas para la fecha seleccionada.');
        return;
    }

    try {
        generateDailyReport(selectedSales.map(sale => {
            // Mantener la hora original pero ajustar la fecha
            const originalDate = new Date(sale.timestamp);
            const [year, month, day] = selectedDate.split('-').map(Number);
            const adjustedDate = new Date(originalDate);
            adjustedDate.setFullYear(year, month - 1, day);

            return {
                id: sale.id.toString(),
                timestamp: adjustedDate,
                items: sale.items,
                total: sale.total,
                amountPaid: sale.amount_paid,
                change: sale.change
            };
        }));
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Error al generar el reporte del día.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <header className="bg-gray-800 text-white p-4 text-center shadow-md">
        <h1 className="text-3xl font-bold">Robby&apos;s Burger</h1>
        <p className="text-sm mt-2">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }).replace(/^\w/, c => c.toUpperCase())} - <Clock />
        </p>
      </header>

      <div className="container mx-auto mt-4 flex flex-col lg:flex-row gap-4">
        <section className="bg-white p-4 rounded-lg shadow-md w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Menú</h2>
            <button 
              className="bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => setShowAddProduct(true)}
            >
              Agregar Nuevo Producto
            </button>
          </div>
          
          <div className="space-y-6">
            {Object.values(ProductType).map(tipo => {
              const productsOfType = products.filter(product => product.tipo === tipo);
              
              if (productsOfType.length === 0) return null;

              const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
                const ele = e.currentTarget;
                const startPos = {
                  left: ele.scrollLeft,
                  x: e.clientX,
                };

                const handleMouseMove = (e: MouseEvent) => {
                  const dx = e.clientX - startPos.x;
                  ele.scrollLeft = startPos.left - dx;
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              };
              
              return (
                <div key={tipo} className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
                    {tipo.toUpperCase()}
                  </h3>
                  <div className="relative group">
                    <button 
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-r-lg p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                        if (container) {
                          container.scrollLeft -= 300;
                        }
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    <div 
                      className="flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
                      onMouseDown={handleMouseDown}
                    >
                      <div className="flex gap-4 snap-x snap-mandatory h-fit">
                        {productsOfType.map(product => (
                          <div key={product.id} className="snap-start flex-none w-[190px]">
                            <ProductCard
                              product={product}
                              products={products}
                              onEdit={setEditingProduct}
                              onDelete={deleteProduct}
                              onAddToCart={addToCart}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-l-lg p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                        if (container) {
                          container.scrollLeft += 300;
                        }
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Cart 
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          completeSale={completeSale}
          clearCart={() => setCartItems([])}
        />
      </div>

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

      <div className="container mx-auto mt-8">
        <section className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Historial de Ventas</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={generateDailyClose}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
              >
                <i className="fa-solid fa-file-pdf mr-2"></i>
                {selectedDate 
                    ? `Generar Corte del ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: 'America/Los_Angeles'
                      })}`
                    : 'Selecciona una fecha'
                }
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md text-gray-800"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Productos</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{sale.id}</td>
                    <td className="px-4 py-3">
                      {new Date(sale.timestamp).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Los_Angeles'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {sale.items.map(item => 
                        `${item.name} (${item.quantity})`
                      ).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => reprintTicket(sale)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          title="Reimprimir ticket"
                        >
                          <i className="fa-solid fa-print"></i> Reimprimir
                        </button>
                        <button
                          onClick={() => deleteSale(sale.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          title="Eliminar venta"
                        >
                          <i className="fa-solid fa-trash"></i> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filteredSales.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="px-4 py-3 font-bold text-right text-black">
                      Total del día:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-black">
                      ${filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
            {filteredSales.length === 0 && (
              <p className="text-center py-4 text-gray-600">
                No hay ventas {selectedDate ? 'para la fecha seleccionada' : 'registradas'}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
