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

    async sync() {
        PouchDB.sync(this.local, this.remote, {live: true, retry: true,})
    }

    static databases: { attachments: LocalRemoteDatabaseSyncHolder<{ name: string; team: number | undefined; author: string }>; scoutingData: LocalRemoteDatabaseSyncHolder<{ team: number }>; basic: LocalRemoteDatabaseSyncHolder<{}> } = {
        "attachments": new LocalRemoteDatabaseSyncHolder<{name: string, team: number|undefined, author: string}>("attachment-db"),
        "scoutingData": new LocalRemoteDatabaseSyncHolder<{team: number}>("scouting-data"),
        "basic": new LocalRemoteDatabaseSyncHolder<{}>("basic")
    };
    static locals: { attachments: PouchDB.Database<{ name: string; team: number | undefined; author: string }>; scoutingData: PouchDB.Database<{ team: number }>; basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "basic": this.databases.basic.local,
    };
    static remotes: { attachments: PouchDB.Database<{ name: string; team: number | undefined; author: string }>; scoutingData: PouchDB.Database<{ team: number }>; basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "basic": this.databases.basic.remote,
    };
}

for (const database of Object.values(LocalRemoteDatabaseSyncHolder.databases)) {
    database.sync()
}

export default {
    databases: LocalRemoteDatabaseSyncHolder.databases,
    locals: LocalRemoteDatabaseSyncHolder.locals,
    remotes: LocalRemoteDatabaseSyncHolder.remotes
};