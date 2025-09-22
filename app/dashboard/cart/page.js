import { lusitana } from "@/app/ui/fonts";
import CartList from "@/app/ui/cart/cart-list";
import DarkMode from "@/app/ui/dark-mode";

export const metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <main>
      <div>
        <div className="flex justify-between items-center">
          <h1
            className={`${lusitana.className} mb-4 text-xl md:text-2xl dark:text-white`}
          >
            Shopping Cart
          </h1>
          <DarkMode />
        </div>
      </div>
      <CartList />
    </main>
  );
}
