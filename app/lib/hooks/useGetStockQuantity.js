import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase"; // Adjust based on your setup
import { doc, getDoc } from "firebase/firestore";

export function useGetStockQuantity(productId) {
  const [stockQuantity, setStockQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchStockQuantity = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStockQuantity(docSnap.data().stockQuantity);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching stock quantity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockQuantity();
  }, [productId]);

  return { stockQuantity, loading };
}
