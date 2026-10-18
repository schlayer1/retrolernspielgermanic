import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { CHAPTERS, HIGHLIGHT_TERMS } from '../data/chapters';
import { GERMAN_BUILDINGS, GERMAN_ITEMS, GERMAN_RECIPES, GERMAN_TRADES, GermanItemId } from '../data/items';
import { LEXICON_ENTRIES } from '../data/lexicon';
import { GERMAN_RELICS, GermanRelic } from '../data/relics';
import { gameState, GERMAN_ROLES } from '../systems/GameState';
import { PlayerGender, PlayerRole } from '../systems/SaveManager';
import { TouchControls } from '../ui/TouchControls';
import { WorldScene } from './WorldScene';

export type ModalType =
  | 'none'
  | 'start'
  | 'dialog'
  | 'quiz'
  | 'relic_quiz'
  | 'inventory'
  | 'craft'
  | 'build'
  | 'trade'
  | 'lexicon'
  | 'timeline'
  | 'certificate'
  | 'pause';

export class UIScene extends Phaser.Scene {
  public touchControls!: TouchControls;
  private activeModal: ModalType = 'start';
  private uiRoot!: HTMLDivElement;
  private hudHeader!: HTMLDivElement;
  private questBox!: HTMLDivElement;
  private modalOverlay!: HTMLDivElement;
  private toastContainer!: HTMLDivElement;

  private lexiconSearch = '';
  private lexiconCategory = 'Alle';

  // Dialog & Quiz state
  private dialogLines: string[] = [];
  private dialogIndex = 0;
  private dialogSpeaker = '';
  private dialogRole = '';
  private dialogPortrait = '';
  private activeRelic: GermanRelic | null = null;

  constructor() {
    super('UI');
  }

