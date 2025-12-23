
import React, { useState, useRef } from 'react';
import { performDigitalInBody } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { InBodyReport } from '../types';

const BioScanner: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'upload' | 'scanning' | 'results'>('intro');
  const [images, setImages] = useState<{ front: string | null, side: string | null }>({ front: null, side: null });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InBodyReport | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSide, setActiveSide] = useState<'front' | 'side'>('front');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setImages(prev => ({ ...prev, [activeSide]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const startScan = async () => {
    if (!images.front || !images.side) return;
    setStep('scanning');
    setLoading(true);
    try {
      const user = dbService.getUser();
      const result = await performDigitalInBody(images.front, images.side, user);
      setReport(result);
      setStep('results');
    } catch (e) {
      alert("تعذر إكمال المسح الحيوي. يرجى المحاولة مرة أخرى بصور أوضح.");
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
      {step === 'intro' && (
        <div className="nova-glass p-12 md:p-20 rounded-[4rem] border border-[#bef264]/20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#bef264]/5 to-transparent"></div>
          <div className="text-8xl mb-4 animate-float">🧬</div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            Nova <span className="text-[#bef264]">Bio-Scanner</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            استخدم قوة الذكاء الاصطناعي البصري لتحويل هاتفك إلى جهاز InBody متطور. سنحلل صورك لتقدير نسبة الدهون وتوازن العضلات وتناسق القوام بدقة تقنية عالية.
          </p>
          <button 
            onClick={() => setStep('upload')}
            className="px-16 py-6 bg-[#bef264] text-[#050505] rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(190,242,100,0.4)]"
          >
            بدء المسح الرقمي
          </button>
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black">تحميل الصور المرجعية</h3>
            <p className="text-gray-500">نحتاج إلى صورتين واضحتين للجسم (أمامية وجانبية)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['front', 'side'].map((s) => (
              <div 
                key={s}
                onClick={() => { setActiveSide(s as any); fileInputRef.current?.click(); }}
                className={`relative h-[450px] rounded-[3rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden ${
                  images[s as 'front'|'side'] ? 'border-[#bef264]/40 bg-[#0a0a0a]' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {images[s as 'front'|'side'] ? (
                  <img src={`data:image/jpeg;base64,${images[s as 'front'|'side']}`} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <>
                    <div className="text-6xl">{s === 'front' ? '🧍‍♂️' : '🚶‍♂️'}</div>
                    <p className="font-black text-gray-500 uppercase tracking-widest">{s === 'front' ? 'صورة أمامية' : 'صورة جانبية'}</p>
                  </>
                )}
                <div className="absolute bottom-6 px-6 py-2 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-white">
                  {images[s as 'front'|'side'] ? 'تغيير الصورة' : 'انقر للرفع'}
                </div>
              </div>
            ))}
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*" />

          <button 
            disabled={!images.front || !images.side}
            onClick={startScan}
            className="w-full py-8 bg-[#bef264] text-[#050505] rounded-[2.5rem] font-black text-2xl disabled:opacity-30 shadow-2xl transition-all"
          >
            توليد تقرير InBody الرقمي
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-12">
          <div className="relative w-64 h-96 border border-white/10 rounded-[2rem] overflow-hidden bg-white/5">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400')] bg-cover bg-center grayscale opacity-20"></div>
             <div className="absolute top-0 left-0 w-full h-1 bg-[#bef264] shadow-[0_0_20px_#bef264] animate-[scan_3s_linear_infinite]"></div>
          </div>
          <div className="text-center space-y-4">
            <h4 className="text-3xl font-black text-[#bef264] animate-pulse">جاري تحليل الأنسجة والبيانات الحيوية...</h4>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Nova Biometric Engine v4.0 Processing</p>
          </div>
        </div>
      )}

      {step === 'results' && report && (
        <div className="space-y-12 animate-fadeIn pb-20">
          <div className="flex justify-between items-center">
             <h2 className="text-5xl font-black italic tracking-tighter uppercase">Bio-Metric <span className="text-[#bef264]">Analysis</span></h2>
             <button onClick={() => setStep('intro')} className="text-gray-500 font-black text-xs hover:text-white transition-colors">إعادة الفحص ↺</button>
          </div>

          {/* Medical Grade Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="nova-glass p-10 rounded-[3rem] border border-[#bef264]/20 space-y-4 text-center">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">نسبة الدهون</p>
               <p className="text-6xl font-black text-[#bef264]">{report.fatPercentage}%</p>
            </div>
            <div className="nova-glass p-10 rounded-[3rem] border border-[#22d3ee]/20 space-y-4 text-center">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">كتلة العضلات الهيكلية</p>
               <p className="text-4xl font-black text-[#22d3ee]">{report.skeletalMuscleMass || '34.2kg'}</p>
            </div>
            <div className="nova-glass p-10 rounded-[3rem] border border-[#fbbf24]/20 space-y-4 text-center">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">معدل الأيض BMR</p>
               <p className="text-4xl font-black text-[#fbbf24]">{report.bmr} <span className="text-xs">kcal</span></p>
            </div>
            <div className="nova-glass p-10 rounded-[3rem] border border-pink-500/20 space-y-4 text-center">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">مستوى الدهون الحشوية</p>
               <p className="text-6xl font-black text-pink-500">{report.visceralFat || '4'}</p>
            </div>
          </div>

          <div className="nova-glass p-12 rounded-[4rem] border border-white/5 space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#bef264]/5 blur-[100px]"></div>
             <h4 className="text-3xl font-black italic">تحليل <span className="text-[#bef264]">القوام والحركة</span></h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <p className="text-gray-400 text-lg leading-relaxed border-r-4 border-[#bef264] pr-8">{report.postureAnalysis}</p>
                   <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                      <span className="text-3xl">⚖️</span>
                      <div>
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">نقاط التناسق العام</p>
                         <p className="text-2xl font-black text-white">{report.symmetryScore}/100</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <h5 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">توصيات الأداء المتقدمة</h5>
                   <div className="space-y-4">
                      {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 items-start bg-black/40 p-5 rounded-2xl border border-white/5 group hover:border-[#bef264]/30 transition-all">
                           <span className="text-[#bef264] font-black">✦</span>
                           <p className="text-sm text-gray-400 font-bold group-hover:text-white">{rec}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BioScanner;
