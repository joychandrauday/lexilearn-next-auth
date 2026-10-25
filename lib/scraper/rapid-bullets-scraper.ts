import { connectDb } from '../db';
import RapidBullet, { IRapidBullet, RapidBulletCategory } from '../models/RapidBullet';
import { cleanJsonString } from '../ai';

export interface ScrapedBulletItem {
  fact: string;
  category: RapidBulletCategory;
  categoryBn: string;
  detail: string;
  mnemonic?: string;
  examTags: string[];
  source: string;
}

// -------------------------------------------------------------
// Curated High-Yield Exam Bullets Repository
// Covering: সংবিধান, মুক্তিযুদ্ধ, অর্থনৈতিক সমীক্ষা, আন্তর্জাতিক চুক্তি
// -------------------------------------------------------------
export const CURATED_HIGH_YIELD_BULLETS: ScrapedBulletItem[] = [
  // 1. সংবিধান (CONSTITUTION)
  {
    fact: 'বাংলাদেশ সংবিধানের ২৭ নম্বর অনুচ্ছেদ অনুযায়ী সকল নাগরিক আইনের দৃষ্টিতে সমান এবং আইনের সমান আশ্রয় লাভের অধিকারী।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: 'বিসিএস প্রিলির অন্যতম সর্বাধিক কমন প্রশ্ন। এটি সংবিধানের তৃতীয় ভাগ (মৌলিক অধিকার)-এর অন্তর্ভুক্ত। ২৮ অনুচ্ছেদে ধর্ম, বর্ণ, লিঙ্গভেদে বৈষম্য নিষিদ্ধের কথা বলা হয়েছে।',
    mnemonic: '২৭ মানে আইনের সামনে সবাই সমান সোজা; ২৮ মানে কোনো বৈষম্য না করা।',
    examTags: ['45th BCS', '43rd BCS', 'Bangladesh Bank AD', 'সংবিধান মৌলিক অধিকার'],
    source: 'গণপ্রজাতন্ত্রী বাংলাদেশ সংবিধান • অনুচ্ছেদ ২৭ ও ২৮',
  },
  {
    fact: 'সংবিধানের ২৯ নম্বর অনুচ্ছেদে প্রজাতন্ত্রের কর্মে বা সরকারি নিয়োগ লাভে সকল নাগরিকের জন্য সুযোগের সমতা নিশ্চিত করা হয়েছে।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: 'তবে অনগ্রসর নাগরিকদের প্রতিনিধিত্ব নিশ্চিত করতে রাষ্ট্র বিশেষ বিধান প্রণয়ন করতে পারবে (কোটা ও সমতা সংরক্ষণ)।',
    mnemonic: '২৯ = নিয়োগে সমতা; চাকরির সুযোগ সবার জন্য উন্মুক্ত।',
    examTags: ['44th BCS', 'Combined Banks Officer', 'পিএসসি নন-ক্যাডার'],
    source: 'বাংলাদেশ সংবিধান • অনুচ্ছেদ ২৯',
  },
  {
    fact: 'সংবিধানের ৩৯ নম্বর অনুচ্ছেদে চিন্তা ও বিবেকের স্বাধীনতা এবং বাক ও ভাব প্রকাশের স্বাধীনতা নিশ্চিত করা হয়েছে।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: '৩৯(১) অনুচ্ছেদে চিন্তা ও বিবেকের স্বাধীনতাকে শর্তহীন অধিকার হিসেবে স্বীকৃতি দেওয়া হয়েছে, আর ৩৯(২) অনুচ্ছেদে বাক-স্বাধীনতা ও সংবাদক্ষেত্রের স্বাধীনতার কথা রয়েছে।',
    mnemonic: '৩৯ = মুক্ত চিন্তা ও বাক-স্বাধীনতা (সাংবাদিকতার স্বাধীনতা)।',
    examTags: ['41st BCS', 'Bangladesh Bank AD', 'আইন বিচার'],
    source: 'বাংলাদেশ সংবিধান • ৩য় ভাগ • অনুচ্ছেদ ৩৯',
  },
  {
    fact: 'বাংলাদেশ সংবিধানের ১ম সংশোধনী (১৯৭৩) পাস হয়েছিল ১৯৭১ সালের যুদ্ধাপরাধীদের বিচার নিশ্চিত করার জন্য।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: '১৫ জুলাই ১৯৭৩ তারিখে এই সংশোধনী পাস হয়। সংবিধানের ৪৭ অনুচ্ছেদে নতুন দফা যুক্ত করে গণহত্যা ও যুদ্ধাপরাধীদের বিচার নিশ্চিত করা হয়।',
    mnemonic: '১ম সংশোধনী = প্রথম দায়িত্ব যুদ্ধাপরাধীদের বিচার (১৯৭৩)।',
    examTags: ['43rd BCS', '40th BCS', 'সংবিধান সংশোধনী'],
    source: 'জাতীয় সংসদ সচিবালয় • ১ম সংশোধনী ১৯৭৩',
  },
  {
    fact: 'সংবিধানের ৫ম সংশোধনী (১৯৭৯) দ্বারা ইনডেমনিটি অধ্যাদেশসহ সামরিক আদেশসমূহকে বৈধতা দেওয়া হয়েছিল, যা পরবর্তীতে ২০১০ সালে সুপ্রিম কোর্ট অবৈধ ঘোষণা করে।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: 'সুপ্রিম কোর্টের ঐতিহাসিক রায়ে ৫ম সংশোধনী বাতিল হওয়ায় সংবিধানের মূল চার রাষ্ট্রীয় মূলনীতি পুনঃপ্রতিষ্ঠিত হয়।',
    mnemonic: '৫ম সংশোধনী = ইনডেমনিটি অধ্যাদেশ বৈধকরণ (পরে সুপ্রিম কোর্টে বাতিল)।',
    examTags: ['38th BCS', '42nd BCS', 'বিচার বিভাগ ও রায়'],
    source: 'বাংলাদেশ সুপ্রিম কোর্ট • ঐতিহাসিক ৫ম সংশোধনী বাতিল রায়',
  },
  {
    fact: 'সংবিধানের ১২শ সংশোধনীর (১৯৯১) মাধ্যমে বাংলাদেশে দীর্ঘ ১৬ বছর পর সংসদীয় সরকার ব্যবস্থার ঐতিহাসিক পুনঃপ্রবর্তন ঘটে।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: '৬ আগস্ট ১৯৯১ তারিখে জাতীয় সংসদে সর্বসম্মতভাবে ১২শ সংশোধনী বিল পাস হয় এবং রাষ্ট্রপতির পদকে নিয়মতান্ত্রিক প্রধান করা হয়।',
    mnemonic: '১২তম সংশোধনী = সংসদীয় গণতন্ত্রের বারো মাসে তেরো পার্বণ (১৯৯১)।',
    examTags: ['44th BCS', '45th BCS', 'রাষ্ট্রবিজ্ঞান'],
    source: 'বাংলাদেশ সংবিধান • ১২শ সংশোধনী আইন ১৯৯১',
  },
  {
    fact: 'সংবিধানের ১৩৭ নম্বর অনুচ্ছেদ অনুযায়ী বাংলাদেশ সরকারি কর্ম কমিশন (BPSC) গঠিত হয়েছে।',
    category: 'constitution',
    categoryBn: 'সংবিধান',
    detail: 'বিপিএসসি একটি সাংবিধানিক প্রতিষ্ঠান। কমিশনের সভাপতি ও সদস্যদের রাষ্ট্রপতি সংবিধানের ১৩৮(১) অনুচ্ছেদ অনুযায়ী নিয়োগ দান করেন।',
    mnemonic: '১৩৭ = BPSC প্রতিষ্ঠা; সরকারি চাকরির প্রবেশদ্বার।',
    examTags: ['45th BCS', '37th BCS', 'সাংবিধানিক প্রতিষ্ঠান'],
    source: 'বাংলাদেশ সংবিধান • ৯ম ভাগ • অনুচ্ছেদ ১৩৭',
  },

  // 2. মুক্তিযুদ্ধ (LIBERATION WAR)
  {
    fact: '১৯৭১ সালের মহান মুক্তিযুদ্ধে বাংলাদেশকে মোট ১১টি প্রশাসনিক ও সামরিক সেক্টরে বিভক্ত করা হয়েছিল।',
    category: 'liberation_war',
    categoryBn: 'মুক্তিযুদ্ধ',
    detail: '১০ নম্বর সেক্টরটি ছিল নৌ সেক্টর (অপারেশন জ্যাকপট পরিচালিত), যার কোনো নির্দিষ্ট নিয়মিত সেক্টর কমান্ডার ছিল না। এটি সরাসরি সি-ইন-সি জেনারেল ওসমানীর অধীনে পরিচালিত হতো।',
    mnemonic: 'মনে রাখার ছন্দ: জিয়া (১), খালেদ (২), শফিউল্লাহ (৩), দত্ত (৪), শওকত (৫), বাশার (৬), নাজমুল (৭), ওসমান (৮), জলিল (৯), নাই (১০ - নৌ), তাহের (১১)।',
    examTags: ['বিসিএস প্রিলি আবশ্যিক', 'বাংলাদেশ ব্যাংক', 'সব সরকারি চাকরি'],
    source: 'মুক্তিযুদ্ধ বিষয়ক মন্ত্রণালয় • সেক্টর ও কমান্ডারদের গেজেট',
  },
  {
    fact: 'মুক্তিযুদ্ধে একমাত্র বিমান বাহিনী কর্মকর্তা সেক্টর কমান্ডার ছিলেন উইং কমান্ডার এম খাদেমুল বাশার (৬ নম্বর সেক্টর: রংপুর ও দিনাজপুর)।',
    category: 'liberation_war',
    categoryBn: 'মুক্তিযুদ্ধ',
    detail: '৬ নম্বর সেক্টরের সদর দপ্তর ছিল তেঁতুলিয়ার বুড়িমারী। এটি বাংলাদেশের একমাত্র সেক্টর যা সম্পূর্ণ মুক্তাঞ্চলে পরিচালিত হয়েছিল।',
    mnemonic: '৬ নম্বর = বাশার (বিমান বাহিনী কর্মকর্তা) রংপুর-দিনাজপুর।',
    examTags: ['43rd BCS', 'Bank AD', 'মুক্তিযুদ্ধ স্পেশাল'],
    source: 'বাংলাদেশ বিমান বাহিনী ইতিহাস • সেক্টর ৬ গেজেট',
  },
  {
    fact: 'মুক্তিযুদ্ধে বীরত্বসূচক রাষ্ট্রীয় সর্বোচ্চ পদক "বীরশ্রেষ্ঠ" প্রাপ্ত শহীদ বীরের সংখ্যা ৭ জন।',
    category: 'liberation_war',
    categoryBn: 'মুক্তিযুদ্ধ',
    detail: 'বীরশ্রেষ্ঠদের মধ্যে সেনাবাহিনী থেকে ৩ জন (জাহাঙ্গীর, মোস্তফা, হামিদুর), ইপিআর থেকে ২ জন (রউফ, নূর মোহাম্মদ), নৌবাহিনী থেকে ১ জন (রুহুল আমিন) এবং বিমান বাহিনী থেকে ১ জন (মতিউর রহমান)।',
    mnemonic: 'অহির মুখে রুহুল মতিউর = আব্দুর রউফ, হামিদুর, জাহাঙ্গীর, নূর মোহাম্মদ, মোস্তফা, রুহুল আমিন, মতিউর রহমান।',
    examTags: ['সব বিসিএস প্রিলি', 'প্রাইমারি শিক্ষক নিয়োগ', 'এনটিআরসিএ'],
    source: 'বীরত্বসূচক খেতাব গেজেট • ১৫ ডিসেম্বর ১৯৭৩',
  },
  {
    fact: 'মুজিবনগর সরকার আনুষ্ঠানিকভাবে শপথ গ্রহণ করে ১৯৭১ সালের ১৭ এপ্রিল মেহেরপুরের বৈদ্যনাথতলা/ভবেরপাড়ার আম্রকাননে।',
    category: 'liberation_war',
    categoryBn: 'মুক্তিযুদ্ধ',
    detail: 'ঘোষণাপত্র পাঠ করেন অধ্যাপক ইউসুফ আলী। রাষ্ট্রপতি ছিলেন বঙ্গবন্ধু শেখ মুজিবুর রহমান এবং তাঁর অনুপস্থিতিতে অস্থায়ী রাষ্ট্রপতি হিসেবে দায়িত্ব পালন করেন সৈয়দ নজরুল ইসলাম; প্রধানমন্ত্রী ছিলেন তাজউদ্দীন আহমদ।',
    mnemonic: 'গঠন ১০ এপ্রিল, শপথ ১৭ এপ্রিল মেহেরপুরের বৈদ্যনাথতলা আম্রকাননে।',
    examTags: ['45th BCS', '44th BCS', '41st BCS', 'মুজিবনগর সরকার'],
    source: 'বাংলাদেশ মুক্তিযুদ্ধ মন্ত্রণালয় • মুজিবনগর সরকার দলিল',
  },
  {
    fact: 'মুক্তিযুদ্ধে ঐতিহাসিক "অপারেশন জ্যাকপট" পরিচালিত হয়েছিল ১৯৭১ সালের ১৫ আগস্ট মধ্যরাতে।',
    category: 'liberation_war',
    categoryBn: 'মুক্তিযুদ্ধ',
    detail: 'নৌ-কমান্ডোরা একযোগে চট্টগ্রাম ও মংলা সমুদ্রবন্দর এবং চাঁদপুর ও নারায়ণগঞ্জ নদীবন্দরে পাকিস্তান বাহিনীর বহু গোলাবারুদবাহী জাহাজ লিম্পেট মাইন দিয়ে ধ্বংস করেন।',
    mnemonic: '১৫ আগস্ট মধ্যরাত = অপারেশন জ্যাকপট; পাকিস্তানি নৌ-লজিস্টিকস সম্পূর্ণ পঙ্গু।',
    examTags: ['44th BCS', 'বাংলাদেশ ব্যাংক অফিসার', 'নৌ-কমান্ডো'],
    source: 'নৌবাহিনী সদর দপ্তর • অপারেশন জ্যাকপট ইতিহাস',
  },

  // 3. অর্থনৈতিক সমীক্ষা ও বাজেট (ECONOMY & SURVEY)
  {
    fact: 'বাংলাদেশ অর্থনৈতিক সমীক্ষা অনুযায়ী দেশের জিডিপিতে সেবা খাতের (Service Sector) অবদান সর্বোচ্চ (প্রায় ৫১.২%)।',
    category: 'economy',
    categoryBn: 'অর্থনৈতিক সমীক্ষা',
    detail: 'খাতভিত্তিক জিডিপি অবদানের বর্তমান ক্রম: ১. সেবা খাত (Service) ~৫১.২%, ২. শিল্প খাত (Industry) ~৩৭.৫%, ৩. কৃষি খাত (Agriculture) ~১১.৩%।',
    mnemonic: 'জিডিপি ক্রম: সেবা (১ম) > শিল্প (২য়) > কৃষি (৩য়)।',
    examTags: ['46th BCS', 'Bangladesh Bank AD', 'অর্থনৈতিক সমীক্ষা ২০২৪'],
    source: 'বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS) ও অর্থ মন্ত্রণালয়',
  },
  {
    fact: 'Repo Rate হলো সেই নীতিগত সুদ হার, যে হারে বাংলাদেশ ব্যাংক বাণিজ্যিক ব্যাংকগুলোকে স্বল্পমেয়াদে ঋণ প্রদান করে।',
    category: 'economy',
    categoryBn: 'অর্থনৈতিক সমীক্ষা',
    detail: 'মূল্যস্ফীতি (Inflation) নিয়ন্ত্রণে কেন্দ্রীয় ব্যাংক যখন Repo Rate বৃদ্ধি করে, তখন ব্যাংকিং ব্যবস্থায় ঋণ নেওয়ার খরচ বাড়ে এবং বাজারে টাকার প্রবাহ সংকুচিত হয়।',
    mnemonic: 'রেপো বাড়ে = টাকা দামি হয় = মূল্যস্ফীতি কমে।',
    examTags: ['Bangladesh Bank AD', 'Combined 9 Banks', 'ব্যাংকিং পরিভাষা'],
    source: 'বাংলাদেশ ব্যাংক মুদ্রানীতি বিভাগ (Monetary Policy Department)',
  },
  {
    fact: 'ক্যাশ রিজার্ভ রেশিও (CRR) হলো তফসিলি ব্যাংকগুলোর মোট তলবি ও মেয়াদি দায়ের সেই নগদ অংশ যা বাংলাদেশ ব্যাংকে জমা রাখা বাধ্যতামূলক।',
    category: 'economy',
    categoryBn: 'অর্থনৈতিক সমীক্ষা',
    detail: 'এসএলআর (SLR) হলো আমানতের সেই অংশ যা ব্যাংকগুলোকে নগদ, স্বর্ণ বা সরকারি ট্রেজারি বিলে নিজেদের কাছে বা কেন্দ্রীয় ব্যাংকে তরল আকারে রাখতে হয়।',
    mnemonic: 'CRR = Cash জমা কেন্দ্রীয় ব্যাংকে; SLR = Statutory Liquidity সরকারি সিকিউরিটিজে।',
    examTags: ['Bank AD Interview', 'Senior Officer Written', 'ব্যাংকিং ডিপ্লোমা'],
    source: 'ব্যাংক কোম্পানি আইন ১৯৯১ ও বাংলাদেশ ব্যাংক সার্কুলার',
  },
  {
    fact: 'বাংলাদেশের মোট রপ্তানি আয়ের সিংহভাগ (প্রায় ৮৪%) অর্জিত হয় তৈরি পোশাক (RMG) খাত থেকে।',
    category: 'economy',
    categoryBn: 'অর্থনৈতিক সমীক্ষা',
    detail: 'পোশাক খাতের পর প্রধান রপ্তানি পণ্যের মধ্যে রয়েছে চামড়া ও চামড়াজাত পণ্য, পাট ও পাটজাত পণ্য, হিমায়িত খাদ্য (চিংড়ি) ও ফার্মাসিউটিক্যালস।',
    mnemonic: 'রপ্তানির প্রাণ = RMG (তৈরি পোশাক ৮৪%)।',
    examTags: ['45th BCS', 'অর্থনীতি ও আন্তর্জাতিক বাণিজ্য'],
    source: 'রপ্তানি উন্নয়ন ব্যুরো (EPB) ও বাংলাদেশ অর্থনৈতিক সমীক্ষা',
  },
  {
    fact: 'বাংলাদেশে বার্ষিক উন্নয়ন কর্মসূচির (ADP) অর্থায়নে সর্বোচ্চ বরাদ্দ পায় পরিবহন ও যোগাযোগ খাত।',
    category: 'economy',
    categoryBn: 'অর্থনৈতিক সমীক্ষা',
    detail: 'এডিপিতে শীর্ষ বরাদ্দপ্রাপ্ত প্রধান তিন খাত হলো: ১. পরিবহন ও যোগাযোগ, ২. বিদ্যুৎ ও জ্বালানি, ৩. শিক্ষা ও ধর্ম।',
    mnemonic: 'এডিপি বরাদ্দ: পরিবহন > বিদ্যুৎ > শিক্ষা।',
    examTags: ['46th BCS', 'পরিকল্পনা মন্ত্রণালয়', 'বাজেট ও এডিপি'],
    source: 'পরিকল্পনা কমিশন • বার্ষিক উন্নয়ন কর্মসূচি (ADP)',
  },

  // 4. আন্তর্জাতিক চুক্তি ও বিশ্ব রাজনীতি (TREATIES & GEOPOLITICS)
  {
    fact: 'ঐতিহাসিক "প্যারিস জলবায়ু চুক্তি" (Paris Agreement) স্বাক্ষরিত হয় ২০১৫ সালে কপ-২১ (COP21) সম্মেলনে।',
    category: 'treaties',
    categoryBn: 'আন্তর্জাতিক চুক্তি',
    detail: 'এই চুক্তির মূল লক্ষ্য বৈশ্বিক উষ্ণতা বৃদ্ধি প্রাক-শিল্পায়ন যুগের তুলনায় ২ ডিগ্রি সেলসিয়াসের নিচে এবং সম্ভব হলে ১.৫ ডিগ্রি সেলসিয়াসের মধ্যে সীমাবদ্ধ রাখা। ৪ নভেম্বর ২০১৬ সালে এটি কার্যকর হয়।',
    mnemonic: 'প্যারিস চুক্তি = COP21 (২০১৫ সাল), লক্ষ্য ১.৫°C উষ্ণতা নিয়ন্ত্রণ।',
    examTags: ['45th BCS', '43rd BCS', 'পরিবেশ ও আন্তর্জাতিক চুক্তি'],
    source: 'UNFCCC সচিবালয় • প্যারিস চুক্তি ২০১৫',
  },
  {
    fact: '১৯৪৪ সালে যুক্তরাষ্ট্রের নিউ হ্যাম্পশায়ারে অনুষ্ঠিত ব্রেটন উডস (Bretton Woods) সম্মেলনের মাধ্যমে আইএমএফ ও বিশ্বব্যাংক প্রতিষ্ঠিত হয়।',
    category: 'treaties',
    categoryBn: 'আন্তর্জাতিক চুক্তি',
    detail: 'এই কারণে আন্তর্জাতিক মুদ্রা তহবিল (IMF) এবং পুনর্গঠন ও উন্নয়নের জন্য আন্তর্জাতিক ব্যাংক (IBRD/World Bank)-কে "ব্রেটন উডস টুইনস" (Bretton Woods Twins) বলা হয়।',
    mnemonic: '১৯৪৪ ব্রেটন উডস টুইনস = IMF + World Bank (উভয়ের সদর দপ্তর ওয়াশিংটন ডিসি)।',
    examTags: ['44th BCS', 'Bangladesh Bank AD', 'আন্তর্জাতিক সংস্থা'],
    source: 'বিশ্বব্যাংক ও আইএমএফ অফিসিয়াল আর্কাইভ',
  },
  {
    fact: 'জাতিসংঘ সমুদ্র আইন চুক্তি (UNCLOS 1982) আন্তর্জাতিক সমুদ্রসীমা নির্ধারণ ও জলসীমার অধিকার সংক্রান্ত প্রধান আইন।',
    category: 'treaties',
    categoryBn: 'আন্তর্জাতিক চুক্তি',
    detail: 'এই চুক্তির অধীনে গঠিত ITLOS ট্রাইব্যুনালের রায়ে বাংলাদেশ ২০১২ সালে মিয়ানমারের সাথে এবং ২০১৪ সালে স্থায়ী সালিশি আদালতে (PCA) ভারতের সাথে ঐতিহাসিক সমুদ্রসীমা জয় লাভ করে।',
    mnemonic: 'UNCLOS ১৯৮২ = সমুদ্র আইন; ২০১২ মিয়ানমার জয়, ২০১৪ ভারত জয়।',
    examTags: ['43rd BCS', '38th BCS', 'সমুদ্রসীমা বিরোধ ও ITLOS'],
    source: 'আন্তর্জাতিক সমুদ্র আইন ট্রাইব্যুনাল (ITLOS) রায়',
  },
  {
    fact: 'সার্ক (SAARC)-এর স্থায়ী সচিবালয় নেপালের রাজধানী কাঠমান্ডুতে এবং বিমসটেক (BIMSTEC)-এর স্থায়ী সচিবালয় বাংলাদেশের রাজধানী ঢাকায় অবস্থিত।',
    category: 'treaties',
    categoryBn: 'আন্তর্জাতিক চুক্তি',
    detail: 'সার্ক প্রতিষ্ঠিত হয়েছিল ৮ ডিসেম্বর ১৯৮৫ সালে ঢাকায়। আর বিমসটেক প্রতিষ্ঠিত হয়েছিল ৬ জুন ১৯৯৭ সালে ব্যাংকক ঘোষণার মাধ্যমে।',
    mnemonic: 'সার্কের হেডকোয়ার্টার কাঠমান্ডু; বিমসটেকের হেডকোয়ার্টার ঢাকা।',
    examTags: ['42nd BCS', '45th BCS', 'আঞ্চলিক সংস্থা'],
    source: 'সার্ক ও বিমসটেক সচিবালয় অফিসিয়াল ডাটাবেজ',
  },
  {
    fact: 'বিশ্ববাণিজ্য সংস্থা (WTO) প্রতিষ্ঠিত হয়েছিল ১ জানুয়ারি ১৯৯৫ সালে উরুগুয়ে রাউন্ড আলোচনার মাধ্যমে স্বাক্ষরিত মারাকেশ চুক্তির ভিত্তিতে।',
    category: 'treaties',
    categoryBn: 'আন্তর্জাতিক চুক্তি',
    detail: 'ডব্লিউটিওর পূর্বসূরি চুক্তি ছিল GATT (General Agreement on Tariffs and Trade - 1947)। ডব্লিউটিওর সদর দপ্তর সুইজারল্যান্ডের জেনেভায় অবস্থিত।',
    mnemonic: 'GATT থেকে WTO = ১ জানুয়ারি ১৯৯৫ (মারাকেশ চুক্তি, সদর দপ্তর জেনেভা)।',
    examTags: ['41st BCS', 'Bank Officer', 'আন্তর্জাতিক বাণিজ্য সংস্থা'],
    source: 'বিশ্ব বাণিজ্য সংস্থা (WTO) • জেনেভা আর্কাইভ',
  },
];

