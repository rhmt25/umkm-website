import React from "react";
import Link from "next/link";

export interface ProductCardProps {
  name: string;
  description: string;
  umkmName?: string;
  href?: string;
  price?: string;
}

export default function ProductCard({ name, description, umkmName, href, price }: ProductCardProps) {
  const formattedPrice = price ? price.replace(/^Rp\.?\s*/i, "") : "";
  const isZero = price ? (price.trim() === "0" || Number(price.replace(/[^0-9]/g, "")) === 0) : true;
  const showPrice = price && !isZero;

  const card = (
    <article className="overflow-hidden rounded-2xl border border-color4/75 bg-color3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full hover:border-color1/50">
      <div className="p-5 flex flex-col flex-grow">
        {umkmName && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-color1 mb-1 block">
            {umkmName}
          </span>
        )}
        <h3 className="text-lg font-bold text-color5">{name}</h3>
        <p className="mt-2 text-sm leading-6 text-color5/65 flex-grow min-h-12">
          {description}
        </p>
        {showPrice && <p className="mt-4 text-lg font-bold text-color1">Rp. {formattedPrice}</p>}
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-color1 focus-visible:ring-offset-2">
      {card}
    </Link>
  ) : (
    card
  );
}
