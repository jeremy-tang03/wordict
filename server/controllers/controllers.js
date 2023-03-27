import { Words, Users } from "../db/db.js"



/**
 * @async
 * @param {Number} length the desired length for the random word
 * @returns the random word
 */
async function getRandomWord(length) {
  let query = { length: length };
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
async function getDefinition(word) {
  let query = { word: word };
  console.log(word)
  let result = await Words.findOne(query).exec()
  return result;
}
/**
 * @async
 * @returns an object with a field count for the number of words and a field words
 * that's an array of all the words
 */
async function getAllWords(length) {
  let query = {};
  if (length) {
    query = { length: length };
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
async function getUser() {
  let result = await Users.getLatestUser();
  return result;
}

/**
 * update the user document with provided data
 * @async
 * @param {String} email 
 * @param {String} name 
 * @param {String} picture 
 */
async function updateUser(email, name) {
  const doc = await Users.findOneAndUpdate(
    { email: email },
    { name: name },
    // { picture: picture},
    // If `new` isn't true, `findOneAndUpdate()` will return the
    // document as it was _before_ it was updated.
    { new: false }
  );
  console.log(`user ${doc.email} has been updated`);
}

/**
 * update the user's favorite words
 * @param {String} email 
 * @param {String} word 
 * @param {boolean} isFavorite true: remove from favorites, false: add to favorites
 */
async function postUserFavoriteWord(email, word, isFavorite) {
  if (!isFavorite) {
    console.log(`add ${word} to favorites`);
    await Users.addUserFavoriteWord(email, word);
  } else {
    console.log(`remove ${word} to favorites`);
    await Users.removeUserFavoriteWord(email, word);
  }
}

export default {
  getRandomWord, getDefinition, getAllWords, getUser, updateUser, postUserFavoriteWord
};