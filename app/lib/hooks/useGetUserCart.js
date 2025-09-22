import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export function useGetUserCart(userId) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUserCart = async () => {
      setLoading(true);
      try {
        const cartRef = collection(db, "cart");
        const q = query(cartRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCartItems(items);
      } catch (error) {
        console.error("Error fetching user cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCart();
  }, [userId]);

  const updateCartItems = (updateFn) => {
    setCartItems(updateFn);
  };

  return { cartItems, loading, updateCartItems };
}
