import { db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";

export const useDeleteFromCart = () => {
  const deleteFromCart = async (cartId) => {
    try {
      const cartRef = doc(db, "cart", cartId);
      await deleteDoc(cartRef);
    } catch (err) {
      console.error(err);
    }
  };

  return { deleteFromCart };
};
