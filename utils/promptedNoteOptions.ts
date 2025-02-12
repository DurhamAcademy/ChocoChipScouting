/**
 * @return An array of prompted note data, including the questions and the name
 */
export const promptedNoteOptions = [
  {
    name: 'Offense',
    questions: [
      'If you were developing an offensive strategy with this team, what area of strength would you want them focused on and why?',
      'What area(s) of weakness would you want to make sure this team avoids in the offensive strategy?',
      'Is there anything else that the quantitative data might not highlight about this team?',
    ],
    summaries: ['Area of strength', 'Area(s) of weakness', 'Other notes'],
  },
  {
    name: 'Defense',
    questions: [
      "What seemed to be this team's defensive strategy? What area, team, or other factor were they focused on?",
      'Was their defensive strategy successful, or is there a different defensive strategy this team should employ to make more of an impact?',
      'What other factors contributed to your rating?',
    ],
    summaries: [
      'Defensive strategy',
      'Defensive success/failure',
      'Other notes',
    ],
  },
  {
    name: 'Driver',
    questions: [
      "How was this driver's game sense? Did they evade defense and make quick choices to reroute? Did they make mistakes and second guess themselves?",
      'How aggressive was this driver? Did they inflict a lot of penalties on their team? If so, could you tell what for?',
      'What other factors contributed to your rating?',
    ],
    summaries: ['Game sense', 'Aggressiveness', 'Other notes'],
  },
  {
    name: 'Robustness',
    questions: [
      "What happened on the field that led you to select this category? Did this team's robot break, or survive a big hit?",
      'Do you think this will be a consistent issue/strength, or was it a one time thing?',
    ],
    summaries: ['Point of strength/failure', 'Reoccurring issue?'],
  },
];
