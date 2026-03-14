import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ImageIcon,
  Info,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "../backend.d";
import { useImageUpload } from "../hooks/useImageUpload";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "../hooks/useQueries";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const AVAILABLE_CATEGORIES = [
  "T-Shirts",
  "Hoodies",
  "Tank Tops",
  "Long Sleeves",
  "Accessories",
];

const PRESET_COLORS = [
  { name: "black", hex: "#0a0a0a" },
  { name: "white", hex: "#ffffff" },
  { name: "navy", hex: "#1a2744" },
  { name: "red", hex: "#dc2626" },
  { name: "blue", hex: "#2563eb" },
  { name: "green", hex: "#16a34a" },
  { name: "yellow", hex: "#ca8a04" },
  { name: "purple", hex: "#9333ea" },
  { name: "orange", hex: "#ea580c" },
  { name: "pink", hex: "#db2777" },
  { name: "gray", hex: "#6b7280" },
  { name: "brown", hex: "#92400e" },
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p
      className="mt-1 text-xs text-destructive flex items-center gap-1"
      data-ocid="admin.product.error_state"
    >
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

interface FormErrors {
  title?: string;
  basePrice?: string;
  sizes?: string;
}

export default function AdminProductForm() {
  const params = useParams({ strict: false }) as { id?: string };
  const isEdit = !!params.id;
  const { data: existingProduct, isLoading } = useProduct(params.id ?? "");
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadImage,
    isUploading,
    progress,
    error: uploadError,
  } = useImageUpload();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState({
    title: "",
    description: "",
    basePrice: "",
    category: "T-Shirts",
    imageUrl: "",
    isActive: true,
    sizes: ["S", "M", "L", "XL"] as string[],
    colors: ["black", "white"] as string[],
  });

  const [colorInput, setColorInput] = useState("");
  const [colorPickerHex, setColorPickerHex] = useState("#000000");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (existingProduct && isEdit) {
      setForm({
        title: existingProduct.title,
        description: existingProduct.description,
        basePrice: (Number(existingProduct.basePrice) / 100).toFixed(2),
        category: existingProduct.category,
        imageUrl: existingProduct.imageUrl,
        isActive: existingProduct.isActive,
        sizes: [...existingProduct.sizes],
        colors: [...existingProduct.colors],
      });
    }
  }, [existingProduct, isEdit]);

  const displayImage = previewUrl || form.imageUrl;

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = "Product name is required";
    if (!form.basePrice || Number.isNaN(Number.parseFloat(form.basePrice))) {
      errs.basePrice = "Enter a valid price";
    } else if (Number.parseFloat(form.basePrice) <= 0) {
      errs.basePrice = "Price must be greater than 0";
    }
    if (form.sizes.length === 0) errs.sizes = "Select at least one size";
    return errs;
  };

  const toggleSize = (size: string) => {
    setForm((p) => ({
      ...p,
      sizes: p.sizes.includes(size)
        ? p.sizes.filter((s) => s !== size)
        : [...p.sizes, size],
    }));
    if (submitted) setErrors((e) => ({ ...e, sizes: undefined }));
  };

  const addColor = (nameInput?: string) => {
    const c = (nameInput ?? colorInput).trim().toLowerCase();
    if (c && !form.colors.includes(c)) {
      setForm((p) => ({ ...p, colors: [...p.colors, c] }));
      setColorInput("");
    }
  };

  const addColorFromPicker = () => {
    // Use the hex if no name provided, or try to match to preset
    const preset = PRESET_COLORS.find(
      (pc) => pc.hex.toLowerCase() === colorPickerHex.toLowerCase(),
    );
    const name = preset ? preset.name : colorPickerHex.toLowerCase();
    if (!form.colors.includes(name)) {
      setForm((p) => ({ ...p, colors: [...p.colors, name] }));
    }
  };

  const removeColor = (color: string) => {
    setForm((p) => ({ ...p, colors: p.colors.filter((c) => c !== color) }));
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      // Upload to blob storage
      const url = await uploadImage(file);
      if (url) {
        setForm((p) => ({ ...p, imageUrl: url }));
        setPreviewUrl(url);
        URL.revokeObjectURL(localUrl);
      }
    },
    [uploadImage],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const product: Product = {
      id: isEdit ? (params.id ?? "") : `product-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      basePrice: BigInt(Math.round(Number.parseFloat(form.basePrice) * 100)),
      category: form.category,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
      sizes: form.sizes,
      colors: form.colors,
      createdAt: isEdit
        ? (existingProduct?.createdAt ?? BigInt(Date.now()))
        : BigInt(Date.now()),
    };

    if (isEdit) {
      await updateProduct.mutateAsync(product);
    } else {
      await createProduct.mutateAsync(product);
    }
    navigate({ to: "/admin" });
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  if (isEdit && isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-secondary rounded w-32" />
          <div className="h-8 bg-secondary rounded w-48" />
          <div className="h-80 bg-secondary rounded-xl" />
          <div className="h-48 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
        {isEdit && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Editing
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* ── PRODUCT IMAGE ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Product Image
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            This is the photo customers will see in the store.
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setImageTab("upload")}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                imageTab === "upload"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.product.tab"
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                imageTab === "url"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.product.tab"
            >
              Image URL
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Left: upload/url input */}
            <div>
              <AnimatePresence mode="wait">
                {imageTab === "upload" ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Drop zone */}
                    <button
                      type="button"
                      className={`relative w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      data-ocid="admin.product.dropzone"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {isDragging
                            ? "Drop to upload"
                            : "Click or drag & drop"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          PNG, JPG, WebP — max 5 MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        data-ocid="admin.product.upload_button"
                      />
                    </button>

                    {/* Upload progress */}
                    <AnimatePresence>
                      {isUploading && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Uploading image…</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-1.5"
                            data-ocid="admin.product.loading_state"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {uploadError && (
                      <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Stored locally (blob storage unavailable)
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="url"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, imageUrl: e.target.value }));
                        setPreviewUrl(null);
                      }}
                      placeholder="https://example.com/tshirt.jpg"
                      data-ocid="admin.product.input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a direct link to the product image.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: image preview */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square max-w-[200px] rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center relative">
                {displayImage ? (
                  <>
                    <img
                      src={displayImage}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                    {!isUploading && displayImage && (
                      <div className="absolute top-2 right-2">
                        <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-10 h-10" />
                    <p className="text-xs">No image yet</p>
                  </div>
                )}
              </div>
              {displayImage && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setForm((p) => ({ ...p, imageUrl: "" }));
                  }}
                  className="mt-2 text-xs text-destructive hover:underline"
                  data-ocid="admin.product.delete_button"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── PRODUCT INFO ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-6 space-y-5"
        >
          <h2 className="font-display font-semibold text-base">
            Product Details
          </h2>

          {/* Name */}
          <div>
            <Label htmlFor="title">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              className="mt-1"
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                if (submitted) setErrors((e2) => ({ ...e2, title: undefined }));
              }}
              placeholder="e.g. Electric Bolt Tee"
              data-ocid="admin.product.input"
            />
            <FieldError msg={errors.title} />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="mt-1 resize-none"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the product — material, fit, design details…"
              data-ocid="admin.product.textarea"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">
                Price (USD) <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="price"
                  className="pl-7"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.basePrice}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, basePrice: e.target.value }));
                    if (submitted)
                      setErrors((e2) => ({ ...e2, basePrice: undefined }));
                  }}
                  placeholder="29.99"
                  data-ocid="admin.product.input"
                />
              </div>
              <FieldError msg={errors.basePrice} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                data-ocid="admin.product.select"
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.section>

        {/* ── SIZES ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-base">
              Available Sizes <span className="text-destructive">*</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              {form.sizes.length} selected
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Toggle the sizes you have in stock.
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SIZES.map((size) => {
              const selected = form.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`relative px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  data-ocid="admin.product.toggle"
                >
                  {size}
                  {selected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.sizes} />
        </motion.section>

        {/* ── COLORS ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-display font-semibold text-base mb-1">Colors</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Add the color variants available for this product.
          </p>

          {/* Preset swatches */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Quick add:
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((pc) => {
                const active = form.colors.includes(pc.name);
                return (
                  <button
                    key={pc.name}
                    type="button"
                    title={pc.name}
                    onClick={() =>
                      active ? removeColor(pc.name) : addColor(pc.name)
                    }
                    className={`group relative w-8 h-8 rounded-full border-2 transition-all ${
                      active
                        ? "border-primary scale-110 shadow-glow-sm"
                        : "border-border hover:border-primary/60 hover:scale-105"
                    }`}
                    style={{ backgroundColor: pc.hex }}
                    data-ocid="admin.product.toggle"
                  >
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className="w-3.5 h-3.5"
                          style={{
                            color:
                              pc.name === "white" || pc.name === "yellow"
                                ? "#000"
                                : "#fff",
                          }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Custom color picker */}
          <div className="flex gap-2 items-end mb-4">
            <div className="flex-1">
              <Label className="text-xs">Custom color name</Label>
              <Input
                className="mt-1"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="e.g. forest-green, coral"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                data-ocid="admin.product.input"
              />
            </div>
            <div>
              <Label className="text-xs">Pick color</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={colorPickerHex}
                  onChange={(e) => setColorPickerHex(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent"
                  title="Pick a color"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addColorFromPicker}
                  data-ocid="admin.product.secondary_button"
                >
                  Add
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addColor()}
              className="mb-0.5"
              data-ocid="admin.product.secondary_button"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Current colors */}
          {form.colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.colors.map((color) => {
                const preset = PRESET_COLORS.find((pc) => pc.name === color);
                return (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium"
                  >
                    {preset && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border/50 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                    )}
                    <span className="capitalize">{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                      data-ocid="admin.product.delete_button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {form.colors.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No colors added yet
            </p>
          )}
        </motion.section>

        {/* ── VISIBILITY ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-base">
                Published
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.isActive
                  ? "Visible to customers in the storefront"
                  : "Hidden — only visible to admins"}
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(val) =>
                setForm((p) => ({ ...p, isActive: val }))
              }
              data-ocid="admin.product.switch"
            />
          </div>
        </motion.section>

        {/* ── ACTIONS ── */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isPending || isUploading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-blue h-12 text-base"
            data-ocid="admin.product.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? "Updating…" : "Creating…"}
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading image…
              </>
            ) : (
              <>{isEdit ? "Save Changes" : "Create Product"}</>
            )}
          </Button>
          <Link to="/admin">
            <Button
              variant="outline"
              className="h-12 px-6"
              data-ocid="admin.product.cancel_button"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
