import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIInsight } from "../hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";

interface AIInsightCardProps {
  productId: bigint;
}

export function AIInsightCard({ productId }: AIInsightCardProps) {
  const queryClient = useQueryClient();
  const { data: insight, isLoading, isError } = useAIInsight(productId);

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["ai-insight", productId.toString()] });
  }

  return (
    <div className="ai-card-gradient rounded-xl p-5 relative overflow-hidden">
      {/* Decorative bg glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: "oklch(var(--ai-from))" }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ background: "oklch(var(--ai-to))" }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(var(--ai-from)), oklch(var(--ai-to)))" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground">AI Recommendation</h3>
              <p className="text-xs text-muted-foreground">Powered by intelligent analysis</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Unable to load AI insight. Please try refreshing.
          </p>
        ) : insight ? (
          <p className="text-sm leading-relaxed text-foreground/90 font-body">{insight}</p>
        ) : (
          <p className="text-sm text-muted-foreground font-body italic">
            Add price entries to get AI-powered recommendations for this product.
          </p>
        )}
      </div>
    </div>
  );
}
