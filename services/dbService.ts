
import { UserProfile, SavedPlan, Product, Order, WorkoutLog } from '../types';

const STORAGE_KEYS = {
  USER: 'nova_user_profile',
  PLANS: 'nova_saved_plans',
  ACTIVE_PLAN: 'nova_active_plan',
  LOGS: 'nova_workout_logs',
  PRODUCTS: 'nova_internal_products',
  ORDERS: 'nova_internal_orders',
  INITIALIZED: 'nova_db_initialized'
};

// ذاكرة تخزين مؤقت (In-memory cache) للسرعة الفائقة
let memoryCache: Record<string, any> = {};

const seedDatabase = () => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    const initialUser: UserProfile = {
      name: 'بطل نوفا',
      gender: 'male',
      age: '24',
      weight: '75',
      height: '180',
      targetWeight: '80',
      bodyFat: '15',
      bodyType: 'mesomorph',
      activityLevel: 'moderate',
      sleepQuality: 'good',
      dietPreference: 'balanced',
      level: 'متوسط' as any,
      injuries: 'لا يوجد',
      equipment: 'basic',
      daysPerWeek: '4',
      sessionDuration: '60',
      focusArea: 'لياقة شاملة',
      points: 1250,
      gems: 50, 
      completedWorkouts: 12
    };

    const initialProducts: Product[] = [
      {
        id: 'p1',
        name: 'طقم تدريب Nova الاحترافي',
        description: 'طقم مكون من تيشيرت وشورت بتقنية طرد العرق، مخصص للأداء العالي.',
        price: 850,
        currency: 'EGP',
        image: 'https://images.unsplash.com/photo-1515444744559-7be63e1600de?q=80&w=800',
        category: 'Apparel',
        stock: 50
      },
      {
        id: 'p2',
        name: 'كرة قدم Nova Smart G1',
        description: 'كرة قدم معتمدة من FIFA بتصميم عصري يعزز السيطرة الهوائية.',
        price: 1200,
        currency: 'EGP',
        image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800',
        category: 'Equipments',
        stock: 20
      }
    ];
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialUser));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

export const dbService = {
  init: async () => {
    seedDatabase();
    // إزالة الـ delay لسرعة تشغيل التطبيق الفورية
    return true;
  },

  getData: (key: string) => {
    if (memoryCache[key]) return memoryCache[key];
    const data = localStorage.getItem(key);
    if (data) {
      memoryCache[key] = JSON.parse(data);
      return memoryCache[key];
    }
    return null;
  },

  setData: (key: string, value: any) => {
    memoryCache[key] = value;
    localStorage.setItem(key, JSON.stringify(value));
  },

  getUser: (): UserProfile => dbService.getData(STORAGE_KEYS.USER) || ({} as any),
  saveUser: async (user: UserProfile) => {
    dbService.setData(STORAGE_KEYS.USER, user);
    return true;
  },
  
  getProducts: (): Product[] => dbService.getData(STORAGE_KEYS.PRODUCTS) || [],
  
  // Added addProduct to manage store items
  addProduct: async (product: Product) => {
    const products = dbService.getProducts();
    const newProduct = { ...product, id: `p-${Date.now()}` };
    products.push(newProduct);
    dbService.setData(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  // Added deleteProduct to manage store items
  deleteProduct: async (id: string) => {
    const products = dbService.getProducts().filter(p => p.id !== id);
    dbService.setData(STORAGE_KEYS.PRODUCTS, products);
  },

  getOrders: (): Order[] => dbService.getData(STORAGE_KEYS.ORDERS) || [],
  
  // Added createOrder to handle purchases
  createOrder: async (order: Order) => {
    const orders = dbService.getOrders();
    orders.push(order);
    dbService.setData(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  getPlans: (): SavedPlan[] => dbService.getData(STORAGE_KEYS.PLANS) || [],
  
  // Added deletePlan to manage user training archive
  deletePlan: (id: string) => {
    const plans = dbService.getPlans().filter(p => p.id !== id);
    dbService.setData(STORAGE_KEYS.PLANS, plans);
  },

  savePlan: async (plan: any) => {
    const plans = dbService.getPlans();
    const newPlan = {
      ...plan,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ar-EG')
    };
    plans.unshift(newPlan);
    dbService.setData(STORAGE_KEYS.PLANS, plans);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(newPlan));
    return newPlan;
  },

  // Added getWorkoutLogs to retrieve training history for analytics
  getWorkoutLogs: (): WorkoutLog[] => dbService.getData(STORAGE_KEYS.LOGS) || [],

  logWorkout: async (exerciseId: string, duration: number = 0) => {
    const user = dbService.getUser();
    user.completedWorkouts += 1;
    user.points += 50 + Math.floor(duration / 10);
    await dbService.saveUser(user);
    
    const logs = dbService.getWorkoutLogs();
    logs.push({ exerciseId, date: new Date().toISOString(), duration });
    dbService.setData(STORAGE_KEYS.LOGS, logs);
    return user;
  }
};
