import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend.d";

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart?: (product: Product) => void;
}

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

export default function ProductCard({
  product,
  index,
  onAddToCart,
}: ProductCardProps) {
  const price = Number(product.basePrice) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      data-ocid={`product.item.${index + 1}`}
      className="group relative bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:glow-amber-card"
      style={{
        boxShadow: "0 2px 12px oklch(0 0 0 / 0.3)",
      }}
    >
      <Link to="/product/$id" params={{ id: product.id }}>
        {/* 4:5 portrait image container */}
        <div
          className="relative overflow-hidden bg-secondary"
          style={{ aspectRatio: "4/5" }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              style={{ transform: "scale(1)" }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-card to-secondary">
              👕
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/75 text-foreground text-xs border-0 backdrop-blur-md font-medium">
              {product.category}
            </Badge>
          </div>

          {/* Bottom gradient + Quick Add overlay */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Quick Add — slides up on hover */}
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold rounded-full h-9 glow-amber-sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              data-ocid={`product.primary_button.${index + 1}`}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Quick Add
            </Button>
          </div>
        </div>
      </Link>

      {/* Card info */}
      <div className="p-4 pt-3.5">
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-0.5">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-base text-foreground">
            ${price.toFixed(2)}
          </span>

          {/* Color swatches */}
          <div className="flex gap-1.5 items-center">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color}
                title={color}
                className="w-3.5 h-3.5 rounded-full ring-1 ring-border/50 ring-offset-1 ring-offset-card"
                style={{
                  backgroundColor: COLOR_MAP[color.toLowerCase()] ?? color,
                }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
