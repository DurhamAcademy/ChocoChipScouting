import databases from "~/utils/databases";
import {eventOptions} from "~/utils/eventOptions";

const currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]


const { scoutingData } = databases.locals
let db = scoutingData

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc) => {
    return await db.get(doc.id)
})

let teamOrgMatches = new Map<number, Array<any>>()

for(let i  = 0; i < match.length; i++){
    let currentMatch = (await match[i])
    let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber): currentMatch.teamNumber
    if(currentMatch.event == currentEvent) {
        if (!teamOrgMatches.has(team)) {
            teamOrgMatches.set(team, [currentMatch])
        } else {
            let arr: Array<any> = teamOrgMatches.get(team)!
            arr.push(currentMatch)
            teamOrgMatches.set(team, arr)
        }
    }
}

for(let data of teamOrgMatches){
    let matches = teamOrgMatches.get(data[0])
    let matchNumbers: number[] = []
    if(matches) {
        for (let i = 0; i < matches.length; i++) {
            let currMatch = matches[i].matchNumber
            if(matchNumbers.includes(currMatch)) {
                for(let i = 0; i < data[1].length; i++){
                    if(data[1][i].matchNumber == currMatch){
                        let arr = teamOrgMatches.get(data[0])
                        if(arr != undefined){
                            arr.splice(i, 1)
                            teamOrgMatches.set(data[0], arr)
                        }
                        break
                    }
                }
            }
            else matchNumbers.push(currMatch)
        }
    }
}


/*
Get league average
go through team average diff from league average
for number {
for matches
match score - league score - diff from
average those
}
 */


let teamAutoAmpScore = new Map<number, number>()
let leagueAvg = 0
let leagueTotalMatches = 0

for(let teamData of teamOrgMatches){
    let avgAutoAmp = 0
    let totalMatches = 0
    for(let teamMatch of teamData[1]){
        if(teamMatch.event == currentEvent){
            totalMatches++
            leagueTotalMatches++
            avgAutoAmp += teamMatch.auto.amp
            leagueAvg += teamMatch.auto.amp
        }
    }
    teamAutoAmpScore.set(teamData[0], avgAutoAmp/totalMatches)
}
leagueAvg = leagueAvg/leagueTotalMatches


for(let i = 0; i < 500; i++){
    for(let teamData of teamOrgMatches) {
        let teamScore = teamAutoAmpScore.get(teamData[0])
        if (teamScore) {
            let avgAutoAmpScore = 0
            let totalMatches = 0
            for (let teamMatch of teamData[1]) {
                if (teamMatch.event == currentEvent) {
                    avgAutoAmpScore += teamMatch.auto.amp - leagueAvg - teamScore
                    totalMatches++
                }
            }
            teamAutoAmpScore.set(teamData[0], avgAutoAmpScore/totalMatches)
        }
    }
}

return teamAutoAmpScore