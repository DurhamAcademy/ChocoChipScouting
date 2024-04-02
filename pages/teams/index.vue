<script setup lang="ts">
import databases, {type DataArrayOrSum, type ScoutingData, type TeamTableData} from "~/utils/databases";
import IdMeta = PouchDB.Core.IdMeta;
import Sentiment from 'sentiment';
import {eventOptions} from "~/utils/eventOptions";
import {useWindowSize} from "@vueuse/core";

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

const events = eventOptions.map((event) => event.replace(/[0-9]/g, ''))
let currentEvent = eventOptions[0]
if (typeof window !== 'undefined') currentEvent = localStorage.getItem('currentEvent') || eventOptions[0]
const fetch = useFetch<Array<any>>("/api/eventMatches/" + currentEvent)


let customOptions = ['Has Climb', 'Has Auto']
for(let event of events){
  customOptions.push('event: ' + event)
}
let currentEventID = customOptions.indexOf('event: ' + currentEvent.replace(/[0-9]/g, ''))
const filterOptions = ref(
    Array(customOptions.length)
        .fill({ id: 0, content: "", custom: false})
        .map(
            (_, index) => ({ id: index, content: customOptions[index], custom: false})
        )
)
const currentEventFilter = { id: currentEventID, content: 'event: ' + currentEvent.replace(/[0-9]/g, ''), custom: false }
const selectedFilters = ref<Array<{ id: number, content: string, custom: boolean}>>([currentEventFilter])
watch(selectedFilters, async () => {
  await tableSetup()
}, {
  deep: true
})


const extraFilterOptions = ["team", "match", "author", "ignore author"]

