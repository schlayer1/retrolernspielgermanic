/**
 * Historische Dilemma- & Ratsentscheidungen für Germanen
 */

export interface DilemmaOption {
  id: string;
  title: string;
  argumentText: string;
  rewards: Record<string, number>;
  storyFlag: string;
  feedbackText: string;
}

export interface DilemmaDef {
  id: string;
  chapter: number;
  councilTitle: string;
  mentorSpeaker: string;
  illustrationKey: string;
  conflictTitle: string;
  conflictText: string;
  options: DilemmaOption[];
}

export const GERMANIC_DILEMMAS: DilemmaDef[] = [
  {
    id: 'dilemma_ch4_thing_schlichtung',
    chapter: 4,
    councilTitle: 'Das Thing unter der Heiligen Eiche',
    mentorSpeaker: 'Gero der Thing-Sprecher',
    illustrationKey: 'council_germanic',
    conflictTitle: 'Grenzstreit um die Waldweide: Wergeld oder Schlichtung?',
    conflictText: 'Zwei Sippen streiten um ein fruchtbares Eichenwäldchen. Die Sippe von Alboin beansprucht die Eichelmast für ihre Schweine, während Hathas Sippe dort Rinder weiden lassen will. Schon wurden Waffen gezogen und ein Zaun niedergerissen. Was urteilt das Thing?',
    options: [
      {
        id: 'opt_split_pasture',
        title: 'Teilung der Weidezeit (Sommer & Herbst)',
        argumentText: 'Im Hochsommer weiden Hathas Rinder auf der Lichtung; im Spätherbst gehört der Wald Alboins Schweinen zur Eichelmast.',
        rewards: { geraeuchertes_fleisch: 8, rinderfell: 4 },
        storyFlag: 'dilemma_ch4_thing_peace',
        feedbackText: 'Der Thing-Friede ist gewahrt! Beide Sippen reichen sich das Trinkhorn und überreichen dir Felle und Vorräte.'
      },
      {
        id: 'opt_wergeld',
        title: 'Wergeld-Ausgleich & Sippenausgleich',
        argumentText: 'Alboin behält den Hain, entschädigt Hatha jedoch mit zwei Ziegen und Bauholz für einen neuen Koppelzaun.',
        rewards: { bauholz: 12, ziegenmilch: 5 },
        storyFlag: 'dilemma_ch4_wergeld_paid',
        feedbackText: 'Ein rechtssicheres Urteil nach germanischem Brauch. Der Streit ist ohne Blutvergießen beigelegt.'
      }
    ]
  }
];
