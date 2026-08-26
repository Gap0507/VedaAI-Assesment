import { Sparkles } from "lucide-react";

export function ExtractingView() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white/50 rounded-3xl animate-in fade-in zoom-in duration-500">
      <div className="relative text-[#FF5623] mb-6">
        {/* Custom sparkle combination to match the image */}
        <div className="flex items-center justify-center">
          <Sparkles size={64} className="animate-pulse" fill="currentColor" strokeWidth={1} />
        </div>
      </div>
      <h2 className="text-[28px] font-bold text-[#2B2B2B] mb-2 tracking-[-0.04em]">
        Extracting...
      </h2>
      <p className="text-[18px] text-[rgba(94,94,94,0.8)] tracking-[-0.04em]">
        This may take a while
      </p>
    </div>
  );
}
