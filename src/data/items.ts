export type GermanItemId =
  | 'spelzweizen'
  | 'met_krug'
  | 'fleisch_braten'
  | 'ziegenmilch'
  | 'heuballen'
  | 'raseneisenerz'
  | 'eisenluppe'
  | 'fibel'
  | 'eisen_axt'
  | 'eisen_speer'
  | 'holz_bohle'
  | 'holzkohle'
  | 'lehm_ton'
  | 'bernstein'
  | 'tierfell_wolf'
  | 'auerochsen_horn'
  | 'terra_sigillata'
  | 'silber_denar'
  | 'roemer_wein'
  | 'haselstab'
  | 'wergeld_schatz'
  | 'votiv_holzidol'
  | 'kraeuter_salbe'
  | 'runen_knochen'
  | 'rasensode'
  | 'limes_pass'
  | 'legionsziegel'
  | 'foederaten_vertrag';

export type GermanItemCategory = 'food' | 'material' | 'tool' | 'culture';

export interface GermanItemDef {
  id: GermanItemId;
  name: string;
  category: GermanItemCategory;
  desc: string;
  historicalNote: string;
  icon: string;
  foodValue?: number;
}

export const GERMAN_ITEMS: Record<GermanItemId, GermanItemDef> = {
  spelzweizen: {
    id: 'spelzweizen',
    name: 'Spelzweizen & Emmer',
    category: 'food',
    desc: 'Urtümliche Getreideähren, reich an Nährstoffen und frostbeständig.',
    historicalNote:
      'Emmer, Einkorn und Spelzweizen waren die Hauptgetreidearten der germanischen Bauern der Eisenzeit.',
    icon: '/assets/icons/ackerbau_spelt.png',
    foodValue: 20,
  },
  met_krug: {
    id: 'met_krug',
    name: 'Germanischer Met (Honigwein)',
    category: 'food',
    desc: 'Vergärter Waldhonig mit Quellwasser, in Tonkrügen gelagert.',
    historicalNote:
      'Met war das festliche Kultgetränk bei Thingversammlungen und Sippenfeiern.',
    icon: '/assets/icons/allmende.png',
    foodValue: 30,
  },
  fleisch_braten: {
    id: 'fleisch_braten',
    name: 'Gebratenes Fleisch',
    category: 'food',
    desc: 'Über offenem Buchenholzfeuer saftig geröstetes Rindfleisch.',
    historicalNote:
      'Viehzucht (Rind, Schwein, Schaf) bildete das wirtschaftliche Rückgrat der Ernährung.',
    icon: '/assets/icons/auerochse.png',
    foodValue: 40,
  },
  ziegenmilch: {
    id: 'ziegenmilch',
    name: 'Frische Ziegenmilch',
    category: 'food',
    desc: 'Nahrhafte Milch der Weideziegen, erfrischt sofort.',
    historicalNote:
      'Ziegen und Schafe wurden vor allem wegen Milch, Käse und Wolle im Wohnstallhaus gehalten.',
    icon: '/assets/icons/wohnstallhaus.png',
    foodValue: 25,
  },
  heuballen: {
    id: 'heuballen',
    name: 'Trockener Heuballen',
    category: 'material',
    desc: 'Duftendes Wiesengras zur Winterfütterung im Stall.',
    historicalNote:
      'Die Heuernte im Spätsommer entschied über das Überleben des Viehs im langen germanischen Winter.',
    icon: '/assets/icons/allmende.png',
  },
  raseneisenerz: {
    id: 'raseneisenerz',
    name: 'Raseneisenerz (Moorerz)',
    category: 'material',
    desc: 'Krustige, rostbraune Brocken aus eisenhaltigen Niederungsmooren.',
    historicalNote:
      'Entstand durch Ausfällung von gelöstem Eisen im Grundwasser und konnte mit Hacken leicht gewonnen werden.',
    icon: '/assets/icons/raseneisenerz.png',
  },
  eisenluppe: {
    id: 'eisenluppe',
    name: 'Gereinigte Eisenluppe',
    category: 'material',
    desc: 'Geschmiedeter Eisenschwamm aus dem Rennofen, bereit zur Weiterverarbeitung.',
    historicalNote:
      'Das Produkt des Rennofens wurde unter dem Schmiedehammer verdichtet, um die Schlacke herauszuschlagen.',
    icon: '/assets/icons/rennofen.png',
  },
  fibel: {
    id: 'fibel',
    name: 'Bronzene Rollenkappenfibel',
    category: 'culture',
    desc: 'Kunstvoll gebogene Gewandspange mit Spiralfeder und Nadel.',
    historicalNote:
      'Fibeln waren Kleiderhalter und Schmuck zugleich. Ihre Formen erlauben Archäologen eine jahrgenaue Datierung.',
    icon: '/assets/icons/fibel.png',
  },
  eisen_axt: {
    id: 'eisen_axt',
    name: 'Eiserne Forstaxt',
    category: 'tool',
    desc: 'Schwere Axt zum Roden von Eichen und Spalten von Bauholz.',
    historicalNote:
      'Die eiserne Axt war das unverzichtbare Universalwerkzeug für Hausbau, Ackerbau und Verteidigung.',
    icon: '/assets/icons/schmiede_hammer.png',
  },
  eisen_speer: {
    id: 'eisen_speer',
    name: 'Germanischer Speer (Frame)',
    category: 'tool',
    desc: 'Schlanke Eisenspitze auf Eschenholzschaft – leicht und treffsicher.',
    historicalNote:
      'Tacitus berichtet, dass Schwerter selten waren; die Standardwaffe jedes Freien war die Frame (Speer).',
    icon: '/assets/icons/schmiede_hammer.png',
  },
  holz_bohle: {
    id: 'holz_bohle',
    name: 'Gespaltene Eichenbohle',
    category: 'material',
    desc: 'Massives Hartholzbrett zur Instandsetzung von Pfaden und Häusern.',
    historicalNote:
      'Bohlenwege im Moor erreichten Längen von mehreren Kilometern und verbanden Siedlungen über Sümpfe hinweg.',
    icon: '/assets/icons/wohnstallhaus.png',
  },
  holzkohle: {
    id: 'holzkohle',
    name: 'Meiler-Holzkohle',
    category: 'material',
    desc: 'Schwarze Kohleblöcke, schmilzt Erz bei Temperaturen über 1100 Grad.',
    historicalNote:
      'Köhler brannten Hartholz in luftdicht abgedeckten Meilern über Tage hinweg.',
    icon: '/assets/icons/rennofen.png',
  },
  lehm_ton: {
    id: 'lehm_ton',
    name: 'Bau- und Töpferlehm',
    category: 'material',
    desc: 'Zähe Erde zum Verputzen von Flechtwänden und Auskleiden von Öfen.',
    historicalNote:
      'Wohnstallhäuser bestanden aus Holzsäulen, Weidengeflecht und einer isolierenden Lehmschicht.',
    icon: '/assets/icons/wohnstallhaus.png',
  },
  bernstein: {
    id: 'bernstein',
    name: 'Baltischer Bernstein',
    category: 'culture',
    desc: 'Goldgelbes, sonnenwarmes fossiles Harz aus dem Küstenland.',
    historicalNote:
      'Begehrtestes Exportgut Germaniens nach Rom; wurde für Schmuck, Amulette und Schnitzereien verwendet.',
    icon: '/assets/icons/bernstein.png',
  },
  tierfell_wolf: {
    id: 'tierfell_wolf',
    name: 'Dichtes Wolfsfell',
    category: 'material',
    desc: 'Warmes Winterfell eines Waldwolfes, schützt vor Kälte und Wind.',
    historicalNote:
      'Felle dienten als Decken, Umhänge und begehrte Tauschware für römische Händler.',
    icon: '/assets/icons/sippe.png',
  },
  auerochsen_horn: {
    id: 'auerochsen_horn',
    name: 'Großes Auerochsenhorn',
    category: 'culture',
    desc: 'Mächtiges Horn des Ur-Rindes, mit Silber beschlagen als Prunk-Trinkhorn.',
    historicalNote:
      'Das Erlegen eines Auerochsen galt als Beweis von Mut. Die Hörner wurden als Zeremonial-Gefäße gehütet.',
    icon: '/assets/icons/auerochse.png',
  },
  terra_sigillata: {
    id: 'terra_sigillata',
    name: 'Terra Sigillata Schale',
    category: 'culture',
    desc: 'Glänzende, zinnoberrote römische Feinkeramik mit Reliefverzierungen.',
    historicalNote:
      'Römische Luxuskeramik aus gallischen Werkstätten, ein Statussymbol im germanischen Adel.',
    icon: '/assets/icons/terra_sigillata.png',
  },
  silber_denar: {
    id: 'silber_denar',
    name: 'Römischer Silberdenar',
    category: 'culture',
    desc: 'Münze mit dem Porträt des Kaisers Augustus, hochgeschätzt wegen des Silbergehalts.',
    historicalNote:
      'Germanen akzeptierten bevorzugt alte, reine Silberdenare mit gezacktem Rand (Serrati).',
    icon: '/assets/icons/denar_augustus.png',
  },
  roemer_wein: {
    id: 'roemer_wein',
    name: 'Italischer Amphorenwein',
    category: 'food',
    desc: 'Süßer, sonnengereifter Wein aus dem fernen Kampanien.',
    historicalNote:
      'Wein wurde von römischen Kaufleuten fassweise gegen Pelze, Bernstein und Sklaven getauscht.',
    icon: '/assets/icons/waldgirmes.png',
    foodValue: 35,
  },
  haselstab: {
    id: 'haselstab',
    name: 'Geweihte Haselstange',
    category: 'tool',
    desc: 'Geschälter Haselast zur feierlichen Einfriedung des Thingplatzes.',
    historicalNote:
      'Der heilige Ring aus Haselstangen und Seilen garantierte die Unantastbarkeit der Versammelten.',
    icon: '/assets/icons/thing.png',
  },
  wergeld_schatz: {
    id: 'wergeld_schatz',
    name: 'Wergeld-Sühneschatz',
    category: 'culture',
    desc: 'Abgewogene Silberringe und Zuchtvieh zur Sühne eines Sippenstreits.',
    historicalNote:
      'Wer eine Bluttat oder Diebstahl beging, zahlte Wergeld, um die Sippe des Opfers zu entschädigen.',
    icon: '/assets/icons/wergeld.png',
  },
  votiv_holzidol: {
    id: 'votiv_holzidol',
    name: 'Geschnitztes Moor-Idol',
    category: 'culture',
    desc: 'Anthropomorphe Holzfigur aus Eichenastwerk zur Opfergabe an Nerthus.',
    historicalNote:
      'Vorbilder sind die berühmten Holzfiguren von Braak (Schleswig-Holstein) aus der Eisenzeit.',
    icon: '/assets/icons/mooropfer.png',
  },
  kraeuter_salbe: {
    id: 'kraeuter_salbe',
    name: 'Heilsame Wundsalbe',
    category: 'tool',
    desc: 'Mischung aus Ringelblume, Bienenwachs und Tierfett im Tontiegel.',
    historicalNote:
      'Germanische Frauen besaßen tiefes Kräuterwissen zur Behandlung von Brandwunden und Hieben.',
    icon: '/assets/icons/seherin_voelva.png',
  },
  runen_knochen: {
    id: 'runen_knochen',
    name: 'Runen-Orakelknochen',
    category: 'culture',
    desc: 'Rinderknochen mit eingeritzten Schriftzeichen des Älteren Futhark.',
    historicalNote:
      'Runen dienten nicht dem Alltagsbriefwechsel, sondern rituellen Weiheinschriften und Orakeln.',
    icon: '/assets/icons/runen_futhark.png',
  },
  rasensode: {
    id: 'rasensode',
    name: 'Dichter Grassodenblock',
    category: 'material',
    desc: 'Mit Wurzelwerk durchsetzter Erdblock zur Errichtung von Wehrwällen.',
    historicalNote:
      'In Kalkriese errichteten die Germanen einen 400 Meter langen Wall aus Rasensoden als Deckung.',
    icon: '/assets/icons/rasensodenwall.png',
  },
  limes_pass: {
    id: 'limes_pass',
    name: 'Römischer Passierschein',
    category: 'culture',
    desc: 'Gestempelte Holzwachstafel mit Genehmigung zum Grenzübertritt.',
    historicalNote:
      'Am Limes durften Germanen die Tore nur unbewaffnet und nach Zahlung des Grenzzolls passieren.',
    icon: '/assets/icons/limes.png',
  },
  legionsziegel: {
    id: 'legionsziegel',
    name: 'Gestempelter Legionsziegel',
    category: 'material',
    desc: 'Roter Ziegel mit dem Stempel "LEG XXII PRI" (Legio XXII Primigenia).',
    historicalNote:
      'Die Legionen brannten ihre Ziegel in riesigen Feldöfen für Kastelle und Wachtürme.',
    icon: '/assets/icons/limes_wachturm.png',
  },
  foederaten_vertrag: {
    id: 'foederaten_vertrag',
    name: 'Pergament des Foedus',
    category: 'culture',
    desc: 'Spätantiker Bündnisvertrag: Land und Getreidesold gegen Grenzsicherung.',
    historicalNote:
      'Germanische Kriegerverbände wurden als Föderaten fest in die spätrömische Reichsverteidigung eingebunden.',
    icon: '/assets/icons/foederaten.png',
  },
};

