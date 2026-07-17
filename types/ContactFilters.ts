export type ContactFilters = {
  searchQuery: string
  selectedAgeRangeLabel: string
  showFavoritesOnly: boolean
}

export const DEFAULT_CONTACT_FILTERS: ContactFilters = {
  searchQuery: "",
  selectedAgeRangeLabel: "",
  showFavoritesOnly: false,
}
