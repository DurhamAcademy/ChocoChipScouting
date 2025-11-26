/*
the function team with param "team_key"
event: the team key for the team you are looking up (such as frc6502)
returns a json file of each team at the event fetched using the TBA API
 */
export default defineEventHandler(async team => {
  const teamKey = getRouterParam(team, 'team_key');
  let config = useRuntimeConfig();
  if (config.tbaKey != undefined) {
    let urlNoNum: string = 'https://www.thebluealliance.com/api/v3/';
    let urlFinal: string = urlNoNum + 'team/' + teamKey;
    let grab: any;
    grab = await fetch(urlFinal, {
      method: 'GET',
      headers: {
        'X-TBA-Auth-Key': config.tbaKey,
      },
    });
    return await grab.json();
  } else {
    throw new Error('Server side error');
  }
});
