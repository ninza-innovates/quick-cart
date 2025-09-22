import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const useDeleteReview = () => {
  const deleteReview = async ({ productId, reviewId }) => {
    try {
      const productRef = doc(db, "products", productId); // ✅ Correct document reference

      // Get the current product data
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) throw new Error("Product not found");

      const productData = productSnap.data();
      const updatedReviews = productData.reviews.filter(
        (review) => review.id !== reviewId
      );

      // Update Firestore
      await updateDoc(productRef, { reviews: updatedReviews });
    } catch (error) {
      console.error("Error deleting review: ", error);
    }
  };

  return { deleteReview };
};
