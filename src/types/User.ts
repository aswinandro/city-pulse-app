export interface UserPreferences {
  readonly language: string
  readonly notifications: boolean
  readonly theme: "light" | "dark"
}

export interface UserStats {
  readonly eventsViewed: number
  readonly favoriteEvents: number
  readonly searchCount: number
}

export interface UserProfile {
  readonly uid: string
  readonly email: string
  readonly displayName: string
  readonly createdAt: string
  readonly lastLoginAt: string
  readonly preferences: UserPreferences
  readonly stats: UserStats
  readonly password?: string;
}

export interface UserSettings {
  readonly language: string
  readonly notifications: boolean
  readonly biometricEnabled: boolean
  readonly theme: "light" | "dark"
  readonly locationEnabled: boolean
}
