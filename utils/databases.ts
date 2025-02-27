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
    basic: new LocalRemoteDatabaseSyncHolder<{}>('basic'),
  };
  static locals = {
    attachments: this.databases.attachments.local,
    scoutingData: this.databases.scoutingData.local,
    basic: this.databases.basic.local,
  };
  static remotes = {
    attachments: this.databases.attachments.remote,
    scoutingData: this.databases.scoutingData.remote,
    basic: this.databases.basic.remote,
  };
}
export type TeamTableData = {
  team: { data: string; color: string };
  driver: { data: number; color: string };
  defense: { data: number; color: string };
  netAuto: { data: number; color: string };
  netAutoAcc: { data: number; color: string };
  processorAuto: { data: number; color: string };
  processorAutoAcc: { data: number; color: string };
  coralL1Auto: { data: number; color: string };
  coralL2Auto: { data: number; color: string };
  coralL3Auto: { data: number; color: string };
  coralL4Auto: { data: number; color: string };
  reefAuto: { data: number; color: string };
  coralL1AutoAcc: { data: number; color: string };
  coralL2AutoAcc: { data: number; color: string };
  coralL3AutoAcc: { data: number; color: string };
  coralL4AutoAcc: { data: number; color: string };
  reefAutoAcc: { data: number; color: string };
  autoAcc: { data: string; color: string };
  teleNet: { data: number; color: string };
  teleAcc: { data: string; color: string };
  teleProcessor: { data: number; color: string };
  teleCoralL1: { data: number; color: string };
  teleCoralL2: { data: number; color: string };
  teleCoralL3: { data: number; color: string };
  teleCoralL4: { data: number; color: string };
  teleReef: { data: number; color: string };
  endgamePoints: { data: number; color: string };
  endgameChart: { data: string; color: string };
  class: string;
  rawData: any;
  extraNotes: string;
};
export type DataArrayOrSum = {
  driver: number[];
  defense: number[];
  netAuto: number[];
  netAutoAcc: number[];
  processorAuto: number[];
  processorAutoAcc: number[];
  coralL1Auto: number[];
  coralL2Auto: number[];
  coralL3Auto: number[];
  coralL4Auto: number[];
  reefAuto: number[];
  coralL1AutoAcc: number[];
  coralL2AutoAcc: number[];
  coralL3AutoAcc: number[];
  coralL4AutoAcc: number[];
  reefAutoAcc: number[];
  autoAcc: number[];
  teleNet: number[];
  teleProcessor: number[];
  teleCoralL1: number[];
  teleCoralL2: number[];
  teleCoralL3: number[];
  teleCoralL4: number[];
  teleReef: number[];
  teleAcc: number[];
  endgamePoints: number[];
};

export type ScoutingData = {
  auto: {
    coralL1: number;
    coralL2: number;
    coralL3: number;
    coralL4: number;
    coralL1Miss: number;
    coralL2Miss: number;
    coralL3Miss: number;
    coralL4Miss: number;
    reef: number;
    reefMiss: number;
    processorMiss: number;
    processor: number;
    netMiss: number;
    net: number;
    mobility: boolean;
    position: number;
  };
  notes: {
    notes: string;
    promptedNotes: Array<{
      selected: boolean;
      rating: number;
      notes: Array<string>;
    }>;
  };
  endgame: { endgame: string[] };
  teamNumber: any;
  event: string;
  matchNumber: any;
  author: string;
  teleop: {
    coralL1: number;
    coralL2: number;
    coralL3: number;
    coralL4: number;
    coralL1Miss: number;
    coralL2Miss: number;
    coralL3Miss: number;
    coralL4Miss: number;
    reef: number;
    reefMiss: number;
    processorMiss: number;
    processor: number;
    netMiss: number;
    net: number;
  };
};

export type TeamInfo = {
  teamNum: number;
  teamName: string;
};

export type EventData = {
  eventKey: string;
  teamInfo: TeamInfo[];
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

// NEW SCOUTING DATA FORMATTING
export type ScoutingDataTest = {
  teamNumber: string;
  eventKey: string;
  matchNumber: number;
  author: string;
  auto: {
    tiered_objectives: TieredObjectiveData[]; // 1x coral
    special_objectives: SpecialObjectiveData[]; // 1x auto starting position
    simple_objectives: SimpleObjectiveData[]; // 1x mobility
    notes: NoteData[]; // 1x note
  };
  teleop: {
    tiered_objectives: TieredObjectiveData[]; // 1x coral, 1x algae
    notes: NoteData[];
  };
  endgame: {
    climb: ClimbOptionData[];
    notes: NoteData[];
  };
  notes: {
    grouped_notes: GroupNoteData[];
  }
};

export type ObjectiveData = {
  countMade: number;
  countMissed: number;
}

export type TieredObjectiveData = {
  objectives: ObjectiveData[];
}

export type SpecialObjectiveData = {
  objective: string;
}

export type SimpleObjectiveData = {
  objective: boolean;
}

export type NoteData = {
  notes: string;
}

export type GroupNoteData = {
  rating: number;
  notes: NoteData[];
}


