
import { Exercise, WorkoutType, AgeGroup, WorkoutLocation, WorkoutDifficulty, WorkoutMuscleGroup } from './types';

export const ALL_EXERCISES: Exercise[] = [
  // --- تمارين الجيم والقوة (Full Gym) ---
  {
    id: 'st-1',
    name: 'ضغط الصدر بالدمبل (Incline)',
    category: WorkoutType.STRENGTH,
    ageGroups: [AgeGroup.YOUTH, AgeGroup.ADULT],
    location: WorkoutLocation.HOME,
    duration: '12 دقيقة',
    difficulty: WorkoutDifficulty.INTERMEDIATE,
    muscleGroup: WorkoutMuscleGroup.CHEST,
    description: 'استهداف الجزء العلوي من عضلة الصدر لبناء هيكل قوي ومتناسق.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800',
    instructions: ['اضبط المقعد بزاوية 30-45 درجة.', 'امسك الدمبلز فوق صدرك.', 'انزل ببطء وادفع للأعلى بقوة.']
  },
  {
    id: 'st-2',
    name: 'القرفصاء البلغارية (Split Squat)',
    category: WorkoutType.STRENGTH,
    ageGroups: [AgeGroup.ADULT],
    location: WorkoutLocation.HOME,
    duration: '15 دقيقة',
    difficulty: WorkoutDifficulty.ADVANCED,
    muscleGroup: WorkoutMuscleGroup.LEGS,
    description: 'أقوى تمرين لعزل الأرجل وبناء كتلة عضلية هائلة في الكوادز والجلوتس.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    instructions: ['ضع قدماً على مرتفع خلفك.', 'انزل بركبتك الأخرى للأرض.', 'ادفع بكعب قدمك الأمامية.']
  },
  {
    id: 'st-3',
    name: 'سحب الظهر (Deadlift) روماني',
    category: WorkoutType.STRENGTH,
    ageGroups: [AgeGroup.ADULT],
    location: WorkoutLocation.HOME,
    duration: '10 دقائق',
    difficulty: WorkoutDifficulty.ADVANCED,
    muscleGroup: WorkoutMuscleGroup.BACK,
    description: 'تمرين أساسي لتقوية السلسلة الخلفية للجسم (ظهر سفلي وأرجل خلفية).',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
    instructions: ['قف مع مسافة عرض الكتفين.', 'انحنِ بخصرك مع الحفاظ على استقامة الظهر.', 'ارفع الوزن بالتركيز على عضلات الأرجل الخلفية.']
  },

  // --- تمارين المنزل (No Equipment / Basic) ---
  {
    id: 'hm-1',
    name: 'ضغط الألماس (Diamond Pushups)',
    category: WorkoutType.HOME_MINIMAL,
    ageGroups: [AgeGroup.YOUTH, AgeGroup.ADULT],
    location: WorkoutLocation.HOME,
    duration: '8 دقائق',
    difficulty: WorkoutDifficulty.INTERMEDIATE,
    muscleGroup: WorkoutMuscleGroup.ARMS,
    description: 'تمرين منزلي قوي جداً لاستهداف الترايسيبس وعضلات الصدر الداخلية.',
    image: 'https://images.unsplash.com/photo-1598971639058-aba7c52e9a72?q=80&w=800',
    instructions: ['ضع يديك بشكل مثلث تحت صدرك.', 'انزل حتى يلمس صدرك يديك.', 'ادفع للأعلى مع عصر الترايسيبس.']
  },
  {
    id: 'hm-2',
    name: 'بلانك مع لمس الأكتاف',
    category: WorkoutType.HOME_MINIMAL,
    ageGroups: [AgeGroup.ALL],
    location: WorkoutLocation.HOME,
    duration: '5 دقائق',
    difficulty: WorkoutDifficulty.BEGINNER,
    muscleGroup: WorkoutMuscleGroup.CORE,
    description: 'تنشيط عضلات البطن وتحسين الثبات المركزي للجسم.',
    image: 'https://images.unsplash.com/photo-1566241142559-40e1bfc26cc4?q=80&w=800',
    instructions: ['خذ وضعية الضغط العالي.', 'المس كتفك الأيسر بيدك اليمنى دون تحريك الحوض.', 'بدل بين الجانبين ببطء.']
  },

  // --- تمارين المكتب (Desk Workouts) ---
  {
    id: 'off-1',
    name: 'تمدد الرقبة والكتف الجالس',
    category: WorkoutType.DESK_WORKOUT,
    ageGroups: [AgeGroup.ADULT, AgeGroup.SENIOR],
    location: WorkoutLocation.OFFICE,
    duration: '3 دقائق',
    difficulty: WorkoutDifficulty.BEGINNER,
    muscleGroup: WorkoutMuscleGroup.SHOULDERS,
    description: 'تخفيف التوتر الناتج عن الجلوس الطويل أمام الكمبيوتر.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
    instructions: ['اجلس بظهر مستقيم.', 'أمل رأسك لجانب واحد بلطف.', 'اسحب كتفك المعاكس للأسفل لزيادة التمدد.']
  },
  {
    id: 'off-2',
    name: 'رفع الأرجل تحت المكتب',
    category: WorkoutType.DESK_WORKOUT,
    ageGroups: [AgeGroup.ADULT],
    location: WorkoutLocation.OFFICE,
    duration: '5 دقائق',
    difficulty: WorkoutDifficulty.BEGINNER,
    muscleGroup: WorkoutMuscleGroup.LEGS,
    description: 'تنشيط الدورة الدموية في الأرجل وتقوية عضلات البطن السفلية أثناء العمل.',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=800',
    instructions: ['اجلس مستقيماً.', 'ارفع قدميك حتى تصبح موازية للأرض.', 'اثبت لمدة 5 ثوانٍ ثم انزل ببطء.']
  },

  // --- كرة القدم (Professional Drills) ---
  {
    id: 'fb-1',
    name: 'تحدي المراوغة بين الأقماع',
    category: WorkoutType.FOOTBALL,
    ageGroups: [AgeGroup.KIDS, AgeGroup.YOUTH],
    location: WorkoutLocation.FIELD,
    duration: '20 دقيقة',
    difficulty: WorkoutDifficulty.INTERMEDIATE,
    muscleGroup: WorkoutMuscleGroup.LEGS,
    description: 'تحسين التحكم السريع بالكرة وتغيير الاتجاه المفاجئ.',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800',
    instructions: ['ضع 5 أقماع بمسافة متر واحد.', 'راوغ بالكرة بين الأقماع باستخدام باطن وخارج القدم.', 'عد بسرعة البرق للبداية.']
  },
  {
    id: 'fb-2',
    name: 'القفز المتفجر (Plyo Jumps)',
    category: WorkoutType.FOOTBALL,
    ageGroups: [AgeGroup.YOUTH, AgeGroup.ADULT],
    location: WorkoutLocation.FIELD,
    duration: '15 دقيقة',
    difficulty: WorkoutDifficulty.ADVANCED,
    muscleGroup: WorkoutMuscleGroup.LEGS,
    description: 'زيادة قوة القفز والسرعة الانفجارية المطلوبة في الملاعب.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
    instructions: ['اقفز للأمام فوق حاجز تخيلي.', 'اهبط بنعومة على مشط القدم.', 'اقفز فوراً للأعلى بأقصى قوة.']
  },

  // --- تأهيل ومرونة (Rehab & Yoga) ---
  {
    id: 'rh-1',
    name: 'وضعية الطير-الكلب (Bird-Dog)',
    category: WorkoutType.REHAB,
    ageGroups: [AgeGroup.ALL],
    location: WorkoutLocation.ANY,
    duration: '10 دقائق',
    difficulty: WorkoutDifficulty.BEGINNER,
    muscleGroup: WorkoutMuscleGroup.BACK,
    description: 'أفضل تمرين لاستقرار العمود الفقري وعلاج آلام أسفل الظهر.',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=800',
    instructions: ['ابدأ على أطرافك الأربعة.', 'مد ذراعك اليمنى ورجلك اليسرى في نفس الوقت.', 'حافظ على استقامة ظهرك وتوازنك.']
  },
  {
    id: 'rh-2',
    name: 'تحرير الورك (Pigeon Pose)',
    category: WorkoutType.YOGA,
    ageGroups: [AgeGroup.ADULT, AgeGroup.SENIOR],
    location: WorkoutLocation.HOME,
    duration: '6 دقائق',
    difficulty: WorkoutDifficulty.INTERMEDIATE,
    muscleGroup: WorkoutMuscleGroup.LEGS,
    description: 'تمدد عميق لعضلات الحوض والارجل لتحسين المدى الحركي.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
    instructions: ['اثنِ ركبتك الأمامية بزاوية 90 درجة.', 'مد رجلك الخلفية بالكامل.', 'انزل بصدرك تدريجياً نحو الأرض.']
  },

  // --- تمارين القلب (HIIT & Fat Loss) ---
  {
    id: 'ht-1',
    name: 'متسلق الجبال السريع',
    category: WorkoutType.HIIT,
    ageGroups: [AgeGroup.YOUTH, AgeGroup.ADULT],
    location: WorkoutLocation.ANY,
    duration: '10 دقائق',
    difficulty: WorkoutDifficulty.ADVANCED,
    muscleGroup: WorkoutMuscleGroup.CORE,
    description: 'حرق دهون مكثف وتقوية عضلات البطن والكتفين.',
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800',
    instructions: ['وضعية الضغط العالي.', 'اسحب ركبتيك نحو صدرك بحركة ركض سريعة.', 'حافظ على استقامة الظهر.']
  }
];
