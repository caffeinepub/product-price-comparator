# Product Price Comparator

## Current State
No existing app. Fresh build.

## Requested Changes (Diff)

### Add
- Product management: users can manually add products with name, category, description, and image URL
- Store/price management: for each product, users can add multiple store entries with store name and price
- Price comparison view: side-by-side comparison of prices across stores for any product
- AI recommendation panel: based on product category and tags, suggest the best value pick and a short AI-generated insight (cheapest, best rated, etc.)
- Search and filter: search by product name, filter by category
- Product detail page: full product info + price comparison table + AI insight

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: store Products (id, name, category, description, imageUrl, tags) and PriceEntries (productId, storeName, price, inStock)
2. Backend: CRUD for products and price entries; query by category/search; AI insight generation (rule-based smart logic to suggest best deal)
3. Frontend: Home page with product grid + search/filter
4. Frontend: Add Product form (manual entry)
5. Frontend: Product Detail page with price comparison table
6. Frontend: AI Insight card showing best deal recommendation

## UX Notes
- Clean, modern UI with card-based product grid
- Price comparison shown as a sortable table with highlighted lowest price
- AI insight displayed as a highlighted callout box
- Simple form for adding products and store prices
- Mobile-friendly layout
