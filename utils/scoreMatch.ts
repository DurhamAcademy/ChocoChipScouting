export function scoreMatch(match: any){
    return scoreMatchAuto(match) + scoreMatchTeleop(match) + scoreMatchEndgame(match);
}

export function scoreMatchAuto(match: any){
    return (
      match.auto.coralL1 * 3 +
      match.auto.coralL2 * 4 +
      match.auto.coralL3 * 6 +
      match.auto.coralL4 * 7
    );
}

export function scoreMatchTeleop(match: any){
    return (
      match.teleop.coralL1 * 2 +
      match.teleop.coralL2 * 3 +
      match.teleop.coralL3 * 4 +
      match.teleop.coralL4 * 5 +
      match.teleop.processor * 6 +
      match.teleop.net * 4
    );
}

export function scoreMatchCoral(match: any){
  return (
    match.teleop.coralL1 * 2 +
    match.teleop.coralL2 * 3 +
    match.teleop.coralL3 * 4 +
    match.teleop.coralL4 * 5
  );
}

export function scoreMatchAlgae(match: any){
  return (
    match.teleop.processor * 6 +
    match.teleop.net * 4
  );
}

export function scoreMatchEndgame(match: any){
    let endgameScores = 0
    if(match.endgame.endgame.includes("Shallow Successful")) endgameScores += 12
    else if(match.endgame.endgame.includes("Deep Successful")) endgameScores += 6
    else if(match.endgame.endgame.includes("Parked")) endgameScores += 2
    return endgameScores
}
