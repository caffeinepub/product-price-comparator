import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Tag } from "lucide-react";
import type { Product, PriceEntry } from "../backend.d";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index?: number;
}

function useLowestPrice(productId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<PriceEntry[]>({
    queryKey: ["prices", productId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPriceEntries(productId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop";

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  const { data: prices } = useLowestPrice(product.id);

  const lowestPrice = prices && prices.length > 0
    ? prices.reduce((min, p) => p.price < min.price ? p : min, prices[0])
    : null;

  const delayClass = [`stagger-1`, `stagger-2`, `stagger-3`, `stagger-4`, `stagger-5`, `stagger-6`][index % 6];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left group product-card-hover animate-slide-up opacity-0 ${delayClass} rounded-xl overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      style={{ animationFillMode: "forwards" }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={product.imageUrl || PLACEHOLDER_IMG}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="text-xs font-body bg-background/90 backdrop-blur-sm border-border"
          >
            {product.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-base leading-tight text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-body">
            {product.description}
          </p>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground font-body"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-muted-foreground px-2 py-0.5">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="pt-1 border-t border-border">
          {lowestPrice ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Best price from</p>
                <p className="text-sm font-medium text-muted-foreground">{lowestPrice.store}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-display font-bold text-primary">
                  ${lowestPrice.price.toFixed(2)}
                </p>
                <p className={`text-xs font-body ${lowestPrice.inStock ? "text-price-best" : "text-destructive"}`}>
                  {lowestPrice.inStock ? "In stock" : "Out of stock"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-body">No prices yet</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border shadow-card">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="pt-1 border-t border-border flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
