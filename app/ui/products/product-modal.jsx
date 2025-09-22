import { useState, useMemo } from "react";
import { useAddReview } from "@/app/lib/hooks/useAddReview";
import { useDeleteReview } from "@/app/lib/hooks/useDeleteReview";
import { useAddOrder } from "@/app/lib/hooks/useAddOrder";
import { useUpdateStockQuantity } from "@/app/lib/hooks/useUpdateStockQuantity";
import { useAddToCart } from "@/app/lib/hooks/useAddToCart";
import useAuth from "@/app/lib/hooks/useAuth";
import { FaStar, FaStarHalfAlt, FaRegStar, FaTrash } from "react-icons/fa";
import { NotificationBanner } from "../notification-banner";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React from "react";

// ⭐ Star Rating Component
const StarRating = ({ rating, setRating, disabled = false }) => {
  return (
    <div className="flex space-x-1 mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer text-2xl ${
            star <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
          onClick={() => !disabled && setRating(star)}
        />
      ))}
    </div>
  );
};

// ⭐ Function to render average rating stars
const AverageStarRating = ({ averageRating }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        if (averageRating >= star) {
          return <FaStar key={star} className="text-yellow-500 text-xl" />;
        } else if (averageRating >= star - 0.5) {
          return (
            <FaStarHalfAlt key={star} className="text-yellow-500 text-xl" />
          );
        } else {
          return <FaRegStar key={star} className="text-gray-300 text-xl" />;
        }
      })}
      <span className="text-gray-600 text-sm ml-1">
        ({averageRating.toFixed(1)})
      </span>
    </div>
  );
};

