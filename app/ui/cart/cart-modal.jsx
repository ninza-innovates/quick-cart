import { NotificationBanner } from "../notification-banner";
import { useAddOrder } from "@/app/lib/hooks/useAddOrder";
import { useDeleteFromCart } from "@/app/lib/hooks/useDeleteFromCart";
import { useGetStockQuantity } from "@/app/lib/hooks/useGetStockQuantity";
import { useUpdateStockQuantity } from "@/app/lib/hooks/useUpdateStockQuantity";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import useAuth from "@/app/lib/hooks/useAuth";
import Image from "next/image";
import React from "react";

export default function CartModal({ item, onClose, onItemRemoved }) {
  const { addOrder } = useAddOrder();
  const { deleteFromCart } = useDeleteFromCart();
  const { user } = useAuth();
  const { stockQuantity, loading: stockLoading } = useGetStockQuantity(
    item.productId
  ); // Takes a product ID as an argument
  const { updateStockQuantity } = useUpdateStockQuantity(); // Takes a product ID and quantity as arguments
  const [totalPrice, setTotalPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityBanner, setShowQuantityBanner] = useState(false);
  const [showOrderBanner, setShowOrderBanner] = useState(false);
  const [showShippingBanner, setShowShippingBanner] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState({
    date: "",
    price: 0,
  });
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);

  const handleAddOrder = async () => {
    if (stockQuantity < quantity) {
      setShowQuantityBanner(true);
      setTimeout(() => {
        setShowQuantityBanner(false);
      }, 3000);
      return;
    }

    if (selectedShipping.date === "") {
      setShowShippingBanner(true);
      setTimeout(() => {
        setShowShippingBanner(false);
      }, 3000);
      return;
    }

    await addOrder({
      userId: user.uid,
      productName: item.name,
      imageURL: item.imageURL,
      description: item.description,
      totalPrice: item.price * quantity + selectedShipping.price,
      quantity: quantity,
      arrivalDate: selectedShipping.date,
    });

    await updateStockQuantity(item.productId, quantity);
    // Remove the item from the cart after successful order placement
    await deleteFromCart(item.id);

    if (onItemRemoved) {
      onItemRemoved(item.id);
    }

    setShowOrderBanner(true);
    setTimeout(() => {
      setShowOrderBanner(false);
      onClose();
    }, 3000);
  };

  const handleDeleteItem = async () => {
    await deleteFromCart(item.id);
    if (onItemRemoved) {
      onItemRemoved(item.id);
    }
    onClose();
  };

  // Get the current date
  const orderDate = new Date();

  const threeDayArrival = new Date();
  threeDayArrival.setDate(orderDate.getDate() + 3);

  const fiveDayArrival = new Date();
  fiveDayArrival.setDate(orderDate.getDate() + 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full h-full overflow-y-auto">
        {/* Close Button */}
        <span
          className="absolute top-2 right-2 text-2xl cursor-pointer text-gray-700 hover:text-red-600"
          onClick={onClose}
          title="Close"
        >
          &times;
        </span>
        {/* Product Details */}
        <div className="flex flex-col sm:flex-row gap-6 border-b border-gray-300 pb-4">
          {/* Image */}
          <Image
            src={item.imageURL}
            alt={item.name}
            width={80}
            height={80}
            className="w-48 h-48 object-cover rounded-xl"
          />

          {/* Info Section */}
          <div className="flex-1">
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold">{item.name}</h2>
              <p className="text-gray-600 text-lg mt-1">
                ${item.price.toFixed(2)}
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-2">{item.description}</p>

            {/* Quantity Selection */}
            <div className="mt-4">
              <h2 className="text-xl font-medium">
                {stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </h2>
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700"
              >
                Quantity:
              </label>
              <select
                id="quantity"
                name="quantity"
                className="ml-2 px-3 py-1 border border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={quantity}
                onChange={(e) => {
                  const selectedQuantity = parseInt(e.target.value, 10);
                  setQuantity(selectedQuantity);
                  setTotalPrice(
                    item.price * selectedQuantity + selectedShipping.price
                  );
                }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="relative mt-2">
                <button
                  className="text-blue-400 hover:text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => setShowReturnPolicy(!showReturnPolicy)}
                >
                  FREE Returns <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* Floating Text (Always below button) */}
                {showReturnPolicy && (
                  <div className="absolute top-full mt-1 w-48 p-2 bg-white shadow-lg border-2 border-dark rounded-md text-sm text-gray-600 z-10">
                    We offer free returns within 30 days of purchase.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Options */}
        <div className="mt-4">
          <h3 className="text-lg font-medium">Choose a shipping option:</h3>
          <div className="flex gap-4 mt-2">
            {[
              { date: threeDayArrival, price: 5.99 },
              { date: fiveDayArrival, price: 2.99 },
            ].map((option) => (
              <button
                key={option.date}
                className={`border-2 px-4 py-2 rounded-md transition ${
                  selectedShipping.date === option.date.toLocaleDateString()
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-400 hover:bg-gray-100"
                }`}
                onClick={() => {
                  setSelectedShipping({
                    date: option.date.toLocaleDateString(),
                    price: option.price,
                  });
                  setTotalPrice(item.price * quantity + option.price);
                }}
              >
                <p className="font-semibold">
                  {option.date.toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm">
                  ${option.price.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div className="mt-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Total Price:</h3>
          <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition"
            onClick={handleAddOrder}
          >
            Buy Now
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
            onClick={handleDeleteItem}
          >
            Delete Item
          </button>
        </div>
      </div>
      {showQuantityBanner && (
        <NotificationBanner text="Not enough stock available!" />
      )}
      {showOrderBanner && (
        <NotificationBanner text="Order placed successfully!" />
      )}
      {showShippingBanner && (
        <NotificationBanner text="Please select a shipping option." />
      )}
    </div>
  );
}
