import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const useAddRecentlyViewedProduct = () => {
  const addRecentlyViewedProduct = async (userID, productID) => {
    try {
      const userDocRef = doc(db, "users", userID);
      const userSnap = await getDoc(userDocRef);

      let recentlyViewed = userSnap.exists()
        ? userSnap.data().recentlyViewed || []
        : [];

      // Remove duplicate if it exists
      recentlyViewed = recentlyViewed.filter(
        (item) => item.productID !== productID
      );

      // Add new entry at the beginning
      recentlyViewed.unshift({
        productID,
        viewedAt: new Date().toISOString(), // Store as ISO string for easy sorting
      });

      // Limit to the last 10 viewed products
      if (recentlyViewed.length > 10) {
        recentlyViewed = recentlyViewed.slice(0, 10);
      }

      // Save back to Firestore
      await updateDoc(userDocRef, { recentlyViewed });
    } catch (error) {
      console.error("Error updating recently viewed: ", error);
    }
  };
  return { addRecentlyViewedProduct };
};
