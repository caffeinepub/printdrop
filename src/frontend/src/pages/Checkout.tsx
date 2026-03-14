import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { CreditCard, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Order, OrderItem, ShippingAddress } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActiveProducts,
  useCart,
  useClearCart,
  useCreateCheckoutSession,
  usePlaceOrder,
  useStripeConfigured,
} from "../hooks/useQueries";

function generateId() {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { data: products } = useActiveProducts();
  const { data: stripeReady } = useStripeConfigured();
  const placeOrder = usePlaceOrder();
  const clearCart = useClearCart();
  const createSession = useCreateCheckoutSession();
  const { identity } = useInternetIdentity();

  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const getProduct = (productId: string) =>
    products?.find((p) => p.id === productId);

  const totalCents =
    cart?.reduce((sum, item) => {
      const product = getProduct(item.productId);
      if (!product) return sum;
      return sum + Number(product.basePrice) * Number(item.quantity);
    }, 0) ?? 0;

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0 || !identity) return;

    const items: OrderItem[] = cart.map((item) => {
      const product = getProduct(item.productId);
      return {
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product?.basePrice ?? BigInt(0),
      };
    });

    const order: Order = {
      id: generateId(),
      customerId: identity.getPrincipal(),
      items,
      status: { __kind__: "pending" } as any,
      totalAmount: BigInt(totalCents),
      shippingAddress: address,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };

    await placeOrder.mutateAsync(order);
    await clearCart.mutateAsync();
    navigate({ to: "/orders" });
  };

  const handleStripeCheckout = async () => {
    if (!cart || cart.length === 0) return;
    const items = cart.map((item) => {
      const product = getProduct(item.productId);
      return {
        productName: product?.title ?? item.productId,
        productDescription: product?.description ?? "",
        quantity: item.quantity,
        priceInCents: product?.basePrice ?? BigInt(0),
        currency: "usd",
      };
    });
    const origin = window.location.origin;
    const sessionUrl = await createSession.mutateAsync({
      items,
      successUrl: `${origin}/orders`,
      cancelUrl: `${origin}/checkout`,
    });
    if (typeof sessionUrl === "string") window.location.href = sessionUrl;
  };

  const isValid =
    address.name &&
    address.street &&
    address.city &&
    address.state &&
    address.zip &&
    address.country;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={address.name}
                  onChange={(e) =>
                    setAddress((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Alex Johnson"
                  className="mt-1"
                  data-ocid="checkout.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) =>
                    setAddress((p) => ({ ...p, street: e.target.value }))
                  }
                  placeholder="123 Drop Street"
                  className="mt-1"
                  data-ocid="checkout.input"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="Los Angeles"
                  className="mt-1"
                  data-ocid="checkout.input"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((p) => ({ ...p, state: e.target.value }))
                  }
                  placeholder="CA"
                  className="mt-1"
                  data-ocid="checkout.input"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress((p) => ({ ...p, zip: e.target.value }))
                  }
                  placeholder="90001"
                  className="mt-1"
                  data-ocid="checkout.input"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress((p) => ({ ...p, country: e.target.value }))
                  }
                  placeholder="US"
                  className="mt-1"
                  data-ocid="checkout.input"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
              onClick={handlePlaceOrder}
              disabled={
                !isValid || placeOrder.isPending || !identity || !cart?.length
              }
              data-ocid="checkout.submit_button"
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing
                  Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>

            {stripeReady && (
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary/50 hover:border-primary"
                onClick={handleStripeCheckout}
                disabled={!isValid || createSession.isPending || !cart?.length}
                data-ocid="checkout.secondary_button"
              >
                {createSession.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" /> Pay with Card
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {cart?.map((item) => {
                const product = getProduct(item.productId);
                const itemTotal = product
                  ? (Number(product.basePrice) * Number(item.quantity)) / 100
                  : 0;
                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {product?.title ?? item.productId} ×{" "}
                      {Number(item.quantity)}
                    </span>
                    <span>${itemTotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <Separator className="mb-4" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">
                ${(totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
