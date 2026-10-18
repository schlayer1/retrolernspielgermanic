// ============================================================
// ARCHÄOLOGISCHE LEITFUNDE – 5 Historische Relikte der Germanen
// Versteckte Fundstücke auf der Weltkarte mit interaktivem Mini-Quiz
// ============================================================

export interface GermanRelic {
  id: string;
  name: string;
  epoch: string;
  year: string;
  findLocation: string;
  icon: string;
  x: number;
  y: number;
  minChapter: number;
  historicalContext: string;
  significance: string;
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
}

export const GERMAN_RELICS: GermanRelic[] = [
  {
    id: 'relic_pflugschar',
    name: 'Eiserne Pflugschar von Feddersen Wierde',
    epoch: 'Bäuerliche Eisenzeit & Sippe',
    year: 'ca. 1. Jh. v. Chr.',
    findLocation: 'Ackerflur nahe dem Wohnstallhaus',
    icon: '/assets/icons/relic_pflugschar.png',
    x: 28,
    y: 21,
    minChapter: 1,
    historicalContext:
      'In der Wurtensiedlung Feddersen Wierde an der Nordsee legten Archäologen eine vollständige germanische Siedlung frei. Die eiserne Pflugschar belegt, dass die Germanen schwere Böden tief aufpflügen konnten, um Emmer, Gerste und Spelzweizen für die Sippe anzubauen.',
    significance:
      'Widerlegt das alte Vorurteil von reinen Jägern und Sammlern: Germanen waren sesshafte, hochorganisierte Ackerbauern und Viehzüchter.',
    question: 'Welche landwirtschaftliche Neuerung ermöglichte die eiserne Pflugschar den Germanen?',
    options: [
      'Sie konnten auch schwere Lehmböden tiefer wenden und höhere Ernteerträge erzielen',
      'Sie ersetzte die Zugtiere durch Dampfkraft',
      'Sie wurde ausschließlich zur Jagd auf Wölfe verwendet',
    ],
    correctIndex: 0,
  },
  {
    id: 'relic_rollenkappenfibel',
    name: 'Bronzene Rollenkappen-Fibel',
    epoch: 'Handwerk & Metallurgie',
    year: 'ca. 1. Jh. n. Chr.',
    findLocation: 'Schmiede-Werkstatt am Bachlauf',
    icon: '/assets/icons/relic_rollenkappenfibel.png',
    x: 52,
    y: 36,
    minChapter: 2,
    historicalContext:
      'Diese kunstvoll gegossene und ziselierte Fibel (Gewandspange) aus Bronze besitzt eine geschützte Spiralfeder. Sie funktionierte wie eine moderne Sicherheitsnadel und hielt die schweren Wolltuniken und Felle zusammen.',
    significance:
      'Fibeln sind die "Leitfossilien" der Archäologie: An ihren Formveränderungen können Forscher die Handelsbeziehungen und Epochen jahrzehntgenau bestimmen.',
    question: 'Welchem Zweck diente eine Fibel in der germanischen Tracht vor allem?',
    options: [
      'Als Verschluss von Gewändern und sichtbares Abzeichen des gesellschaftlichen Ranges',
      'Als eiserne Pfeilspitze für Reiter',
      'Als Waaggewicht für den Salzhandel',
    ],
    correctIndex: 0,
  },
  {
    id: 'relic_terra_sigillata',
    name: 'Gestempelte Terra Sigillata Schale',
    epoch: 'Kulturtransfer & Fernhandel',
    year: 'ca. 4 n. Chr.',
    findLocation: 'Forum der Römerstadt Waldgirmes',
    icon: '/assets/icons/relic_terra_sigillata.png',
    x: 20,
    y: 50,
    minChapter: 3,
    historicalContext:
      'Im hessischen Waldgirmes entdeckten Archäologen eine zivile Römerstadt mitten in Germanien. Diese scharlachrote Schale mit Töpferstempel zeugt davon, dass germanische Stammeseliten römische Tischsitten und Luxusgüter übernahmen.',
    significance:
      'Zeigt, dass das Verhältnis zwischen Rom und den Germanen lange Zeit von regem Warenaustausch und friedlicher Annäherung bestimmt war.',
    question: 'Was bedeutet der Fund von Terra Sigillata in germanischen Siedlungen?',
    options: [
      'Dass Germanen römische Luxuswaren schätzten und über weite Handelsstraßen importierten',
      'Dass die Germanen die Herstellung von Tonerde erfunden hatten',
      'Dass alle Gefäße Kriegsbeute aus zerstörten Städten waren',
    ],
    correctIndex: 0,
  },
  {
    id: 'relic_tacitus_germania',
    name: 'Handschrift: Tacitus "De Origine et Situ Germanorum"',
    epoch: 'Recht, Thing & Sitten',
    year: '98 n. Chr.',
    findLocation: 'Schriftenkasten am Thingplatz unter der Eiche',
    icon: '/assets/icons/relic_tacitus_germania.png',
    x: 46,
    y: 44,
    minChapter: 4,
    historicalContext:
      'Der römische Senator Tacitus verfasste mit der "Germania" die wichtigste antike Schriftquelle über die germanischen Stämme. Er beschrieb das Thing, die Sippentreue und den Freiheitswillen – nutzte dies aber auch, um den Sittenverfall im dekadenten Rom seiner Zeit zu kritisieren.',
    significance:
      'Zentrales Dokument für die Quellenkritik im Geschichtsunterricht: Wie viel ist reale Beobachtung, wie viel römische Idealisierung?',
    question: 'Warum zeichnete der römische Historiker Tacitus die Germanen oft als besonders tapfer und sittenstreng?',
    options: [
      'Er wollte seinen römischen Zeitgenossen einen moralischen Spiegel vorhalten und ihre Dekadenz anprangern',
      'Er lebte selbst zwanzig Jahre als Stammesführer der Chatten',
      'Weil der römische Senat die Germanen als Schiedsrichter eingesetzt hatte',
    ],
    correctIndex: 0,
  },
  {
    id: 'relic_kalkriese_maske',
    name: 'Römische Kavallerie-Gesichtsmaske von Kalkriese',
    epoch: 'Die Varusschlacht & die Grenze',
    year: '9 n. Chr.',
    findLocation: 'Am Fuße des Rasensodenwalls in Kalkriese',
    icon: '/assets/icons/relic_kalkriese_maske.png',
    x: 82,
    y: 20,
    minChapter: 6,
    historicalContext:
      'Die berühmte eiserne Gesichtsmaske mit Silberauflage gehörte zum Paradehelm eines römischen Reitersoldaten. Sie wurde 1990 in Kalkriese gefunden und bewies endgültig, dass hier die Legionen des Varus von den verbündeten Stämmen unter Arminius geschlagen wurden.',
    significance:
      'Eines der spektakulärsten archäologischen Fundstücke der europäischen Antike und Schlüsselbeweis für den Ort der Varusschlacht.',
    question: 'Was bewies der Fund der silbernen Gesichtsmaske in Kalkriese?',
    options: [
      'Dass Kalkriese der tatsächliche historische Schauplatz der Varusschlacht von 9 n. Chr. war',
      'Dass römische Legionäre gar keine Helme trugen',
      'Dass Arminius ein römisches Theater in Germanien gegründet hatte',
    ],
    correctIndex: 0,
  },
];
