import { defineStore } from 'pinia';
import { EventData } from '~/utils/databases';

export const useTeamStore = defineStore('eventTeamInfoStore', {
  state: () => ({
    events: [] as EventData[], // Default to an empty array
  }),

  actions: {
    async fetchTeams() {
      // Try to load from localStorage if available
      const storedEvents = localStorage.getItem('eventInfo');

      // if localstorage of events exists, set it as the state
      if (storedEvents) {
        try {
          // Parse the stored JSON data
          this.events = JSON.parse(storedEvents) as EventData[];
        } catch (error) {
          console.error('Error parsing stored event data:', error);
          // In case of invalid data, clear it
          localStorage.removeItem('eventInfo');
        }
      }

      // if there isn't any event data, fetch it from the server
      if (this.events.length === 0) {
        try {
          const { data } = await useFetch<{ events: EventData[] }>(
            '/api/eventTeamInfo',
          ); // Fetch data from server
          if (data.value) {
            this.events = data.value.events;
            localStorage.setItem(
              'eventInfo',
              JSON.stringify(data.value.events),
            ); // Cache in localStorage
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
        }
      }
    },
  },
});
