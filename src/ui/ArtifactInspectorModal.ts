import { GermanRelic } from '../data/relics';
import { sound } from '../audio/sound';

export class ArtifactInspectorModal {
  private overlay: HTMLElement | null = null;
  private isBackSide = false;
  private isZoomed = false;

  public open(relic: GermanRelic, onClose?: () => void): void {
    this.isBackSide = false;
    this.isZoomed = false;

    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'artifact-inspector-modal';
      this.overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(12, 8, 6, 0.88);
        backdrop-filter: blur(6px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: 'Cinzel', Georgia, system-ui, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    const render = () => {
      if (!this.overlay) return;
      const displayTitle = relic.name || 'Archäologisches Relikt';
      const iconUrl = relic.icon || '/assets/icons/relic_marker_glow.png';
      const dating = relic.year || 'ca. 1. Jh. v. Chr. – 1. Jh. n. Chr.';
      const location = relic.findLocation || 'Freies Germanien';
      const context = relic.historicalContext || '';
      const significance = relic.significance || '';

      this.overlay.innerHTML = `
        <div style="background: linear-gradient(145deg, #24160e, #140d08); border: 2px solid #d4af37; border-radius: 12px; max-width: 660px; width: 100%; color: #fef3c7; box-shadow: 0 20px 50px rgba(0,0,0,0.85); overflow: hidden;">
          <div style="background: rgba(212, 175, 55, 0.18); padding: 14px 20px; border-bottom: 1px solid rgba(212, 175, 55, 0.4); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b; font-weight: bold;">🔍 Archäologischer 360°-Quelleninspektor</div>
              <div style="font-size: 17px; font-weight: bold; color: #fff; margin-top: 2px;">${displayTitle}</div>
            </div>
            <button id="relic-close-btn" style="background: transparent; border: none; color: #f59e0b; font-size: 24px; cursor: pointer; padding: 0 8px;">✕</button>
          </div>

          <div style="padding: 20px; max-height: 72vh; overflow-y: auto; font-family: 'Inter', system-ui, sans-serif;">
            <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; background: rgba(0,0,0,0.35); padding: 16px; border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.25);">
              <div style="flex-shrink: 0; text-align: center;">
                <div style="width: 100px; height: 100px; background: radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(0,0,0,0.7) 70%); border: 2px solid #d4af37; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: transform 0.4s ease; transform: ${this.isBackSide ? 'rotateY(180deg)' : 'rotateY(0)'} scale(${this.isZoomed ? '1.4' : '1.0'});">
                  <img src="${iconUrl}" alt="${displayTitle}" style="width: 70px; height: 70px; object-fit: contain; image-rendering: pixelated;" />
                </div>
                <div style="font-size: 10px; color: #fbbf24; margin-top: 6px; font-weight: 600;">
                  ${this.isBackSide ? 'Rückseite (Gussnaht)' : 'Vorderseite (Patina)'}
                </div>
              </div>

              <div style="flex-grow: 1;">
                <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                  <button id="relic-flip-btn" style="background: #3b2313; border: 1px solid #d4af37; color: #fde68a; font-size: 11px; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    🔄 Relikt um 180° drehen
                  </button>
                  <button id="relic-zoom-btn" style="background: #3b2313; border: 1px solid #d4af37; color: #fde68a; font-size: 11px; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ${this.isZoomed ? '🔍 1.0x Normal' : '🔍 2.0x Lupe'}
                  </button>
                </div>
                <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 4px;"><strong>Epoche:</strong> ${relic.epoch}</div>
                <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 4px;"><strong>Datierung:</strong> ${dating}</div>
                <div style="font-size: 12px; color: #cbd5e1;"><strong>Fundort:</strong> ${location}</div>
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <div style="font-size: 12px; font-weight: bold; color: #fde68a; margin-bottom: 4px; text-transform: uppercase;">Befund & Historischer Kontext</div>
              <div style="font-size: 13px; color: #e2e8f0; line-height: 1.55; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px; border-left: 3px solid #d4af37;">
                ${context}
              </div>
            </div>

            <div style="margin-bottom: 18px;">
              <div style="font-size: 12px; font-weight: bold; color: #a7f3d0; margin-bottom: 4px; text-transform: uppercase;">Archäologische Tragweite</div>
              <div style="font-size: 13px; color: #d1fae5; line-height: 1.5; background: rgba(16, 185, 129, 0.12); padding: 12px; border-radius: 6px; border: 1px solid #059669;">
                ✓ ${significance}
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button id="relic-done-btn" style="background: linear-gradient(135deg, #d4af37, #b45309); border: none; color: #1e130c; padding: 9px 20px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 13px;">
                Untersuchung im Hefter vermerken ✓
              </button>
            </div>
          </div>
        </div>
      `;

      this.overlay.querySelector('#relic-close-btn')?.addEventListener('click', () => {
        this.close();
        if (onClose) onClose();
      });

      this.overlay.querySelector('#relic-done-btn')?.addEventListener('click', () => {
        sound.playFanfare();
        this.close();
        if (onClose) onClose();
      });

      this.overlay.querySelector('#relic-flip-btn')?.addEventListener('click', () => {
        this.isBackSide = !this.isBackSide;
        sound.playClick();
        render();
      });

      this.overlay.querySelector('#relic-zoom-btn')?.addEventListener('click', () => {
        this.isZoomed = !this.isZoomed;
        sound.playClick();
        render();
      });
    };

    render();
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
