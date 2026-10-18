export interface LexiconEntry {
  id: string;
  term: string;
  category: 'Siedlung & Alltag' | 'Technik & Handwerk' | 'Handel & Kultur' | 'Recht & Glaube' | 'Grenze & Wandel';
  definition: string;
  merksatz: string;
  icon: string;
}

export const LEXICON_ENTRIES: LexiconEntry[] = [
  {
    id: 'wohnstallhaus',
    term: 'Das Wohnstallhaus',
    category: 'Siedlung & Alltag',
    definition:
      'Typisches Mehrzweck-Langhaus der germanischen Eisenzeit (oft 15 bis 30 Meter lang). Unter einem Reetdach befanden sich Wohnteil mit zentraler Feuerstelle und Stallboxen für Rinder, Schafe und Pferde.',
    merksatz: 'Mensch und Vieh lebten unter einem Dach – die tierische Körperwärme schützte die Sippe vor dem eisigen Winter.',
    icon: '/assets/icons/wohnstallhaus.png',
  },
  {
    id: 'sippe',
    term: 'Die Sippe',
    category: 'Siedlung & Alltag',
    definition:
      'Die germanische Großfamilie (alle Blutsverwandten über mehrere Generationen). Sie garantierte ihren Mitgliedern Rechtsbeistand, Schutz vor Feinden und bewirtschaftete gemeinsam Land und Vieh.',
    merksatz: 'Die Sippe war das soziale Sicherheitsnetz: Ein Angriff auf ein Mitglied galt als Angriff auf den gesamten Verband.',
    icon: '/assets/icons/sippe.png',
  },
  {
    id: 'ackerbau_spelt',
    term: 'Ackerbau (Spelz & Emmer)',
    category: 'Siedlung & Alltag',
    definition:
      'Sesshafte Landwirtschaft mit robusten Urgetreidesorten wie Emmer, Einkorn und Spelzweizen sowie Gerste, Ackerbohnen und Flachs. Gedüngt wurde mit Stallmist.',
    merksatz: 'Germanen waren keine heimatlosen Waldnomaden, sondern bodenständige Ackerbauern mit planvoller Fruchtfolge.',
    icon: '/assets/icons/ackerbau_spelt.png',
  },
  {
    id: 'auerochse',
    term: 'Der Auerochse (Ur)',
    category: 'Siedlung & Alltag',
    definition:
      'Das gewaltige wilde Ur-Rind (*Bos primigenius*) der europäischen Wälder mit einer Schulterhöhe von bis zu zwei Metern. Stammform unserer heutigen Hausrinder.',
    merksatz: 'Die Jagd auf den wilden Auerochsen galt als heroische Mutprobe; seine Hörner wurden als Prunk-Trinkgefäße gehütet.',
    icon: '/assets/icons/auerochse.png',
  },
  {
    id: 'raseneisenerz',
    term: 'Das Raseneisenerz',
    category: 'Technik & Handwerk',
    definition:
      'Rostbraunes Eisenerzgestein, das sich durch biochemische Vorgänge in feuchten Niederungsmooren und Bachtälern ablagerte. Konnte ohne tiefen Bergbau oberflächlich ausgestochen werden.',
    merksatz: 'Aus dem scheinbar wertlosen Moorboden gewannen die Germanen das Rohmaterial für Pflüge, Messer und Speere.',
    icon: '/assets/icons/raseneisenerz.png',
  },
  {
    id: 'rennofen',
    term: 'Der Rennofen',
    category: 'Technik & Handwerk',
    definition:
      'Schachtofen aus Lehm und Steinen. Durch Zufuhr von Holzkohle und Luft per Blasebalg wurden Temperaturen von über 1100 °C erreicht. Die flüssige Schlacke "rann" unten ab, oben verblieb die Eisenschwamm-Luppe.',
    merksatz: 'Der Rennofen war das technologische Herzstück der germanischen Eisenverhüttung.',
    icon: '/assets/icons/rennofen.png',
  },
  {
    id: 'fibel',
    term: 'Die Fibel',
    category: 'Technik & Handwerk',
    definition:
      'Gewandspange nach dem Prinzip der Sicherheitsnadel aus Bronze, Eisen oder Silber. Hielt Umhänge und Kleider zusammen und war gleichzeitig prunkvolles Schmuckstück.',
    merksatz: 'Fibeln sind die Uhren der Archäologie: An ihren Kunstformen lässt sich die Epoche und der Wohlstand genau ablesen.',
    icon: '/assets/icons/fibel.png',
  },
  {
    id: 'schmiede_hammer',
    term: 'Schmiedekunst & Luppe',
    category: 'Technik & Handwerk',
    definition:
      'Das Verdichten der porösen Eisenluppe auf dem Amboss unter stetem Hämmern und Glühen, um verbliebene Schlacke auszutreiben und härtbaren Stahl zu erzeugen.',
    merksatz: 'Gute Schmiede galten als von den Göttern begnadete Meister, die hartes Eisen formen konnten.',
    icon: '/assets/icons/schmiede_hammer.png',
  },
  {
    id: 'bernstein',
    term: 'Der Bernstein',
    category: 'Handel & Kultur',
    definition:
      'Fossiles Nadelbaumharz, das an den Küsten der Ost- und Nordsee angespült wurde. Beim Reiben lädt es sich elektrostatisch auf und duftet beim Verbrennen harzig-süß.',
    merksatz: 'Als "Gold des Nordens" war Bernstein das begehrteste Exportgut Germaniens nach Rom.',
    icon: '/assets/icons/bernstein.png',
  },
  {
    id: 'terra_sigillata',
    term: 'Die Terra Sigillata',
    category: 'Handel & Kultur',
    definition:
      'Scharlachrot glänzendes römisches Tafelgeschirr von höchster Qualität, oft mit Reliefbildern verziert und mit dem Stempel (*Sigillum*) der Töpfermeister versehen.',
    merksatz: 'Terra Sigillata war das Statussymbol der germanischen Oberschicht auf festlichen Gelagen.',
    icon: '/assets/icons/terra_sigillata.png',
  },
  {
    id: 'denar_augustus',
    term: 'Der Römische Denar',
    category: 'Handel & Kultur',
    definition:
      'Die wichtigste Silbermünze des Römischen Kaiserreiches. Germanen akzeptierten römische Münzen nach ihrem reinen Metallgewicht und bevorzugten alte, hochwertige Silberdenare.',
    merksatz: 'Römische Münzen brachten die Geldwirtschaft an die Lippe, den Rhein und die Weser.',
    icon: '/assets/icons/denar_augustus.png',
  },
  {
    id: 'waldgirmes',
    term: 'Die Römerstadt Waldgirmes',
    category: 'Handel & Kultur',
    definition:
      'Bedeutende archäologische Ausgrabung an der Lahn (Hessen): Eine geplante zivile Römerstadt mit Forum und Basilika, gegründet um 4 v. Chr. ohne militärische Festungsmauern.',
    merksatz: 'Waldgirmes belegt, dass Rom das rechtsrheinische Germanien zunächst friedlich und städtisch integrieren wollte.',
    icon: '/assets/icons/waldgirmes.png',
  },
  {
    id: 'thing',
    term: 'Das Thing (Ding)',
    category: 'Recht & Glaube',
    definition:
      'Die Volks- und Gerichtsversammlung aller freien Männer eines Stammes unter freiem Himmel. Geleitet von Priestern wurden Beschlüsse über Krieg, Frieden, Bündnisse und Streitigkeiten gefasst.',
    merksatz: 'Auf dem Thing herrschte heiliger Frieden: Beschlüsse wurden durch das Klirren mit den Waffen (Akklamation) bekräftigt.',
    icon: '/assets/icons/thing.png',
  },
  {
    id: 'wergeld',
    term: 'Das Wergeld (Mannpreis)',
    category: 'Recht & Glaube',
    definition:
      'Festgelegtes Sühnegeld zur Wiedergutmachung von Tötungen, Körperverletzungen oder Raub. Musste von der Sippe des Täters an die Sippe des Opfers entrichtet werden.',
    merksatz: 'Das Wergeld verhinderte endlose Blutrache und sicherte den Rechtsfrieden der Sippen.',
    icon: '/assets/icons/wergeld.png',
  },
  {
    id: 'allmende',
    term: 'Die Allmende',
    category: 'Recht & Glaube',
    definition:
      'Gemeinschaftseigentum der Dorfgemeinschaft: Wälder zur Eichelmast der Schweine, Weiden für das Vieh, Gewässer zum Fischen und Moore zum Torf- und Erzstechen.',
    merksatz: 'Die Allmende gehörte allen Freien gemeinsam und durfte von niemandem allein beansprucht werden.',
    icon: '/assets/icons/allmende.png',
  },
  {
    id: 'heiliger_hain',
    term: 'Der Heilige Hain',
    category: 'Recht & Glaube',
    definition:
      'Uralte, unberührte Waldstücke, Quellen oder Felsen, die einer Gottheit geweiht waren. Hier wurden Gebete gesprochen, Orakel eingeholt und Opfer dargebracht.',
    merksatz: 'Germanen bauten keine geschlossenen Steintempel: Sie erlebten ihre Götter unmittelbar in der mächtigen Natur.',
    icon: '/assets/icons/heiliger_hain.png',
  },
  {
    id: 'mooropfer',
    term: 'Das Mooropfer',
    category: 'Recht & Glaube',
    definition:
      'Rituelles Versenken von Waffen (unbrauchbar verbogene Lanzen und Schwerter), Schmuck, Vieh oder geschnitzten Holzidolen in Mooren als Dank- oder Bittopfer an die Götter.',
    merksatz: 'Dank des sauerstoffarmen Moorbodens blieben diese Votivgaben über 2000 Jahre für die Archäologie perfekt erhalten.',
    icon: '/assets/icons/mooropfer.png',
  },
  {
    id: 'seherin_voelva',
    term: 'Die Seherin (Völva)',
    category: 'Recht & Glaube',
    definition:
      'Hochangesehene kultische Priesterin und Orakeldeuterin (wie Veleda oder Albruna). Sie stand in Verbindung mit den Göttern und hatte oft entscheidenden politischen Einfluss.',
    merksatz: 'Germanische Stammesfürsten zogen selten in Verhandlungen oder Schlachten, ohne zuvor den Rat einer Seherin einzuholen.',
    icon: '/assets/icons/seherin_voelva.png',
  },
  {
    id: 'runen_futhark',
    term: 'Das Ältere Futhark',
    category: 'Recht & Glaube',
    definition:
      'Die älteste germanische Runenschrift (24 Zeichen), benannt nach den ersten sechs Lauten: F-U-Th-A-R-K. Die eckigen Linien waren ideal zum Einritzen in Holz, Stein, Knochen und Metall.',
    merksatz: 'Runen dienten rituellen Weiheformeln, Eigentumsmarken und Amuletten – jedes Zeichen trug eine tiefere Bedeutung.',
    icon: '/assets/icons/runen_futhark.png',
  },
  {
    id: 'varusschlacht',
    term: 'Die Varusschlacht (9 n. Chr.)',
    category: 'Grenze & Wandel',
    definition:
      'Vernichtung von drei römischen Legionen (XVII, XVIII, XIX) unter Statthalter Quinctilius Varus durch ein von Arminius angeführtes Bündnis germanischer Stämme.',
    merksatz: 'Die Schlacht beendete Roms Versuch, Germanien bis zur Elbe zu unterwerfen, und machte den Rhein zur Reichsgrenze.',
    icon: '/assets/icons/varusschlacht.png',
  },
  {
    id: 'kalkriese',
    term: 'Der Fundplatz Kalkriese',
    category: 'Grenze & Wandel',
    definition:
      'Archäologischer Schauplatz bei Osnabrück: Tausende römische Münzen, Waffenreste, Knochengruben und die berühmte Reiter-Gesichtsmaske belegen hier das Nadelöhr der Varusschlacht.',
    merksatz: 'Kalkriese ist der wissenschaftliche Beweis für das Scheitern des römischen Vormarsches im Morast.',
    icon: '/assets/icons/kalkriese.png',
  },
  {
    id: 'rasensodenwall',
    term: 'Der Rasensodenwall',
    category: 'Grenze & Wandel',
    definition:
      'Aus fest durchwurzelten Gras- und Moorschollen errichtete Feldbefestigung. In Kalkriese diente ein 400 m langer Wall den Germanen als Deckung am Berghang.',
    merksatz: 'Geschickte Geländenutzung und Erdwälle glichen die waffentechnische Übermacht der römischen Legionen aus.',
    icon: '/assets/icons/rasensodenwall.png',
  },
  {
    id: 'limes',
    term: 'Der Obergermanische Limes',
    category: 'Grenze & Wandel',
    definition:
      'Über 550 km langes befestigtes Grenzüberwachungssystem des Römischen Reiches zwischen Rhein und Donau mit Palisaden, Gräben, Wällen und über 900 Wachtürmen.',
    merksatz: 'Der Limes war keine Mauer zur Abschottung, sondern eine kontrollierte Zoll- und Wirtschaftsgrenze.',
    icon: '/assets/icons/limes.png',
  },
  {
    id: 'limes_wachturm',
    term: 'Der Limes-Wachturm',
    category: 'Grenze & Wandel',
    definition:
      'Zunächst aus Holz, später aus Stein errichteter Posten entlang der Reichsgrenze. Wachen übermittelten Nachrichten mit Fackeln bei Nacht, Rauch bei Tag und Signalhörnern.',
    merksatz: 'In Sichtweite zueinander erbaut, alarmierte das Signalsystem die Kastelle in wenigen Minuten über Truppenbewegungen.',
    icon: '/assets/icons/limes_wachturm.png',
  },
  {
    id: 'vicus',
    term: 'Der Vicus (Kastelldorf)',
    category: 'Grenze & Wandel',
    definition:
      'Zivile Siedlung im Schutz eines römischen Grenzkastells. Hier lebten Händler, Handwerker, Gastwirte und die einheimischen Familien der Soldaten.',
    merksatz: 'Im Vicus verschmolzen römische und germanische Lebensweisen zu einer blühenden Grenzkultur.',
    icon: '/assets/icons/vicus.png',
  },
  {
    id: 'foederaten',
    term: 'Die Föderaten (Foederati)',
    category: 'Grenze & Wandel',
    definition:
      'Germanische Stämme, die durch völkerrechtliche Verträge (*Foedus*) mit Rom Land innerhalb des Reiches erhielten und im Gegenzug die Grenzen militärisch verteidigten.',
    merksatz: 'Föderaten wurden zum stärksten militärischen Rückgrat der spätrömischen Armee.',
    icon: '/assets/icons/foederaten.png',
  },
  {
    id: 'spaetantike',
    term: 'Die Spätantike Transformation',
    category: 'Grenze & Wandel',
    definition:
      'Die Epoche zwischen 250 und 600 n. Chr., in der sich germanische Großstämme (Franken, Alamannen, Goten) bildeten und aus dem Römischen Reich die mittelalterlichen Reiche Europas erwuchsen.',
    merksatz: 'Kein plötzlicher Untergang, sondern ein jahrhundertelanger Wandel schuf die Wurzeln des heutigen Europa.',
    icon: '/assets/icons/spaetantike.png',
  },
];
