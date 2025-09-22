import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Settings from "./settings"; // Adjust path if necessary
import useAuth from "@/app/lib/hooks/useAuth";
import { useDeleteAccount } from "@/app/lib/hooks/useDeleteAccount";
import { useGetUserOrderCount } from "@/app/lib/hooks/useGetUserOrderCount";
import { userGetUserCartCount } from "@/app/lib/hooks/useGetUserCartCount";
import React from "react";

// Mock dependencies
vi.mock("@/app/lib/hooks/useAuth");
vi.mock("@/app/lib/hooks/useDeleteAccount");
vi.mock("@/app/lib/hooks/useGetUserOrderCount");
vi.mock("@/app/lib/hooks/useGetUserCartCount");

describe("Settings Component", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "123", displayName: "John Doe", email: "john@example.com" },
    });

    vi.mocked(useDeleteAccount).mockReturnValue({
      deleteAccount: vi.fn(),
      loading: false,
      error: null,
    });

    vi.mocked(useGetUserOrderCount).mockReturnValue({ orderCount: 5 });
    vi.mocked(userGetUserCartCount).mockReturnValue({ cartCount: 3 });
  });

  it("renders user details correctly", () => {
    render(<Settings />);
    expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
    expect(screen.getAllByText("john@example.com")[0]).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows the delete confirmation modal when delete button is clicked", () => {
    render(<Settings />);
    fireEvent.click(screen.getByText("Delete Account"));
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("closes the modal when clicking 'No, Keep Account'", () => {
    render(<Settings />);
    fireEvent.click(screen.getByText("Delete Account"));
    fireEvent.click(screen.getByText("No, Keep Account"));
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("calls deleteAccount when clicking 'Yes, Delete'", () => {
    const mockDeleteAccount = vi.fn();
    vi.mocked(useDeleteAccount).mockReturnValue({
      deleteAccount: mockDeleteAccount,
      loading: false,
      error: null,
    });

    render(<Settings />);
    fireEvent.click(screen.getByText("Delete Account"));
    fireEvent.click(screen.getByText("Yes, Delete"));

    expect(mockDeleteAccount).toHaveBeenCalled();
  });
});
