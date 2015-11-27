Meteor.methods({

  // These methods allow you to easily reset the database from the browser console
  // (open it by holding down 'alt', 'cmd', and 'J').


  // The first method fills the Main_deck with the cards from the 'chars' array
  // in the chars.js file.
  // To call, type Meteor.call('fill_deck'); in the browser console.
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

  // The second method empties both decks.
  // To call, type Meteor.call('empty_deck'); in the browser console.
  empty_deck: ()=> {
    Main_deck.remove({});
    Users_deck.remove({});
  },

  // The third method calls both previous methods to empty the decks and then
  // fills the Main_deck with the cards from the 'chars' array in the chars.js
  // file.
  // To call, type Meteor.call('shuffle_deck'); in the browser console.
  shuffle_deck: ()=> {
    Meteor.call('empty_deck');
    Meteor.call('fill_deck');
  }

});
