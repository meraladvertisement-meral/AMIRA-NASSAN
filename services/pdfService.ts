
import { jsPDF } from 'jspdf';
import { QuizRecord } from '../types/quiz';

const pxPerMm = 3.78; // Standard conversion factor for 96 DPI
// Regex for Arabic, Persian, and related RTL scripts
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

/**
 * pdfService handles the generation of printable Exam PDFs.
 * Updated: 
 * - Precise RTL detection for Arabic script ranges.
 * - Latin/Turkish correctly forced to LTR.
 * - Sanitization to prevent jsPDF crashes on emojis/unsupported Unicode.
 */
export const pdfService = {
  /**
   * Detects if a string contains characters that jsPDF standard fonts cannot handle (non-Latin-1).
   */
  needsImageRendering(text: string): boolean {
    if (!text) return false;
    // Detects anything outside standard ISO-8859-1 (Latin-1)
    return /[^\x00-\xFF]/.test(text);
  },

  /**
   * Renders text to a Data URL via Canvas to handle complex scripts like Arabic (Shaping + RTL).
   */
  renderComplexTextToImage(text: string, maxWidthMm: number, fontPx: number, isBold: boolean): { dataUrl: string, wMm: number, hMm: number } | null {
    if (!text || !text.trim()) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const maxWidthPx = Math.max(1, maxWidthMm * pxPerMm);
    const fontWeight = isBold ? 'bold' : 'normal';
    // Use system fonts that support a wide range of Unicode
    const fontStack = `${fontWeight} ${fontPx}px "Fredoka", "Arial", "sans-serif"`;
    
    ctx.font = fontStack;
    
    // Core Logic: Only trigger RTL if Arabic script characters are present.
    // Turkish/Latin will default to LTR.
    const isRtl = ARABIC_REGEX.test(text);
    ctx.direction = isRtl ? 'rtl' : 'ltr';
    ctx.textAlign = isRtl ? 'right' : 'left';

    // Wrapping logic
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? (isRtl ? `${words[i]} ${currentLine}` : `${currentLine} ${words[i]}`) : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidthPx && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const lineHeight = fontPx * 1.4;
    canvas.width = maxWidthPx;
    canvas.height = Math.max(1, lines.length * lineHeight);

    // Reset context properties after resize
    ctx.font = fontStack;
    ctx.direction = isRtl ? 'rtl' : 'ltr';
    ctx.textAlign = isRtl ? 'right' : 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000000';

    lines.forEach((line, index) => {
      const xPos = isRtl ? canvas.width : 0;
      ctx.fillText(line, xPos, index * lineHeight);
    });

    return {
      dataUrl: canvas.toDataURL('image/png'),
      wMm: canvas.width / pxPerMm,
      hMm: canvas.height / pxPerMm
    };
  },

  async generateExamPdf(quiz: QuizRecord, includeAnswerKey: boolean = false): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    const checkPage = (heightNeeded: number) => {
      if (y + heightNeeded > 275) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    const addTextBlock = (text: string, fontSize: number, isBold: boolean = false) => {
      if (!text || !text.trim()) return;

      if (this.needsImageRendering(text)) {
        // Complex scripts (Arabic, Turkish specials, Emojis) go through Canvas
        const render = this.renderComplexTextToImage(text, contentWidth, fontSize * 1.5, isBold);
        if (render) {
          checkPage(render.hMm);
          const isAr = ARABIC_REGEX.test(text);
          // If Arabic, align to right margin, otherwise align to left margin (e.g. Turkish specials)
          const xPos = isAr ? (pageWidth - margin - render.wMm) : margin;
          doc.addImage(render.dataUrl, 'PNG', xPos, y, render.wMm, render.hMm, undefined, 'FAST');
          y += render.hMm + 2;
        }
      } else {
        // Standard Latin-1 rendering
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        
        // Safety: Replace anything not in Latin-1 to prevent jsPDF metric crashes
        const sanitized = text.replace(/[^\x00-\xFF]/g, '?');
        const lines = doc.splitTextToSize(sanitized, contentWidth);
        const textHeight = lines.length * (fontSize * 0.5);
        
        checkPage(textHeight + 5);
        doc.text(lines, margin, y + (fontSize * 0.3));
        y += textHeight + 4;
      }
    };

    // --- Header ---
    // Detect if the quiz primary language is Arabic for the header translation
    const isAr = ARABIC_REGEX.test(quiz.questions[0]?.prompt || '');
    const titleText = isAr ? 'SnapQuizGame — امتحان' : 'SnapQuizGame — Exam';
    addTextBlock(titleText, 22, true);
    addTextBlock(`ID: ${quiz.id} | ${new Date().toLocaleDateString()}`, 10);
    
    y += 5;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const nameLabel = isAr ? 'الاسم: _________________________________' : 'Name: _________________________________';
    const dateLabel = isAr ? 'التاريخ: ____________    الفصل: ____________' : 'Date: ____________    Class: ____________';
    addTextBlock(nameLabel, 12);
    addTextBlock(dateLabel, 12);
    y += 5;

    // --- Questions ---
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      checkPage(30);
      
      const qLabel = isAr ? `سؤال ${i + 1}:` : `Question ${i + 1}:`;
      addTextBlock(qLabel, 10, true);
      addTextBlock(q.prompt, 12, true);
      
      if (q.type === 'MCQ' || q.type === 'TF') {
        const options = q.options || [];
        for (let j = 0; j < options.length; j++) {
          const opt = options[j];
          checkPage(10);
          const letter = isAr ? `${String.fromCharCode(0x0623 + j)}) ` : `${String.fromCharCode(65 + j)}) `;
          addTextBlock(letter + opt, 11);
        }
      } else if (q.type === 'FITB') {
        checkPage(15);
        doc.setDrawColor(220);
        doc.line(margin, y + 5, pageWidth - margin, y + 5);
        y += 12;
      }
      y += 4;
    }

    // --- Answer Key ---
    if (includeAnswerKey) {
      doc.addPage();
      y = margin;
      addTextBlock(isAr ? 'مفتاح الإجابة' : 'Answer Key', 18, true);
      y += 10;

      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        const ans = isAr ? `${i + 1}. الإجابة: ${q.correctAnswer}` : `${i + 1}. Answer: ${q.correctAnswer}`;
        addTextBlock(ans, 12);
      }
    }

    return doc.output('blob');
  }
};
