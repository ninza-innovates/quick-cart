"use client";

import { useGetUserCart } from "@/app/lib/hooks/useGetUserCart";
import useAuth from "@/app/lib/hooks/useAuth";
import { useState } from "react";
import CartModal from "./cart-modal";
import Image from "next/image";
import React from "react";

export default function CartList() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, loading, updateCartItems } = useGetUserCart(user?.uid);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleItemRemoved = (itemId) => {
    // Use the provided function to update cart items
    updateCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center border-b border-gray-300 py-4"
          >
            <Image
              src={item.imageURL}
              alt={item.name}
              width={150}
              height={150}
              className="w-40 h-40 sm:w-48 sm:h-48  object-cover rounded-lg mr-4"
              priority={true}
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  {item.name}
                </h3>
                <p className="text-md font-semibold text-gray-700 mt-2">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {item.description.split(" ").slice(0, 10).join(" ")}...
              </p>

              <div className="flex items-center mt-3 space-x-3">
                <button
                  onClick={() => handleItemClick(item)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      {selectedItem && (
        <CartModal
          item={selectedItem}
          onClose={handleCloseModal}
          onItemRemoved={handleItemRemoved}
        />
      )}
    </div>
  );
}
