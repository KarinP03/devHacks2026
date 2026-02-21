/**
 * Base interface for all collection items.
 * Every collection type (movies, vinyl, books, etc.) extends this.
 */
export interface CollectionItem {
  id: string;
  title: string;
  imageUrl?: string;
  dateAdded: string;
  rating?: number;
  tags: string[];
  notes?: string;
  collectionType: string;
}