// ============================================================
// BAU- UND STANDORTPROJEKTE (Taste B)
// ============================================================
export interface GermanBuildingDef {
  id: string;
  name: string;
  helperName: string;
  x: number;
  y: number;
  cost: Partial<Record<GermanItemId, number>>;
  desc: string;
  description: string;
  unlockedEpoch: number;
}

export const GERMAN_BUILDINGS: GermanBuildingDef[] = [
  {
    id: 'wohnstallhaus_ausbau',
    name: 'Wohnstallhaus-Erweiterung',
    helperName: 'Sippenälteste Walburg',
    x: 35,
    y: 28,
    cost: { holz_bohle: 3, lehm_ton: 2 },
    desc: 'Neuer Stallanbau für Weidevieh und Vorratsspeicher.',
    description: 'Bietet Platz für 6 weitere Zugochsen und schützt die Ernte vor Frost.',
    unlockedEpoch: 1,
  },
  {
    id: 'rennofen_schmelze',
    name: 'Rennofen-Schmelzhütte',
    helperName: 'Dorfschmied Sindolf',
    x: 51,
    y: 35,
    cost: { raseneisenerz: 4, lehm_ton: 3, holzkohle: 2 },
    desc: 'Robuste Lehmkuppel zur Verhüttung von Raseneisenerz.',
    description: 'Erhöht die Effizienz der Eisengewinnung um das Dreifache.',
    unlockedEpoch: 2,
  },
  {
    id: 'handelssteg_waldgirmes',
    name: 'Flussanleger & Marktstand',
    helperName: 'Händler Marcus',
    x: 22,
    y: 52,
    cost: { holz_bohle: 4, heuballen: 2 },
    desc: 'Bohlensteg am Fluss für römische Lastkähne.',
    description: 'Ermöglicht den direkten Tauschhandel von Bernstein gegen Terra Sigillata.',
    unlockedEpoch: 3,
  },
  {
    id: 'thing_steinring',
    name: 'Thingplatz-Einfriedung',
    helperName: 'Priester Hagano',
    x: 52,
    y: 56,
    cost: { haselstab: 4, holz_bohle: 2 },
    desc: 'Geweihter Steinkreis mit Haselzaun unter der Gerichtseiche.',
    description: 'Sichert den Thingfrieden und erlaubt bindende Richtersprüche.',
    unlockedEpoch: 4,
  },
  {
    id: 'moor_bohlenweg',
    name: 'Moor-Bohlenweg',
    helperName: 'Seherin Albruna',
    x: 74,
    y: 42,
    cost: { holz_bohle: 5, heuballen: 2 },
    desc: 'Hartholzpfad über das unwegsame Schilfmoor zur Opferstätte.',
    description: 'Verbindet das Dorf sicher mit dem Heiligtum der Göttin Nerthus.',
    unlockedEpoch: 5,
  },
  {
    id: 'rasensodenwall',
    name: 'Rasensodenwall Kalkriese',
    helperName: 'Fürst Arminius',
    x: 78,
    y: 22,
    cost: { rasensode: 6, holz_bohle: 3 },
    desc: 'Getarnter Wehrwall aus Grassoden am Berghang.',
    description: 'Zwingt feindliche Marschkolonnen in den morastigen Engpass.',
    unlockedEpoch: 6,
  },
  {
    id: 'limes_wachturm_bau',
    name: 'Grenz-Wachturm am Limes',
    helperName: 'Auxiliarsoldat Flavus',
    x: 26,
    y: 66,
    cost: { holz_bohle: 5, lehm_ton: 3, legionsziegel: 2 },
    desc: 'Mehrstöckiger Holzturm mit Signalfackeln und Palisadengatter.',
    description: 'Warnt mit Rauch- und Feuersignalen vor illegalen Grenzübertritten.',
    unlockedEpoch: 7,
  },
  {
    id: 'foederaten_siedlung',
    name: 'Föderaten-Hofgut',
    helperName: 'Führer Chlodio',
    x: 60,
    y: 68,
    cost: { holz_bohle: 4, lehm_ton: 4, foederaten_vertrag: 1 },
    desc: 'Befestigtes Siedlungsanwesen am Rheinufer.',
    description: 'Sitz der verbündeten germanischen Grenztruppen im Römischen Reich.',
    unlockedEpoch: 8,
  },
];

