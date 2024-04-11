import {eventOptions} from "~/utils/eventOptions";

export const useEventKey = () => {
    const eventKey = ref(eventOptions[0])

    function updateEvent(){
        if (typeof window !== 'undefined') eventKey.value = localStorage.getItem('currentEvent') || eventOptions[0]
        else eventKey.value = eventOptions[0]
    }

    onMounted(() => {
        updateEvent()
        window.addEventListener("event-changed", () => {
            updateEvent()
        })
    })

    return eventKey
}