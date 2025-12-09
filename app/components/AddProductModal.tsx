"use client";

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
import { ProductType } from '../types';

interface Product {
  name: string;
  price: number;
  tipo: ProductType;
}

interface AddProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  product: Omit<Product, 'id'>;
  onProductChange: (product: Omit<Product, 'id'>) => void;
}

export default function AddProductModal({
  show,
  onClose,
  onSubmit,
  product,
  onProductChange
}: AddProductModalProps) {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Agregar Nuevo Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(product);
        }}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Producto</label>
              <Input
                type="text"
                value={product.name}
                onChange={(e) => onProductChange({ ...product, name: e.target.value })}
                placeholder="Nombre del Producto"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio</label>
              <Input
                type="number"
                value={product.price}
                onChange={(e) => onProductChange({ ...product, price: parseFloat(e.target.value) })}
                placeholder="Precio"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={product.tipo}
                onValueChange={(value) => onProductChange({ ...product, tipo: value as ProductType })}
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
          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}