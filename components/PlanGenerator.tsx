
import React, { useState } from 'react';
import { generateSportPlan, regenerateDayPlan, regenerateExercise } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { Language, UserProfile, WorkoutType, WorkoutDifficulty, AgeGroup, WorkoutLocation } from '../types';

interface PlanGeneratorProps {
  currentLang: Language;
  onExerciseClick?: (exerciseName: string) => void;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ currentLang, onExerciseClick }) => {
  const [step, setStep] = useState(1);
  const [selectedSport, setSelectedSport] = useState<WorkoutType | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [user, setUser] = useState<UserProfile>(dbService.getUser());
  const [goals, setGoals] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  const [dayLoading, setDayLoading] = useState<Record<number, boolean>>({});
  const [exerciseLoading, setExerciseLoading] = useState<Record<string, boolean>>({});

  const sports = [
    { type: WorkoutType.STRENGTH, icon: '💪', label: 'بناء العضلات', badge: 'HYPERTROPHY' },
    { type: WorkoutType.FAT_LOSS, icon: '🔥', label: 'حرق الدهون', badge: 'METABOLIC' },
    { type: WorkoutType.REHAB, icon: '🛡️', label: 'إعادة التأهيل', badge: 'RECOVERY' },
    { type: WorkoutType.FOOTBALL, icon: '⚽', label: 'كرة القدم', badge: 'ELITE TECH' },
    { type: WorkoutType.HIIT, icon: '⚡', label: 'لياقة مكثفة', badge: 'CARDIO' },
    { type: WorkoutType.YOGA, icon: '🧘', label: 'يوغا وليونة', badge: 'ZEN' },
  ];

  const handleGenerate = async () => {
    if (!selectedSport) return;
    setLoading(true);
    try {
      await dbService.saveUser(user);
      const result = await generateSportPlan(user, selectedSport, goals, currentLang);
      setPlan(result);
      setStep(8);
    } catch (error) {
      alert("Error generating your elite plan. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const StepWrapper: React.FC<{ title: string; desc: string; children: React.ReactNode }> = ({ children, title, desc }) => (
    <div className="nova-glass p-8 md:p-12 rounded-[3rem] border border-white/10 space-y-10 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div className="h-full bg-[#bef264] transition-all duration-500 shadow-[0_0_10px_#bef264]" style={{ width: `${(step / 7) * 100}%` }}></div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white italic tracking-tight">{title}</h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{desc}</p>
      </div>
      <div className="min-h-[300px]">
        {children}
      </div>
      <div className="flex justify-between items-center pt-8 border-t border-white/5">
        {step > 1 && (
          <button onClick={prevStep} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-black hover:text-white transition-all">السابق</button>
        )}
        <div className="flex-1"></div>
        {step < 7 ? (
          <button onClick={nextStep} className="px-12 py-4 bg-[#bef264] text-black rounded-2xl font-black shadow-xl shadow-[#bef264]/20 hover:scale-105 transition-all">التالي</button>
        ) : (
          <button onClick={handleGenerate} disabled={loading} className="px-12 py-4 nova-gradient rounded-2xl text-white font-black shadow-xl disabled:opacity-50">
            {loading ? 'جاري التحليل البيومتري...' : 'توليد الخطة الذكية'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      {step === 1 && (
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Choose Your <br/><span className="text-[#bef264]">Evolution.</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Select a scientific pathway to begin configuration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sports.map(s => (
              <button 
                key={s.type}
                onClick={() => { setSelectedSport(s.type); nextStep(); }}
                className="group p-10 rounded-[3.5rem] bg-white/5 border border-white/5 hover:border-[#bef264]/40 transition-all flex flex-col items-center gap-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-8 text-[8px] font-black text-gray-700 uppercase tracking-widest">{s.badge}</div>
                <span className="text-6xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{s.icon}</span>
                <span className="font-black text-2xl text-white italic uppercase tracking-tight">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <StepWrapper title="القياسات الحيوية الأساسية" desc="نحتاج هذه البيانات لحساب معدل الأيض الأساسي (BMR)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">الجنس</label>
              <div className="flex gap-4">
                {['male', 'female'].map(g => (
                  <button key={g} onClick={() => setUser({...user, gender: g as any})} className={`flex-1 p-5 rounded-2xl border font-black transition-all ${user.gender === g ? 'bg-[#bef264] border-[#bef264] text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    {g === 'male' ? 'ذكر' : 'أنثى'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">العمر</label>
              <input type="number" value={user.age} onChange={e => setUser({...user, age: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black" placeholder="24" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">الطول (سم)</label>
              <input type="number" value={user.height} onChange={e => setUser({...user, height: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black" placeholder="180" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">الوزن الحالي (كجم)</label>
              <input type="number" value={user.weight} onChange={e => setUser({...user, weight: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black" placeholder="75" />
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 3 && (
        <StepWrapper title="تكوين الجسم والتمثيل الغذائي" desc="تحديد نسبة الدهون ونوع الجسم يساعد في تخصيص فترات الراحة">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">نسبة الدهون التقديرية (%)</label>
              <input type="number" value={user.bodyFat} onChange={e => setUser({...user, bodyFat: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black" placeholder="15" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">نوع الجسم</label>
              <select value={user.bodyType} onChange={e => setUser({...user, bodyType: e.target.value as any})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black">
                <option value="ectomorph">نحيف (Ectomorph)</option>
                <option value="mesomorph">رياضي (Mesomorph)</option>
                <option value="endomorph">ضخم (Endomorph)</option>
              </select>
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">مستوى النشاط اليومي</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'low', label: 'خامل' },
                  { id: 'moderate', label: 'متوسط' },
                  { id: 'high', label: 'نشط جداً' },
                  { id: 'athlete', label: 'محترف' }
                ].map(l => (
                  <button key={l.id} onClick={() => setUser({...user, activityLevel: l.id as any})} className={`p-4 rounded-xl border text-[10px] font-black transition-all ${user.activityLevel === l.id ? 'bg-[#22d3ee] border-[#22d3ee] text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 4 && (
        <StepWrapper title="القدرة والالتزام" desc="تخصيص الصعوبة وعدد الجلسات لضمان الاستمرارية">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">المستوى الرياضي</label>
              <select value={user.level} onChange={e => setUser({...user, level: e.target.value as any})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black">
                {Object.values(WorkoutDifficulty).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">الأيام المتاحة أسبوعياً</label>
              <input type="number" min="1" max="7" value={user.daysPerWeek} onChange={e => setUser({...user, daysPerWeek: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black" placeholder="4" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">مدة الحصة التدريبية (دقيقة)</label>
              <div className="flex gap-4">
                {['30', '45', '60', '90'].map(d => (
                  <button key={d} onClick={() => setUser({...user, sessionDuration: d})} className={`flex-1 p-4 rounded-xl border text-sm font-black transition-all ${user.sessionDuration === d ? 'bg-[#bef264] border-[#bef264] text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    {d}د
                  </button>
                ))}
              </div>
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 5 && (
        <StepWrapper title="البيئة والمعدات" desc="سيقوم Nova باختيار تمارين تتناسب مع أدواتك الحالية">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'none', label: 'بدون أدوات', desc: 'وزن الجسم فقط' },
                { id: 'basic', label: 'أدوات بسيطة', desc: 'دمبل، حبل مقاومة' },
                { id: 'full_gym', label: 'جيم متكامل', desc: 'كل الأجهزة والأوزان' }
              ].map(eq => (
                <button key={eq.id} onClick={() => setUser({...user, equipment: eq.id as any})} className={`p-8 rounded-[2rem] border transition-all text-center space-y-2 ${user.equipment === eq.id ? 'bg-[#bef264] border-[#bef264] text-black shadow-lg shadow-[#bef264]/20' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                  <span className="block font-black text-lg">{eq.label}</span>
                  <span className="block text-[8px] font-bold opacity-60 uppercase">{eq.desc}</span>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">أي إصابات أو قيود حركية؟</label>
              <input type="text" value={user.injuries} onChange={e => setUser({...user, injuries: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black" placeholder="مثال: إصابة في الركبة، ألم في أسفل الظهر..." />
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 6 && (
        <StepWrapper title="تحديد الهدف والتركيز" desc="ساعد Nova في تحديد أولويات تدريبك">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">الوزن المستهدف (كجم)</label>
              <input type="number" value={user.targetWeight} onChange={e => setUser({...user, targetWeight: e.target.value})} className="w-full bg-slate-950 border border-[#bef264] p-8 rounded-[2.5rem] text-4xl text-center font-black text-[#bef264]" placeholder="80" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">منطقة التركيز</label>
              <select value={user.focusArea} onChange={e => setUser({...user, focusArea: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-black">
                <option value="full_body">كامل الجسم</option>
                <option value="upper_body">الجزء العلوي</option>
                <option value="lower_body">الجزء السفلي</option>
                <option value="core">الجذع والبطن</option>
                <option value="stamina">التحمل واللياقة</option>
              </select>
            </div>
          </div>
        </StepWrapper>
      )}

      {step === 7 && (
        <StepWrapper title="اللمسات الأخيرة" desc="أضف أي تفاصيل خاصة تريد من المدرب مراعاتها">
           <div className="space-y-6">
             <textarea 
               value={goals} 
               onChange={(e) => setGoals(e.target.value)}
               className="w-full bg-slate-950 border border-white/10 p-8 rounded-[3rem] h-60 text-white font-bold text-lg focus:ring-2 focus:ring-[#bef264] outline-none"
               placeholder="مثال: أريد التركيز على تقوية عضلات الظهر لأنني أجلس كثيراً، أو أريد زيادة سرعة رد فعلي في الملعب..."
             />
             <div className="p-6 bg-[#bef264]/5 rounded-2xl border border-[#bef264]/20">
               <p className="text-xs text-gray-500 italic leading-relaxed">
                 * سيقوم نظام Nova الآن بدمج جميع البيانات المدخلة (الوزن، الطول، نسبة الدهون، المعدات، الإصابات) لإنتاج خطة تدريبية نادرة ومخصصة لك تماماً.
               </p>
             </div>
           </div>
        </StepWrapper>
      )}

      {step === 8 && plan && (
        <div className="space-y-12 animate-fadeIn">
          <div className="nova-glass p-12 rounded-[4rem] border border-[#bef264]/40 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#bef264] uppercase tracking-[0.4em] mb-2 block">AI Elite Protocol Active</span>
              <h3 className="text-4xl font-black text-white italic">{plan.title}</h3>
            </div>
            <button onClick={() => { dbService.savePlan(plan); setIsSaved(true); }} className={`px-12 py-5 rounded-[2rem] font-black transition-all ${isSaved ? 'bg-green-600 text-white' : 'bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20 hover:scale-105'}`}>
              {isSaved ? 'تم الحفظ في الأرشيف ✅' : 'حفظ الخطة الحالية'}
            </button>
          </div>

          <div className="space-y-16">
            {plan.weeklySchedule.map((day: any, i: number) => (
              <div key={i} className="nova-glass p-10 md:p-14 rounded-[4.5rem] border border-white/5 relative group hover:border-[#bef264]/20 transition-all bg-[#080808]/40">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl nova-gradient flex items-center justify-center text-3xl shadow-xl">🗓️</div>
                    <h4 className="text-3xl font-black text-white italic">{day.day}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="px-5 py-2 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{day.totalDuration}</span>
                     {day.isRest ? null : <button onClick={() => {}} className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all">🔄</button>}
                  </div>
                </div>

                {day.isRest ? (
                  <div className="py-20 text-center space-y-6">
                    <span className="text-7xl block animate-bounce">🛌</span>
                    <h5 className="text-2xl font-black">يوم استشفاء نشط</h5>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">{day.nutrition}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                      { key: 'physical', label: 'البدني', color: '#bef264' },
                      { key: 'technical', label: 'الفني', color: '#22d3ee' },
                      { key: 'tactical', label: 'التكتيكي', color: '#f59e0b' },
                      { key: 'mental', label: 'الذهني', color: '#a855f7' },
                      { key: 'reaction', label: 'رد الفعل', color: '#ef4444' }
                    ].map(pillar => (
                      <div key={pillar.key} className="space-y-6 p-8 rounded-[3rem] bg-white/[0.02] border border-white/5">
                        <h5 className="font-black text-lg uppercase italic" style={{ color: pillar.color }}>{pillar.label}</h5>
                        <ul className="space-y-3">
                          {day[pillar.key]?.exercises?.map((ex: string, idx: number) => (
                            <li key={idx} className="flex gap-3 items-center text-sm font-bold text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-[#bef264]/40 cursor-help transition-all" onClick={() => onExerciseClick?.(ex)}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pillar.color }}></span>
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                
                {!day.isRest && (
                  <div className="mt-12 p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-center italic text-xs text-gray-500">
                    💡 نصيحة التغذية: {day.nutrition}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanGenerator;
