import { useState, useMemo, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore, Product } from "@/stores/productStore";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogOut,
  Plus,
  Search,
  ShoppingBag,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const products = useProductStore((state) => state.products);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("rating-high");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const itemsPerPage = 20;

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "rating-high") return b.rating - a.rating;
      if (sortBy === "rating-low") return a.rating - b.rating;
      return 0;
    });

    return sorted;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    startTransition(() => {
      logout().then(() => navigate("/login"));
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ShopStore</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="text-muted-foreground">
              {filteredProducts.length} items found
            </p>
          </div>
          <Button asChild>
            <Link to="/add-product">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-high">Rating: High to Low</SelectItem>
              <SelectItem value="rating-low">Rating: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="lg:hidden mb-6">
            <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Products
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter Products</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  <ProductFilters
                    categories={categories}
                    brands={brands}
                    selectedCategory={selectedCategory}
                    selectedBrand={selectedBrand}
                    selectedStatus={selectedStatus}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onCategoryChange={(value) => {
                      setSelectedCategory(value);
                      setIsFilterOpen(false);
                    }}
                    onBrandChange={(value) => {
                      setSelectedBrand(value);
                      setIsFilterOpen(false);
                    }}
                    onStatusChange={(value) => {
                      setSelectedStatus(value);
                      setIsFilterOpen(false);
                    }}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                  />
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          <aside className="hidden lg:block">
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              selectedStatus={selectedStatus}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={setSelectedCategory}
              onBrandChange={setSelectedBrand}
              onStatusChange={setSelectedStatus}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </aside>

          <div className="flex-1">
            {isPending ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}

            {isPending === false && paginatedProducts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}

            {isPending === false && totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-6">
          {selectedProduct && (
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold">
                {selectedProduct.name}
              </DialogTitle>
            </DialogHeader>
          )}
          {selectedProduct && (
            <div className="space-y-6">
              <img
                src={
                  selectedProduct.image ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
                }
                alt={selectedProduct.name}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Brand</p>
                  <p className="text-lg font-medium">{selectedProduct.brand}</p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">
                    Category
                  </p>
                  <p className="text-lg font-medium">
                    {selectedProduct.category}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Price</p>
                  <p className="text-xl font-bold text-primary">
                    ₹{selectedProduct.price}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Rating</p>
                  <p className="text-lg font-medium">
                    {selectedProduct.rating} ⭐
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Status</p>
                  <p className="text-lg font-medium">
                    {selectedProduct.status}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Stock</p>
                  <p className="text-lg font-medium">
                    {selectedProduct.quantity} units
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Color</p>
                  <p className="text-lg font-medium">{selectedProduct.color}</p>
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">SKU</p>
                  <p className="text-lg font-medium">{selectedProduct.sku}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
