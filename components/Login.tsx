
import React, { useState } from 'react';
import NovaIcon from './NovaIcon';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [method, setMethod] = useState<'options' | 'email' | 'phone'>('options');
  const [loading, setLoading] = useState(false);

  const startApp = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-['Cairo']">
      {/* Aesthetic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 blur-[100px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="nova-glass p-10 md:p-14 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-10 animate-fadeIn">
          <div className="text-center space-y-4">
            <NovaIcon size={100} className="mx-auto mb-6" />
            <h1 className="text-4xl font-black text-white">Nova AI</h1>
            <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">منصة التدريب الذكي المتطورة</p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-6">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-400 text-xs font-black animate-pulse">جاري تحضير لوحة التحكم...</p>
              </div>
            ) : method === 'options' ? (
              <>
                <button onClick={startApp} className="w-full flex items-center justify-center gap-4 bg-white text-black py-4 rounded-2xl font-black hover:bg-gray-100 transition-all active:scale-95">
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
                  دخول عبر Google
                </button>
                <button onClick={startApp} className="w-full flex items-center justify-center gap-4 bg-[#000] text-white py-4 rounded-2xl font-black hover:bg-black/80 border border-white/10 transition-all active:scale-95">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 invert" alt="apple" />
                  دخول عبر Apple
                </button>
                <div className="flex gap-4">
                  <button onClick={() => setMethod('email')} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl font-bold text-gray-400 hover:bg-white/10 transition-all text-sm">البريد</button>
                  <button onClick={() => setMethod('phone')} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl font-bold text-gray-400 hover:bg-white/10 transition-all text-sm">الهاتف</button>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-slideIn">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                    {method === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}
                  </label>
                  <input 
                    type={method === 'email' ? 'email' : 'tel'} 
                    className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder={method === 'email' ? 'name@example.com' : '+966 50 000 0000'}
                  />
                </div>
                <button onClick={startApp} className="w-full py-5 nova-gradient rounded-2xl font-black text-white text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  دخول سريع
                </button>
                <button onClick={() => setMethod('options')} className="w-full text-xs font-bold text-gray-500 hover:text-white transition-colors">عُودة للخيارات</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
