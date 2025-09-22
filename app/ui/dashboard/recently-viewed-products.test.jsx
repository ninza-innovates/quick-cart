import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecentlyViewedProducts from "./recently-viewed-products";
import useAuth from "@/app/lib/hooks/useAuth";
import { useGetRecentlyViewedProducts } from "@/app/lib/hooks/useGetRecentlyViewedProducts";
import React from "react";

// Mock dependencies
vi.mock("@/app/lib/hooks/useAuth", () => ({
  default: vi.fn(),
}));

vi.mock("@/app/lib/hooks/useGetRecentlyViewedProducts", () => ({
  useGetRecentlyViewedProducts: vi.fn(),
}));

// Mock Swiper components
vi.mock("swiper/react", () => ({
  Swiper: vi.fn(({ children }) => <div data-testid="swiper">{children}</div>),
  SwiperSlide: vi.fn(({ children }) => (
    <div data-testid="swiper-slide">{children}</div>
  )),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe("RecentlyViewedProducts Component", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      imageURL: "/product1.jpg",
      price: 29.99,
      description: "Test product 1",
    },
    {
      id: "2",
      name: "Product 2",
      imageURL: "/product2.jpg",
      price: 39.99,
      description: "Test product 2",
    },
  ];

  const mockUser = {
    uid: "test-user-123",
    email: "test@example.com",
  };

  it("renders loading skeleton during authentication", () => {
    // Mock auth loading state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
    });

    // Mock products hook
    vi.mocked(useGetRecentlyViewedProducts).mockReturnValue({
      getRecentlyViewedProducts: vi.fn(),
      productsLoading: false,
    });

    render(<RecentlyViewedProducts />);

    const skeleton = screen.getByTestId("products-row-skeleton");
    expect(skeleton).toBeTruthy();
  });

  it("renders loading skeleton during product loading", () => {
    // Mock auth complete
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock products loading
    vi.mocked(useGetRecentlyViewedProducts).mockReturnValue({
      getRecentlyViewedProducts: vi.fn(),
      productsLoading: true,
    });

    render(<RecentlyViewedProducts />);

    const skeleton = screen.getByTestId("products-row-skeleton");
    expect(skeleton).toBeTruthy();
  });

  it("renders products for authenticated user", async () => {
    // Mock successful auth
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock successful product fetch
    const mockGetRecentlyViewedProducts = vi
      .fn()
      .mockResolvedValue(mockProducts);
    vi.mocked(useGetRecentlyViewedProducts).mockReturnValue({
      getRecentlyViewedProducts: mockGetRecentlyViewedProducts,
      productsLoading: false,
    });

    render(<RecentlyViewedProducts />);

    // Wait for products to render
    await waitFor(() => {
      expect(screen.getByText("Recently Viewed Products")).toBeTruthy();
      expect(screen.getByText("Product 1")).toBeTruthy();
      expect(screen.getByText("Product 2")).toBeTruthy();
      expect(screen.getByText("$29.99")).toBeTruthy();
      expect(screen.getByText("$39.99")).toBeTruthy();
    });

    // Verify product fetch was called with correct user ID
    expect(mockGetRecentlyViewedProducts).toHaveBeenCalledWith(mockUser.uid);
  });
});
