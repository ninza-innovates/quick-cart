import { lusitana } from "@/app/ui/fonts";
import OrdersList from "@/app/ui/orders/orders-list";
import DarkMode from "@/app/ui/dark-mode";

export const metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return (
    <main>
      <div className="flex justify-between items-center">
        <h1
          className={`${lusitana.className} mb-4 text-xl md:text-2xl dark:text-white`}
        >
          Orders
        </h1>
        <DarkMode />
      </div>

      <OrdersList />
    </main>
  );
}
