// Frostbite Toybox HUD: expedition tags and field-manual controls frame, never cover, the arena.
import type { PlayerConfig, PlayerId } from "./types";

export interface HudActions {
  start(): void;
  restart(): void;
  togglePause(): void;
  toggleMute(): boolean;
  unlockAudio(): void;
}

const emblem = `
  <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">
    <path d="M12 17.5 28 9l16 8.5v21L28 47 12 38.5Z" fill="#FF6B5E"/>
    <path d="M18 22h20v16H18z" fill="#FFF8E8"/>
    <path d="M22 28c0-4.6 2.5-7 6-7s6 2.4 6 7v6H22Z" fill="#152033"/>
    <circle cx="25.5" cy="27" r="1.2" fill="#FFF8E8"/><circle cx="30.5" cy="27" r="1.2" fill="#FFF8E8"/>
    <path d="m28 29 3 2.2-3 2.1-3-2.1Z" fill="#F59A45"/>
  </svg>`;

export class HudController {
  private readonly root: HTMLDivElement;
  private readonly scoreEls = new Map<PlayerId, HTMLElement>();
  private readonly timer: HTMLElement;
  private readonly modal: HTMLElement;
  private readonly modalEyebrow: HTMLElement;
  private readonly modalTitle: HTMLElement;
  private readonly modalCopy: HTMLElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly notice: HTMLElement;
  private readonly manual: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly muteButton: HTMLButtonElement;
  private countdownTimer: number | null = null;

  constructor(players: PlayerConfig[]) {
    this.root = document.createElement("div");
    this.root.className = "ppw-hud";
    this.root.innerHTML = `
      <header class="ppw-topbar">
        <div class="ppw-brand" aria-label="Pudhy Penguin Wars">${emblem}<div><span>PUDHY</span><strong>PENGUIN WARS</strong></div></div>
        <div class="ppw-tools">
          <button class="ppw-tool" data-action="manual" type="button">FIELD MANUAL <kbd>M</kbd></button>
          <button class="ppw-tool ppw-sound" data-action="sound" type="button" aria-label="Toggle game sound">SOUND ON</button>
          <button class="ppw-tool" data-action="pause" type="button">PAUSE <kbd>P</kbd></button>
        </div>
      </header>
      <section class="ppw-scorebar" aria-label="Player scores">
        ${players
          .map(
            (player) => `<article class="ppw-player-card" data-player="${player.id}" style="--player:${player.color};--pale:${player.pale}">
              <span class="ppw-player-dot"></span><span class="ppw-player-name">${player.name}</span><strong>0</strong>
            </article>`,
          )
          .join("")}
      </section>
      <div class="ppw-clock"><span>CRATE CLOCK</span><strong>1:15</strong></div>
      <div class="ppw-notice" aria-live="polite"></div>
      <aside class="ppw-manual" aria-label="Control guide">
        <div class="ppw-manual-head"><span>EXPEDITION FIELD MANUAL</span><button data-action="manual" type="button" aria-label="Close controls">×</button></div>
        <p>Hold the fish crate alone to earn score pips. Land on a rival to give them a snow day.</p>
        <div class="ppw-controls">
          ${players
            .map(
              (player) => `<div class="ppw-control-row" style="--player:${player.color}"><i></i><b>${player.name}</b><span>${player.shortKeys}</span></div>`,
            )
            .join("")}
        </div>
        <small><b>Jump:</b> top key &nbsp; <b>Drop:</b> bottom key &nbsp; <b>Move:</b> left / right</small>
      </aside>
      <section class="ppw-modal is-visible">
        <div class="ppw-modal-crest">${emblem}</div>
        <p class="ppw-modal-eyebrow">LOCAL EXPEDITION // 1–4 PLAYERS</p>
        <h1 class="ppw-modal-title">Claim the ice.<br/><em>Guard the snacks.</em></h1>
        <p class="ppw-modal-copy">Hold the crate. Bounce rivals. Make the snow fly.</p>
        <button class="ppw-primary" data-action="start" type="button">START A SCRAMBLE <span>↗</span></button>
        <p class="ppw-key-hint">or press any mapped movement key</p>
      </section>
      <div class="ppw-countdown" aria-live="assertive"></div>
    `;
    document.body.appendChild(this.root);
    this.timer = this.require(".ppw-clock strong");
    this.modal = this.require(".ppw-modal");
    this.modalEyebrow = this.require(".ppw-modal-eyebrow");
    this.modalTitle = this.require(".ppw-modal-title");
    this.modalCopy = this.require(".ppw-modal-copy");
    this.primaryButton = this.require(".ppw-primary");
    this.notice = this.require(".ppw-notice");
    this.manual = this.require(".ppw-manual");
    this.pauseButton = this.require('[data-action="pause"]');
    this.muteButton = this.require(".ppw-sound");
    players.forEach((player) => {
      this.scoreEls.set(player.id, this.require(`[data-player="${player.id}"] strong`));
    });
  }

