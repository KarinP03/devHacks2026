/**
 * Simple ID generation using Node's built-in crypto.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
