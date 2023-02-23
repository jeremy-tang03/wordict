import WordRow from "./WordRow.js";
import * as GameLogic from "../../controllers/GameLogic.js";
import { useEffect } from "react";
import "./Wordle.css"
import Popup from "./Popup.js";

const ROW_PREFIX = "R-";
const POP_PREFIX = "P-";

function Wordle(props) {

  // Contains all of the functions subscribed to the key event
  const keyEvent = new Map();

  // Contains all of the functions subscribed to the style event
  const styleEvent = new Map();

  let currentRow = 0;

  let gameDone = false;

  // Contains all of the functions subscribed to the game state event
  const gameStateEvent = new Map();

  // Set the default value of the letters to be an array of default values
  const letters = new Array(props.word.length).fill(props.defaultValue);

  /**
   * Subscribe a function to the key event
   * @param {String} key The key associated with the subscription
   * @param {Function} subFunc The function to subscribe to the key event
   */
  function subToKeyEvent(key, subFunc) {
    keyEvent.set(key, subFunc);
  }


  /**
   * Subscribe a function to the style event
   * @param {String} key The key associated with the subscription
   * @param {Function} subFunc The function to subscribe to the style event
   */
  function subToStyleEvent(key, subFunc) {
    styleEvent.set(key, subFunc);
  }

  /**
   * Subscribe a function to the game state event
   * @param {String} key The key associated with the subscription
   * @param {Function} subFunc The function to subscribe to the game state event
   */
  function subToGameStateEvent(key, subFunc) {
    gameStateEvent.set(key, subFunc);
  }

  /**
   * Process keyboard input and trigger game events accordingly
   * @param {Event} e The key event
   * @param {Function} send An optional function to send the key event result somewhere else
   */
  function handleInput(e, send = undefined) {
    let key = e.key.toLocaleUpperCase();
    //validate key
    if (GameLogic.validateInput(key) && !gameDone) {
      
      // Only submit if their entire word is filled 
      // TODO add check if it is a valid word
      if (
        key === props.submitKey 
        && letters.every(letter => letter !== props.defaultValue)
      ) {
        // Get the result array to determine which letters are correct
        let results = GameLogic.checkSubmission(letters.join(""), props.word);

        // Trigger the style event for the current row
        styleEvent.get(ROW_PREFIX + currentRow)(results);

        currentRow++;
        let gameWon = results.every(result => result === GameLogic.RIGHT)
        if (gameWon) {
          gameDone = true;
        } else if (currentRow >= letters.length) {
          gameDone = true;
        }

        if (gameDone) {
          gameStateEvent.forEach(func => func({done: gameDone, win: gameWon}));
        }

        //clear the current word that is being written
        letters.forEach((letter, index, array) => {
          array[index.toFixed()] = props.defaultValue;
        })
      } else if (key !== props.submitKey) {

        // Trigger the key event for the current row
        keyEvent.get(ROW_PREFIX + currentRow)(key);
        
        // If the key should be sent somewhere else send it here
        send?.call(key);
      }
    }

  }

  useEffect(() => {
    // Get keyboard input from the parent component
    props.subToInputEvent(props.id, handleInput);
  });
  

  return (
    <section className="wordle">
      <Popup 
        word={props.word}
        id={POP_PREFIX + 0}
        subToGameStateEvent={subToGameStateEvent}
      />
      {letters.map((elem, index) => {
        return <WordRow 
          key={index} 
          id={ROW_PREFIX + index}
          wordLength={props.word.length} 
          subToKeyEvent={subToKeyEvent}
          subToStyleEvent={subToStyleEvent}
          letters={letters}
          deleteKey={props.deleteKey}
          defaultValue={props.defaultValue}
        />
      })}
    </section>
  );
}

export default Wordle;