"use client"


import Image from "next/image";
import { products } from "@/data/products";
import { useRouter } from "next/navigation";




export default function Home() {

  const router = useRouter();

  const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
      <p className="mt-2 text-sm text-gray-500">Browse our 6 simple items.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-center rounded-md bg-gray-50 p-6">
              <Image
                src={product.image}
                alt={product.name}
                width={96}
                height={96}               
                className="h-24 w-24 object-contain"
              />
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-medium">{product.name}</h2>
              <p className="mt-1 text-gray-600">{formatPrice(product.priceCents)}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
                onClick={() => router.push(`/shop/${product.id}`)}
              >
                show Product details
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
