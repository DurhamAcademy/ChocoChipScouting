import stdev from '@stdlib/stats-base-stdev';

export function calculateTeamCPS(template: ScoutingDataTemplate, rawMatchData: ScoutingDataTest[]) {
  const phases: GamePhase[] = ['auto', 'teleop', 'endgame'];

  let phasePointTotals: number[] = [];

  const matchCount = rawMatchData.length;
  let matchPointTotals: number[] = new Array(matchCount).fill(0);

  let totalScored: number = 0;
  let totalMissed: number = 0;

  let totalRatings: number[] = new Array(template.notes.note_sections.length).fill(0);

  // calculating all stats from all phases
  for (const phase of phases) {
    const phaseTemplate = template[phase];

    // total points per phase
    let phasePoints = 0;

    // iterating through all of the respective team's matches
    for (let i = 0; i < matchCount; i++) {
      let matchPointTotal = 0;

      // calculating stats from tiered objectives
      rawMatchData[i]![phase].tiered_objectives.forEach((tieredObj, tieredIdx) => {
        tieredObj.objectives.forEach((obj, objIdx) => {
          matchPointTotal += obj.count_made * phaseTemplate.tiered_objectives[tieredIdx]!.objectives[objIdx]!.points;
          totalScored += obj.count_made;
          totalMissed += obj.count_missed;
        })
      })

      // calculating stats from special objectives
      rawMatchData[i]![phase].special_objectives.forEach((specialObj, specialIdx) => {
        specialObj.options.forEach((opt, optIdx) => {
          matchPointTotal += Number(opt.selected) * phaseTemplate.special_objectives[specialIdx]!.options[optIdx]!.points;
        })
      })

      // calculating stats from objectives
      rawMatchData[i]![phase].objectives.forEach((obj, objIdx) => {
        matchPointTotal += obj.count_made * phaseTemplate.objectives[objIdx]!.points;
        totalScored += obj.count_made;
        totalMissed += obj.count_missed;
      })

      // calculating stats from simple objectives
      rawMatchData[i]![phase].simple_objectives.forEach((simpleObj, simpleIdx) => {
        matchPointTotal += Number(simpleObj.selected) * phaseTemplate.simple_objectives[simpleIdx]!.points;
      })

      phasePoints += matchPointTotal;

      // calculating total points per match (all phases)
      matchPointTotals[i]! += matchPointTotal;
    }

    phasePointTotals.push(phasePoints);
  }

  // calculating total rating points
  for (const match of rawMatchData) {
    match.notes.note_sections.forEach((noteSec, noteIdx) => {
      totalRatings[noteIdx]! += noteSec.rating;
    })
  }

  // normalizing rating score (should be from 0-1)
  const totalRatingMax = template.notes.note_sections.reduce((sum, noteSection) =>sum + noteSection.rating_bar_max, 0);
  const normalizedRating = totalRatingMax > 0 ? (totalRatings.reduce((accumulator, rating) => accumulator + rating, 0) / totalRatingMax / matchCount) : -1

  const cpsStats = {
    autoAvg: phasePointTotals[0]! / matchCount,
    teleopAvg: phasePointTotals[1]! / matchCount,
    endgameAvg: phasePointTotals[2]! / matchCount,
    accuracy: totalScored / (totalScored + totalMissed),
    consistency: 1 / stdev(matchPointTotals.length, 1, matchPointTotals, 1),
    rating: normalizedRating,
  };

  // weights for different statistics of composition score (we will possibly train an ML model to calculate the best weights)
  let weights = {
    autoAvg: 0,
    teleopAvg: 0,
    endgameAvg: 0,
    accuracy: 0,
    consistency: 1,
    rating: 0,
  }

  const compositeScore =
    cpsStats.autoAvg * weights.autoAvg +
    cpsStats.teleopAvg * weights.teleopAvg +
    cpsStats.endgameAvg * weights.endgameAvg +
    cpsStats.accuracy * weights.accuracy +
    cpsStats.consistency * weights.consistency +
    // 0 cps score if no ratings from note sections
    cpsStats.rating * (normalizedRating === -1 ? 0 : weights.rating);

  return {
    cps: compositeScore,
    stats: cpsStats
  };
}