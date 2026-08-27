import { ChevronDown, ChevronUp, X, FileText } from "lucide-react";
import { useState } from "react";
import { Question, Answer, Mapping, AIReport } from "@/types";

interface MappingViewProps {
  questions: Question[];
  answers: Answer[];
  mappings: Mapping[];
  images: string[];
  aiReport?: AIReport;
}

export function MappingView({ questions, answers, mappings, images, aiReport }: MappingViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(80);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'questions' | 'answers'>('questions');

  // Derive which answers are mapped to the currently expanded question
  const activeMappings = mappings.filter((m) => m.questionId === expandedId);
  const activeAnswers = answers.filter((a) => activeMappings.some((m) => m.answerIds?.includes(a.id)));

  // Auto-navigate to the page of the first matched answer when expanding
  const handleToggleExpand = (qId: string) => {
    if (expandedId === qId) {
      setExpandedId(null);
    } else {
      setExpandedId(qId);
      const qMappings = mappings.filter((m) => m.questionId === qId);
      const firstAnswer = answers.find((a) => qMappings.some((m) => m.answerIds?.includes(a.id)));
      if (firstAnswer) {
        // Automatically switch to answers tab on mobile when a question is clicked
        setMobileTab('answers');
        setTimeout(() => {
          const el = document.getElementById(`box-${firstAnswer.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    }
  };

  // Calculate totals for report
  const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);
  const earnedMarks = mappings.reduce((acc, m) => acc + (m.earnedMarks || 0), 0);
  const percentage = totalMarks > 0 ? ((earnedMarks / totalMarks) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-2 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-3 px-3 pb-3 relative">
      
      {/* Mobile Tabs */}
      <div className="md:hidden flex w-full bg-[#E9E5E5] rounded-xl p-1 shrink-0">
        <button 
          onClick={() => setMobileTab('questions')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === 'questions' ? 'bg-[#303030] shadow text-white' : 'text-[#5E5E5E]'}`}
        >
          Questions
        </button>
        <button 
          onClick={() => setMobileTab('answers')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === 'answers' ? 'bg-[#303030] shadow text-white' : 'text-[#5E5E5E]'}`}
        >
          Answer Sheet
        </button>
      </div>

      {/* ── Left Column: Questions ── */}
      <div className={`w-full md:w-[45%] flex-col h-full bg-white/50 backdrop-blur-sm md:rounded-[24px] rounded-xl p-2 md:p-4 border border-white/40 shadow-sm ${mobileTab === 'questions' ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="font-bold text-[16px] text-[#2B2B2B] tracking-[-0.04em]">
            Extracted Questions <span className="font-normal text-[#5E5E5E]">(from question paper)</span>
          </h2>
          {aiReport && (
            <button 
              onClick={() => setShowReport(true)}
              className="bg-[#1C2024] text-white px-4 py-1.5 rounded-full text-[13px] font-semibold shadow-sm hover:bg-black transition-colors flex items-center gap-2"
            >
              <FileText size={14} /> View AI Report
            </button>
          )}
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
                className={`bg-white rounded-[20px] p-4 flex flex-col shadow-sm cursor-pointer transition-all ${isExpanded
                    ? "border-[1px] border-[#FF5623] border-l-4"
                    : "border-[1.5px] border-[#CECECE] hover:border-gray-300"
                  }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-start gap-4 pr-4 pl-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-sm mt-0.5 ${isExpanded ? "bg-[#FF5623] text-white" : "bg-[#4D4D4D] text-white"
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
                      {hasAnswer ? (isReview ? "Review" : `${qMappings[0].earnedMarks}/${q.marks}`) : "Missing"}
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
                            {m.feedback || "Answer mapped successfully."}
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

      {/* ── Right Column: Document ── */}
      <div className={`w-full md:w-[55%] h-full flex-col items-center bg-[#F6F6F6] md:rounded-[24px] rounded-xl border border-[#EAEAEA] relative overflow-hidden shadow-inner ${mobileTab === 'answers' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Controls Overlay */}
        <div className="absolute top-4 inset-x-0 z-20 px-6 flex justify-between items-center pointer-events-none">
          <div className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 pointer-events-auto">
            Answer Sheet
            <span className="text-gray-400 font-normal ml-2">{images.length} Pages</span>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            {/* Zoom Controls */}
            <div className="bg-[#303030] text-white text-[13px] font-semibold px-3 py-2 rounded-lg shadow-md flex items-center gap-3">
              <span className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setZoom(z => Math.max(30, z - 10))}>-</span>
              <span className="w-10 text-center">{zoom}%</span>
              <span className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setZoom(z => Math.min(200, z + 10))}>+</span>
            </div>
          </div>
        </div>

        {/* Spatial Canvas / Continuous Scroll Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center pt-20 pb-20 gap-8 custom-scrollbar relative">
          {images.length > 0 ? (
            images.map((imgSrc, idx) => {
              const pageNum = idx + 1;
              return (
                <div
                  key={pageNum}
                  className="relative shadow-xl bg-white flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
                  style={{ width: `${zoom}%`, minWidth: '300px' }}
                >
                  <div className="absolute -left-10 top-0 bg-[#303030] text-white text-xs px-2 py-1 rounded shadow-md z-10">
                    Pg {pageNum}
                  </div>
                  <img src={imgSrc} alt={`Answer Sheet Page ${pageNum}`} className="block w-full h-auto pointer-events-none" />
                  
                  {activeAnswers.filter((ans) => ans.page === pageNum).map((ans) => {
                      const x = Math.min(1, Math.max(0, ans.boundingBox.x > 1 ? ans.boundingBox.x / 1000 : ans.boundingBox.x));
                      const y = Math.min(1, Math.max(0, ans.boundingBox.y > 1 ? ans.boundingBox.y / 1000 : ans.boundingBox.y));
                      const width = Math.min(1, Math.max(0, ans.boundingBox.width > 1 ? ans.boundingBox.width / 1000 : ans.boundingBox.width));
                      const height = Math.min(1, Math.max(0, ans.boundingBox.height > 1 ? ans.boundingBox.height / 1000 : ans.boundingBox.height));
                      return (
                        <div
                          key={ans.id}
                          id={`box-${ans.id}`}
                          className="absolute border-4 border-[#FF5623] bg-[#FF5623]/20 animate-in fade-in duration-500 shadow-[0_0_15px_rgba(255,86,35,0.4)]"
                          style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` }}
                        />
                      );
                  })}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
              <p className="text-[#5E5E5E] font-medium text-[15px]">No answer sheet pages found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Report Modal ── */}
      {showReport && aiReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] w-full max-w-4xl rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[#EAEAEA] flex justify-between items-start bg-white">
              <div>
                <h2 className="text-2xl font-bold text-[#1C2024]">Vikram</h2>
                <p className="text-[#5E5E5E] text-sm mt-1">Roll 37 • Class 9 • Mathematics</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-3xl font-black text-[#1C2024] tracking-tight">{earnedMarks}<span className="text-[#5E5E5E] text-xl font-medium">/{totalMarks}</span></div>
                  <div className="text-[#5E5E5E] text-sm font-semibold">{percentage}%</div>
                </div>
                <button onClick={() => setShowReport(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors text-gray-500 hover:text-black">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 flex flex-col gap-6 min-h-0">
              
              {/* Strengths & Improvements */}
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5">
                  <h4 className="text-[#166534] text-xs font-bold tracking-wider mb-2 flex items-center gap-2">✓ STRENGTHS</h4>
                  <p className="text-[#15803D] text-[14px] leading-relaxed font-medium">{aiReport.strengths}</p>
                </div>
                <div className="bg-[#FFFBEB] border border-[#FEF08A] rounded-xl p-5">
                  <h4 className="text-[#92400E] text-xs font-bold tracking-wider mb-2 flex items-center gap-2">△ AREAS FOR IMPROVEMENT</h4>
                  <p className="text-[#B45309] text-[14px] leading-relaxed font-medium">{aiReport.improvements}</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-[#EAEAEA] bg-white shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 shadow-sm">
                      <tr className="bg-[#0F172A] text-white">
                        <th className="py-3 px-4 text-xs font-bold tracking-wider uppercase">Q</th>
                        <th className="py-3 px-4 text-xs font-bold tracking-wider uppercase w-24">Marks</th>
                        <th className="py-3 px-4 text-xs font-bold tracking-wider uppercase w-32">Error Type</th>
                        <th className="py-3 px-4 text-xs font-bold tracking-wider uppercase">What the AI Found</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                    {questions.map((q) => {
                      const qMap = mappings.find(m => m.questionId === q.id);
                      const errType = qMap?.errorType || "Unmatched";
                      
                      let errPillColor = "bg-gray-100 text-gray-700 border-gray-200";
                      if (errType.toLowerCase().includes("no error") || errType.toLowerCase().includes("correct")) errPillColor = "bg-green-50 text-green-700 border-green-200";
                      else if (errType.toLowerCase().includes("not attempted") || errType.toLowerCase().includes("missing")) errPillColor = "bg-gray-100 text-gray-500 border-gray-200";
                      else if (errType.toLowerCase().includes("incomplete") || errType.toLowerCase().includes("partial")) errPillColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
                      else errPillColor = "bg-red-50 text-red-700 border-red-200";

                      return (
                        <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 text-sm font-bold text-[#1C2024] align-top whitespace-nowrap">{q.number}</td>
                          <td className="py-4 px-4 text-sm text-[#5E5E5E] align-top whitespace-nowrap">
                            {qMap?.earnedMarks || 0}/{q.marks}
                          </td>
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border ${errPillColor}`}>
                              {errType}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[13px] text-[#303030] leading-relaxed align-top">
                            {qMap?.feedback || "Not attempted."}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
