import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const useAddProduct = () => {
  const productsCollectionRef = collection(db, "products");

  const addProduct = async ({
    name,
    price,
    imageURL,
    category,
    description,
    stockQuantity,
  }) => {
    try {
      await addDoc(productsCollectionRef, {
        name,
        price,
        imageURL,
        category,
        description,
        stockQuantity,
        reviews: [],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };
  return { addProduct };
};
