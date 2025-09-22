import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import OrderModal from "./order-modal";
import { useUpdateReturnStatus } from "@/app/lib/hooks/useUpdateReturnStatus";
import { useRouter } from "next/navigation";

// Mock the hooks and components we're using
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/app/lib/hooks/useUpdateReturnStatus", () => ({
  useUpdateReturnStatus: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props) => {
    return <img {...props} alt={props.alt} />;
  },
}));

vi.mock("../notification-banner", () => ({
  NotificationBanner: ({ text }) => (
    <div data-testid="notification-banner">{text}</div>
  ),
}));

describe("OrderModal Component", () => {
  // Common test data and mocks
  const mockOrder = {
    id: "order123",
    productName: "Test Product",
    description: "This is a test product description",
    imageURL: "/test-image.jpg",
    orderedAt: "2023-01-01",
    arrivalDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    quantity: 2,
    totalPrice: 29.99,
    returnStatus: false,
  };

  const mockOrderDelivered = {
    ...mockOrder,
    arrivalDate: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
  };

  const mockOrderReturned = {
    ...mockOrderDelivered,
    returnStatus: true,
  };

  const mockOrderExpired = {
    ...mockOrder,
    arrivalDate: new Date(Date.now() - 40 * 86400000).toISOString(), // 40 days ago
  };

  const mockOnClose = vi.fn();
  const mockLoadPage = vi.fn();
  const mockPush = vi.fn();
  const mockUpdateReturnStatus = vi.fn().mockResolvedValue({}); // Make sure this returns a resolved promise

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup router mock
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // Setup return status update mock
    useUpdateReturnStatus.mockReturnValue({
      updateReturnStatus: mockUpdateReturnStatus,
    });

    // Mock setTimeout to execute immediately
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders order details correctly", () => {
    render(
      <OrderModal
        order={mockOrder}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test product description")
    ).toBeInTheDocument();
    expect(screen.getByText("Ordered on 2023-01-01")).toBeInTheDocument();
    expect(
      screen.getByText(`Estimated arrival: ${mockOrder.arrivalDate}`)
    ).toBeInTheDocument();
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("Total: $29.99")).toBeInTheDocument();
    expect(screen.getByText("On its way")).toBeInTheDocument();
  });

  it("closes when close button is clicked", () => {
    render(
      <OrderModal
        order={mockOrder}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    // Find close button by × character and click it
    const closeButton = screen.getByTitle("Close");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("redirects to products page when 'Buy again?' is clicked", () => {
    render(
      <OrderModal
        order={mockOrder}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    const buyAgainButton = screen.getByText("Buy again?");
    fireEvent.click(buyAgainButton);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/products");
  });

  it("shows 'Delivered' status for delivered orders", () => {
    render(
      <OrderModal
        order={mockOrderDelivered}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("shows 'Returned' status and disables return button for returned orders", () => {
    render(
      <OrderModal
        order={mockOrderReturned}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    expect(screen.getByText("Returned")).toBeInTheDocument();

    const returnButton = screen.getByText("Already Returned");
    expect(returnButton).toBeDisabled();
  });

  it("shows error notification when trying to return item after 30 days", () => {
    render(
      <OrderModal
        order={mockOrderExpired}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    const returnButton = screen.getByText("Return item");
    fireEvent.click(returnButton);

    // Check if notification appears - this should happen synchronously
    expect(screen.getByTestId("notification-banner")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You cannot return this item as it has been more than 30 days since it arrived."
      )
    ).toBeInTheDocument();

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // After 3 seconds, the notification should disappear
    expect(screen.queryByTestId("notification-banner")).not.toBeInTheDocument();

    // Verify updateReturnStatus was not called
    expect(mockUpdateReturnStatus).not.toHaveBeenCalled();
  });

  it("processes return and shows success notification for eligible items", async () => {
    render(
      <OrderModal
        order={mockOrderDelivered}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    const returnButton = screen.getByText("Return item");

    // Use act for async operations + timers
    await act(async () => {
      fireEvent.click(returnButton);
      // Wait for the updateReturnStatus promise to resolve
      await Promise.resolve();
    });

    // Check if updateReturnStatus was called with the order ID
    expect(mockUpdateReturnStatus).toHaveBeenCalledWith(mockOrderDelivered.id);

    // Check if success notification is shown (should happen synchronously after promise resolves)
    expect(screen.getByTestId("notification-banner")).toBeInTheDocument();
    expect(screen.getByText("Item returned successfully.")).toBeInTheDocument();

    // Advance timers to trigger the setTimeout callback
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Check if modal was closed and page was reloaded
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockLoadPage).toHaveBeenCalledWith(1);
  });
});
