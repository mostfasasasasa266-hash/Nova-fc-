
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ALL_EXERCISES } from './constants';
import { WorkoutType, Language, Exercise, SavedPlan } from './types';
import { dbService } from './services/dbService';
import AICoach from './components/AICoach';
import PlanGenerator from './components/PlanGenerator';
import UserProfileComp from './components/UserProfile';
import Store from './components/Store';
import Login from './components/Login';
import ExerciseDetailsModal from './components/ExerciseDetailsModal';
import BioScanner from './components/BioScanner';
import NovaIcon from './components/NovaIcon';
import NutritionLab from './components/NutritionLab';
import PrivacyPolicy from './components/PrivacyPolicy';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nova_auth_token') === 'true';
  });
  const [dbReady, setDbReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'Home' | 'Store' | 'NovaLabs' | 'Nutrition' | 'Coach' | 'Profile' | 'Privacy' | 'Scanner'>('Home');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    const initDB = async () => {
      await dbService.init();
      setDbReady(true);
    };
    initDB();
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setShowToast({ message: msg, visible: true });
    setTimeout(() => setShowToast({ message: '', visible: false }), 2000);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('nova_auth_token');
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;

  if (!dbReady) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <NovaIcon size={80} className="animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-['Cairo'] relative selection:bg-[#bef264] selection:text-black">
      {/* Sidebar - Desktop Only */}
      <aside className="fixed right-0 top-0 bottom-0 w-80 bg-black/60 backdrop-blur-xl border-l border-white/5 hidden md:flex flex-col p-8 z-50">
        <div className="mb-10 flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('Home')}>
          <NovaIcon size={44} />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight italic uppercase">NOVA<span className="text-[#bef264]">AI</span></span>
            <span className="text-[8px] font-black text-gray-600 tracking-[0.3em] uppercase">Hyper Performance OS</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'Home', label: 'الرئيسية', icon: '🏠' },
            { id: 'NovaLabs', label: 'مختبر التدريب', icon: '🧪' },
            { id: 'Nutrition', label: 'مختبر التغذية', icon: '🍎' },
            { id: 'Coach', label: 'المدرب الشخصي', icon: '🤖' },
            { id: 'Scanner', label: 'الماسح الحيوي', icon: '🧬' },
            { id: 'Store', label: 'المتجر النخبوي', icon: '🛒' },
            { id: 'Profile', label: 'لوحة القياس', icon: '👤' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-[#bef264] text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-4 p-4 text-xs font-black text-gray-700 hover:text-red-500 transition-colors">فصل الاتصال</button>
      </aside>

      <main className="flex-1 md:pr-80">
        <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fadeIn">
          {activeTab === 'Home' && (
            <div className="space-y-16">
              <section className="relative h-[60vh] rounded-[4rem] overflow-hidden bg-[#080808] border border-white/5 shadow-2xl flex items-center px-12">
                 <div className="relative z-10 max-w-2xl space-y-6">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Limitless<br/><span className="text-[#bef264]">Power.</span></h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">نظام التدريب الأسرع والأكثر ذكاءً. Nova AI يحلل بياناتك في أجزاء من الثانية ليمنحك التفوق الرياضي.</p>
                    <div className="flex gap-4">
                       <button onClick={() => setActiveTab('NovaLabs')} className="px-10 py-4 bg-[#bef264] text-black rounded-2xl font-black shadow-lg">ابدأ فوراً</button>
                       <button onClick={() => setActiveTab('Coach')} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black">المدرب الذكي</button>
                    </div>
                 </div>
                 <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600')] bg-cover opacity-20 mask-gradient"></div>
              </section>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div onClick={() => setActiveTab('Scanner')} className="nova-glass p-10 rounded-[3.5rem] cursor-pointer hover:border-[#bef264]/40 transition-all">
                    <span className="text-4xl block mb-6">🧬</span>
                    <h3 className="text-2xl font-black mb-2">المسح الحيوي</h3>
                    <p className="text-gray-500 text-sm">تحليل فوري لتكوين الجسم عبر الـ AI.</p>
                 </div>
                 <div onClick={() => setActiveTab('Nutrition')} className="nova-glass p-10 rounded-[3.5rem] cursor-pointer hover:border-[#bef264]/40 transition-all">
                    <span className="text-4xl block mb-6">🍎</span>
                    <h3 className="text-2xl font-black mb-2">خطة التغذية</h3>
                    <p className="text-gray-500 text-sm">وجبات دقيقة مصممة لأهدافك الحالية.</p>
                 </div>
                 <div onClick={() => setActiveTab('Coach')} className="nova-glass p-10 rounded-[3.5rem] cursor-pointer hover:border-[#bef264]/40 transition-all">
                    <span className="text-4xl block mb-6">🤖</span>
                    <h3 className="text-2xl font-black mb-2">المدرب الآلي</h3>
                    <p className="text-gray-500 text-sm">استشارات فورية حول التمارين والأداء.</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'NovaLabs' && <PlanGenerator currentLang="ar" />}
          {activeTab === 'Nutrition' && <NutritionLab currentLang="ar" />}
          {activeTab === 'Coach' && <AICoach currentLang="ar" />}
          {activeTab === 'Scanner' && <BioScanner />}
          {activeTab === 'Profile' && <UserProfileComp currentLang="ar" />}
          {activeTab === 'Store' && <Store />}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-black/60 backdrop-blur-2xl border border-white/10 md:hidden flex justify-around items-center z-50 rounded-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab('Home')} className={`p-4 rounded-2xl ${activeTab === 'Home' ? 'text-[#bef264]' : 'text-gray-600'}`}>🏠</button>
        <button onClick={() => setActiveTab('Nutrition')} className={`p-4 rounded-2xl ${activeTab === 'Nutrition' ? 'text-[#bef264]' : 'text-gray-600'}`}>🍎</button>
        <button onClick={() => setActiveTab('Coach')} className={`p-4 rounded-2xl ${activeTab === 'Coach' ? 'text-[#bef264]' : 'text-gray-600'}`}>🤖</button>
        <button onClick={() => setActiveTab('Profile')} className={`p-4 rounded-2xl ${activeTab === 'Profile' ? 'text-[#bef264]' : 'text-gray-600'}`}>👤</button>
      </nav>

      {selectedExercise && (
        <ExerciseDetailsModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </div>
  );
};

export default App;
