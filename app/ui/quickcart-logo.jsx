import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { lusitana } from "/app/ui/fonts";

export default function QuickCartLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center justify-center md:justify-start leading-none text-white gap-2`}
    >
      <ShoppingCartIcon className="h-8 w-8 md:h-14 md:w-14 rotate-[15deg]" />
      <p className="text-[30px] md:text-[44px]">Quick Cart</p>
    </div>
  );
}
