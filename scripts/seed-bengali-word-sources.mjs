import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let mongoUri = process.env.MONGODB_URI;

if (!mongoUri && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('MONGODB_URI=')) {
      mongoUri = trimmed.substring(trimmed.indexOf('=') + 1).replace(/["']/g, '').trim();
      break;
    }
  }
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

const bengaliWordsData = [
  // --- পর্তুগিজ (Portuguese) ---
  { banglaWord: 'আনারস', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank', 'primary'], examTags: ['১০ম বিসিএস', '৩৮তম বিসিএস', 'সোশ্যাল ইসলামী ব্যাংক'] },
  { banglaWord: 'আলমারি', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'primary'], examTags: ['১২তম বিসিএস', 'প্রাইমারি শিক্ষক ২০১৯'] },
  { banglaWord: 'আলপিন', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank'], examTags: ['২৪তম বিসিএস', 'জনতা ব্যাংক'] },
  { banglaWord: 'পেঁপে', sourceLanguage: 'পর্তুগিজ', exam: ['primary', 'others'], examTags: ['প্রাথমিক সহকারী শিক্ষক'] },
  { banglaWord: 'পাউরুটি', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank'], examTags: ['২৯তম বিসিএস', 'সোনালী ব্যাংক অফিসার'] },
  { banglaWord: 'সাবান', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank'], examTags: ['১৪তম বিসিএস', 'অগ্রণী ব্যাংক সিনিয়র অফিসার'] },
  { banglaWord: 'চাবি', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'ntrca'], examTags: ['৩১তম বিসিএস', '১০ম এনটিআরসিএ'] },
  { banglaWord: 'তোয়ালে', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank'], examTags: ['৪০তম বিসিএস', 'পূবালী ব্যাংক'] },
  { banglaWord: 'পিস্তল', sourceLanguage: 'পর্তুগিজ', exam: ['bcs'], examTags: ['১৬তম বিসিএস'] },
  { banglaWord: 'বোতাম', sourceLanguage: 'পর্তুগিজ', exam: ['bank', 'primary'], examTags: ['বাংলাদেশ কৃষি ব্যাংক'] },
  { banglaWord: 'গির্জা', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'ntrca'], examTags: ['৩৩তম বিসিএস', '১২তম এনটিআরসিএ'] },
  { banglaWord: 'পেয়ারা', sourceLanguage: 'পর্তুগিজ', exam: ['primary'], examTags: ['প্রাথমিক সহকারী শিক্ষক ২০১৮'] },
  { banglaWord: 'বারান্দা', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank'], examTags: ['৩৫তম বিসিএস', 'রূপালী ব্যাংক'] },
  { banglaWord: 'নিলাম', sourceLanguage: 'পর্তুগিজ', exam: ['bank', 'others'], examTags: ['বাংলাদেশ ব্যাংক এডি'] },
  { banglaWord: 'পাদ্রি', sourceLanguage: 'পর্তুগিজ', exam: ['bcs'], examTags: ['২২তম বিসিএস'] },
  { banglaWord: 'বালতি', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank', 'primary'], examTags: ['৩৮তম বিসিএস', 'বেসিক ব্যাংক'] },
  { banglaWord: 'ক্রুশ', sourceLanguage: 'পর্তুগিজ', exam: ['others'], examTags: ['বিসিএস প্রস্তুতি'] },
  { banglaWord: 'কামিজ', sourceLanguage: 'পর্তুগিজ', exam: ['bcs'], examTags: ['২৭তম বিসিএস'] },
  { banglaWord: 'ফিতা', sourceLanguage: 'পর্তুগিজ', exam: ['primary'], examTags: ['প্রাথমিক শিক্ষক নিয়োগ'] },
  { banglaWord: 'গামলা', sourceLanguage: 'পর্তুগিজ', exam: ['others'], examTags: ['বিসিএস ও ব্যাংক প্রস্তুতি'] },
  { banglaWord: 'কেরানি', sourceLanguage: 'পর্তুগিজ', exam: ['bcs', 'bank'], examTags: ['২৮তম বিসিএস'] },
  { banglaWord: 'ইস্পাত', sourceLanguage: 'পর্তুগিজ', exam: ['bank'], examTags: ['কম্বাইন্ড ৮ ব্যাংক'] },
  { banglaWord: 'কপি', sourceLanguage: 'পর্তুগিজ', exam: ['primary'], examTags: ['প্রাথমিক নিয়োগ পরীক্ষা'] },
  { banglaWord: 'বর্মা', sourceLanguage: 'পর্তুগিজ', exam: ['others'], examTags: ['বাংলা ব্যাকরণ প্রমিত'] },
  { banglaWord: 'আয়া', sourceLanguage: 'পর্তুগিজ', exam: ['others'], examTags: ['বিসিএস প্রিলিমিনারি'] },

  // --- আরবি (Arabic) ---
  { banglaWord: 'আদালত', sourceLanguage: 'আরবি', exam: ['bcs', 'bank'], examTags: ['১১তম বিসিএস', 'বাংলাদেশ ব্যাংক অফিসার'] },
  { banglaWord: 'কানুন', sourceLanguage: 'আরবি', exam: ['bcs', 'bank'], examTags: ['১৫তম বিসিএস'] },
  { banglaWord: 'এজলাস', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['১৭তম বিসিএস'] },
  { banglaWord: 'কলম', sourceLanguage: 'আরবি', exam: ['bcs', 'primary'], examTags: ['২৩তম বিসিএস', 'প্রাথমিক শিক্ষক'] },
  { banglaWord: 'বাকি', sourceLanguage: 'আরবি', exam: ['bank'], examTags: ['ব্যাংক অফিসার নিয়োগ'] },
  { banglaWord: 'নগদ', sourceLanguage: 'আরবি', exam: ['bank', 'bcs'], examTags: ['বাংলাদেশ ব্যাংক এডি ২০১৫'] },
  { banglaWord: 'কিতাব', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['১০ম বিসিএস'] },
  { banglaWord: 'আলেম', sourceLanguage: 'আরবি', exam: ['ntrca'], examTags: ['শিক্ষক নিবন্ধন'] },
  { banglaWord: 'দোয়াত', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['১৮তম বিসিএস'] },
  { banglaWord: 'মহকুমা', sourceLanguage: 'আরবি', exam: ['bcs', 'bank'], examTags: ['২১তম বিসিএস'] },
  { banglaWord: 'হাকিম', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['২৫তম বিসিএস'] },
  { banglaWord: 'মুন্সেফ', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['২৯তম বিসিএস'] },
  { banglaWord: 'রায়', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['২৬তম বিসিএস'] },
  { banglaWord: 'মক্কেল', sourceLanguage: 'আরবি', exam: ['bcs', 'bank'], examTags: ['৩৩তম বিসিএস'] },
  { banglaWord: 'ইনসান', sourceLanguage: 'আরবি', exam: ['others'], examTags: ['বাংলা ব্যাকরণ'] },
  { banglaWord: 'কসম', sourceLanguage: 'আরবি', exam: ['others'], examTags: ['বিসিএস সাধারণ জ্ঞান'] },
  { banglaWord: 'খারিজ', sourceLanguage: 'আরবি', exam: ['bcs', 'bank'], examTags: ['৩৫তম বিসিএস'] },
  { banglaWord: 'উকিল', sourceLanguage: 'আরবি', exam: ['bcs', 'bank'], examTags: ['৩৭তম বিসিএস', 'সোনালী ব্যাংক'] },
  { banglaWord: 'হজ', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['৩৯তম বিসিএস'] },
  { banglaWord: 'যাকাত', sourceLanguage: 'আরবি', exam: ['bcs', 'primary'], examTags: ['৪১তম বিসিএস'] },
  { banglaWord: 'কুরবানি', sourceLanguage: 'আরবি', exam: ['primary'], examTags: ['প্রাথমিক শিক্ষক ২০২০'] },
  { banglaWord: 'তসবিহ', sourceLanguage: 'আরবি', exam: ['others'], examTags: ['বাংলা ব্যাকরণ'] },
  { banglaWord: 'শহীদ', sourceLanguage: 'আরবি', exam: ['bcs'], examTags: ['৪৪তম বিসিএস'] },
  { banglaWord: 'আমল', sourceLanguage: 'আরবি', exam: ['bank'], examTags: ['অগ্রণী ব্যাংক'] },
  { banglaWord: 'তসলিম', sourceLanguage: 'আরবি', exam: ['ntrca'], examTags: ['এনটিআরসিএ'] },

  // --- ফারসি (Persian) ---
  { banglaWord: 'খোদা', sourceLanguage: 'ফারসি', exam: ['bcs', 'primary'], examTags: ['১২তম বিসিএস', 'প্রাথমিক শিক্ষক'] },
  { banglaWord: 'রোজা', sourceLanguage: 'ফারসি', exam: ['bcs', 'bank'], examTags: ['১৩তম বিসিএস', 'বাংলাদেশ ব্যাংক'] },
  { banglaWord: 'নামাজ', sourceLanguage: 'ফারসি', exam: ['bcs', 'bank'], examTags: ['১৯তম বিসিএস', 'জনতা ব্যাংক'] },
  { banglaWord: 'কারখানা', sourceLanguage: 'ফারসি', exam: ['bcs', 'bank'], examTags: ['২৭তম বিসিএস', 'সোনালী ব্যাংক'] },
  { banglaWord: 'চশমা', sourceLanguage: 'ফারসি', exam: ['bcs', 'primary'], examTags: ['৩১তম বিসিএস', 'প্রাইমারি শিক্ষক ২০১৭'] },
  { banglaWord: 'দোকান', sourceLanguage: 'ফারসি', exam: ['bcs', 'bank'], examTags: ['২৪তম বিসিএস'] },
  { banglaWord: 'জানোয়ার', sourceLanguage: 'ফারসি', exam: ['bcs'], examTags: ['১৬তম বিসিএস'] },
  { banglaWord: 'আমদানি', sourceLanguage: 'ফারসি', exam: ['bank', 'bcs'], examTags: ['বাংলাদেশ ব্যাংক এডি ২০১৯'] },
  { banglaWord: 'রফতানি', sourceLanguage: 'ফারসি', exam: ['bank', 'bcs'], examTags: ['কম্বাইন্ড ৮ ব্যাংক'] },
  { banglaWord: 'বাদশাহ', sourceLanguage: 'ফারসি', exam: ['bcs'], examTags: ['২০তম বিসিএস'] },
  { banglaWord: 'বেগম', sourceLanguage: 'তুর্কি', exam: ['bcs', 'bank'], examTags: ['১৪তম বিসিএস'] },
  { banglaWord: 'নালিশ', sourceLanguage: 'ফারসি', exam: ['bcs'], examTags: ['২২তম বিসিএস'] },
  { banglaWord: 'দস্তখত', sourceLanguage: 'ফারসি', exam: ['bcs', 'bank'], examTags: ['২৬তম বিসিএস', 'পূবালী ব্যাংক'] },
  { banglaWord: 'সরকার', sourceLanguage: 'ফারসি', exam: ['bcs'], examTags: ['৩০তম বিসিএস'] },
  { banglaWord: 'তারিখ', sourceLanguage: 'ফারসি', exam: ['bcs', 'primary'], examTags: ['৩২তম বিসিএস'] },
  { banglaWord: 'পেরেশান', sourceLanguage: 'ফারসি', exam: ['others'], examTags: ['বাংলা শব্দভাণ্ডার'] },
  { banglaWord: 'দরবার', sourceLanguage: 'ফারসি', exam: ['bcs'], examTags: ['৩৫তম বিসিএস'] },
  { banglaWord: 'তোশক', sourceLanguage: 'ফারসি', exam: ['others'], examTags: ['বিসিএস প্রস্তুতি'] },
  { banglaWord: 'জবানবন্দি', sourceLanguage: 'ফারসি', exam: ['bcs', 'bank'], examTags: ['৩৬তম বিসিএস'] },
  { banglaWord: 'মেথর', sourceLanguage: 'ফারসি', exam: ['primary'], examTags: ['প্রাথমিক নিয়োগ'] },
  { banglaWord: 'দস্তানা', sourceLanguage: 'ফারসি', exam: ['bcs'], examTags: ['৩৮তম বিসিএস'] },
  { banglaWord: 'চাবুক', sourceLanguage: 'ফারসি', exam: ['ntrca'], examTags: ['শিক্ষক নিবন্ধন'] },
  { banglaWord: 'রসিদ', sourceLanguage: 'ফারসি', exam: ['bank'], examTags: ['ব্যাংক অফিসার'] },
  { banglaWord: 'পায়জামা', sourceLanguage: 'ফারসি', exam: ['others'], examTags: ['বাংলা শব্দকোষ'] },
  { banglaWord: 'দিস্তা', sourceLanguage: 'ফারসি', exam: ['primary'], examTags: ['প্রাথমিক শিক্ষক'] },

  // --- তুর্কি (Turkish) ---
  { banglaWord: 'দারোগা', sourceLanguage: 'তুর্কি', exam: ['bcs', 'bank'], examTags: ['১০ম বিসিএস', '৩৪তম বিসিএস', 'সোনালী ব্যাংক'] },
  { banglaWord: 'তোপ', sourceLanguage: 'তুর্কি', exam: ['bcs'], examTags: ['১১তম বিসিএস'] },
  { banglaWord: 'বন্দুক', sourceLanguage: 'তুর্কি', exam: ['bcs', 'bank'], examTags: ['১৫তম বিসিএস', 'বাংলাদেশ ব্যাংক'] },
  { banglaWord: 'উজবুক', sourceLanguage: 'তুর্কি', exam: ['bcs'], examTags: ['১৯তম বিসিএস'] },
  { banglaWord: 'কোর্তা', sourceLanguage: 'তুর্কি', exam: ['others'], examTags: ['বাংলা শব্দভাণ্ডার'] },
  { banglaWord: 'চাকর', sourceLanguage: 'তুর্কি', exam: ['bcs', 'primary'], examTags: ['২৩তম বিসিএস'] },
  { banglaWord: 'বাবুর্চি', sourceLanguage: 'তুর্কি', exam: ['bcs', 'bank'], examTags: ['২৮তম বিসিএস', 'রূপালী ব্যাংক'] },
  { banglaWord: 'চকমক', sourceLanguage: 'তুর্কি', exam: ['bcs'], examTags: ['৩২তম বিসিএস'] },
  { banglaWord: 'লাশ', sourceLanguage: 'তুর্কি', exam: ['bcs', 'primary'], examTags: ['৩৭তম বিসিএস'] },
  { banglaWord: 'কুলি', sourceLanguage: 'তুর্কি', exam: ['bcs'], examTags: ['৪০তম বিসিএস'] },
  { banglaWord: 'বারুদ', sourceLanguage: 'তুর্কি', exam: ['bcs', 'bank'], examTags: ['৪২তম বিসিএস'] },
  { banglaWord: 'বাবা', sourceLanguage: 'তুর্কি', exam: ['primary', 'others'], examTags: ['প্রাথমিক শিক্ষক ২০২১'] },
  { banglaWord: 'খাঁ', sourceLanguage: 'তুর্কি', exam: ['others'], examTags: ['বাংলা ব্যাকরণ'] },
  { banglaWord: 'চাকু', sourceLanguage: 'তুর্কি', exam: ['bcs'], examTags: ['৪৩তম বিসিএস'] },
  { banglaWord: 'কাঁচি', sourceLanguage: 'তুর্কি', exam: ['bcs', 'bank'], examTags: ['৪৫তম বিসিএস', 'অগ্রণী ব্যাংক'] },
  { banglaWord: 'সওগাত', sourceLanguage: 'তুর্কি', exam: ['ntrca'], examTags: ['১৪তম শিক্ষক নিবন্ধন'] },
  { banglaWord: 'কোতল', sourceLanguage: 'তুর্কি', exam: ['others'], examTags: ['বিসিএস প্রশ্নব্যাংক'] },

  // --- ওলন্দাজ (Dutch) ---
  { banglaWord: 'তুরুপ', sourceLanguage: 'ওলন্দাজ', exam: ['bcs', 'bank'], examTags: ['১৮তম বিসিএস', 'বাংলাদেশ ব্যাংক এডি'] },
  { banglaWord: 'ইস্কাপন', sourceLanguage: 'ওলন্দাজ', exam: ['bcs'], examTags: ['২০তম বিসিএস'] },
  { banglaWord: 'হরতন', sourceLanguage: 'ওলন্দাজ', exam: ['bcs', 'primary'], examTags: ['২৬তম বিসিএস'] },
  { banglaWord: 'রুইতন', sourceLanguage: 'ওলন্দাজ', exam: ['bcs'], examTags: ['৩১তম বিসিএস'] },
  { banglaWord: 'টেক্কা', sourceLanguage: 'ওলন্দাজ', exam: ['bcs', 'bank'], examTags: ['৩৬তম বিসিএস', 'জনতা ব্যাংক'] },
  { banglaWord: 'স্কুপ', sourceLanguage: 'ওলন্দাজ', exam: ['others'], examTags: ['বাংলা শব্দকোষ'] },

  // --- ফরাসি (French) ---
  { banglaWord: 'কার্তুজ', sourceLanguage: 'ফরাসি', exam: ['bcs', 'bank'], examTags: ['১২তম বিসিএস', 'সোনালী ব্যাংক'] },
  { banglaWord: 'কুপন', sourceLanguage: 'ফরাসি', exam: ['bcs', 'primary'], examTags: ['১৭তম বিসিএস'] },
  { banglaWord: 'ডিপো', sourceLanguage: 'ফরাসি', exam: ['bcs'], examTags: ['২১তম বিসিএস'] },
  { banglaWord: 'রেস্তোরাঁ', sourceLanguage: 'ফরাসি', exam: ['bcs', 'bank'], examTags: ['২৯তম বিসিএস', 'পূবালী ব্যাংক'] },
  { banglaWord: 'বুর্জোয়া', sourceLanguage: 'ফরাসি', exam: ['bcs'], examTags: ['৩৪তম বিসিএস'] },
  { banglaWord: 'আঁতাত', sourceLanguage: 'ফরাসি', exam: ['bcs'], examTags: ['৩৯তম বিসিএস'] },
  { banglaWord: 'রেনেসাঁ', sourceLanguage: 'ফরাসি', exam: ['bcs', 'ntrca'], examTags: ['৪১তম বিসিএস'] },
  { banglaWord: 'ক্যাফে', sourceLanguage: 'ফরাসি', exam: ['others'], examTags: ['বাংলা প্রমিত'] },

  // --- জাপানি (Japanese) ---
  { banglaWord: 'রিকশা', sourceLanguage: 'জাপানি', exam: ['bcs', 'bank', 'primary'], examTags: ['১০ম বিসিএস', '৩২তম বিসিএস', 'বাংলাদেশ ব্যাংক'] },
  { banglaWord: 'হাসনাহেনা', sourceLanguage: 'জাপানি', exam: ['bcs', 'primary'], examTags: ['১৪তম বিসিএস', 'প্রাথমিক শিক্ষক ২০১৮'] },
  { banglaWord: 'সামুরাই', sourceLanguage: 'জাপানি', exam: ['others'], examTags: ['বিসিএস সাধারণ জ্ঞান'] },
  { banglaWord: 'হারাকিরি', sourceLanguage: 'জাপানি', exam: ['bcs'], examTags: ['২৪তম বিসিএস'] },
  { banglaWord: 'সুনামি', sourceLanguage: 'জাপানি', exam: ['bcs', 'bank'], examTags: ['৩০তম বিসিএস'] },
  { banglaWord: 'জুডো', sourceLanguage: 'জাপানি', exam: ['others'], examTags: ['খেলাধুলা পরিভাষা'] },
  { banglaWord: 'কারাতে', sourceLanguage: 'জাপানি', exam: ['others'], examTags: ['বাংলা শব্দকোষ'] },

  // --- গুজরাটি (Gujarati) ---
  { banglaWord: 'হরতাল', sourceLanguage: 'গুজরাটি', exam: ['bcs', 'bank', 'primary'], examTags: ['১১তম বিসিএস', '২৩তম বিসিএস', 'বাংলাদেশ ব্যাংক'] },
  { banglaWord: 'খদ্দর', sourceLanguage: 'গুজরাটি', exam: ['bcs', 'ntrca'], examTags: ['২৮তম বিসিএস'] },

  // --- পাঞ্জাবি (Punjabi) ---
  { banglaWord: 'চাহিদা', sourceLanguage: 'পাঞ্জাবি', exam: ['bcs', 'bank'], examTags: ['১৫তম বিসিএস', 'অগ্রণী ব্যাংক অফিসার'] },
  { banglaWord: 'শিখ', sourceLanguage: 'পাঞ্জাবি', exam: ['bcs', 'primary'], examTags: ['২২তম বিসিএস'] },
  { banglaWord: 'গুরুদুয়ারা', sourceLanguage: 'পাঞ্জাবি', exam: ['others'], examTags: ['ধর্মীয় পরিভাষা'] },

  // --- চীনা (Chinese) ---
  { banglaWord: 'চা', sourceLanguage: 'চীনা', exam: ['bcs', 'primary'], examTags: ['১০ম বিসিএস', 'প্রাইমারি শিক্ষক ২০১৬'] },
  { banglaWord: 'চিনি', sourceLanguage: 'চীনা', exam: ['bcs', 'bank'], examTags: ['১৬তম বিসিএস', 'সোনালী ব্যাংক'] },
  { banglaWord: 'লিচু', sourceLanguage: 'চীনা', exam: ['bcs', 'primary'], examTags: ['২৭তম বিসিএস'] },
  { banglaWord: 'এলাচি', sourceLanguage: 'চীনা', exam: ['others'], examTags: ['বাংলা ব্যাকরণ'] },

  // --- বর্মি / মায়ানমার (Burmese) ---
  { banglaWord: 'লুঙ্গি', sourceLanguage: 'বর্মি', exam: ['bcs', 'primary'], examTags: ['১৩তম বিসিএস', 'প্রাথমিক শিক্ষক ২০১৯'] },
  { banglaWord: 'ফুঙ্গি', sourceLanguage: 'বর্মি', exam: ['bcs'], examTags: ['২৫তম বিসিএস'] },

  // --- মেক্সিকান (Mexican) ---
  { banglaWord: 'চকোলেট', sourceLanguage: 'মেক্সিকান', exam: ['bank', 'bcs'], examTags: ['বাংলাদেশ ব্যাংক এডি'] },

  // --- মালয় (Malay) ---
  { banglaWord: 'কাকাতুয়া', sourceLanguage: 'মালয়', exam: ['bcs'], examTags: ['১৮তম বিসিএস'] },
  { banglaWord: 'সাগু', sourceLanguage: 'মালয়', exam: ['others'], examTags: ['বিসিএস প্রস্তুতি'] },

  // --- দেশি (Indigenous / Deshi) ---
  { banglaWord: 'কুলা', sourceLanguage: 'দেশি', exam: ['bcs', 'primary'], examTags: ['১১তম বিসিএস', 'প্রাথমিক শিক্ষক'] },
  { banglaWord: 'ঢেঁকি', sourceLanguage: 'দেশি', exam: ['bcs', 'bank'], examTags: ['১৪তম বিসিএস', 'কৃষি ব্যাংক'] },
  { banglaWord: 'ডালা', sourceLanguage: 'দেশি', exam: ['bcs'], examTags: ['১৭তম বিসিএস'] },
  { banglaWord: 'পেট', sourceLanguage: 'দেশি', exam: ['bcs', 'primary'], examTags: ['২১তম বিসিএস', 'প্রাইমারি ২০১৭'] },
  { banglaWord: 'চাল', sourceLanguage: 'দেশি', exam: ['bcs'], examTags: ['২৬তম বিসিএস'] },
  { banglaWord: 'খুকি', sourceLanguage: 'দেশি', exam: ['primary'], examTags: ['প্রাথমিক শিক্ষক ২০১৮'] },
  { banglaWord: 'গঞ্জ', sourceLanguage: 'দেশি', exam: ['bcs'], examTags: ['৩০তম বিসিএস'] },
  { banglaWord: 'চোঙা', sourceLanguage: 'দেশি', exam: ['others'], examTags: ['বাংলা লোকজ শব্দ'] },
  { banglaWord: 'টোপর', sourceLanguage: 'দেশি', exam: ['bcs', 'ntrca'], examTags: ['৩৫তম বিসিএস'] },
  { banglaWord: 'ডাব', sourceLanguage: 'দেশি', exam: ['bcs', 'primary'], examTags: ['৩৮তম বিসিএস'] },
  { banglaWord: 'ডিঙি', sourceLanguage: 'দেশি', exam: ['bcs'], examTags: ['৪০তম বিসিএস'] },
  { banglaWord: 'চুলা', sourceLanguage: 'দেশি', exam: ['bcs', 'bank'], examTags: ['৪৩তম বিসিএস', 'অগ্রণী ব্যাংক'] },
  { banglaWord: 'খেঁকশিয়াল', sourceLanguage: 'দেশি', exam: ['others'], examTags: ['বাংলা ব্যাকরণ'] },
  { banglaWord: 'মাচা', sourceLanguage: 'দেশি', exam: ['primary'], examTags: ['প্রাথমিক শিক্ষক'] },

  // --- তৎসম (Sanskrit / Tatsama) ---
  { banglaWord: 'সূর্য', sourceLanguage: 'তৎসম', exam: ['bcs', 'primary'], examTags: ['১০ম বিসিএস', 'প্রাথমিক শিক্ষক'] },
  { banglaWord: 'চন্দ্র', sourceLanguage: 'তৎসম', exam: ['bcs'], examTags: ['১২তম বিসিএস'] },
  { banglaWord: 'নক্ষত্র', sourceLanguage: 'তৎসম', exam: ['bcs', 'bank'], examTags: ['১৬তম বিসিএস'] },
  { banglaWord: 'ভবন', sourceLanguage: 'তৎসম', exam: ['bcs'], examTags: ['১৯তম বিসিএস'] },
  { banglaWord: 'ধর্ম', sourceLanguage: 'তৎসম', exam: ['bcs', 'ntrca'], examTags: ['২২তম বিসিএস'] },
  { banglaWord: 'পাত্র', sourceLanguage: 'তৎসম', exam: ['primary'], examTags: ['প্রাথমিক নিয়োগ'] },
  { banglaWord: 'মনুষ্য', sourceLanguage: 'তৎসম', exam: ['bcs'], examTags: ['২৮তম বিসিএস'] },
  { banglaWord: 'অরণ্য', sourceLanguage: 'তৎসম', exam: ['bcs', 'bank'], examTags: ['৩৪তম বিসিএস'] },
  { banglaWord: 'জল', sourceLanguage: 'তৎসম', exam: ['bcs'], examTags: ['৩৭তম বিসিএস'] },
  { banglaWord: 'আকাশ', sourceLanguage: 'তৎসম', exam: ['primary'], examTags: ['প্রাথমিক সহকারী শিক্ষক ২০১৯'] },
  { banglaWord: 'রাত্রি', sourceLanguage: 'তৎসম', exam: ['bcs'], examTags: ['৩৯তম বিসিএস'] },
  { banglaWord: 'বৃক্ষ', sourceLanguage: 'তৎসম', exam: ['bcs', 'bank'], examTags: ['৪৪তম বিসিএস'] },

  // --- তদ্ভব (Tadbhabo / Prakrit to Bangla) ---
  { banglaWord: 'হাত', sourceLanguage: 'তদ্ভব', meaning: 'হস্ত > হত্থ > হাত', exam: ['bcs', 'primary'], examTags: ['১১তম বিসিএস', 'প্রাথমিক শিক্ষক'] },
  { banglaWord: 'কান', sourceLanguage: 'তদ্ভব', meaning: 'কর্ণ > কন্ন > কান', exam: ['bcs'], examTags: ['১৫তম বিসিএস'] },
  { banglaWord: 'চাঁদ', sourceLanguage: 'তদ্ভব', meaning: 'চন্দ্র > চন্দ > চাঁদ', exam: ['bcs', 'bank'], examTags: ['২০তম বিসিএস', 'বাংলাদেশ ব্যাংক'] },
  { banglaWord: 'ভাত', sourceLanguage: 'তদ্ভব', meaning: 'ভক্ত > ভত্ত > ভাত', exam: ['bcs', 'primary'], examTags: ['২৫তম বিসিএস'] },
  { banglaWord: 'দাঁত', sourceLanguage: 'তদ্ভব', meaning: 'দন্ত > দন্ত > দাঁত', exam: ['bcs'], examTags: ['২৯তম বিসিএস'] },
  { banglaWord: 'কামার', sourceLanguage: 'তদ্ভব', meaning: 'কর্মকার > কম্মার > কামার', exam: ['bcs', 'ntrca'], examTags: ['৩৩তম বিসিএস'] },
  { banglaWord: 'চামার', sourceLanguage: 'তদ্ভব', meaning: 'চর্মকার > চম্মার > চামার', exam: ['bcs'], examTags: ['৩৮তম বিসিএস'] },
  { banglaWord: 'কুমার', sourceLanguage: 'তদ্ভব', meaning: 'কুম্ভকার > কুম্ভার > কুমার', exam: ['primary'], examTags: ['প্রাথমিক শিক্ষক ২০২১'] },
];

async function seed() {
  console.log(`🚀 Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log(`✅ Connected successfully.`);

  const collection = mongoose.connection.db.collection('wordsourcebengalis');

  let inserted = 0;
  let updated = 0;

  for (const item of bengaliWordsData) {
    const existing = await collection.findOne({ banglaWord: item.banglaWord });
    if (existing) {
      const mergedExams = Array.from(new Set([...(existing.exam || []), ...item.exam]));
      const mergedTags = Array.from(new Set([...(existing.examTags || []), ...(item.examTags || [])]));
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            sourceLanguage: item.sourceLanguage,
            meaning: item.meaning || existing.meaning || '',
            exam: mergedExams,
            examTags: mergedTags,
            updatedAt: new Date(),
          },
        }
      );
      updated++;
    } else {
      await collection.insertOne({
        userEmail: 'community@lexilearn.com',
        banglaWord: item.banglaWord,
        sourceLanguage: item.sourceLanguage,
        meaning: item.meaning || '',
        exam: item.exam,
        examTags: item.examTags || [],
        frequencyCount: (item.examTags || []).length || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }
  }

  const total = await collection.countDocuments();
  console.log(`🎉 Seeding complete:`);
  console.log(`   - Newly inserted: ${inserted}`);
  console.log(`   - Updated/Merged: ${updated}`);
  console.log(`   - Total words in database: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
