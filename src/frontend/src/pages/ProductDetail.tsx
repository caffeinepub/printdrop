import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useAddToCart, useProduct } from "../hooks/useQueries";

const COLOR_MAP: Record<string, string> = {
  black: "#0a0a0a",
  white: "#ffffff",
  navy: "#1a2744",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#ca8a04",
  purple: "#9333ea",
  orange: "#ea580c",
  pink: "#db2777",
  gray: "#6b7280",
  grey: "#6b7280",
};

export default function ProductDetail() {
  const { id } = useParams({ from: "/product/$id" });
  const { data: product, isLoading, isError } = useProduct(id);
  const addToCart = useAddToCart();
  const { actor } = useActor();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton
            className="aspect-square rounded-xl"
            data-ocid="product.loading_state"
          />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div
        className="container max-w-7xl mx-auto px-4 py-20 text-center"
        data-ocid="product.error_state"
      >
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/">
          <Button className="mt-4" variant="outline">
            Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const price = Number(product.basePrice) / 100;
  const sizes =
    product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL", "XXL"];
  const colors =
    product.colors.length > 0 ? product.colors : ["black", "white"];
  const currentSize = selectedSize || sizes[0];
  const currentColor = selectedColor || colors[0];

  const handleAddToCart = () => {
    if (!actor) return;
    addToCart.mutate({
      productId: product.id,
      size: currentSize,
      color: currentColor,
      quantity: BigInt(quantity),
    });
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square rounded-xl overflow-hidden bg-secondary border border-border"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              👕
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div>
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
              {product.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {product.title}
            </h1>
            <p className="text-3xl font-display font-bold text-primary mt-2">
              ${price.toFixed(2)}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Size Selector */}
          <div>
            <p className="font-semibold text-sm mb-2">
              Size: <span className="text-primary">{currentSize}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded border text-sm font-medium transition-all ${
                    currentSize === size
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                  data-ocid="product.toggle"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <p className="font-semibold text-sm mb-2">
              Color:{" "}
              <span className="text-primary capitalize">{currentColor}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  title={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    currentColor === color
                      ? "border-primary scale-110 glow-blue-sm"
                      : "border-border"
                  }`}
                  style={{
                    backgroundColor: COLOR_MAP[color.toLowerCase()] ?? color,
                  }}
                  data-ocid="product.toggle"
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-semibold text-sm mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                data-ocid="product.secondary_button"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                data-ocid="product.secondary_button"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={addToCart.isPending || !actor}
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue w-full md:w-auto"
            data-ocid="product.add_button"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {addToCart.isPending
              ? "Adding..."
              : actor
                ? "Add to Cart"
                : "Login to Shop"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
