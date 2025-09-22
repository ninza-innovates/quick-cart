import { lusitana } from "@/app/ui/fonts";
import MostPopularItems from "../ui/dashboard/most-popular-items";
import NewArrivals from "../ui/dashboard/new-arrivals";
import RecentlyViewedProducts from "../ui/dashboard/recently-viewed-products";
import DarkMode from "../ui/dark-mode";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main>
      <div className="flex justify-between items-center">
        <h1
          className={`${lusitana.className} mb-4 text-xl md:text-2xl dark:text-white`}
        >
          Dashboard
        </h1>
        <DarkMode />
      </div>
      <MostPopularItems />
      <NewArrivals />
      <RecentlyViewedProducts />
    </main>
  );
}
