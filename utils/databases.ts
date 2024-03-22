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

export type ScoutingData = {
    auto: { speakerNA: number; amp: number; missed: number; mobility: boolean };
    notes: {  notes: string; promptedNotes: Array<{ selected: boolean, rating: number, notes: Array<string> }> };
    endgame: { endgame: string[]; trap: number; spotlight: number };
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
