import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Package } from "lucide-react";
import type { Product } from "../backend.d";

const CATEGORIES = [
  "Electronics",
  "Food",
  "Clothing",
  "Home",
  "Sports",
  "Beauty",
  "Books",
  "Toys",
  "Automotive",
  "Other",
];

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    tags: string[];
  }) => Promise<void>;
  initialProduct?: Product | null;
  isLoading?: boolean;
}

export function ProductForm({
  open,
  onClose,
  onSubmit,
  initialProduct,
  isLoading = false,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialProduct;

  useEffect(() => {
    if (!open) return;
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setDescription(initialProduct.description);
      setImageUrl(initialProduct.imageUrl);
      setTagsInput(initialProduct.tags.join(", "));
    } else {
      setName("");
      setCategory("");
      setDescription("");
      setImageUrl("");
      setTagsInput("");
    }
    setErrors({});
  }, [initialProduct, open]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Product name is required";
    if (!category) e.category = "Please select a category";
    if (!description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSubmit({ name: name.trim(), category, description: description.trim(), imageUrl: imageUrl.trim(), tags });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              {isEditing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the product..."
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags <span className="text-muted-foreground">(comma-separated)</span></Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="wireless, noise-cancelling, premium"
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
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
