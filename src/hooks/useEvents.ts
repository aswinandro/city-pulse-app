import { useData } from "../providers/DataProvider"

export const useEvents = () => {
  const { events, loading, error, searchEvents, clearEvents, loadSampleEvents, loadDefaultEvents } = useData()

  return {
    events,
    loading,
    error,
    searchEvents,
    clearEvents,
    loadSampleEvents,
    loadDefaultEvents,
  } as const
}
