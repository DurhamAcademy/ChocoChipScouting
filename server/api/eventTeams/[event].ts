/*
the function event teams with param "event"
event: the TBA key for the event you are looking up (such as 2023ncash)
returns a json file of each team at the event fetched using the TBA API
 */
export default defineEventHandler(async event => {
  const eventKey = getRouterParam(event, 'event');
  let config = useRuntimeConfig();
  if (config.tbaKey != undefined) {
    let urlNoNum: string = 'https://www.thebluealliance.com/api/v3/';
    let urlFinal: string = urlNoNum + 'event/' + eventKey + '/teams/simple';
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
