'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import {
  ShoppingBag,
  Sparkles,
  Mail,
  Truck,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'digital' | 'physical'>('all');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { member } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/admin/store?publicOnly=true', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setProducts(data.items || []);
        }
      })
      .catch((err) => console.error('Failed to load Safe for Support items:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true;
    return product.type === filter;
  });

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: Product) => {
    const size = product.slug.includes('tee') ? selectedSizes[product.id] || 'L' : undefined;
    addToCart(product, 1, size);
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-16 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-gold-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>SAFE FOR SUPPORT • มุมปลอดภัยเพื่อสนับสนุนโครงการ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-cinzel font-black text-parchment-cream">
            Safe for Support
          </h1>

          <p className="text-sm sm:text-base text-parchment-muted max-w-2xl mx-auto leading-relaxed font-light">
            ร่วมสนับสนุนพันธกิจเกราะพิทักษ์ฟิฏเราะฮฺ ผ่านหนังสือดิจิทัล (จัดส่งทางอีเมลสมาชิก) และของที่ระลึกทางการ (Official Merch) ทุกการสนับสนุนจะนำไปพัฒนาคลังความรู้และพอดแคสต์เพื่อสังคม
          </p>

          {/* Filter Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'digital', label: 'หนังสือดิจิทัล E-Book (ส่งทางอีเมลสมาชิก)' },
              { id: 'physical', label: 'ของที่ระลึก (Official Merch)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'all' | 'digital' | 'physical')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  filter === tab.id
                    ? 'bg-gold-warm text-slate-abyss border-gold-warm font-bold shadow-gold-sm'
                    : 'bg-emerald-card/60 text-parchment-muted border-emerald-border hover:text-parchment-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-emerald-card/40 border border-emerald-border/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-emerald-card/30 border border-emerald-border/50 text-parchment-muted text-sm">
            ยังไม่มีรายการในหมวดหมู่นี้ในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const isComingSoon =
                product.stock_quantity === 0 ||
                product.slug === 'fitrah-shield-deep-ocean-ebook';
              const isOneTimeEbook =
                product.slug === 'fitrah-shield-shallow-ebook' ||
                product.price_thb === 0;
              const alreadyClaimed = isOneTimeEbook && !!member?.ebookClaimed;

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl overflow-hidden bg-emerald-card/60 border border-emerald-border/80 hover:border-gold/50 transition-all duration-300 flex flex-col justify-between shadow-lg"
                >
                  {/* Product Image */}
                  <div>
                    <div className="relative h-60 overflow-hidden bg-slate-abyss">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${
                          isComingSoon ? 'brightness-75 saturate-75' : ''
                        }`}
                      />
                      {product.badge && (
                        <div
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold uppercase tracking-wider ${
                            isComingSoon
                              ? 'bg-cyan-950/90 border-cyan-400/50 text-cyan-200'
                              : 'bg-slate-abyss/90 border-gold/40 text-gold-light'
                          }`}
                        >
                          {product.badge}
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-emerald-deep/90 text-parchment-cream text-[10px] flex items-center gap-1 border border-emerald-border">
                        {isComingSoon ? (
                          <>
                            <Clock className="w-3 h-3 text-cyan-300" />
                            <span>Coming Soon (เร็วๆ นี้)</span>
                          </>
                        ) : product.type === 'digital' ? (
                          <>
                            <Mail className="w-3 h-3 text-gold-warm" />
                            <span>จัดส่งทางอีเมลที่สมัครสมาชิกเท่านั้น (จำกัด 1 ครั้ง)</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3 text-emerald-400" />
                            <span>จัดส่งพัสดุถึงบ้าน</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-thai-serif font-bold text-parchment-cream group-hover:text-gold-light transition leading-snug">
                          {product.title}
                        </h3>
                        <p className="text-xs text-parchment-muted mt-2 leading-relaxed line-clamp-3 font-light">
                          {product.description}
                        </p>
                      </div>

                      {/* Size selector if T-shirt */}
                      {product.slug.includes('tee') && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] text-parchment-muted block">
                            เลือกขนาดเสื้อ:
                          </span>
                          <div className="flex items-center gap-2">
                            {['S', 'M', 'L', 'XL'].map((size) => (
                              <button
                                key={size}
                                onClick={() => handleSizeChange(product.id, size)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                                  (selectedSizes[product.id] || 'L') === size
                                    ? 'bg-gold-warm text-slate-abyss shadow-gold-sm'
                                    : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Add to cart button */}
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-emerald-border/40 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-parchment-muted block">
                          {isComingSoon ? 'สถานะหนังสือ' : 'ราคาสนับสนุน'}
                        </span>
                        {isComingSoon ? (
                          <div className="text-base font-bold text-cyan-300">
                            Coming Soon
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-mono font-bold text-gold-light">
                              {product.price_thb === 0
                                ? 'ฟรี ฿0'
                                : `฿${product.price_thb.toLocaleString()}`}
                            </span>
                            {product.compare_at_price_thb && (
                              <span className="text-xs font-mono text-parchment-muted/50 line-through">
                                ฿{product.compare_at_price_thb.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {isComingSoon ? (
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Coming Soon</span>
                        </button>
                      ) : alreadyClaimed ? (
                        <button
                          type="button"
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ส่งทางอีเมลแล้ว (1 สิทธิ์)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-xs hover:brightness-110 active:scale-95 shadow-gold-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {isOneTimeEbook ? 'ใส่ตะกร้ารับฟรีทางอีเมล' : 'เพิ่มลงตะกร้า'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
