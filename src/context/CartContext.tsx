'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItemsCount: number;
  totalPriceThb: number;
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('safe_soul_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('safe_soul_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const isOneTimeEbook =
      product.slug === 'fitrah-shield-shallow-ebook' || product.price_thb === 0;
    const cappedQty = isOneTimeEbook ? 1 : quantity;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity = isOneTimeEbook
          ? 1
          : next[existingIndex].quantity + cappedQty;
        return next;
      }

      return [...prev, { product, quantity: cappedQty, selectedSize }];
    });

    setIsOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const isOneTimeEbook =
          item.product.slug === 'fitrah-shield-shallow-ebook' ||
          item.product.price_thb === 0;
        return { ...item, quantity: isOneTimeEbook ? 1 : quantity };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPriceThb = items.reduce((sum, item) => sum + item.product.price_thb * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItemsCount,
        totalPriceThb,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
