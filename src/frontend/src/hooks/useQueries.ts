import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Product, PriceEntry } from "../backend.d";
import { SAMPLE_PRODUCTS } from "../sampleData";

// ── Product Queries ──────────────────────────────────────────────────────────

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "search", searchText],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchText.trim()) return actor.getAllProducts();
      return actor.searchProducts(searchText);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllProducts();
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ── Price Queries ────────────────────────────────────────────────────────────

export function usePriceEntries(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PriceEntry[]>({
    queryKey: ["prices", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return [];
      return actor.getPriceEntries(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useAIInsight(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["ai-insight", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return "";
      return actor.getAIInsight(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
    staleTime: 30_000,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      category,
      description,
      imageUrl,
      tags,
    }: {
      name: string;
      category: string;
      description: string;
      imageUrl: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createProduct(name, category, description, imageUrl, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      category,
      description,
      imageUrl,
      tags,
    }: {
      id: bigint;
      name: string;
      category: string;
      description: string;
      imageUrl: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(id, name, category, description, imageUrl, tags);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id.toString()] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddPriceEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      store,
      price,
      inStock,
    }: {
      productId: bigint;
      store: string;
      price: number;
      inStock: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPriceEntry(productId, store, price, inStock);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prices", variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["ai-insight", variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdatePriceEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      store,
      price,
      inStock,
    }: {
      productId: bigint;
      store: string;
      price: number;
      inStock: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePriceEntry(productId, store, price, inStock);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prices", variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["ai-insight", variables.productId.toString()] });
    },
  });
}

export function useDeletePriceEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      store,
    }: {
      productId: bigint;
      store: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePriceEntry(productId, store);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prices", variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["ai-insight", variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSeedSampleData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      for (const sample of SAMPLE_PRODUCTS) {
        const product = await actor.createProduct(
          sample.name,
          sample.category,
          sample.description,
          sample.imageUrl,
          sample.tags,
        );
        for (const price of sample.prices) {
          await actor.addPriceEntry(product.id, price.store, price.price, price.inStock);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
