import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { OrderStatus } from "../backend.d";
import type { IntegrationConfig } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActiveProducts,
  useAllOrders,
  useDeleteProduct,
  useIntegrationConfig,
  useIsAdmin,
  useSetIntegrationConfig,
  useSetStripeConfig,
  useStripeConfigured,
  useTestIntegration,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

function ProductsTab() {
  const { data: products, isLoading } = useActiveProducts();
  const deleteProduct = useDeleteProduct();

  if (isLoading)
    return (
      <div className="space-y-3" data-ocid="admin.products.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {products?.length ?? 0} products
        </p>
        <Link to="/admin/product/new">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground"
            data-ocid="admin.products.primary_button"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </Link>
      </div>
      {!products || products.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.products.empty_state"
        >
          <p className="font-display font-semibold">No products yet</p>
          <p className="text-sm mt-1">
            Create your first product to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
              data-ocid={`admin.products.item.${i + 1}`}
            >
              <div className="w-12 h-12 rounded bg-secondary overflow-hidden shrink-0">
                {product.imageUrl ? (
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
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm truncate">
                  {product.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.category} · $
                  {(Number(product.basePrice) / 100).toFixed(2)}
                </p>
              </div>
              <Badge
                className={
                  product.isActive
                    ? "bg-green-500/20 text-green-400 border-green-500/30 border"
                    : "bg-muted text-muted-foreground border-border border"
                }
              >
                {product.isActive ? "Active" : "Draft"}
              </Badge>
              <div className="flex gap-1">
                <Link to="/admin/product/$id/edit" params={{ id: product.id }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    data-ocid={`admin.products.edit_button.${i + 1}`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteProduct.mutate(product.id)}
                  disabled={deleteProduct.isPending}
                  data-ocid={`admin.products.delete_button.${i + 1}`}
                >
                  {deleteProduct.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();

  if (isLoading)
    return (
      <div className="space-y-3" data-ocid="admin.orders.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {orders?.length ?? 0} orders total
      </p>
      {!orders || orders.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.orders.empty_state"
        >
          <p className="font-display font-semibold">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order, i) => {
            const statusKey =
              typeof order.status === "string"
                ? order.status
                : ((order.status as any).__kind__ ?? "pending");
            return (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-lg"
                data-ocid={`admin.orders.item.${i + 1}`}
              >
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm truncate">
                    {order.id.slice(0, 20)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(order.createdAt)).toLocaleDateString()} ·{" "}
                    {order.items.length} item(s) · $
                    {(Number(order.totalAmount) / 100).toFixed(2)}
                  </p>
                </div>
                <Select
                  value={statusKey}
                  onValueChange={(val) =>
                    updateStatus.mutate({
                      id: order.id,
                      status: val as OrderStatus,
                    })
                  }
                >
                  <SelectTrigger
                    className="w-36 h-8 text-xs"
                    data-ocid={`admin.orders.select.${i + 1}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrderStatus).map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="text-xs capitalize"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IntegrationsTab() {
  const { data: config } = useIntegrationConfig();
  const { data: stripeReady } = useStripeConfigured();
  const setConfig = useSetIntegrationConfig();
  const testIntegration = useTestIntegration();
  const setStripe = useSetStripeConfig();

  const [apiEndpoint, setApiEndpoint] = useState(config?.apiEndpoint ?? "");
  const [apiKey, setApiKey] = useState(config?.apiKey ?? "");
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("US,CA,GB,AU");

  const handleSaveConfig = () => {
    setConfig.mutate({ apiEndpoint, apiKey });
  };

  const handleSaveStripe = () => {
    setStripe.mutate({
      secretKey: stripeKey,
      allowedCountries: stripeCountries.split(",").map((c) => c.trim()),
    });
  };

  return (
    <div className="space-y-8">
      {/* API Integration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display font-semibold mb-1">API Integration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect to Shopify, WooCommerce, Printful, or any custom API
        </p>
        <div className="space-y-4">
          <div>
            <Label>API Endpoint</Label>
            <Input
              className="mt-1"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="https://api.printful.com/store/products"
              data-ocid="integration.input"
            />
          </div>
          <div>
            <Label>API Key</Label>
            <Input
              className="mt-1"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_••••••••••••••••"
              data-ocid="integration.input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveConfig}
              disabled={setConfig.isPending}
              className="bg-primary text-primary-foreground"
              data-ocid="integration.save_button"
            >
              {setConfig.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Save Config
            </Button>
            <Button
              variant="outline"
              onClick={() => testIntegration.mutate()}
              disabled={testIntegration.isPending}
              data-ocid="integration.test_button"
            >
              {testIntegration.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Test Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Stripe */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold">Stripe Payments</h3>
          <Badge
            className={
              stripeReady
                ? "bg-green-500/20 text-green-400 border-green-500/30 border"
                : "bg-muted text-muted-foreground border-border border"
            }
          >
            {stripeReady ? "Configured" : "Not Configured"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Accept credit cards and debit cards via Stripe
        </p>
        <div className="space-y-4">
          <div>
            <Label>Stripe Secret Key</Label>
            <Input
              className="mt-1"
              type="password"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_live_••••••••••••••••"
              data-ocid="integration.input"
            />
          </div>
          <div>
            <Label>Allowed Countries (comma-separated)</Label>
            <Input
              className="mt-1"
              value={stripeCountries}
              onChange={(e) => setStripeCountries(e.target.value)}
              placeholder="US,CA,GB,AU"
              data-ocid="integration.input"
            />
          </div>
          <Button
            onClick={handleSaveStripe}
            disabled={setStripe.isPending || !stripeKey}
            className="bg-primary text-primary-foreground"
            data-ocid="integration.save_button"
          >
            {setStripe.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : null}
            Save Stripe Config
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const { login, identity } = useInternetIdentity();

  if (isLoading) {
    return (
      <div
        className="container max-w-5xl mx-auto px-4 py-12"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="container max-w-5xl mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <ShieldOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please login to access the admin dashboard
        </p>
        <Button
          onClick={login}
          className="bg-primary text-primary-foreground"
          data-ocid="admin.primary_button"
        >
          Login
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container max-w-5xl mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <ShieldOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-ocid="admin.products_tab">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders_tab">
            Orders
          </TabsTrigger>
          <TabsTrigger value="integrations" data-ocid="admin.integrations_tab">
            Integrations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
