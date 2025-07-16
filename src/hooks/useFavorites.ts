import { useData } from "../providers/DataProvider" // Corrected import path

export const useFavorites = () => {
  const { favorites, toggleFavorite, isFavorite } = useData()

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  } as const
}
