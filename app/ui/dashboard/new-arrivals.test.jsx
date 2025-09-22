import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NewArrivals from "./new-arrivals";
import { useGetNewArrivalProducts } from "@/app/lib/hooks/useGetNewArrivalProducts";
import React from "react";

// Mock the hook and Swiper components
vi.mock("@/app/lib/hooks/useGetNewArrivalProducts", () => ({
  useGetNewArrivalProducts: vi.fn(),
}));

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

// Mock ProductModal
vi.mock("../products/product-modal", () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="product-modal" />),
}));

describe("NewArrivals Component", () => {
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

  it("renders loading skeleton when products are loading", () => {
    // Mock loading state
    vi.mocked(useGetNewArrivalProducts).mockReturnValue({
      newArrivals: [],
      loading: true,
    });

    render(<NewArrivals />);

    const skeleton = screen.getByTestId("products-row-skeleton");
    expect(skeleton).toBeTruthy();
  });

  it("renders products when loading is complete", async () => {
    // Mock successful data fetch
    vi.mocked(useGetNewArrivalProducts).mockReturnValue({
      newArrivals: mockProducts,
      loading: false,
    });

    render(<NewArrivals />);

    // Wait for products to render
    await waitFor(() => {
      expect(screen.getByText("New Arrivals")).toBeTruthy();
      expect(screen.getByText("Product 1")).toBeTruthy();
      expect(screen.getByText("Product 2")).toBeTruthy();
      expect(screen.getByText("$29.99")).toBeTruthy();
      expect(screen.getByText("$39.99")).toBeTruthy();
    });
  });

  it("handles empty product list", () => {
    // Mock empty product list
    vi.mocked(useGetNewArrivalProducts).mockReturnValue({
      newArrivals: [],
      loading: false,
    });

    render(<NewArrivals />);

    // Verify header still renders
    expect(screen.getByText("New Arrivals")).toBeTruthy();

    // Verify no product cards are present
    const productCards = screen.queryAllByTestId("swiper-slide");
    expect(productCards).toHaveLength(0);
  });
});
