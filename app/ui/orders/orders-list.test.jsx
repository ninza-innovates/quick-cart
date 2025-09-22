import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrdersList from "./orders-list";
import useAuth from "@/app/lib/hooks/useAuth";
import { useGetUserOrders } from "@/app/lib/hooks/useGetUserOrders";
import React from "react";

// Mock the hooks
vi.mock("@/app/lib/hooks/useAuth", () => ({
  default: vi.fn(),
}));

vi.mock("@/app/lib/hooks/useGetUserOrders", () => ({
  useGetUserOrders: vi.fn(),
}));

// Mock next/image since it's used in the component
vi.mock("next/image", () => ({
  default: (props) => {
    return <img {...props} />;
  },
}));

// Mock order modal component
vi.mock("./order-modal", () => ({
  default: ({ order, onClose }) => (
    <div data-testid="order-modal">
      <div>Order ID: {order.id}</div>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("OrdersList Component", () => {
  const mockUser = { uid: "user123" };
  const mockOrders = [
    {
      id: "order1",
      productName: "Test Product 1",
      description:
        "This is a test product description that is quite long to test truncation",
      imageURL: "/test-image.jpg",
      orderedAt: "2023-01-01",
      arrivalDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      quantity: 2,
      totalPrice: 29.99,
      returnStatus: false,
    },
    {
      id: "order2",
      productName: "Test Product 2",
      description: "Another test product description",
      imageURL: "/test-image-2.jpg",
      orderedAt: "2023-01-02",
      arrivalDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      quantity: 1,
      totalPrice: 19.99,
      returnStatus: false,
    },
  ];

  const mockLoadPage = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock return values
    useAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    useGetUserOrders.mockReturnValue({
      userOrders: mockOrders,
      loading: false,
      totalOrders: 2,
      currentPage: 1,
      totalPages: 1,
      loadPage: mockLoadPage,
    });
  });

  it("renders loading state", () => {
    useGetUserOrders.mockReturnValue({
      userOrders: [],
      loading: true,
      totalOrders: 0,
      currentPage: 1,
      totalPages: 0,
      loadPage: mockLoadPage,
    });

    render(<OrdersList />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders orders when data is loaded", () => {
    render(<OrdersList />);

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    expect(screen.getByText("Total: $29.99")).toBeInTheDocument();
    expect(screen.getByText("Total: $19.99")).toBeInTheDocument();
  });

  it('renders "No orders found" when no orders are available', () => {
    useGetUserOrders.mockReturnValue({
      userOrders: [],
      loading: false,
      totalOrders: 0,
      currentPage: 1,
      totalPages: 0,
      loadPage: mockLoadPage,
    });

    render(<OrdersList />);
    expect(
      screen.getByText("No orders found for the selected time period.")
    ).toBeInTheDocument();
  });

  it("changes filter and resets page on filter change", () => {
    render(<OrdersList />);

    const filterSelect = screen.getByRole("combobox");
    fireEvent.change(filterSelect, { target: { value: "last 30 days" } });

    expect(filterSelect.value).toBe("last 30 days");
  });

  it("shows order modal when clicking on an order", async () => {
    render(<OrdersList />);

    // Click on the first order
    const firstOrderElement = screen.getByText("Test Product 1").closest("div");
    fireEvent.click(firstOrderElement);

    // Check if modal appears with correct order
    await waitFor(() => {
      expect(screen.getByTestId("order-modal")).toBeInTheDocument();
      expect(screen.getByText("Order ID: order1")).toBeInTheDocument();
    });
  });

  it("closes modal when clicking close button", async () => {
    render(<OrdersList />);

    // Open modal
    const firstOrderElement = screen.getByText("Test Product 1").closest("div");
    fireEvent.click(firstOrderElement);

    // Close modal
    const closeButton = await screen.findByText("Close");
    fireEvent.click(closeButton);

    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId("order-modal")).not.toBeInTheDocument();
    });
  });

  it("renders pagination when there are multiple pages", () => {
    useGetUserOrders.mockReturnValue({
      userOrders: mockOrders,
      loading: false,
      totalOrders: 20,
      currentPage: 1,
      totalPages: 3,
      loadPage: mockLoadPage,
    });

    render(<OrdersList />);

    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("navigates to next page when clicking Next button", () => {
    useGetUserOrders.mockReturnValue({
      userOrders: mockOrders,
      loading: false,
      totalOrders: 20,
      currentPage: 1,
      totalPages: 3,
      loadPage: mockLoadPage,
    });

    render(<OrdersList />);

    fireEvent.click(screen.getByText("Next"));
    expect(mockLoadPage).toHaveBeenCalledWith(2);
  });

  it("navigates to previous page when clicking Previous button", () => {
    useGetUserOrders.mockReturnValue({
      userOrders: mockOrders,
      loading: false,
      totalOrders: 20,
      currentPage: 2,
      totalPages: 3,
      loadPage: mockLoadPage,
    });

    render(<OrdersList />);

    fireEvent.click(screen.getByText("Previous"));
    expect(mockLoadPage).toHaveBeenCalledWith(1);
  });
});
