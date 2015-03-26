// This creates two empty collections.
// The Main_deck collection stores all the cards,
Main_deck = new Mongo.Collection("main_deck");
// and the Users_deck remembers who will see what when.
Users_deck = new Mongo.Collection("users_deck");



// These are the first ten characters for testing purposes.
// Database information should follow the format:
// [ ['question1', 'answer1', 'explanation1'], ['question2', 'answer2', 'explanation2'], etc]
chars = [
  ['一','one', '"One" is represented by a single horizontal line. The first three numbers in Mandarin are written as horizontal tally marks.', 'one_bronze.svg', 'bronze inscription', 0],
  ['亠','lid', '"Lid" is a horizontal line topped with a small vertical dash, like a handle on a pot lid.', 'lid_photo.jpg', 'photo', 1],
  ['冖','cover', '"Cover" is a horizontal line with two small vertical lines hanging from each side, like a tablecloth covering a table.', 'cover_photo.jpg', 'photo', 2],
  ['宀','roof', '"Roof" looks like a combination of "lid" (亠) and "cover" (冖), but now the handle stands for the peak of a roof or a chimney, and the sides are eaves.', 'roof_photo.jpg', 'photo', 3],
  ['立','stand', 'The character for "to stand" represents a person standing, but that is clearer in earlier versions of the character. The horizontal lines describe the shoulders and the ground, the dash on top is the head, and the two long vertical lines outline the torso. It may be easier, however, to imagine it as a pot or vase standing on a table.', 'stand_smallseal.svg', 'small seal script', 4], 
  ['穴','cave', 'The "cave" character is composed of roof (宀) with two curved horizontal lines on either side representing the walls of the cave.', 'cave_photo.jpg', 'photo', 5], 
  ['厂','cliff', '"Cliff" is drawn as a horizontal line with a slightly curved vertical line hanging down from the left, like the edge of a cliff.', 'cliff_photo.jpg', 'photo', 6], 
  ['广','house on a cliff', 'The character for "house on cliff" looks just like "cliff" (厂) but with a dot on top representing a house.', 'houseoncliff_photo.jpg', 'photo', 7], 
  ['疒','sickness', '"Sickness" looks like "house on cliff" (广) with two additional dashes on the left, but the words have very different meaings and histories. The character for sickness represents a sick person sweating, possibly from a fever. Earlier versions of the character had a stretcher or bed drawn to the left of the figure.', 'sickness_oracle.jpg', 'oracle bone script', 8], 
  ['石','stone', '"Stone" shows a stone beneath a cliff (厂), though the cliff has become somewhat abstracted and looks a little different than in other characters.', 'stone_photo.jpg', 'photo', 9]
];


// 'time_levels' is an array containing the number of seconds that will
// transpire before a card will be shown again. Each time a card is
// answered correctly, the length of time before it is shown again will
// double.
time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 
1966080.0, 3932160.0, 7864320.0]



