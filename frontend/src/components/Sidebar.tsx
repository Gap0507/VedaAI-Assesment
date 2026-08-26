"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  FileSpreadsheet,
  Library,
  Settings,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "#", active: false },
  { icon: Users, label: "My Classroom", href: "#", active: false },
  { icon: FileText, label: "Assignments", href: "#", active: false },
  { icon: FileSpreadsheet, label: "Exams", href: "#", active: true },
  { icon: Library, label: "My Library", href: "#", active: false },
];

export function Sidebar() {
  return (
    <aside className="w-[304px] shrink-0 h-screen p-3 z-20">
      <div className="h-full bg-white rounded-2xl flex flex-col justify-between p-6 shadow-[0_16px_48px_rgba(0,0,0,0.12),0_32px_48px_rgba(0,0,0,0.2)]">
        {/* ── Top ── */}
        <div className="flex flex-col">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#303030] rounded-[10px] flex items-center justify-center overflow-hidden relative">
                {/* Simple V logo like Figma */}
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                  <path d="M0 0H10V20H0V0Z" fill="white" />
                  <path d="M14 0H24V20H14V0Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-[28px] leading-5 tracking-[-0.06em] text-[#303030]">
                VedaAI
              </span>
            </div>
            <button className="text-[rgba(94,94,94,0.8)] hover:text-[#303030] transition-colors">
              <PanelLeftClose size={20} />
            </button>
          </div>

          {/* AI Toolkit button */}
          <button className="flex items-center justify-center gap-2.5 w-full h-[42px] bg-[#272727] text-white rounded-full mb-14 shadow-[0_16px_48px_rgba(255,255,255,0.12),0_32px_48px_rgba(255,255,255,0.2),inset_0_-1px_3.5px_rgba(177,177,177,0.6),inset_0_0_34.5px_rgba(255,255,255,0.25)] hover:bg-[#333] transition-colors">
            <Sparkles size={16} />
            <span className="text-[16px] font-medium leading-7 tracking-[-0.04em]">
              AI Teacher&apos;s Toolkit
            </span>
          </button>

          {/* Nav */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active
                    ? "bg-[#F0F0F0] text-[#303030] font-medium"
                    : "text-[rgba(94,94,94,0.8)] hover:bg-[#F0F0F0]/50"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[16px] leading-[22px] tracking-[-0.04em]">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Bottom ── */}
        <div className="flex flex-col gap-2">
          <Link
            href="#"
            className="flex items-center gap-2 px-3 py-2 text-[rgba(94,94,94,0.8)] hover:bg-[#F0F0F0]/50 rounded-lg transition-colors"
          >
            <Settings size={20} />
            <span className="text-[16px] leading-[22px] tracking-[-0.04em]">
              Settings
            </span>
          </Link>

          {/* School card */}
          <div className="flex items-center gap-2 bg-[#F0F0F0] p-3 rounded-2xl">
            <div className="w-[59px] h-[60px] shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center border border-gray-200">
              <div className="w-10 h-10 rounded-full border-2 border-green-700 flex items-center justify-center bg-green-50">
                <span className="text-green-800 text-[11px] font-bold tracking-tight">
                  DPS
                </span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[16px] leading-[22px] tracking-[-0.04em] text-[#303030] truncate">
                Delhi Public School
              </span>
              <span className="text-[14px] leading-[20px] tracking-[-0.04em] text-[#5E5E5E] truncate">
                Bokaro Steel City
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
