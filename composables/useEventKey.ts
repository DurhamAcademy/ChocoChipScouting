import {eventOptions} from "~/utils/eventOptions";

export const useEventKey = () => {
    const eventKey = ref(eventOptions[0])

    if (typeof window !== 'undefined') eventKey.value = localStorage.getItem('currentEvent') || eventOptions[0]

    function update(){
        if (typeof window !== 'undefined') eventKey.value = localStorage.getItem('currentEvent') || eventOptions[0]
    }

    onMounted(() => update)
    onUnmounted(() => update)

    return eventKey
}