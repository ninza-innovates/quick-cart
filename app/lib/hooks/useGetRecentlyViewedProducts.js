import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const useGetRecentlyViewedProducts = () => {
  const getRecentlyViewedProducts = async (userID) => {
    if (!userID) {
      console.error("No user ID provided");
      return [];
    }

    try {
      const userDocRef = doc(db, "users", userID);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.log("User document doesn't exist");
        return [];
      }

      const recentlyViewed = userSnap.data().recentlyViewed || [];

      if (recentlyViewed.length === 0) return [];

      // Extract product IDs
      const productIDs = recentlyViewed.map((item) => item.productID);

      // Fetch each product individually
      const productPromises = productIDs.map(async (productID) => {
        const productDocRef = doc(db, "products", productID);
        const productSnap = await getDoc(productDocRef);

        if (productSnap.exists()) {
          return {
            id: productSnap.id,
            ...productSnap.data(),
          };
        }
        return null;
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter((product) => product !== null);

      // Keep the original ordering from recentlyViewed
      const sortedProducts = productIDs
        .map((id) => validProducts.find((product) => product.id === id))
        .filter((product) => product !== undefined);

      return sortedProducts;
    } catch (error) {
      console.error("Error fetching recently viewed: ", error);
      return [];
    }
  };

  return { getRecentlyViewedProducts };
};
