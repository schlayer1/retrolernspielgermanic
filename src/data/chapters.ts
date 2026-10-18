export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChapterData {
  id: number;
  title: string;
  subtitle: string;
  year: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  introDialog: string[];
  questDescription: string;
  hints: string[];
  quiz: QuizQuestion[];
  summary: string;
  unlocksText: string;
}

// ============================================================
// INTERAKTIVE FACHBEGRIFF-HERVORHEBUNG (für Dialog-Tooltips)
// ============================================================
export const HIGHLIGHT_TERMS: Record<string, string> = {
  'Wohnstallhaus': 'wohnstallhaus',
  'Wohnstallhauses': 'wohnstallhaus',
  'Wohnstallhäuser': 'wohnstallhaus',
  'Sippe': 'sippe',
  'Sippen': 'sippe',
  'Sippenverband': 'sippe',
  'Spelzweizen': 'ackerbau_spelt',
  'Emmer': 'ackerbau_spelt',
  'Auerochse': 'auerochse',
  'Auerochsen': 'auerochse',
  'Wisent': 'auerochse',
  'Raseneisenerz': 'raseneisenerz',
  'Raseneisenstein': 'raseneisenerz',
  'Rennofen': 'rennofen',
  'Rennöfen': 'rennofen',
  'Luppe': 'schmiede_hammer',
  'Fibel': 'fibel',
  'Fibeln': 'fibel',
  'Bernstein': 'bernstein',
  'Terra Sigillata': 'terra_sigillata',
  'Denar': 'denar_augustus',
  'Denare': 'denar_augustus',
  'Waldgirmes': 'waldgirmes',
  'Thing': 'thing',
  'Thingplatz': 'thing',
  'Thingfrieden': 'thing',
  'Wergeld': 'wergeld',
  'Allmende': 'allmende',
  'Heiliger Hain': 'heiliger_hain',
  'Heiligen Hain': 'heiliger_hain',
  'Mooropfer': 'mooropfer',
  'Moor': 'mooropfer',
  'Seherin': 'seherin_voelva',
  'Völva': 'seherin_voelva',
  'Runen': 'runen_futhark',
  'Futhark': 'runen_futhark',
  'Varusschlacht': 'varusschlacht',
  'Varus': 'varusschlacht',
  'Arminius': 'varusschlacht',
  'Kalkriese': 'kalkriese',
  'Rasensodenwall': 'rasensodenwall',
  'Limes': 'limes',
  'Wachturm': 'limes_wachturm',
  'Kastell': 'limes_wachturm',
  'Vicus': 'vicus',
  'Föderaten': 'foederaten',
  'Spätantike': 'spaetantike',
  'Völkerwanderung': 'spaetantike',
  'Tacitus': 'relic_tacitus_germania',
};

