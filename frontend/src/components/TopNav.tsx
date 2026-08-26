"use client";

import {
  ArrowLeft,
  Bell,
  HelpCircle,
  ChevronDown,
  FileSpreadsheet,
  Sparkle,
} from "lucide-react";

export function TopNav() {
  return (
    <div className="flex items-center h-14 mx-3 mt-3 px-2 pl-6 bg-white/75 backdrop-blur-sm rounded-2xl shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition">
          <ArrowLeft size={20} className="text-[#303030]" />
        </button>
      </div>

      {/* Center breadcrumb area */}
      <div className="flex items-center gap-2 ml-4">
        <FileSpreadsheet size={20} className="text-[#A9A9A9]" />
        <span className="text-[16px] font-semibold tracking-[-0.04em] text-[#A9A9A9]">
          Exams
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <button className="w-9 h-9 flex items-center justify-center bg-[#F6F6F6] rounded-full hover:bg-gray-200 transition">
          <HelpCircle size={20} className="text-[#303030]" />
        </button>

        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center bg-[#F6F6F6] rounded-full hover:bg-gray-200 transition relative">
          <Bell size={20} className="text-[#303030]" />
          <span className="absolute top-[1px] right-[1px] w-2 h-2 bg-[#FF5623] rounded-full" />
        </button>

        {/* Sparkle */}
        <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition">
          <div className="w-5 h-5 bg-[#2B2B2B] rounded flex items-center justify-center shadow-[inset_0_0_4px_rgba(255,255,255,0.4)]">
            <Sparkle size={11} className="text-white" />
          </div>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/60 transition ml-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
            <img
              src="/image.png"
              alt="Madhur Rastogi"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-[16px] leading-[19px] tracking-[-0.04em] text-[#303030]">
            Madhur Rastogi
          </span>
          <ChevronDown size={20} className="text-[#303030]" />
        </div>
      </div>
    </div>
  );
}
