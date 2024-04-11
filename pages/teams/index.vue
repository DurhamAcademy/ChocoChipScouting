<script setup lang="ts">
import databases, {type DataArrayOrSum, type ScoutingData, type TeamTableData} from "~/utils/databases";
import IdMeta = PouchDB.Core.IdMeta;
import Sentiment from 'sentiment';
import {eventOptions} from "~/utils/eventOptions";
import {useWindowSize} from "@vueuse/core";
import {useEventKey} from "~/composables/useEventKey";

let {width, height} = useWindowSize()

let sentiment = new Sentiment()
let options = {
  extras: {
    'mid': -2,
    'pretty': 0,
    'broke': -3.5,
    'disabled': -3.5,
    'quickly': 2,
    'easily': 2,
    'dog': -3
  }
}

const events = eventOptions
const currentEvent = useEventKey()
const fetch = useFetch<Array<any>>("/api/eventMatches/" + currentEvent.value)

let filters = ref({
  teamNum: {
    include: [],
    exclude: []
  },
  matchNum: {
    include: []
  },
  author: {
    include: [],
    exclude: []
  },
  auto: {
    selected: false
  },
  endgame: {
    selected: false
  }
})

let filterOptions = ["Team #", "Match #", "-Author"]
let activeFilterOption = ref(filterOptions[0])
let filterInput = ref("")
let activeFilters = ref<Array<string>>([])

function addFilter(){
  if(filterInput.value != ''){
    activeFilters.value.push(activeFilterOption.value + ": " + filterInput.value)
    filterInput.value = ""
  }
}

watch(activeFilters, async () => {
  await tableSetup()
}, {
  deep: true
})


const { scoutingData: db } = databases.locals

const matches = (await db.allDocs()).rows
let match = matches.map(async (doc): Promise<ScoutingData & IdMeta> => {
  return await db.get(doc.id)
})

let teamOrgMatches = new Map<number,Array<ScoutingData & IdMeta>>()
let extraNotes = new Map<number, Array<string>>()

for(let i  = 0; i < match.length; i++){
  let currentMatch = (await match[i])
  if(currentMatch.matchNumber != -1) {
    let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber) : currentMatch.teamNumber
    if (!teamOrgMatches.has(team)) {
      teamOrgMatches.set(team, [currentMatch])
    } else {
      let arr: Array<ScoutingData & IdMeta> = teamOrgMatches.get(team)!
      arr.push(currentMatch)
      teamOrgMatches.set(team, arr)
    }
  }
  else if(currentMatch.notes.notes != undefined){
    let team = typeof currentMatch.teamNumber == "string" ? parseInt(currentMatch.teamNumber) : currentMatch.teamNumber
    if (!extraNotes.has(team)) {
      extraNotes.set(team, [currentMatch.notes.notes])
    } else {
      let arr: Array<string> = extraNotes.get(team)!
      arr.push(currentMatch.notes.notes)
      extraNotes.set(team, arr)
    }
  }
}

let teamsData = ref<any>([])

