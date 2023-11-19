

<header>
  <div class="search-bar">
    <form id="myForm" action="http://127.0.0.1:8000/create" method="POST">
      <div>
        <input 
          id="search" 
          type="text" 
          name="search"
          placeholder="Insert your crossword theme ." 
          list="search-suggestions" 
          autocomplete="off"
        />
        <!-- <input type="submit" value="submit"/> -->
      </div> 
    </form>
  </div> 
</header><article>

  <div class="intro">
    <h1>Crossy</h1>
    <p>
      An ML-powered crossword generator!
      Made by Zachary Eichenberger, Haley Johnson, Zachary Goldston
    </p>
  </div>

  <section id="Your Custom Puzzle ">
    <Crossword data="{customCword}" />
      <!-- <div slot="message">
        <h3>OMG, congrats!</h3>
        <img
          alt="celebration"
          src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif"
        />
      </div> -->
  </section>

  <!-- <section id="mobile" style="max-width: 500px;">
    <div class="info">
      <h2><a href="#mobile">Mobile</a></h2>
      <p>
        A
        <a href="https://www.nytimes.com/crosswords/game/mini/2020/10/21"
          >NYT mini</a
        >
        puzzle with all default settings and forced mobile view.
      </p>
    </div>
    <Crossword data="{dataNYTMini}" showKeyboard="{true}" />
  </section>

  <section id="themes" class="{theme}" style="max-width: 760px;">
    <div class="info">
      <h2><a href="#themes">Themes</a></h2>
      <p>A library of preset style themes to choose from.</p>
      <select bind:value="{theme}">
        <option value="classic">Classic</option>
        <option value="dark">Dark</option>
        <option value="citrus">Citrus</option>
        <option value="amelia">Amelia</option>
      </select>
    </div>
    <div>
      <Crossword data="{dataOreo}" theme="{theme}" />
    </div>
  </section>

  <section id="simple-customization" class:is-revealed="{revealedUSA}">
    <div class="info">
      <h2><a href="#simple">Simple Customization</a></h2>
      <p>
        A few customizations: custom class names on clues/cells,
        <code>revealed</code>
        binding (apply custom style), and
        <code>disableHighlight</code>
        parameter.
      </p>
    </div>
    <Crossword
      data="{dataUSA}"
      disableHighlight="{revealedUSA}"
      bind:revealed="{revealedUSA}"
    />
  </section> -->

  <!-- <section id="slots">
    <div class="info">
      <h2><a href="#slots">Slots</a></h2>
      <p>Custom slots for the toolbar and completion message.</p>
    </div>
    <Crossword data="{dataNYTDaily}">
      <div
        class="toolbar"
        slot="toolbar"
        let:onClear
        let:onReveal
        style="background: #333; padding: 1em; margin: 1em 0;"
      >
        <button
          style="font-size: 1.5em; background-color: #888;"
          on:click="{onClear}">clear puzzle</button
        >
        <button
          style="font-size: 1.5em; background-color: #888;"
          on:click="{onReveal}">show answers</button
        >
      </div>
      <div slot="message">
        <h3>OMG, congrats!</h3>
        <img
          alt="celebration"
          src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif"
        />
      </div>
    </Crossword>
  </section> -->
</article>

<script src="form.js">
  import Crossword from "../src/Crossword.svelte";
  import dataNYTMini from "./data/nyt-mini.json";
  import customCword from "./data/custom.json";
  import dataNYTDaily from "./data/nyt-daily.json"
  import dataOreo from "./data/oreo.json";
  
  let revealedUSA;
  let theme;

</script>

<style>


header {
  background: cornflowerblue;
  position: relative; 
  font-family: system-ui, Roboto, sans-serif; 
  min-height: 130px;
  /* display: flex; */
  align-items: center; 
  position: sticky;
  top: -54px;
  z-index: 2;
}
  .search-bar {
    display: flex;
    justify-content: center;
    padding: 80px;
  }
  .search-bar input { 
    width: 50%;
    min-width: 400px;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 16px;
    border: 0px;
    outline: none;
}
  .search-bar [list]::-webkit-list-button,
  .search-bar [list]::-webkit-calendar-picker-indicator {
  display: none !important;
}


  article {
    max-width: 960px;
    margin: 0 auto;
    padding: 1em;
    font-family: sans-serif;
  }
  .intro {
    text-align: left;
    max-width: 760px;
    font-size: 1.5em;
  }
  section {
    max-width: 960px;
    margin: 5em 0;
  }

  .info {
    max-width: 640px;
    margin: 1em 0;
    text-align: left;
    font-size: 1.125em;
  }
  .info a {
    margin-right: 0.25em;
  }
  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.5em;
    padding-top: 1em;
  }
  p {
    margin: 1em auto;
  }

  #themes {
    padding: 1em;
  }

  #themes.dark {
    background: #1a1a1a;
    color: #fff;
  }
  code {
    font-size: 0.85em;
    background-color: #efefef;
    padding: 0 0.25em;
  }

  button {
    cursor: pointer;
  }
</style>
