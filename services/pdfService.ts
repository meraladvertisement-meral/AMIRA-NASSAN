
import { jsPDF } from 'jspdf';
import { QuizRecord } from '../types/quiz';

const pxPerMm = 3.78; 
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const pdfService = {
  needsImageRendering(text: string): boolean {
    if (!text) return false;
    return /[^\x00-\xFF]/.test(text) || ARABIC_REGEX.test(text);
  },

  renderComplexTextToImage(text: string, maxWidthMm: number, fontPx: number, isBold: boolean): { dataUrl: string, wMm: number, hMm: number } | null {
    if (!text || !text.trim()) return null;

    const isRtl = ARABIC_REGEX.test(text);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return null;

    const scaleFactor = 2.5; 
    const maxWidthPx = maxWidthMm * pxPerMm * scaleFactor;
    const scaledFontPx = fontPx * scaleFactor;
    
    const fontWeight = isBold ? '700' : '400';
    const fontStack = `${fontWeight} ${scaledFontPx}px "Fredoka", "Segoe UI", "Tahoma", "Arial", "sans-serif"`;
    
    ctx.font = fontStack;
    ctx.direction = isRtl ? 'rtl' : 'ltr';

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidthPx && i > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const lineHeight = scaledFontPx * 1.4;
    canvas.width = Math.ceil(maxWidthPx);
    canvas.height = Math.ceil(Math.max(1, lines.length * lineHeight));

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      dataUrl: canvas.toDataURL('image/jpeg', 0.8), 
      wMm: canvas.width / (pxPerMm * scaleFactor),
      hMm: canvas.height / (pxPerMm * scaleFactor)
    };
  },

  async generateDocPdf(title: string, content: string): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
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
        const render = this.renderComplexTextToImage(text, contentWidth, fontSize * 1.2, isBold);
        if (render) {
          checkPage(render.hMm);
          const isRtl = ARABIC_REGEX.test(text);
          const xPos = isRtl ? (pageWidth - margin - render.wMm) : margin;
          doc.addImage(render.dataUrl, 'JPEG', xPos, y, render.wMm, render.hMm, undefined, 'FAST');
          y += render.hMm + 2;
        }
      } else {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, contentWidth);
        const textHeight = lines.length * (fontSize * 0.5);
        checkPage(textHeight + 5);
        doc.text(lines, margin, y + (fontSize * 0.3));
        y += textHeight + 4;
      }
    };

    addTextBlock(title || "Document", 20, true);
    y += 5;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Split content by paragraphs
    const paragraphs = content.split('\n');
    for (const p of paragraphs) {
      if (p.trim()) {
        addTextBlock(p, 11);
      } else {
        y += 5; // Paragraph spacing
      }
    }

    return doc.output('blob');
  },

  async generateExamPdf(quiz: QuizRecord, includeAnswerKey: boolean = false): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
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
        const render = this.renderComplexTextToImage(text, contentWidth, fontSize * 1.2, isBold);
        if (render) {
          checkPage(render.hMm);
          const isRtl = ARABIC_REGEX.test(text);
          const xPos = isRtl ? (pageWidth - margin - render.wMm) : margin;
          doc.addImage(render.dataUrl, 'JPEG', xPos, y, render.wMm, render.hMm, undefined, 'FAST');
          y += render.hMm + 2;
        }
      } else {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, contentWidth);
        const textHeight = lines.length * (fontSize * 0.5);
        checkPage(textHeight + 5);
        doc.text(lines, margin, y + (fontSize * 0.3));
        y += textHeight + 4;
      }
    };

    const sampleText = quiz.questions[0]?.prompt || '';
    const isAr = ARABIC_REGEX.test(sampleText);
    
    const titleText = quiz.title || (isAr ? 'SnapQuizGame — امتحان' : 'SnapQuizGame — Exam');
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

    if (includeAnswerKey) {
      doc.addPage();
      y = margin;
      addTextBlock(isAr ? 'مفتاح الإجابة' : 'Answer Key', 18, true);
      y += 10;

      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        const ansLabel = isAr ? `${i + 1}. الإجابة: ` : `${i + 1}. Answer: `;
        addTextBlock(ansLabel + q.correctAnswer, 12);
      }
    }

    return doc.output('blob');
  }
};
