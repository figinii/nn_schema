import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

export class NnLayerGroup extends LitElement {
  static properties = {
    label: { type: String },
    text: { type: String },
    showConnector: { type: Boolean, attribute: 'show-connector' },
    columns: { type: Number },
  };

  constructor() {
    super();
    this.text = '';
    this.showConnector = false;
    this.columns = 0;
  }

  static styles = css`
    :host { display: block; }

    .connector-row {
      display: flex;
      align-items: stretch;
    }
    .connector-line-wrap {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .connector {
      width: 0.5px;
      height: 24px;
      background: var(--color-border-secondary, #ccc);
    }
    .group-row {
      display: block;
    }
    .group-label {
      font-size: 10px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--color-text-tertiary, #9e9e9e);
      font-family: var(--font-sans, sans-serif);
    }
    .group-text {
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-tertiary, #9e9e9e);
      font-family: var(--font-sans, sans-serif);
      position: absolute;
      top: 10px;
      right: 12px;
      line-height: 1;
    }
    .group-head {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 6px;
      padding-left: 2px;
      padding-right: 56px;
    }
    .group-wrap {
      position: relative;
      border: 0.5px dashed var(--color-border-secondary, #ccc);
      border-radius: var(--border-radius-lg, 12px);
      padding: 10px;
      background: var(--color-background-subtle, #fafaf9);
    }
    .group-inner {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
      align-items: stretch;
    }
    ::slotted(nn-layer) {
      flex: 1 1 220px;
      min-width: min(100%, 220px);
      max-width: 100%;
    }
    :host([columns]) ::slotted(nn-layer) {
      flex-basis: 0;
      min-width: 0;
      max-width: none;
    }
  `;

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('columns')) {
      const cols = Number(this.columns);
      const safeCols = Number.isFinite(cols) && cols > 0 ? Math.floor(cols) : 0;
      if (safeCols > 0) {
        this.style.setProperty('--nn-layer-group-columns', `${safeCols}`);
        this.style.setProperty('--nn-layer-group-span', `calc((100% - (var(--nn-layer-group-columns) - 1) * 8px) / var(--nn-layer-group-columns))`);
      } else {
        this.style.removeProperty('--nn-layer-group-columns');
        this.style.removeProperty('--nn-layer-group-span');
      }
      this._onSlotChange();
    }
  }

  render() {
    return html`
      ${this.showConnector
        ? html`
            <div class="connector-row" aria-hidden="true">
              <div class="connector-line-wrap">
                <div class="connector"></div>
              </div>
            </div>
          `
        : nothing}
      <div class="group-row">
        <div class="group-wrap">
          ${this.label || this.text
            ? html`
                <div class="group-head">
                  ${this.label
                    ? html`<div class="group-label">${this.label}</div>`
                    : html`<span></span>`}
                  ${this.text
                    ? html`<div class="group-text">${this.text}</div>`
                    : nothing}
                </div>
              `
            : nothing}
          <div class="group-inner">
            <slot @slotchange=${this._onSlotChange}></slot>
          </div>
        </div>
      </div>
    `;
  }

  _onSlotChange() {
    const slot = this.shadowRoot.querySelector('slot');
    if (!slot) return;
    const cols = Number(this.columns);
    const hasColumns = Number.isFinite(cols) && cols > 0;

    slot.assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'NN-LAYER')
      .forEach((el) => {
        el.compact = true;
        el.showConnector = false;
        el.style.flex = hasColumns
          ? `0 0 var(--nn-layer-group-span)`
          : '';
      });
  }
}

if (!customElements.get('nn-layer-group')) {
  customElements.define('nn-layer-group', NnLayerGroup);
}
