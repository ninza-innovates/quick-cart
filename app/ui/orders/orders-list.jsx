"use client";

import React from "react";
import { useGetUserOrders } from "@/app/lib/hooks/useGetUserOrders";
import useAuth from "@/app/lib/hooks/useAuth";
import OrderModal from "./order-modal";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function OrdersList() {
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState("all time");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 9;

  const {
    userOrders,
    loading: ordersLoading,
    totalOrders,
    currentPage,
    totalPages,
    loadPage,
  } = useGetUserOrders(user?.uid, itemsPerPage, filter);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    // The hook will reset to page 1 when filter changes
  };

  // Navigation functions
  const goToPage = (page) => {
    loadPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1);
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const loading = authLoading || ordersLoading;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + userOrders.length - 1, totalOrders);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="dark:text-white">
          {totalOrders} orders placed in
          <select
            className="ml-2 bg-gray-200 border rounded-md p-1 dark:bg-dark"
            value={filter}
            onChange={handleFilterChange}
            disabled={loading}
          >
            <option>all time</option>
            <option>last 30 days</option>
            <option>past 3 months</option>
            <option>past year</option>
          </select>
        </div>

        {totalOrders > 0 && (
          <div className="text-sm text-gray-500 mt-2 sm:mt-0 dark:text-white">
            Showing {startIndex}-{endIndex} of {totalOrders}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div
            className="loader p-4 rounded-full animate-spin border-4 border-gray-300 border-t-blue-600 h-12 w-12"
            data-testid="loader"
          ></div>
        </div>
      ) : userOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-white">
          No orders found for the selected time period.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userOrders.map((order) => {
            const now = new Date();
            const arrivalDate = new Date(order.arrivalDate);

            let statusText = "";
            let statusColor = "";

            if (order.returnStatus) {
              statusText = "Returned";
              statusColor = "bg-yellow-500"; // Yellow for return
            } else if (now >= arrivalDate) {
              statusText = "Delivered";
              statusColor = "bg-green-500"; // Green for delivered
            } else {
              statusText = "On its way";
              statusColor = "bg-blue-500"; // Blue for shipping
            }

            return (
              <div
                key={order.id}
                className="relative border p-4 rounded-lg shadow-md bg-white cursor-pointer"
                onClick={() => handleOrderClick(order)}
              >
                {/* Status Tag */}
                <div
                  className={`absolute top-2 left-2 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}
                >
                  {statusText}
                </div>

                <Image
                  src={order.imageURL}
                  alt={order.productName}
                  width={150}
                  height={150}
                  className="w-full h-48 object-cover rounded-lg"
                  priority={true}
                />
                <h2 className="text-md xl:text-lg font-semibold mt-2">
                  {order.productName}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden">
                  {order.description.split(" ").slice(0, 10).join(" ")}...
                </p>
                <p className="text-gray-500">Ordered on {order.orderedAt}</p>
                <p className="text-gray-500">Quantity: {order.quantity}</p>
                <p className="text-lg font-bold mt-2">
                  Total: ${order.totalPrice}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1 || loading}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === 1 || loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="mx-1 px-2">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || loading}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === totalPages || loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={handleCloseModal}
          loadPage={loadPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}
