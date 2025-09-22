"use client";

import { useGetAllProducts } from "@/app/lib/hooks/useGetAllProducts";
import { useDeleteProduct } from "@/app/lib/hooks/useDeleteProduct";
import { useAddRecentlyViewedProduct } from "@/app/lib/hooks/useAddRecentlyViewedProduct";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductModal from "./product-modal";
import { ProductsGridSkeleton } from "@/app/ui/skeletons";
import useAuth from "../../lib/hooks/useAuth";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

function ProductsListContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { user, loading: authLoading } = useAuth();
  const itemsPerPage = 12;
  const { addRecentlyViewedProduct } = useAddRecentlyViewedProduct();

  const {
    products,
    isSearching,
    loading: productsLoading,
    totalProducts,
    currentPage,
    totalPages,
    loadPage,
    goToSearchPage,
  } = useGetAllProducts(itemsPerPage, query);

  const { deleteProduct } = useDeleteProduct();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    await addRecentlyViewedProduct(user?.uid, product.id);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productID) => {
    await deleteProduct(productID);
    setSelectedProduct(null);
    loadPage(currentPage); // Re-fetch products for the current page
  };

  // Navigation functions
  const goToPage = (page) => {
    if (isSearching) {
      goToSearchPage(page);
    } else {
      loadPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
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

  const loading = authLoading || productsLoading;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + products.length - 1, totalProducts);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="text-xl font-semibold">
          {query ? (
            <span className="dark:text-white">
              Found {totalProducts} products matching &quot;{query}&quot;
            </span>
          ) : (
            <span className="dark:text-white">All Products</span>
          )}
        </div>

        {totalProducts > 0 && (
          <div className="text-sm text-gray-500 mt-2 sm:mt-0 dark:text-white">
            Showing {startIndex}-{endIndex} of {totalProducts}
          </div>
        )}
      </div>

      {loading ? (
        <ProductsGridSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-white">
          {query
            ? `No products found matching "${query}"`
            : "No products available."}
          <div className="mt-4">
            Cannot find what you are looking for? Try searching on these
            websites:
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Link
                href="https://www.amazon.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Amazon
              </Link>
              <Link
                href="https://www.ebay.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Ebay
              </Link>
              <Link
                href="https://www.walmart.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Walmart
              </Link>
              <Link
                href="https://www.target.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Target
              </Link>
              <Link
                href="https://www.bestbuy.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Best Buy
              </Link>
              <Link
                href="https://www.costco.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Costco
              </Link>
              <Link
                href="https://www.macys.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Macys
              </Link>
              <Link
                href="https://www.kohls.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Kohls
              </Link>
              <Link
                href="https://www.homedepot.com/"
                className="underline text-blue-400 hover:text-blue-500"
                target="_blank"
              >
                Home Depot
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative border p-4 rounded-lg shadow-md bg-white cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <Image
                src={product.imageURL}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
                priority={true}
              />
              <h2 className="text-md xl:text-lg font-semibold mt-2">
                {product.name}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden">
                {product.description.split(" ").slice(0, 10).join(" ")}...
              </p>
              <p className="text-lg font-bold mt-2">${product.price}</p>
              {user?.email === "bob@gmail.com" && (
                <button
                  className="flex mt-2 h-10 items-center rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition-colors hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(product.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls - Only show when not searching */}
      {!query && totalPages > 1 && (
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

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default function ProductsList() {
  return (
    <Suspense fallback={<ProductsGridSkeleton />}>
      <ProductsListContent />
    </Suspense>
  );
}
