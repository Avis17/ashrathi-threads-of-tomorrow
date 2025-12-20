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

// Page break marker constant
const PAGE_BREAK_MARKER = 'data-page-break';

// Split HTML content by page breaks ONLY - no auto pagination
function splitByPageBreaks(html: string): string[] {
  if (!html || html.trim() === '' || html === '<p></p>') {
    return [''];
  }
  
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  
  const pages: string[] = [];
  let currentPageElements: string[] = [];
  
  Array.from(tmp.childNodes).forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      
      // Check if this is a page break
      if (el.hasAttribute(PAGE_BREAK_MARKER) || el.classList.contains('page-break-marker')) {
        // Save current page content and start new page
        pages.push(currentPageElements.join(''));
        currentPageElements = [];
        return;
      }
      
      currentPageElements.push(el.outerHTML);
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      currentPageElements.push(`<p>${node.textContent}</p>`);
    }
  });
  
  // Add remaining content as last page
  pages.push(currentPageElements.join(''));
  
  return pages;
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

    // Split content by user-inserted page breaks only
    const pageContents = splitByPageBreaks(letterBody);
    
    // If only one page (no page breaks), return single page
    if (pageContents.length <= 1) {
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

    // Create pages based on user page breaks
    const pages: PageContent[] = pageContents.map((content, index) => ({
      pageNumber: index + 1,
      content,
      isFirstPage: index === 0,
      isLastPage: index === pageContents.length - 1,
      showMeta: index === 0,
      showRecipient: index === 0,
      showSubject: index === 0,
      showSalutation: index === 0,
      showClosing: index === pageContents.length - 1
    }));

    return pages;
  }, [input.letterBody, input.closing]);
}

export type { PaginationInput, PageContent };