// ============================================================
// DIE 8 KAPITEL – VOM LANGHAUS ZUM LIMES (10 v. Chr. – 350 n. Chr.)
// ============================================================
export const CHAPTERS: ChapterData[] = [
  // KAPITEL 1
  {
    id: 1,
    title: 'Im Schatten des Langhauses',
    subtitle: 'Alltag, Siedlung und Sippe',
    year: 'ca. 10 v. Chr.',
    mentorId: 'walburg',
    mentorName: 'Walburg',
    mentorRole: 'Sippenälteste & Hüterin des Herdes',
    introDialog: [
      'Sei gegrüßt in unserem Dorf! Die Fremden aus dem Süden nennen uns Barbaren und glauben, wir hausten wie Tiere in finsteren Wäldern.',
      'Sieh dich um: Unsere Sippe lebt in einem stattlichen Wohnstallhaus aus Eichenbalken, Flechtwerk und Lehm. Unter unserem Reetdach teilen Mensch und Vieh denselben Raum.',
      'Die Rinder und Schafe wärmen im eisigen Winter das Haus, während der Herd in der Mitte niemals erlischt.',
      'Ehe der Frost einbricht, müssen wir das Weidevieh in den Stall bringen und die Ernte von Spelzweizen im Pfahlspeicher sichern. Hilf deiner Sippe!',
    ],
    questDescription:
      'Hilf der Sippe: Inspiziere das Wohnstallhaus, bringe Weidevieh und Heu ein und sichere Spelzweizen im Pfahlspeicher.',
    hints: [
      'Sprich mit Walburg am Dorfplatz.',
      'Sammle Heuballen von der Weide ein und füttere die Tiere im Stallbereich des Langhauses.',
      'Inspiziere den Pfahlspeicher im Osten des Hofes.',
      'Finde das erste archäologische Relikt: Die eiserne Pflugschar am Acker.',
    ],
    quiz: [
      {
        question: 'Warum lebten Mensch und Vieh bei den Germanen gemeinsam im Wohnstallhaus?',
        options: [
          'Weil die Germanen keine Zäune oder Tore bauen konnten',
          'Die Körperwärme der Tiere heizte das Haus im Winter mit, und das Vieh war vor Raubtieren geschützt',
          'Weil römische Gesetze getrennte Ställe verboten hatten',
        ],
        correctIndex: 1,
        explanation:
          'In den archäologisch nachgewiesenen Langhäusern (z. B. Feddersen Wierde) standen die Tiere in Boxen im selben Gebäude. Dies sparte Baumaterial und nutzte die tierische Wärme.',
      },
      {
        question: 'Was bildete die rechtliche und wirtschaftliche Basis der germanischen Gesellschaft?',
        options: [
          'Die Sippe (Großfamilie), die ihren Mitgliedern Schutz, Land und Rechtsbeistand bot',
          'Ein zentraler König mit stehendem Berufsheer und festem Steuersystem',
          'Römische Statthalter, die das Getreide zuteilten',
        ],
        correctIndex: 0,
        explanation:
          'Die Sippe war der Kern germanischen Zusammenlebens. Bei Streitigkeiten oder Unrecht stand die gesamte Sippe füreinander ein (Sippenhaftung und Friedenswahrung).',
      },
    ],
    summary:
      'Du hast das Wohnstallhaus erkundet und verstanden, wie sesshafte Germanen als Bauern und Züchter planvoll wirtschafteten.',
    unlocksText: 'Kapitel 2 freigeschaltet: Der Rennofen am Bachlauf raucht!',
  },

  // KAPITEL 2
  {
    id: 2,
    title: 'Feuer und Raseneisenerz',
    subtitle: 'Rennöfen und die Kunst der Schmiede',
    year: 'ca. 5 v. Chr.',
    mentorId: 'sindolf',
    mentorName: 'Sindolf',
    mentorRole: 'Meisterschmied der Cherusker',
    introDialog: [
      'Tritt heran an die Esse! Hörst du das Keuchen der Blasebälge? Das ist der Herzschlag unseres Handwerks.',
      'Wir holen das Eisen nicht aus tiefen Bergwerken wie die Römer. Unser Schatz liegt im morastigen Boden: Raseneisenerz, das wir am Moorrand stechen.',
      'Im Rennofen aus Lehm schichten wir Erz und Holzkohle. Wenn das Feuer über 1100 Grad brennt, "rennt" die Schlacke unten heraus – und oben bleibt die eiserne Luppe.',
      'Daraus schmiede ich Pflugscharen, Äxte und kostbare Gewandspangen – unsere Fibeln. Hilf mir, die Schmelze vorzubereiten!',
    ],
    questDescription:
      'Gewinne Raseneisenerz am Moorrand, hole Holzkohle vom Meiler und hilf Sindolf beim Rennofen-Schmelzprozess.',
    hints: [
      'Gehe nach Südosten zum Moorrand und hebe Raseneisenerz aus.',
      'Hole getrocknete Holzkohle vom rauchenden Kohlemeiler.',
      'Bediene den Blasebalg am Rennofen, um die Schlacke abzulassen.',
      'Schmiede in der Werkstatt [Taste C] deine erste bronzene Fibel.',
    ],
    quiz: [
      {
        question: 'Wie nannten die Germanen den Ofen zur Eisengewinnung und warum?',
        options: [
          'Rennofen – weil die flüssige Schlacke während der Verhüttung nach unten herausrann',
          'Schnellofen – weil er das Eisen in wenigen Minuten verflüssigte',
          'Dampfofen – weil er mit heißem Quellwasser betrieben wurde',
        ],
        correctIndex: 0,
        explanation:
          'Der Begriff leitet sich vom althochdeutschen "rinnen" ab. Die verflüssigte Schlacke floss durch eine Öffnung ab, während das schmiedbare Eisen als poröser Schwamm ("Luppe") zurückblieb.',
      },
      {
        question: 'Wozu diente eine Fibel in der germanischen Kleidung?',
        options: [
          'Als Münze zum Bezahlen auf römischen Märkten',
          'Als Gewandspange zum Zusammenhalten von Umhang oder Tunika und als Statussymbol',
          'Als Pfeilspitze für die Bogenjagd auf Auerochsen',
        ],
        correctIndex: 1,
        explanation:
          'Da Knöpfe noch unüblich waren, hielten Fibeln (Sicherheitsnadel-Prinzip) Umhänge und Kleider zusammen. Reich verzierte Fibeln zeigten zudem den gesellschaftlichen Rang.',
      },
    ],
    summary:
      'Du hast die Funktionsweise des Rennofens begriffen und gelernt, wie eigenständig die germanische Metallurgie entwickelt war.',
    unlocksText: 'Kapitel 3 freigeschaltet: Ein römischer Händler erreicht den Fluss!',
  },

  // KAPITEL 3
  {
    id: 3,
    title: 'Händler, Münzen und Bernstein',
    subtitle: 'Kulturtransfer und der Markt von Waldgirmes',
    year: 'ca. 4 n. Chr.',
    mentorId: 'marcus',
    mentorName: 'Marcus Licinius',
    mentorRole: 'Römischer Fernkaufmann',
    introDialog: [
      'Salvete, junger Freund! Man warnte mich in Mogontiacum vor wilden Kriegern – doch hier treffe ich auf geschickte Weber und Händler.',
      'Mein Flussschiff brachte Luxusgüter aus dem Imperium: Scharlachrote Terra Sigillata-Schalen, Olivenöl, Bronzeeimer und kampanischen Wein.',
      'Im Gegenzug suche ich euer begehrtestes Gut: Den Bernstein der Küsten, blonde Haarlocken für römische Matronen und dichte Biberfelle.',
      'Hier in Waldgirmes bauen wir ein ziviles Zentrum mit Forum mitten in Germanien. Lass uns ein faires Tauschgeschäft abschließen!',
    ],
    questDescription:
      'Besuche den Handelsplatz von Waldgirmes: Tausche Bernstein und Felle gegen Terra Sigillata und lerne römische Münzen kennen.',
    hints: [
      'Gehe nach Südwesten zum römischen Handelssteg am Fluss.',
      'Tausche am Marktstand [Taste T] Bernstein gegen eine römische Terra Sigillata Schale.',
      'Untersuche die Denare des Kaisers Augustus.',
      'Kartiere die drei Bereiche von Waldgirmes: Forum, Töpferwerkstatt und Flussanleger.',
    ],
    quiz: [
      {
        question: 'Was beweist der archäologische Fundort Waldgirmes (an der Lahn) über das Verhältnis von Römern und Germanen?',
        options: [
          'Dass Römer und Germanen vor 9 n. Chr. friedlich zusammenlebten und eine zivile Stadt ohne Militärlager bauten',
          'Dass Germanen sofort alle römischen Bauten niederbrannten',
          'Dass Waldgirmes eine Festung war, in der nur Legionäre geduldet wurden',
        ],
        correctIndex: 0,
        explanation:
          'Waldgirmes war eine planmäßig angelegte zivile Römerstadt mit Marktplatz (Forum) und Basilika – ein Beweis für friedlichen Kultur- und Handelsaustausch vor der Varusschlacht.',
      },
      {
        question: 'Welches germanische Handelsgut war im Römischen Reich besonders als "nordisches Gold" geschätzt?',
        options: [
          'Bernstein (fossiles Baumharz aus dem Ostseeraum)',
          'Kartoffeln aus den Tälern der Weser',
          'Marmor aus den germanischen Gebirgen',
        ],
        correctIndex: 0,
        explanation:
          'Bernstein wurde über die Bernsteinstraße bis nach Rom transportiert und dort zu kostbarem Schmuck und Amuletten verarbeitet.',
      },
    ],
    summary:
      'Du hast erlebt, dass die Kontakte zwischen Rom und Germanien maßgeblich von friedlichem Handel und Technologietransfer geprägt waren.',
    unlocksText: 'Kapitel 4 freigeschaltet: Das Thing ruft zur Volksversammlung!',
  },

  // KAPITEL 4
  {
    id: 4,
    title: 'Unter der Gerichtseiche',
    subtitle: 'Thing, Recht und Sippenfrieden',
    year: 'ca. 7 n. Chr.',
    mentorId: 'hagano',
    mentorName: 'Hagano',
    mentorRole: 'Gesetzessprecher & Thing-Priester',
    introDialog: [
      'Hört den Klang der heiligen Haselstäbe! Der Thingfrieden ist ausgerufen – keine gezogene Klinge darf diesen Steinkreis entweihen.',
      'Hier versammeln sich alle Freien des Stammes unter freiem Himmel, um Recht zu sprechen und über Krieg und Frieden zu beraten.',
      'Ein schwerer Zwist bedroht unser Dorf: Zwei Sippen streiten um gestohlene Ochsen und verletzten Sippenehre. Blutrache droht!',
      'Als Gesetzessprecher muss ich das Wergeld – das Sühnegeld – verkünden, damit Frieden einkehrt. Tritt in den Ring und hilf beim Richterspruch!',
    ],
    questDescription:
      'Beteilige dich am Thing: Entwaffne Streitende am Rand, ermittle das Wergeld im Gewohnheitsrecht und hole das Schildklirren ein.',
    hints: [
      'Gehe nach Süden zum Steinkreis unter der mächtigen Eiche.',
      'Sorge dafür, dass alle Waffen an den Haselstangen niedergelegt werden.',
      'Prüfe die Zeugenaussagen im Streit um die Zugochsen.',
      'Stimme das Urteil an und ernte die Akklamation (Schildklirren) der Versammlung.',
    ],
    quiz: [
      {
        question: 'Was war der Hauptzweck des "Wergelds" (Mannpreis/Sühnegeld) im germanischen Recht?',
        options: [
          'Es sollte zerstörerische Blutrache zwischen verfeindeten Sippen verhindern und den Frieden wiederherstellen',
          'Es war eine Strafsteuer, die direkt an den römischen Kaiser bezahlt werden musste',
          'Es diente dem Kauf von Sklaven auf dem Markt in Rom',
        ],
        correctIndex: 0,
        explanation:
          'Statt endlose Blutfehden zuzulassen, legte das Thing Geldbußen (in Vieh oder Silber) fest, die der Täter der Sippe des Opfers als Wiedergutmachung zahlen musste.',
      },
      {
        question: 'Wie stimmten die freien Germanen auf dem Thing über Anträge und Urteile ab?',
        options: [
          'Durch geheime Stimmzettel aus Papyrus',
          'Durch Murren (Ablehnung) oder lautes Klirren mit den Waffen gegen ihre Schilde (Zustimmung)',
          'Allein der Priester entschied nach dem Würfelwurf',
        ],
        correctIndex: 1,
        explanation:
          'Wie der römische Historiker Tacitus in der "Germania" (Kapitel 11) beschreibt, war das Schlagen der Schilde (Akklamation) die ehrenvollste Form der Zustimmung.',
      },
    ],
    summary:
      'Du hast die demokratischen Elemente des germanischen Rechtsverständnisses und die Bedeutung der Schlichtung kennengelernt.',
    unlocksText: 'Kapitel 5 freigeschaltet: Der Bohlenweg ins Heilige Moor liegt frei!',
  },

  // KAPITEL 5
  {
    id: 5,
    title: 'Der Nebel des Heiligen Hains',
    subtitle: 'Glaube, Götter und Mooropfer',
    year: 'ca. 8 n. Chr.',
    mentorId: 'albruna',
    mentorName: 'Albruna',
    mentorRole: 'Seherin & Völva der Cherusker',
    introDialog: [
      'Bleib stehen und lausche dem Wispern des Moores. Hier, wo der Nebel aus den Schilfgräsern steigt, berühren die Götter die Erde.',
      'Wir errichten keine steinernen Tempel mit goldenen Dächern. Unsere Heiligtümer sind die uralten Haine, Quellen und das stille Moor.',
      'Donar schützt uns mit seinem Donner vor Unheil, Nerthus segnet unsere Äcker, und Wodan schenkt Weisheit und Dichtkunst.',
      'Um den Göttern zu danken, bringen wir Opfer dar: Geschmückte Holzidole, kostbare Fibeln und unbrauchbar gemachte Lanzen.',
      'Hilf mir, den Bohlenweg zu reparieren und das Opfer vorzubereiten, ehe die Zeichen der Ahnen gedeutet werden.',
    ],
    questDescription:
      'Erkunde das Moorheiligtum: Repariere den Bohlenweg, lege ein Fruchtbarkeitsopfer nieder und befrage Seherin Albruna zu den Runen.',
    hints: [
      'Folge dem Holzsteg nach Osten ins Moor.',
      'Bringe lose Bohlen am Pfad an, um die Opferplattform zu erreichen.',
      'Lege ein geschnitztes Votiv-Idol und Spelzweizen auf den Opferstein.',
      'Entziffere die Runenzeichen des Älteren Futhark im Orakel-Gespräch.',
    ],
    quiz: [
      {
        question: 'Wo verehrten die Germanen der frühen Kaiserzeit vorwiegend ihre Götter?',
        options: [
          'In riesigen Marmortempeln nach griechischem Vorbild',
          'In der freien Natur: In heiligen Hainen, an uralten Bäumen, heiligen Quellen und Mooren',
          'Ausschließlich in unterirdischen Katakomben',
        ],
        correctIndex: 1,
        explanation:
          'Tacitus überliefert, dass die Germanen es für unpassend hielten, die Größe der Himmelsgötter in von Menschen gebaute Tempelwände einzusperren.',
      },
      {
        question: 'Welche Rolle spielten Seherinnen (wie Veleda oder Albruna) in der germanischen Gesellschaft?',
        options: [
          'Sie galten als göttlich inspiriert und genossen höchstes politisches und religiöses Ansehen',
          'Sie durften das Haus nicht verlassen und hatten kein Mitspracherecht',
          'Sie waren römische Spioninnen ohne Einfluss',
        ],
        correctIndex: 0,
        explanation:
          'Seherinnen berieten Stammesführer vor Schlachten und Verhandlungen. Die Bructerin Veleda vermittelte später sogar Staatsverträge zwischen Germanen und Rom.',
      },
    ],
    summary:
      'Du hast die enge Naturverbundenheit des germanischen Glaubens und die archäologische Bedeutung der Moorfunde verstanden.',
    unlocksText: 'Kapitel 6 freigeschaltet: Römische Legionen marschieren gen Kalkriese!',
  },

  // KAPITEL 6
  {
    id: 6,
    title: 'Die Schlucht von Kalkriese',
    subtitle: 'Die Varusschlacht und das Nadelöhr',
    year: '9 n. Chr.',
    mentorId: 'arminius',
    mentorName: 'Arminius',
    mentorRole: 'Cheruskerfürst & Römischer Ritter',
    introDialog: [
      'Der Tag der Entscheidung ist da. Statthalter Varus zieht mit drei stolzen Legionen – über 15.000 Mann – samt Tross durch unser Land.',
      'Er hält mich für seinen treuen Bundesgenossen, weil ich in Rom aufwuchs und das Bürgerrecht trug. Doch er hat die Freiheit meines Volkes mit Füßen getreten.',
      'Wir können Rom nicht auf offenem Feld schlagen – ihre Reiterei und Schildwälle sind zu mächtig. Aber hier in Kalkriese zwingt die Natur sie in die Knie.',
      'Zwischen dem Hang des Kalkrieser Berges und dem unpassierbaren Moor ist der Weg kaum zwanzig Schritt breit. Wir haben einen Wall aus Rasensoden gebaut!',
      'Unsere Aufgabe ist es, Versprengte zu retten, Proviant zu sichern und die römische Marschordnung durch Geländekenntnis aufzureiben.',
    ],
    questDescription:
      'Erkunde den Engpass von Kalkriese: Verstärke den Rasensodenwall, sichere Nachschub und analysiere historische Quellenberichte.',
    hints: [
      'Gehe nach Nordosten zum Engpass zwischen Hügel und Moor.',
      'Bringe Rasensoden an die Schwachstellen des Verteidigungswalls.',
      'Sichere Trinkwasser und Decken für verwundete Sippenmitglieder.',
      'Finde das Relikt: Die silberne Gesichtsmaske eines römischen Reitersoldaten.',
    ],
    quiz: [
      {
        question: 'Welcher entscheidende Geländevorteil ermöglichte den germanischen Stämmen den Sieg in der Varusschlacht (9 n. Chr.)?',
        options: [
          'Ein enger Engpass zwischen Kalkrieser Berg und Großem Moor, der die römische Marschkolonne auseinanderzog',
          'Der Einsatz riesiger römischer Belagerungsmaschinen durch die Germanen',
          'Eine gewaltige Flotte germanischer Kriegsschiffe auf der Nordsee',
        ],
        correctIndex: 0,
        explanation:
          'Die Ausgrabungen in Kalkriese beweisen, dass die Römer auf einem schmalen Dammweg im Morast marschieren mussten. Sie konnten ihre gefürchtete Schlachtreihe nicht formieren.',
      },
      {
        question: 'Welche weitreichende historische Folge hatte die Niederlage des Varus für Rom?',
        options: [
          'Rom gab die Pläne auf, Germanien bis zur Elbe zu einer festen römischen Provinz zu machen; der Rhein wurde zur Grenze',
          'Das Römische Reich zerfiel noch im selben Jahr vollständig',
          'Arminius wurde zum neuen Kaiser von Rom gekrönt',
        ],
        correctIndex: 0,
        explanation:
          'Kaiser Augustus zog die Konsequenz: Rom verzichtete auf die dauerhafte Eroberung des freien Germaniens und sicherte die Reichsgrenzen fortan am Rhein und der Donau.',
      },
    ],
    summary:
      'Du hast die taktischen Hintergründe von Kalkriese verstanden, ohne Kriegsverherrlichung, sondern als Analyse von Geografie und Bündnispolitik.',
    unlocksText: 'Kapitel 7 freigeschaltet: Die befestigte Reichsgrenze am Limes entsteht!',
  },

  // KAPITEL 7
  {
    id: 7,
    title: 'Wachtürme und Grenzmärkte',
    subtitle: 'Das Leben am Obergermanischen Limes',
    year: 'ca. 140 n. Chr.',
    mentorId: 'flavus',
    mentorName: 'Flavus',
    mentorRole: 'Germanischer Auxiliarsoldat im Grenzdienst',
    introDialog: [
      'Halt! Wer den Limes passieren will, muss am Grenztor den Passierschein vorweisen und die Waren verzollen.',
      'Ich stamme selbst von den Chatten ab, diene aber nun seit zehn Jahren als Soldat der Hilfstruppen (Auxiliares) für Rom.',
      'Viele glauben, der Limes sei eine Mauer gegen die Barbaren. In Wahrheit ist er eine Zollgrenze und ein riesiger Marktplatz!',
      'Gleich hinter dem Holzturm liegt unser Vicus – das Kastelldorf. Hier wohnen Händler, Handwerker und die Familien der Soldaten.',
      'Lerne unsere Signaltechnik kennen und hilf mit, den Grenzhandel friedlich und geordnet zu regeln!',
    ],
    questDescription:
      'Übernimm den Grenzdienst am Limes: Kontrolliere Waren am Tor, lerne Fackelsignale des Wachturms und besuche den Vicus.',
    hints: [
      'Gehe nach Südwesten zur Limes-Palisade mit Holzwachturm.',
      'Prüfe die Zollerklärung für Holz- und Viehlieferungen am Schlagbaum.',
      'Sende den Signalcode (Fackel-/Rauchzeichen) an den nächsten Wachturm.',
      'Entziffere den römischen Legionsziegel-Stempel im Kastellbereich.',
    ],
    quiz: [
      {
        question: 'Welche Hauptfunktion hatte der Obergermanisch-Rätische Limes in Friedenszeiten?',
        options: [
          'Er war eine lückenlos überwachte Kontroll- und Zollgrenze zur Regulierung des Personen- und Warenverkehrs',
          'Er diente als Mauer, um alle Germanen von jeglichem Handel für immer abzuschneiden',
          'Er war ein rein religiöses Bauwerk ohne militärische Wachen',
        ],
        correctIndex: 0,
        explanation:
          'Der Limes sollte keine Angriffe ganzer Heere abwehren, sondern Überfälle verhindern, Zölle einnehmen und den Handel an festen Toren kanalisieren.',
      },
      {
        question: 'Was war ein "Vicus" an der Limes-Grenze?',
        options: [
          'Eine zivile Handwerker- und Händlersiedlung direkt neben dem römischen Grenzkastell',
          'Ein spezieller Helm für germanische Späher',
          'Das Gesetzbuch der römischen Kavallerie',
        ],
        correctIndex: 0,
        explanation:
          'Im Vicus lebten Händler, Gastwirte, Handwerker und Familien der Soldaten. Hier kam es zu engster friedlicher Vermischung der Kulturen.',
      },
    ],
    summary:
      'Du hast den Alltag an der Grenze erlebt und gelernt, wie der Limes Kulturkontakt und wirtschaftliche Koexistenz förderte.',
    unlocksText: 'Kapitel 8 freigeschaltet: Der Wandel der Spätantike und die Föderaten!',
  },

  // KAPITEL 8
  {
    id: 8,
    title: 'Neue Bündnisse und das Erbe Europas',
    subtitle: 'Föderaten, Runen und der Aufbruch in die Spätantike',
    year: 'ca. 350 n. Chr.',
    mentorId: 'chlodio',
    mentorName: 'Chlodio',
    mentorRole: 'Föderatenführer der Franken',
    introDialog: [
      'Blicke über den breiten Fluss, mein Freund. Die Zeiten der kleinen, zersplitterten Stämme sind vorüber.',
      'Wir haben uns zu großen Völkern zusammengeschlossen: Franken, Alamannen, Sachsen und Goten. Die Welt wandelt sich!',
      'Rom ruft uns nicht mehr als Feinde, sondern als Verbündete – als Föderaten. Wir verteidigen die Reichsgrenzen und erhalten dafür fruchtbares Land und Sold.',
      'Unsere Krieger steigen zu römischen Generälen und Konsuln auf. Germanische Freiheit und römisches Recht verschmelzen zum Fundament eines neuen Kontinents.',
      'Lass uns den Föderatenvertrag besiegeln, die Runen unseres Erbes verewigen und das Diplom der Chronisten empfangen!',
    ],
    questDescription:
      'Besiegle den Föderatenvertrag: Entziffere die Runeninschrift auf der Bügelfibel, sichere die Flussüberfahrt und empfange deine Urkunde.',
    hints: [
      'Begib dich zum Verhandlungstisch am Rheinufer.',
      'Dechiffriere die Runenzeichen des Älteren Futhark auf der goldenen Prachtfibel.',
      'Leite den Sippentreck sicher über die Pontonbrücke.',
      'Lege im Abschluss-Thing Rechenschaft ab und drücke [Taste U] für dein Meisterdiplom.',
    ],
    quiz: [
      {
        question: 'Was verstand man in der Spätantike unter "Föderaten" (Foederati)?',
        options: [
          'Germanische Stämme, die durch Staatsverträge mit Rom Land erhielten und dafür die Reichsgrenzen militärisch sicherten',
          'Römische Sklaven, die zur Zwangsarbeit in germanischen Steinbrüchen verurteilt wurden',
          'Ein Geheimbund von Seherinnen im Thüringer Wald',
        ],
        correctIndex: 0,
        explanation:
          'Föderatenverträge (*Foedus*) waren das wichtigste Bündnisinstrument der Spätantike. Sie ermöglichten friedliche Ansiedlung und führten zur Integration germanischer Eliten in das Römische Reich.',
      },
      {
        question: 'Welches dauerhafte historische Erbe hinterließ die Verschmelzung germanischer und römischer Kultur?',
        options: [
          'Sie bildete das gesellschaftliche, sprachliche und rechtliche Fundament für das mittelalterliche und moderne Europa',
          'Alle Spuren beider Kulturen gingen im Jahr 476 n. Chr. spurlos unter',
          'Das Verbot aller geschriebenen Gesetze für die nächsten tausend Jahre',
        ],
        correctIndex: 0,
        explanation:
          'Aus der Begegnung von römischer Zivilisation, germanischen Traditionen und christlichem Glauben erwuchsen die Staaten des europäischen Mittelalters.',
      },
    ],
    summary:
      'Du hast das gesamte historische Panorama der Germanen durchlaufen und fundiertes Wissen über Wirtschaft, Recht, Religion und Kulturtransfer erworben.',
    unlocksText: '🎉 Alle 8 Kapitel gemeistert! Drücke [Taste U], um dein Chronisten-Diplom zu öffnen!',
  },
];
