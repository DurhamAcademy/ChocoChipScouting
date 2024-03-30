
export type SyncStatus = {
    human: String,
    id: Number,
    dbName: String,
    syncResult: PouchDB.Replication.SyncResult<{}> | undefined,
    finalSyncResult: PouchDB.Replication.SyncResultComplete<{}> | undefined
}

export const useSync = () => {
  let promises: [string, PouchDB.Replication.Sync<{}>][] =
      Object.entries(databases.databases)
          .map(database => [database[0], database[1].sync()])
    let replicationStatusState = useState<SyncStatus[]>(
        "replicationStatus",
        () => promises.map(database => ({
            human: "Starting",
            id: 0,
            dbName: database[0],
            syncResult: undefined,
            finalSyncResult: undefined
        })))
    promises.forEach(database => {
        database[1].on("change", info => {
            let statuses = replicationStatusState.value
            let index = statuses.findIndex(value => value.dbName == database[0])
            if (index !== -1) {
                statuses[index].syncResult = info
                statuses[index].id = 1;
                statuses[index].human = "Replicating"
                replicationStatusState.value = statuses;
            }
        }).on("paused",info => {
            let statuses = replicationStatusState.value
            let index = statuses.findIndex(value => value.dbName == database[0])
            if (index !== -1) {
                statuses[index].id = 2;
                statuses[index].human = "Paused"
                replicationStatusState.value = statuses;
            }
        }).on("active",() => {
            let statuses = replicationStatusState.value
            let index = statuses.findIndex(value => value.dbName == database[0])
            if (index !== -1) {
                statuses[index].id = 3;
                statuses[index].human = "Resumed"
                replicationStatusState.value = statuses;
            }
        }).on("error",(err) => {
            let statuses = replicationStatusState.value
            let index = statuses.findIndex(value => value.dbName == database[0])
            if (index !== -1) {
                statuses[index].id = 4;
                statuses[index].human = "An Error Occurred"
                replicationStatusState.value = statuses;
            }
        }).on("denied", (err) => {
            let statuses = replicationStatusState.value
            let index = statuses.findIndex(value => value.dbName == database[0])
            if (index !== -1) {
                statuses[index].id = 5;
                statuses[index].human = "Replication Denied"
                replicationStatusState.value = statuses;
            }
        }).on("complete", (completeResult) => {
            let statuses = replicationStatusState.value
            let index = statuses.findIndex(value => value.dbName == database[0])
            if (index !== -1) {
                statuses[index].id = 6;
                statuses[index].human = "Done"
                statuses[index].finalSyncResult = completeResult;
                replicationStatusState.value = statuses;
            }
        })
    })
   return replicationStatusState;
}
