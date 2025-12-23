
import React, { useState, useMemo } from 'react';
import { dbService } from '../services/dbService';
// Fix: Import WorkoutLog from the central types file
import { UserProfile, SavedPlan, WorkoutLog } from '../types';
import { ALL_EXERCISES } from '../constants';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface UserProfileCompProps {
  currentLang: 'ar' | 'en';
  onOpenPrivacy?: () => void;
}

const UserProfileComp: React.FC<UserProfileCompProps> = ({ currentLang, onOpenPrivacy }) => {
  const [user, setUser] = useState<UserProfile>(dbService.getUser());
  const [plans, setPlans] = useState<SavedPlan[]>(dbService.getPlans());
  const logs = useMemo(() => dbService.getWorkoutLogs(), []);

  const handleDeletePlan = (id: string) => {
    dbService.deletePlan(id);
    setPlans(dbService.getPlans());
  };

  // Process logs for time-series charts (Last 14 days)
  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string, count: number, duration: number, points: number }> = {};
    
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // Format date for display: e.g. 10/24
      const displayDate = d.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { month: 'numeric', day: 'numeric' });
      
      dailyData[dateStr] = { 
        date: displayDate, 
        count: 0, 
        duration: 0, 
        points: 0 
      };
    }

    logs.forEach((log: WorkoutLog) => {
      const dateStr = log.date.split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].count += 1;
        dailyData[dateStr].duration += Math.floor((log.duration || 0) / 60); // Minutes
        dailyData[dateStr].points += (50 + Math.floor((log.duration || 0) / 10));
      }
    });

    return Object.values(dailyData);
  }, [logs, currentLang]);

  // Aggregate stats per exercise
  const exerciseStats = useMemo(() => {
    const stats: Record<string, { count: number; lastDone: string; bestDuration: number; totalDuration: number }> = {};
    
    logs.forEach((log: WorkoutLog) => {
      if (!stats[log.exerciseId]) {
        stats[log.exerciseId] = { count: 0, lastDone: log.date, bestDuration: 0, totalDuration: 0 };
      }
      stats[log.exerciseId].count += 1;
      stats[log.exerciseId].totalDuration += (log.duration || 0);
      
      if ((log.duration || 0) > stats[log.exerciseId].bestDuration) {
        stats[log.exerciseId].bestDuration = log.duration;
      }
      
      if (new Date(log.date) > new Date(stats[log.exerciseId].lastDone)) {
        stats[log.exerciseId].lastDone = log.date;
      }
    });

    return Object.entries(stats)
      .map(([id, data]) => {
        const ex = ALL_EXERCISES.find(e => e.id === id);
        return {
          id,
          name: ex?.name || 'تمرين غير معروف',
          category: ex?.category || '',
          count: data.count,
          bestDuration: data.bestDuration,
          avgDuration: Math.floor(data.totalDuration / data.count),
          lastDone: new Date(data.lastDone).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [logs, currentLang]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const t = (key: string) => {
    const dict: any = {
      ar: {
        points: 'إجمالي النقاط',
        completed: 'تمارين مكتملة',
        level: 'المستوى الحالي',
        plansTitle: 'خططي التدريبية المحفوظة',
        plansCount: 'خطط',
        noPlans: 'لا توجد خطط محفوظة بعد. ابدأ بتوليد خطة من "مختبر Nova".',
        viewFull: 'عرض الخطة كاملة',
        activityTitle: 'نشاط التمارين والتطور الشخصي',
        frequency: 'تكرار النشاط',
        lastDone: 'آخر مرة:',
        noActivity: 'لم تقم بتسجيل أي تمارين بعد. ابدأ الآن لترى تطورك!',
        consistency: 'مستوى الاستمرارية',
        personalBest: 'أفضل وقت (PB)',
        avgTime: 'متوسط الوقت',
        timesCompleted: 'مرات الإكمال',
        privacyBtn: 'اطلع على سياسة الخصوصية',
        progressTitle: 'رؤى الأداء البيومتري',
        durationChart: 'تطور مدة التمارين (دقائق)',
        freqChart: 'عدد الجلسات التدريبية',
        pointsChart: 'تراكم نقاط الخبرة (XP)',
        exerciseHeader: 'تحليل الأداء حسب التمرين'
      },
      en: {
        points: 'Total Points',
        completed: 'Workouts Completed',
        level: 'Current Level',
        plansTitle: 'Saved Training Plans',
        plansCount: 'Plans',
        noPlans: 'No saved plans yet. Start generating from Nova Labs.',
        viewFull: 'View Full Plan',
        activityTitle: 'Exercise Activity & Personal Progress',
        frequency: 'Activity Frequency',
        lastDone: 'Last done:',
        noActivity: 'No workout logs yet. Start training to see your progress!',
        consistency: 'Consistency Level',
        personalBest: 'Personal Best (PB)',
        avgTime: 'Average Time',
        timesCompleted: 'Times Completed',
        privacyBtn: 'View Privacy Policy',
        progressTitle: 'Biometric Performance Insights',
        durationChart: 'Workout Duration Trend (mins)',
        freqChart: 'Daily Session Frequency',
        pointsChart: 'XP Accumulation',
        exerciseHeader: 'Per-Exercise Performance Analysis'
      }
    };
    return dict[currentLang]?.[key] || dict.en[key];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn">
          <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-sm font-black text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || p.fill }}></span>
              {p.value} <span className="text-[10px] text-gray-500 uppercase">{p.name}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto pb-32">
      {/* Header Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="nova-glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center space-y-6 group hover:border-indigo-500/30 transition-all">
          <div className="w-24 h-24 rounded-[2rem] nova-gradient flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform">🏆</div>
          <div>
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('points')}</h4>
            <p className="text-5xl font-black text-white tracking-tighter">{user.points.toLocaleString()}</p>
          </div>
        </div>
        <div className="nova-glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center space-y-6 group hover:border-pink-500/30 transition-all">
          <div className="w-24 h-24 rounded-[2rem] bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-5xl text-pink-500 shadow-2xl group-hover:scale-110 transition-transform">🔥</div>
          <div>
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('completed')}</h4>
            <p className="text-5xl font-black text-white tracking-tighter">{user.completedWorkouts}</p>
          </div>
        </div>
        <div className="nova-glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center space-y-6 group hover:border-indigo-400/30 transition-all">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-5xl text-indigo-400 shadow-2xl group-hover:scale-110 transition-transform">📈</div>
          <div>
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('level')}</h4>
            <p className="text-3xl font-black text-white tracking-tight">{user.level}</p>
          </div>
        </div>
      </div>

      {/* Analytics Visualizer - 3-Chart Suite */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white">{t('progressTitle')}</h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Data Analysis: Last 14 Training Cycles</p>
          </div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 animate-pulse">Sync Active</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Duration Trend Chart */}
          <div className="nova-glass p-10 rounded-[3.5rem] border border-white/5 space-y-8 group">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                {t('durationChart')}
              </h4>
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">Mins/Day</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    name="Workout Duration"
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorDuration)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Points/XP Accumulation Chart */}
          <div className="nova-glass p-10 rounded-[3.5rem] border border-white/5 space-y-8 group">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.6)]"></span>
                {t('pointsChart')}
              </h4>
              <span className="text-[9px] font-black text-pink-400 bg-pink-500/10 px-2 py-1 rounded-lg">XP/Day</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236, 72, 153, 0.05)' }} />
                  <Bar dataKey="points" name="Points Earned" radius={[6, 6, 0, 0]} animationDuration={1500}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.points > 0 ? '#ec4899' : 'rgba(255,255,255,0.05)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session Frequency Chart (New) */}
          <div className="nova-glass p-10 rounded-[3.5rem] border border-white/5 space-y-8 lg:col-span-2 group">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                {t('freqChart')}
              </h4>
              <span className="text-[9px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">Sessions/Day</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22c55e', strokeWidth: 2 }} />
                  <Line 
                    type="stepAfter" 
                    dataKey="count" 
                    name="Completed Sessions"
                    stroke="#22c55e" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, shadow: '0 0 10px #22c55e' }}
                    animationDuration={2500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Specific Progress - In-Depth Analytics */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white">{t('exerciseHeader')}</h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Detailed Metrics from Workout Logs</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('consistency')}</span>
          </div>
        </div>

        <div className="nova-glass p-10 rounded-[4rem] border border-white/5 bg-slate-900/40">
          {exerciseStats.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {exerciseStats.map((stat, i) => (
                <div key={stat.id} className="flex flex-col md:flex-row md:items-center gap-10 p-8 rounded-[3rem] bg-white/5 border border-white/5 transition-all hover:bg-white/[0.08] hover:border-indigo-500/20 group animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                  
                  {/* Icon & Basic Info */}
                  <div className="flex items-center gap-8 flex-1">
                    <div className="w-20 h-20 rounded-[2rem] nova-gradient flex items-center justify-center text-2xl font-black shrink-0 shadow-2xl group-hover:rotate-6 transition-all">
                      {stat.count}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-black text-white truncate text-2xl tracking-tight group-hover:text-indigo-400 transition-colors">{stat.name}</h4>
                        <span className="text-[9px] font-black text-gray-500 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest">{stat.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t('lastDone')}</span>
                          <span className="text-xs text-indigo-300 font-black">{stat.lastDone}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t('avgTime')}</span>
                          <span className="text-xs text-pink-400 font-black">{formatSeconds(stat.avgDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Visualization */}
                  <div className="flex items-center gap-12 md:border-l border-white/10 md:pl-12">
                    <div className="text-center space-y-1">
                       <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">{t('personalBest')}</p>
                       <p className="text-3xl font-black text-white font-mono tracking-tighter">{formatSeconds(stat.bestDuration)}</p>
                    </div>
                    
                    <div className="w-40 hidden sm:block">
                       <div className="flex justify-between text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">
                          <span>Progress</span>
                          <span className="text-indigo-400">{Math.min(stat.count * 10, 100)}%</span>
                       </div>
                       <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                         <div 
                           className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.6)]" 
                           style={{ width: `${Math.min(stat.count * 10, 100)}%` }}
                         ></div>
                       </div>
                       <p className="text-[8px] text-gray-700 font-bold mt-2 uppercase text-center tracking-widest">Mastery Level Increasing</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-8">
              <div className="text-9xl mb-6 animate-bounce">🚀</div>
              <div className="space-y-4">
                <p className="text-white text-2xl font-black">{t('noActivity')}</p>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">Start logging your workouts using the Smart Coach to unlock these biometric insights.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Plans Archive */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-3xl font-black text-white">{t('plansTitle')}</h3>
          <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">{plans.length} {t('plansCount')} Archived</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {plans.map(plan => (
            <div key={plan.id} className="nova-glass p-10 rounded-[4rem] border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">{plan.title}</h4>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{plan.date}</span>
                </div>
                <button 
                  onClick={() => handleDeletePlan(plan.id)}
                  className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

              <div className="space-y-4">
                {plan.weeklySchedule.slice(0, 3).map((day, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-3 border-b border-white/5 group/day">
                    <span className="text-indigo-400 font-black group-hover/day:scale-110 transition-transform">{day.day}</span>
                    <span className="text-gray-400 truncate max-w-[180px] font-medium">{day.routine || day.physical?.title || 'Training Session'}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] hover:bg-indigo-600 hover:text-white hover:border-indigo-500/30 transition-all active:scale-95">
                {t('viewFull')}
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-24 nova-glass rounded-[4rem] text-center border border-dashed border-white/10 flex flex-col items-center space-y-6">
              <span className="text-6xl opacity-30">📂</span>
              <p className="text-gray-500 font-black text-xl">{t('noPlans')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Support & Privacy Footer */}
      <div className="flex flex-col items-center gap-8 pt-10 border-t border-white/5">
        <button 
          onClick={onOpenPrivacy}
          className="flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-gray-500 font-black text-[11px] uppercase tracking-[0.2em] hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-xl active:scale-95"
        >
          <span className="text-lg">🛡️</span> {t('privacyBtn')}
        </button>
        <div className="text-center space-y-2">
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Powered by Nova AI Neural Engine</p>
          <p className="text-[9px] text-gray-800 font-bold">Secure Local Storage & Biometric Encryption Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileComp;
