import type { CollectionItem } from "./collection-item.js";

/**
 * Generic repository contract.
 * Each collection type implements this with its own storage backend.
 */
export interface IRepository<T extends CollectionItem> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, "id" | "dateAdded">): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  search(query: string): Promise<T[]>;
}
