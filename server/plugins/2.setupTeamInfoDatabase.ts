import { resolve } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'node:fs';
import { defineNitroPlugin } from '#imports';
import { eventOptions } from '~/utils/eventOptions';
import { EventData, TeamInfo } from '~/utils/databases';

const TEAM_INFO_PATH = resolve('./server/data/eventTeamInfo.json');
const DATA_DIR = resolve('./server/data/');
const TBA_KEY = process.env.NUXT_TBA_KEY;

let updatedTeamInfo: Boolean = false;

export default defineNitroPlugin(nitroApp => {
  // Adding hookOnce to run logic only once per request
  nitroApp.hooks.hookOnce('request', async () => {
    try {
      if (!updatedTeamInfo && TBA_KEY) {
        updatedTeamInfo = true;

        let previouslySavedEvents: EventData[] = [];

        // Ensure the directory exists
        if (!existsSync(DATA_DIR)) {
          await mkdir(DATA_DIR, { recursive: true });
        }

        // Read previously saved events
        try {
          const fileData = await readFile(TEAM_INFO_PATH, 'utf-8');
          previouslySavedEvents = JSON.parse(fileData).events || [];
        } catch (error) {
          console.log(
            'No existing eventTeamInfo.json found. Creating a new one.',
          );
        }

        let updatedEvents: EventData[] = [];

        for (const event of eventOptions) {
          const url = `https://www.thebluealliance.com/api/v3/event/${event}/teams/simple`;

          try {
            // fixme why is this a type bug?
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'X-TBA-Auth-Key': TBA_KEY,
              },
            });

            const tbaEventData = await response.json();
            if (tbaEventData.hasOwnProperty('Error')) {
              continue;
            }

            let previousEventDataObj = previouslySavedEvents.find(
              savedEvent => savedEvent.eventKey === event,
            );

            let eventTeams: TeamInfo[] = previousEventDataObj
              ? previousEventDataObj.teamInfo
              : [];

            let eventTeamsStartingLength = eventTeams.length;

            for (const team of tbaEventData) {
              let teamDataObj: TeamInfo = {
                teamNum: parseInt(team.key.replace('frc', '')),
                teamName: team.nickname,
              };

              if (
                !eventTeams.some(
                  obj =>
                    obj.teamNum === teamDataObj.teamNum &&
                    obj.teamName === teamDataObj.teamName,
                )
              ) {
                eventTeams.push(teamDataObj);
              }
            }

            if (eventTeams.length > eventTeamsStartingLength) {
              updatedEvents.push({
                eventKey: event,
                teamInfo: eventTeams,
              });
            }
          } catch (fetchError) {
            console.error(
              `Failed to fetch data for event ${event}:`,
              fetchError,
            );
          }
        }

        if (updatedEvents.length > 0) {
          // Remove duplicates from previously saved events
          previouslySavedEvents = previouslySavedEvents.filter(
            prevEvent =>
              !updatedEvents.some(
                updatedEvent => updatedEvent.eventKey === prevEvent.eventKey,
              ),
          );

          // Merge new data and save it
          const finalEvents = [...previouslySavedEvents, ...updatedEvents];

          await writeFile(
            TEAM_INFO_PATH,
            JSON.stringify({ events: finalEvents }, null, 2),
            'utf-8',
          );

          console.log(
            `Updated eventTeamInfo.json with ${finalEvents.length} events.`,
          );
        }
      }
    } catch (error) {
      console.error('An error occurred while processing team data:', error);
    }
  });
});
