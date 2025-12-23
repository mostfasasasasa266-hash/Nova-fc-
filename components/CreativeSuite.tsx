
import React, { useState, useRef, useMemo } from 'react';
import { generateImagePro, editImageFlash, generateVideoVeo } from '../services/geminiService';

const CreativeSuite: React.FC<{ currentLang: 'ar' | 'en' }> = ({ currentLang }) => {
  const [activeTool, setActiveTool] = useState<'gen' | 'edit' | 'video'>('gen');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<{ data: string, mimeType: string, preview: string } | null>(null);
  
  // Image Adjustment States
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  const fileRef = useRef<HTMLInputElement>(null);

  const filterStyle = useMemo(() => ({
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  }), [brightness, contrast, saturation]);

  const handleGen = async () => {
    if (!prompt.trim() && activeTool !== 'edit') return;
    setLoading(true);
    setResult(null);
    try {
      if (activeTool === 'gen') {
        const url = await generateImagePro(prompt, { aspectRatio, imageSize });
        setResult(url);
      } else if (activeTool === 'edit' && editFile) {
        // If we want the AI to see the adjusted image, we'd need to process it on canvas.
        // For now, we apply filters to the UI for previewing/post-processing.
        const url = await editImageFlash(editFile.data, editFile.mimeType, prompt);
        setResult(url);
      } else if (activeTool === 'video') {
        const url = await generateVideoVeo(prompt, aspectRatio as any === '9:16' ? '9:16' : '16:9');
        setResult(url);
      }
    } catch (e) {
      alert("Error generating content. Ensure you have selected a valid paid project key for Pro models.");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditFile({
        data: (ev.target?.result as string).split(',')[1],
        mimeType: file.type,
        preview: URL.createObjectURL(file)
      });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const t = (key: string) => {
    const dict: any = {
      ar: {
        genTitle: 'توليد الصور الاحترافية (Pro)',
        editTitle: 'تعديل الصور بالذكاء الاصطناعي',
        videoTitle: 'توليد الفيديو (Veo 3)',
        prompt: 'اكتب وصفاً لما تريد ابتكاره...',
        size: 'الدقة',
        ratio: 'نسبة العرض',
        generate: 'بدء الابتكار الذكي',
        upload: 'ارفع الصورة للتعديل',
        processing: 'جاري الإنتاج...',
        adjustments: 'تعديلات الصورة اليدوية',
        brightness: 'السطوع',
        contrast: 'التباين',
        saturation: 'التشبع',
        reset: 'إعادة ضبط'
      },
      en: {
        genTitle: 'Pro Image Generation',
        editTitle: 'AI Image Editing',
        videoTitle: 'Video Generation (Veo 3)',
        prompt: 'Describe what you want to create...',
        size: 'Resolution',
        ratio: 'Aspect Ratio',
        generate: 'Start AI Innovation',
        upload: 'Upload Image to Edit',
        processing: 'Generating Content...',
        adjustments: 'Manual Image Adjustments',
        brightness: 'Brightness',
        contrast: 'Contrast',
        saturation: 'Saturation',
        reset: 'Reset'
      }
    };
    return dict[currentLang]?.[key] || dict.en[key];
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="flex gap-4">
        {[
          { id: 'gen', label: t('genTitle'), icon: '🖼️' },
          { id: 'edit', label: t('editTitle'), icon: '🎨' },
          { id: 'video', label: t('videoTitle'), icon: '🎬' }
        ].map(tool => (
          <button 
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as any); setResult(null); resetFilters(); }}
            className={`flex-1 p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${activeTool === tool.id ? 'nova-gradient text-white border-transparent' : 'nova-glass text-gray-400 border-white/5 hover:bg-white/5'}`}
          >
            <span className="text-3xl">{tool.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 nova-glass p-10 rounded-[3.5rem] border border-white/5">
          {activeTool === 'edit' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <button 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group overflow-hidden"
                >
                  {editFile ? (
                    <img src={editFile.preview} className="h-full w-full object-cover rounded-3xl" style={filterStyle} />
                  ) : (
                    <>
                      <span className="text-4xl group-hover:scale-110 transition-transform">📂</span>
                      <span className="text-xs font-black text-gray-500">{t('upload')}</span>
                    </>
                  )}
                </button>
                <input type="file" ref={fileRef} className="hidden" onChange={handleFile} accept="image/*" />
              </div>

              {/* Adjustment Controls */}
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('adjustments')}</h4>
                  <button onClick={resetFilters} className="text-[9px] font-black text-gray-500 hover:text-[#bef264] uppercase transition-colors">{t('reset')}</button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase">
                      <span>{t('brightness')}</span>
                      <span>{brightness}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full accent-[#bef264] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase">
                      <span>{t('contrast')}</span>
                      <span>{contrast}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full accent-[#bef264] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase">
                      <span>{t('saturation')}</span>
                      <span>{saturation}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(parseInt(e.target.value))} className="w-full accent-[#bef264] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-2">{t('prompt')}</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-[2rem] p-6 h-32 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] px-2">{t('ratio')}</label>
              <select 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="3:4">3:4</option>
                <option value="4:3">4:3</option>
              </select>
            </div>
            {activeTool === 'gen' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] px-2">{t('size')}</label>
                <select 
                  value={imageSize} 
                  onChange={(e) => setImageSize(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="1K">1K HD</option>
                  <option value="2K">2K UHD</option>
                  <option value="4K">4K Extreme</option>
                </select>
              </div>
            )}
          </div>

          <button 
            onClick={handleGen}
            disabled={loading || (!prompt && activeTool !== 'edit')}
            className="w-full py-6 nova-gradient rounded-[2rem] text-white font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-30"
          >
            {loading ? t('processing') : t('generate')}
          </button>
        </div>

        <div className="nova-glass rounded-[4rem] border border-white/5 bg-slate-900/40 flex flex-col items-center justify-center p-4 min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-400 font-black text-xs animate-pulse tracking-widest uppercase">{t('processing')}</p>
            </div>
          ) : result ? (
            activeTool === 'video' ? (
              <video src={result} controls className="w-full h-full rounded-[3rem] object-contain shadow-2xl" />
            ) : (
              <img src={result} className="w-full h-full rounded-[3rem] object-contain shadow-2xl transition-all" style={filterStyle} />
            )
          ) : (
            <div className="text-center space-y-4 opacity-30">
              <span className="text-9xl block">⚡</span>
              <p className="text-xl font-black text-white">Innovation Preview Area</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeSuite;
