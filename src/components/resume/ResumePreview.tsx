"use client";

import { useRef, useState } from "react";
import { downloadPDF } from "@/lib/pdfExport";
import ResumeScore from "@/src/components/resume/ResumeScore";

interface Props {
  content: string;
}

export default function ResumePreview({ content }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      await downloadPDF("resume-preview", "my-resume.pdf");
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {/* Preview Box */}
      <div
        ref={previewRef}
        id="resume-preview"
        className="bg-white border rounded-xl p-6 shadow text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed min-h-[400px]"
      >
        {content || "No resume generated yet"}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
        >
          {downloading ? "Generating PDF..." : "⬇ Download PDF"}
        </button>
      </div>

      {/* Score Section */}
      <ResumeScore resumeContent={content} />
    </div>
  );
}