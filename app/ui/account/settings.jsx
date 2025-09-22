"use client";

import { useState } from "react";
import { useDeleteAccount } from "../../lib/hooks/useDeleteAccount";
import { useGetUserOrderCount } from "@/app/lib/hooks/useGetUserOrderCount";
import { userGetUserCartCount } from "@/app/lib/hooks/useGetUserCartCount";
import useAuth from "@/app/lib/hooks/useAuth";
import { User, Mail, ShoppingBag, Trash2 } from "lucide-react"; // Import icons
import Image from "next/image";
import React from "react";

export default function Settings() {
  const { deleteAccount, loading, error } = useDeleteAccount();
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { orderCount } = useGetUserOrderCount(user?.uid);
  const { cartCount } = userGetUserCartCount(user?.uid);

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
      {/* Profile Section */}
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
        <div className="w-14 h-14 bg-gray-300 rounded-full overflow-hidden">
          <Image
            src="/blankprofilepic.webp"
            alt="User Profile Picture"
            width={56}
            height={56}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.displayName || "User"}</h2>
          <p className="text-sm opacity-80">{user?.email}</p>
        </div>
      </div>

      {/* User Details */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700 font-semibold">Name:</span>
        </div>
        <p className="text-gray-600">{user?.displayName}</p>

        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700 font-semibold">Email:</span>
        </div>
        <p className="text-gray-600">{user?.email}</p>

        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700 font-semibold">Total Orders:</span>
        </div>
        <p className="text-gray-600">{orderCount}</p>

        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
          <span className="text-gray-700 font-semibold">
            Total items in Cart:
          </span>
        </div>
        <p className="text-gray-600">{cartCount}</p>
      </div>

      {/* Delete Account Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 focus:outline-none"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure?
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              This action is permanent and cannot be undone.
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                No, Keep Account
              </button>
              <button
                className="bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600"
                onClick={() => {
                  deleteAccount();
                  setShowModal(false);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
