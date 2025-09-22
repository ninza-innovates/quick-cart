import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase"; // Adjust based on your setup
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";

export function userGetUserCartCount(userId) {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchCartCount = async () => {
      setLoading(true);
      try {
        const cartRef = collection(db, "cart"); // Adjust collection name
        const q = query(cartRef, where("userId", "==", userId));
        const snapshot = await getCountFromServer(q);
        setCartCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartCount();
  }, [userId]);

  return { cartCount, loading };
}
