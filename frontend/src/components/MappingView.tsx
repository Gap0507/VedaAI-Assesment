import { ChevronDown, ChevronUp } from "lucide-react";

export function MappingView() {
  return (
    <div className="flex h-full w-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-3 px-3 pb-3">
      
      {/* ── Left Column: Questions ── */}
      <div className="w-[45%] flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-[24px] p-4 border border-white/40 shadow-sm">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="font-bold text-[16px] text-[#2B2B2B] tracking-[-0.04em]">
            Extracted Questions <span className="font-normal text-[#5E5E5E]">(from question paper)</span>
          </h2>
          <button className="bg-white border border-[#CECECE] px-4 py-1.5 rounded-full text-[13px] font-semibold text-[#303030] shadow-sm hover:bg-gray-50 transition-colors">
            Expand All
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
          
          {/* Item 1 */}
          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between border-[1.5px] border-[#CECECE] shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-start gap-4 pr-4">
              <div className="w-8 h-8 rounded-full bg-[#4D4D4D] text-white flex items-center justify-center font-bold shrink-0 text-sm">1</div>
              <span className="text-[14px] text-[#303030] leading-[20px] mt-1 font-medium">Which blood vessel carries blood away from the heart?</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#0E9043] font-bold text-[14px] bg-[#E7F4EC] px-2 py-0.5 rounded-md">2/2</span>
              <ChevronDown size={20} className="text-[#303030]" />
            </div>
          </div>

          {/* Item 2 - Expanded */}
          <div className="bg-white rounded-[20px] p-4 flex flex-col border-[1px] border-[#FF5623] border-l-4 shadow-sm relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-4 pr-4 pl-1">
                <div className="w-8 h-8 rounded-full bg-[#FF5623] text-white flex items-center justify-center font-bold shrink-0 text-sm mt-0.5">2</div>
                <span className="text-[14px] text-[#303030] leading-[20px] mt-1 font-medium">Which of the following organelles is primarily involved in photosynthesis?</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 mt-1">
                <span className="text-[#0E9043] font-bold text-[14px] bg-[#E7F4EC] px-2 py-0.5 rounded-md">2/2</span>
                <ChevronUp size={20} className="text-[#303030]" />
              </div>
            </div>
            <div className="bg-[#FFF8F6] rounded-[16px] p-4 ml-12">
              <h4 className="font-semibold text-[#303030] text-[14px] mb-1.5">AI Feedback</h4>
              <p className="text-[14px] text-[#5E5E5E] leading-[22px]">Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between border-[1.5px] border-[#CECECE] shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-start gap-4 pr-4">
              <div className="w-8 h-8 rounded-full bg-[#4D4D4D] text-white flex items-center justify-center font-bold shrink-0 text-sm">3</div>
              <span className="text-[14px] text-[#303030] leading-[20px] mt-1 font-medium">Explain the role of chloroplasts in photosynthesis, naming the main pigments involved.</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#0E9043] font-bold text-[14px] bg-[#E7F4EC] px-2 py-0.5 rounded-md">2/2</span>
              <ChevronDown size={20} className="text-[#303030]" />
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between border-[1.5px] border-[#CECECE] shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-start gap-4 pr-4">
              <div className="w-8 h-8 rounded-full bg-[#4D4D4D] text-white flex items-center justify-center font-bold shrink-0 text-sm">4</div>
              <span className="text-[14px] text-[#303030] leading-[20px] mt-1 font-medium">Describe the flow of blood through the human heart starting from the right atrium.</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#D92D20] font-bold text-[14px] bg-[#FEE4E2] px-2 py-0.5 rounded-md">0/2</span>
              <ChevronDown size={20} className="text-[#303030]" />
            </div>
          </div>

          {/* Item 5 */}
          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between border-[1.5px] border-[#CECECE] shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-start gap-4 pr-4">
              <div className="w-8 h-8 rounded-full bg-[#4D4D4D] text-white flex items-center justify-center font-bold shrink-0 text-sm">5</div>
              <span className="text-[14px] text-[#303030] leading-[20px] mt-1 font-medium">Draw a labelled diagram of an alveolus showing capillaries and air space.</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#0E9043] font-bold text-[14px] bg-[#E7F4EC] px-2 py-0.5 rounded-md">2/2</span>
              <ChevronDown size={20} className="text-[#303030]" />
            </div>
          </div>

        </div>
      </div>

      {/* ── Right Column: Answer Sheet Placeholder ── */}
      <div className="flex-1 bg-white border-[2px] border-dashed border-[#CECECE] rounded-[24px] flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
           <div className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-md">
             Answer Sheet
           </div>
           <div className="flex gap-2">
              <div className="bg-[#303030] text-white text-[13px] font-semibold px-3 py-2 rounded-lg shadow-md flex items-center gap-3">
                 <span className="text-gray-400 hover:text-white cursor-pointer">-</span>
                 <span>100%</span>
                 <span className="text-gray-400 hover:text-white cursor-pointer">+</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-3 opacity-50">
           <div className="w-16 h-16 border-2 border-dashed border-[#A9A9A9] rounded-xl flex items-center justify-center">
             <span className="text-[#A9A9A9] text-2xl font-light">AI</span>
           </div>
           <p className="text-[#5E5E5E] font-medium text-[15px]">AI generated result will be shown here</p>
        </div>
      </div>
    </div>
  );
}