async function tableSetup() {
  teamsData.value.length = 0

  /*
  Creates two arrays that are filters applied on all data for team numbers and events (includes match number filter)
   */
  let blueAlliance = []
  let redAlliance = []
  let allowedTeams: string[] = []
  let bannedAuthors: string[] = []

  for(let filter of activeFilters.value){
    if(filter.startsWith(filterOptions[0])){
      allowedTeams.push(filter.split(":")[1].trim())
    }
    if(filter.startsWith((filterOptions[2]))){
      bannedAuthors.push(filter.split(":")[1].trim())
    }
    if(filter.startsWith(filterOptions[1])){
      let tbaMatchData = fetch.data.value
      if (tbaMatchData != null) {
        let userInput = filter.split(":")[1].trim()
        for(let match of tbaMatchData) {
          if (match.comp_level == "qm" && match.match_number == userInput) {
            for (let team of match.alliances.blue.team_keys) {
              let cleanedTeam = team.replace("frc", "")
              if (!allowedTeams.includes(cleanedTeam)) {
                allowedTeams.push(cleanedTeam)
                blueAlliance.push(cleanedTeam)
              }
            }
            for(let team of match.alliances.red.team_keys){
              let cleanedTeam = team.replace("frc", "")
              if(!allowedTeams.includes(cleanedTeam)) {
                allowedTeams.push(cleanedTeam)
                redAlliance.push(cleanedTeam)
              }
            }
          }
        }
      }
    }
  }
  tableLoop: for (let [key, value] of teamOrgMatches) {
    if(key == undefined) continue
    /*
    Data is an array of all matches, associated with a team (key), for the event filters selected
     */
    let data: Array<ScoutingData & IdMeta> = []
    //if sorted by match apply alliance colors
    let alliance = blueAlliance.includes(key.toString()) ? "bg-blue-100": redAlliance.includes(key.toString()) ? "bg-red-100": ""


    if (allowedTeams.length == 0 || allowedTeams.includes(key.toString())) {
      for (let match of value) {
        if (match.event != undefined && currentEvent.value == match.event && !bannedAuthors.includes(match.author)) {
          data.push(match)
        }
      }
    }

    let teamExtraNotes = extraNotes.get(key)
    if(teamExtraNotes == undefined) teamExtraNotes = []

    /*
    Removes match overlaps
     */
    let matchNumbers: number[] = []
    for(let value of data){
      let currMatch = value.matchNumber
      if(matchNumbers.includes(currMatch)) {
        let includedOne = false
        for(let i = data.length - 1; i >= 0; i--){
          if(data[i].matchNumber == currMatch){
            //switch to prioritizing your org not just darc side
            if(includedOne){
              data.splice(data.indexOf(data[i]), 1)
            }
            else includedOne = true
          }
        }
      }
      else matchNumbers.push(currMatch)
    }

    if (data.length > 0) {
      let arr = {
        team: {data: String(key), color: ''},
        driver: {data: Math.round(averageDriverScore(data)*100)/100, color: ''},
        defense: {data: Math.round(averageDefensiveScore(data)*100)/100, color: ''},
        ampAuto: {data: Math.round(averageAmpsAuto(data)*100)/100, color: ''},
        speakerAuto: {data: Math.round(averageSpeakersAuto(data)*100)/100, color: ''},
        autoAccData: autoAccuracy(data),
        autoAcc: {data: !isNaN(+autoAccuracy(data)[1]) ? Math.round(+autoAccuracy(data)[1]*1000)/10+'%' : '0%', color: ''},
        teleAmp: {data: Math.round(getAverageAmpCycles(data)*100)/100, color: ''},
        teleSpeaker: {data: Math.round(getAverageSpeakerCycles(data)*100)/100, color: ''},
        teleAccData: teleAccuracy(data),
        teleAcc: {data: !isNaN(+teleAccuracy(data)[1]) ? Math.round(+teleAccuracy(data)[1]*1000)/10+'%' : '0%', color: ''},
        traps: {data: Math.round(getAverageTraps(data)*100)/100, color: ''},
        endgamePoints: {data: Math.round(endgamePoints(data)*100)/100, color: ''},
        endgameChart: {data: compileEndgames(data), color: ''},
        class: alliance,
        rawData: data,
        extraNotes: teamExtraNotes
      }
      teamsData.value.push(arr)
    }
  }

  //Defaults to the alliance colors being together if match filter is selected
  if(redAlliance.length > 0 || blueAlliance.length > 0){
    let sortedData = []
    for(let team of teamsData.value){
      if(team.class == "bg-blue-100") sortedData.unshift(team)
      else sortedData.push(team)
    }
    teamsData.value = sortedData
  }
  /* averages if i ever need
  let averages = {
    driver: 0,
    defense: 0,
    ampAuto: 0,
    speakerAuto: 0,
    autoAcc: 0,
    teleAmp: 0,
    teleSpeaker: 0,
    teleAcc: 0,
    traps: 0,
    endgamePoints: 0,

  }
  let weight = 0
  for (let team of teamsData.value) {
    let totalMatches = team.rawData.length
    averages.driver += team.driver.data * totalMatches
    averages.defense += team.defense.data * totalMatches
    averages.ampAuto += team.ampAuto.data * totalMatches
    averages.speakerAuto += team.speakerAuto.data * totalMatches
    averages.autoAcc += Number(team.autoAcc.data.replace('%', '')) * totalMatches
    averages.teleAmp += team.teleAmp.data * totalMatches
    averages.teleSpeaker += team.teleSpeaker.data * totalMatches
    averages.teleAcc += Number(team.teleAcc.data.replace('%', '')) * totalMatches
    averages.traps += team.traps.data * totalMatches
    averages.endgamePoints += team.endgamePoints.data * totalMatches
    weight += totalMatches
  }
  averages.driver /= weight
  averages.defense /= weight
  averages.ampAuto /= weight
  averages.speakerAuto /= weight
  averages.autoAcc /= weight
  averages.teleAmp /= weight
  averages.teleSpeaker /= weight
  averages.teleAcc /= weight
  averages.traps /= weight
  averages.endgamePoints /= weight
*/

  let data: {
    driver: number[];
    defense: number[];
    ampAuto: number[];
    speakerAuto: number[];
    autoAcc: number[];
    teleAmp: number[];
    teleSpeaker: number[];
    teleAcc: number[];
    traps: number[];
    endgamePoints: number[];
  } = {
    driver: [],
    defense: [],
    ampAuto: [],
    speakerAuto: [],
    autoAcc: [],
    teleAmp: [],
    teleSpeaker: [],
    teleAcc: [],
    traps: [],
    endgamePoints: []
  }
  for (let team of teamsData.value) {
    if (team.driver.data != 0)
      data.driver.push(Number(team.driver.data))
    else if(!(data.driver.includes(0)))
      data.driver.push(0)

    if (team.defense.data != 0)
      data.defense.push(Number(team.defense.data))
    else if(!(data.defense.includes(0)))
      data.defense.push(0)
    data.ampAuto.push(Number(team.ampAuto.data))
    data.speakerAuto.push(Number(team.speakerAuto.data))
    data.autoAcc.push(Number(team.autoAcc.data.replace('%', '')))
    data.teleAmp.push(Number(team.teleAmp.data))
    data.teleSpeaker.push(Number(team.teleSpeaker.data))
    data.teleAcc.push(Number(team.teleAcc.data.replace('%', '')))
    data.traps.push(Number(team.traps.data))
    data.endgamePoints.push(Number(team.endgamePoints.data))
  }
  let teamPercents = []
  for (let i = 0; i < teamsData.value.length; i++) {
    teamPercents.push(colorifyTeam(teamsData.value[i], data))
  }
  let sortedTeamPercents = [...teamPercents]
  sortedTeamPercents.sort((a, b) => a - b)
  for (let i = 0; i < teamsData.value.length; i++) {
    teamsData.value[i].team.color = colorify(((sortedTeamPercents.indexOf(teamPercents[i]) + 1)/ sortedTeamPercents.length)* 100)
    teamsData.value[i].driver.color = colorify(calculatePercent(teamsData.value[i].driver.data, Math.min(...data.driver), Math.max(...data.driver)))
    teamsData.value[i].defense.color = colorify(calculatePercent(teamsData.value[i].defense.data, Math.min(...data.defense), Math.max(...data.defense)))
    teamsData.value[i].ampAuto.color = colorify(calculatePercent(teamsData.value[i].ampAuto.data, Math.min(...data.ampAuto), Math.max(...data.ampAuto)))
    teamsData.value[i].speakerAuto.color = colorify(calculatePercent(teamsData.value[i].speakerAuto.data, Math.min(...data.speakerAuto), Math.max(...data.speakerAuto)))
    teamsData.value[i].autoAcc.color = colorify(calculatePercent(teamsData.value[i].autoAcc.data.replace('%', ''), Math.min(...data.autoAcc), Math.max(...data.autoAcc)))
    teamsData.value[i].teleAmp.color = colorify(calculatePercent(teamsData.value[i].teleAmp.data, Math.min(...data.teleAmp), Math.max(...data.teleAmp)))
    teamsData.value[i].teleSpeaker.color = colorify(calculatePercent(teamsData.value[i].teleSpeaker.data, Math.min(...data.teleSpeaker), Math.max(...data.teleSpeaker)))
    teamsData.value[i].teleAcc.color = colorify(calculatePercent(teamsData.value[i].teleAcc.data.replace('%', ''), Math.min(...data.teleAcc), Math.max(...data.teleAcc)))
    teamsData.value[i].traps.color = colorify(calculatePercent(teamsData.value[i].traps.data, Math.min(...data.traps), Math.max(...data.traps)))
    teamsData.value[i].endgamePoints.color = colorify(calculatePercent(teamsData.value[i].endgamePoints.data, Math.min(...data.endgamePoints), Math.max(...data.endgamePoints)))
  }
  teamsData.value.sort((a: TeamTableData, b: TeamTableData) => Number(a.team.data) - Number(b.team.data))
}

