import { LitElement, html, css } from "lit";
import { TWStyles } from "../styles/mimic.css.js";

export class Header extends LitElement {
  static styles = [css``, TWStyles];

  static get properties() {
    return {
      title: { type: String },
      burgerVisible: { type: Boolean },
    };
  }

  _handleClick(e) {
    if (this.burgerVisible) {
      this.burgerVisible = false;
      this.shadowRoot.querySelector("#navBarVertical").style.display = "none";
    } else {
      this.burgerVisible = true;
      this.shadowRoot.querySelector("#navBarVertical").style.display = "block";
    }
  }

  render() {
    return html`
      <header
        class="color:c1text1 titleFont font-size:md background-color:c1background3"
      >
        <div
          class="display:flex width:100% flex-direction:row justify-items:space-between lg?justify-items:stretch"
        >
          <div>
            <div
              @click="${this._handleClick}"
              id="burger"
              class="position:relative display:block cursor:pointer lg?display:none height:14px width:35px display:flex flex-direction:column justify-content:space-between margin:md flex-shrink:0"
            >
              <div
                class="border-bottom-width:1px border-bottom-style:solid border-bottom-color:pink flex-grow:1 height:100%"
              ></div>
              <div
                class="border-bottom-width:1px border-bottom-style:solid border-bottom-color:pink flex-grow:1 height:100%"
              ></div>
              <div
                class="border-bottom-width:1px border-bottom-style:solid border-bottom-color:pink flex-grow:1 height:100%"
              ></div>
            </div>
            <nav
              id="navBarVertical"
              style="display:none;transition-name:navBar;position:absolute;top:50px"
              class="font-size:md background:black padding:md"
            >
              <div
                class="justify-content:space-around color:c1text1 text-decoration:none list-style:none display:flex flex-direction:column"
              >
                <div class="margin-left:sm color:c1text1 margin-bottom:sm">
                  <a
                    class="color:c1text2 color:c1background2:hover text-decoration:none"
                    href="/download/"
                    >Download</a
                  >
                </div>
                <div class="margin-left:sm color:c1text1 margin-bottom:sm">
                  <a
                    class="color:c1text2 color:c1background2:hover text-decoration:none"
                    href="/tutorials/"
                    >Tutorials</a
                  >
                </div>
                <div class="margin-left:sm color:c1text1 margin-bottom:sm">
                  <a
                    class="color:c1text2 color:c1background2:hover text-decoration:none"
                    href="/implementation/"
                    >Implementation</a
                  >
                </div>
                <div class="margin-left:sm color:c1text1 margin-bottom:sm">
                  <a
                    class="color:c1text2 color:c1background2:hover text-decoration:none"
                    href="/usinglivevisualisation/"
                    >Learn</a
                  >
                </div>
              </div>
            </nav>
          </div>
          <a
            class="color:c1text1 display:flex flex-direction:row width:100% align-items:stretch justify-self:center text-decoration:none flex-grow:1"
            href="/"
          >
            <div
              class="display:none lg?display:block align-self:center padding-right:10px padding-left:10px"
            >
              <img
                style="object-fit:contain"
                src="/Favicon 64x64.png"
                alt="VisualGit Logo"
              />
            </div>
            <div
              class="display:flex flex-direction:column  justify-content:center font-weight:md padding:0px margin:0px overflow-wrap:break-word flex-grow:1 lg?flex-grow:0 user-select:none text-align:center font-size:lg sm?font-size:xl color:c5text2"
            >
              VisualGit
            </div>
          </a>

          <nav
            id="navBarHorizontal"
            class="padding:sm width:100% display:none lg?display:block"
          >
            <ul
              class="justify-content:space-around color:c1text1 text-decoration:none font-size:lg list-style:none display:flex flex-direction:row"
            >
              <li class="margin-left:sm color:c1text2">
                <a
                  class="color:c1text2 text-decoration:none"
                  href="/download/"
                  >Download</a
                >
              </li>
              <li class="margin-left:sm color:c1text1">
                <a
                  class="color:c1text2 text-decoration:none"
                  href="/tutorials/"
                  >Tutorials</a
                >
              </li>
              <li class="margin-left:sm color:c1text1">
                <a
                  class="color:c1text2 text-decoration:none"
                  href="/implementation/"
                  >Implementation</a
                >
              </li>
              <li class="margin-left:sm color:c1text1">
                <a
                  class="color:c1text2 text-decoration:none"
                  href="/usinglivevisualisation/"
                  >UI</a
                >
              </li>
            </ul>
          </nav>

          <a
            target="_blank"
            class="text-decoration:none color:blue:hover margin:md"
            href="https://github.com/MarkJamesHoward/VisualGitCmd"
          >
            <img width="50" src="/github-mark.png" alt="GitHub Cat" />
          </a>
        </div>
      </header>
    `;
  }
}

customElements.define("visualgit-header", Header);
