export default defineEventHandler(async (team) => {
    const teamKey = getRouterParam(team, 'team')
    let config = useRuntimeConfig();
    if (config.tbaKey != undefined) {
        let urlNoNum: string = "https://www.thebluealliance.com/api/v3/";
        let urlFinal: string = urlNoNum + "team/" + teamKey + "/events";
        let grab: any;
        grab = await fetch(urlFinal, {
            method: 'GET',
            headers: {
                'X-TBA-Auth-Key': config.tbaKey
            }
        });
        return await grab.json();
    }
    else{
        throw new Error("Server side error");
    }
})