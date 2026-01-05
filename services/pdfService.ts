
import { jsPDF } from 'jspdf';
import { QuizRecord } from '../types/quiz';

// Minimal Noto Sans Regular & Bold Base64 Strings (Simplified placeholders for structure)
// In a production environment, replace these with full Base64 strings of NotoSans-Regular.ttf and NotoSans-Bold.ttf
const notoSansRegularBase64 = "AAEAAAARAQAABAAQR0RFRv7W..."; 
const notoSansBoldBase64 = "AAEAAAARAQAABAAQR0RFRv7W...";

/**
 * pdfService handles the generation of printable Exam PDFs.
 * Updated to use Unicode fonts for Arabic, Turkish, and European characters.
 */
export const pdfService = {
  /**
   * Helper to handle text direction and specific language corrections.
   * For Arabic, it flips characters to simulate RTL if the engine requires it.
   */
  fixText(text: string, lang: string): string {
    if (lang === 'ar' || this.isArabic(text)) {
      // Basic RTL simulation: split into lines, reverse characters in each line
      return text.split('\n').map(line => line.split('').reverse().join('')).join('\n');
    }
    return text;
  },

  /**
   * Detects if a string contains Arabic characters.
   */
  isArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  },

  async generateExamPdf(quiz: QuizRecord, includeAnswerKey: boolean = false): Promise<string> {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    // 1. Register Unicode Fonts
    try {
      doc.addFileToVFS('NotoSans-Regular.ttf', notoSansRegularBase64);
      doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      doc.addFileToVFS('NotoSans-Bold.ttf', notoSansBoldBase64);
      doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    } catch (e) {
      console.warn("Font registration failed, falling back to system fonts", e);
    }

    // 2. Set Default Font
    doc.setFont('NotoSans', 'normal');

    const lang = quiz.questionLanguage || 'en';
    const globalIsAr = lang.startsWith('ar') || this.isArabic(quiz.questions[0]?.prompt || '');

    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    const checkPage = (heightNeeded: number) => {
      if (y + heightNeeded > 280) {
        doc.addPage();
        y = margin;
        doc.setFont('NotoSans', 'normal'); // Ensure font persists on new page
        return true;
      }
      return false;
    };

    /**
     * Helper to render text with proper font and direction.
     */
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      const isAr = this.isArabic(text);
      const fixedText = this.fixText(text, isAr ? 'ar' : lang);
      
      doc.setFontSize(fontSize);
      doc.setFont("NotoSans", isBold ? "bold" : "normal");
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(fixedText, contentWidth - 10);
      checkPage(lines.length * (fontSize * 0.5) + 5);

      lines.forEach((line: string) => {
        if (isAr) {
          doc.text(line, pageWidth - margin - 5, y + (fontSize * 0.3), { align: 'right' });
        } else {
          doc.text(line, margin + 5, y + (fontSize * 0.3), { align: 'left' });
        }
        y += (fontSize * 0.5);
      });
      y += 2;
    };

    // --- Header ---
    const title = globalIsAr ? this.fixText('SnapQuizGame — امتحان', 'ar') : 'SnapQuizGame — Exam';
    doc.setFontSize(22);
    doc.setFont("NotoSans", "bold");
    doc.setTextColor(30, 58, 138); 
    if (globalIsAr) {
      doc.text(title, pageWidth - margin, y, { align: 'right' });
    } else {
      doc.text(title, margin, y, { align: 'left' });
    }
    y += 12;

    doc.setFontSize(10);
    doc.setFont("NotoSans", "normal");
    doc.setTextColor(100);
    const meta = `ID: ${quiz.id} | ${new Date().toLocaleDateString()}`;
    if (globalIsAr) {
      doc.text(meta, pageWidth - margin, y, { align: 'right' });
    } else {
      doc.text(meta, margin, y, { align: 'left' });
    }
    y += 8;

    // --- Student Info Box ---
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    addText(globalIsAr ? 'الاسم: _________________________________' : 'Name: _________________________________', 12);
    addText(globalIsAr ? 'التاريخ: ____________    الفصل: ____________' : 'Date: ____________    Class: ____________', 12);
    y += 5;

    // --- Questions ---
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      checkPage(20);
      
      // Question Header
      const qNumText = globalIsAr ? `سؤال ${i + 1}:` : `Question ${i + 1}:`;
      addText(qNumText, 10, true, [132, 204, 22]);
      
      // Question Prompt
      addText(q.prompt, 12, true);
      
      if (q.type === 'MCQ' || q.type === 'TF') {
        const options = q.options || [];
        for (let j = 0; j < options.length; j++) {
          const opt = options[j];
          checkPage(10);
          
          if (globalIsAr) {
            const letter = String.fromCharCode(0x0623 + j); // Arabic Alif, Ba...
            doc.rect(pageWidth - margin - 5, y, 4, 4);
            addText(`${letter}) ${opt}`, 11);
          } else {
            const letter = String.fromCharCode(65 + j); // A, B, C...
            doc.rect(margin + 5, y, 4, 4);
            addText(`${letter}) ${opt}`, 11);
          }
        }
      } else if (q.type === 'FITB') {
        checkPage(15);
        doc.setDrawColor(220);
        doc.line(margin + 5, y + 5, pageWidth - margin - 5, y + 5);
        y += 12;
      }
      y += 6;
    }

    // --- Answer Key Page ---
    if (includeAnswerKey) {
      doc.addPage();
      doc.setFont('NotoSans', 'normal');
      y = margin;
      const keyHeader = globalIsAr ? 'مفتاح الإجابة' : 'Answer Key';
      addText(keyHeader, 18, true, [30, 58, 138]);
      y += 10;

      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        const ansText = globalIsAr 
          ? `${i + 1}. الإجابة: ${q.correctAnswer}` 
          : `${i + 1}. Answer: ${q.correctAnswer}`;
        addText(ansText, 12);
      }
    }

    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }
};
