import {Words, Users} from "../db/db.js"



/**
 * @async
 * @param {Number} length the desired length for the random word
 * @returns the random word
 */
async function getRandomWord(length){
  let query = {length: length};
  let count = await Words.count(query);
  console.log(count);
  let randVal = Math.floor(Math.random() * count);
  let randomWord = await Words.getRandomUsingVal(randVal, query);
  return randomWord;
}
/**
 * @async
 * @param {String} word the word we want the definition for
 * @returns the object of the word with the definition
 */
async function getDefinition(word){
  let query = {word: word};
  console.log(word)
  let result = await Words.findOne(query).exec()
  return result;
}
/**
 * @async
 * @returns an object with a field count for the number of words and a field words
 * that's an array of all the words
 */
async function getAllWords(length){
  let query = {};
  if(length){
    query = {length: length};
  }
  let returnObj = {};
  let arr = await Words.getOnlyWordFields(query);
  returnObj.words = [];
  arr.forEach(i => {
    returnObj.words.push(i.word);
  });
  returnObj.count = arr.length;
  return returnObj;
}

/**
 * @async
 * @returns the user
 */
async function getUser(){
  let result = await Users.getLatestUser();
  return result;
}

/**
 * Get all users
 * @async
 * @returns all users sorted by Elo
 */
async function getAllUsers(){
  let result = await Users.getAllUsers();
  return result;
}

export default {getRandomWord, getDefinition, getAllWords, getUser, getAllUsers};