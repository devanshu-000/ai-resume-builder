import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function downloadPDF(
  elementId: string,
  filename: string = "resume.pdf"
) {
  const element = document.getElementById(elementId)

  if (!element) {
    console.error("PDF element not found")
    return
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")

    // ✅ jsPDF v4 uses object config, not positional args
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = (canvas.height * pageWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight)
    pdf.save(filename)
  } catch (error) {
    console.error("PDF generation failed:", error)
  }
}