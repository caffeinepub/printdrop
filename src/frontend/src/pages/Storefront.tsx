import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend.d";
import ProductCard from "../components/ProductCard";
import { useActor } from "../hooks/useActor";
import { useActiveProducts, useAddToCart } from "../hooks/useQueries";

// Sample products for first load
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-1",
    title: "Electric Bolt Tee",
    description:
      "Strike a pose in this bold electric lightning bolt graphic tee. Premium cotton, perfect fit.",
    basePrice: BigInt(3499),
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["black", "white", "navy"],
    imageUrl: "/assets/generated/product-lightning-tee.dim_600x600.jpg",
    category: "T-Shirts",
    isActive: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: "sample-2",
    title: "Geo Pattern Tee",
    description:
      "Minimalist abstract geometric design meets premium streetwear. Clean lines, bold statement.",
    basePrice: BigInt(2999),
    sizes: ["S", "M", "L", "XL"],
    colors: ["white", "gray", "black"],
    imageUrl: "/assets/generated/product-geo-tee.dim_600x600.jpg",
    category: "T-Shirts",
    isActive: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: "sample-3",
    title: "Drop Culture Hoodie",
    description:
      "The streets are calling. Heavy-weight fleece hoodie with bold DROP CULTURE graphic.",
    basePrice: BigInt(6499),
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["black", "navy"],
    imageUrl: "/assets/generated/product-drop-hoodie.dim_600x600.jpg",
    category: "Hoodies",
    isActive: true,
    createdAt: BigInt(Date.now()),
  },
  {
    id: "sample-4",
    title: "Sunset Vibes Tee",
    description:
      "Retro meets modern in this neon sunset graphic tee. Unwind in style.",
    basePrice: BigInt(3199),
    sizes: ["S", "M", "L", "XL"],
    colors: ["navy", "black"],
    imageUrl: "/assets/generated/product-sunset-tee.dim_600x600.jpg",
    category: "T-Shirts",
    isActive: true,
    createdAt: BigInt(Date.now()),
  },
];

const PLATFORM_ICONS: Record<string, string> = {
  Shopify: "🛍️",
  WooCommerce: "🔧",
  Printful: "🖨️",
  Printify: "🎨",
  Gooten: "⚡",
  "Custom API": "🔌",
};

export default function Storefront() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: backendProducts, isLoading } = useActiveProducts();
  const addToCart = useAddToCart();
  const { actor } = useActor();

  const allProducts =
    backendProducts && backendProducts.length > 0
      ? backendProducts
      : SAMPLE_PRODUCTS;

  const categories = [
    "All",
    ...Array.from(new Set(allProducts.map((p) => p.category))),
  ];

  const filtered = allProducts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickAdd = (product: Product) => {
    if (!actor) return;
    addToCart.mutate({
      productId: product.id,
      size: product.sizes[0] ?? "M",
      color: product.colors[0] ?? "black",
      quantity: BigInt(1),
    });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-printdrop.dim_1400x700.jpg')",
          }}
        />
        {/* Multi-stop gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        {/* Noise texture */}
        <div className="absolute inset-0 noise-bg opacity-60" />

        {/* Decorative ambient orb */}
        <div
          className="absolute right-1/3 top-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.2 52 / 0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative container max-w-7xl mx-auto px-4 py-28 md:py-40">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 px-3 py-1 text-xs tracking-widest uppercase font-semibold">
                <Sparkles className="w-3 h-3 mr-1.5" />
                New Drops Every Week
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-display text-7xl md:text-8xl font-extrabold leading-[0.9] tracking-[-0.04em] mb-6"
            >
              Design.
              <span className="block relative">
                <span className="text-primary text-glow">Print.</span>
              </span>
              <span className="block text-foreground/70">Deliver.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-md"
            >
              Premium print-on-demand apparel. Your designs, delivered
              worldwide. Connect with Shopify, Printful, and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex gap-3 flex-wrap"
            >
              <a href="#products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-amber font-semibold px-8 text-base h-12 rounded-full transition-all duration-200 hover:scale-105"
                  data-ocid="hero.primary_button"
                >
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <Link to="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 hover:border-primary/50 hover:text-primary font-semibold px-8 text-base h-12 rounded-full transition-all duration-200 backdrop-blur-sm"
                  data-ocid="hero.secondary_button"
                >
                  Start Selling
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade into products section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Products */}
      <section id="products" className="container max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-1">
            Latest Drops
          </h2>
          <p className="text-muted-foreground text-sm">
            Premium pieces, shipped on demand.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 rounded-full border-border/60 bg-card/50 focus-visible:ring-primary/50 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="storefront.search_input"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={[
                  "rounded-full px-5 h-10 text-sm font-medium transition-all duration-200",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground glow-amber-sm hover:bg-primary/90"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40",
                ].join(" ")}
                data-ocid="storefront.tab"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            data-ocid="storefront.loading_state"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={`skeleton-pos-${i}`} className="space-y-3">
                <Skeleton className="aspect-[4/5] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-24 text-muted-foreground"
            data-ocid="storefront.empty_state"
          >
            <p className="text-4xl mb-4">👕</p>
            <p className="font-display font-semibold text-lg">
              No products found
            </p>
            <p className="text-sm mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onAddToCart={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </section>

      {/* Integration Banner */}
      <section className="py-16 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.015 55) 0%, oklch(0.1 0.008 55) 100%)",
          }}
        />
        <div className="absolute inset-0 noise-bg" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        <div className="relative container max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Connect Your Store
            </h2>
            <p className="text-muted-foreground mb-8 text-base">
              Integrate with your favorite platforms and fulfillment partners
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => (
                <motion.span
                  key={platform}
                  whileHover={{ scale: 1.06, y: -2 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-card/60 rounded-full border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-default backdrop-blur-sm"
                >
                  <span>{icon}</span>
                  {platform}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
