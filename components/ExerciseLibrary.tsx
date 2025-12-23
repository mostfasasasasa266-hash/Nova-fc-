
import React, { useState, useMemo } from 'react';
import { ALL_EXERCISES } from '../constants';
import { Exercise, WorkoutType, AgeGroup, WorkoutLocation, WorkoutDifficulty, Language } from '../types';
import { discoverExercise } from '../services/geminiService';
import ExerciseCard from './ExerciseCard';

interface ExerciseLibraryProps {
  currentLang: Language;
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExerciseId?: string | null;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ currentLang, onExerciseSelect, selectedExerciseId }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<WorkoutType | 'all'>('all');
  const [age, setAge] = useState<AgeGroup | 'all'>('all');
  const [location, setLocation] = useState<WorkoutLocation | 'all'>('all');
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty | 'all'>('all');
  
  const [aiExercises, setAiExercises] = useState<Exercise[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const t = (key: string) => {
    const dict: any = {
      ar: {
        title: 'مكتبة Nova اللانهائية',
        desc: 'استكشف التمارين المتاحة، أو اطلب من الذكاء الاصطناعي ابتكار تمرين مخصص تماماً لظروفك وأدواتك.',
        search: 'ابحث عن تمرين (مثلاً: ضغط، مراوغة، تمدد مكتب)...',
        category: 'نوع النشاط',
        age: 'الفئة / الحالة',
        location: 'المكان المتاح',
        difficulty: 'الصعوبة',
        all: 'الكل',
        noResults: 'لم نجد التمرين في القائمة.. دع Nova AI يبتكره لك!',
        discoverBtn: 'ابتكار تمرين مخصص عبر AI ✨',
        analyzing: 'جاري الهندسة الميكانيكية للتمرين...'
      },
      en: {
        title: 'Nova Infinite Library',
        desc: 'Explore exercises or ask AI to create a custom one for your specific needs.',
        search: 'Search (e.g., pushup, dribble, desk stretch)...',
        category: 'Category',
        age: 'Age / Condition',
        location: 'Location',
        difficulty: 'Difficulty',
        all: 'All',
        noResults: 'Not found.. Let Nova AI create it!',
        discoverBtn: 'Create Custom AI Exercise ✨',
        analyzing: 'Engineering mechanics...'
      }
    };
    return dict[currentLang as 'ar' | 'en']?.[key] || dict.en[key];
  };

  const handleAiDiscovery = async () => {
    if (!search.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await discoverExercise(search, currentLang, {
        category,
        age,
        location,
        difficulty
      });
      setAiExercises(prev => [result, ...prev]);
    } catch (e) {
      console.error(e);
      alert("تعذر ابتكار التمرين حالياً. يرجى مراجعة مفتاح API.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const combined = [...ALL_EXERCISES, ...aiExercises];
    return combined.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                          ex.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'all' ? true : ex.category === category;
      const matchAge = age === 'all' ? true : ex.ageGroups.includes(age as AgeGroup);
      const matchLoc = location === 'all' ? true : ex.location === location || ex.location === WorkoutLocation.ANY;
      const matchDiff = difficulty === 'all' ? true : ex.difficulty === difficulty;
      
      return matchSearch && matchCat && matchAge && matchLoc && matchDiff;
    });
  }, [search, category, age, location, difficulty, aiExercises]);

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      {/* Search Header */}
      <div className="nova-glass p-10 md:p-14 rounded-[4rem] border border-white/5 space-y-10">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{t('title')}</h2>
          <p className="text-gray-500 text-lg">{t('desc')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full bg-slate-950 border border-white/10 rounded-3xl px-8 py-5 text-lg text-white focus:ring-2 focus:ring-[#bef264] outline-none transition-all"
            />
            {search && filtered.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm font-bold animate-fadeIn">
                ⚠️ {t('noResults')}
              </div>
            )}
          </div>
          <button 
            onClick={handleAiDiscovery}
            disabled={isAiLoading || !search}
            className="px-12 py-5 bg-[#bef264] text-black rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#bef264]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 min-w-[300px]"
          >
            {isAiLoading ? (
               <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : '✨'}
            {isAiLoading ? t('analyzing') : t('discoverBtn')}
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">{t('category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#bef264] outline-none">
              <option value="all">{t('all')}</option>
              {Object.values(WorkoutType).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">{t('age')}</label>
            <select value={age} onChange={(e) => setAge(e.target.value as any)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#bef264] outline-none">
              <option value="all">{t('all')}</option>
              {Object.values(AgeGroup).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">{t('location')}</label>
            <select value={location} onChange={(e) => setLocation(e.target.value as any)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#bef264] outline-none">
              <option value="all">{t('all')}</option>
              {Object.values(WorkoutLocation).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">{t('difficulty')}</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#bef264] outline-none">
              <option value="all">{t('all')}</option>
              {Object.values(WorkoutDifficulty).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map((ex, i) => (
          <div key={ex.id + i} className="animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
            <ExerciseCard 
              exercise={ex} 
              onClick={() => onExerciseSelect(ex)} 
              isCurrentlyViewed={selectedExerciseId === ex.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
