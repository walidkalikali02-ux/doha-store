export interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  description: string;
  descriptionAr: string;
  image: string;
  category: 'coffee' | 'tools' | 'accessories';
  origin?: string;
  originAr?: string;
  roastLevel?: 'light' | 'medium' | 'dark';
  roastLevelAr?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ethiopia Yirgacheffe',
    nameAr: 'إثيوبيا ييرجاشيفي',
    price: 65,
    description: 'Floral notes with citrus acidity and a tea-like body.',
    descriptionAr: 'إيحاءات زهرية مع حمضية الحمضيات وقوام يشبه الشاي.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
    category: 'coffee',
    origin: 'Ethiopia',
    originAr: 'إثيوبيا',
    roastLevel: 'light',
    roastLevelAr: 'حمص فاتح'
  },
  {
    id: '2',
    name: 'Colombia Huila',
    nameAr: 'كولومبيا هويلا',
    price: 58,
    description: 'Balanced sweetness with notes of chocolate and caramel.',
    descriptionAr: 'حلاوة متوازنة مع إيحاءات الشوكولاتة والكراميل.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
    category: 'coffee',
    origin: 'Colombia',
    originAr: 'كولومبيا',
    roastLevel: 'medium',
    roastLevelAr: 'حمص متوسط'
  },
  {
    id: '3',
    name: 'Brazil Cerrado',
    nameAr: 'البرازيل سيرادو',
    price: 52,
    description: 'Nutty profile with low acidity and heavy body.',
    descriptionAr: 'نكهة المكسرات مع حمضية منخفضة وقوام ثقيل.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800',
    category: 'coffee',
    origin: 'Brazil',
    originAr: 'البرازيل',
    roastLevel: 'dark',
    roastLevelAr: 'حمص غامق'
  },
  {
    id: '4',
    name: 'Hario V60 Dripper',
    nameAr: 'قمع هاريو V60',
    price: 120,
    description: 'Classic ceramic dripper for the perfect pour-over.',
    descriptionAr: 'قمع سيراميك كلاسيكي لتحضير القهوة المقطرة المثالية.',
    image: 'https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '5',
    name: 'Fellow Stagg EKG Kettle',
    nameAr: 'غلاية فيلو ستاغ EKG',
    price: 850,
    description: 'Electric pour-over kettle with precision temperature control.',
    descriptionAr: 'غلاية كهربائية مع تحكم دقيق في درجة الحرارة.',
    image: 'https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '6',
    name: 'Comandante C40 Grinder',
    nameAr: 'طاحونة كومان دانتي C40',
    price: 1150,
    description: 'World-class manual coffee grinder.',
    descriptionAr: 'طاحونة يدوية عالمية المستوى للقهوة.',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc45865157?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '7',
    name: 'Costa Rica Tarrazu',
    nameAr: 'كوستاريكا تارازو',
    price: 72,
    description: 'Honey processed with notes of red apple and honey.',
    descriptionAr: 'معالجة عسلية مع إيحاءات التفاح الأحمر والعسل.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    category: 'coffee',
    origin: 'Costa Rica',
    originAr: 'كوستاريكا',
    roastLevel: 'medium',
    roastLevelAr: 'حمص متوسط'
  },
  {
    id: '8',
    name: 'Chemex 6-Cup',
    nameAr: 'كيمكس 6 أكواب',
    price: 210,
    description: 'Elegant glass pour-over coffee maker.',
    descriptionAr: 'أداة تحضير القهوة المقطرة الزجاجية الأنيقة.',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '9',
    name: 'Acaia Pearl Scale',
    nameAr: 'ميزان أكايا بيرل',
    price: 950,
    description: 'The only scale designed for coffee enthusiasts.',
    descriptionAr: 'الميزان الوحيد المصمم لعشاق القهوة بدقة عالية.',
    image: 'https://images.unsplash.com/photo-1517089596392-db21525844fe?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '10',
    name: 'Guatemala Antigua',
    nameAr: 'غواتيمالا أنتيغوا',
    price: 62,
    description: 'Spicy and smoky with a full body.',
    descriptionAr: 'نكهة حارة ومدخنة مع قوام كامل.',
    image: 'https://images.unsplash.com/photo-1497933321188-941f9ad36b12?auto=format&fit=crop&q=80&w=800',
    category: 'coffee',
    origin: 'Guatemala',
    originAr: 'غواتيمالا',
    roastLevel: 'medium',
    roastLevelAr: 'حمص متوسط'
  },
  {
    id: '11',
    name: 'El Salvador Santa Ana',
    nameAr: 'السلفادور سانتا آنا',
    price: 68,
    description: 'Sweet and creamy with notes of milk chocolate and almonds.',
    descriptionAr: 'حلوة وقوام كريمي مع إيحاءات شوكولاتة بالحليب واللوز.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
    category: 'coffee',
    origin: 'El Salvador',
    originAr: 'السلفادور',
    roastLevel: 'medium',
    roastLevelAr: 'حمص متوسط'
  },
  {
    id: '12',
    name: 'French Press 8-Cup',
    nameAr: 'فرنش برس 8 أكواب',
    price: 145,
    description: 'Classic glass and stainless steel french press.',
    descriptionAr: 'أداة فرنش برس كلاسيكية من الزجاج والفولاذ المقاوم للصدأ.',
    image: 'https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '13',
    name: 'AeroPress Coffee Maker',
    nameAr: 'أداة ايروبريس',
    price: 185,
    description: 'Versatile and portable coffee maker for travel or home.',
    descriptionAr: 'أداة تحضير قهوة متعددة الاستخدامات ومحمولة للسفر أو المنزل.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '14',
    name: 'Kalita Wave 185',
    nameAr: 'قمع كاليتا ويف 185',
    price: 145,
    description: 'Flat-bottom dripper for consistent extraction.',
    descriptionAr: 'قمع بقاعدة مسطحة لاستخلاص متناسق ومثالي.',
    image: 'https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '15',
    name: 'Timemore Chestnut C3',
    nameAr: 'طاحونة تايمور سي 3',
    price: 280,
    description: 'High-precision manual grinder with S2C burrs.',
    descriptionAr: 'طاحونة يدوية عالية الدقة مع تروس S2C المتطورة.',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc45865157?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '16',
    name: 'Bialetti Moka Pot 3-Cup',
    nameAr: 'موكا بوت بياليتي 3 أكواب',
    price: 165,
    description: 'The original Italian stovetop espresso maker.',
    descriptionAr: 'أداة تحضير الإسبريسو الإيطالية الأصلية على الموقد.',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc45865157?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '17',
    name: 'Hario Buono Kettle 1.2L',
    nameAr: 'إبريق هاريو بونو 1.2 لتر',
    price: 220,
    description: 'Classic stainless steel gooseneck kettle.',
    descriptionAr: 'إبريق ترشيح كلاسيكي من الفولاذ المقاوم للصدأ بعنق الإوزة.',
    image: 'https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '18',
    name: 'Nanofoamer V2',
    nameAr: 'نانوفومر V2',
    price: 195,
    description: 'Create microfoam milk for latte art at home.',
    descriptionAr: 'أداة صنع رغوة الحليب الدقيقة لفن اللاتيه في المنزل.',
    image: 'https://images.unsplash.com/photo-1517089596392-db21525844fe?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '19',
    name: 'Wacaco Nanopresso',
    nameAr: 'واكاكو نانوبريسو',
    price: 340,
    description: 'Portable espresso machine for coffee on the go.',
    descriptionAr: 'ماكينة إسبريسو محمولة للقهوة أثناء التنقل.',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  },
  {
    id: '20',
    name: 'Hario V60 Paper Filters',
    nameAr: 'فلاتر هاريو V60 الورقية',
    price: 35,
    description: 'Pack of 100 white paper filters for V60.',
    descriptionAr: 'عبوة من 100 فلتر ورقي أبيض لقمع V60.',
    image: 'https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=800',
    category: 'tools'
  }
];
