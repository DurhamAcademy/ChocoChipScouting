import { defineEventHandler } from 'h3';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

const TEAM_INFO_PATH = resolve('./server/data/eventTeamInfo.json');

export default defineEventHandler(async () => {
  try {
    // reads eventTeamInfo data from server file and parses it
    const fileData = await readFile(TEAM_INFO_PATH, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Failed to read eventTeamInfo.json:', error);
    return { events: [] }; // Return an empty array if there's an issue
  }
});
