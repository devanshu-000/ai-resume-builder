"use client"

import { useRef } from "react"
import { downloadPDF } from "@/lib/pdfExport"
import ResumeScore from "@/src/components/resume/ResumeScore"

interface Props {
  content: string
}

export default function ResumePreview({ content }: Props) {
  const previewRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    if (previewRef.current) {
      downloadPDF("resume-preview")
    }
  }

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

      {/* Download Button */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleDownload}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* Score Section */}
      <ResumeScore resumeContent={content} />
    </div>
  )
}