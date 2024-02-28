export default defineEventHandler(async (event) => {
    const eventKey = getRouterParam(event, 'event')
    let config = useRuntimeConfig();
    console.dir(config)
    if (config.tbaKey != undefined) {
        let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
        let urlFinal: string = urlNoNum + "event/" + eventKey + "/matches";
        let grab: any;
        grab = await fetch(urlFinal, {
            method: 'GET',
            headers: {
                'X-TBA-Auth-Key': config.tbaKey
            }
        });
        return config.tbaKey
        return await grab.json();
    }
    else{
        throw new Error("Server side error");
    }
})