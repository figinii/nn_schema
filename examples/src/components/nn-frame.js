import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12/+esm';

export class NnFrame extends LitElement {
  static properties = {
    totalParams: { type: String, attribute: 'total-params' },
    sizeLabel: { type: String, attribute: 'size-label' },
    outputDims: { type: String, attribute: 'output-dims' },
    _sel: { state: true },
  };

  constructor() {
    super();
    this._sel = null;
    this._layers = [];
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--font-sans, sans-serif);
      background: var(--color-background-primary, #fff);
      border: 0.5px solid var(--color-border-tertiary, #e6e6e6);
      border-radius: var(--border-radius-lg, 12px);
      padding: 0;
    }

    .frame-inner {
      padding: 2.5rem 2.75rem 2.75rem;
    }

    .header {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 0.9rem;
      border-bottom: 0.5px solid var(--color-border-tertiary, #e6e6e6);
      margin-bottom: 1.25rem;
      font-size: 13px;
    }
    .header span { color: var(--color-text-secondary, #5c5c5c); }
    .header strong { color: var(--color-text-primary, #1a1a1a); font-weight: 500; }
    .body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
      gap: 2.25rem;
      align-items: start;
      padding-top: 0.9rem;
    }

    .layer-list {
      display: flex;
      flex-direction: column;
      padding-right: 0.75rem;
    }

    .detail-panel {
      position: sticky;
      top: 1rem;
      align-self: start;
      border: 0.5px solid var(--color-border-tertiary, #e6e6e6);
      border-radius: var(--border-radius-lg, 12px);
      padding: 1.5rem;
      background: var(--color-background-primary, #fff);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: fit-content;
    }

    .dp-title {
      font-size: 26px;
      font-weight: 400;
      font-family: var(--font-serif, Georgia, serif);
      color: var(--color-text-primary, #1a1a1a);
      line-height: 1.15;
    }

    .label-row {
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }
    .detail-tag {
      font-size: 10px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--color-text-tertiary, #9e9e9e);
      min-width: 60px;
      flex-shrink: 0;
      font-family: var(--font-sans, sans-serif);
    }
    .detail-val {
      font-size: 12px;
      color: var(--color-text-primary, #1a1a1a);
      font-family: var(--font-mono, monospace);
      line-height: 1.6;
    }

    .desc {
      font-size: 13.5px;
      color: var(--color-text-secondary, #5c5c5c);
      line-height: 1.75;
      border-top: 0.5px solid var(--color-border-tertiary, #e6e6e6);
      padding-top: 0.9rem;
    }
    .desc p { margin: 0 0 0.5em; }
    .desc p:last-child { margin-bottom: 0; }
    .desc strong {
      color: var(--color-text-primary, #1a1a1a);
      font-weight: 500;
    }
    .desc em { font-style: italic; }
    .desc code {
      font-family: var(--font-mono, monospace);
      font-size: 11.5px;
      background: var(--color-border-tertiary, #e6e6e6);
      padding: 1px 5px;
      border-radius: 3px;
      color: var(--color-text-primary, #1a1a1a);
    }
    .desc ul { padding-left: 1.2em; margin: 0.4em 0; }
    .desc li { margin-bottom: 0.25em; }
    .code-block {
      margin: 0;
      padding: 0.9rem 1rem;
      border-radius: var(--border-radius-md, 7px);
      background: var(--color-background-subtle, #fafaf9);
      border: 0.5px solid var(--color-border-tertiary, #e6e6e6);
      color: var(--color-text-primary, #1a1a1a);
      font-family: var(--font-mono, monospace);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-x: auto;
    }

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary, #9e9e9e);
      font-size: 13px;
    }

    @media (max-width: 680px) {
      .frame-inner {
        padding: 1.5rem;
      }
      .body { grid-template-columns: 1fr; }
      .detail-panel { position: static; height: auto; }
      .layer-list { padding-right: 0; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('nn-select', this._onSelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('nn-select', this._onSelect);
  }

  _onSelect = (e) => {
    const layer = e.detail.layer;
    this._layers.forEach((l) => { l.selected = false; });
    layer.selected = true;
    this._sel = layer;
  };

  _onSlotChange = () => {
    this._setup();
  };

  _setup() {
    const slot = this.shadowRoot.querySelector('slot.layer-slot');
    if (!slot) return;

    const topLevel = slot.assignedElements({ flatten: true });

    const collectLayers = (elements) => {
      const acc = [];
      for (const el of elements) {
        if (el.tagName === 'NN-LAYER') {
          acc.push(el);
        } else if (el.tagName === 'NN-LAYER-GROUP') {
          const gSlot = el.shadowRoot?.querySelector('slot');
          if (gSlot) {
            acc.push(...collectLayers(gSlot.assignedElements({ flatten: true })));
          }
        }
      }
      return acc;
    };

    this._layers = collectLayers(topLevel);

    topLevel.forEach((el, i) => {
      if (el.tagName === 'NN-LAYER' || el.tagName === 'NN-LAYER-GROUP') {
        el.showConnector = i > 0;
      }
    });

    if (this._layers.length > 0 && !this._sel) {
      const first = this._layers[0];
      first.selected = true;
      this._sel = first;
    }
  }

  _renderDetail() {
    const l = this._sel;
    if (!l) return html`<div class="empty-state">Select a layer to see details</div>`;

    const descMd = l.description
      ? unsafeHTML(marked.parse(l.description ?? ''))
      : nothing;

    return html`
      <div class="dp-title">${l.name}</div>

      <div class="label-row">
        <span class="detail-tag">OUTPUT</span>
        <span class="detail-val">${l.outDims ?? '—'}</span>
      </div>

      ${l.description ? html`<div class="desc">${descMd}</div>` : nothing}

      ${l.code ? html`<pre class="code-block"><code>${l.code}</code></pre>` : nothing}
    `;
  }

  render() {
    const showHeader = Boolean(this.totalParams || this.sizeLabel || this.outputDims);

    return html`
      <div class="frame-inner">
        ${showHeader ? html`
          <div class="header">
            ${this.totalParams
              ? html`<div><strong>${this.totalParams}</strong> <span>params</span></div>`
              : nothing}
            ${this.sizeLabel
              ? html`<div><span>${this.sizeLabel}</span></div>`
              : nothing}
            ${this.outputDims
              ? html`<div><span>output</span> <strong>${this.outputDims}</strong></div>`
              : nothing}
          </div>
        ` : nothing}

        <div class="body">
          <div class="layer-list">
            <slot class="layer-slot" @slotchange=${this._onSlotChange}></slot>
          </div>
          <div class="detail-panel">
            ${this._renderDetail()}
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('nn-frame')) {
  customElements.define('nn-frame', NnFrame);
}
