import PouchDB from "pouchdb"

class LocalRemoteDatabaseSyncHolder<Content extends {} = {}> {
    name: string
    local: PouchDB.Database<Content>
    remote: PouchDB.Database<Content>

    constructor(name: string) {
        this.name = name;
        this.local = new PouchDB(name, {skip_setup: true, name: name})
        this.remote = new PouchDB(couchDBBaseURL + name, {
            skip_setup: true,
            name: name,
            adapter: "http"
        })
    }

    sync() {
        return PouchDB.sync(this.local, this.remote, {
            live: true,
            retry: true
        })
    }

    static databases = {
        "attachments": new LocalRemoteDatabaseSyncHolder<Attachments>("attachments"),
        "scoutingData": new LocalRemoteDatabaseSyncHolder<ScoutingData>("scouting-data"),
        "teamInfo": new LocalRemoteDatabaseSyncHolder<TeamInfo>("team-info"),
        "basic": new LocalRemoteDatabaseSyncHolder<{}>("basic")
    };
    static locals= {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "teamInfo": this.databases.teamInfo.local,
        "basic": this.databases.basic.local,
    };
    static remotes = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "teamInfo": this.databases.teamInfo.remote,
        "basic": this.databases.basic.remote,
    };
}
export type TeamTableData = {
    team: { data: string; color: string };
    offense: { data: number; color: string };
    defense: { data: number; color: string };
    ampAuto: { data: number; color: string };
    speakerAuto: { data: number; color: string };
    autoAcc: { data: string; color: string };
    teleAmp: { data: number; color: string };
    teleSpeaker: { data: number; color: string };
    teleAcc: { data: string; color: string };
    traps: { data: number; color: string };
    endgamePoints: { data: number; color: string };
    endgameChart: { data: string; color: string };
    class: string
    rawData: any
    extraNotes: string
};
export type DataArrayOrSum = {
    offense: number[];
    defense: number[];
    ampAuto: number[];
    speakerAuto: number[];
    autoAcc: number[];
    teleAmp: number[];
    teleSpeaker: number[];
    teleAcc: number[];
    traps: number[];
    endgamePoints: number[];
}

export type ScoutingData = {
    auto: { speakerNA: number; amp: number; missed: number; mobility: boolean };
    notes: {  notes: string; promptedNotes: Array<{ selected: boolean, rating: number, notes: Array<string> }> };
    endgame: { endgame: string[]; trap: number; };
    teamNumber: any;
    event: string;
    matchNumber: any;
    author: string;
    teleop: { speakerNA: number; amp: number; missed: number; }
}

export type TeamInfo = {
    teamNum: number,
    teamName: string
}

export type Attachments = {
    event: string;
    name: string;
    teamNumber: number;
    fileSize: string;
    author : string | undefined;
    tags: string[];
    extraNotes: string;
    dateUploaded: string;
}

export default {
    databases: LocalRemoteDatabaseSyncHolder.databases,
    locals: LocalRemoteDatabaseSyncHolder.locals,
    remotes: LocalRemoteDatabaseSyncHolder.remotes
};
