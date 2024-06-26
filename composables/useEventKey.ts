import { eventOptions } from '~/utils/eventOptions';

export const useEventKey = () => {
  const eventKey = ref(eventOptions[0]);

  function updateEvent() {
    if (typeof window !== 'undefined')
      eventKey.value = localStorage.getItem('currentEvent') || eventOptions[0];
    else {
      console.log('ran error eventoptions 0');
      eventKey.value = eventOptions[0];
    }
  }

  onMounted(() => {
    updateEvent();
    window.addEventListener('event-changed', () => {
      updateEvent();
      console.log('event changed');
    });
  });

  return eventKey;
};