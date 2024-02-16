//const TBA_KEY = process.env.TBA_KEY
//this is alr leaked so i dont feel bad :shrug:
const TBA_KEY = 'JBP0wpGwe79xWOVzDXWFKxgmFhZEmrIgVluq3PZf4z9OVcvROKTjnTrRu7D9rsUz'

/*export async function getEventMatches(event: string) {
    console.log(useRuntimeConfig().TBA_Key)
    if (TBA_KEY != undefined) {
        let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
        let urlFinal: string = urlNoNum + "event/" + event + "/matches";
        let grab: any;
        grab = await fetch(urlFinal, {
            method: 'GET',
            headers: {
                'X-TBA-Auth-Key': TBA_KEY
            }
        });
        return await grab.json();
    }
}*/

export default defineEventHandler(async (event) => {
    const eventKey = getRouterParam(event, 'event')
    let config = useRuntimeConfig()
    if (config.TBA_Key != undefined) {
        let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
        let urlFinal: string = urlNoNum + "event/" + eventKey + "/matches";
        let grab: any;
        grab = await fetch(urlFinal, {
            method: 'GET',
            headers: {
                'X-TBA-Auth-Key': TBA_KEY
            }
        });
         return await grab.json();
    }
    else{
        throw new Error("Server side error");
    }
})