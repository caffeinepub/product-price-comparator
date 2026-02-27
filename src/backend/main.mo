import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Map "mo:core/Map";

actor {
  type Product = { id : Nat; name : Text; category : Text; description : Text; imageUrl : Text; tags : [Text] };
  type PriceEntry = { productId : Nat; store : Text; price : Float; inStock : Bool };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  module PriceEntry {
    public func compare(priceEntry1 : PriceEntry, priceEntry2 : PriceEntry) : Order.Order {
      switch (Float.compare(priceEntry1.price, priceEntry2.price)) {
        case (#equal) { Nat.compare(priceEntry1.productId, priceEntry2.productId) };
        case (order) { order };
      };
    };
  };

  let products = Map.empty<Nat, Product>();
  let priceEntries = Map.empty<Nat, List.List<PriceEntry>>();
  var nextProductId = 1;

  public shared ({ caller }) func createProduct(name : Text, category : Text, description : Text, imageUrl : Text, tags : [Text]) : async Product {
    let product : Product = {
      id = nextProductId;
      name;
      category;
      description;
      imageUrl;
      tags;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, category : Text, description : Text, imageUrl : Text, tags : [Text]) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct : Product = {
          id;
          name;
          category;
          description;
          imageUrl;
          tags;
        };
        products.add(id, updatedProduct);
        updatedProduct;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not products.containsKey(id)) { Runtime.trap("Product not found") };
    products.remove(id);
    priceEntries.remove(id);
  };

  public shared ({ caller }) func addPriceEntry(productId : Nat, store : Text, price : Float, inStock : Bool) : async PriceEntry {
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };
    let newEntry : PriceEntry = { productId; store; price; inStock };
    let existingEntries = switch (priceEntries.get(productId)) {
      case (null) { List.empty<PriceEntry>() };
      case (?entries) { entries };
    };
    existingEntries.add(newEntry);
    priceEntries.add(productId, existingEntries);
    newEntry;
  };

  public shared ({ caller }) func updatePriceEntry(productId : Nat, store : Text, price : Float, inStock : Bool) : async PriceEntry {
    switch (priceEntries.get(productId)) {
      case (null) { Runtime.trap("No price entries for this product") };
      case (?entries) {
        var storeFound = false;
        let updatedEntries = entries.map<PriceEntry, PriceEntry>(
          func(entry) {
            if (entry.store == store) {
              storeFound := true;
              { productId; store; price; inStock };
            } else {
              entry;
            };
          }
        );
        if (not storeFound) { Runtime.trap("Store not found for this product") };
        priceEntries.add(productId, updatedEntries);
        { productId; store; price; inStock };
      };
    };
  };

  public shared ({ caller }) func deletePriceEntry(productId : Nat, store : Text) : async () {
    switch (priceEntries.get(productId)) {
      case (null) { Runtime.trap("No price entries for this product") };
      case (?entries) {
        let initialSize = entries.size();
        let filteredEntries = entries.filter(func(entry) { entry.store != store });
        if (filteredEntries.size() == initialSize) { Runtime.trap("Store not found for this product") };
        priceEntries.add(productId, filteredEntries);
      };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func searchProducts(searchText : Text) : async [Product] {
    let results = List.empty<Product>();
    let searchTextLower = Text.fromIter(
      searchText.toArray().values().map(
        func(c) {
          if (c >= 'A' and c <= 'Z') {
            Char.fromNat32(c.toNat32() + 32);
          } else {
            c;
          };
        }
      )
    );
    for ((_, product) in products.entries()) {
      let productNameLower = Text.fromIter(
        product.name.toArray().values().map(
          func(c) {
            if (c >= 'A' and c <= 'Z') {
              Char.fromNat32(c.toNat32() + 32);
            } else {
              c;
            };
          }
        )
      );
      if (productNameLower.contains(#text(searchTextLower))) {
        results.add(product);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    let results = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.category == category) {
        results.add(product);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getPriceEntries(productId : Nat) : async [PriceEntry] {
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };
    switch (priceEntries.get(productId)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getAIInsight(productId : Nat) : async Text {
    switch (products.get(productId), priceEntries.get(productId)) {
      case (null, _) { Runtime.trap("Product not found") };
      case (_, null) { "No price entries available for this product." };
      case (_, ?entries) {
        if (entries.size() == 0) { return "No price entries available for this product." };

        let filtered = entries.toArray().filter(func(entry) { entry.inStock });
        if (filtered.size() == 0) {
          let stores = entries.toArray().map(func(entry) { entry.store });
          let storeNames = stores.foldLeft("", func(accum, store) { if (accum == "") { store } else { accum # ", " # store } });
          return "Currently out of stock at all stores. Available at: " # storeNames;
        };
        let sorted = filtered.sort();
        let minEntry = sorted[0];
        let maxEntry = sorted[filtered.size() - 1];

        if (filtered.size() == 1) {
          return "Best deal at " # minEntry.store # " for $" # minEntry.price.toInt().toText() # " (only available option).";
        };

        let savings = maxEntry.price - minEntry.price;
        "Best deal at " # minEntry.store # " — save $" # savings.toInt().toText() # " compared to the most expensive option (" # maxEntry.store # ").";
      };
    };
  };
};
