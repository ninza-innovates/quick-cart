import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ProductModal from "./product-modal";
import { useAddReview } from "@/app/lib/hooks/useAddReview";
import useAuth from "@/app/lib/hooks/useAuth";

// Mock the hooks and components we're using
vi.mock("@/app/lib/hooks/useAddReview", () => ({
  useAddReview: vi.fn(),
}));

vi.mock("@/app/lib/hooks/useAuth", () => ({
  default: vi.fn(),
}));

describe("ProductModal Component", () => {
  const mockUser = { uid: "user123" };
  // Common test data and mocks
  const mockProduct = {
    id: "product123",
    name: "Test Product",
    description: "This is a test product description",
    imageURL: "/test-image.jpg",
    price: 29.99,
    stockQuantity: 5,
    reviews: [],
  };

  const mockProductWithReviews = {
    ...mockProduct,
    reviews: [
      {
        id: "review123",
        rating: 5,
        reviewText: "Great product!",
        userId: "user123",
        userName: "Test User",
      },
    ],
  };

  const mockOnClose = vi.fn();
  const mockLoadPage = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock return values
    useAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    useAddReview.mockReturnValue({
      id: "review123",
      rating: 5,
      reviewText: "Great product!",
      userId: "user123",
      userName: "Test User",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders product details correctly", () => {
    render(
      <ProductModal
        product={mockProduct}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test product description")
    ).toBeInTheDocument();
    const priceElements = screen.getAllByText("$29.99");
    expect(priceElements.length).toBeGreaterThan(0);
    expect(priceElements[0]).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("closes when close button is clicked", () => {
    render(
      <ProductModal
        product={mockProduct}
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

  it("renders reviews when product has reviews", () => {
    render(
      <ProductModal
        product={mockProductWithReviews}
        onClose={mockOnClose}
        loadPage={mockLoadPage}
        currentPage={1}
      />
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Great product!")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
