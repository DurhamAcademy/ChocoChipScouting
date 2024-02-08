export const useSelectedEvent = () => {
  return useState('selectedEvent', () => window.localStorage.getItem("event"))
}
