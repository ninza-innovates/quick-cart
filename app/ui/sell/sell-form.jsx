"use client";

import { useState } from "react";
import { useAddProduct } from "@/app/lib/hooks/useAddProduct";

export default function SellForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const { addProduct } = useAddProduct();

  const createProduct = () => {
    addProduct({
      name,
      price: parseFloat(price) || 0,
      imageURL,
      category,
      description,
      stockQuantity: parseInt(stockQuantity) || 0,
    });
    setName("");
    setPrice("");
    setImageURL("");
    setCategory("");
    setDescription("");
    setStockQuantity("");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border-4">
      <h2 className="text-2xl font-semibold mb-4">Sell a Product</h2>

      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        Name
      </label>
      <input
        id="name"
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label
        htmlFor="price"
        className="block text-sm font-medium text-gray-700"
      >
        Price ($)
      </label>
      <input
        id="price"
        type="number"
        step="0.01"
        className="w-full p-2 border rounded-md mb-4"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <label
        htmlFor="imageURL"
        className="block text-sm font-medium text-gray-700"
      >
        Image URL
      </label>
      <input
        id="imageURL"
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        value={imageURL}
        onChange={(e) => setImageURL(e.target.value)}
      />

      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700"
      >
        Category
      </label>
      <input
        id="category"
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <label
        htmlFor="description"
        className="block text-sm font-medium text-gray-700"
      >
        Description
      </label>
      <textarea
        id="description"
        rows="3"
        className="w-full p-2 border rounded-md mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <label
        htmlFor="stockQuantity"
        className="block text-sm font-medium text-gray-700"
      >
        Stock Quantity
      </label>
      <input
        id="stockQuantity"
        type="number"
        className="w-full p-2 border rounded-md mb-4"
        value={stockQuantity}
        onChange={(e) => setStockQuantity(e.target.value)}
      />

      <button
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500"
        onClick={createProduct}
      >
        Sell Product
      </button>
    </div>
  );
}
