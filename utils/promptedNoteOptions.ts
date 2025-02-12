export const promptedNoteOptions = [
  {
    name: 'Offense',
    questions: [
      {
        question:
          'If you were developing an offensive strategy with this team, what area of strength would you want them focused on and why?',
        length: 3,
      },
      {
        question:
          'What area(s) of weakness would you want to make sure this team avoids in the offensive strategy?',
        length: 3,
      },
      {
        question:
          'Is there anything else that the quantitative data might not highlight about this team?',
        length: 2,
      },
    ],
    summaries: ['Area of strength', 'Area(s) of weakness', 'Other notes'],
  },
  {
    name: 'Defense',
    questions: [
      {
        question:
          "What seemed to be this team's defensive strategy? What area, team, or other factor were they focused on?",
        length: 3,
      },
      {
        question:
          'Was their defensive strategy successful, or is there a different defensive strategy this team should employ to make more of an impact?',
        length: 3,
      },
      {
        question: 'What other factors contributed to your rating?',
        length: 2,
      },
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
      {
        question:
          "How was this driver's game sense? Did they evade defense and make quick choices to reroute? Did they make mistakes and second guess themselves?",
        length: 3,
      },
      {
        question:
          'How aggressive was this driver? Did they inflict a lot of penalties on their team? If so, could you tell what for?',
        length: 3,
      },
      {
        question: 'What other factors contributed to your rating?',
        length: 2,
      },
    ],
    summaries: ['Game sense', 'Aggressiveness', 'Other notes'],
  },
  {
    name: 'Robustness',
    questions: [
      {
        question:
          "What happened on the field that led you to select this category? Did this team's robot break, or survive a big hit?",
        length: 2,
      },
      {
        question:
          'Do you think this will be a consistent issue/strength, or was it a one-time thing?',
        length: 1,
      },
    ],
    summaries: ['Point of strength/failure', 'Reoccurring issue?'],
  },
];