const { scoutingData } = databases.locals
let db = scoutingData

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
  let allowedEvents = []
  let allowedTeams = []
  let allowedAuthors = []
  let ignoredAuthors = []
  let blueAlliance = []
  let redAlliance = []
  for (let filter of selectedFilters.value) {
    if (filter.content.startsWith("event:")) {
      allowedEvents.push(filter.content.split(":")[1].trim())
    }
    if (filter.content.startsWith("team:")) {
      allowedTeams.push(filter.content.split(":")[1].trim())
    }
    if (filter.content.startsWith("author:")) {
      allowedAuthors.push(filter.content.split(":")[1].trim())
    }
    if (filter.content.startsWith("ignore author:")) {
      ignoredAuthors.push(filter.content.split(":")[1].trim())
    }
    if (filter.content.startsWith("match")) {
      let tbaMatchData = fetch.data.value
      if(tbaMatchData != null){
        let userInput = parseInt(filter.content.split(':')[1].trim())
        for(let match of tbaMatchData){
          if(match.comp_level == "qm" && match.match_number == userInput){
            for(let team of match.alliances.blue.team_keys){
              let cleanedTeam = team.replace("frc", "")
              if(!allowedTeams.includes(cleanedTeam)) {
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

    if (allowedTeams.includes(key.toString()) || allowedTeams.length == 0) {
      for (let match of value) {
        if (match.event != undefined && allowedEvents.includes( match.event.replace(/[0-9]/g, ''))) {
          if((allowedAuthors.length == 0 || allowedAuthors.includes(match.author)) && (ignoredAuthors.length == 0 || !ignoredAuthors.includes(match.author))){
            data.push(match)
          }
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
            if(includedOne || data[i].author == "Voltcats"){
              data.splice(data.indexOf(data[i]), 1)
            }
            else includedOne = true
          }
        }
      }
      else matchNumbers.push(currMatch)
    }


    /*
    Goes through all remaining filters and applies their effects
     */
    for (let filter of selectedFilters.value) {

      if (filter.id == 0) {
        let hasClimb = false
        for (let match of data) {
          if (match.endgame.endgame.includes("Onstage") || match.endgame.endgame.includes("Attempted Onstage")) {
            hasClimb = true
            break
          }
        }
        if (!hasClimb) {
          continue tableLoop
        }
      }

      if (filter.id == 1) {
        let hasAuto = false
        for (let match of data) {
          if (match.auto.amp > 0 || match.auto.speakerNA > 0 || match.auto.mobility) {
            hasAuto = true
            break
          }
        }
        if (!hasAuto) {
          continue tableLoop
        }
      }
    }
    if (data.length > 0) {
      let arr = {
        team: {data: key, color: ''},
        offense: {data: Math.round(averageOffensiveScore(data)*100)/100, color: ''},
        defense: {data: Math.round(averageDefensiveScore(data)*100)/100, color: ''},
        ampAuto: {data: Math.round(averageAmpsAuto(data)*100)/100, color: ''},
        speakerAuto: {data: Math.round(averageSpeakersAuto(data)*100)/100, color: ''},
        autoAcc: {data: !isNaN(autoAccuracy(data)) ? Math.round(autoAccuracy(data)*1000)/10+'%' : '0%', color: ''},
        teleAmp: {data: Math.round(getAverageAmpCycles(data)*100)/100, color: ''},
        teleSpeaker: {data: Math.round(getAverageSpeakerCycles(data)*100)/100, color: ''},
        teleAcc: {data: !isNaN(teleAccuracy(data)) ? Math.round(teleAccuracy(data)*1000)/10+'%' : '0%', color: ''},
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
    offense: 0,
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
    averages.offense += team.offense.data * totalMatches
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
  averages.offense /= weight
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
  } = {
    offense: [],
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
    data.offense.push(Number(team.offense.data))
    data.defense.push(Number(team.defense.data))
    data.ampAuto.push(Number(team.ampAuto.data))
    data.speakerAuto.push(Number(team.speakerAuto.data))
    data.autoAcc.push(Number(team.autoAcc.data.replace('%', '')))
    data.teleAmp.push(Number(team.teleAmp.data))
    data.teleSpeaker.push(Number(team.teleSpeaker.data))
    data.teleAcc.push(Number(team.teleAcc.data.replace('%', '')))
    data.traps.push(Number(team.traps.data))
    data.endgamePoints.push(Number(team.endgamePoints.data))
  }
  for (let i = 0; i < teamsData.value.length; i++) {
    teamsData.value[i].team.color = colorifyTeam(teamsData.value[i], data)
    teamsData.value[i].offense.color = colorify(calculatePercent(teamsData.value[i].offense.data, Math.min(...data.offense), Math.max(...data.offense)))
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
}

function colorifyTeam(teamData: TeamTableData, data: DataArrayOrSum) {
  let totalPercent = 0
  totalPercent += calculatePercent(teamData.offense.data, Math.min(...data.offense), Math.max(...data.offense))
  totalPercent += calculatePercent(teamData.defense.data, Math.min(...data.defense), Math.max(...data.defense))
  totalPercent += calculatePercent(teamData.ampAuto.data, Math.min(...data.ampAuto), Math.max(...data.ampAuto))
  totalPercent += calculatePercent(teamData.speakerAuto.data, Math.min(...data.speakerAuto), Math.max(...data.speakerAuto))
  totalPercent += calculatePercent(Number(teamData.autoAcc.data.replace('%', '')), Math.min(...data.autoAcc), Math.max(...data.autoAcc))
  totalPercent += calculatePercent(teamData.teleAmp.data, Math.min(...data.teleAmp), Math.max(...data.teleAmp))
  totalPercent += calculatePercent(teamData.teleSpeaker.data, Math.min(...data.teleSpeaker), Math.max(...data.teleSpeaker))
  totalPercent += calculatePercent(Number(teamData.teleAcc.data.replace('%', '')), Math.min(...data.teleAcc), Math.max(...data.teleAcc))
  totalPercent += calculatePercent(teamData.traps.data, Math.min(...data.traps), Math.max(...data.traps))
  totalPercent += calculatePercent(teamData.endgamePoints.data, Math.min(...data.endgamePoints), Math.max(...data.endgamePoints))
  return colorify(totalPercent/10)
}

function calculatePercent(score: number, min: number, max: number) {
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

function averageOffensiveScore(teamArrays: Array<ScoutingData>){
  let total = 0
  let totalMatches = 0
  for(let match of teamArrays){
    //Try catch needed due to old version of data
    try {
      if (match.notes.promptedNotes[1].selected){
        total += match.notes.promptedNotes[1].rating
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

function autoAccuracy(teamArrays: Array<ScoutingData>): number {
  let successfulScoreCount = 0
  let missCount = 0
  for (let match of teamArrays) {
    successfulScoreCount += match.auto.amp
    successfulScoreCount += match.auto.speakerNA
    missCount += match.auto.missed
  }
  return (successfulScoreCount/(successfulScoreCount+missCount))
}

function teleAccuracy(teamArrays: Array<ScoutingData>): number {
  let successfulScoreCount = 0
  let missCount = 0
  for (let match of teamArrays) {
    successfulScoreCount += match.teleop.amp
    successfulScoreCount += match.teleop.speakerNA
    missCount += match.teleop.missed
  }
  return (successfulScoreCount/(successfulScoreCount+missCount))
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

async function view(teamNum: number) {
  navigateTo("/teams/attachments/"+teamNum)
}

let columns = ref([{
  label:'Team',
  sort: 'none'
}, {
  label:'Offensive',
  sort: 'none'
}, {
  label:'Defensive',
  sort: 'none'
}, {
  label:'Amps',
  sort: 'none'
}, {
  label:'Speakers',
  sort: 'none'
}, {
  label:'Accuracy',
  sort: 'none'
}, {
  label:'Amps',
  sort: 'none'
}, {
  label:'Speakers',
  sort: 'none'
}, {
  label:'Accuracy',
  sort: 'none'
}, {
  label:'Points',
  sort: 'none'
}, {
  label:'Traps',
  sort: 'none'
}, {
  label:'Chart',
  sort: 'none'
}])

function sortTable(n: number, sort: string, col: string) {
  let table, rows, switching, i, x, y, shouldSwitch, dir, switchCount = 0, sortedBy;
  sortedBy = document.getElementById("sortedBy")
  table = document.getElementById("teamTable") as HTMLTableElement | null
  // returning if nothing in the table
  if (!table) return;
  switching = true;
  // Set the sorting direction to ascending:
  if(sort == 'none' || sort == 'asc')
    sort = 'desc'
  else if (sort == 'desc')
    sort = 'asc'
  dir = sort;
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
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (x && y) {
        let xInnerHTML = x.innerHTML
        let yInnerHTML = y.innerHTML
        let spanX = x.querySelector('span')
        let spanY = y.querySelector('span')
        if(spanX)
          xInnerHTML = spanX.innerText
        if(spanY)
          yInnerHTML = spanY.innerText
        if(col == 'Team') {
          let colorX = x.innerHTML.substring(x.innerHTML.search('bg-')).split('-')[1]
          let colorY = y.innerHTML.substring(y.innerHTML.search('bg-')).split('-')[1]
          let possibleColors = ['coral', 'gray', 'green', 'blue']
          if (dir == "desc") {
            if(possibleColors.indexOf(colorX) < possibleColors.indexOf(colorY)) {
              shouldSwitch = true;
              break;
            }
          }
          else if (dir == "asc") {
            if(possibleColors.indexOf(colorX) > possibleColors.indexOf(colorY)) {
              shouldSwitch = true;
              break;
            }
          }
        }
        else if (dir == "desc") {
          if (
              makeSortable(xInnerHTML) < makeSortable(yInnerHTML)
          ) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "asc") {
          if (
              makeSortable(xInnerHTML) > makeSortable(yInnerHTML)
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
      // Each time a switch is done, increase this count by 1:
      switchCount++;
    }
  }
  if(sort == 'desc') {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].sort = 'none'
    }
    columns.value[n].sort = 'desc'
  }
  else if (sort == 'asc') {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].sort = 'none'
    }
    columns.value[n].sort = 'asc'
  }
}

function makeSortable(thing: string) {
  if(thing.endsWith('%'))
    thing = thing.replace('%', '')
  if(!isNaN(+thing))
    return Number(thing)
  else
    return thing
}

function iconThingy(sort: string) {
  if (sort == 'none')
    return 'i-heroicons-arrows-up-down'
  else if (sort == 'desc')
    return 'i-heroicons-bars-arrow-down'
  else if (sort == 'asc')
    return 'i-heroicons-bars-arrow-up'
}

await tableSetup()
</script>

<template>
  <OuterComponents>
    <UCard class="max-h-dvh overflow-auto">
      <template #header>
        <UFormGroup class="w-full" block>
          <FilterMultiSelect v-model="selectedFilters" :options="filterOptions" :extra-options="extraFilterOptions"></FilterMultiSelect>
        </UFormGroup>
        <div class="flex m-2">
          <UBadge label="Bad: 0%-33%" class="rounded-2xl" variant="soft"/>
          <UBadge label="Ok: 33%-66%" class="rounded-2xl" variant="soft" color="gray"/>
          <UBadge label="Good: 66%-90%" class="rounded-2xl" variant="soft" color="green"/>
          <UBadge label="Insane: 90%-100%" class="rounded-2xl" variant="soft" color="blue"/>
        </div>
      </template>
      <div>
        <table id="teamTable" class="table-auto">
          <colgroup span="1" class="odd:bg-gray-50"/>
          <colgroup span="2" class="odd:bg-gray-50"/>
          <colgroup span="3" class="odd:bg-gray-50"/>
          <colgroup span="3" class="odd:bg-gray-50"/>
          <colgroup span="3" class="odd:bg-gray-50"/>
          <thead>
            <tr>
              <th colspan="1"/>
              <th colspan="2"><p class="text-xs font-light">Average</p>Ratings<p class="text-xs font-light">/5.00</p></th>
              <th colspan="3" scope="colgroup"><p class="text-xs font-light">Average</p>Auto Cycles</th>
              <th colspan="3" scope="colgroup"><p class="text-xs font-light">Average</p>Teleop Cycles</th>
              <th colspan="3" scope="colgroup"><p class="text-xs font-light">Average</p>Endgame</th>
            </tr>
            <tr>
              <th scope="col" v-for="(col, index) of columns" class="font-medium text-sm p-2">{{ col.label }}<UButton @click="sortTable(index, col.sort, col.label)" :icon="col.label === 'none' ? 'i-heroicons-arrows-up-down' : (col.label === 'desc') ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up'" variant="ghost" class="rounded-2xl align-middle" size="xs"/></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team of teamsData" class="border-b border-gray-200 dark:border-gray-700">
              <td class="text-center"><UBadge :label="team.team.data" variant="soft" :color="team.team.color"/></td>
              <td class="text-center"><UBadge :label="team.offense.data" variant="soft" :color="team.offense.color"/></td>
              <td class="text-center"><UBadge :label="team.defense.data" variant="soft" :color="team.defense.color"/></td>
              <td class="text-center"><UBadge :label="team.ampAuto.data" variant="soft" :color="team.ampAuto.color"/></td>
              <td class="text-center"><UBadge :label="team.speakerAuto.data" variant="soft" :color="team.speakerAuto.color"/></td>
              <td class="text-center"><UBadge :label="team.autoAcc.data" variant="soft" :color="team.autoAcc.color"/></td>
              <td class="text-center"><UBadge :label="team.teleAmp.data" variant="soft" :color="team.teleAmp.color"/></td>
              <td class="text-center"><UBadge :label="team.teleSpeaker.data" variant="soft" :color="team.teleSpeaker.color"/></td>
              <td class="text-center"><UBadge :label="team.teleAcc.data" variant="soft" :color="team.teleAcc.color"/></td>
              <td class="text-center"><UBadge :label="team.endgamePoints.data" variant="soft" :color="team.endgamePoints.color"/></td>
              <td class="text-center"><UBadge :label="team.traps.data" variant="soft"  :color="team.traps.color"/></td>
              <td class="text-center"><UPopover mode="hover">
                <UButton class="m-1 mx-auto" variant="soft" icon="i-heroicons-chart-bar-square" color="gray"/>
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
    </UCard>
</OuterComponents>
</template>

<style scoped>

</style>