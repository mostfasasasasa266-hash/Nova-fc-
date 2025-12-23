
export enum AgeGroup {
  KIDS = 'أطفال (6-12)',
  YOUTH = 'شباب (13-18)',
  ADULT = 'كبار (19-50)',
  SENIOR = 'كبار السن (+50)',
  PREGNANT = 'حوامل',
  POST_REHAB = 'تأهيل بعد إصابة',
  // Added ALL to resolve Property 'ALL' does not exist error in constants.tsx
  ALL = 'الكل'
}

export enum WorkoutType {
  FITNESS = 'لياقة عامة',
  FOOTBALL = 'كرة قدم احترافية',
  BASKETBALL = 'كرة سلة',
  STRENGTH = 'بناء عضلات (Hypertrophy)',
  FAT_LOSS = 'حرق دهون (Metabolic)',
  REHAB = 'إعادة تأهيل (Recovery)',
  TENNIS = 'تنس ومضرب',
  MARTIAL_ARTS = 'فنون قتالية',
  YOGA = 'يوغا ومرونة',
  HIIT = 'تدريب مكثف',
  GYMNASTICS = 'جمباز وليونة',
  DESK_WORKOUT = 'تمارين المكتب',
  HOME_MINIMAL = 'مساحات ضيقة'
}

export enum WorkoutLocation {
  FIELD = 'ملعب',
  HOME = 'منزل',
  OFFICE = 'مكتب',
  ANY = 'أي مكان'
}

export enum WorkoutMuscleGroup {
  LEGS = 'أرجل',
  ARMS = 'أذرع',
  SHOULDERS = 'أكتاف',
  BACK = 'ظهر',
  CHEST = 'صدر',
  CORE = 'بطن وجذع',
  FULL_BODY = 'كامل الجسم'
}

export enum WorkoutDifficulty {
  BEGINNER = 'مبتدئ',
  INTERMEDIATE = 'متوسط',
  ADVANCED = 'محترف',
  ELITE = 'نخبة'
}

export type Language = 'ar' | 'en';

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: string;
  weight: string;
  height: string;
  targetWeight: string;
  bodyFat?: string;
  bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph';
  activityLevel: 'low' | 'moderate' | 'high' | 'athlete';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  dietPreference: 'balanced' | 'high_protein' | 'keto' | 'vegan' | 'vegetarian';
  level: WorkoutDifficulty;
  injuries: string;
  equipment: 'none' | 'basic' | 'full_gym';
  daysPerWeek: string;
  sessionDuration: string;
  focusArea: string;
  points: number;
  completedWorkouts: number;
  gems: number;
}

export interface WorkoutLog {
  exerciseId: string;
  date: string;
  duration?: number;
}

export interface InBodyReport {
  fatPercentage: number;
  muscleMass: string;
  skeletalMuscleMass: string;
  bmr: number;
  visceralFat: number;
  bmi: number;
  bodyType: string;
  postureAnalysis: string;
  symmetryScore: number;
  healthRisk: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export interface Meal {
  time: string;
  name: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  ingredients: string[];
}

export interface NutritionPlan {
  dailyCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  waterIntake: number;
  meals: Meal[];
  supplements: string[];
}

export interface WorkoutPillar {
  title: string;
  description: string;
  exercises: string[];
}

export interface DailyRoutine {
  day: string;
  isRest: boolean;
  physical: WorkoutPillar;
  technical: WorkoutPillar;
  tactical: WorkoutPillar;
  mental: WorkoutPillar;
  reaction: WorkoutPillar;
  nutrition: string;
  totalDuration: string;
  routine?: string;
}

export interface SavedPlan {
  id: string;
  date: string;
  sport: WorkoutType;
  title: string;
  weeklySchedule: DailyRoutine[];
  coachTip: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: WorkoutType;
  description: string;
  image: string;
  duration: string;
  ageGroups: AgeGroup[];
  location: WorkoutLocation;
  difficulty: WorkoutDifficulty;
  muscleGroup: WorkoutMuscleGroup;
  videoUrl?: string;
  instructions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  // Added groundingChunks to track search results for mandatory URL listing
  groundingChunks?: any[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'EGP' | 'USD';
  image: string;
  category: 'Equipments' | 'Apparel' | 'Digital Plans' | 'Supplements';
  stock: number;
}

export interface Order {
  id: string;
  productId: string;
  userId: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  total: number;
}
