import { useState, useCallback } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export function useGetTopRatedProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTopRatedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);

      const products = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const reviews = data.reviews || [];

        // Compute the average rating
        const totalRatings = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating =
          reviews.length > 0 ? totalRatings / reviews.length : 0;

        return {
          id: doc.id,
          ...data,
          averageRating,
          reviewCount: reviews.length,
        };
      });

      // Sort by highest rating, then by most reviews
      return products
        .sort(
          (a, b) =>
            b.averageRating - a.averageRating || b.reviewCount - a.reviewCount
        )
        .slice(0, 10); // Get top 10 highest-rated products
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { getTopRatedProducts, loading, error };
}
