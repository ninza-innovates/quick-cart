import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useUpdateStockQuantity = () => {
  const updateStockQuantity = async (productId, orderQuantity) => {
    const productDocRef = doc(db, "products", productId); // ✅ Correct document reference

    try {
      // Get the current product data
      const productSnap = await getDoc(productDocRef);
      if (!productSnap.exists()) throw new Error("Product not found");

      const currentStock = productSnap.data().stockQuantity || 0; // Ensure stockQuantity exists

      // Update Firestore with the new stock quantity
      await updateDoc(productDocRef, {
        stockQuantity: currentStock - orderQuantity,
      });
    } catch (error) {
      console.error("Error updating stock quantity: ", error);
    }
  };

  return { updateStockQuantity };
};