// ============================================================
// HANDWERK & HERSTELLUNG (Taste C)
// ============================================================
export interface GermanRecipe {
  id: GermanItemId;
  name: string;
  result: GermanItemId;
  amount: number;
  ingredients: Partial<Record<GermanItemId, number>>;
  desc: string;
  epoch: number;
}

export const GERMAN_RECIPES: GermanRecipe[] = [
  {
    id: 'eisenluppe',
    name: 'Erz im Rennofen schmelzen',
    result: 'eisenluppe',
    amount: 1,
    ingredients: { raseneisenerz: 2, holzkohle: 1 },
    desc: 'Schmilzt Raseneisenerz bei 1100 Grad zu schmiedbarem Eisenschwamm.',
    epoch: 2,
  },
  {
    id: 'fibel',
    name: 'Bronzene Fibel schmieden',
    result: 'fibel',
    amount: 1,
    ingredients: { eisenluppe: 1, holzkohle: 1 },
    desc: 'Schmiedet eine feine Gewandspange mit Spiralfeder.',
    epoch: 2,
  },
  {
    id: 'eisen_axt',
    name: 'Forstaxt fertigen',
    result: 'eisen_axt',
    amount: 1,
    ingredients: { eisenluppe: 1, holz_bohle: 1 },
    desc: 'Verbindet geschlagenes Eisen mit robustem Eschenholzgriff.',
    epoch: 2,
  },
  {
    id: 'met_krug',
    name: 'Krug Honigmet ansetzen',
    result: 'met_krug',
    amount: 1,
    ingredients: { spelzweizen: 1, ziegenmilch: 1 },
    desc: 'Braut feierlichen Met für den Thingrat und Festmähler.',
    epoch: 1,
  },
  {
    id: 'kraeuter_salbe',
    name: 'Wundsalbe anrühren',
    result: 'kraeuter_salbe',
    amount: 1,
    ingredients: { spelzweizen: 1, tierfell_wolf: 1 },
    desc: 'Mörsert Heilkräuter mit reinem Fett zur Desinfektion von Wunden.',
    epoch: 5,
  },
  {
    id: 'votiv_holzidol',
    name: 'Moor-Götzen schnitzen',
    result: 'votiv_holzidol',
    amount: 1,
    ingredients: { holz_bohle: 1, haselstab: 1 },
    desc: 'Schnitzt ein anthropomorphes Holzidol als Opfergabe.',
    epoch: 5,
  },
];