function colorifyTeam(teamData: TeamTableData, data: DataArrayOrSum) {
  let totalPercent = 0
  if (teamData.driver.data != 0) {
    totalPercent += calculatePercent(teamData.driver.data, Math.min(...data.driver), Math.max(...data.driver)) * 0.66
  } else {
    totalPercent += calculatePercent(average(data.driver), Math.min(...data.driver), Math.max(...data.driver)) * 0.66
  }
  if (teamData.defense.data != 0) {
    totalPercent += calculatePercent(teamData.defense.data, Math.min(...data.defense), Math.max(...data.defense)) * 0.33
  } else {
    totalPercent += calculatePercent(average(data.defense), Math.min(...data.defense), Math.max(...data.defense)) * 0.33
  }
  totalPercent += calculatePercent(teamData.ampAuto.data, Math.min(...data.ampAuto), Math.max(...data.ampAuto))*0.8
  totalPercent += calculatePercent(teamData.speakerAuto.data, Math.min(...data.speakerAuto), Math.max(...data.speakerAuto))
  totalPercent += calculatePercent(Number(teamData.autoAcc.data.replace('%', '')), Math.min(...data.autoAcc), Math.max(...data.autoAcc))*0.5
  totalPercent += calculatePercent(teamData.teleAmp.data, Math.min(...data.teleAmp), Math.max(...data.teleAmp))*0.8
  totalPercent += calculatePercent(teamData.teleSpeaker.data, Math.min(...data.teleSpeaker), Math.max(...data.teleSpeaker))
  totalPercent += calculatePercent(Number(teamData.teleAcc.data.replace('%', '')), Math.min(...data.teleAcc), Math.max(...data.teleAcc))*0.5
  totalPercent += calculatePercent(teamData.endgamePoints.data, Math.min(...data.endgamePoints), Math.max(...data.endgamePoints))
  return totalPercent
}

