export interface EventImage {
  readonly ratio: string
  readonly url: string
  readonly width: number
  readonly height: number
  readonly fallback: boolean
}

export interface EventDate {
  readonly localDate?: string
  readonly localTime?: string
  readonly dateTime?: string
  readonly dateTBD?: boolean
  readonly dateTBA?: boolean
  readonly timeTBA?: boolean
  readonly noSpecificTime?: boolean
}

export interface EventDates {
  readonly start?: EventDate
  readonly timezone?: string
  readonly status?: {
    readonly code: string
  }
}

export interface EventClassification {
  readonly primary?: boolean
  readonly segment?: {
    readonly id: string
    readonly name: string
  }
  readonly genre?: {
    readonly id: string
    readonly name: string
  }
  readonly subGenre?: {
    readonly id: string
    readonly name: string
  }
}

export interface EventPriceRange {
  readonly type: string
  readonly currency: string
  readonly min: number
  readonly max: number
}

export interface EventVenue {
  readonly name: string
  readonly type: string
  readonly id: string
  readonly test: boolean
  readonly url: string
  readonly locale: string
  readonly city?: {
    readonly name: string
  }
  readonly state?: {
    readonly name: string
    readonly stateCode: string
  }
  readonly country?: {
    readonly name: string
    readonly countryCode: string
  }
  readonly address?: {
    readonly line1: string
    readonly line2?: string
  }
  readonly location?: {
    readonly longitude: string
    readonly latitude: string
  }
}

export interface Event {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly url?: string
  readonly locale?: string
  readonly images?: readonly EventImage[]
  readonly dates?: EventDates
  readonly classifications?: readonly EventClassification[]
  readonly info?: string
  readonly priceRanges?: readonly EventPriceRange[]
  readonly _embedded?: {
    readonly venues?: readonly EventVenue[]
  }
}
