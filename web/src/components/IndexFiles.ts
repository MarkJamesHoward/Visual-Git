import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import { TWStyles } from "../styles/mimic.css.js";

export class IndexFiles extends LitElement {
  static styles = [css``, TWStyles];

  @property() title = "title";
  @state() small = false;
  @property({ reflect: true }) src = "";

  toggleSize() {
    console.log("toggle size called");
    this.small = !this.small;
  }

  render() {
    return html`
      <div>
        <div
          class="user-select:none"
          style="color:white;margin-bottom:5px; gap:10px; display:flex; justify-content:space-between"
        >
          <div>${this.title.toUpperCase()}</div>
          <div @click="${this.toggleSize}" style="cursor: pointer;color:blue">
            ${
              this.small
                ? html`<span style="font-size:16px">&#9660;</span>` // down chevron
                : html`<span style="font-size:16px">&#9650;</span>` // up chevron
            }
          </div>
        </div>
      </div>

      ${this.src != ""
        ? JSON.parse(this.src).map(
            (file: any) =>
              html` <div
                class="whitespace-nowrap user-select:none"
                style="${this.small == true
                  ? "height:0px;overflow:hidden"
                  : ""}"
              >
                <div style="color:white">${file.filename} ${file.hash}</div>
                <div>
                  <textarea style="overflow:hidden">${file.contents}</textarea>
                </div>
              </div>`
          )
        : ""}
    `;
  }
}

customElements.define("index-files", IndexFiles);
