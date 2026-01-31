import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import { TWStyles } from "../styles/mimic.css.js";
import { debug } from "../State";

export class BuildVersion extends LitElement {
  static styles = [css``, TWStyles];

  @property({ reflect: true }) cmdversion = "";
  @property({ reflect: true }) webversion = "";
  @property({ reflect: true }) apiurl = "";
  @state() small = true;

  toggleSize() {
    console.log("toggle size called");
    this.small = !this.small;
  }

  toggleDebug() {
    debug.set(!debug.get());
    this.requestUpdate();
  }

  buildsMatch() {
    return this.cmdversion === this.webversion;
  }

  render() {
    return html`
      <div
        class="border-radius:lg display:flex gap:10px flex-direction:row justify-content:space-between align-items:center user-select:none"
        style="color:white;margin-bottom:5px"
      >
        ${this.small ? html`<div>Setup</div>` : html``}
        <div @click="${this.toggleSize}" style="cursor: pointer">
          ${
            !this.small
              ? html`<span style="font-size:16px">&#9660;</span>` // down chevron
              : html`<span style="font-size:16px">&#9650;</span>` // up chevron
          }
        </div>
      </div>
      ${this.small
        ? html``
        : html` <div class="font-size:sm padding:sm">${this.apiurl}</div>

            <div
              class="display:flex flex-direction:row align-items:center gap:10px padding:sm"
            >
              <button
                @click="${this.toggleDebug}"
                class="padding:sm  cursor:pointer"
                style="${debug.get()
                  ? "background:red;color:white;font-weight:bold;"
                  : "background:green;color:white;"}"
              >
                Debug Mode: ${debug.get() ? "ON ⚠️" : "OFF"}
              </button>
              ${debug.get()
                ? html`<span style="color:red;font-weight:bold;font-size:sm;">
                    WARNING: Debug data is being used - not live data.
                  </span>`
                : html``}
            </div>

            <div
              class="${this.buildsMatch()
                ? "background:darkgreen"
                : "background:red"}"
            >
              <div
                class="display:flex ${this.buildsMatch()
                  ? "background:darkgreen"
                  : ""} flex-direction:row justify-content:space-between align-items:center"
              >
                ${this.buildsMatch()
                  ? html`<div>Builds match Great!</div>`
                  : html`<div class="background:red">
                      Please download latest cli version
                    </div>`}
                <div
                  class="display:flex  flex-direction:column text-align:right font-size:sm padding:sm"
                >
                  <div>cli build version: ${this.cmdversion}</div>
                  <div>web build version: ${this.webversion}</div>
                </div>
              </div>
            </div>`}
    `;
  }
}

customElements.define("build-version", BuildVersion);
