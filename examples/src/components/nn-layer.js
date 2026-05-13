import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

export class NnLayer extends LitElement {
  static properties = {
    name: { type: String },
    outDims: { type: String, attribute: 'out_dims' },
    code: { type: String },
    description: { type: String },
    selected: { type: Boolean, reflect: true },
    showConnector: { type: Boolean, attribute: 'show-connector' },
    compact: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.outDims = '';
    this.code = '';
    this.selected = false;
    this.showConnector = false;
    this.compact = false;
  }

  static styles = css`
    :host { display: block; }

    .connector-row {
      display: flex;
      gap: 8px;
      align-items: stretch;
    }
    .connector-spacer { min-width: 56px; }
    .connector-line-wrap {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .connector-line {
      width: 0.5px;
      height: 24px;
      background: var(--color-border-secondary, #ccc);
    }

    .card {
      display: block;
      min-width: 0;
      border: 0.5px solid var(--color-border-tertiary, #e6e6e6);
      border-radius: var(--border-radius-md, 7px);
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      background: var(--color-background-primary, #fff);
      user-select: none;
    }
    .card:hover { border-color: var(--color-border-primary, #888); }
    :host([selected]) .card {
      border: 1.5px solid var(--accent, #C84B30);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #C84B30) 8%, transparent);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      margin-bottom: 8px;
      gap: 8px;
    }
    .layer-name {
      flex: 1 1 120px;
      min-width: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-primary, #1a1a1a);
      font-family: var(--font-serif, Georgia, serif);
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .layer-dims {
      flex: 1 1 140px;
      min-width: 0;
      font-size: 11px;
      color: var(--color-text-secondary, #5c5c5c);
      font-family: var(--font-mono, monospace);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host([compact]) .card {
      padding: 0.65rem 0.8rem;
    }
    :host([compact]) .layer-name {
      font-size: 14px;
    }
    :host([compact]) .layer-dims {
      font-size: 10px;
    }
  `;

  _click() {
    this.dispatchEvent(new CustomEvent('nn-select', {
      bubbles: true,
      composed: true,
      detail: { layer: this },
    }));
  }

  render() {
    return html`
      ${this.showConnector ? html`
        <div class="connector-row" aria-hidden="true">
          <div class="connector-line-wrap">
            <div class="connector-line"></div>
          </div>
        </div>` : nothing}

      <div class="card"
            role="button"
            tabindex="0"
            aria-pressed="${this.selected}"
            @click=${this._click}
            @keydown=${(e) => e.key === 'Enter' && this._click()}>
        <div class="card-top">
          <span class="layer-name">${this.name}</span>
          <span class="layer-dims">${this.outDims}</span>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('nn-layer')) {
  customElements.define('nn-layer', NnLayer);
}
