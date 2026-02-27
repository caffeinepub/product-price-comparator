import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Store } from "lucide-react";
import type { PriceEntry } from "../backend.d";

interface PriceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { store: string; price: number; inStock: boolean }) => Promise<void>;
  initialEntry?: PriceEntry | null;
  isLoading?: boolean;
}

export function PriceForm({
  open,
  onClose,
  onSubmit,
  initialEntry,
  isLoading = false,
}: PriceFormProps) {
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialEntry;

  useEffect(() => {
    if (!open) return;
    if (initialEntry) {
      setStore(initialEntry.store);
      setPrice(initialEntry.price.toString());
      setInStock(initialEntry.inStock);
    } else {
      setStore("");
      setPrice("");
      setInStock(true);
    }
    setErrors({});
  }, [initialEntry, open]);

  function validate() {
    const e: Record<string, string> = {};
    if (!store.trim()) e.store = "Store name is required";
    const p = parseFloat(price);
    if (!price || isNaN(p) || p < 0) e.price = "Enter a valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ store: store.trim(), price: parseFloat(price), inStock });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              {isEditing ? "Edit Price Entry" : "Add Store Price"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="store">Store Name *</Label>
            <Input
              id="store"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="e.g. Amazon, Walmart, Best Buy"
              className={errors.store ? "border-destructive" : ""}
              disabled={isEditing}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">Store name cannot be changed</p>
            )}
            {errors.store && <p className="text-xs text-destructive">{errors.store}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={errors.price ? "border-destructive" : ""}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <Label htmlFor="inStock" className="font-medium">In Stock</Label>
              <p className="text-xs text-muted-foreground">Is this item currently available?</p>
            </div>
            <Switch
              id="inStock"
              checked={inStock}
              onCheckedChange={setInStock}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[110px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Price"
              ) : (
                "Add Price"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
