
import React, { useState, useEffect, useRef } from 'react';
import { Exercise, WorkoutLocation } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
  isCurrentlyViewed?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick, isCurrentlyViewed = false }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(exercise.videoUrl || null);

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800';
  const displayImage = exercise.image || DEFAULT_IMAGE;

  const handleGenerateTutorial = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsGenerating(true);
    setLoadingMessage("Nova AI يحلل الحركة...");
    try {
      // Mandatorily check for API key selection for Veo models
      if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Fitness tutorial for ${exercise.name}. Anatomically correct form. Professional lighting.`,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setLocalVideoUrl(URL.createObjectURL(blob));
        setAiGenerated(true);
      }
    } catch (err: any) {
      // Handle "Requested entity was not found" by prompting for key selection again
      if (err?.message?.includes("Requested entity was not found")) {
        (window as any).aistudio?.openSelectKey();
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLocationIcon = (loc: WorkoutLocation) => {
    switch (loc) {
      case WorkoutLocation.HOME: return '🏠';
      case WorkoutLocation.OFFICE: return '💼';
      case WorkoutLocation.FIELD: return '⚽';
      default: return '📍';
    }
  };

  return (
    <div 
      onClick={() => !isGenerating && onClick(exercise)}
      className={`relative group bg-[#0a0a0a] rounded-[3.5rem] overflow-hidden border border-white/[0.05] transition-all duration-500 hover:-translate-y-4 hover:border-[#bef264]/40 ${isCurrentlyViewed ? 'ring-2 ring-[#bef264]' : ''}`}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={displayImage} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
          alt={exercise.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-6 left-6 z-30 flex gap-2">
           <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
             {getLocationIcon(exercise.location)} {exercise.location}
           </div>
        </div>

        <div className="absolute top-6 right-6 z-30">
          <span className="px-4 py-1.5 bg-[#bef264] text-black rounded-full text-[9px] font-black uppercase tracking-widest">
            {exercise.difficulty}
          </span>
        </div>

        {isGenerating && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-3 border-[#bef264] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#bef264] font-black text-[10px] uppercase tracking-widest animate-pulse">{loadingMessage}</p>
          </div>
        )}
      </div>

      <div className="p-10 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-black text-white group-hover:text-[#bef264] transition-colors leading-tight italic uppercase tracking-tighter">
            {exercise.name}
          </h3>
          {aiGenerated && <span className="text-[#bef264] text-xl animate-pulse">✨</span>}
        </div>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 h-10">
          {exercise.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Target Muscle</span>
            <span className="text-white font-black text-xs">💪 {exercise.muscleGroup}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleGenerateTutorial(e); }}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-[#bef264] uppercase tracking-widest hover:bg-[#bef264] hover:text-black transition-all"
          >
            {aiGenerated ? 'Update AI' : 'AI Tutorial'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
