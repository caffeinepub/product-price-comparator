import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Plus,
  Search,
  TrendingDown,
  ShoppingBag,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "./components/ProductCard";
import { ProductDetail } from "./components/ProductDetail";
import { ProductForm } from "./components/ProductForm";
import { useAllProducts, useCreateProduct, useSeedSampleData } from "./hooks/useQueries";
import { useActor } from "./hooks/useActor";

const CATEGORIES = ["All", "Electronics", "Food", "Clothing", "Home", "Sports", "Beauty", "Books", "Toys", "Automotive", "Other"];

export default function App() {
  const [selectedProductId, setSelectedProductId] = useState<bigint | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { isFetching: actorFetching } = useActor();
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const isLoading = actorFetching || productsLoading;
  const createProduct = useCreateProduct();
  const seedData = useSeedSampleData();

  // Filter products by search + category (client-side for instant feedback)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    return result;
  }, [products, searchQuery, activeCategory]);

  async function handleSeedData() {
    try {
      await seedData.mutateAsync();
      toast.success("25 sample products loaded successfully!");
    } catch {
      toast.error("Failed to load sample data. Please try again.");
    }
  }

  async function handleCreateProduct(data: {
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    tags: string[];
  }) {
    try {
      const product = await createProduct.mutateAsync(data);
      toast.success(`"${product.name}" added successfully`);
      setAddProductOpen(false);
      // Navigate to the new product
      setSelectedProductId(product.id);
    } catch {
      toast.error("Failed to create product. Please try again.");
    }
  }

  // Show product detail
  if (selectedProductId !== null) {
    return (
      <div className="min-h-screen bg-background">
        <Header onAddProduct={() => setAddProductOpen(true)} minimal />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setSelectedProductId(null)}
          />
        </main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        onAddProduct={() => setAddProductOpen(true)}
        onSeedData={products.length === 0 ? handleSeedData : undefined}
        isSeedingData={seedData.isPending}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Hero Tagline */}
        <div className="mb-8 animate-fade-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Compare prices,{" "}
            <span className="text-primary italic">spend smarter.</span>
          </h2>
          <p className="text-muted-foreground font-body mt-2 text-base sm:text-lg">
            Add products, track prices across stores, and get AI-powered recommendations.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, category or tags..."
              className="pl-10 pr-10 font-body h-11"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-body font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            hasProducts={products.length > 0}
            searchQuery={searchQuery}
            category={activeCategory}
            onAddProduct={() => setAddProductOpen(true)}
            onSeedData={handleSeedData}
            isSeedingData={seedData.isPending}
            onClearSearch={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-body mb-4">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              {activeCategory !== "All" || searchQuery ? " found" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i}
                  onClick={() => setSelectedProductId(product.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Add Product Modal */}
      <ProductForm
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={createProduct.isPending}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────

function Header({
  onAddProduct,
  onSeedData,
  isSeedingData = false,
  minimal = false,
}: {
  onAddProduct: () => void;
  onSeedData?: () => void;
  isSeedingData?: boolean;
  minimal?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary shadow-glow">
            <TrendingDown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              Price Comparator
            </span>
            {!minimal && (
              <span className="hidden sm:inline text-xs text-muted-foreground font-body ml-2">
                — compare smarter
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSeedData && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSeedData}
              disabled={isSeedingData}
              className="gap-1.5"
            >
              {isSeedingData ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isSeedingData ? "Loading..." : "Load Sample Data"}</span>
            </Button>
          )}
          <Button type="button" size="sm" onClick={onAddProduct} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  hasProducts,
  searchQuery,
  category,
  onAddProduct,
  onSeedData,
  isSeedingData,
  onClearSearch,
}: {
  hasProducts: boolean;
  searchQuery: string;
  category: string;
  onAddProduct: () => void;
  onSeedData: () => void;
  isSeedingData: boolean;
  onClearSearch: () => void;
}) {
  if (!hasProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <ShoppingBag className="w-9 h-9 text-primary" />
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          No products yet
        </h3>
        <p className="text-muted-foreground font-body mb-6 max-w-sm">
          Add your first product manually, or load 25 sample products with prices to explore the app instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={onSeedData}
            disabled={isSeedingData}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            {isSeedingData ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isSeedingData ? "Loading 25 products..." : "Load 25 Sample Products"}
          </Button>
          <Button type="button" onClick={onAddProduct} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Add Your First Product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        No results found
      </h3>
      <p className="text-muted-foreground font-body mb-5 max-w-xs">
        No products match
        {searchQuery && <> "{searchQuery}"</>}
        {category !== "All" && <> in {category}</>}.
      </p>
      <Button type="button" variant="outline" onClick={onClearSearch}>
        Clear filters
      </Button>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border mt-16 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground font-body">
          © 2026. Built with{" "}
          <span className="text-primary" role="img">
            ♥
          </span>{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground font-body">
          AI-powered price comparison
        </p>
      </div>
    </footer>
  );
}


