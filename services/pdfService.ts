
import { jsPDF } from 'jspdf';
import { QuizRecord } from '../types/quiz';

export const pdfService = {
  generateExamPdf(quiz: QuizRecord, includeAnswerKey: boolean = false): string {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();

    const checkPage = (heightNeeded: number) => {
      if (y + heightNeeded > 280) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138); // Brand Dark Blue
    doc.text('SnapQuizGame — Exam', margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Quiz ID: ${quiz.id} | Generated: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    // --- Student Info Box ---
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Student Name: _________________________________', margin, y);
    y += 10;
    doc.text('Date: _________________    Class/Group: _________________', margin, y);
    y += 15;

    // --- Questions ---
    quiz.questions.forEach((q, i) => {
      checkPage(30); // Buffer for question prompt

      doc.setFont("helvetica", "bold");
      const questionLabel = `${i + 1}. `;
      const promptLines = doc.splitTextToSize(q.prompt, pageWidth - margin * 2 - 10);
      
      doc.text(questionLabel, margin, y);
      doc.text(promptLines, margin + 10, y);
      y += (promptLines.length * 7) + 5;

      doc.setFont("helvetica", "normal");
      
      if (q.type === 'MCQ') {
        q.options.forEach((opt, oi) => {
          checkPage(10);
          const letter = String.fromCharCode(65 + oi);
          doc.rect(margin + 10, y - 4, 4, 4); // Checkbox
          doc.text(`${letter}) ${opt}`, margin + 17, y);
          y += 8;
        });
      } else if (q.type === 'TF') {
        checkPage(10);
        doc.rect(margin + 10, y - 4, 4, 4); doc.text('True', margin + 17, y);
        doc.rect(margin + 40, y - 4, 4, 4); doc.text('False', margin + 47, y);
        y += 10;
      } else if (q.type === 'FITB') {
        checkPage(20);
        doc.line(margin + 10, y + 5, margin + 150, y + 5);
        y += 12;
        doc.line(margin + 10, y + 5, margin + 150, y + 5);
        y += 15;
      }
      y += 5; // Spacer between questions
    });

    // --- Answer Key Page ---
    if (includeAnswerKey) {
      doc.addPage();
      y = margin;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 58, 138);
      doc.text('Answer Key', margin, y);
      y += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);

      quiz.questions.forEach((q, i) => {
        checkPage(10);
        doc.text(`${i + 1}. Correct Answer: ${q.correctAnswer}`, margin, y);
        y += 10;
      });
    }

    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }
};
