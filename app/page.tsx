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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TIMEZONE = 'America/Hermosillo';

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
  const [selectedCategory, setSelectedCategory] = useState<ProductType | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

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
    // Set initial dates on client mount to avoid hydration mismatch
    const now = new Date();
    setSelectedDate(now.toLocaleDateString('en-CA', { timeZone: TIMEZONE }));
    setCurrentDateFormatted(
      now.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: TIMEZONE
      }).replace(/^\w/, c => c.toUpperCase())
    );

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

  const getWeekSales = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);

    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    });
  };

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
      console.error('Error al generar el reporte', error);
      alert('Error al generar el reporte del día.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gray-800 text-white p-6 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight">Robby&apos;s Burger</h1>
          <p className="text-sm mt-2 opacity-90">
            {currentDateFormatted || '---'} - <Clock />
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Menu and Cart Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Section */}
          <Card className="w-full lg:w-2/3 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCategory(null)}
                    className="h-8 w-8 rounded-full hover:bg-muted -ml-2"
                  >
                    <i className="fas fa-arrow-left"></i>
                  </Button>
                )}
                <CardTitle className="text-xl">Menú</CardTitle>
              </div>
              <Button onClick={() => setShowAddProduct(true)}>
                Agregar Nuevo Producto
              </Button>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                // Vista de Categorías
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                  {Object.values(ProductType).map((tipo) => (
                    <Button
                      key={tipo}
                      variant="outline"
                      className="h-32 text-2xl font-bold uppercase transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground border-2"
                      onClick={() => setSelectedCategory(tipo)}
                    >
                      {tipo}
                    </Button>
                  ))}
                </div>
              ) : (
                // Vista de Productos de la Categoría
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Navegación y Categorías */}
                  <div className="flex flex-col gap-4 border-b pb-4">
                    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                      <div className="flex gap-2 min-w-max">
                        {Object.values(ProductType).map((tipo) => (
                          <Button
                            key={tipo}
                            variant={selectedCategory === tipo ? "default" : "outline"}
                            className={`whitespace-nowrap h-14 text-lg px-6 font-bold uppercase ${selectedCategory === tipo ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                            onClick={() => setSelectedCategory(tipo)}
                          >
                            {tipo}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <h2 className="text-xl font-bold uppercase text-primary hidden sm:block">
                        {selectedCategory}
                      </h2>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {products.filter(p => p.tipo === selectedCategory).length} Productos
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[65vh] overflow-y-auto pr-2 pb-20">
                    {(() => {
                      let displayProducts = products.filter(product => product.tipo === selectedCategory);

                      if (selectedCategory === ProductType.TORTA || selectedCategory === ProductType.HAMBURGUESA) {
                        displayProducts.sort((a, b) => b.name.localeCompare(a.name));
                      }

                      // Lógica de ordenamiento para PROMOs (mantenida del código original)
                      if (selectedCategory === ProductType.PROMO) {
                        const now = new Date();
                        const dayOfWeek = now.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          timeZone: TIMEZONE
                        }).toLowerCase();

                        const dayNames = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves'];
                        const isPromoDay = dayNames.some(d => dayOfWeek.includes(d.replace('é', 'e')));

                        displayProducts = [...displayProducts].sort((a, b) => {
                          const aName = a.name.toLowerCase();
                          const bName = b.name.toLowerCase();
                          const aHasDay = dayNames.some(d => aName.includes(d));
                          const bHasDay = dayNames.some(d => bName.includes(d));
                          const aIsToday = aName.includes(dayOfWeek) ||
                            (dayOfWeek.includes('miércoles') && aName.includes('miercoles')) ||
                            (dayOfWeek.includes('miercoles') && aName.includes('miércoles'));
                          const bIsToday = bName.includes(dayOfWeek) ||
                            (dayOfWeek.includes('miércoles') && bName.includes('miercoles')) ||
                            (dayOfWeek.includes('miercoles') && bName.includes('miércoles'));

                          if (isPromoDay) {
                            if (aIsToday && !bIsToday) return -1;
                            if (bIsToday && !aIsToday) return 1;
                          } else {
                            if (aHasDay && !bHasDay) return 1;
                            if (bHasDay && !aHasDay) return -1;
                          }
                          return 0;
                        });
                      }

                      return displayProducts.map(product => (
                        <div key={product.id} className="w-full">
                          <ProductCard
                            product={product}
                            onEdit={setEditingProduct}
                            onAddToCart={(p) => {
                              addToCart(p);
                            }}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
          onDelete={deleteProduct}
        />

        {/* Sales History Section */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl">Historial de Ventas</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="default"
                onClick={generateDailyClose}
              >
                <i className="fa-solid fa-file-pdf mr-2"></i>
                {selectedDate
                  ? `Generar Corte del ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: TIMEZONE
                  })}`
                  : 'Selecciona una fecha'
                }
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDate('')}
                >
                  Limpiar filtro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Productos</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay ventas {selectedDate ? 'para la fecha seleccionada' : 'registradas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>
                          {new Date(sale.timestamp).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: TIMEZONE
                          })}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {sale.items.map(item =>
                            `${item.name} (${item.quantity})`
                          ).join(', ')}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${sale.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reprintTicket(sale)}
                              title="Reimprimir ticket"
                            >
                              <i className="fa-solid fa-print mr-1"></i> Reimprimir
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteSale(sale.id)}
                              title="Eliminar venta"
                            >
                              <i className="fa-solid fa-trash mr-1"></i> Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  {filteredSales.length > 0 && (
                    <TableRow className="bg-primary/10">
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total del día:
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary text-lg">
                        ${filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-green-100">
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total de la semana:
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 text-lg">
                      ${getWeekSales().reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main >
    </div >
  );
}
