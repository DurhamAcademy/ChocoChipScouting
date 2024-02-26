export default defineEventHandler(async (event) => {
    const eventKey = getRouterParam(event, 'event')
    let config = useRuntimeConfig()
    if (config.TBA_KEY != undefined) {
        let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
        let urlFinal: string = urlNoNum + "event/" + eventKey + "/matches";
        let grab: any;
        grab = await fetch(urlFinal, {
            method: 'GET',
            headers: {
                'X-TBA-Auth-Key': config.TBA_KEY
            }
        });
         return await config.TBA_kEY
    }
    else{
        throw new Error("Server side error");
    }
})