const Reviews = ({ reviews, product, user, handleDeleteReview }) => {
  return (
    <div className="mt-4 border-2 border-black p-4 rounded-md">
      <h2 className="text-xl font-medium">Reviews</h2>
      <div className="mt-2">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border-b border-gray-300 py-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{review.userName}</p>
                <span className="text-yellow-500 text-sm">
                  ⭐ {review.rating} / 5
                </span>
              </div>
              <p className="text-gray-800 text-sm">{review.createdAt}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-600">{review.reviewText}</p>
              {/* Trash icon for deleting the review */}
              {user?.uid === review.userId && (
                <FaTrash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDeleteReview(product.id, review.id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WriteReview = ({
  showRatingBanner,
  rating,
  setRating,
  reviewText,
  setReviewText,
  handleAddReview,
}) => {
  return (
    <div className="mt-4 border-2 border-black p-4 rounded-md">
      <label
        htmlFor="review"
        className="block text-sm font-medium text-gray-700"
      >
        Write a review
      </label>
      {showRatingBanner && (
        <NotificationBanner text="Please select a rating before posting your review." />
      )}
      <StarRating
        rating={rating}
        setRating={setRating}
        data-testid="star-rating"
      />
      <div className="mt-1 flex gap-2">
        <textarea
          id="review"
          name="review"
          placeholder="What should others know about this product?"
          className="mt-1 block h-20 w-full pl-3 pr-10 py-2 text-base border-2 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        ></textarea>
        <div className="flex justify-center items-end">
          <button
            className="h-10 bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handleAddReview}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = ({ product, averageRating }) => {
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  return (
    <>
      <Image
        src={product.imageURL}
        alt={product.name}
        width={150}
        height={150}
        className="w-full h-48 object-contain rounded-md"
      />
      <h2 className="text-2xl font-semibold mt-2">{product.name}</h2>
      <p className="text-gray-600">{product.description}</p>
      <div className="flex items-center justify-between gap-2 mt-2 relative">
        <p className="text-lg font-bold">${product.price}</p>

        {/* Button Wrapper (Ensures text appears directly below) */}
        <div className="relative">
          <button
            className="text-blue-400 hover:text-blue-600 hover:underline flex items-center gap-1"
            onClick={() => setShowReturnPolicy(!showReturnPolicy)}
          >
            FREE Returns <ChevronDownIcon className="w-4 h-4" />
          </button>

          {/* Floating Text (Always below button) */}
          {showReturnPolicy && (
            <div className="absolute top-full mt-1 right-2 w-48 p-2 bg-white shadow-lg border-2 border-dark rounded-md text-sm text-gray-600 z-10">
              We offer free returns within 30 days of purchase.
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <AverageStarRating averageRating={averageRating} />
      </div>
    </>
  );
};

const StockAndPurchase = ({
  product,
  quantity,
  setQuantity,
  totalPrice,
  setTotalPrice,
  selectedShipping,
  setSelectedShipping,
  threeDayArrival,
  fiveDayArrival,
  handleAddOrder,
  handleAddToCart,
  showQuantityBanner,
  showOrderBanner,
  showCartBanner,
  showShippingBanner,
}) => {
  return (
    <div className="mt-4 border-2 border-black p-4 rounded-md">
      <h2 className="text-xl font-medium">
        {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
      </h2>
      <label
        htmlFor="quantity"
        className="block text-sm font-medium text-gray-700"
      >
        Quantity
      </label>
      <select
        id="quantity"
        name="quantity"
        className="mt-1 block w-18 pl-3 pr-10 py-2 text-base border-2 border-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={quantity}
        onChange={(e) => {
          const selectedQuantity = parseInt(e.target.value, 10);
          setQuantity(selectedQuantity);
          setTotalPrice(
            product.price * selectedQuantity + selectedShipping.price
          );
        }}
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Choose a shipping option:</h3>
        <div className="flex gap-4">
          {[
            { date: threeDayArrival, price: 5.99 },
            { date: fiveDayArrival, price: 2.99 },
          ].map((option) => (
            <button
              key={option.date}
              className={`border-2 px-4 py-2 rounded-md transition ${
                selectedShipping.date === option.date.toLocaleDateString()
                  ? "border-blue-500 bg-blue-100"
                  : "border-black hover:bg-gray-100"
              }`}
              onClick={() => {
                setSelectedShipping({
                  date: option.date.toLocaleDateString(),
                  price: option.price,
                });
                setTotalPrice(product.price * quantity + option.price);
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
        <div className="mt-2 flex gap-2">
          <h3 className="text-lg font-medium">Total Price:</h3>
          <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
        </div>
      </div>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md block hover:bg-blue-600"
        onClick={handleAddToCart}
      >
        Add to cart
      </button>
      <button
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        onClick={handleAddOrder}
      >
        Buy Now
      </button>
      {showQuantityBanner && (
        <NotificationBanner text="Not enough stock available!" />
      )}
      {showOrderBanner && (
        <NotificationBanner text="Order placed successfully!" />
      )}
      {showCartBanner && <NotificationBanner text="Item added to cart!" />}
      {showShippingBanner && (
        <NotificationBanner text="Please select a shipping option." />
      )}
    </div>
  );
};

export default function ProductModal({ product, onClose }) {
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState(product.reviews || []);
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showRatingBanner, setShowRatingBanner] = useState(false);
  const [showOrderBanner, setShowOrderBanner] = useState(false);
  const [showCartBanner, setShowCartBanner] = useState(false);
  const [showQuantityBanner, setShowQuantityBanner] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState({
    date: "",
    price: 0,
  });
  const [showShippingBanner, setShowShippingBanner] = useState(false);
  const [totalPrice, setTotalPrice] = useState(product.price);
  const { user, loading } = useAuth(); // Get the authenticated user
  const { addReview } = useAddReview();
  const { deleteReview } = useDeleteReview();
  const { addOrder } = useAddOrder();
  const { updateStockQuantity } = useUpdateStockQuantity();
  const { addToCart } = useAddToCart();

  // Get the current date
  const orderDate = new Date();

  const threeDayArrival = new Date();
  threeDayArrival.setDate(orderDate.getDate() + 3);

  const fiveDayArrival = new Date();
  fiveDayArrival.setDate(orderDate.getDate() + 5);

  // Calculate the average rating using useMemo to optimize performance
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const handleAddReview = () => {
    if (!rating) {
      setShowRatingBanner(true);
      setTimeout(() => {
        setShowRatingBanner(false);
      }, 3000);
      return;
    }

    const newReview = {
      userId: user.uid,
      userName: user.displayName,
      reviewText: reviewText,
      rating,
      createdAt: new Date().toLocaleDateString(),
    };

    addReview({
      productId: product.id,
      reviewText: reviewText,
      userId: user.uid,
      userName: user.displayName,
      rating,
    });

    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setReviewText(""); // Reset review text
    setRating(0); // Reset rating after submission
  };

  const handleDeleteReview = async (productId, reviewId) => {
    try {
      // Call Firestore function to delete the review
      await deleteReview({ productId, reviewId });

      // Update local state to remove review
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
    } catch (error) {
      console.error("Error deleting review: ", error);
    }
  };

  const handleAddOrder = () => {
    if (product.stockQuantity < quantity) {
      setShowQuantityBanner(true);
      setTimeout(() => {
        setShowQuantityBanner(false);
      }, 3000);
      return;
    }

    if (!selectedShipping.date) {
      setShowShippingBanner(true);
      setTimeout(() => {
        setShowShippingBanner(false);
      }, 3000);
      return;
    }

    addOrder({
      userId: user.uid,
      productName: product.name,
      imageURL: product.imageURL,
      description: product.description,
      totalPrice: product.price * quantity + selectedShipping.price,
      quantity: quantity,
      arrivalDate: selectedShipping.date,
    });

    updateStockQuantity(product.id, quantity);
    setShowOrderBanner(true);
    setTimeout(() => {
      setShowOrderBanner(false);
      onClose();
    }, 3000);
  };

  const handleAddToCart = () => {
    addToCart(
      product.id,
      user?.uid,
      product.name,
      product.price,
      product.imageURL,
      product.category,
      product.description
    );
    setShowCartBanner(true);
    setTimeout(() => {
      setShowCartBanner(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full h-full overflow-y-auto">
        <span
          className="absolute top-2 right-2 text-2xl cursor-pointer text-gray-700 hover:text-red-600"
          onClick={onClose}
          title="Close"
        >
          &times;
        </span>
        <ProductDetails product={product} averageRating={averageRating} />
        <StockAndPurchase
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          selectedShipping={selectedShipping}
          setSelectedShipping={setSelectedShipping}
          threeDayArrival={threeDayArrival}
          fiveDayArrival={fiveDayArrival}
          handleAddOrder={handleAddOrder}
          handleAddToCart={handleAddToCart}
          showQuantityBanner={showQuantityBanner}
          showOrderBanner={showOrderBanner}
          showCartBanner={showCartBanner}
          showShippingBanner={showShippingBanner}
        />
        <WriteReview
          showRatingBanner={showRatingBanner}
          rating={rating}
          setRating={setRating}
          reviewText={reviewText}
          setReviewText={setReviewText}
          handleAddReview={handleAddReview}
        />
        <Reviews
          reviews={reviews}
          product={product}
          user={user}
          handleDeleteReview={handleDeleteReview}
        />
      </div>
    </div>
  );
}
