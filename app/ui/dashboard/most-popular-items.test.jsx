import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MostPopularItems from "./most-popular-items";
import { useGetTopRatedProducts } from "@/app/lib/hooks/useGetTopRatedProducts";
import React from "react";

// Mock the hook and Swiper components
vi.mock("@/app/lib/hooks/useGetTopRatedProducts", () => ({
  useGetTopRatedProducts: vi.fn(),
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

describe("MostPopularItems Component", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      imageURL: "/product1.jpg",
      averageRating: 4.5,
      price: 29.99, // Add price to mock product
      stock: 10, // Add stock to mock product
      description: "Test product description", // Add description
    },
    {
      id: "2",
      name: "Product 2",
      imageURL: "/product2.jpg",
      averageRating: 4.2,
      price: 39.99, // Add price to mock product
      stock: 5, // Add stock to mock product
      description: "Another test product description",
    },
  ];

  it("renders loading skeleton when products are loading", () => {
    // Mock loading state
    vi.mocked(useGetTopRatedProducts).mockReturnValue({
      getTopRatedProducts: vi.fn(),
      loading: true,
    });

    render(<MostPopularItems />);

    const skeleton = screen.getByTestId("products-row-skeleton");
    expect(skeleton).toBeTruthy();
  });

  it("renders products after loading", async () => {
    // Mock successful data fetch
    const mockGetTopRatedProducts = vi.fn().mockResolvedValue(mockProducts);
    vi.mocked(useGetTopRatedProducts).mockReturnValue({
      getTopRatedProducts: mockGetTopRatedProducts,
      loading: false,
    });

    render(<MostPopularItems />);

    // Wait for products to render
    await waitFor(() => {
      expect(screen.getByText("Most Popular Products")).toBeTruthy();
      expect(screen.getByText("Product 1")).toBeTruthy();
      expect(screen.getByText("Product 2")).toBeTruthy();
    });
  });

  it("displays correct rating for products", async () => {
    const mockGetTopRatedProducts = vi.fn().mockResolvedValue(mockProducts);
    vi.mocked(useGetTopRatedProducts).mockReturnValue({
      getTopRatedProducts: mockGetTopRatedProducts,
      loading: false,
    });

    render(<MostPopularItems />);

    // Wait for products to render
    await waitFor(() => {
      const ratings = screen.getAllByText(/⭐/);
      expect(ratings[0]).toHaveTextContent("4.5 ⭐");
      expect(ratings[1]).toHaveTextContent("4.2 ⭐");
    });
  });
});
