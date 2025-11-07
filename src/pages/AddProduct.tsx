import { useState, useTransition } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProductStore } from "@/stores/productStore";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { z } from "zod";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-']+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and apostrophes"
    ),
  price: z.number().positive("Price must be positive"),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative integer"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  color: z.string().min(1, "Color is required"),
  status: z.enum(["Available", "Out of Stock", "Coming Soon"]),
  imageFile: z
    .any()
    .optional()
    .refine(
      (file) =>
        !file || (file instanceof File && file.type.startsWith("image/")),
      "Only image files are allowed."
    )
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Image size must be less than 5MB."
    ), // Example: 5MB limit
});

export default function AddProduct() {
  const navigate = useNavigate();
  const addProduct = useProductStore((state) => state.addProduct);
  const getProductBySku = useProductStore((state) => state.getProductBySku);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    inStock: true,
    category: "",
    brand: "",
    status: "Available" as const,
    quantity: "",
    color: "",
    sku: "",
    image: "",
    imageFile: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Sanitize input to prevent XSS
    const sanitizedData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,
      brand: formData.brand,
      color: formData.color.trim(),
      status: formData.status,
      imageFile: formData.imageFile, // Include imageFile in sanitized data for Zod validation
    };

    // Validate with Zod
    const result = productSchema.safeParse(sanitizedData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error("Please fix the form errors");
      return;
    }

    // Use startTransition for state updates that might be slow, keeping the UI responsive
    startTransition(() => {
      // Define an async function to handle image upload and product addition
      const processProduct = async () => {
        let imageUrl: string | undefined = formData.image || undefined;

        // If an image file is provided, upload it to Firebase Storage
        if (formData.imageFile) {
          try {
            const storageRef = ref(
              storage,
              `product-images/${formData.imageFile.name}`
            );
            const snapshot = await uploadBytes(storageRef, formData.imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image.");
            return;
          }
        }

        // Check SKU uniqueness after image upload (if any)
        if (getProductBySku(sanitizedData.sku)) {
          setErrors({ sku: "SKU already exists" });
          toast.error("SKU already exists");
          return;
        }

        // Add the product to the store
        addProduct({
          name: result.data.name,
          price: result.data.price,
          inStock: formData.inStock,
          category: result.data.category,
          brand: result.data.brand,
          status: result.data.status,
          quantity: result.data.quantity,
          color: result.data.color,
          sku: result.data.sku,
          rating: 4.0,
          image: imageUrl,
        });

        toast.success("Product added successfully!");
        navigate("/products");
      };

      processProduct();
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Add Product</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="relative z-10">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter product name"
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => updateField("sku", e.target.value)}
                    placeholder="e.g., PROD-001"
                    disabled={isPending}
                  />
                  {errors.sku && (
                    <p className="text-sm text-destructive">{errors.sku}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="0.00"
                    disabled={isPending}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateField("category", value)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="relative z-20">
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Books">Books</SelectItem>
                      <SelectItem value="Toys">Toys</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    placeholder="Enter brand name"
                    disabled={isPending}
                  />
                  {errors.brand && (
                    <p className="text-sm text-destructive">{errors.brand}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                    placeholder="0"
                    disabled={isPending}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    placeholder="e.g., Black"
                    disabled={isPending}
                  />
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Product Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => updateField("status", value)}
                  disabled={isPending}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="relative z-20">
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <Label htmlFor="imageFile">Product Image (Optional)</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateField(
                      "imageFile",
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                  disabled={isPending}
                />
                {errors.imageFile && (
                  <p className="text-sm text-destructive">{errors.imageFile}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => updateField("inStock", checked)}
                  disabled={isPending}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Adding Product..." : "Add Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={isPending}
                >
                  <Link to="/products">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