  create() {
    this.initDOMStructure();
    this.touchControls = new TouchControls((key) => this.handleShortcutKey(key));
    this.registerKeyboardShortcuts();

    gameState.subscribe(() => {
      this.renderHUD();
      this.renderQuestTracker();
    });

    // Playtime counter
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.activeModal !== 'start' && this.activeModal !== 'pause') {
          gameState.playTimeSeconds += 1;
        }
      },
    });

    this.renderHUD();
    this.renderQuestTracker();
    this.openStartScreen();
  }

  public isModalOpen(): boolean {
    return this.activeModal !== 'none';
  }

  private initDOMStructure(): void {
    let root = document.getElementById('ui-layer') as HTMLDivElement | null;
    if (!root) {
      root = document.createElement('div');
      root.id = 'ui-layer';
      document.body.appendChild(root);
    }
    this.uiRoot = root;
    this.uiRoot.innerHTML = '';

    this.hudHeader = document.createElement('div');
    this.hudHeader.className = 'hud-top-bar';

    this.questBox = document.createElement('div');
    this.questBox.className = 'hud-quest-tracker';

    this.modalOverlay = document.createElement('div');
    this.modalOverlay.className = 'modal-backdrop';
    this.modalOverlay.style.display = 'none';

    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';

    this.uiRoot.appendChild(this.hudHeader);
    this.uiRoot.appendChild(this.questBox);
    this.uiRoot.appendChild(this.modalOverlay);
    this.uiRoot.appendChild(this.toastContainer);

    // Delegate clicks on highlighted lexicon terms inside dialogs
    this.modalOverlay.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('term-highlight')) {
        const termId = target.getAttribute('data-term');
        if (termId) {
          sound.playClick();
          gameState.markLexiconRead(termId);
          const entry = LEXICON_ENTRIES.find((x) => x.id === termId);
          if (entry) {
            this.showNotification(`📖 ${entry.term}: ${entry.definition}`);
          }
        }
      }
    });
  }

  private registerKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toUpperCase();
      if (key === 'ESCAPE') {
        if (this.activeModal !== 'start' && this.activeModal !== 'none') {
          this.closeModal();
        }
        return;
      }
      this.handleShortcutKey(key);
    });
  }

  public handleShortcutKey(key: string): void {
    if (this.activeModal === 'start') return;

    if (key === 'E') {
      if (this.activeModal === 'dialog') {
        this.nextDialogLine();
      } else if (this.activeModal === 'none') {
        const world = this.scene.get('World') as WorldScene;
        world?.triggerActiveInteraction();
      }
      return;
    }

    if (this.activeModal !== 'none' && this.activeModal !== 'dialog') {
      this.closeModal();
      return;
    }

    switch (key) {
      case 'I':
        this.openInventory();
        break;
      case 'C':
        this.openCrafting();
        break;
      case 'B':
        this.openBuildingOverview();
        break;
      case 'T':
        this.openTrading();
        break;
      case 'L':
        this.openLexicon();
        break;
      case 'Z':
        this.openTimeline();
        break;
      case 'P':
        this.openPauseMenu();
        break;
      case 'U':
        this.openCertificate();
        break;
    }
  }

  public showNotification(msg: string): void {
    const toast = document.createElement('div');
    toast.className = 'hud-toast';
    toast.innerHTML = msg;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // =========================================================================
  // HUD RENDERING
  // =========================================================================
  private renderHUD(): void {
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    const roleDef = GERMAN_ROLES.find((r) => r.id === gameState.role) || GERMAN_ROLES[0];

    this.hudHeader.innerHTML = `
      <div class="hud-left">
        <div class="hud-ch-badge">Kapitel ${ch.id}: ${ch.year}</div>
        <div class="hud-ch-title">${ch.title}</div>
      </div>
      <div class="hud-right">
        <div class="hud-player-tag">
          <span class="hud-role-icon">${roleDef.name.split(' ')[0]}</span>
          <span class="hud-player-name">${gameState.playerName}</span>
        </div>
        <div class="hud-relics-badge" title="Gefundene Relikte">
          🏺 ${gameState.discoveredRelics.size}/5
        </div>
        <div class="hud-quick-buttons">
          <button class="hud-btn" onclick="window.__GERM_UI__.handleShortcutKey('I')">🎒 [I]</button>
          <button class="hud-btn" onclick="window.__GERM_UI__.handleShortcutKey('C')">🔨 [C]</button>
          <button class="hud-btn" onclick="window.__GERM_UI__.handleShortcutKey('Z')">⏳ [Z]</button>
          <button class="hud-btn" onclick="window.__GERM_UI__.handleShortcutKey('L')">📖 [L]</button>
          <button class="hud-btn" onclick="window.__GERM_UI__.handleShortcutKey('P')">⏸️ [P]</button>
        </div>
      </div>
    `;

    // Expose UI scene globally for HTML inline handlers
    (window as any).__GERM_UI__ = this;
  }

  private renderQuestTracker(): void {
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    const objs = gameState.chapterObjectives[ch.id] || [false, false, false, false];
    const completedCount = objs.filter((x) => x).length;

    this.questBox.innerHTML = `
      <div class="quest-header">
        <span class="quest-title-icon">⚔️</span>
        <span class="quest-title-text">${ch.subtitle}</span>
        <span class="quest-counter ${completedCount === 4 ? 'quest-done' : ''}">${completedCount}/4</span>
      </div>
      <div class="quest-desc">${ch.questDescription}</div>
      <div class="quest-objectives-list">
        ${ch.hints
          .map(
            (hint, i) => `
          <div class="quest-item ${objs[i] ? 'done' : ''}">
            <span class="q-checkbox">${objs[i] ? '✓' : '○'}</span>
            <span class="q-text">${hint}</span>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // =========================================================================
  // START SCREEN (DOCUMENT & PARCHMENT STYLE)
  // =========================================================================
  public openStartScreen(): void {
    this.activeModal = 'start';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="modal-card parchment-startscreen">
        <div class="start-header">
          <div class="start-school-badge">Heimbürgeschule Kahla · Geschichte Klasse 6–8</div>
          <h1 class="start-main-title">DIE GERMANEN</h1>
          <div class="start-subtitle">Vom Wohnstallhaus zur Reichsgrenze · 10 v. Chr. – 350 n. Chr.</div>
        </div>

        <!-- 8-CHAPTER ZERO-CLIPPING SHOWCASE GRID -->
        <div class="parchment-chapter-grid">
          ${CHAPTERS.map(
            (ch) => `
            <div class="parchment-ch-card ${ch.id === gameState.chapter ? 'active' : ''}" onclick="window.__GERM_UI__.selectStartChapter(${ch.id})">
              <div class="ch-card-header">K${ch.id} · ${ch.year}</div>
              <div class="ch-card-title">${ch.title}</div>
              <div class="ch-card-sub">${ch.subtitle}</div>
            </div>
          `,
          ).join('')}
        </div>

        <!-- PLAYER CREATION & ROLE PICKER -->
        <div class="start-setup-section">
          <div class="start-input-group">
            <label>1. Dein Schülername:</label>
            <input type="text" id="start-player-name" class="start-text-input" value="${gameState.playerName}" maxlength="18" />
          </div>

          <div class="start-input-group">
            <label>2. Figur wählen:</label>
            <div class="start-gender-row">
              <button class="gender-btn ${gameState.gender === 'male' ? 'active' : ''}" onclick="window.__GERM_UI__.setGender('male')">
                👦 Folkmar
              </button>
              <button class="gender-btn ${gameState.gender === 'female' ? 'active' : ''}" onclick="window.__GERM_UI__.setGender('female')">
                👧 Alrun
              </button>
            </div>
          </div>
        </div>

        <div class="start-roles-section">
          <label>3. Deine historische Sippenbegabung (wähle eine Rolle mit Bonus):</label>
          <div class="start-roles-grid">
            ${GERMAN_ROLES.map(
              (r) => `
              <div class="role-card ${gameState.role === r.id ? 'active' : ''}" onclick="window.__GERM_UI__.setRole('${r.id}')">
                <div class="role-title">${r.name}</div>
                <div class="role-tribal">${r.tribalTitle}</div>
                <div class="role-desc">${r.description}</div>
                <div class="role-bonus">✨ ${r.bonusText}</div>
              </div>
            `,
            ).join('')}
          </div>
        </div>

        <!-- CLASSROOM CODE RESTORATION -->
        <div class="start-code-row">
          <span>📝 Hefter-Code vorhanden?</span>
          <input type="text" id="classroom-code-input" class="code-input" placeholder="GERM-K01-FO-00-00" />
          <button class="btn-sub" onclick="window.__GERM_UI__.loadClassroomCode()">Code laden</button>
        </div>

        <div class="start-footer">
          <div class="start-controls-hint">🎮 Steuerung: WASD/Pfeiltasten · [E] Interagieren · [I] Beutel · [P] Menü</div>
          <button class="btn-primary start-launch-btn" id="start-game-btn" onclick="window.__GERM_UI__.startGameFromStartScreen()">
            🚀 In die Epoche starten!
          </button>
        </div>
      </div>
    `;
  }

  public selectStartChapter(chId: number): void {
    gameState.chapter = chId;
    sound.playClick();
    this.openStartScreen();
  }

  public setGender(gender: PlayerGender): void {
    gameState.gender = gender;
    gameState.playerName = gender === 'male' ? 'Folkmar' : 'Alrun';
    sound.playClick();
    this.openStartScreen();
  }

  public setRole(roleId: PlayerRole): void {
    gameState.role = roleId;
    sound.playClick();
    this.openStartScreen();
  }

  public loadClassroomCode(): void {
    const input = document.getElementById('classroom-code-input') as HTMLInputElement | null;
    if (input && input.value) {
      const ok = gameState.loadFromClassroomCode(input.value);
      if (ok) {
        sound.playQuest();
        this.showNotification('✅ Fortschritt aus Hefter-Code erfolgreich geladen!');
        this.openStartScreen();
      } else {
        this.showNotification('❌ Ungültiger Hefter-Code! Format: GERM-K01-XX-00-00');
      }
    }
  }

  public startGameFromStartScreen(): void {
    const nameInput = document.getElementById('start-player-name') as HTMLInputElement | null;
    if (nameInput && nameInput.value.trim()) {
      gameState.playerName = nameInput.value.trim();
    }
    sound.playQuest();
    this.closeModal();
    sound.playBGM(gameState.chapter);
    this.showMentorDialog(gameState.chapter);
  }

  // =========================================================================
  // MENTOR DIALOG MODAL WITH TOOLTIPS & GATING
  // =========================================================================
  public showMentorDialog(chId: number): void {
    const ch = CHAPTERS.find((c) => c.id === chId) || CHAPTERS[0];
    this.activeModal = 'dialog';
    this.touchControls.setVisible(false);

    this.dialogLines = [...ch.introDialog];
    this.dialogIndex = 0;
    this.dialogSpeaker = ch.mentorName;
    this.dialogRole = ch.mentorRole;
    this.dialogPortrait = `/assets/gfx/portraits/npc_${ch.mentorId}.png`;

    this.renderDialogStep(ch);
  }

  private renderDialogStep(ch: (typeof CHAPTERS)[0]): void {
    this.modalOverlay.style.display = 'flex';
    const text = this.dialogLines[this.dialogIndex] || '';

    // Highlight glossary terms
    let parsedText = text;
    for (const [term, key] of Object.entries(HIGHLIGHT_TERMS)) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      parsedText = parsedText.replace(regex, `<span class="term-highlight" data-term="${key}">$&</span>`);
    }

    const isLastLine = this.dialogIndex >= this.dialogLines.length - 1;
    const objs = gameState.chapterObjectives[ch.id] || [false, false, false, false];
    const allDone = objs.every((x) => x);

    this.modalOverlay.innerHTML = `
      <div class="modal-card dialog-modal">
        <div class="dialog-layout">
          <div class="dialog-portrait-box">
            <div class="dialog-avatar-frame">
              <img src="${this.dialogPortrait}" class="dialog-avatar-img" />
            </div>
            <div class="dialog-speaker-name">${this.dialogSpeaker}</div>
            <div class="dialog-speaker-role">${this.dialogRole}</div>
          </div>
          <div class="dialog-body">
            <div class="dialog-speech-bubble">
              ${parsedText}
            </div>

            <div class="dialog-progress-box">
              <div class="dp-header">Kapitelziel (${objs.filter((x) => x).length}/4 erledigt):</div>
              <div class="dp-list">
                ${ch.hints
                  .map(
                    (h, i) => `
                  <div class="dp-item ${objs[i] ? 'done' : ''}">
                    ${objs[i] ? '✓' : '○'} ${h}
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>

            <div class="dialog-actions">
              ${
                !isLastLine
                  ? `<button class="btn-primary" onclick="window.__GERM_UI__.nextDialogLine()">Weiter [E] ▶</button>`
                  : allDone
                    ? `<button class="btn-primary quiz-pulse-btn" onclick="window.__GERM_UI__.startChapterQuiz(${ch.id})">🎓 Kapitel-Quiz starten ▶</button>`
                    : `<button class="btn-secondary" onclick="window.__GERM_UI__.closeModal()">Verstanden – An die Arbeit! [ESC]</button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  public nextDialogLine(): void {
    if (this.dialogIndex < this.dialogLines.length - 1) {
      this.dialogIndex += 1;
      sound.playClick();
      const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
      this.renderDialogStep(ch);
    } else {
      this.closeModal();
    }
  }

  // =========================================================================
  // CHAPTER QUIZ MODAL
  // =========================================================================
  public startChapterQuiz(chId: number): void {
    const ch = CHAPTERS.find((c) => c.id === chId) || CHAPTERS[0];
    this.activeModal = 'quiz';
    this.renderQuizQuestion(ch, 0);
  }

  private renderQuizQuestion(ch: (typeof CHAPTERS)[0], qIdx: number): void {
    const q = ch.quiz[qIdx];
    if (!q) {
      // Quiz complete!
      sound.playQuest();
      gameState.setObjective(ch.id, 3, true);
      gameState.unlockChapter(ch.id + 1);
      this.showNotification(`🎉 Kapitel ${ch.id} gemeistert!`);
      this.closeModal();
      return;
    }

    this.modalOverlay.style.display = 'flex';
    this.modalOverlay.innerHTML = `
      <div class="modal-card quiz-modal">
        <div class="quiz-header">
          <div class="quiz-badge">Frage ${qIdx + 1} von ${ch.quiz.length}</div>
          <h2>${q.question}</h2>
        </div>
        <div class="quiz-options">
          ${q.options
            .map(
              (opt, i) => `
            <button class="quiz-opt-btn" onclick="window.__GERM_UI__.answerQuiz(${ch.id}, ${qIdx}, ${i})">
              ${opt}
            </button>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  public answerQuiz(chId: number, qIdx: number, selected: number): void {
    const ch = CHAPTERS.find((c) => c.id === chId) || CHAPTERS[0];
    const q = ch.quiz[qIdx];
    const isCorrect = selected === q.correctIndex;

    this.modalOverlay.innerHTML = `
      <div class="modal-card quiz-feedback-modal ${isCorrect ? 'correct' : 'wrong'}">
        <div class="qf-icon">${isCorrect ? '🌟 Richtig!' : '❌ Nicht ganz!'}</div>
        <div class="qf-explanation">${q.explanation}</div>
        <button class="btn-primary" onclick="window.__GERM_UI__.advanceQuiz(${chId}, ${qIdx}, ${isCorrect})">
          ${isCorrect ? 'Nächste Frage ▶' : 'Erneut versuchen ↺'}
        </button>
      </div>
    `;
    if (isCorrect) sound.playQuest();
    else sound.playClick();
  }

  public advanceQuiz(chId: number, qIdx: number, wasCorrect: boolean): void {
    const ch = CHAPTERS.find((c) => c.id === chId) || CHAPTERS[0];
    if (wasCorrect) {
      this.renderQuizQuestion(ch, qIdx + 1);
    } else {
      this.renderQuizQuestion(ch, qIdx);
    }
  }

  // =========================================================================
  // RELIC DISCOVERY QUIZ MODAL
  // =========================================================================
  public showRelicQuizModal(relic: GermanRelic): void {
    this.activeModal = 'relic_quiz';
    this.activeRelic = relic;
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="modal-card relic-modal">
        <div class="relic-header">
          <img src="${relic.icon}" class="relic-icon-large" />
          <div>
            <div class="relic-epoch">${relic.epoch} · ${relic.year}</div>
            <h2>${relic.name}</h2>
            <div class="relic-loc">📍 Fundort: ${relic.findLocation}</div>
          </div>
        </div>
        <div class="relic-context-text">${relic.historicalContext}</div>
        <div class="relic-significance-box">💡 <b>Bedeutung für die Geschichtswissenschaft:</b> ${relic.significance}</div>

        <div class="relic-question-box">
          <div class="rq-title">❓ Wissens-Check: ${relic.question}</div>
          <div class="rq-options">
            ${relic.options
              .map(
                (opt, i) => `
              <button class="quiz-opt-btn" onclick="window.__GERM_UI__.answerRelicQuiz(${i})">
                ${opt}
              </button>
            `,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  public answerRelicQuiz(choiceIdx: number): void {
    if (!this.activeRelic) return;
    const isCorrect = choiceIdx === this.activeRelic.correctIndex;

    if (isCorrect) {
      sound.playRelic();
      gameState.markRelicDiscovered(this.activeRelic.id);
      this.showNotification(`✨ Relikt geborgen: ${this.activeRelic.name}`);
      this.modalOverlay.innerHTML = `
        <div class="modal-card quiz-feedback-modal correct">
          <div class="qf-icon">🏆 Ausgezeichnet!</div>
          <div class="qf-explanation">Du hast das Relikt erfolgreich analysiert und in deine historische Sammlung aufgenommen.</div>
          <button class="btn-primary" onclick="window.__GERM_UI__.closeModal()">Relikt in Sammlung ablegen [ESC]</button>
        </div>
      `;
    } else {
      sound.playClick();
      this.showNotification('❌ Lies den historischen Kontext noch einmal aufmerksam durch!');
      this.showRelicQuizModal(this.activeRelic);
    }
  }

  // =========================================================================
  // LEXIKON MODAL (27 CURRICULUM ENTRIES)
  // =========================================================================
  public openLexicon(): void {
    this.activeModal = 'lexicon';
    this.touchControls.setVisible(false);
    this.renderLexiconContent();
  }

  private renderLexiconContent(): void {
    this.modalOverlay.style.display = 'flex';
    const categories = ['Alle', 'Siedlung & Alltag', 'Technik & Handwerk', 'Handel & Kultur', 'Recht & Glaube', 'Grenze & Wandel'];

    const filtered = LEXICON_ENTRIES.filter((e) => {
      const matchCat = this.lexiconCategory === 'Alle' || e.category === this.lexiconCategory;
      const matchSearch =
        !this.lexiconSearch ||
        e.term.toLowerCase().includes(this.lexiconSearch.toLowerCase()) ||
        e.definition.toLowerCase().includes(this.lexiconSearch.toLowerCase());
      return matchCat && matchSearch;
    });

    this.modalOverlay.innerHTML = `
      <div class="modal-card lexicon-modal">
        <div class="modal-header-row">
          <h2>📖 Historisches Lexikon der Germanen (27 Fachbegriffe)</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>

        <div class="lexicon-filter-bar">
          <input type="text" class="lex-search-input" placeholder="Begriff suchen..." value="${this.lexiconSearch}" oninput="window.__GERM_UI__.updateLexiconSearch(this.value)" />
          <div class="lex-cats">
            ${categories
              .map(
                (cat) => `
              <button class="cat-pill ${this.lexiconCategory === cat ? 'active' : ''}" onclick="window.__GERM_UI__.setLexiconCategory('${cat}')">
                ${cat}
              </button>
            `,
              )
              .join('')}
          </div>
        </div>

        <div class="lexicon-entries-grid">
          ${filtered
            .map(
              (item) => `
            <div class="lex-card">
              <div class="lex-card-top">
                <img src="${item.icon}" class="lex-card-icon" />
                <div>
                  <div class="lex-card-term">${item.term}</div>
                  <div class="lex-card-cat">${item.category}</div>
                </div>
              </div>
              <div class="lex-card-def">${item.definition}</div>
              <div class="lex-card-merksatz">💡 <b>Merksatz:</b> ${item.merksatz}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  public updateLexiconSearch(val: string): void {
    this.lexiconSearch = val;
    this.renderLexiconContent();
  }

  public setLexiconCategory(cat: string): void {
    this.lexiconCategory = cat;
    sound.playClick();
    this.renderLexiconContent();
  }

  // =========================================================================
  // PHASEN-ZEITSTRAHL MODAL (Taste Z)
  // =========================================================================
  public openTimeline(): void {
    this.activeModal = 'timeline';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    const phases = [
      {
        num: 1,
        title: 'Frühe Eisenzeit & Sippenkultur',
        year: 'ca. 50 v. Chr. – 1 v. Chr.',
        desc: 'Autarke Subsistenzwirtschaft in Wohnstallhäusern, Weideviehhaltung, Sippenfrieden und erste Rennöfen.',
      },
      {
        num: 2,
        title: 'Kulturtransfer & Varusschlacht',
        year: 'ca. 1 n. Chr. – 16 n. Chr.',
        desc: 'Fernhandel mit Rom, Gründung von Waldgirmes, gefolgt vom Scheitern der römischen Provinzpläne in Kalkriese.',
      },
      {
        num: 3,
        title: 'Die Hohe Kaiserzeit & der Limes',
        year: 'ca. 100 n. Chr. – 250 n. Chr.',
        desc: 'Befestigte Grenze mit Wachtürmen und Kastelldörfern (Vici). Intensiver ziviler Grenzhandel und Warenaustausch.',
      },
      {
        num: 4,
        title: 'Spätantike & Föderaten',
        year: 'ca. 260 n. Chr. – 350 n. Chr.',
        desc: 'Zusammenschluss zu Großstämmen (Franken, Alamannen), Föderatenverträge mit Rom und Verschmelzung der Kulturen.',
      },
    ];

    this.modalOverlay.innerHTML = `
      <div class="modal-card timeline-modal">
        <div class="modal-header-row">
          <h2>⏳ Zeitstrahl der Germanen-Epoche (10 v. Chr. – 350 n. Chr.)</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>
        <div class="timeline-phases-grid">
          ${phases
            .map(
              (p) => `
            <div class="timeline-phase-card">
              <div class="tp-num">Phase ${p.num}</div>
              <div class="tp-year">${p.year}</div>
              <div class="tp-title">${p.title}</div>
              <div class="tp-desc">${p.desc}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  public formatPlayTime(): string {
    const sec = Math.floor(gameState.playTimeSeconds);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s} Min.`;
  }

  public formatDistance(): string {
    const m = Math.round(gameState.walkedDistanceMeters);
    if (m >= 1000) {
      return `${(m / 1000).toFixed(2).replace('.', ',')} km`;
    }
    return `${m} m`;
  }

  // =========================================================================
  // 7-KACHEL-PAUSE-DASHBOARD (Taste P)
  // =========================================================================
  public openPauseMenu(): void {
    this.activeModal = 'pause';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    const rank = gameState.getMasterRank();
    const code = gameState.generateClassroomCode();

    this.modalOverlay.innerHTML = `
      <div class="modal-card pause-modal">
        <div class="modal-header-row">
          <h2>⏸️ Chronisten-Dashboard (Pause)</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>

        <div class="pause-tiles-grid">
          <!-- KACHEL 1: HEFTER-CODE -->
          <div class="pause-tile code-tile">
            <div class="pt-label">📝 Dein Hefter-Code (Schulheft):</div>
            <div class="pt-code">${code}</div>
            <div class="pt-sub">Diesen Code in dein Geschichtsheft eintragen, um später genau hier weiterzuspielen!</div>
          </div>

          <!-- KACHEL 2: RANG & PUNKTE -->
          <div class="pause-tile rank-tile">
            <div class="pt-label">🏆 Chronisten-Rang:</div>
            <div class="pt-rank-title">${rank.title}</div>
            <div class="pt-badge-rank">${rank.rank}</div>
            <div class="pt-score">${rank.score} / ${rank.maxScore} Epochenpunkte</div>
          </div>

          <!-- KACHEL 3: AUDIO-PLAYER -->
          <div class="pause-tile audio-tile">
            <div class="pt-label">🎵 Musik & Audiokulisse:</div>
            <div class="pt-track">${sound.getChapterTrackInfo(gameState.chapter).title}</div>
            <div class="audio-controls-row">
              <button class="btn-sub" onclick="window.__GERM_UI__.toggleBGM()">${sound.bgmMuted ? '🔇 Stumm' : '🔊 Musik An'}</button>
              <input type="range" min="0" max="1" step="0.05" value="${sound.getVolume()}" onchange="window.__GERM_UI__.setVolume(this.value)" />
            </div>
          </div>

          <!-- KACHEL 4: RELIKTE -->
          <div class="pause-tile">
            <div class="pt-label">🏺 Archäologische Relikte:</div>
            <div class="pt-counter">${gameState.discoveredRelics.size} von 5 geborgen</div>
            <button class="btn-sub" onclick="window.__GERM_UI__.openCertificate()">📜 Urkunde ansehen</button>
          </div>

          <!-- KACHEL 5: LEXIKON -->
          <div class="pause-tile">
            <div class="pt-label">📖 Historisches Lexikon:</div>
            <div class="pt-counter">${gameState.lexiconRead.size} von 27 Begriffen studiert</div>
            <button class="btn-sub" onclick="window.__GERM_UI__.openLexicon()">Begriffe öffnen</button>
          </div>

          <!-- KACHEL 6: BAUWERKE -->
          <div class="pause-tile">
            <div class="pt-label">🏛️ Bauvorhaben:</div>
            <div class="pt-counter">${gameState.builtBuildings.size} von 8 Projekten errichtet</div>
            <button class="btn-sub" onclick="window.__GERM_UI__.openBuildingOverview()">Bauplätze öffnen</button>
          </div>

          <!-- KACHEL 7: GESPIELTE ZEIT -->
          <div class="pause-tile time-tile">
            <div class="pt-label">⏱️ Gespielte Zeit:</div>
            <div class="pt-stat-value">${this.formatPlayTime()}</div>
            <div class="pt-sub">Aktive Erkundungszeit in Germanien</div>
          </div>

          <!-- KACHEL 8: GELAUFENE STRECKE -->
          <div class="pause-tile distance-tile">
            <div class="pt-label">👣 Gelaufene Strecke:</div>
            <div class="pt-stat-value">${this.formatDistance()}</div>
            <div class="pt-sub">Zu Fuß durch Wälder, Moore & Grenzen</div>
          </div>

          <!-- KACHEL 9: STEUERUNG -->
          <div class="pause-tile controls-tile">
            <div class="pt-label">🎮 Tastaturbelegung:</div>
            <div class="pt-controls-list">
              <span><b>WASD / Pfeile</b>: Bewegen</span>
              <span><b>[E]</b>: Interagieren / Ernten</span>
              <span><b>[I]</b>: Beutel & Inventar</span>
              <span><b>[C]</b>: Handwerk & Werkstatt</span>
              <span><b>[Z]</b>: Zeitstrahl</span>
              <span><b>[U]</b>: Chronisten-Urkunde</span>
            </div>
          </div>
        </div>

        <div class="pause-footer">
          <button class="btn-primary" onclick="window.__GERM_UI__.closeModal()">Weiterspielen [ESC]</button>
        </div>
      </div>
    `;
  }

  public toggleBGM(): void {
    sound.toggleBGM();
    this.openPauseMenu();
  }

  public setVolume(val: string): void {
    sound.setVolume(parseFloat(val));
  }

  // =========================================================================
  // URKUNDE / DIPLOM (Taste U)
  // =========================================================================
  public openCertificate(): void {
    this.activeModal = 'certificate';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    const rank = gameState.getMasterRank();
    const dateStr = new Date().toLocaleDateString('de-DE');

    this.modalOverlay.innerHTML = `
      <div class="modal-card certificate-card">
        <div class="cert-border">
          <div class="cert-header">
            <div class="cert-seal">🏛️</div>
            <div class="cert-sub">Heimbürgeschule Kahla · Fachbereich Geschichte</div>
            <h1 class="cert-title">CHRONISTEN-DIPLOM</h1>
            <div class="cert-intro">Hiermit wird feierlich beurkundet, dass</div>
          </div>

          <div class="cert-name">${gameState.playerName}</div>

          <div class="cert-text">
            das historische 16-Bit-Lernabenteuer <b>"DIE GERMANEN – Vom Langhaus zum Limes"</b> mit großem Erfolg durchlaufen und fundiertes Wissen über die germanische Siedlungs-, Rechts-, Glaubens- und Grenzkultur erworben hat.
          </div>

          <div class="cert-rank-box">
            <div class="cr-title">Verliehener Rang:</div>
            <div class="cr-name">${rank.title} (${rank.rank})</div>
            <div class="cr-score">${rank.score} / ${rank.maxScore} Epochenpunkte · ${gameState.discoveredRelics.size}/5 Relikte geborgen</div>
          </div>

          <div class="cert-footer-row">
            <div class="cert-col">
              <div class="cert-line">Datum: ${dateStr}</div>
              <div class="cert-sign">Heimbürgeschule Kahla</div>
            </div>
            <div class="cert-col">
              <div class="cert-line">Hefter-Code: ${gameState.generateClassroomCode()}</div>
              <div class="cert-sign">Fachleiter Geschichte</div>
            </div>
          </div>

          <div class="cert-actions">
            <button class="btn-secondary" onclick="window.print()">🖨️ Urkunde drucken</button>
            <button class="btn-primary" onclick="window.__GERM_UI__.closeModal()">Zurück zum Spiel [ESC]</button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // INVENTORY MODAL (Taste I)
  // =========================================================================
  public openInventory(): void {
    this.activeModal = 'inventory';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    const items = Object.entries(gameState.inventory);

    this.modalOverlay.innerHTML = `
      <div class="modal-card inventory-modal">
        <div class="modal-header-row">
          <h2>🎒 Reisebeutel & Vorräte der Sippe</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>
        <div class="inv-items-grid">
          ${
            items.length === 0
              ? '<div class="inv-empty">Dein Beutel ist leer. Erkunde das Dorf und ernte Rohstoffe!</div>'
              : items
                  .map(([itKey, cnt]) => {
                    const def = GERMAN_ITEMS[itKey as GermanItemId];
                    if (!def) return '';
                    return `
                <div class="inv-slot">
                  <img src="${def.icon}" class="inv-slot-icon" />
                  <div class="inv-slot-name">${def.name}</div>
                  <div class="inv-slot-qty">×${cnt}</div>
                  <div class="inv-slot-desc">${def.desc}</div>
                </div>
              `;
                  })
                  .join('')
          }
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CRAFTING MODAL (Taste C)
  // =========================================================================
  public openCrafting(): void {
    this.activeModal = 'craft';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="modal-card craft-modal">
        <div class="modal-header-row">
          <h2>🔨 Werkstatt & Esse des Schmieds</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>
        <div class="craft-recipes-list">
          ${GERMAN_RECIPES.map((rec) => {
            const def = GERMAN_ITEMS[rec.result];
            const canAfford = gameState.canAfford(rec.ingredients);
            const ingrStr = Object.entries(rec.ingredients)
              .map(([it, n]) => `${n}× ${GERMAN_ITEMS[it as GermanItemId]?.name || it}`)
              .join(', ');

            return `
              <div class="recipe-row">
                <img src="${def?.icon || '/assets/icons/fibel.png'}" class="recipe-icon" />
                <div class="recipe-info">
                  <div class="recipe-name">${rec.name}</div>
                  <div class="recipe-desc">${rec.desc}</div>
                  <div class="recipe-cost">Benötigt: ${ingrStr}</div>
                </div>
                <button class="btn-primary ${canAfford ? '' : 'disabled'}" ${canAfford ? `onclick="window.__GERM_UI__.craftRecipe('${rec.id}')"` : 'disabled'}>
                  Herstellen
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  public craftRecipe(recId: string): void {
    const rec = GERMAN_RECIPES.find((r) => r.id === recId);
    if (!rec) return;

    if (gameState.spend(rec.ingredients)) {
      sound.playCraft();
      gameState.addItem(rec.result, rec.amount);
      gameState.craftedOnce.add(rec.result);

      if (rec.result === 'fibel' && gameState.chapter === 2) {
        gameState.setObjective(2, 3, true);
      }
      this.showNotification(`✨ ${rec.amount}× ${GERMAN_ITEMS[rec.result].name} hergestellt!`);
      this.openCrafting();
    }
  }

  // =========================================================================
  // BUILDING PLOTS MODAL (Taste B)
  // =========================================================================
  public openBuildingOverview(): void {
    this.activeModal = 'build';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="modal-card build-modal">
        <div class="modal-header-row">
          <h2>🏛️ Bauvorhaben & Siedlungsentwicklung</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>
        <div class="build-projects-grid">
          ${GERMAN_BUILDINGS.map((b) => {
            const isBuilt = gameState.builtBuildings.has(b.id);
            const canAfford = gameState.canAfford(b.cost);
            const costStr = Object.entries(b.cost)
              .map(([it, n]) => `${n}× ${GERMAN_ITEMS[it as GermanItemId]?.name || it}`)
              .join(', ');

            return `
              <div class="build-card ${isBuilt ? 'built' : ''}">
                <div class="bc-header">${b.name}</div>
                <div class="bc-helper">Geleitet von: ${b.helperName}</div>
                <div class="bc-desc">${b.desc}</div>
                <div class="bc-cost">${isBuilt ? '✅ Bereits vollendet!' : `Kosten: ${costStr}`}</div>
                ${
                  !isBuilt
                    ? `<button class="btn-primary ${canAfford ? '' : 'disabled'}" ${canAfford ? `onclick="window.__GERM_UI__.buildProject('${b.id}')"` : 'disabled'}>
                        Errichten
                      </button>`
                    : ''
                }
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  public showBuildingModal(buildingId: string): void {
    this.openBuildingOverview();
  }

  public buildProject(bId: string): void {
    const b = GERMAN_BUILDINGS.find((x) => x.id === bId);
    if (!b) return;

    if (gameState.spend(b.cost)) {
      sound.playCraft();
      gameState.builtBuildings.add(b.id);
      this.showNotification(`🏛️ ${b.name} erfolgreich errichtet!`);
      this.openBuildingOverview();
    }
  }

  // =========================================================================
  // TRADING MODAL (Taste T)
  // =========================================================================
  public openTrading(): void {
    this.activeModal = 'trade';
    this.touchControls.setVisible(false);
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="modal-card trade-modal">
        <div class="modal-header-row">
          <h2>⚖️ Fernhandel & Tauschplatz</h2>
          <button class="modal-close-btn" onclick="window.__GERM_UI__.closeModal()">✕</button>
        </div>
        <div class="trade-list">
          ${GERMAN_TRADES.map((t) => {
            const canAfford = gameState.getItemCount(t.cost) >= t.costAmount;
            return `
              <div class="trade-row">
                <div class="trade-info">
                  <div class="trade-partner">${t.partner}</div>
                  <div class="trade-deal">
                    Gibt: <b>${t.offerAmount}× ${GERMAN_ITEMS[t.offer].name}</b> im Tausch gegen <b>${t.costAmount}× ${GERMAN_ITEMS[t.cost].name}</b>
                  </div>
                </div>
                <button class="btn-primary ${canAfford ? '' : 'disabled'}" ${canAfford ? `onclick="window.__GERM_UI__.executeTrade('${t.id}')"` : 'disabled'}>
                  Tauschen
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  public executeTrade(tradeId: string): void {
    const t = GERMAN_TRADES.find((x) => x.id === tradeId);
    if (!t) return;

    if (gameState.removeItem(t.cost, t.costAmount)) {
      sound.playCollect();
      gameState.addItem(t.offer, t.offerAmount);
      if (t.id === 'trade_terra_sigillata' && gameState.chapter === 3) {
        gameState.setObjective(3, 1, true);
      }
      this.showNotification(`✅ Tauschhandel erfolgreich abgeschlossen!`);
      this.openTrading();
    }
  }

  public closeModal(): void {
    this.activeModal = 'none';
    this.modalOverlay.style.display = 'none';
    this.touchControls.setVisible(true);
  }
}
