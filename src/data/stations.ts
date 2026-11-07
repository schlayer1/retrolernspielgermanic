/**
 * 5 Didaktische Mitmach-Stationen für Die Germanen (stations.ts)
 * Interaktive Mini-Simulationen zu Ackerbau, Metallurgie, Runenschrift, Holzarchitektur und Grenzhandel.
 */

export interface InteractiveStation {
  id: string;
  chapterId: number;
  title: string;
  subtitle: string;
  type: 'crop_rotation' | 'mortar_crafting' | 'symbol_decoder' | 'arch_construction' | 'scale_weighing';
  x: number;
  y: number;
  lexiconUnlockId: string;
  description: string;
  instruction: string;
  successMessage: string;
  config: Record<string, any>;
}

export const STATIONS: InteractiveStation[] = [
  {
    id: 'station_ackerbau',
    chapterId: 1,
    title: 'Dreifelder-Fruchtfolge & Urgetreide',
    subtitle: 'Agrarsimulation: Emmer, Gerste und Ackerbohnen',
    type: 'crop_rotation',
    x: 448,
    y: 336,
    lexiconUnlockId: 'ackerbau_spelt',
    description:
      'Germanische Sippen waren sesshafte Ackerbauern. Durch den gezielten Wechsel von Wintergetreide (Spelz/Emmer), Sommerfrucht (Gerste/Ackerbohnen) und Brache mit Stallmistdüngung verhinderten sie das Auslaugen der lehmigen Böden.',
    instruction:
      'Ordne den drei Ackerfluren die passende Bewirtschaftung zu, um die Sippe vor Missernten zu schützen!',
    successMessage:
      'Hervorragend gewirtschaftet! Die richtige Fruchtfolge sichert reiche Vorräte im Pfahlspeicher für den harten Winter.',
    config: {
      fields: [
        { id: 'flur_1', name: '1. Sommeracker (Aussaat im Frühjahr)', correctCrop: 'Gerste & proteinreiche Ackerbohnen für Mensch und Vieh' },
        { id: 'flur_2', name: '2. Winteracker (Aussaat im Spätherbst)', correctCrop: 'Robuster Spelzweizen (Emmer) für festes Brot' },
        { id: 'flur_3', name: '3. Brachefeld (Erholung des Bodens)', correctCrop: 'Weideland für Rinder & Anreicherung mit Stallmist' },
      ],
      options: [
        'Gerste & proteinreiche Ackerbohnen für Mensch und Vieh',
        'Robuster Spelzweizen (Emmer) für festes Brot',
        'Weideland für Rinder & Anreicherung mit Stallmist',
      ],
    },
  },
  {
    id: 'station_rennofen',
    chapterId: 2,
    title: 'Raseneisenerz-Verhüttung im Rennofen',
    subtitle: 'Metallurgische Schichtung: Erz, Holzkohle & Blasebalg',
    type: 'mortar_crafting',
    x: 768,
    y: 576,
    lexiconUnlockId: 'rennofen',
    description:
      'Aus feuchten Mooren gruben die Germanen Raseneisenstein aus. Im Lehmofen (Rennofen) wurde das Erz mit Buchenholzkohle auf ca. 1.100 °C erhitzt. Die flüssige Schlacke rann am Boden ab (daher "Rennofen") und hinterließ eine schmiedbare Eisenluppe.',
    instruction:
      'Schichte die Komponenten im exakten Mischverhältnis in den Ofenschacht!',
    successMessage:
      'Der Ofen glüht weißgelb! Die Schlacke fließt ab, und die teigige Eisenluppe kann am Amboss zur Pflugschar geschmiedet werden.',
    config: {
      ingredients: [
        { id: 'ore', label: 'Zerkleinertes Raseneisenerz', targetParts: 3 },
        { id: 'charcoal', label: 'Trockene Buchen-Holzkohle', targetParts: 4 },
        { id: 'air', label: 'Luftzufuhr über Ton-Düsen (Düsensteine)', targetParts: 2 },
      ],
    },
  },
  {
    id: 'station_limes_tausch',
    chapterId: 3,
    title: 'Römisch-Germanische Handelswaage am Limes',
    subtitle: 'Warentausch: Germanische Rohstoffe gegen römische Güter',
    type: 'scale_weighing',
    x: 352,
    y: 800,
    lexiconUnlockId: 'terra_sigillata',
    description:
      'An Grenzplätzen wie Waldgirmes trafen römische Fernhändler auf germanische Stammesvertreter. Da Germanen kein eigenes Münzgeld prägten, wurden Bernstein, Felle und Blondhaar gegen Terra-Sigillata-Geschirr, Wein und Bronzekessel aufgewogen.',
    instruction:
      'Bringe die Waagschalen mit passenden Tauschgütern ins exakte Gleichgewicht!',
    successMessage:
      'Gerechter Handel besiegelt! Römischer Rotwein und glänzende Terra Sigillata wandern ins Sippenlanghaus.',
    config: {
      targetWeight: 24,
      unit: 'Römische Pfund (Librae)',
      availableWeights: [2, 4, 6, 12],
    },
  },
  {
    id: 'station_langhaus',
    chapterId: 4,
    title: 'Wohnstallhaus-Konstruktion',
    subtitle: 'Holzbaukunst der Eisenzeit: Pfosten, Flechtwerk & Reet',
    type: 'arch_construction',
    x: 800,
    y: 896,
    lexiconUnlockId: 'wohnstallhaus',
    description:
      'Das Wohnstallhaus wurde vollständig ohne Eisennägel erbaut. Eichenpfosten wurden mit Holznägeln verzapft, die Wände aus Weidenruten geflochten und mit Lehm abgedichtet. Das hohe Reetdach hielt Regen und Schnee fern.',
    instruction:
      'Vollende die 4 Montageschritte der traditionellen Langhaus-Zimmerei!',
    successMessage:
      'Das Wohnstallhaus steht felsenfest! Die Sippe und das Vieh finden für Generationen Schutz unter einem Dach.',
    config: {
      steps: [
        'Eichene Firstsäulen im Erdreich verkeilen und mit Querpfetten verzapfen',
        'Stallboxen mit Flechtwerktrennwänden für Rinder und Schafe einrichten',
        'Wände aus Weidenruten flechten und mit Lehm-Stroh-Gemisch winddicht verputzen',
        'Dachstuhl mit getrocknetem Schilfrohr (Reet) wasserdicht eindecken',
      ],
    },
  },
  {
    id: 'station_runen',
    chapterId: 5,
    title: 'Älteres Futhark: Runen-Entzifferung',
    subtitle: 'Germanische Schriftkultur: Schutzzauber & Inschriften',
    type: 'symbol_decoder',
    x: 1184,
    y: 704,
    lexiconUnlockId: 'runen_futhark',
    description:
      'Das 24-teilige Ältere Futhark war keine Alltagsschrift für Bücher, sondern diente rituellen Weiheinschriften auf Waffen, Schmuckfibeln und Buchenholzstäben (daher "Buchstabe"). Jede Rune besaß einen Laut- und einen Symbolwert.',
    instruction:
      'Entziffere die drei Schutzrunen auf der silbernen Gewandfibel der Völva!',
    successMessage:
      'Runenmeisterlich gedeutet! Die Fibel schützt den Träger vor Verrat und Unheil.',
    config: {
      symbols: [
        { symbol: 'ᚠ (Fehu)', meaning: 'Vieh, beweglicher Wohlstand, Nahrung der Sippe' },
        { symbol: 'ᚱ (Raidho)', meaning: 'Reise, Wagen, kosmische Ordnung & Recht' },
        { symbol: 'ᚨ (Ansuz)', meaning: 'Götterstimme, Weisheit, Odin & Thingfrieden' },
      ],
    },
  },
];
