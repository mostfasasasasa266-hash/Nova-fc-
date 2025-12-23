
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Product, Order } from '../types';

const Store: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'catalog' | 'payment'>('catalog');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  // Admin Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    currency: 'EGP',
    category: 'Equipments',
    image: '',
    stock: 10
  });

  useEffect(() => {
    setProducts(dbService.getProducts());
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await dbService.addProduct(newProduct as Product);
    setProducts(dbService.getProducts());
    setNewProduct({ name: '', description: '', price: 0, currency: 'EGP', category: 'Equipments', image: '', stock: 10 });
  };

  const handleDeleteProduct = async (id: string) => {
    await dbService.deleteProduct(id);
    setProducts(dbService.getProducts());
  };

  const handlePurchase = async () => {
    if (!cart || !selectedMethod) return;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      productId: cart.id,
      userId: dbService.getUser().name,
      paymentMethod: selectedMethod,
      status: 'completed',
      date: new Date().toISOString(),
      total: cart.price
    };
    await dbService.createOrder(order);
    alert('🎉 تم إرسال طلبك بنجاح! فريق Nova سيتواصل معك قريباً.');
    setCart(null);
    setCheckoutStep('catalog');
  };

  const paymentMethods = {
    egypt: [
      { id: 'fawry', name: 'فوري (Fawry)', icon: '💳' },
      { id: 'vfcash', name: 'فودافون كاش (Vodafone Cash)', icon: '📱' },
      { id: 'instapay', name: 'إنستا باي (InstaPay)', icon: '⚡' },
      { id: 'meeza', name: 'بطاقة ميزة (Meeza)', icon: '🏦' }
    ],
    international: [
      { id: 'stripe', name: 'Credit Card (Stripe)', icon: '🌐' },
      { id: 'paypal', name: 'PayPal', icon: '🅿️' },
      { id: 'apple', name: 'Apple Pay', icon: '🍎' },
      { id: 'google', name: 'Google Pay', icon: '🤖' }
    ]
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex px-4 py-1.5 bg-[#bef264]/20 text-[#bef264] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#bef264]/30">
            Nova Official Elite Store
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tighter">
            متجر <span className="text-[#bef264]">Nova</span> {isAdmin ? 'الإداري' : 'الحصري'}
          </h2>
          <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
            معدات تدريب وملابس رياضية مصممة خصيصاً لأبطال Nova، متوفرة الآن داخل التطبيق.
          </p>
        </div>
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={`px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${isAdmin ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'}`}
        >
          {isAdmin ? 'الخروج من لوحة الإدارة' : 'لوحة الإدارة (للمالك فقط)'}
        </button>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-slideIn">
          {/* Add Product Form */}
          <div className="lg:col-span-1 nova-glass p-10 rounded-[3rem] border border-indigo-500/30 space-y-6">
            <h3 className="text-2xl font-black text-white mb-4">إضافة منتج جديد</h3>
            <div className="space-y-4">
              <input 
                type="text" placeholder="اسم المنتج" 
                value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl text-white text-sm"
              />
              <textarea 
                placeholder="الوصف" 
                value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl text-white text-sm h-32"
              />
              <div className="flex gap-4">
                <input 
                  type="number" placeholder="السعر" 
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="flex-1 bg-slate-950 border border-white/10 p-4 rounded-xl text-white text-sm"
                />
                <select 
                  value={newProduct.currency} onChange={e => setNewProduct({...newProduct, currency: e.target.value as any})}
                  className="bg-slate-950 border border-white/10 p-4 rounded-xl text-white text-sm"
                >
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <input 
                type="text" placeholder="رابط الصورة (URL)" 
                value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl text-white text-sm"
              />
              <button 
                onClick={handleAddProduct}
                className="w-full py-4 bg-[#bef264] text-[#050505] rounded-xl font-black shadow-lg hover:scale-105 transition-all"
              >
                حفظ المنتج
              </button>
            </div>
          </div>

          {/* Admin Product List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-black text-white">المنتجات الحالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map(p => (
                <div key={p.id} className="nova-glass p-6 rounded-3xl border border-white/5 flex gap-6 items-center">
                  <img src={p.image} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-black text-white">{p.name}</h4>
                    <p className="text-[#bef264] font-black">{p.price} {p.currency}</p>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : checkoutStep === 'catalog' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="nova-glass rounded-[2.5rem] overflow-hidden group hover:transform hover:-translate-y-2 transition-all duration-500 border border-white/5 bg-[#0a0a0a]">
              <div className="relative h-64 bg-slate-900">
                <img 
                  src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400'} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700 opacity-80" 
                  alt={product.name}
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#bef264] rounded-full text-[9px] font-black text-black border border-[#bef264]/20 uppercase">
                  {product.category}
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="h-14">
                  <h3 className="font-black text-white text-lg group-hover:text-[#bef264] transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">السعر</span>
                    <span className="text-[#bef264] font-black text-xl">{product.price} {product.currency}</span>
                  </div>
                  <button 
                    onClick={() => { setCart(product); setCheckoutStep('payment'); }}
                    className="px-6 py-3 bg-[#bef264] text-black text-[10px] font-black rounded-xl transition-all shadow-lg hover:scale-105"
                  >
                    شراء الآن
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto nova-glass p-12 md:p-16 rounded-[4rem] border border-indigo-500/30 animate-scaleIn">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">إتمام <span className="text-indigo-400">الدفع</span></h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Secure AI Checkout</p>
            </div>
            <button onClick={() => setCheckoutStep('catalog')} className="text-gray-400 hover:text-white">رجوع ←</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Summary */}
            <div className="space-y-8">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex gap-6 items-center">
                <img src={cart?.image} className="w-24 h-24 rounded-2xl object-cover" />
                <div>
                  <h4 className="text-xl font-black text-white">{cart?.name}</h4>
                  <p className="text-2xl font-black text-[#bef264] mt-2">{cart?.price} {cart?.currency}</p>
                </div>
              </div>
              
              <div className="p-8 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed italic">
                * ملاحظة: يتم تأمين معاملتك عبر نظام تشفير Nova AI المتطور. سيتم إرسال فاتورة وتفاصيل الشحن لبريدك المسجل.
              </div>
            </div>

            {/* Methods */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">داخل مصر (Egypt Local)</h5>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.egypt.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${selectedMethod === m.id ? 'bg-[#bef264] border-[#bef264] text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-[10px] font-black">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">دولياً (International)</h5>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.international.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${selectedMethod === m.id ? 'bg-[#bef264] border-[#bef264] text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-[10px] font-black">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handlePurchase}
                disabled={!selectedMethod}
                className="w-full py-6 nova-gradient rounded-3xl text-white font-black text-xl shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-30 mt-8"
              >
                تأكيد الدفع والاستلام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Banner */}
      <div className="nova-glass p-12 rounded-[4rem] border border-white/5 flex flex-wrap justify-center gap-16 items-center grayscale opacity-40">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-8" alt="stripe" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-8" alt="paypal" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-8" alt="applepay" />
        <div className="text-xl font-black">FAWRY ✅</div>
      </div>
    </div>
  );
};

export default Store;
