import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase"; // Adjust based on your setup
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";

export function useGetUserOrderCount(userId) {
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchOrderCount = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, "orders"); // Adjust collection name
        const q = query(ordersRef, where("userId", "==", userId));
        const snapshot = await getCountFromServer(q);
        setOrderCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching order count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, [userId]);

  return { orderCount, loading };
}
