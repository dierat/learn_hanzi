// These methods allow you to easily reset the database from the browser console.
// Uncomment the code in this file to use these commands, but recomment them out
// before deployment so users can't reset your database from their browser.


// The first method fills the Main_deck with the cards from the 'chars' array
// in the chars.js file.
// To call, type Meteor.call('fill_deck'); in the browser console.

// The second method empties both decks.
// To call, type Meteor.call('empty_deck'); in the browser console.

// The third method calls both previous methods to empty the decks and then
// fills the Main_deck with the cards from the 'chars' array in the chars.js
// file.
// To call, type Meteor.call('shuffle_deck'); in the browser console.


/*
Meteor.methods({

  fill_deck: function () {
    if (Main_deck.find().count() === 0) {
      _.each(chars, (char)=> {
        Main_deck.insert({
          order: parseInt(char[0]),
          character: char[1],
          meaning: char[2],
          alt: char[3],
          file_name: char[4],
          description: char[5],
        });
      });
    }
  },

  empty_deck: ()=> {
    Main_deck.remove({});
    Users_deck.remove({});
  },

  shuffle_deck: ()=> {
    Meteor.call('empty_deck');
    Meteor.call('fill_deck');
  }

});
*/
