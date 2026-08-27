import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Question, Answer, Mapping } from "@/types";

interface MappingViewProps {
  questions: Question[];
  answers: Answer[];
  mappings: Mapping[];
  images: string[]; // Base64 images for each page
}

export function MappingView({ questions, answers, mappings, images }: MappingViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);

  // Derive which answers are mapped to the currently expanded question
  const activeMappings = mappings.filter((m) => m.questionId === expandedId);
  const activeAnswers = answers.filter((a) => activeMappings.some((m) => m.answerId === a.id));

  // Auto-navigate to the page of the first matched answer when expanding
  const handleToggleExpand = (qId: string) => {
    if (expandedId === qId) {
      setExpandedId(null);
    } else {
      setExpandedId(qId);
      const qMappings = mappings.filter((m) => m.questionId === qId);
      const firstAnswer = answers.find((a) => qMappings.some((m) => m.answerId === a.id));
      if (firstAnswer) {
        setActivePage(firstAnswer.page);
      }
    }
  };

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
          {questions.map((q) => {
            const isExpanded = expandedId === q.id;
            const qMappings = mappings.filter((m) => m.questionId === q.id);
            const hasAnswer = qMappings.length > 0;
            const isReview = qMappings.some((m) => m.status === "review");

            return (
              <div
                key={q.id}
                onClick={() => handleToggleExpand(q.id)}
                className={`bg-white rounded-[20px] p-4 flex flex-col shadow-sm cursor-pointer transition-all ${
                  isExpanded
                    ? "border-[1px] border-[#FF5623] border-l-4"
                    : "border-[1.5px] border-[#CECECE] hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-start gap-4 pr-4 pl-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-sm mt-0.5 ${
                        isExpanded ? "bg-[#FF5623] text-white" : "bg-[#4D4D4D] text-white"
                      }`}
                    >
                      {q.number}
                    </div>
                    <span className="text-[14px] text-[#303030] leading-[20px] mt-1 font-medium">
                      {q.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 mt-1">
                    <span
                      className={`font-bold text-[13px] px-2.5 py-1 rounded-lg ${
                        hasAnswer
                          ? isReview
                            ? "text-yellow-700 bg-yellow-100"
                            : "text-[#0E9043] bg-[#E7F4EC]"
                          : "text-[#D92D20] bg-[#FEE4E2]"
                      }`}
                    >
                      {hasAnswer ? (isReview ? "Review" : `${q.marks} Marks`) : "Unanswered"}
                    </span>
                    {isExpanded ? <ChevronUp size={20} className="text-[#303030]" /> : <ChevronDown size={20} className="text-[#303030]" />}
                  </div>
                </div>

                {/* AI Feedback / Mappings Info */}
                {isExpanded && (
                  <div className="bg-[#FFF8F6] rounded-[16px] p-4 ml-12 mt-2">
                    <h4 className="font-semibold text-[#303030] text-[14px] mb-1.5">AI Feedback</h4>
                    {qMappings.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {qMappings.map((m, idx) => (
                          <p key={idx} className="text-[14px] text-[#5E5E5E] leading-[22px]">
                            {m.reason || "Answer mapped successfully."}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-[#5E5E5E] leading-[22px]">No answer found for this question.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {questions.length === 0 && (
             <div className="text-center text-gray-500 py-10">No questions extracted.</div>
          )}
        </div>
      </div>

      {/* ── Right Column: Answer Sheet Spatial View ── */}
      <div className="flex-1 bg-[#F5F5F5] border-[2px] border-dashed border-[#CECECE] rounded-[24px] flex flex-col relative overflow-hidden shadow-inner">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
            Answer Sheet
            <span className="text-gray-400 font-normal ml-2">Page {activePage} of {images.length || 1}</span>
          </div>
          <div className="flex gap-2">
            {/* Pagination Controls */}
            <div className="bg-[#303030] text-white text-[13px] font-semibold px-3 py-2 rounded-lg shadow-md flex items-center gap-3">
              <span className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setActivePage(p => Math.max(1, p - 1))}>Prev</span>
              <span>{activePage}</span>
              <span className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setActivePage(p => Math.min(images.length, p + 1))}>Next</span>
            </div>
            
            {/* Zoom Controls */}
            <div className="bg-[#303030] text-white text-[13px] font-semibold px-3 py-2 rounded-lg shadow-md flex items-center gap-3">
              <span className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setZoom(z => Math.max(50, z - 10))}>-</span>
              <span>{zoom}%</span>
              <span className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setZoom(z => Math.min(200, z + 10))}>+</span>
            </div>
          </div>
        </div>

        {/* Spatial Canvas / Image */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 relative">
          {images.length > 0 ? (
            <div 
              className="relative shadow-xl bg-white transition-all origin-center" 
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* The underlying page image */}
              <img 
                src={images[activePage - 1]} 
                alt={`Answer Sheet Page ${activePage}`} 
                className="block max-w-full h-auto pointer-events-none" 
              />
              
              {/* Highlight Overlays */}
              {activeAnswers
                .filter((ans) => ans.page === activePage) // Only draw boxes for the current page
                .map((ans) => {
                  const { x, y, width, height } = ans.boundingBox;
                  return (
                    <div
                      key={ans.id}
                      className="absolute border-4 border-[#FF5623] bg-[#FF5623]/20 animate-in fade-in"
                      style={{
                        left: `${x * 100}%`,
                        top: `${y * 100}%`,
                        width: `${width * 100}%`,
                        height: `${height * 100}%`,
                      }}
                    />
                  );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 opacity-50">
              <p className="text-[#5E5E5E] font-medium text-[15px]">No answer sheet pages found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
