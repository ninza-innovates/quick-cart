import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

export const useAddReview = () => {
  const addReview = async ({
    productId,
    reviewText,
    userId,
    userName,
    rating,
  }) => {
    if (
      !productId ||
      !reviewText ||
      !userId ||
      !userName ||
      rating === undefined
    ) {
      console.error("Missing required fields for review submission.");
      return;
    }

    try {
      const productRef = doc(db, "products", productId);

      await updateDoc(productRef, {
        reviews: arrayUnion({
          id: uuidv4(),
          userId,
          userName,
          reviewText,
          rating,
          createdAt: new Date().toLocaleDateString(),
        }),
      });
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  };

  return { addReview };
};
