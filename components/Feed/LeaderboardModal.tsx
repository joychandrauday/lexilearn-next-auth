'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Tag, Progress } from 'antd';
import {
  TrophyOutlined,
  CrownFilled,
  FireOutlined,
  CheckCircleFilled,
  PlusOutlined,
  StarFilled,
  ThunderboltFilled,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface LeaderboardItem {
  rank: number;
  name: string;
  email: string;
  points: number;
  contributionsCount: number;
  badges: string[];
  role: string;
}

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  onOpenCreateModal: () => void;
}

export default function LeaderboardModal({
  open,
  onClose,
  userEmail,
  onOpenCreateModal,
}: LeaderboardModalProps) {
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [rewardRules, setRewardRules] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open, userEmail]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/feed/leaderboard', {
        params: { userEmail },
      });
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard || []);
        setUserStats(res.data.userStats);
        setRewardRules(res.data.rewardRules || []);
      }
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
          <CrownFilled />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-gray-200 text-slate-900 flex items-center justify-center font-black text-xs shadow-sm">
          ২
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
          ৩
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="rounded-3xl overflow-hidden font-sans"
    >
      <div className="p-2 space-y-4">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 mb-1.5">
              <TrophyOutlined className="text-amber-400" />
              <span>কমিউনিটি কন্ট্রিবিউটর লিডারবোর্ড</span>
            </div>
            <h3 className="text-xl font-black text-white m-0">সেরা প্রস্তুতি সহায়কদের সম্মাননা</h3>
            <p className="text-xs text-emerald-100/80 m-0 mt-1 max-w-md">
              শব্দ, পরীক্ষার অভিজ্ঞতা ও জটিল প্রশ্নের ব্যাখ্যা শেয়ার করে পয়েন্ট অর্জন করুন এবং বিসিএস কমিউনিটিতে সেরা কন্ট্রিবিউটর হিসেবে সম্মানিত হোন।
            </p>
          </div>
        </div>

        {/* User's Own Gamification Stats */}
        {userStats && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-black text-emerald-950">আপনার র‍্যাংক: #{userStats.rank}</span>
                <Tag color="green" className="rounded-md font-bold text-[10px] m-0">
                  {userStats.points} XP
                </Tag>
              </div>
              <p className="text-[11px] text-emerald-800 m-0">
                পরবর্তী পদক পেতে আর <span className="font-bold">{userStats.pointsToNext} XP</span> প্রয়োজন।
              </p>
            </div>

            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl text-xs h-8 px-3 border-0 shadow-xs shrink-0"
            >
              শেয়ার করে XP নিন
            </Button>
          </div>
        )}

        {/* Reward Rules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block text-[11px]">নতুন শব্দ ও নেমোনিক</span>
            <span className="text-emerald-700 font-black text-xs">+৫০ XP • ভোকাব হিরো</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block text-[11px]">বিগত পরীক্ষার ট্যাগ (Tag)</span>
            <span className="text-emerald-700 font-black text-xs">+৫০ XP • ট্যাগ স্পেশালিস্ট</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block text-[11px]">প্রস্তুতি অভিজ্ঞতা শেয়ার</span>
            <span className="text-emerald-700 font-black text-xs">+৪০ XP • মেন্টর পদক</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block text-[11px]">কনফিউজিং MCQ কুইজ</span>
            <span className="text-emerald-700 font-black text-xs">+৩৫ XP • কুইজ মাস্টার</span>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center">
              <Spin />
              <p className="text-xs text-gray-400 mt-2 font-bold">লিডারবোর্ড লোড হচ্ছে...</p>
            </div>
          ) : (
            leaderboard.map((item) => (
              <div
                key={item.rank}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                  item.rank === 1
                    ? 'bg-amber-50/70 border-amber-200'
                    : item.rank <= 3
                    ? 'bg-slate-50 border-gray-200'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {getRankBadge(item.rank)}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-gray-900">{item.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {item.badges.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.2 rounded"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-xs text-emerald-700 block">{item.points} XP</span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {item.contributionsCount}টি পোস্ট/শব্দ
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
