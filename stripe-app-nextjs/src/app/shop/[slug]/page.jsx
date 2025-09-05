"use client";

import Image from "next/image";
import { products } from "@/data/products";
import { use as usePromise } from "react";
import { useRouter } from "next/navigation";

export default function Page({ params }) {
  const { slug } = usePromise(params);
  const product = products.find((p) => p.id === slug);
  const router = useRouter()

  const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-gray-600">We couldn't find that item.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
          <Image
            src={product.image}
            alt={product.name}
            width={256}
            height={256}
            className="h-64 w-64 object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-xl text-gray-800">{formatPrice(product.priceCents)}</p>
          <p className="mt-4 text-sm text-gray-600">
            A great {product.name.toLowerCase()} to complement your style.
          </p>

          <div className="mt-8">
            <button
              type="button"
              className="w-full rounded-md bg-black px-5 py-3 text-white transition hover:bg-gray-800 md:w-auto"
              onClick={() => router.push(`/checkout/${product.id}`)}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
