import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Sidebar from "./Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

// Mock CompanyBrandingProvider
vi.mock("@/components/branding/CompanyBrandingProvider", () => ({
  useCompanyBranding: vi.fn(() => ({
    companyName: "Test Co",
    shortCode: "TC",
    logo: null,
    profileImage: null,
    isOwner: true,
    isAdmin: true,
    loading: false,
  })),
}));

// Mock fetch for menu access
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, allowedMenuPaths: [] }),
    })
  );
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Sidebar - Desktop rail", () => {
  it("renders desktop rail when showRail=true", () => {
    render(<Sidebar showRail={true} drawerOpen={false} onCloseDrawer={vi.fn()} />);
    const rail = document.querySelector("aside");
    expect(rail).toBeTruthy();
  });

  it("does not render desktop rail when showRail=false", () => {
    render(<Sidebar showRail={false} drawerOpen={false} onCloseDrawer={vi.fn()} />);
    const rail = document.querySelector("aside");
    expect(rail).toBeFalsy();
  });

  it("shows submenu items on hover (mouseenter)", async () => {
    vi.useFakeTimers();
    render(<Sidebar showRail={true} drawerOpen={false} onCloseDrawer={vi.fn()} />);

    // Find the "View Bill" nav item (has submenu)
    const viewBillButton = screen.getAllByText("View Bill")[0];
    expect(viewBillButton).toBeTruthy();

    // Hover over it
    const parentDiv = viewBillButton.closest("div[class*='relative']")!;
    fireEvent.mouseEnter(parentDiv);

    // Advance timers to trigger the hover
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // The submenu popup should appear with "Bill List"
    expect(screen.getByText("Bill List")).toBeTruthy();
  });

  it("hides submenu after mouseleave + delay", async () => {
    vi.useFakeTimers();
    render(<Sidebar showRail={true} drawerOpen={false} onCloseDrawer={vi.fn()} />);

    const viewBillButton = screen.getAllByText("View Bill")[0];
    const parentDiv = viewBillButton.closest("div[class*='relative']")!;

    // Hover in
    fireEvent.mouseEnter(parentDiv);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText("Bill List")).toBeTruthy();

    // Hover out
    fireEvent.mouseLeave(parentDiv);
    act(() => {
      vi.advanceTimersByTime(250); // 200ms delay + buffer
    });

    expect(screen.queryByText("Bill List")).toBeFalsy();
  });

  it("shows ChevronDown when hovered, ChevronRight when not", async () => {
    vi.useFakeTimers();
    render(<Sidebar showRail={true} drawerOpen={false} onCloseDrawer={vi.fn()} />);

    const viewBillButton = screen.getAllByText("View Bill")[0];
    const parentDiv = viewBillButton.closest("div[class*='relative']")!;

    // Before hover — ChevronRight is present
    const chevRightBefore = parentDiv.querySelector("svg");
    expect(chevRightBefore).toBeTruthy();

    // Hover
    fireEvent.mouseEnter(parentDiv);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // After hover — should have 2 svgs (icon + ChevronDown)
    const svgs = parentDiv.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
  });
});

describe("Sidebar - Mobile drawer", () => {
  it("renders drawer when drawerOpen=true", () => {
    render(<Sidebar showRail={false} drawerOpen={true} onCloseDrawer={vi.fn()} />);
    expect(screen.getByText("Billora")).toBeTruthy();
  });

  it("does not render drawer when drawerOpen=false", () => {
    render(<Sidebar showRail={false} drawerOpen={false} onCloseDrawer={vi.fn()} />);
    expect(screen.queryByText("Billora")).toBeFalsy();
  });

  it("calls onCloseDrawer when close button clicked", () => {
    const onClose = vi.fn();
    render(<Sidebar showRail={false} drawerOpen={true} onCloseDrawer={onClose} />);
    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(onClose).toHaveBeenCalled();
  });

  it("expands submenu on click in drawer", () => {
    render(<Sidebar showRail={false} drawerOpen={true} onCloseDrawer={vi.fn()} />);

    // Click View Bill in drawer
    const viewBillButtons = screen.getAllByText("View Bill");
    const drawerButton = viewBillButtons[viewBillButtons.length - 1]; // last one is in drawer
    fireEvent.click(drawerButton);

    // Bill List should now be visible
    expect(screen.getByText("Bill List")).toBeTruthy();
  });
});
