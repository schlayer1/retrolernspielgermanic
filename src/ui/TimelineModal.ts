export interface TimelinePhase {
  phaseName: string;
  timeRange: string;
  keyEvents: string[];
  characteristicTech: string;
  isCurrent?: boolean;
}

export class TimelineModal {
  private overlay: HTMLElement | null = null;

  public open(epochTitle: string, phases: TimelinePhase[], onClose?: () => void): void {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'timeline-modal';
      this.overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(14, 10, 8, 0.88);
        backdrop-filter: blur(5px); z-index: 3500; display: flex;
        align-items: center; justify-content: center; padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(this.overlay);
    }

    const phasesHtml = phases
      .map(
        (p, idx) => `
      <div style="flex: 1; min-width: 190px; background: ${p.isCurrent ? '#3b2514' : '#1e140d'}; border: 2px solid ${p.isCurrent ? '#f59e0b' : '#573d26'}; border-radius: 8px; padding: 14px; position: relative;">
        ${p.isCurrent ? '<div style="position: absolute; top: -10px; right: 10px; background: #b45309; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 3px;">AKTUELLE EPOCHE</div>' : ''}
        <div style="font-size: 11px; text-transform: uppercase; color: #d4af37; font-weight: bold;">Phase ${idx + 1}</div>
        <h4 style="margin: 4px 0 2px; font-size: 15px; color: ${p.isCurrent ? '#fbbf24' : '#fff'};">${p.phaseName}</h4>
        <div style="font-size: 12px; color: #fde68a; margin-bottom: 10px; font-family: monospace;">${p.timeRange}</div>
        <div style="font-size: 12px; color: #d1d5db; margin-bottom: 8px;"><strong>Leittechnologie:</strong> ${p.characteristicTech}</div>
        <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #e5e7eb; line-height: 1.45;">
          ${p.keyEvents.map((e) => `<li>${e}</li>`).join('')}
        </ul>
      </div>
    `
      )
      .join('');

    this.overlay.innerHTML = `
      <div style="background: #23160e; border: 2px solid #b45309; border-radius: 10px; max-width: 780px; width: 100%; color: #fef3c7; box-shadow: 0 15px 35px rgba(0,0,0,0.9); overflow: hidden; display: flex; flex-direction: column;">
        <div style="background: #341f14; padding: 14px 20px; border-bottom: 1px solid #78350f; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #fbbf24; letter-spacing: 1px;">Historischer Zeitstrahl & Phasenvergleich (Taste Z)</div>
            <h3 style="margin: 2px 0 0; font-size: 17px; color: #fff;">${epochTitle}</h3>
          </div>
          <button id="timeline-close-btn" style="background: #4a2d1a; border: 1px solid #92400e; color: #fde68a; padding: 4px 10px; border-radius: 4px; cursor: pointer;">✕ Schließen</button>
        </div>

        <div style="padding: 20px; display: flex; flex-wrap: wrap; gap: 14px; background: #180f09;">
          ${phasesHtml}
        </div>
      </div>
    `;

    this.overlay.querySelector('#timeline-close-btn')?.addEventListener('click', () => {
      this.close();
      if (onClose) onClose();
    });
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
