export enum ProductType {
  TORTA = 'torta',
  HAMBURGUESA = 'hamburguesa',
  ANTOJITOS = 'antojitos',
  PROMO = 'promo',
  ENVIO = 'envio'
}

export interface Product {
  id: number;
  name: string;
  price: number;
  tipo: ProductType;
} 