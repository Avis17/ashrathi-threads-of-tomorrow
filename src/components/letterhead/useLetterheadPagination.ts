import { useMemo } from 'react';

interface PaginationInput {
  letterDate: string;
  referenceNo: string;
  recipientName: string;
  recipientAddress: string;
  subject: string;
  salutation: string;
  letterBody: string; // HTML content from TipTap
  closing: string;
  showSignature: boolean;
  signatureImage: string | null;
  showSeal: boolean;
  sealImage: string | null;
}

interface PageContent {
  pageNumber: number;
  content: string; // HTML content for this page
  isFirstPage: boolean;
  isLastPage: boolean;
  showMeta: boolean;
  showRecipient: boolean;
  showSubject: boolean;
  showSalutation: boolean;
  showClosing: boolean;
}

// A4 page dimensions and spacing calculations
// Available body height: 297mm - 25mm top - 20mm bottom - header (~80px) - footer (~50px)
// At 12px font with 1.5 line-height = 18px per line ≈ 33 lines per page
// First page has meta, recipient, subject, salutation which takes ~10-12 lines
// Last page needs space for closing and signature ~8-10 lines

const LINES_PER_PAGE_FIRST = 22;
const LINES_PER_PAGE_MIDDLE = 35;
const LINES_PER_PAGE_LAST_RESERVE = 10;
const CHARS_PER_LINE = 90;

// Page break marker constant
const PAGE_BREAK_MARKER = 'data-page-break';

// Helper to extract text content from HTML for line calculation
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Parse HTML into paragraphs (top-level elements), detecting page breaks
function parseHtmlToParagraphs(html: string): { html: string; lines: number; isPageBreak: boolean }[] {
  if (!html || html.trim() === '' || html === '<p></p>') {
    return [];
  }
  
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  
  const paragraphs: { html: string; lines: number; isPageBreak: boolean }[] = [];
  
  Array.from(tmp.childNodes).forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      
      // Check if this is a page break
      if (el.hasAttribute(PAGE_BREAK_MARKER) || el.classList.contains('page-break-marker')) {
        paragraphs.push({ html: '', lines: 0, isPageBreak: true });
        return;
      }
      
      const nodeHtml = el.outerHTML;
      const nodeText = el.textContent || '';
      
      // Calculate lines for this element
      let lineCount = 1;
      const textLines = nodeText.split('\n');
      textLines.forEach(line => {
        lineCount += Math.max(0, Math.ceil(line.length / CHARS_PER_LINE) - 1);
      });
      lineCount += 1; // Add spacing after paragraph
      
      // Account for indentation (indented text takes more lines due to narrower effective width)
      const indentMatch = el.getAttribute('data-indent') || el.style.marginLeft;
      if (indentMatch) {
        const indentLevel = parseInt(indentMatch) || (parseInt(indentMatch) / 24);
        if (indentLevel > 0) {
          const effectiveCharsPerLine = CHARS_PER_LINE - (indentLevel * 3);
          lineCount = Math.ceil(nodeText.length / effectiveCharsPerLine) + 1;
        }
      }
      
      // Handle lists - each li is roughly 1+ lines
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        const listItems = el.querySelectorAll('li');
        lineCount = listItems.length + 1;
        listItems.forEach(li => {
          const liText = li.textContent || '';
          if (liText.length > CHARS_PER_LINE) {
            lineCount += Math.ceil(liText.length / CHARS_PER_LINE) - 1;
          }
        });
      }
      
      paragraphs.push({ html: nodeHtml, lines: lineCount, isPageBreak: false });
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const text = node.textContent || '';
      paragraphs.push({
        html: `<p>${text}</p>`,
        lines: Math.max(1, Math.ceil(text.length / CHARS_PER_LINE)) + 1,
        isPageBreak: false
      });
    }
  });
  
  return paragraphs;
}

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

    // Parse HTML content into paragraph elements
    const paragraphs = parseHtmlToParagraphs(letterBody);
    
    // If no paragraphs or empty content, return single page
    if (paragraphs.length === 0) {
      return [{
        pageNumber: 1,
        content: letterBody,
        isFirstPage: true,
        isLastPage: true,
        showMeta: true,
        showRecipient: true,
        showSubject: true,
        showSalutation: true,
        showClosing: true
      }];
    }

    const pages: PageContent[] = [];
    let currentPageContent: string[] = [];
    let currentPageLines = 0;
    let isFirstPage = true;
    let paragraphIndex = 0;

    while (paragraphIndex < paragraphs.length) {
      const para = paragraphs[paragraphIndex];
      
      // If this is a page break marker, force a new page
      if (para.isPageBreak) {
        // Add current page if it has content
        if (currentPageContent.length > 0 || isFirstPage) {
          pages.push({
            pageNumber: pages.length + 1,
            content: currentPageContent.join(''),
            isFirstPage,
            isLastPage: false,
            showMeta: isFirstPage,
            showRecipient: isFirstPage,
            showSubject: isFirstPage,
            showSalutation: isFirstPage,
            showClosing: false
          });
          isFirstPage = false;
        }
        currentPageContent = [];
        currentPageLines = 0;
        paragraphIndex++;
        continue;
      }
      
      const maxLines = isFirstPage ? LINES_PER_PAGE_FIRST : LINES_PER_PAGE_MIDDLE;
      
      // Check if this is potentially the last page (remaining content fits)
      const remainingLines = paragraphs.slice(paragraphIndex)
        .filter(p => !p.isPageBreak)
        .reduce((sum, p) => sum + p.lines, 0);
      const effectiveMaxLines = remainingLines <= maxLines ? maxLines - LINES_PER_PAGE_LAST_RESERVE : maxLines;

      if (currentPageLines + para.lines <= effectiveMaxLines) {
        // Paragraph fits on current page
        currentPageContent.push(para.html);
        currentPageLines += para.lines;
        paragraphIndex++;
      } else if (currentPageContent.length === 0) {
        // Paragraph is too long for empty page, add it anyway and continue
        currentPageContent.push(para.html);
        currentPageLines += para.lines;
        paragraphIndex++;
        
        // Force new page after this
        pages.push({
          pageNumber: pages.length + 1,
          content: currentPageContent.join(''),
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
      } else {
        // Start a new page
        pages.push({
          pageNumber: pages.length + 1,
          content: currentPageContent.join(''),
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
      content: currentPageContent.join(''),
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
