import AsyncStorage from "@react-native-async-storage/async-storage"

export class StorageService {
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error(`Error storing ${key}:`, error)
      throw error
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error)
      return null
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key}:`, error)
      throw error
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error("Error clearing storage:", error)
      throw error
    }
  }

  // User-specific methods
  static async setUserData(userId: string, data: unknown): Promise<void> {
    await this.setItem(`user_${userId}`, data)
  }

  static async getUserData<T>(userId: string): Promise<T | null> {
    return await this.getItem<T>(`user_${userId}`)
  }

  // Favorites methods
  static async setFavorites(userId: string, favorites: readonly unknown[]): Promise<void> {
    await this.setItem(`favorites_${userId}`, favorites)
  }

  static async getFavorites<T>(userId: string): Promise<readonly T[]> {
    const favorites = await this.getItem<readonly T[]>(`favorites_${userId}`)
    return favorites ?? []
  }

  // Search history methods
  static async addSearchHistory(userId: string, searchTerm: string): Promise<void> {
    try {
      const history = (await this.getItem<readonly string[]>(`search_history_${userId}`)) ?? []
      const updatedHistory = [searchTerm, ...history.filter((term) => term !== searchTerm)].slice(0, 10)
      await this.setItem(`search_history_${userId}`, updatedHistory)
    } catch (error) {
      console.error("Error adding search history:", error)
    }
  }

  static async getSearchHistory(userId: string): Promise<readonly string[]> {
    return (await this.getItem<readonly string[]>(`search_history_${userId}`)) ?? []
  }

  // App settings methods
  static async setAppSettings(settings: unknown): Promise<void> {
    await this.setItem("app_settings", settings)
  }

  static async getAppSettings<T>(): Promise<T | null> {
    return await this.getItem<T>("app_settings")
  }
}
