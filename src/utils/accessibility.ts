export interface A11yConfig {
  announceTimeout?: number;
  focusVisibleClass?: string;
  skipToContentId?: string;
}

const defaultConfig: A11yConfig = {
  announceTimeout: 5000,
  focusVisibleClass: 'focus-visible',
  skipToContentId: 'main-content',
};

let liveRegion: HTMLDivElement | null = null;

export function initAccessibility(config: A11yConfig = {}): void {
  const mergedConfig = {...defaultConfig, ...config};

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText =
      'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(liveRegion);
  }

  initFocusVisible(mergedConfig.focusVisibleClass!);
  initKeyboardNavigation();
  initSkipLink(mergedConfig.skipToContentId!);
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (!liveRegion) {
    initAccessibility();
  }

  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = '';
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }, 100);
  }
}

export function initFocusVisible(focusVisibleClass: string = 'focus-visible'): void {
  if (typeof CSS === 'undefined' || !CSS.supports?.('selector(:focus-visible)')) {
    let hadKeyboardEvent = false;
    const keyboardModalityClass = 'using-keyboard';

    document.addEventListener('keydown', e => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
        hadKeyboardEvent = true;
        document.body.classList.add(keyboardModalityClass);
      }
    });

    document.addEventListener('mousedown', () => {
      hadKeyboardEvent = false;
      document.body.classList.remove(keyboardModalityClass);
    });

    document.addEventListener('focusin', e => {
      const target = e.target as HTMLElement;
      if (hadKeyboardEvent && !target.classList.contains(focusVisibleClass)) {
        target.classList.add(focusVisibleClass);
      }
    });

    document.addEventListener('focusout', e => {
      const target = e.target as HTMLElement;
      target.classList.remove(focusVisibleClass);
    });
  }
}

export function initKeyboardNavigation(): void {
  document.addEventListener('keydown', e => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (e.key === 'Escape') {
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (modal) {
        const closeButton = modal.querySelector('[data-close]') as HTMLButtonElement;
        closeButton?.click();
      }
    }

    if (tagName === 'input' || tagName === 'textarea') {
      if (e.key === 'Enter' && (target as HTMLInputElement).form) {
        const submitButton = (target as HTMLInputElement).form!.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement | null;
        submitButton?.click();
      }
    }
  });
}

export function initSkipLink(contentId: string = 'main-content'): void {
  const skipLink = document.createElement('a');
  skipLink.href = `#${contentId}`;
  skipLink.textContent = 'Skip to main content';
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:shadow-lg';
  document.body.insertBefore(skipLink, document.body.firstChild);

  skipLink.addEventListener('click', e => {
    e.preventDefault();
    const mainContent = document.getElementById(contentId);
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
    }
  });
}

export function getFocusableElements(root: Element | Document = document): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    el => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  );
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  return () => container.removeEventListener('keydown', handleKeyDown);
}

export function moveFocusTo(container: Element | Document, direction: 'first' | 'last'): void {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const element = direction === 'first' ? focusable[0] : focusable[focusable.length - 1];
  element?.focus();
}

export function getA11yLabel(element: HTMLElement): string {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.getAttribute('title') ||
    element.textContent?.trim() ||
    ''
  );
}

export function setA11yLabel(element: HTMLElement, label: string): void {
  element.setAttribute('aria-label', label);
}

export function getA11yDescription(element: HTMLElement): string {
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const description = document.getElementById(describedBy);
    return description?.textContent?.trim() || '';
  }
  return '';
}

export function isReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g);
    if (!rgb) return 0;
    const [r = 0, g = 0, b = 0] = rgb.map(x => {
      const val = parseInt(x, 16) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG2_1AA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

export function createAnnouncer(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
} {
  initAccessibility();
  return {
    announce,
  };
}
