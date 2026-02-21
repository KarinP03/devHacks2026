import type { CollectionItem } from "./collection-item.js";

/**
 * Generic service contract.
 * Adds business logic on top of the repository layer.
 */
export interface ICollectionService<T extends CollectionItem> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  add(item: Omit<T, "id" | "dateAdded">): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
  search(query: string): Promise<T[]>;
}