function calculatePercent(score: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }
  return (score - min) / (max - min) * 100
}

function colorify(percentage: number) {
  if (percentage >= 90)
    return 'blue'
  else if (percentage >= 66)
    return 'green'
  else if (percentage >= 33)
    return 'gray'
  else
    return 'coral'
}

function averageDefensiveScore(teamArrays: Array<ScoutingData>){
  let total = 0
  let totalMatches = 0
  for(let match of teamArrays){
    //Try catch needed due to old version of data
    try {
      if (match.notes.promptedNotes[0].selected){
        total += match.notes.promptedNotes[0].rating
        totalMatches++
      }
    }
    catch{}
  }
  return (totalMatches != 0 ? total / totalMatches: 0)
}

function averageDriverScore(teamArrays: Array<ScoutingData>){
  let total = 0
  let totalMatches = 0
  for(let match of teamArrays){
    //Try catch needed due to old version of data
    try {
      if (match.notes.promptedNotes[2].selected){
        total += match.notes.promptedNotes[2].rating
        totalMatches++
      }
    }
    catch{}
  }
  return (totalMatches != 0 ? total / totalMatches: 0)
}

function averageAmpsAuto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.amp
  }
  return nonAveragedValue/teamArrays.length
}

function averageSpeakersAuto(teamArrays: Array<ScoutingData>) {
  let nonAveragedValue = 0
  for (let i = 0; i < teamArrays.length; i++) {
    nonAveragedValue += teamArrays[i].auto.speakerNA
  }
  return nonAveragedValue/teamArrays.length
}

function getAverageSpeakerCycles(teamArrays: Array<ScoutingData>){
  let nonAveragedValue = 0
  for(let i = 0; i < teamArrays.length; i++){
    nonAveragedValue += teamArrays[i].teleop.speakerNA
  }
  return nonAveragedValue/teamArrays.length
}

function getAverageAmpCycles(teamArrays: Array<ScoutingData>){
  let nonAveragedValue = 0
  for(let i = 0; i < teamArrays.length; i++){
    nonAveragedValue += teamArrays[i].teleop.amp
  }
  return nonAveragedValue/teamArrays.length
}

