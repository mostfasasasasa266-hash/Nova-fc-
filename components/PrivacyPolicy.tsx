
import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const sections = [
    {
      title: "1. البيانات التي نجمعها",
      content: "نقوم بجمع البيانات الحيوية التي تدخلها (الطول، الوزن، العمر، الإصابات) والنشاط الرياضي لتخصيص خطط التدريب. يتم تخزين هذه البيانات محلياً على جهازك لضمان أقصى درجات الخصوصية."
    },
    {
      title: "2. معالجة الذكاء الاصطناعي",
      content: "نستخدم تقنيات Google Gemini و Veo لمعالجة طلباتك وتوليد الفيديوهات. لا يتم ربط هويتك الشخصية بالطلبات المرسلة للذكاء الاصطناعي؛ حيث يتم إرسال البيانات الفنية فقط لغرض التحليل والإنتاج."
    },
    {
      title: "3. استخدام الكاميرا",
      content: "يطلب التطبيق إذن الوصول للكاميرا فقط لاستخدام ميزة 'التحليل البصري للأداء'. لا يتم تخزين الصور أو الفيديوهات الملتقطة في خوادمنا؛ بل يتم معالجتها لحظياً لتقديم الملاحظات الرياضية ثم تُحذف فوراً."
    },
    {
      title: "4. ملفات تعريف الارتباط والتخزين",
      content: "نستخدم التخزين المحلي (Local Storage) لحفظ تقدمك وخططك التدريبية. يمكنك مسح هذه البيانات في أي وقت من خلال إعدادات المتصفح أو تسجيل الخروج."
    },
    {
      title: "5. حقوق المستخدم",
      content: "لك الحق الكامل في تعديل بياناتك أو حذفها نهائياً من التطبيق. نحن لا نقوم ببيع أو مشاركة بياناتك الصحية مع أي أطراف ثالثة لأغراض إعلانية."
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div>
          <h2 className="text-3xl font-black text-white">سياسة الخصوصية</h2>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">التزامنا بحماية بياناتك الرياضية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div 
            key={index} 
            className="nova-glass p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/20 transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl nova-gradient flex items-center justify-center text-white font-black shrink-0">
                {index + 1}
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">
                {section.title}
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="nova-glass p-10 rounded-[3rem] border border-indigo-500/20 bg-indigo-500/5 text-center space-y-4">
        <div className="text-4xl">🔐</div>
        <h4 className="text-xl font-black text-white">أمنك هو أولويتنا</h4>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
          تطبيق Nova Smart Coach مصمم ليكون رفيقك الرياضي الأكثر أماناً. نحن نتبع بروتوكولات صارمة لضمان أن تبقى بياناتك الصحية والبدنية تحت تصرفك وحدك.
        </p>
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] pt-4">آخر تحديث: أكتوبر 2024</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
