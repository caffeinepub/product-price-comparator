import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AIInsightCard } from "./AIInsightCard";
import { PriceForm } from "./PriceForm";
import { ProductForm } from "./ProductForm";
import {
  useProduct,
  usePriceEntries,
  useAddPriceEntry,
  useUpdatePriceEntry,
  useDeletePriceEntry,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useQueries";
import type { PriceEntry } from "../backend.d";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop";

interface ProductDetailProps {
  productId: bigint;
  onBack: () => void;
}

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: prices = [], isLoading: pricesLoading } = usePriceEntries(productId);

  const addPrice = useAddPriceEntry();
  const updatePrice = useUpdatePriceEntry();
  const deletePrice = useDeletePriceEntry();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [priceFormOpen, setPriceFormOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceEntry | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [deletePriceStore, setDeletePriceStore] = useState<string | null>(null);

  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices[0];

  async function handleAddPrice(data: { store: string; price: number; inStock: boolean }) {
    try {
      await addPrice.mutateAsync({ productId, ...data });
      toast.success(`Price for ${data.store} added`);
      setPriceFormOpen(false);
    } catch {
      toast.error("Failed to add price. Please try again.");
    }
  }

  async function handleUpdatePrice(data: { store: string; price: number; inStock: boolean }) {
    if (!editingPrice) return;
    try {
      await updatePrice.mutateAsync({ productId, ...data });
      toast.success(`Price for ${data.store} updated`);
      setEditingPrice(null);
      setPriceFormOpen(false);
    } catch {
      toast.error("Failed to update price. Please try again.");
    }
  }

  async function handleDeletePrice() {
    if (!deletePriceStore) return;
    try {
      await deletePrice.mutateAsync({ productId, store: deletePriceStore });
      toast.success("Price entry removed");
      setDeletePriceStore(null);
    } catch {
      toast.error("Failed to delete price. Please try again.");
    }
  }

  async function handleUpdateProduct(data: {
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    tags: string[];
  }) {
    if (!product) return;
    try {
      await updateProduct.mutateAsync({ id: product.id, ...data });
      toast.success("Product updated successfully");
      setProductFormOpen(false);
    } catch {
      toast.error("Failed to update product. Please try again.");
    }
  }

  async function handleDeleteProduct() {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted");
      onBack();
    } catch {
      toast.error("Failed to delete product. Please try again.");
    }
  }

  if (productLoading) {
    return <ProductDetailSkeleton onBack={onBack} />;
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground font-body">Product not found.</p>
        <Button type="button" variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-[4/3]">
            <img
              src={product.imageUrl || PLACEHOLDER_IMG}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
              }}
            />
          </div>

          {/* Info */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2 font-body">
                {product.category}
              </Badge>
              <h1 className="font-display text-2xl font-bold text-card-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {product.description}
            </p>

            {product.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-accent/30 text-accent-foreground font-body"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setProductFormOpen(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setDeleteProductOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* AI Insight */}
          <AIInsightCard productId={productId} />
        </div>

        {/* Right: Price Comparison */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-card-foreground">
                  Price Comparison
                </h2>
                <p className="text-sm text-muted-foreground font-body">
                  {sortedPrices.length} store{sortedPrices.length !== 1 ? "s" : ""} listed
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingPrice(null);
                  setPriceFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Store Price
              </Button>
            </div>

            {/* Table */}
            {pricesLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : sortedPrices.length === 0 ? (
              <div className="py-16 text-center px-5">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-display font-semibold text-foreground mb-1">No prices yet</p>
                <p className="text-sm text-muted-foreground font-body">
                  Add store prices to compare and get AI insights.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-body font-semibold">Store</TableHead>
                    <TableHead className="font-body font-semibold">Price</TableHead>
                    <TableHead className="font-body font-semibold">Availability</TableHead>
                    <TableHead className="font-body font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPrices.map((entry, idx) => {
                    const isBest = lowestPrice && entry.store === lowestPrice.store && idx === 0;
                    return (
                      <TableRow
                        key={entry.store}
                        className={isBest ? "price-best-row hover:opacity-90" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-body text-foreground">
                              {entry.store}
                            </span>
                            {isBest && (
                              <Badge
                                className="text-xs px-1.5 py-0 font-body"
                                style={{
                                  background: "oklch(var(--price-best-bg))",
                                  color: "oklch(var(--price-best))",
                                  borderColor: "oklch(var(--price-best-border))",
                                }}
                                variant="outline"
                              >
                                Best Deal
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-display font-bold text-lg ${isBest ? "text-price-best" : "text-foreground"}`}
                          >
                            ${entry.price.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 text-sm font-body ${
                              entry.inStock ? "text-price-best" : "text-destructive"
                            }`}
                          >
                            {entry.inStock ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {entry.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingPrice(entry);
                                setPriceFormOpen(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => setDeletePriceStore(entry.store)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Summary stats */}
          {sortedPrices.length >= 2 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Best Price",
                  value: `$${Math.min(...sortedPrices.map((p) => p.price)).toFixed(2)}`,
                  sub: lowestPrice?.store,
                },
                {
                  label: "Highest Price",
                  value: `$${Math.max(...sortedPrices.map((p) => p.price)).toFixed(2)}`,
                  sub: sortedPrices[sortedPrices.length - 1]?.store,
                },
                {
                  label: "You Could Save",
                  value: `$${(
                    Math.max(...sortedPrices.map((p) => p.price)) -
                    Math.min(...sortedPrices.map((p) => p.price))
                  ).toFixed(2)}`,
                  sub: "vs. most expensive",
                },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="bg-card border border-border rounded-xl p-4 text-center animate-fade-in"
                >
                  <p className="text-xs text-muted-foreground font-body mb-1">{label}</p>
                  <p className="font-display text-xl font-bold text-primary">{value}</p>
                  {sub && <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">{sub}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Form Modal */}
      <PriceForm
        open={priceFormOpen}
        onClose={() => {
          setPriceFormOpen(false);
          setEditingPrice(null);
        }}
        onSubmit={editingPrice ? handleUpdatePrice : handleAddPrice}
        initialEntry={editingPrice}
        isLoading={addPrice.isPending || updatePrice.isPending}
      />

      {/* Product Edit Modal */}
      <ProductForm
        open={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        onSubmit={handleUpdateProduct}
        initialProduct={product}
        isLoading={updateProduct.isPending}
      />

      {/* Delete Product Confirm */}
      <AlertDialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete <strong>{product.name}</strong> and all its price
              entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Price Confirm */}
      <AlertDialog open={!!deletePriceStore} onOpenChange={(v) => !v && setDeletePriceStore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove Price Entry?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Remove the price entry for <strong>{deletePriceStore}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePrice.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Button type="button" variant="ghost" onClick={onBack} className="mb-6 -ml-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to products
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-5">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
