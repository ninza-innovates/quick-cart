import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import CartList from "./cart-list";
import useAuth from "@/app/lib/hooks/useAuth";
import { useGetUserCart } from "@/app/lib/hooks/useGetUserCart";
import React from "react";

vi.mock("@/app/lib/hooks/useAuth");
vi.mock("@/app/lib/hooks/useGetUserCart");

const mockUser = { uid: "123" };
const mockCartItems = [
  {
    id: "1",
    name: "Test Item",
    price: 10.99,
    description: "A sample item for testing purposes.",
    imageURL: "/test-image.jpg",
  },
];

describe("CartList Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  it("renders empty cart message when no items are present", () => {
    useGetUserCart.mockReturnValue({
      cartItems: [],
      loading: false,
      updateCartItems: vi.fn(),
    });
    render(<CartList />);

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("renders cart items when items are present", () => {
    useGetUserCart.mockReturnValue({
      cartItems: mockCartItems,
      loading: false,
      updateCartItems: vi.fn(),
    });
    render(<CartList />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("$10.99")).toBeInTheDocument();
  });
});
