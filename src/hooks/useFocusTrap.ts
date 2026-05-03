import {useEffect, useRef, useCallback} from 'react';

interface FocusTrapOptions {
  active?: boolean;
  initialFocus?: HTMLElement | string | null;
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function useFocusTrap(options: FocusTrapOptions = {}): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activate: () => void;
  deactivate: () => void;
} {
  const {
    active = true,
    initialFocus,
    returnFocus = true,
    escapeDeactivates = true,
    onActivate,
    onDeactivate,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isActiveRef = useRef(false);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(selector)).filter(el => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        el.offsetParent !== null &&
        !el.hasAttribute('aria-hidden')
      );
    });
  }, []);

  const activate = useCallback(() => {
    if (isActiveRef.current) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    isActiveRef.current = true;

    if (initialFocus) {
      let initialElement: HTMLElement | null = null;
      if (typeof initialFocus === 'string') {
        initialElement = document.querySelector(initialFocus);
      } else {
        initialElement = initialFocus;
      }
      initialElement?.focus();
    } else {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }
    }

    onActivate?.();
  }, [initialFocus, getFocusableElements, onActivate]);

  const deactivate = useCallback(() => {
    if (!isActiveRef.current) return;

    isActiveRef.current = false;

    if (returnFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }

    onDeactivate?.();
  }, [returnFocus, onDeactivate]);

  useEffect(() => {
    if (!active) {
      if (isActiveRef.current) {
        deactivate();
      }
      return;
    }

    activate();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveRef.current || !containerRef.current) return;

      if (e.key === 'Escape' && escapeDeactivates) {
        deactivate();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement && lastElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement && firstElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (isActiveRef.current) {
        deactivate();
      }
    };
  }, [active, activate, deactivate, escapeDeactivates, getFocusableElements]);

  return {
    containerRef,
    activate,
    deactivate,
  };
}

export function useFocusOnMount<T extends HTMLElement>(
  selector?: string
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      if (selector) {
        const element = ref.current.querySelector<HTMLElement>(selector);
        element?.focus();
      } else {
        ref.current.focus();
      }
    }
  }, [selector]);

  return ref;
}

export function useReturnFocus(trigger: boolean): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (trigger) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [trigger]);
}

export function useFocusVisible(): React.RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let hadKeyboardEvent = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        hadKeyboardEvent = true;
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEvent = false;
    };

    const handleFocus = () => {
      if (hadKeyboardEvent) {
        element.classList.add('focus-visible');
      }
    };

    const handleBlur = () => {
      element.classList.remove('focus-visible');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  return ref;
}
