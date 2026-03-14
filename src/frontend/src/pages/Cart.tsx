import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { CartItem } from "../backend.d";
import {
  useActiveProducts,
  useCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "../hooks/useQueries";

export default function Cart() {
  const { data: cart, isLoading } = useCart();
  const { data: products } = useActiveProducts();
  const removeItem = useRemoveFromCart();
  const updateItem = useUpdateCartItem();

  const getProduct = (productId: string) =>
    products?.find((p) => p.id === productId);

  const totalCents =
    cart?.reduce((sum, item) => {
      const product = getProduct(item.productId);
      if (!product) return sum;
      return sum + Number(product.basePrice) * Number(item.quantity);
    }, 0) ?? 0;

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQty = Number(item.quantity) + delta;
    if (newQty < 1) {
      removeItem.mutate(item.productId);
    } else {
      updateItem.mutate({ ...item, quantity: BigInt(newQty) });
    }
  };

  if (isLoading) {
    return (
      <div
        className="container max-w-4xl mx-auto px-4 py-12"
        data-ocid="cart.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-8" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full mb-4" />
        ))}
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div
        className="container max-w-4xl mx-auto px-4 py-20 text-center"
        data-ocid="cart.empty_state"
      >
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some fire pieces to your cart
        </p>
        <Link to="/">
          <Button
            className="bg-primary text-primary-foreground"
            data-ocid="cart.primary_button"
          >
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>

      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => {
            const product = getProduct(item.productId);
            const itemTotal = product
              ? (Number(product.basePrice) * Number(item.quantity)) / 100
              : 0;
            return (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 bg-card border border-border rounded-lg"
                data-ocid={`cart.item.${i + 1}`}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      👕
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold truncate">
                    {product?.title ?? item.productId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.size} ·{" "}
                    <span className="capitalize">{item.color}</span>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(item, -1)}
                        data-ocid={`cart.secondary_button.${i + 1}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">
                        {Number(item.quantity)}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(item, 1)}
                        data-ocid={`cart.secondary_button.${i + 1}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        ${itemTotal.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem.mutate(item.productId)}
                        data-ocid={`cart.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(totalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-500">Free</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span className="text-primary">
                ${(totalCents / 100).toFixed(2)}
              </span>
            </div>
            <Link to="/checkout">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
                data-ocid="cart.checkout_button"
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
