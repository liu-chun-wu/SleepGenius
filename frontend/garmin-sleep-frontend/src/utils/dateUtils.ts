export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // "2025-06-11"
}
