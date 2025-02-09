import { resolve } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { eventOptions } from '~/utils/eventOptions';
import { EventData, TeamInfo } from '~/utils/databases';
import { existsSync } from 'node:fs';
import { defineNuxtModule } from '@nuxt/kit'; // Adjust path as needed

// paths to server storage of eventInfo
// TODO i am guessing the server compiling is due to this section here
// const TEAM_INFO_PATH = resolve('./server/data/eventTeamInfo.json');
// const DATA_DIR = resolve('./server/data/');
const TBA_KEY = process.env.NUXT_TBA_KEY;
// ^ TODO likely path or env

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook('modules:done', async () => {
      console.log('RUNNING NUXT MODULE SETUP FOR EVENT DATA');
      console.log(TBA_KEY);
      // try {
      //   let previouslySavedEvents: EventData[] = [];
      //
      //   // Try to read the existing file
      //   try {
      //     if (!existsSync(DATA_DIR)) {
      //       await mkdir(DATA_DIR, { recursive: true });
      //     }
      //     const fileData = await readFile(TEAM_INFO_PATH, 'utf-8');
      //     previouslySavedEvents = JSON.parse(fileData).events || [];
      //   } catch (error) {
      //     console.log(
      //       'No existing eventTeamInfo.json found. Creating a new one.',
      //     );
      //   }
      //
      //   let updatedEvents: EventData[] = [];
      //
      //   for (let event of eventOptions) {
      //     if (TBA_KEY) {
      //       let urlNoNum: string = 'https://www.thebluealliance.com/api/v3/';
      //       let urlFinal: string =
      //         urlNoNum + 'event/' + event + '/teams/simple';
      //       let grab: any;
      //       grab = await fetch(urlFinal, {
      //         method: 'GET',
      //         headers: {
      //           'X-TBA-Auth-Key': TBA_KEY,
      //         },
      //       });
      //       const tbaEventData = await grab.json();
      //       if (tbaEventData.hasOwnProperty('Error')) continue;
      //
      //       let previousEventDataObj = previouslySavedEvents.find(
      //         savedEvent => savedEvent.eventKey === event,
      //       );
      //
      //       let eventTeams: Array<TeamInfo> = previousEventDataObj
      //         ? previousEventDataObj.teamInfo
      //         : [];
      //
      //       let eventTeamsStartingLength: number = eventTeams.length;
      //
      //       for (let team of tbaEventData) {
      //         let teamDataObj: TeamInfo = {
      //           teamNum: parseInt(team.key.replace('frc', '')),
      //           teamName: team.nickname,
      //         };
      //
      //         if (
      //           !eventTeams.some(
      //             obj =>
      //               obj.teamNum === teamDataObj.teamNum &&
      //               obj.teamName === teamDataObj.teamName,
      //           )
      //         ) {
      //           eventTeams.push(teamDataObj);
      //         }
      //       }
      //       if (eventTeams.length > eventTeamsStartingLength) {
      //         updatedEvents.push({
      //           eventKey: event,
      //           teamInfo: eventTeams,
      //         });
      //       }
      //     } else {
      //       throw new Error('TBA key missing');
      //     }
      //
      //     if (updatedEvents.length > 0) {
      //       for (let previousEvent of previouslySavedEvents) {
      //         let arrIndex = updatedEvents.findIndex(
      //           updatedEvent =>
      //             updatedEvent.eventKey === previousEvent.eventKey,
      //         );
      //         if (arrIndex !== -1) {
      //           previouslySavedEvents.splice(arrIndex, 1);
      //         }
      //       }
      //       // Merge new teams with existing ones
      //       const finalEvents = [...previouslySavedEvents, ...updatedEvents];
      //
      //       // Save updated data to file
      //       await writeFile(
      //         TEAM_INFO_PATH,
      //         JSON.stringify({ events: finalEvents }, null, 2),
      //         'utf-8',
      //       );
      //       console.log(
      //         `Updated eventTeamInfo.json with ${finalEvents.length} new events.`,
      //       );
      //     }
      //   }
      // } catch (error) {
      //   console.error('An error occurred while processing team data:', error);
      // }
    });
  },
});
