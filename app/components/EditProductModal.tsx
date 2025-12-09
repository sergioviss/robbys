"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProductType } from '../types';
import ConfirmDialog from './ConfirmDialog';

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
  onDelete: (id: number) => void;
}

export default function EditProductModal({ product, onClose, onSubmit, onDelete }: EditProductModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    tipo: ProductType.TORTA
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    }
  }, [product]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (product) {
      onDelete(product.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Editar Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(editedProduct);
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Producto</label>
                <Input
                  type="text"
                  value={editedProduct.name}
                  onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                  placeholder="Nombre del Producto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio</label>
                <Input
                  type="number"
                  value={editedProduct.price}
                  onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
                  placeholder="Precio"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={editedProduct.tipo}
                  onValueChange={(value) => setEditedProduct({ ...editedProduct, tipo: value as ProductType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductType.TORTA}>Torta</SelectItem>
                    <SelectItem value={ProductType.HAMBURGUESA}>Hamburguesa</SelectItem>
                    <SelectItem value={ProductType.ANTOJITOS}>Antojitos</SelectItem>
                    <SelectItem value={ProductType.PROMO}>Promo</SelectItem>
                    <SelectItem value={ProductType.ENVIO}>Envio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col gap-3 sm:flex-col">
              <div className="flex justify-between w-full gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </DialogFooter>
            <div className="mt-6 pt-4 border-t border-dashed">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-destructive transition-colors w-full text-center"
                onClick={handleDelete}
              >
                Eliminar este producto
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        message="¿Estás seguro que deseas eliminar este producto?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}