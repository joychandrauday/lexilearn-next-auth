'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Avatar,
  Spin,
  Tag,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CompassOutlined,
  BookOutlined,
  CheckCircleFilled,
  SaveOutlined,
  EnvironmentOutlined,
  BankOutlined,
  FireOutlined,
  TrophyOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useSession, signIn } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [targetExam, setTargetExam] = useState('বিসিএস প্রিলিমিনারি (BCS)');
  const [preparationStage, setPreparationStage] = useState<'প্রিলিমিনারি' | 'রিটেন' | 'ভাইভা' | 'বিগিনার'>('প্রিলিমিনারি');
  const [district, setDistrict] = useState('ঢাকা');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number>(20);
  const [bio, setBio] = useState('লক্ষ্য: বিসিএস ও প্রথম শ্রেণির সরকারি চাকরি');

  // Stats
  const [stats, setStats] = useState({
    savedWordsCount: 0,
    notebookItemsCount: 0,
    streak: 0,
    level: 1,
    xp: 0,
  });

  const activeEmail =
    session?.user?.email ||
    (typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') : null);

  const fetchProfile = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/user/profile', {
        params: { email: targetEmail },
      });

      if (res.data.success && res.data.profile) {
        const p = res.data.profile;
        setName(p.name || session?.user?.name || '');
        setEmail(p.email || targetEmail);
        setImage(p.image || session?.user?.image || '');
        if (p.targetExam) setTargetExam(p.targetExam);
        if (p.preparationStage) setPreparationStage(p.preparationStage);
        if (p.district) setDistrict(p.district);
        if (p.institution) setInstitution(p.institution);
        if (p.phone) setPhone(p.phone);
        if (p.address) setAddress(p.address);
        if (p.dailyGoal) setDailyGoal(p.dailyGoal);
        if (p.bio) setBio(p.bio);
        if (res.data.stats) setStats(res.data.stats);

        // Keep localStorage name synced
        if (typeof window !== 'undefined' && p.name) {
          localStorage.setItem('lexi_user_name', p.name);
        }
      }
    } catch {
      toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEmail) {
      fetchProfile(activeEmail);
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [activeEmail, status]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeEmail) {
      toast.error('অনুগ্রহ করে প্রথমে সাইন ইন করুন');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      return;
    }

    if (!name.trim()) {
      toast.error('অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put('/api/user/profile', {
        email: activeEmail,
        name,
        image,
        targetExam,
        preparationStage,
        district,
        institution,
        phone,
        address,
        dailyGoal,
        bio,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'প্রোফাইল সফলভাবে আপডেট হয়েছে!');
        if (typeof window !== 'undefined') {
          localStorage.setItem('lexi_user_name', name);
        }
      }
    } catch {
      toast.error('প্রোফাইল সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (!activeEmail && !loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-700">
          <UserOutlined className="text-2xl" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">আপনার প্রোফাইল</h2>
        <p className="text-xs text-gray-500 mb-6">
          প্রোফাইল দেখতে এবং তথ্য আপডেট করতে অনুগ্রহ করে গুগল দিয়ে সাইন ইন করুন।
        </p>
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => signIn('google')}
          className="bg-emerald-600 font-bold rounded-xl h-11 px-8 text-xs"
        >
          গুগল দিয়ে লগইন করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      {loading ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Spin size="large" />
          <p className="mt-3 text-xs text-gray-400 font-bold">প্রোফাইল লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Profile Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-emerald-400/60 object-cover shadow-md"
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-emerald-600 border-2 border-emerald-400/60 shrink-0"
                    size={64}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-black text-white m-0 tracking-tight">
                      {name || 'শিক্ষার্থী'}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      <CheckCircleFilled className="text-emerald-400" /> ভেরিফাইড
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-mono m-0 mt-0.5">{email}</p>
                  <p className="text-xs text-emerald-200/90 m-0 mt-1.5 font-medium">{bio}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSaveProfile}
                  className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-xl h-11 px-6 text-xs shadow-md border-0"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </Button>
              </div>
            </div>

            {/* Aspirant Telemetry Stats */}
            <div className="grid grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-gray-400 block">সংরক্ষিত শব্দ</span>
                <span className="text-lg md:text-xl font-black text-white">{stats.savedWordsCount}টি</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-gray-400 block">নোটবুক টপিক</span>
                <span className="text-lg md:text-xl font-black text-emerald-400">{stats.notebookItemsCount}টি</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-gray-400 block">স্টাডি স্ট্রিক</span>
                <span className="text-lg md:text-xl font-black text-amber-300">{stats.streak} দিন</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-gray-400 block">লার্নিং লেভেল</span>
                <span className="text-lg md:text-xl font-black text-teal-300">লেভেল {stats.level}</span>
              </div>
            </div>
          </div>

          {/* Profile Form Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
            <h3 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2">
              <EditOutlined className="text-emerald-600" />
              <span>ব্যক্তিগত ও প্রস্তুতি তথ্য হালনাগাদ</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">আপনার পূর্ণ নাম:</label>
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: জয় চন্দ্র উদয়"
                    className="rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ইমেইল অ্যাড্রেস:</label>
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    value={email}
                    disabled
                    className="rounded-xl p-2.5 text-xs font-mono bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Exam */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">টার্গেট পরীক্ষা:</label>
                  <Select
                    value={targetExam}
                    onChange={(val) => setTargetExam(val)}
                    className="w-full text-xs"
                    options={[
                      { label: '৪৭তম বিসিএস প্রিলিমিনারি ও রিটেন', value: '৪৭তম বিসিএস (BCS)' },
                      { label: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)', value: 'বাংলাদেশ ব্যাংক এডি (BB AD)' },
                      { label: 'সমন্বিত ৮ ব্যাংক সিনিয়র অফিসার', value: 'সমন্বিত ব্যাংক (Combined Bank)' },
                      { label: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক', value: 'প্রাইমারি শিক্ষক নিয়োগ' },
                      { label: 'এনটিআরসিএ (NTRCA) শিক্ষক নিবন্ধন', value: 'শিক্ষক নিবন্ধন (NTRCA)' },
                      { label: 'সকল সরকারি চাকরি (General Gov)', value: 'সাধারণ প্রস্তুতি' },
                    ]}
                  />
                </div>

                {/* Preparation Stage */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">প্রস্তুতির বর্তমান পর্যায়:</label>
                  <Select
                    value={preparationStage}
                    onChange={(val) => setPreparationStage(val)}
                    className="w-full text-xs"
                    options={[
                      { label: 'প্রিলিমিনারি প্রস্তুতি (Prelims Focus)', value: 'প্রিলিমিনারি' },
                      { label: 'রিটেন প্রস্তুতি (Written Focus)', value: 'রিটেন' },
                      { label: 'ভাইভা প্রস্তুতি (Viva Candidate)', value: 'ভাইভা' },
                      { label: 'নতুন শুরু করেছি (Beginner Aspirant)', value: 'বিগিনার' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* District */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">নিজ জেলা:</label>
                  <Input
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="যেমন: ঢাকা / চট্টগ্রাম / রাজশাহী"
                    className="rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">বিশ্ববিদ্যালয় বা শিক্ষাপ্রতিষ্ঠান:</label>
                  <Input
                    prefix={<BankOutlined className="text-gray-400" />}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়, চুয়েট, জাতীয় বিশ্ববিদ্যালয়"
                    className="rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">যোগাযোগ নম্বর (ঐচ্ছিক):</label>
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 017xxxxxxxx"
                    className="rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                {/* Daily Goal */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">দৈনিক শব্দ ও প্রশ্ন লক্ষ্যমাত্রা:</label>
                  <Select
                    value={dailyGoal}
                    onChange={(val) => setDailyGoal(val)}
                    className="w-full text-xs"
                    options={[
                      { label: '১০টি শব্দ ও প্রশ্ন / দিন', value: 10 },
                      { label: '২০টি শব্দ ও প্রশ্ন / দিন (সুপারিশকৃত)', value: 20 },
                      { label: '৩০টি শব্দ ও প্রশ্ন / দিন', value: 30 },
                      { label: '৫০টি শব্দ ও প্রশ্ন / দিন (ইনটেন্সিভ)', value: 50 },
                    ]}
                  />
                </div>
              </div>

              {/* Bio / Motto */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">প্রস্তুতির মূলমন্ত্র বা লক্ষ্য (Bio / Motto):</label>
                <Input.TextArea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="যেমন: লক্ষ্য: ৪৭তম বিসিএস প্রশাসন ক্যাডার, নিয়মিত অধ্যবসায়ই সাফল্যের চাবিকাঠি।"
                  className="rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">বর্তমান ঠিকানা:</label>
                <Input
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: মিরপুর, ঢাকা"
                  className="rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-11 px-8 text-xs shadow-md"
                >
                  সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
