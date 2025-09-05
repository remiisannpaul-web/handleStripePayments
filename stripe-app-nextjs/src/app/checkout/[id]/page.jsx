"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { products } from "@/data/products";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required", // no auto-redirect to Stripe
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      alert("✅ Payment successful!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto space-y-4">
      <PaymentElement />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-md bg-black px-4 py-2 text-white"
      >
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (!product) return;
    fetch("/api/payment", {
      method: "POST",
      body: JSON.stringify({ amount: product.priceCents }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [product]);

  if (!product) return <p>Product not found.</p>;
  if (!clientSecret) return <p>Loading checkout...</p>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-gray-600">{product.name}</p>
      <p className="text-lg font-medium">${(product.priceCents / 100).toFixed(2)}</p>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm clientSecret={clientSecret} />
      </Elements>
    </main>
  );
}
