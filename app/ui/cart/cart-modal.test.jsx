import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartModal from "./cart-modal";
import React from "react";

// Mock the hooks and dependencies
vi.mock("@/app/lib/hooks/useAddOrder", () => ({
  useAddOrder: () => ({
    addOrder: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("@/app/lib/hooks/useDeleteFromCart", () => ({
  useDeleteFromCart: () => ({
    deleteFromCart: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("@/app/lib/hooks/useGetStockQuantity", () => ({
  useGetStockQuantity: () => ({
    stockQuantity: 10,
    loading: false,
  }),
}));

vi.mock("@/app/lib/hooks/useUpdateStockQuantity", () => ({
  useUpdateStockQuantity: () => ({
    updateStockQuantity: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("@/app/lib/hooks/useAuth", () => ({
  default: () => ({
    user: { uid: "test-user-id" },
  }),
}));

describe("CartModal", () => {
  const mockItem = {
    id: "1",
    productId: "product-1",
    name: "Test Product",
    price: 19.99,
    description: "A test product description",
    imageURL: "/test-image.jpg",
  };

  const mockOnClose = vi.fn();
  const mockOnItemRemoved = vi.fn();

  it("renders product details correctly", () => {
    render(
      <CartModal
        item={mockItem}
        onClose={mockOnClose}
        onItemRemoved={mockOnItemRemoved}
      />
    );

    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockItem.price.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();
  });

  it("allows quantity selection", () => {
    render(
      <CartModal
        item={mockItem}
        onClose={mockOnClose}
        onItemRemoved={mockOnItemRemoved}
      />
    );

    const quantitySelect = screen.getByLabelText("Quantity:");
    fireEvent.change(quantitySelect, { target: { value: "3" } });

    expect(quantitySelect.value).toBe("3");
  });

  it("shows shipping banner when no shipping option is selected", async () => {
    render(
      <CartModal
        item={mockItem}
        onClose={mockOnClose}
        onItemRemoved={mockOnItemRemoved}
      />
    );

    const buyNowButton = screen.getByText("Buy Now");
    fireEvent.click(buyNowButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please select a shipping option.")
      ).toBeInTheDocument();
    });
  });

  it("allows shipping option selection", () => {
    render(
      <CartModal
        item={mockItem}
        onClose={mockOnClose}
        onItemRemoved={mockOnItemRemoved}
      />
    );

    const shippingOptions = screen.getAllByRole("button", {
      name: /\d+\/\d+\/\d+/,
    });
    fireEvent.click(shippingOptions[0]);

    // Use a more specific selector for the total price
    const totalPriceElement = screen.getByText((content, element) => {
      return (
        element?.classList.contains("text-2xl") &&
        element?.classList.contains("font-bold") &&
        content.startsWith("$")
      );
    });

    expect(totalPriceElement).toBeInTheDocument();
    expect(totalPriceElement.textContent).toMatch(/\$\d+\.\d{2}/);
  });

  it("handles item deletion", async () => {
    render(
      <CartModal
        item={mockItem}
        onClose={mockOnClose}
        onItemRemoved={mockOnItemRemoved}
      />
    );

    const deleteButton = screen.getByText("Delete Item");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnItemRemoved).toHaveBeenCalledWith(mockItem.id);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows quantity banner when stock is insufficient", async () => {
    // Mock low stock quantity
    vi.mock("@/app/lib/hooks/useGetStockQuantity", () => ({
      useGetStockQuantity: () => ({
        stockQuantity: 1,
        loading: false,
      }),
    }));

    render(
      <CartModal
        item={mockItem}
        onClose={mockOnClose}
        onItemRemoved={mockOnItemRemoved}
      />
    );

    // Select a quantity higher than stock
    const quantitySelect = screen.getByLabelText("Quantity:");
    fireEvent.change(quantitySelect, { target: { value: "3" } });

    // Select shipping option to enable buy now
    const shippingOptions = screen.getAllByRole("button", {
      name: /\d+\/\d+\/\d+/,
    });
    fireEvent.click(shippingOptions[0]);

    const buyNowButton = screen.getByText("Buy Now");
    fireEvent.click(buyNowButton);

    await waitFor(() => {
      expect(
        screen.getByText("Not enough stock available!")
      ).toBeInTheDocument();
    });
  });
});
