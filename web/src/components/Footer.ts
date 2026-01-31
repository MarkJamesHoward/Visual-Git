import { LitElement, html, css } from "lit";
import { TWStyles } from "../styles/mimic.css.js";

export class Footer extends LitElement {
  static styles = [css``, TWStyles];

  render() {
    return html`
      <!-- <footer class="color:white bg-white dark:bg-gray-900"> -->
      <!-- <div class="display:flex flex-direction:row p-5 justify-between gap-x-5"> -->
      <footer class="font-size:md margin-top:md background-color:c1background1 overflow-wrap:break-word">
        <div
          class="display:flex flex-direction:row padding:md justify-content:space-around align-items:center"
        >
          <div
            class="display:flex flex-direction:column justify-content:space-around"
          >
            <a
              class="color:c1text2 color:white:hover text-decoration:none margin-bottom:lg"
              href="/"
              >Home</a
            >

            <a
              class="color:c1text2 color:white:hover text-decoration:none"
              href="/implementation/"
              >Implementation Details</a
            >
          </div>

          <div
            class="display:flex flex-direction:column justify-content:space-around"
          >
            <a
              class="color:c1text2  color:white:hover text-decoration:none display:none"
              href="/visualize/"
              >Visualize</a
            >
            <a
              class="color:c1text2 color:white:hover text-decoration:none margin-bottom:lg"
              href="/tutorials/"
              >Tutorials</a
            >
            <a
              class="color:c1text2  color:white:hover text-decoration:none"
              href="/cmdOptions/"
              >Running Visual</a
            >
          </div>

          <div
            class="display:flex flex-direction:column justify-content:space-around"
          >
            <a
              class="color:c1text2  color:white:hover text-decoration:none margin-bottom:lg"
              href="/privacy/"
              >Privacy</a
            >
            <a
              class="color:c1text2 color:white:hover text-decoration:none"
              href="/contactus/"
              >Contact Us</a
            >
          </div>
        </div>
      </footer>
      <!-- </div> -->
      <!-- </footer> -->
      <!-- <scroll-to-top-wc></scroll-to-top-wc> -->
    `;
  }
}

customElements.define("visualgit-footer", Footer);
