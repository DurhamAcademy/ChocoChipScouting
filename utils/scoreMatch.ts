export function scoreMatch(match: any){
    let autoScores = match.auto.coralL1 * 3 + match.auto.coralL2 * 4 + match.auto.coralL3 * 6 + match.auto.coralL4 * 7 + match.auto.processor * 6
    let teleopScores = match.teleop.coralL1 * 2 + match.teleop.coralL2 * 3 + match.teleop.coralL3 * 4 + match.teleop.coralL4 * 5 + match.teleop.processor * 6
    let endgameScores = 0
    if(match.endgame.endgame.includes("Parked")) endgameScores += 2
    if(match.endgame.endgame.includes("Shallow")) endgameScores += 6
    if(match.endgame.endgame.includes("Deep")) endgameScores += 12
    return autoScores + teleopScores + endgameScores
}
