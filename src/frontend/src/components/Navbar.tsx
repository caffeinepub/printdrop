import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, ShoppingCart, User, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCart } from "../hooks/useQueries";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: cart } = useCart();
  const { login, clear, identity, loginStatus } = useInternetIdentity();
  const cartCount =
    cart?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  const navLinks = [
    { label: "Shop", href: "/" },
    { label: "My Orders", href: "/orders" },
  ];

  return (
    <header
      className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl navbar-glow"
      style={{
        borderBottom: "1px solid oklch(0.72 0.2 52 / 0.18)",
      }}
    >
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-amber-sm group-hover:glow-amber transition-all duration-300">
            <Zap
              className="w-4 h-4 text-primary-foreground"
              fill="currentColor"
            />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Print<span className="text-primary">Drop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-full hover:bg-card/60 transition-all duration-200"
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <Link to="/cart" data-ocid="nav.cart_button">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-card/60"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-0">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {identity ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono bg-card/60 px-2.5 py-1 rounded-full border border-border/60">
                {identity.getPrincipal().toString().slice(0, 8)}…
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                data-ocid="nav.button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold glow-amber-sm hover:glow-amber transition-all duration-200"
              data-ocid="nav.primary_button"
            >
              <User className="w-4 h-4 mr-1.5" />
              {loginStatus === "logging-in" ? "Connecting…" : "Login"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMenuOpen(!menuOpen)}
            data-ocid="nav.toggle"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl"
            style={{ borderTop: "1px solid oklch(0.72 0.2 52 / 0.12)" }}
          >
            <div className="container px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium py-2.5 px-3 rounded-lg text-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </Link>
              ))}
              {identity ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="w-full rounded-full mt-1"
                  data-ocid="nav.button"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={login}
                  className="w-full bg-primary text-primary-foreground rounded-full mt-1 glow-amber-sm font-semibold"
                  data-ocid="nav.primary_button"
                >
                  <User className="w-4 h-4 mr-2" /> Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