function averageAuto(teamArrays: Array<ScoutingData>): number {
  let successfulMobilityCount = 0
  for(let match of teamArrays){
    successfulMobilityCount += match.auto.mobility ? 1 : 0
  }
  return successfulMobilityCount/teamArrays.length
}

function autoAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulAmpCount = 0
  let successfulSpeakerCount = 0
  let missedAmpCount = 0
  let missedSpeakerCount = 0
  let newData = false
  for (let match of teamArrays) {
    successfulAmpCount += match.auto.amp
    successfulSpeakerCount += match.auto.speakerNA
    if (match.auto.missedAmp != undefined) {
      missedAmpCount += match.auto.missedAmp
      missedSpeakerCount += match.auto.missedSpeaker
      newData = true
    }
    else {
      missedAmpCount += match.auto.missed
    }
  }
  if(newData)
    return [true, (successfulAmpCount+successfulSpeakerCount)/(missedAmpCount+missedSpeakerCount+successfulSpeakerCount+successfulAmpCount), successfulAmpCount/(missedAmpCount+successfulAmpCount), successfulSpeakerCount/(missedSpeakerCount+successfulSpeakerCount)]
  else
    return [false, (successfulAmpCount+successfulSpeakerCount)/(missedAmpCount+successfulSpeakerCount+successfulAmpCount)]
}

function teleAccuracy(teamArrays: Array<ScoutingData>) {
  let successfulAmpCount = 0
  let successfulSpeakerCount = 0
  let missedAmpCount = 0
  let missedSpeakerCount = 0
  let newData = false
  for (let match of teamArrays) {
    successfulAmpCount += match.teleop.amp
    successfulSpeakerCount += match.teleop.speakerNA
    if (match.teleop.missedAmp != undefined) {
      missedAmpCount += match.teleop.missedAmp
      missedSpeakerCount += match.teleop.missedSpeaker
      newData = true
    }
    else {
      missedAmpCount += match.teleop.missed
    }
  }
  if(newData)
    return [true, (successfulAmpCount+successfulSpeakerCount)/(missedAmpCount+missedSpeakerCount+successfulSpeakerCount+successfulAmpCount), successfulAmpCount/(missedAmpCount+successfulAmpCount), successfulSpeakerCount/(missedSpeakerCount+successfulSpeakerCount)]
  else
    return [false, (successfulAmpCount+successfulSpeakerCount)/(missedAmpCount+successfulSpeakerCount+successfulAmpCount)]
}

function getAverageTraps(teamArrays: Array<ScoutingData>): number {
  let totalTraps = 0
  for (let match of teamArrays) {
    totalTraps += match.endgame.trap
  }
  return totalTraps/teamArrays.length
}

function endgamePoints(teamArrays: Array<ScoutingData>): number {
  let totalEndgamePoints = 0
  for (let event of teamArrays) {
    if(event.endgame.endgame.includes('Harmony'))
      totalEndgamePoints += 5
    else if (event.endgame.endgame.includes('Onstage'))
      totalEndgamePoints += 3
    else if (event.endgame.endgame.includes('Attempted Onstage') || event.endgame.endgame.includes('Parked'))
      totalEndgamePoints += 1
    totalEndgamePoints += event.endgame.trap*5
  }
  return totalEndgamePoints/teamArrays.length
}

function compileEndgames(teamArrays: Array<ScoutingData>): [Array<string>, Array<number>] {
  let endgameMap = new Map<string, number>();
  for(let i = 0; i < teamArrays.length; i++) {
    teamArrays[i].endgame.endgame.forEach(function (value: string) {
      if (endgameMap.has(value)) {
        endgameMap.set(value, endgameMap.get(value)! + 1)
      } else
        endgameMap.set(value, 1)
    })
  }
  let endgameOptionsArr : Array<string> = []
  let endgameDataArr : Array<number> = []
  endgameMap.forEach(function(value, key){
    endgameOptionsArr.push(key)
    endgameDataArr.push(value)
  })
  return [endgameOptionsArr, endgameDataArr]
}


let columns = ref([{
  label: 'Team',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Photos',
  sort: 'none',
  sortable: false,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Driver',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Defense',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Amps',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Speakers',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Accuracy',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Amps',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Speakers',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Accuracy',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Points',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Traps',
  sort: 'none',
  sortable: true,
  icon: 'i-heroicons-arrows-up-down'
}, {
  label: 'Chart',
  sort: 'none',
  sortable: false,
  icon: 'i-heroicons-arrows-up-down'
}])