// ============================================================
// TAUSCHHANDEL (Taste T)
// ============================================================
export interface GermanTrade {
  id: string;
  name: string;
  partner: string;
  offer: GermanItemId;
  offerAmount: number;
  cost: GermanItemId;
  costAmount: number;
  epoch: number;
}

export const GERMAN_TRADES: GermanTrade[] = [
  {
    id: 'trade_terra_sigillata',
    name: 'Bernstein gegen Terra Sigillata',
    partner: 'Kaufmann Marcus (Waldgirmes)',
    offer: 'terra_sigillata',
    offerAmount: 1,
    cost: 'bernstein',
    costAmount: 2,
    epoch: 3,
  },
  {
    id: 'trade_silber_denar',
    name: 'Wolfsfell gegen Römische Denare',
    partner: 'Kaufmann Marcus (Waldgirmes)',
    offer: 'silber_denar',
    offerAmount: 2,
    cost: 'tierfell_wolf',
    costAmount: 1,
    epoch: 3,
  },
  {
    id: 'trade_roemer_wein',
    name: 'Getreide gegen Römischen Wein',
    partner: 'Vicus-Schankwirtin Vellida',
    offer: 'roemer_wein',
    offerAmount: 1,
    cost: 'spelzweizen',
    costAmount: 3,
    epoch: 7,
  },
];
