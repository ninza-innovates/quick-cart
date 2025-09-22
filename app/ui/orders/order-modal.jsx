import { useRouter } from "next/navigation";
import Image from "next/image";
import { NotificationBanner } from "../notification-banner";
import { useUpdateReturnStatus } from "@/app/lib/hooks/useUpdateReturnStatus";
import { useState } from "react";
import React from "react";

export default function OrderModal({ order, onClose, loadPage, currentPage }) {
  const router = useRouter();
  const [showNoReturnBanner, setShowNoReturnBanner] = useState(false);
  const [showReturnBanner, setShowReturnBanner] = useState(false);
  const { updateReturnStatus } = useUpdateReturnStatus();

  const redirectToProduct = () => {
    router.push("/dashboard/products");
  };

  const handleReturnItem = async () => {
    // If current date - arrival date is more than 30 days, return is not allowed
    // Otherwise, return the item
    if (new Date() - new Date(order.arrivalDate) > 30 * 24 * 60 * 60 * 1000) {
      setShowNoReturnBanner(true);
      setTimeout(() => {
        setShowNoReturnBanner(false);
      }, 3000);
      return;
    }

    // Implement return item logic here
    await updateReturnStatus(order.id); // Wait for the update to complete

    setShowReturnBanner(true);
    // Keep showing the banner for success before closing
    setTimeout(() => {
      setShowReturnBanner(false);
      onClose(); // Close the modal
      loadPage(currentPage); // Reload the current page to refresh the data
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {showNoReturnBanner && (
          <NotificationBanner text="You cannot return this item as it has been more than 30 days since it arrived." />
        )}
        {showReturnBanner && (
          <NotificationBanner text="Item returned successfully." />
        )}
        <h2 className="text-xl font-semibold text-center">Order Details</h2>
        <div className="mt-4">
          <span
            className="absolute top-2 right-4 text-2xl cursor-pointer text-gray-700 hover:text-red-600"
            onClick={onClose}
            title="Close"
          >
            &times;
          </span>
          <div className="flex items-center justify-center">
            <Image
              src={order.imageURL}
              alt={order.productName}
              width={150}
              height={150}
              className="w-72 h-48 object-cover rounded-md"
            />
          </div>

          <h2 className="text-xl font-semibold mt-6">{order.productName}</h2>
          <p className="text-gray-600">{order.description}</p>
          <p className="text-gray-500 mt-6">Ordered on {order.orderedAt}</p>
          <p className="text-gray-500">
            Estimated arrival: {order.arrivalDate}
          </p>
          <p className="text-gray-500">Quantity: {order.quantity}</p>
          <p className="text-lg font-bold mt-2">Total: ${order.totalPrice}</p>

          {/* Add status display in the modal too */}
          <p className="mt-4">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${
                order.returnStatus
                  ? "bg-yellow-500"
                  : new Date() >= new Date(order.arrivalDate)
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
            >
              {order.returnStatus
                ? "Returned"
                : new Date() >= new Date(order.arrivalDate)
                ? "Delivered"
                : "On its way"}
            </span>
          </p>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={redirectToProduct}
            className="mt-4 w-48 bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
          >
            Buy again?
          </button>
          <button
            onClick={handleReturnItem}
            className={`mt-4 w-48 bg-amber-500 text-white py-2 rounded-md ${
              order.returnStatus
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-amber-600"
            }`}
            disabled={order.returnStatus}
          >
            {order.returnStatus ? "Already Returned" : "Return item"}
          </button>
        </div>
      </div>
    </div>
  );
}
