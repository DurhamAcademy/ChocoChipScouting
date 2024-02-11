import {getEventOptions} from "~/composables/getEventOptions";

export const useSelectedEvent = () => {
  let event = window.localStorage.getItem('selectedEvent') != null ?
      window.localStorage.getItem('selectedEvent'): getEventOptions().value[0]
  return useState('selectedEvent', () => event)
}