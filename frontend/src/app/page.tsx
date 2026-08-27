"use client";

import { Upload, ArrowRight, Clock, Settings, Zap, Cog, X, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { ExtractingView } from "@/components/ExtractingView";
import { MappingView } from "@/components/MappingView";
import { renderPdfToImages } from "@/utils/pdfRenderer";
import { Question, Answer, Mapping } from "@/types";

/* Each icon orbits at the same radius but starts at a different angle */
const orbitIcons = [
  { Icon: Clock, delay: "0s", startAngle: 315 },
  { Icon: Cog, delay: "-3s", startAngle: 200 },
  { Icon: Zap, delay: "-6s", startAngle: 30 },
  { Icon: Settings, delay: "-9s", startAngle: 140 },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
};




export default function UploadPage() {
  const [qpFile, setQpFile] = useState<File | null>(null);
  const [asFile, setAsFile] = useState<File | null>(null);
  const [qpPages, setQpPages] = useState<number | null>(null);
  const [asPages, setAsPages] = useState<number | null>(null);
  const [isQpLoading, setIsQpLoading] = useState(false);
  const [isAsLoading, setIsAsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [viewState, setViewState] = useState<"upload" | "extracting" | "mapping">("upload");
  const [extractStatus, setExtractStatus] = useState("Preparing to extract...");

  // Output data states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [aiReport, setAiReport] = useState<any>(null);
  const [answerSheetImages, setAnswerSheetImages] = useState<string[]>([]);

  const qpInputRef = useRef<HTMLInputElement>(null);
  const asInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const extractPageCount = async (file: File): Promise<number | null> => {
    if (file.type !== "application/pdf") return null;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error("Failed to parse PDF", error);
      return null;
    }
  };

  const handleQpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File must be less than 10MB");
        return;
      }
      setQpFile(file);
      setIsQpLoading(true);
      const pages = await extractPageCount(file);
      setQpPages(pages);
      setIsQpLoading(false);
      showToast("Question Paper uploaded successfully");
    }
  };

  const handleAsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File must be less than 10MB");
        return;
      }
      setAsFile(file);
      setIsAsLoading(true);
      const pages = await extractPageCount(file);
      setAsPages(pages);
      setIsAsLoading(false);
      showToast("Answer Sheet uploaded successfully");
    }
  };

  const handleRemoveQp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQpFile(null);
    setQpPages(null);
    if (qpInputRef.current) qpInputRef.current.value = "";
    showToast("Question Paper removed successfully");
  };

  const handleRemoveAs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAsFile(null);
    setAsPages(null);
    if (asInputRef.current) asInputRef.current.value = "";
    showToast("Answer Sheet removed successfully");
  };

  const isBothUploaded = qpFile !== null && asFile !== null;

  const handleStartMapping = async () => {
    if (!qpFile || !asFile) return;
    
    setViewState("extracting");
    
    try {
      // 1. Render Question Paper to images (Qwen-VL needs images, not raw PDF)
      setExtractStatus("Rendering Question Paper pages...");
      const qpImages = await renderPdfToImages(qpFile);

      // 2. Extract Questions — send all QP page images in one call
      setExtractStatus("Extracting Questions...");
      const questionsRes = await fetch("/api/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageImages: qpImages })
      });
      if (!questionsRes.ok) {
        const errBody = await questionsRes.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to extract questions");
      }
      const { questions: extractedQuestions } = await questionsRes.json();
      setQuestions(extractedQuestions);

      // 3. Render Answer Sheet to Images
      setExtractStatus("Rendering Answer Sheet pages...");
      const pageImages = await renderPdfToImages(asFile);
      setAnswerSheetImages(pageImages);

      // 4. Extract Answers — one call per page, sent sequentially to respect rate limits
      setExtractStatus(`Extracting Answers (${pageImages.length} pages)...`);
      const allAnswers: Answer[] = [];
      for (let i = 0; i < pageImages.length; i++) {
        setExtractStatus(`Extracting Answers (page ${i + 1} of ${pageImages.length})...`);
        try {
          const res = await fetch("/api/extract-answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: pageImages[i], pageNumber: i + 1 })
          });
          if (!res.ok) {
            console.error(`Failed to extract answers for page ${i + 1}`);
            continue;
          }
          const data = await res.json();
          allAnswers.push(...data.answers);
        } catch (pageErr) {
          console.error(`Error on page ${i + 1}:`, pageErr);
        }
      }
      setAnswers(allAnswers);

      // 5. Map Questions to Answers (local TypeScript logic — no AI call)
      setExtractStatus("Mapping Answers to Questions...");
      const mapRes = await fetch("/api/map-answers", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ questions: extractedQuestions, answers: allAnswers })
      });
      if (!mapRes.ok) throw new Error("Failed to map answers");
      const { mappings: extractedMappings, strengths, improvements } = await mapRes.json();
      setMappings(extractedMappings);
      setAiReport({ strengths, improvements });
      
      // All done!
      setViewState("mapping");

    } catch (error: any) {
      console.error(error);
      showToast(error.message || "An error occurred during processing");
      setViewState("upload"); // Revert on error
    }
  };

  if (viewState === "extracting") {
    return <ExtractingView status={extractStatus} />;
  }

  if (viewState === "mapping") {
    return <MappingView questions={questions} answers={answers} mappings={mappings} images={answerSheetImages} aiReport={aiReport} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 relative">
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
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[rgba(255,86,35,0.08)] pointer-events-none" />
        {/* Inner ring */}
        <div className="absolute w-[155px] h-[155px] rounded-full bg-[rgba(255,86,35,0.18)] pointer-events-none" />
        {/* White circle + avatar */}
        <div className="absolute w-[110px] h-[110px] rounded-full bg-white z-10 shadow-sm pointer-events-none" />
        <div className="relative w-[110px] h-[110px] rounded-full overflow-hidden z-10 pointer-events-none">
          <Image
            src="/image.png"
            alt="Teacher avatar"
            width={110}
            height={130}
            className="object-cover object-top w-full h-full scale-[1.25] translate-y-[8px]"
          />
        </div>

        {/* Orbiting icons */}
        {orbitIcons.map(({ Icon, delay, startAngle }, i) => (
          <div
            key={i}
            className="absolute inset-0 z-20 pointer-events-none"
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

      {/* ── Hidden File Inputs ── */}
      <input 
        type="file" 
        accept=".pdf,image/*" 
        className="hidden" 
        onChange={handleQpChange} 
        ref={qpInputRef}
      />
      <input 
        type="file" 
        accept=".pdf,image/*" 
        className="hidden" 
        onChange={handleAsChange} 
        ref={asInputRef}
      />

      {/* ── Upload dropzones ── */}
      <div className="bg-[rgba(255,255,255,0.5)] rounded-3xl p-3 max-w-[789px] w-full mb-3">
        <div className="flex gap-4">
          
          {/* Question Paper Dropzone */}
          {!qpFile ? (
            <div 
              onClick={() => qpInputRef.current?.click()}
              className="flex-1 bg-white border-[1.5px] border-dashed border-[#CECECE] rounded-[20px] h-[181px] flex flex-col items-center justify-center relative cursor-pointer hover:border-[#FF5623]/40 hover:bg-[#FFF8F6] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg border-[1.5px] border-[#CECECE] flex items-center justify-center mb-3 group-hover:border-[#FF5623]/40 transition-colors">
                <Upload size={18} className="text-[#2B2B2B]" strokeWidth={2} />
              </div>
              <p className="text-[16px] font-bold leading-[22px] tracking-[-0.04em] text-[#2B2B2B]">
                Upload <span className="text-[#FF5623]">Question Paper</span>
              </p>
              <p className="text-[14px] font-normal leading-[20px] tracking-[-0.04em] text-[rgba(94,94,94,0.8)] mt-1">
                Max 10MB
              </p>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-[20px] h-[181px] flex items-center justify-center relative shadow-[0_4px_11.4px_rgba(0,0,0,0.05)] border-[1.5px] border-transparent">
              <div className="bg-[#F6F6F6] rounded-2xl flex items-center px-5 py-4 gap-4 w-[90%]">
                <Image src="/pdf.png" alt="PDF" width={35} height={40} className="shrink-0" />
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-bold text-[#2B2B2B] text-[18px] tracking-[-0.02em] truncate block w-full mb-0.5">{qpFile.name}</span>
                  <div className="flex items-center gap-2 text-[#5E5E5E]/80 text-[15px] font-medium">
                    <span>{formatFileSize(qpFile.size)}</span>
                    <div className="w-[4px] h-[4px] rounded-full bg-[#5E5E5E]/60"></div>
                    {isQpLoading ? (
                      <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Reading PDF...</span>
                    ) : (
                      <span>{qpPages ? `${qpPages} Page${qpPages > 1 ? 's' : ''}` : 'Document'}</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleRemoveQp}
                className="absolute top-4 right-4 w-7 h-7 bg-[#4D4D4D] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#333] transition-colors border-2 border-white z-50 cursor-pointer pointer-events-auto"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          )}

          {/* Answer Sheet Dropzone */}
          {!asFile ? (
            <div 
              onClick={() => asInputRef.current?.click()}
              className="flex-1 bg-white border-[1.5px] border-dashed border-[#CECECE] rounded-[20px] h-[181px] flex flex-col items-center justify-center relative cursor-pointer hover:border-[#FF5623]/40 hover:bg-[#FFF8F6] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg border-[1.5px] border-[#CECECE] flex items-center justify-center mb-3 group-hover:border-[#FF5623]/40 transition-colors">
                <Upload size={18} className="text-[#2B2B2B]" strokeWidth={2} />
              </div>
              <p className="text-[16px] font-bold leading-[22px] tracking-[-0.04em] text-[#2B2B2B]">
                Upload <span className="text-[#FF5623]">Answer Sheet</span>
              </p>
              <p className="text-[14px] font-normal leading-[20px] tracking-[-0.04em] text-[rgba(94,94,94,0.8)] mt-1">
                Max 10MB
              </p>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-[20px] h-[181px] flex items-center justify-center relative shadow-[0_4px_11.4px_rgba(0,0,0,0.05)] border-[1.5px] border-transparent">
              <div className="bg-[#F6F6F6] rounded-2xl flex items-center px-5 py-4 gap-4 w-[90%]">
                <Image src="/pdf.png" alt="PDF" width={35} height={40} className="shrink-0" />
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-bold text-[#2B2B2B] text-[18px] tracking-[-0.02em] truncate block w-full mb-0.5">{asFile.name}</span>
                  <div className="flex items-center gap-2 text-[#5E5E5E]/80 text-[15px] font-medium">
                    <span>{formatFileSize(asFile.size)}</span>
                    <div className="w-[4px] h-[4px] rounded-full bg-[#5E5E5E]/60"></div>
                    {isAsLoading ? (
                      <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Reading PDF...</span>
                    ) : (
                      <span>{asPages ? `${asPages} Page${asPages > 1 ? 's' : ''}` : 'Document'}</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleRemoveAs}
                className="absolute top-4 right-4 w-7 h-7 bg-[#4D4D4D] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#333] transition-colors border-2 border-white z-50 cursor-pointer pointer-events-auto"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleStartMapping}
          disabled={!isBothUploaded}
          className={`flex items-center gap-2 pl-6 pr-5 py-3 rounded-full border-2 transition-all ${
            isBothUploaded
              ? "bg-[#303030] text-white border-[rgba(255,255,255,0.15)] shadow-[0_4px_5px_rgba(0,0,0,0.12)] hover:bg-[#222]"
              : "bg-[#303030]/50 text-white/50 border-white/10 opacity-50 cursor-not-allowed"
          }`}
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

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="absolute bottom-10 right-10 bg-[#303030] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
          {toastMessage.includes("removed") ? (
            <Trash2 size={18} className="text-red-400" />
          ) : (
            <CheckCircle2 size={18} className="text-green-400" />
          )}
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