if (Meteor.isClient) {
  
  Meteor.startup(function() {
    // Create a new date object for the Session that will help determine 
    // when cards will be shown again.
    Session.setDefault("date", new Date());
    // Create an 'answered' state that is by default set to false.
    Session.set('answered', false);
  })

  // The client subscribes to the cards in the Users_deck with the 
  // current user's id,
  Meteor.subscribe('users_deck', Meteor.userId());
  // and to the card in Main_deck that has an order number equal to the
  // number of cards in the Users_deck with the current user's id
  Meteor.subscribe('main_deck', Users_deck.find({user_id: Meteor.userId()}).count());

  Template.body.helpers({
    cards: function () {
      // This finds the cards in the Users_deck that have a timestamp earlier 
      // than now, sorts them in ascending order, takes the first one (if there 
      // is one), and assigns it to the variable 'ref_card'.
      var ref_card = Users_deck.findOne({user_id: Meteor.userId(), time: {$lt: Session.get("date")}}, {sort: {time: 1}});
      // If there was a card with a timestamp earlier than now, return it.
      if (ref_card) {
        return Main_deck.find({_id: ref_card.card_id});
      } else {
        // Finds number of cards currently in play,
        var users_deck_num = Users_deck.find({user_id: Meteor.userId()}).count();
        // then gets the next card from the Main_deck.
        var waiting_card = Main_deck.find({order: users_deck_num});
        // If there was a card in the Main_deck, return it.
        if (waiting_card.count() > 0) {
          return waiting_card;
        } else {
          // Otherwise, sort the cards in the Users_deck in ascending order 
          // and return the first one.
          var ref_card = Users_deck.findOne({user_id: Meteor.userId()}, {sort: {time: 1}});
          return Main_deck.find({_id: ref_card.card_id});
        }
      }
    }
  });

  Template.card.helpers({
    // Tells the card template if the user has seen this card before.
    seen: function() {
      if ( Users_deck.findOne({user_id: Meteor.userId(), card_id: this._id}) ) {
        return true;
      } else {
        return false;
      }
    },
    // Tells the card template if an answer has been submitted.
    answered: function() {
      return Session.get('answered');
    },
    // Tells the card template if the answer submitted was correct.
    correct: function() {
      return Session.get('correct');
    },
    // Tells the card template if an answer has been submitted, and, if
    // so, to disable the text field so the user can't re-answer.
    disabled: function() {
      return Session.get('answered');
    }
  });

  Template.card.events({
    // When hitting the next button after seeing a card for the first time,
    'click #first-time': function () {
      // update the 'date' variable to the current time,
      Session.set('date', new Date());
      // and insert a reference card into the Users_deck that contains
      // the user's id, the card's id, when the user should see this
      // card again, and the initial level of 0
      Users_deck.insert({
        user_id: Meteor.userId(),
        card_id: this._id,
        time: new Date(+new Date() + time_levels[0]*1000),
        level: 0
      });
    },
    // When hitting the next button after answering a card incorrectly,
    'click #wrong-answer': function() {
      // update the 'date' variable to the current time,
      Session.set('date', new Date());
      // update the timestamp to be the current time + the current 
      // card's time level value (multiplied by 1000 to make it into seconds)
      var ref_card = Users_deck.findOne({user_id: Meteor.userId(), card_id: this._id});
      var new_time = new Date(+new Date() + time_levels[ref_card.level]*1000);
      Users_deck.update(ref_card._id, {$set: {time: new_time}});
      // and reset the Session's 'answered' state to false (for the next
      // card)
      Session.set('answered', false);
    },
    // When submitting an answer,
    'submit .answer': function (event) {
      // get the user's answer and set it to the variable 'answer',
      var answer = event.target.text.value;
      // and make sure something was submitted before continuing.
      if (answer.length > 0) {
        // Set Session's 'answered' value to true,
        Session.set('answered', true);
        // If the answer is correct,
        if (answer.toLowerCase() === this.meaning) {
          // set the Session's correct value to true,
          Session.set('correct', true);
          // and wait two seconds before 
          Meteor.setTimeout(function(){
            // updating the 'date' variable to the current time,
            Session.set('date', new Date());
            // increasing the card's level by one and updating the timestamp,
            var ref_card = Users_deck.findOne({user_id: Meteor.userId(), card_id: this._id});
            var new_time = new Date(+new Date() + (time_levels[ref_card.level] + 1)*1000);
            Users_deck.update(ref_card._id, {$inc: {level: 1}, $set: {time: new_time}});
            // and setting the Session's 'answered' value to false (for
            // the next card)
            Session.set('answered', false);
          }.bind(this), 2000);
        // Otherwise
        } else {
          // set the Session's 'correct' value to false
          Session.set('correct', false);
        }
        // This overrides the default form return function.
        return false;
      }
    }

  });

  Template.card.rendered = function () {
     // These auto-focus on the next button and input fields when they appear,
    $('.answer input').focus();
    $('.next-button').focus();
    // and this resets the scroll to the top of the body div when the template refreshes.
    $(document).scrollTop( $("#body").offset().top );
  };

  // Login requires username instead of e-mail address for easier testing.
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  
  // Renders the login panel as uncollapsed on login_page template.
  Template.login_page.rendered = function() {
    Accounts._loginButtonsSession.set('dropdownVisible', true);
  };

}



if (Meteor.isServer) {

  Meteor.methods({

    // These three methods allow you to easily reset the database from
    // the browser console (alt + cmd + J). 

    // The first method fills the Main_deck with the cards from the
    // 'chars' array at the top of this file.
    // To call, type Meteor.call('fill_deck'); in the browser console.
    fill_deck: function () {
      if (Main_deck.find().count() === 0) {
        _.each(chars, function (char) {
          Main_deck.insert({
            character: char[0],
            meaning: char[1],
            description: char[2],
            file_name: char[3],
            alt: char[4],
            order: char[5],
          });
        });
      }
    },
    // The second method empties both decks.
    // To call, type Meteor.call('empty_deck'); in the browser console.
    empty_deck: function() {
      Main_deck.remove({});
      Users_deck.remove({});
    },
    // The third method calls both previous methods to empty the decks and
    // then fill the Main_deck with the cards from the 'chars' array at 
    // the top of this file.
    // To call, type Meteor.call('shuffle_deck'); in the browser console.
    shuffle_deck: function() {
      Meteor.call('empty_deck');
      Meteor.call('fill_deck');
    }

  });

  // Publish the whole main deck to the client.
  Meteor.publish('main_deck', function() {
    return Main_deck.find({order: order});
  });
  // Publish the users' cards to the client based on the user_id on the
  // document.
  Meteor.publish('users_deck', function() {
    return Users_deck.find({user_id: user_id});
  });

}