function sortTable(n: number, sort: string, col: string) {
  let table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("teamTable") as HTMLTableElement | null
  // returning if nothing in the table
  if (!table) return;
  switching = true;
  // Set the sorting direction to ascending:
  if(sort == 'none')
    sort = 'desc'
  else if (sort == 'desc')
    sort = 'asc'
  else if (sort == 'asc')
    sort = 'none'
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */

    for (i = 1; i < rows.length - 1; i++) {
      // Reset shouldSwitch for each iteration
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      if (sort == "none" || col == "Team") {
        x = rows[i].getElementsByTagName("TD")[0];
        y = rows[i+1].getElementsByTagName("TD")[0];
      }
      else if (sort == "desc" || sort == "asc") {
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      }
      if (x && y) {
        if(sort == "none") {
          let xInnerHTML = x.innerHTML
          let yInnerHTML = y.innerHTML
          const regex = /<span[^>]*>(.*?)<\/span>/;
          const xMatch = xInnerHTML.match(regex)
          const yMatch = yInnerHTML.match(regex)
          const xInnerText = xMatch ? xMatch[1] : ""
          const yInnerText = yMatch ? yMatch[1] : ""
          if (makeSortable(xInnerText) > makeSortable(yInnerText)) {
            shouldSwitch = true;
            break;
          }
        }
        if(col == "Team") {
          let colorX = x.innerHTML.substring(x.innerHTML.search('bg-')).split('-')[1]
          let colorY = y.innerHTML.substring(y.innerHTML.search('bg-')).split('-')[1]
          let possibleColors = ['coral', 'gray', 'green', 'blue']
          if (sort == "desc") {
            if(possibleColors.indexOf(colorX) < possibleColors.indexOf(colorY)) {
              shouldSwitch = true;
              break;
            }
          }
          else if (sort == "asc") {
            if(possibleColors.indexOf(colorX) > possibleColors.indexOf(colorY)) {
              shouldSwitch = true;
              break;
            }
          }
        } else if (sort == "desc") {
          let xInnerHTML = x.innerHTML
          let yInnerHTML = y.innerHTML
          let xInnerText, yInnerText
          if (col != 'Accuracy') {
            xInnerText = xInnerHTML.substring(xInnerHTML.indexOf('>') + 1, xInnerHTML.lastIndexOf('<'))
            yInnerText = yInnerHTML.substring(yInnerHTML.indexOf('>') + 1, yInnerHTML.lastIndexOf('<'))
            if (xInnerText == 'N/A')
              xInnerText = '0'
            if (yInnerText == 'N/A')
              yInnerText = '0'
          }
          else {
            const regex = /<span[^>]*>(.*?)<\/span>/;
            const xMatch = xInnerHTML.match(regex)
            const yMatch = yInnerHTML.match(regex)
            xInnerText = xMatch ? xMatch[1] : ""
            yInnerText = yMatch ? yMatch[1] : ""
          }
          if (
              makeSortable(xInnerText) < makeSortable(yInnerText)
          ) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (sort == "asc") {
          let xInnerHTML = x.innerHTML
          let yInnerHTML = y.innerHTML
          let xInnerText, yInnerText
          if (col != 'Accuracy') {
            xInnerText = xInnerHTML.substring(xInnerHTML.indexOf('>') + 1, xInnerHTML.lastIndexOf('<'))
            yInnerText = yInnerHTML.substring(yInnerHTML.indexOf('>') + 1, yInnerHTML.lastIndexOf('<'))
            if (xInnerText == 'N/A')
              xInnerText = '0'
            if (yInnerText == 'N/A')
              yInnerText = '0'
          }
          else {
            const regex = /<span[^>]*>(.*?)<\/span>/;
            const xMatch = xInnerHTML.match(regex)
            const yMatch = yInnerHTML.match(regex)
            xInnerText = xMatch ? xMatch[1] : ""
            yInnerText = yMatch ? yMatch[1] : ""
          }
          if (
              makeSortable(xInnerText) > makeSortable(yInnerText)
          ) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode?.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
  if(sort == 'desc') {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].sort = 'none'
      columns.value[i].icon = 'i-heroicons-arrows-up-down'
    }
    columns.value[n].sort = 'desc'
    columns.value[n].icon = 'i-heroicons-bars-arrow-down'
  }
  else if (sort == 'asc') {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].sort = 'none'
      columns.value[i].icon = 'i-heroicons-arrows-up-down'
    }
    columns.value[n].sort = 'asc'
    columns.value[n].icon = 'i-heroicons-bars-arrow-up'
  }
  else if (sort == 'none') {
    columns.value[n].sort = 'none'
    columns.value[n].icon = 'i-heroicons-arrows-up-down'
  }
}

