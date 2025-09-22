"use client";

import { useEffect, useState, useRef } from "react";
import { useGetRecentlyViewedProducts } from "@/app/lib/hooks/useGetRecentlyViewedProducts";
import ProductModal from "../products/product-modal";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import useAuth from "@/app/lib/hooks/useAuth";
import Image from "next/image";
import { ProductsRowSkeleton } from "../skeletons";
import React from "react";

export default function RecentlyViewedProducts() {
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const { user, loading: authLoading } = useAuth();
  const { getRecentlyViewedProducts, productsLoading } =
    useGetRecentlyViewedProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Only fetch data when authentication is complete and we have a user
    if (!authLoading && user) {
      async function fetchData() {
        const products = await getRecentlyViewedProducts(user.uid);
        setRecentlyViewedProducts(products);
      }
      fetchData();
    }
  }, [user, authLoading, getRecentlyViewedProducts]);

  // Show loading state when either auth is loading or products are loading
  if (authLoading || productsLoading) {
    return <ProductsRowSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        Recently Viewed Products
      </h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={1} // Dynamically adjust using breakpoints
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
      >
        {recentlyViewedProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <div
              className="border rounded-lg shadow-md p-4 h-full cursor-pointer dark:bg-white"
              onClick={() => setSelectedProduct(product)}
            >
              <Image
                src={product.imageURL}
                alt={product.name}
                width={150}
                height={150}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2 truncate">
                {product.name}
              </h3>
              <p className="text-lg font-bold">${product.price}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
