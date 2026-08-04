import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Only run browser-specific mocks in jsdom environment
if (typeof window !== "undefined") {
  // Mock window.matchMedia (lucide-react uses it in some contexts)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: ResizeObserverMock,
  });

  // Mock scrollIntoView
  HTMLElement.prototype.scrollIntoView = vi.fn() as unknown as () => void;
}