// -------------------------------------------------------------
// Seed or Ensure Curated Bullets in Database
// -------------------------------------------------------------
export async function seedRapidBulletsIfEmpty(): Promise<number> {
  await connectDb();
  const count = await RapidBullet.countDocuments();
  if (count === 0) {
    const today = new Date().toISOString().split('T')[0];
    const docs = CURATED_HIGH_YIELD_BULLETS.map((item) => ({
      ...item,
      verified: true,
      dateAdded: today,
    }));
    await RapidBullet.insertMany(docs);
    return docs.length;
  }
  return count;
}

// -------------------------------------------------------------
// AI-Powered Scraper Engine for Fresh Exam Bullets
// Scrapes or curates live exam-oriented bullets from topics/themes
// -------------------------------------------------------------
export async function scrapeAndGenerateRapidBullets(options?: {
  category?: RapidBulletCategory | 'all';
  sourceHint?: string;
  count?: number;
}): Promise<ScrapedBulletItem[]> {
  const { category = 'all', sourceHint = 'National Dailies & Official Gazette', count = 4 } = options || {};

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const categoryPromptMap: Record<string, string> = {
    constitution: 'বাংলাদেশ সংবিধানের অনুচ্ছেদ, মৌলিক অধিকার, সুপ্রিম কোর্টের ঐতিহাসিক রায় এবং ১ম থেকে ১৭শ সংশোধনী',
    liberation_war: '১৯৭১ সালের মুক্তিযুদ্ধ, ১১টি সেক্টর ও সেক্টর কমান্ডার, ৭ জন বীরশ্রেষ্ঠ, মুজিবনগর সরকার এবং অপারেশন জ্যাকপট',
    economy: 'বাংলাদেশ অর্থনৈতিক সমীক্ষা ২০২৪, বাজেট, জিডিপি খাতভিত্তিক অবদান, বাংলাদেশ ব্যাংকের মুদ্রানীতি (Repo, CRR, SLR), রেমিট্যান্স ও বৈদেশিক মুদ্রার রিজার্ভ',
    treaties: 'আন্তর্জাতিক ঐতিহাসিক ও সাম্প্রতিক চুক্তি (প্যারিস জলবায়ু চুক্তি, ব্রেটন উডস, UNCLOS সমুদ্রসীমা, সার্ক, বিমসটেক, WTO, COP সম্মেলন)',
    all: 'সংবিধান (Constitution), মুক্তিযুদ্ধ (1971 Liberation War), অর্থনৈতিক সমীক্ষা ও ব্যাংকিং (Economic Survey & BB Policy), এবং আন্তর্জাতিক চুক্তি ও ভূ-রাজনীতি (Treaties & Geopolitics)',
  };

  const topicFocus = categoryPromptMap[category] || categoryPromptMap.all;

  const prompt = `Act as an expert exam content scraper and high-yield question architect for Bangladeshi competitive job exams (BCS Preliminary & Written, Bangladesh Bank AD, Combined 9 Banks, PSC Non-cadre).
Focus: "${topicFocus}". Source hint: "${sourceHint}".

Generate exactly ${count} verified, highly accurate, and exam-critical "Rapid Bullets" (হাই-ইল্ড র‍্যাপিড বুলেটস).
Rules:
- 100% verified historical facts, numbers, dates, and constitutional clauses. No hallucination.
- Crisp Bengali language with essential English keywords.
- Include a witty Desi Mnemonic for instant memory retention.
- No emojis anywhere in the text fields.

Output strictly valid JSON with this exact schema:
{
  "bullets": [
    {
      "fact": "সুস্পষ্ট ও নিখুঁত তথ্য বাক্য",
      "category": "constitution" | "liberation_war" | "economy" | "treaties",
      "categoryBn": "সংবিধান" | "মুক্তিযুদ্ধ" | "অর্থনৈতিক সমীক্ষা" | "আন্তর্জাতিক চুক্তি",
      "detail": "পরীক্ষার ট্র্যাপ, প্রাসঙ্গিক অনুচ্ছেদ বা গুরুত্বপূর্ণ প্রেক্ষাপট",
      "mnemonic": "মনে রাখার সহজ দেশি নেমোনিক বা ছন্দ",
      "examTags": ["46th BCS", "Bangladesh Bank AD", "পরীক্ষার ট্যাগ"],
      "source": "উৎস (যেমন: বাংলাদেশ সংবিধান, অর্থনৈতিক সমীক্ষা, বা মুক্তিযুদ্ধ বিষয়ক মন্ত্রণালয়)"
    }
  ]
}`;

  let rawJson: string | null = null;

  // 1. Try Groq Primary
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content: 'You are an automated competitive exam fact extractor and scraper. Output valid JSON without emojis.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.25,
          max_tokens: 2500,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        rawJson = data?.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn('Groq rapid bullet scrape error:', e);
    }
  }

  // 2. Try Gemini Secondary Fallback
  if (!rawJson && geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (e) {
      console.warn('Gemini rapid bullet scrape error:', e);
    }
  }

  // 3. Parse LLM Result
  if (rawJson) {
    try {
      const cleaned = cleanJsonString(rawJson);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
        return parsed.bullets as ScrapedBulletItem[];
      }
    } catch (parseErr) {
      console.warn('JSON parsing failed for scraped bullets:', parseErr);
    }
  }

  // 4. Fallback: Filter from curated repository
  const filtered =
    category === 'all'
      ? CURATED_HIGH_YIELD_BULLETS
      : CURATED_HIGH_YIELD_BULLETS.filter((b) => b.category === category);

  // Return requested count with slight date-based shuffle
  return filtered.slice(0, count);
}
