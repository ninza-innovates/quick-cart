import { db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";

export const useDeleteProduct = () => {
  const deleteProduct = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
    } catch (err) {
      console.error(err);
    }
  };

  return { deleteProduct };
};
