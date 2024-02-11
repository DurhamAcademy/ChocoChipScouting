import {getEventOptions} from "~/composables/getEventOptions";

export const useSelectedEvent = () => {
  return useState('selectedEvent', () => getEventOptions().value[0])
}