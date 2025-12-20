import { useMemo } from 'react';

interface PaginationInput {
  letterDate: string;
  referenceNo: string;
  recipientName: string;
  recipientAddress: string;
  subject: string;
  salutation: string;
  letterBody: string;
  closing: string;
  showSignature: boolean;
  signatureImage: string | null;
  showSeal: boolean;
  sealImage: string | null;
}

interface PageContent {
  pageNumber: number;
  content: string;
  isFirstPage: boolean;
  isLastPage: boolean;
  showMeta: boolean;
  showRecipient: boolean;
  showSubject: boolean;
  showSalutation: boolean;
  showClosing: boolean;
}

// A4 page dimensions and spacing calculations (in approximate lines/characters)
// Header height: ~80px, Footer height: ~50px, Margins: 45mm vertical = ~170px
// Available body height: 297mm - 25mm top - 20mm bottom - header - footer ≈ 600px
// At 12px font with 1.5 line-height = 18px per line ≈ 33 lines per page
// First page has meta, recipient, subject, salutation which takes ~10-12 lines
// Last page needs space for closing and signature ~8-10 lines

const LINES_PER_PAGE_FIRST = 22; // Less space due to meta, recipient, subject, salutation
const LINES_PER_PAGE_MIDDLE = 35; // Full content area
const LINES_PER_PAGE_LAST_RESERVE = 10; // Reserve for closing, signature

const CHARS_PER_LINE = 90; // Approximate characters per line at 12px in A4 body width

export function useLetterheadPagination(input: PaginationInput): PageContent[] {
  return useMemo(() => {
    const { letterBody, closing } = input;
    
    if (!letterBody && !closing) {
      return [{
        pageNumber: 1,
        content: '',
        isFirstPage: true,
        isLastPage: true,
        showMeta: true,
        showRecipient: true,
        showSubject: true,
        showSalutation: true,
        showClosing: true
      }];
    }

    // Split letter body into paragraphs
    const paragraphs = letterBody.split(/\n\n+/).filter(p => p.trim());
    
    // Calculate approximate lines for each paragraph
    const paragraphLines = paragraphs.map(p => {
      const lines = p.split('\n');
      let totalLines = 0;
      lines.forEach(line => {
        // Each line takes at least 1 line, plus wrapped lines
        totalLines += Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
      });
      return { text: p, lines: totalLines + 1 }; // +1 for paragraph spacing
    });

    const pages: PageContent[] = [];
    let currentPageContent: string[] = [];
    let currentPageLines = 0;
    let isFirstPage = true;
    let paragraphIndex = 0;

    while (paragraphIndex < paragraphLines.length) {
      const para = paragraphLines[paragraphIndex];
      const maxLines = isFirstPage ? LINES_PER_PAGE_FIRST : LINES_PER_PAGE_MIDDLE;
      
      // Check if this is potentially the last page (remaining content fits)
      const remainingLines = paragraphLines.slice(paragraphIndex).reduce((sum, p) => sum + p.lines, 0);
      const effectiveMaxLines = remainingLines <= maxLines ? maxLines - LINES_PER_PAGE_LAST_RESERVE : maxLines;

      if (currentPageLines + para.lines <= effectiveMaxLines) {
        // Paragraph fits on current page
        currentPageContent.push(para.text);
        currentPageLines += para.lines;
        paragraphIndex++;
      } else if (currentPageContent.length === 0) {
        // Paragraph is too long for a single page, need to split it
        const lines = para.text.split('\n');
        let currentChunk: string[] = [];
        let chunkLines = 0;
        
        for (const line of lines) {
          const lineCount = Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
          if (chunkLines + lineCount <= effectiveMaxLines) {
            currentChunk.push(line);
            chunkLines += lineCount;
          } else {
            if (currentChunk.length > 0) {
              currentPageContent.push(currentChunk.join('\n'));
              pages.push({
                pageNumber: pages.length + 1,
                content: currentPageContent.join('\n\n'),
                isFirstPage,
                isLastPage: false,
                showMeta: isFirstPage,
                showRecipient: isFirstPage,
                showSubject: isFirstPage,
                showSalutation: isFirstPage,
                showClosing: false
              });
              isFirstPage = false;
              currentPageContent = [];
              currentPageLines = 0;
              currentChunk = [line];
              chunkLines = lineCount;
            }
          }
        }
        
        if (currentChunk.length > 0) {
          currentPageContent.push(currentChunk.join('\n'));
          currentPageLines = chunkLines;
        }
        paragraphIndex++;
      } else {
        // Start a new page
        pages.push({
          pageNumber: pages.length + 1,
          content: currentPageContent.join('\n\n'),
          isFirstPage,
          isLastPage: false,
          showMeta: isFirstPage,
          showRecipient: isFirstPage,
          showSubject: isFirstPage,
          showSalutation: isFirstPage,
          showClosing: false
        });
        isFirstPage = false;
        currentPageContent = [];
        currentPageLines = 0;
      }
    }

    // Add the last page with remaining content
    pages.push({
      pageNumber: pages.length + 1,
      content: currentPageContent.join('\n\n'),
      isFirstPage: pages.length === 0,
      isLastPage: true,
      showMeta: pages.length === 0,
      showRecipient: pages.length === 0,
      showSubject: pages.length === 0,
      showSalutation: pages.length === 0,
      showClosing: true
    });

    return pages;
  }, [input.letterBody, input.closing]);
}

export type { PaginationInput, PageContent };
