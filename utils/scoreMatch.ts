export function scoreMatch(match: any){
    let autoScores = match.auto.speakerNA * 5 + match.auto.amp * 2 + match.auto.mobility * 2
    let teleopScores = match.teleop.speakerNA * 2 + match.teleop.amp
    let endgameScores = match.endgame.trap * 5
    if(match.endgame.endgame.includes("Parked")) endgameScores += 1
    if(match.endgame.endgame.includes("Onstage")) endgameScores += 3
    if(match.endgame.endgame.includes("Harmony")) endgameScores += 2
    return autoScores + teleopScores + endgameScores
}