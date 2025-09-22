import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useUpdateReturnStatus = () => {
  const updateReturnStatus = async (orderId) => {
    const orderDocRef = doc(db, "orders", orderId);

    try {
      // Get the current order data
      const orderSnap = await getDoc(orderDocRef);
      if (!orderSnap.exists()) throw new Error("Order not found");

      // Update Firestore with the new return status
      await updateDoc(orderDocRef, {
        returnStatus: true,
      });
    } catch (error) {
      console.error("Error updating return status: ", error);
    }
  };

  return { updateReturnStatus };
};
