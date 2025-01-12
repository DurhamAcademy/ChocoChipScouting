import PouchDB from 'pouchdb';

class LocalRemoteDatabaseSyncHolder<Content extends {} = {}> {
  name: string;
  local: PouchDB.Database<Content>;
  remote: PouchDB.Database<Content>;

  constructor(name: string) {
    this.name = name;
    this.local = new PouchDB(name, { skip_setup: true, name: name });
    this.remote = new PouchDB(couchDBBaseURL + name, {
      skip_setup: true,
      name: name,
      adapter: 'http',
    });
  }

  sync() {
    return PouchDB.sync(this.local, this.remote, {
      live: true,
      retry: true,
    });
  }

  static databases = {
    attachments: new LocalRemoteDatabaseSyncHolder<Attachments>('attachments'),
    scoutingData: new LocalRemoteDatabaseSyncHolder<ScoutingData>(
      'scouting-data',
    ),
    teamInfo: new LocalRemoteDatabaseSyncHolder<TeamInfo>('team-info'),
    basic: new LocalRemoteDatabaseSyncHolder<{}>('basic'),
  };
  static locals = {
    attachments: this.databases.attachments.local,
    scoutingData: this.databases.scoutingData.local,
    teamInfo: this.databases.teamInfo.local,
    basic: this.databases.basic.local,
  };
  static remotes = {
    attachments: this.databases.attachments.remote,
    scoutingData: this.databases.scoutingData.remote,
    teamInfo: this.databases.teamInfo.remote,
    basic: this.databases.basic.remote,
  };
}
export type TeamTableData = {
  team: { data: string; color: string };
  driver: { data: number; color: string };
  defense: { data: number; color: string };
  ampAuto: { data: number; color: string };
  speakerAuto: { data: number; color: string };
  autoAcc: { data: string; color: string };
  teleAmp: { data: number; color: string };
  teleSpeaker: { data: number; color: string };
  teleAcc: { data: string; color: string };
  endgamePoints: { data: number; color: string };
  endgameChart: { data: string; color: string };
  class: string;
  rawData: any;
  extraNotes: string;
};
export type DataArrayOrSum = {
  driver: number[];
  defense: number[];
  ampAuto: number[];
  speakerAuto: number[];
  autoAcc: number[];
  teleAmp: number[];
  teleSpeaker: number[];
  teleAcc: number[];
  endgamePoints: number[];
};

export type ScoutingData = {
  teamNumber: any;
  event: string;
  matchNumber: any;
  author: string;
  org: string;
  auto: {
    coralL1: number;
    coralL2: number;
    coralL3: number;
    coralL4: number;
    processorMiss: number;
    processor: number;
    netMiss: number;
    net: number;
    mobility: boolean;
  };
  teleop: {
    coralL1: number;
    coralL2: number;
    coralL3: number;
    coralL4: number;
    processorMiss: number;
    processor: number;
    netMiss: number;
    net: number;
  };
  endgame: { endgame: string[] };
  notes: {
    notes: string;
    promptedNotes: Array<{
      selected: boolean;
      rating: number;
      notes: Array<string>;
    }>;
  };
};

export type TeamInfo = {
  teamNum: number;
  teamName: string;
};

export type Attachments = {
  event: string;
  name: string;
  teamNumber: number;
  fileSize: string;
  author: string | undefined;
  tags: string[];
  extraNotes: string;
  dateUploaded: string;
};

export default {
  databases: LocalRemoteDatabaseSyncHolder.databases,
  locals: LocalRemoteDatabaseSyncHolder.locals,
  remotes: LocalRemoteDatabaseSyncHolder.remotes,
};
