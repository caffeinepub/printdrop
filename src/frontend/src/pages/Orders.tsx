import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Order } from "../backend.d";
import { OrderStatus } from "../backend.d";
import { useActiveProducts, useMyOrders } from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

function OrderRow({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { data: products } = useActiveProducts();
  const getProduct = (id: string) => products?.find((p) => p.id === id);
  const statusKey =
    typeof order.status === "string"
      ? order.status
      : ((order.status as any).__kind__ ?? "pending");
  const statusColor = STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;
  const date = new Date(Number(order.createdAt)).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-lg overflow-hidden"
      data-ocid={`orders.item.${index + 1}`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <Package className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm font-display">
              {order.id.slice(0, 16)}...
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {date} · {order.items.length} item(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-xs border ${statusColor} capitalize`}>
            {statusKey}
          </Badge>
          <span className="font-bold text-primary">
            ${(Number(order.totalAmount) / 100).toFixed(2)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 space-y-3">
              <div className="text-xs text-muted-foreground mb-2">
                <p>
                  <strong>Ship to:</strong> {order.shippingAddress.name},{" "}
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} {order.shippingAddress.zip},{" "}
                  {order.shippingAddress.country}
                </p>
              </div>
              {order.items.map((item, i) => {
                const product = getProduct(item.productId);
                return (
                  <div
                    key={`orderitem-${order.id}-${i}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded bg-secondary shrink-0 overflow-hidden">
                      {product?.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full">
                          👕
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">
                        {product?.title ?? item.productId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} ·{" "}
                        <span className="capitalize">{item.color}</span> · Qty:{" "}
                        {Number(item.quantity)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      $
                      {(
                        (Number(item.price) * Number(item.quantity)) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Orders() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) {
    return (
      <div
        className="container max-w-3xl mx-auto px-4 py-12"
        data-ocid="orders.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-8" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={`skel-${i}`} className="h-20 w-full mb-4" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        className="container max-w-3xl mx-auto px-4 py-20 text-center"
        data-ocid="orders.empty_state"
      >
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">
          Your orders will appear here after checkout
        </p>
        <Link to="/">
          <Button
            className="bg-primary text-primary-foreground"
            data-ocid="orders.primary_button"
          >
            Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order, i) => (
          <OrderRow key={order.id} order={order} index={i} />
        ))}
      </div>
    </div>
  );
}
