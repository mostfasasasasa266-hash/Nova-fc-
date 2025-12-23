
import React, { useState } from 'react';
import { generateNutritionPlan } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { NutritionPlan, UserProfile } from '../types';

const NutritionLab: React.FC<{ currentLang: 'ar' | 'en' }> = ({ currentLang }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [waterCount, setWaterCount] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const user = dbService.getUser();
      const goal = `تحقيق وزن ${user.targetWeight} كجم مع مراعاة مستوى النشاط ${user.activityLevel}.`;
      const result = await generateNutritionPlan(user, goal, currentLang);
      setPlan(result);
    } catch (e) {
      alert("Error generating nutrition plan.");
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string) => {
    const dict: any = {
      ar: {
        title: 'مختبر التغذية العصبي',
        desc: 'نظام غذائي ذكي مصمم ليتناسب مع جيناتك، نشاطك البدني، وأهدافك الحيوية.',
        genBtn: 'توليد خطة الوجبات الذكية',
        loading: 'جاري حساب المغذيات...',
        calories: 'السعرات اليومية',
        protein: 'بروتين',
        carbs: 'كربوهيدرات',
        fats: 'دهون',
        waterTitle: 'متعقب شرب الماء',
        waterGoal: 'الهدف اليومي: 3 لتر',
        mealsTitle: 'الجدول الغذائي اليومي',
        supps: 'المكملات المقترحة'
      },
      en: {
        title: 'Neural Nutrition Lab',
        desc: 'Smart nutrition system designed for your genetics, activity, and bio-goals.',
        genBtn: 'Generate Smart Meal Plan',
        loading: 'Calculating Macros...',
        calories: 'Daily Calories',
        protein: 'Protein',
        carbs: 'Carbs',
        fats: 'Fats',
        waterTitle: 'Water Tracker',
        waterGoal: 'Daily Goal: 3 Liters',
        mealsTitle: 'Daily Meal Schedule',
        supps: 'Recommended Supplements'
      }
    };
    return dict[currentLang]?.[key] || dict.en[key];
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-white italic tracking-tighter">
            مختبر <span className="text-[#bef264]">التغذية</span>
          </h2>
          <p className="text-gray-400 max-w-xl text-lg leading-relaxed">{t('desc')}</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="px-10 py-5 nova-gradient text-black rounded-2xl font-black shadow-xl shadow-[#bef264]/20 hover:scale-105 transition-all"
        >
          {loading ? t('loading') : t('genBtn')}
        </button>
      </div>

      {!plan && !loading && (
        <div className="nova-glass p-20 rounded-[4rem] text-center space-y-8 border border-white/5 bg-slate-900/40">
           <span className="text-8xl block">🍎</span>
           <p className="text-gray-500 font-bold">ابدأ بتوليد خطتك الغذائية المتوافقة مع أهدافك الرياضية.</p>
        </div>
      )}

      {loading && (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
           <div className="w-16 h-16 border-4 border-[#bef264] border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[#bef264] font-black animate-pulse">{t('loading')}</p>
        </div>
      )}

      {plan && (
        <div className="space-y-12 animate-fadeIn">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="nova-glass p-10 rounded-[3rem] border border-[#bef264]/20 text-center space-y-4 bg-gradient-to-b from-[#bef264]/5 to-transparent">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('calories')}</p>
               <p className="text-5xl font-black text-[#bef264]">{plan.dailyCalories}</p>
               <p className="text-[10px] text-gray-600">KCAL / DAY</p>
            </div>
            <div className="nova-glass p-10 rounded-[3rem] border border-white/5 text-center space-y-4">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('protein')}</p>
               <p className="text-4xl font-black text-indigo-400">{plan.macros.protein}g</p>
               <div className="w-full bg-indigo-500/10 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: '30%' }}></div>
               </div>
            </div>
            <div className="nova-glass p-10 rounded-[3rem] border border-white/5 text-center space-y-4">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('carbs')}</p>
               <p className="text-4xl font-black text-amber-400">{plan.macros.carbs}g</p>
               <div className="w-full bg-amber-500/10 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '50%' }}></div>
               </div>
            </div>
            <div className="nova-glass p-10 rounded-[3rem] border border-white/5 text-center space-y-4">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('fats')}</p>
               <p className="text-4xl font-black text-pink-400">{plan.macros.fats}g</p>
               <div className="w-full bg-pink-500/10 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500" style={{ width: '20%' }}></div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Meals List */}
            <div className="lg:col-span-2 space-y-8">
               <h3 className="text-3xl font-black italic">{t('mealsTitle')}</h3>
               <div className="space-y-6">
                  {plan.meals.map((meal, i) => (
                    <div key={i} className="nova-glass p-8 rounded-[3rem] border border-white/5 hover:border-[#bef264]/30 transition-all flex flex-col md:flex-row gap-8 items-center group">
                       <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🍱</div>
                       <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-[#bef264] uppercase tracking-widest">{meal.time}</span>
                            <span className="text-[10px] font-black text-gray-500">{meal.calories} KCAL</span>
                          </div>
                          <h4 className="text-2xl font-black text-white">{meal.name}</h4>
                          <div className="flex flex-wrap gap-2 pt-2">
                             {meal.ingredients.map((ing, idx) => (
                               <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-[9px] text-gray-500 border border-white/5">{ing}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-8">
               {/* Water Tracker */}
               <div className="nova-glass p-10 rounded-[3.5rem] border border-blue-500/20 bg-blue-500/5 space-y-6">
                  <div className="flex items-center gap-4">
                     <span className="text-3xl">💧</span>
                     <h4 className="text-xl font-black">{t('waterTitle')}</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     {[1,2,3,4,5,6,7,8].map(i => (
                       <button 
                         key={i} 
                         onClick={() => setWaterCount(Math.max(i, waterCount))}
                         className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${i <= waterCount ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-600'}`}
                       >
                         🥛
                       </button>
                     ))}
                  </div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('waterGoal')}</p>
               </div>

               {/* Supplements */}
               <div className="nova-glass p-10 rounded-[3.5rem] border border-purple-500/20 bg-purple-500/5 space-y-6">
                  <div className="flex items-center gap-4">
                     <span className="text-3xl">💊</span>
                     <h4 className="text-xl font-black">{t('supps')}</h4>
                  </div>
                  <ul className="space-y-4">
                     {plan.supplements.map((s, i) => (
                       <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-bold italic">
                          <span className="text-purple-400">•</span> {s}
                       </li>
                     ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionLab;
