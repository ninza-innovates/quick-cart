import { lusitana } from "@/app/ui/fonts";
import SearchBar from "@/app/ui/products/search-bar";
import ProductsList from "@/app/ui/products/products-list";
import { Suspense } from "react";
import { ProductsGridSkeleton } from "@/app/ui/skeletons";
import DarkMode from "@/app/ui/dark-mode";

export const metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <main>
      <div className="flex justify-between items-center">
        <h1
          className={`${lusitana.className} mb-4 text-xl md:text-2xl dark:text-white`}
        >
          Products
        </h1>
        <DarkMode />
      </div>

      <SearchBar />
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsList />
      </Suspense>
    </main>
  );
}
