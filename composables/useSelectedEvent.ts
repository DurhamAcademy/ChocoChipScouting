import {eventOptions} from "~/utils/eventOptions";

export function useSelectedEvent(){
  let selectedEvent = useState('selectedEvent', () => {
    let getLocalStorageEvent =  window.localStorage.getItem('selectedEvent')
    return getLocalStorageEvent != null ? getLocalStorageEvent: eventOptions[0]
  });
  watch(selectedEvent, (event) => {
    window.localStorage.setItem('selectedEvent', event)
  })
  return selectedEvent
}