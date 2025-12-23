
import React, { useState } from 'react';
import { Exercise } from '../types';
import { generateImagePro, generateVideoVeo } from '../services/geminiService';

interface ExerciseDetailsModalProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({ exercise, onClose }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState<'video' | 'image' | null>(null);
  const [error, setError] = useState<{ message: string; type: 'video' | 'image' } | null>(null);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [aiGeneratedVideo, setAiGeneratedVideo] = useState<string | null>(null);

  const isYoutube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  const getErrorMessage = (err: any) => {
    const message = err?.message?.toLowerCase() || "";
    const status = err?.status;

    if (message.includes("requested entity was not found") || status === 404) {
      return "عذراً، لم يتم العثور على المشروع. يرجى اختيار مشروع مفعل يدعم Veo.\n(Project not found. Please select a valid Veo project.)";
    } else if (message.includes("api key not valid") || message.includes("invalid api key") || status === 401) {
      return "مفتاح API غير صالح. يرجى التحقق من إعدادات المفتاح والمحاولة مجدداً.\n(Invalid API key. Please check your settings.)";
    } else if (message.includes("quota") || message.includes("exhausted") || message.includes("limit") || status === 429) {
      return "تجاوزت حد الاستخدام المسموح به حالياً. يرجى الانتظار قليلاً ثم المحاولة.\n(Quota exhausted. Please try again later.)";
    } else if (message.includes("billing") || message.includes("payment")) {
      return "يتطلب هذا النموذج تفعيل الفواتير في حسابك. يرجى التأكد من أن المفتاح من مشروع مدفوع.\n(Paid project and billing required.)";
    }
    return "تعذر توليد المحتوى في الوقت الحالي. يرجى التحقق من الاتصال أو المحاولة لاحقاً.\n(Could not generate content. Please check your connection or try again later.)";
  };

  const handleAiImage = async () => {
    setError(null);
    setLoading('image');
    try {
      const prompt = `A professional anatomical fitness illustration for the exercise: ${exercise.name}. 
      Focus on body posture and muscle engagement. Professional studio lighting, clear background. 
      Technique: ${exercise.description}`;
      const url = await generateImagePro(prompt, { aspectRatio: '16:9', imageSize: '2K' });
      if (url) {
        setAiGeneratedImage(url);
      } else {
        throw new Error("EMPTY_RESPONSE");
      }
    } catch (e: any) {
      setError({ message: getErrorMessage(e), type: 'image' });
    } finally {
      setLoading(null);
    }
  };

  const handleAiVideo = async () => {
    setError(null);
    setLoading('video');
    try {
      const prompt = `A slow-motion professional training video demonstrating the correct form of ${exercise.name}. 
      Focus on precision and anatomical movement. High definition cinematic tutorial.`;
      const url = await generateVideoVeo(prompt, '16:9');
      if (url) {
        setAiGeneratedVideo(url);
        setShowVideo(true);
      } else {
        throw new Error("EMPTY_RESPONSE");
      }
    } catch (e: any) {
      setError({ message: getErrorMessage(e), type: 'video' });
    } finally {
      setLoading(null);
    }
  };

  const activeVideo = aiGeneratedVideo || exercise.videoUrl;
  const activeImage = aiGeneratedImage || exercise.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl nova-glass rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[95vh] animate-float-slow bg-[#020617]/80">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-50 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-xl"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="overflow-y-auto custom-scrollbar">
          {/* Media Header */}
          <div className="relative h-80 md:h-[550px] w-full bg-slate-950">
            {showVideo && activeVideo ? (
              <div className="w-full h-full group">
                {isYoutube(activeVideo) ? (
                  <iframe 
                    src={activeVideo} 
                    className="w-full h-full border-0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={activeVideo} 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay
                  ></video>
                )}
                <button 
                  onClick={() => setShowVideo(false)}
                  className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all"
                >
                  العودة للصور
                </button>
              </div>
            ) : (
              <>
                <img 
                  src={activeImage} 
                  alt={exercise.name} 
                  className="w-full h-full object-cover transition-opacity duration-700"
                />
                
                {/* Error Overlay */}
                {error && (
                  <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/30">
                      <span className="text-3xl text-red-500">⚠️</span>
                    </div>
                    <h4 className="text-white font-black text-sm mb-3 uppercase tracking-widest">تنبيه النظام / System Alert</h4>
                    <p className="text-gray-400 font-bold text-xs mb-8 max-w-sm leading-relaxed whitespace-pre-line">
                      {error.message}
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={error.type === 'video' ? handleAiVideo : handleAiImage}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl active:scale-95 border border-white/10"
                      >
                        إعادة المحاولة / Retry Generation
                      </button>
                      <button 
                        onClick={() => setError(null)}
                        className="bg-white/5 text-gray-400 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        إغلاق / Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent"></div>
                
                <div className={`absolute inset-0 flex items-center justify-center gap-6 ${error ? 'hidden' : ''}`}>
                  {activeVideo ? (
                    <button 
                      onClick={() => setShowVideo(true)}
                      className="w-24 h-24 rounded-full bg-indigo-600/90 backdrop-blur-md flex items-center justify-center border border-white/30 hover:scale-110 transition-transform shadow-2xl shadow-indigo-500/50"
                    >
                      <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                      <button 
                        onClick={handleAiVideo}
                        disabled={!!loading}
                        className="px-10 py-5 bg-indigo-600/90 backdrop-blur-md rounded-[2rem] text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
                      >
                        {loading === 'video' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '✨'}
                        {loading === 'video' ? 'جاري ابتكار الحركة...' : 'توليد فيديو توضيحي (AI)'}
                      </button>
                      <button 
                        onClick={handleAiImage}
                        disabled={!!loading}
                        className="px-10 py-5 bg-pink-600/90 backdrop-blur-md rounded-[2rem] text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
                      >
                        {loading === 'image' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '🖼️'}
                        {loading === 'image' ? 'جاري رسم التوضيح...' : 'توليد رسم تشريحي (AI)'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-indigo-600/80 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl border border-white/10">
                  {exercise.category}
                </span>
                <span className="bg-pink-600/80 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl border border-white/10">
                  {exercise.difficulty}
                </span>
                {aiGeneratedImage && <span className="bg-amber-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">✨ AI Visualization Ready</span>}
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tighter">{exercise.name}</h2>
            </div>
          </div>

          <div className="p-10 md:p-20 space-y-20">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'المدة المتوقعة', value: exercise.duration, icon: '⏱️', color: 'indigo' },
                { label: 'المكان المفضل', value: exercise.location, icon: '📍', color: 'pink' },
                { label: 'العضلات المستهدفة', value: exercise.muscleGroup, icon: '💪', color: 'amber' },
                { label: 'الفئة العمرية', value: exercise.ageGroups?.[0]?.split(' ')[0] || 'الكل', icon: '👥', color: 'green' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:bg-white/10 group hover:border-white/20">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</span>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <p className="text-lg font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Content Sections */}
            <div className="grid lg:grid-cols-5 gap-20">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white flex items-center gap-4">
                    <span className="w-2.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]"></span>
                    نظرة فنية
                  </h3>
                  <p className="text-gray-400 text-xl leading-relaxed bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                    {exercise.description}
                  </p>
                </div>

                <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                  <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">تلميحات Nova AI</h4>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    "التنفس هو سر القوة في هذا التمرين. ركز على الشهيق عند الاسترخاء والزفير عند بذل المجهود لضمان تدفق الأكسجين للعضلات."
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-10">
                <h3 className="text-3xl font-black text-white flex items-center gap-4">
                  <span className="w-2.5 h-10 bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)]"></span>
                  بروتوكول التنفيذ الصحيح
                </h3>
                
                {exercise.instructions && exercise.instructions.length > 0 ? (
                  <div className="space-y-6">
                    {exercise.instructions.map((step, index) => (
                      <div key={index} className="flex gap-8 items-start group animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl shrink-0 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 shadow-xl">
                          {(index + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-gray-300 text-xl leading-snug group-hover:text-white transition-colors">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 border-2 border-dashed border-white/10 rounded-[4rem] text-center space-y-8 bg-white/[0.02]">
                    <div className="text-8xl opacity-20 animate-pulse">📋</div>
                    <div className="space-y-4">
                      <p className="text-gray-400 font-black text-2xl">جاري تحضير الدليل التقني</p>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto font-medium">
                        نقوم حالياً بتحليل البيانات الميكانيكية الحيوية لهذا التمرين لتقديم أدق تعليمات ممكنة.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-16 border-t border-white/10 flex flex-col md:flex-row gap-6">
              <button className="flex-1 py-8 nova-gradient rounded-[2.5rem] font-black text-white text-2xl shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all">
                بدء وضع التدريب التفاعلي 🚀
              </button>
              <button 
                onClick={onClose}
                className="px-16 py-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-gray-400 font-black text-xl hover:bg-white/10 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailsModal;
