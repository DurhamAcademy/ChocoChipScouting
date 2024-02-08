export const useEvent = () => {
  return useState('selectedEvent', () => window.localStorage.getItem("event"))
}