function makeSortable(thing: string) {
  if(thing.endsWith('%')) {
    thing = thing.replace('%', '')
    return Number(thing)
  }
  if(!isNaN(+thing))
    return Number(thing)
  else
    return thing
}

function average(nums: number[]) {
  let total = 0
  for (let num of nums) {
    total += num
  }
  if (nums.length != 0)
    return total/nums.length
  return 0
}



await tableSetup()
</script>

<template>
  <OuterComponents class="z[11]">
    <UCard class="max-h-dvh overflow-auto">
      <template #header>
        <div class="flex">
          <UForm>
            <UFormGroup class="inline-block mr-2" label="Filters">
              <UButtonGroup>
                <USelectMenu class="inline-block min-w-28 w-28 max-w-28" v-model="activeFilterOption" :options="filterOptions"/>
                <UInput
                    v-model="filterInput"
                    class="inline-block max-w-40"
                    placeholder="filter text..."
                    :ui="{ icon: { trailing: { pointer: '' } } }"
                    v-on:keyup.enter="addFilter"
                >
                  <template #trailing>
                    <UButton
                        v-show="filterInput != ''"
                        color="coral"
                        variant="link"
                        icon="i-heroicons-plus-circle"
                        :padded="false"
                        @click="addFilter"
                    />
                  </template>
                </UInput>
              </UButtonGroup>
            </UFormGroup>
          </UForm>
        </div>
          <UFormGroup>
            <UButton
                v-for="(value, index) in activeFilters"
                :label="value"
                variant="soft"
                class="mt-2 mr-1"
                trailing-icon="i-heroicons-x-mark"
                size="2xs"
                @click="activeFilters.splice(index, 1)"
            />
            <UBadge
              v-if="activeFilters.length == 0"
              variant="soft"
              class="mt-2 rounded-2xl"
              color="gray"
              label="No filters selected"
            />
          </UFormGroup>
        <div class="inline-block m-2">
          <UBadge label="Bad: 0%-33%" class="rounded-2xl" variant="soft"/>
          <UBadge label="Ok: 33%-66%" class="rounded-2xl" variant="soft" color="gray"/>
          <UBadge label="Good: 66%-90%" class="rounded-2xl" variant="soft" color="green"/>
          <UBadge label="Insane: 90%-100%" class="rounded-2xl" variant="soft" color="blue"/>
        </div>
      </template>
      <template #default>
        <div>
          <table id="teamTable" class="table-auto border-4 border-gray-50">
            <colgroup span="2" class="odd:bg-gray-50"/>
            <colgroup span="2" class="odd:bg-gray-50"/>
            <colgroup span="3" class="odd:bg-gray-50"/>
            <colgroup span="3" class="odd:bg-gray-50"/>
            <colgroup span="3" class="odd:bg-gray-50"/>
            <thead class="top-0 sticky bg-gray-50 z-10">
              <tr>
                <th colspan="2"/>
                <th colspan="2"><p class="text-xs font-light">Average</p>Ratings<p class="text-xs font-light">/5.00</p></th>
                <th colspan="3" scope="colgroup"><p class="text-xs font-light">Average</p>Auto Cycles</th>
                <th colspan="3" scope="colgroup"><p class="text-xs font-light">Average</p>Teleop Cycles</th>
                <th colspan="3" scope="colgroup"><p class="text-xs font-light">Average</p>Endgame</th>
              </tr>
              <tr>
                <th scope="col" v-for="(col, index) of columns" class="font-medium text-sm"><UButton v-if="col.sortable" @click="sortTable(index, col.sort, col.label)" :trailing-icon="col.icon" variant="ghost" class="rounded-full" size="xs" :label="col.label" color="gray"/><UButton v-else :label="col.label" size="xs" variant="ghost" class="rounded-full" color="gray"/></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team of teamsData" class="border-b border-gray-200 dark:border-gray-700">
                <td class="text-right"><UButton :label="team.team.data" variant="soft" :color="team.team.color" size="xs" @click="navigateTo('/teams/'+team.team.data)" trailing-icon="i-heroicons-chart-bar-square"/></td>
                <td class="text-center"><UButton size="xs" color="gray" icon="i-heroicons-photo" variant="soft" @click="navigateTo('/teams/attachments/'+team.team.data)"/></td>
                <td class="text-center"><UBadge :label="team.driver.data != 0 ? team.driver.data : 'N/A'" variant="soft" :color="team.driver.data != 0 ? team.driver.color : 'gray'"/></td>
                <td class="text-center"><UBadge :label="team.defense.data != 0 ? team.defense.data : 'N/A'" variant="soft" :color="team.defense.data != 0 ? team.defense.color : 'gray'"/></td>
                <td class="text-center"><UBadge :label="team.ampAuto.data" variant="soft" :color="team.ampAuto.color"/></td>
                <td class="text-center"><UBadge :label="team.speakerAuto.data" variant="soft" :color="team.speakerAuto.color"/></td>
                <td class="text-center">
                  <UPopover v-if="team.autoAccData[0]" mode="hover">
                    <UButton :label="team.autoAcc.data" variant="soft" :color="team.autoAcc.color" size="xs" class="mx-auto"/>
                    <template #panel>
                      <div class="flex">
                        <div>
                          <UBadge label="Amp" variant="soft" color="gray"/>
                          <UBadge :label="!isNaN(team.autoAccData[2]) ? (Math.round(team.autoAccData[2]*1000)/10+'%') : '0%'" variant="soft" color="white"/>
                        </div>
                        <div>
                          <UBadge label="Speaker" variant="soft" color="gray"/>
                          <UBadge :label="!isNaN(team.autoAccData[3]) ? (Math.round(team.autoAccData[3]*1000)/10+'%') : '0%'" variant="soft" color="white"/>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <UBadge v-else :label="team.autoAcc.data" variant="soft" :color="team.autoAcc.color"/>
                </td>
                <td class="text-center"><UBadge :label="team.teleAmp.data" variant="soft" :color="team.teleAmp.color"/></td>
                <td class="text-center"><UBadge :label="team.teleSpeaker.data" variant="soft" :color="team.teleSpeaker.color"/></td>
                <td class="text-center">
                  <UPopover v-if="team.teleAccData[0]" mode="hover">
                    <UButton :label="team.teleAcc.data" variant="soft" :color="team.teleAcc.color" size="xs" class="mx-auto"/>
                    <template #panel>
                      <div class="flex">
                        <div>
                          <UBadge label="Amp" variant="soft" color="gray"/>
                          <UBadge :label="!isNaN(team.teleAccData[2]) ? (Math.round(team.teleAccData[2]*1000)/10+'%') : '0%'" variant="soft" color="white"/>
                        </div>
                        <div>
                          <UBadge label="Speaker" variant="soft" color="gray"/>
                          <UBadge :label="!isNaN(team.teleAccData[3]) ? (Math.round(team.teleAccData[3]*1000)/10+'%') : '0%'" variant="soft" color="white"/>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <UBadge v-else :label="team.autoAcc.data" variant="soft" :color="team.autoAcc.color"/>
                </td>
                <td class="text-center"><UBadge :label="team.endgamePoints.data" variant="soft" :color="team.endgamePoints.color"/></td>
                <td class="text-center"><UBadge :label="team.traps.data" variant="soft"  :color="team.traps.color"/></td>
                <td class="text-center"><UPopover mode="hover">
                  <UButton class="m-1 mx-auto" variant="soft" icon="i-heroicons-chart-pie" color="gray"/>
                  <template #panel>
                    <UCard>
                      <div class="max-w-xs min-w-[10rem] overflow-y-auto" style="max-height: 20rem; min-height: 10rem">
                        <PieChart :labels="team.endgameChart.data[0]" :data="team.endgameChart.data[1]"/>
                      </div>
                    </UCard>
                  </template>
                </UPopover></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </UCard>
</OuterComponents>
</template>

<style scoped>

</style>