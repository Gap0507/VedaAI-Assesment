"use client";

import { Upload, ArrowRight, Clock, Settings, Zap, Cog } from "lucide-react";
import Image from "next/image";

/* Each icon orbits at the same radius but starts at a different angle */
const orbitIcons = [
  { Icon: Clock, delay: "0s", startAngle: 315 },      // top-right
  { Icon: Cog, delay: "-3s", startAngle: 200 },        // left
  { Icon: Zap, delay: "-6s", startAngle: 30 },         // right-bottom area
  { Icon: Settings, delay: "-9s", startAngle: 140 },   // bottom-left
];

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4">
      {/* ── Title ── */}
      <div className="flex flex-col items-center gap-1 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[40px] font-bold leading-[120%] tracking-[-0.04em] text-[#2B2B2B]">
            Upload
          </h1>
          <span className="text-[40px] font-bold leading-[120%] tracking-[-0.04em] text-[#FF5623] bg-[rgba(255,147,80,0.15)] px-2 py-1 rounded-lg">
            Question Paper &amp; Answer Sheets
          </span>
        </div>
        <p className="text-[20px] font-normal leading-[140%] tracking-[-0.04em] text-[#303030]">
          Upload both files to get started
        </p>
      </div>

      {/* ── Avatar graphic with orbiting icons ── */}
      <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-3">
        {/* Outer ring */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[rgba(255,86,35,0.08)]" />
        {/* Inner ring */}
        <div className="absolute w-[155px] h-[155px] rounded-full bg-[rgba(255,86,35,0.18)]" />
        {/* White circle + avatar */}
        <div className="absolute w-[110px] h-[110px] rounded-full bg-white z-10 shadow-sm" />
        <div className="relative w-[110px] h-[110px] rounded-full overflow-hidden z-10">
          <Image
            src="/image.png"
            alt="Teacher avatar"
            width={110}
            height={130}
            className="object-cover object-top w-full h-full scale-[1.25] translate-y-[8px]"
          />
        </div>

        {/* Orbiting icons — each rotates along a circular path */}
        {orbitIcons.map(({ Icon, delay, startAngle }, i) => (
          <div
            key={i}
            className="absolute inset-0 z-20"
            style={{
              animation: `orbit 12s linear infinite`,
              animationDelay: delay,
              ["--orbit-radius" as string]: "95px",
              transform: `rotate(${startAngle}deg) translateX(95px) rotate(-${startAngle}deg)`,
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full flex items-center justify-center shadow-sm border-2 border-white"
              style={{
                background: "linear-gradient(121.62deg, #FB975D 30.95%, #FC5E24 69.77%)",
              }}
            >
              <Icon size={12} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Upload dropzones ── */}
      <div className="bg-[rgba(255,255,255,0.5)] rounded-3xl p-3 max-w-[789px] w-full mb-3">
        <div className="flex gap-4">
          {/* Question Paper */}
          <label className="flex-1 bg-white border-[1.5px] border-dashed border-[#CECECE] rounded-[20px] h-[181px] flex flex-col items-center justify-center cursor-pointer hover:border-[#FF5623]/40 hover:bg-[#FFF8F6] transition-all group">
            <div className="w-10 h-10 rounded-lg border-[1.5px] border-[#CECECE] flex items-center justify-center mb-3 group-hover:border-[#FF5623]/40 transition-colors">
              <Upload size={18} className="text-[#2B2B2B]" strokeWidth={2} />
            </div>
            <p className="text-[16px] font-bold leading-[22px] tracking-[-0.04em] text-[#2B2B2B]">
              Upload <span className="text-[#FF5623]">Question Paper</span>
            </p>
            <p className="text-[14px] font-normal leading-[20px] tracking-[-0.04em] text-[rgba(94,94,94,0.8)] mt-1">
              Max 10MB
            </p>
          </label>

          {/* Answer Sheet */}
          <label className="flex-1 bg-white border-[1.5px] border-dashed border-[#CECECE] rounded-[20px] h-[181px] flex flex-col items-center justify-center cursor-pointer hover:border-[#FF5623]/40 hover:bg-[#FFF8F6] transition-all group">
            <div className="w-10 h-10 rounded-lg border-[1.5px] border-[#CECECE] flex items-center justify-center mb-3 group-hover:border-[#FF5623]/40 transition-colors">
              <Upload size={18} className="text-[#2B2B2B]" strokeWidth={2} />
            </div>
            <p className="text-[16px] font-bold leading-[22px] tracking-[-0.04em] text-[#2B2B2B]">
              Upload <span className="text-[#FF5623]">Answer Sheet</span>
            </p>
            <p className="text-[14px] font-normal leading-[20px] tracking-[-0.04em] text-[rgba(94,94,94,0.8)] mt-1">
              Max 10MB
            </p>
          </label>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className="flex items-center gap-2 bg-[#303030] text-white pl-6 pr-5 py-3 rounded-full border-2 border-[rgba(255,255,255,0.15)] shadow-[0_4px_5px_rgba(0,0,0,0.12)] opacity-50 cursor-not-allowed"
        >
          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.04em]">
            Start Mapping
          </span>
          <ArrowRight size={20} />
        </button>
        <p className="text-[14px] font-normal leading-[22px] tracking-[-0.06em] text-[rgba(94,94,94,0.8)]">
          Once both files are uploaded, you&apos;ll able to map answers with questions
        </p>
      </div>
    </div>
  );
}
