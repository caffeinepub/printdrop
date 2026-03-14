import { Link } from "@tanstack/react-router";
import { Heart, Zap } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="relative mt-16 bg-card">
      {/* Warm gradient accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.72 0.2 52 / 0.7) 30%, oklch(0.72 0.2 52 / 1) 50%, oklch(0.72 0.2 52 / 0.7) 70%, transparent 100%)",
        }}
      />

      <div className="container max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-amber-sm">
                <Zap
                  className="w-3.5 h-3.5 text-primary-foreground"
                  fill="currentColor"
                />
              </div>
              <span className="font-display text-lg font-bold">
                Print<span className="text-primary">Drop</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Design. Print. Deliver. The fastest way to launch your custom
              apparel brand and reach customers worldwide.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/admin"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <a
                  href={caffeineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Powered by Caffeine
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid oklch(0.72 0.2 52 / 0.1)" }}
        >
          <p className="text-xs text-muted-foreground">
            © {year}. Built with{" "}
            <Heart
              className="inline w-3 h-3 text-primary"
              fill="currentColor"
            />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Connect with Shopify, WooCommerce, Printful &amp; more
          </p>
        </div>
      </div>
    </footer>
  );
}
