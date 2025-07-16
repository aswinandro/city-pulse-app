import { useData } from "../providers/DataProvider" // Corrected import path

export const useEvents = () => {
  const { events, loading, error, searchEvents, clearEvents, loadSampleEvents } = useData()

  return {
    events,
    loading,
    error,
    searchEvents,
    clearEvents,
    loadSampleEvents,
  } as const
}