  bind(actions: HudActions) {
    this.root.querySelectorAll<HTMLElement>('[data-action="manual"]').forEach((button) => {
      button.onclick = () => {
        actions.unlockAudio();
        this.manual.classList.toggle("is-open");
      };
    });
    this.primaryButton.onclick = () => {
      actions.unlockAudio();
      actions.start();
    };
    this.pauseButton.onclick = () => {
      actions.unlockAudio();
      actions.togglePause();
    };
    this.muteButton.onclick = () => {
      actions.unlockAudio();
      this.muteButton.textContent = actions.toggleMute() ? "SOUND OFF" : "SOUND ON";
    };
  }

  updateScore(playerId: PlayerId, score: number) {
    const entry = this.scoreEls.get(playerId);
    if (!entry) return;
    entry.textContent = String(score);
    entry.parentElement?.classList.remove("is-scoring");
    void entry.parentElement?.clientWidth;
    entry.parentElement?.classList.add("is-scoring");
  }

  setTimer(seconds: number) {
    const safe = Math.max(0, Math.ceil(seconds));
    this.timer.textContent = `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
  }

  showTitle() {
    this.modalEyebrow.textContent = "LOCAL EXPEDITION // 1–4 PLAYERS";
    this.modalTitle.innerHTML = "Claim the ice.<br/><em>Guard the snacks.</em>";
    this.modalCopy.textContent = "Hold the crate. Bounce rivals. Make the snow fly.";
    this.primaryButton.innerHTML = "START A SCRAMBLE <span>↗</span>";
    this.modal.classList.add("is-visible");
    this.pauseButton.textContent = "PAUSE P";
  }

  showCountdown(value: number) {
    this.modal.classList.remove("is-visible");
    const target = this.require(".ppw-countdown");
    target.textContent = value > 0 ? String(value) : "SCRAMBLE!";
    target.classList.remove("is-popping");
    void target.clientWidth;
    target.classList.add("is-popping");
    if (this.countdownTimer) window.clearTimeout(this.countdownTimer);
    this.countdownTimer = window.setTimeout(() => {
      target.textContent = "";
    }, 520);
  }

  showResult(name: string, score: number, isTie: boolean) {
    this.modalEyebrow.textContent = isTie ? "THE CRATE STAYS SPLIT" : "EXPEDITION CHAMPION";
    this.modalTitle.innerHTML = isTie ? "A snowy<br/><em>dead heat.</em>" : `${name} claims<br/><em>the crate.</em>`;
    this.modalCopy.textContent = isTie ? "No beak budged. Run it back?" : `${score} crate pips — the snacks are officially guarded.`;
    this.primaryButton.innerHTML = "RUN IT BACK <span>↻</span>";
    this.primaryButton.onclick = null;
    this.modal.classList.add("is-visible");
  }

  setResultAction(restart: () => void) {
    this.primaryButton.onclick = restart;
  }

  setPaused(paused: boolean) {
    this.pauseButton.textContent = paused ? "RESUME P" : "PAUSE P";
    this.notice.textContent = paused ? "THE ICE IS HOLDING ITS BREATH" : "";
    this.notice.classList.toggle("is-visible", paused);
  }

  showNotice(copy: string) {
    this.notice.textContent = copy;
    this.notice.classList.add("is-visible");
    window.setTimeout(() => this.notice.classList.remove("is-visible"), 1200);
  }

  hideModal() {
    this.modal.classList.remove("is-visible");
  }

  dispose() {
    if (this.countdownTimer) window.clearTimeout(this.countdownTimer);
    this.root.remove();
  }

  private require<T extends HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`HUD element missing: ${selector}`);
    return element;
  }
}
