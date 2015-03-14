// This creates three empty collections.
// The Waiting_deck collection is for cards that the user has not yet seen,
Waiting_deck = new Mongo.Collection("waiting_deck");
// the Current_deck is for cards the user is currently being tested on,
Current_deck = new Mongo.Collection("current_deck");


// These are the first ten characters for testing purposes.
// Database information should follow the format:
// [ ['question1', 'answer1', 'explanation1'], ['question2', 'answer2', 'explanation2'], etc]
chars = [
  ['一','one', '"One" is represented by a single horizontal line. The first three numbers in Mandarin are written as horizontal tally marks.', 'one_bronze.svg', 'bronze inscription'],
  ['亠','lid', '"Lid" is a horizontal line topped with a small vertical dash, like a handle on a pot lid.', 'lid_photo.jpg', 'photo'],
  ['冖','cover', '"Cover is a horizontal line with two small vertical lines hanging from each side, like a tablecloth covering a table.', 'cover_photo.jpg', 'photo'],
  ['宀','roof', '"Roof" looks like a combination of "lid" (亠) and "cover" (冖), but now the handle stands for the peak of a roof or a chimney, and the sides are eaves.', 'roof_photo.jpg', 'photo'],
  ['立','stand, erect', 'The character for "to stand" represents a person standing, but that is clearer in earlier versions of the character. The horizontal lines describe the shoulders and the ground, the dash on top is the head, and the two long vertical lines outline the torso. It may be easier, however, to imagine it as a pot or vase standing on a table.', 'stand_smallseal.svg', 'small seal script'], 
  ['穴','cave', 'The "cave" character is composed of roof (宀) with two curved horizontal lines on either side representing the walls of the cave.', 'cave_photo.jpg', 'photo'], 
  ['厂','cliff', '"Cliff" is drawn as a horizontal line with a slightly curved vertical line hanging down from the left, like the edge of a cliff.', 'cliff_photo.jpg', 'photo'], 
  ['广','house on cliff', 'The character for "house on cliff" looks just like "cliff" (厂) but with a dot on top representing a house.', 'houseoncliff_photo.jpg', 'photo'], 
  ['疒','sickness', '"Sickness" looks like "house on cliff" (广) with two additional dashes on the left, but the words have very different meaings and histories. The character for sickness represents a sick person sweating, possibly from a fever. Earlier versions of the character had a stretcher or bed drawn to the left of the figure.', 'sickness_oracle.jpg', 'oracle bone script'], 
  ['石','stone', '"Stone" shows a stone beneath a cliff (厂), though the cliff has become somewhat abstracted and looks a little different than in other characters.', 'stone_photo.jpg', 'photo']
];


// 'time_levels' is an array containing the number of seconds that will
// transpire before a card will be shown again. Each time a card is
// answered correctly, the length of time before it is shown again will
// double.
time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 
1966080.0, 3932160.0, 7864320.0]



if (Meteor.isClient) {

  // This code configures the Mongol package: http://mongol.meteor.com/
  Session.set("Mongol", {
    'collections': ['Waiting_deck', 'Current_deck'],
    'display': true,
    'opacity_normal': ".7",
    'opacity_expand': ".9",
    'disable_warning': 'false'
  });

  
  Meteor.startup(function() {
    // This creates a new date object for the Session that will be used to 
    // determine when cards will be shown again.
    Session.setDefault("date", new Date());
    // And this creates an 'answered' state that is by default set to false.
    Session.set('answered', false);
  })

  Template.body.helpers({
    cards: function () {
      // This finds the cards in the Current_deck that have a timestamp earlier 
      // than now, sorts them in ascending order, takes the first one (if there 
      // is one), and assigns it to the variable 'current_card'.
      var current_card = Current_deck.find({time: {$lt: Session.get("date")}}, {sort: {time: 1}, limit: 1});
      // If there was a card with a timestamp earlier than now, return it.
      if (current_card.count() > 0) {
        return current_card;
      } else {
        // Otherwise, sort the cards in the Waitind_deck in ascending order, take 
        // the first one, and assign it to the variable 'waiting_card'.
        var waiting_card = Waiting_deck.find({}, {sort: {time: 1}, limit: 1});
        // If there was a card in the Waiting_deck, return it.
        if (waiting_card.count() > 0) {
          return waiting_card;
        } else {
          // Otherwise, sort the cards in the Current_deck in ascending order 
          // and return the first one.
          return Current_deck.find({}, {sort: {time: 1}, limit: 1});
        }
      }
    }
  });

  Template.card.helpers({
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
      // set 'seen' to true so next time we know the card has already been
      // introduced to the user,
      this.seen = true;
      // set 'time' to now + the first level in the time_levels array 
      // (multiplied by 1000 to make it into seconds),
      this.time = new Date(+new Date() + time_levels[0]*1000);
      // insert the card into the Current_deck,
      Current_deck.insert(this);
      // and, finally, remove it from the Waiting_deck.
      Waiting_deck.remove(this._id);
    },
    // When hitting the next button after answering a card incorrectly,
    'click #wrong-answer': function() {
      // update the 'date' variable to the current time,
      Session.set('date', new Date());
      // update the timestamp to be the current time + the current 
      // card's time level value (multiplied by 1000 to make it into seconds)
      var new_time = new Date(+new Date() + time_levels[this.level]*1000);
      Current_deck.update(this._id, {$set: {time: new_time}});
      // and reset the Session's 'answered' state to false (for the next
      // card)
      Session.set('answered', false);
    },
    // When submitting an answer,
    'submit .answer': function (event) {
      // Get the user's answer and set it to the variable 'answer',
      var answer = event.target.text.value;
      // and make sure something was submitted before continuing.
      if (answer.length > 0) {
        // Set Session's 'answered' value to true,
        Session.set('answered', true);
        // If the answer is correct,
        if (answer === this.meaning) {
          // set the Session's correct value to true,
          Session.set('correct', true);
          // and wait two seconds before 
          Meteor.setTimeout(function(){
            // updating the 'date' variable to the current time,
            Session.set('date', new Date());
            // increasing the card's level by one and updating the timestamp,
            var new_time = new Date(+new Date() + (time_levels[this.level] + 1)*1000);
            Current_deck.update(this._id, {$inc: {level: 1}, $set: {time: new_time}});
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

  // This auto-focuses on the next button and input fields when they appear.
  Template.card.rendered = function () {
    $('.answer input').focus();
    $('.next-button').focus();
  };

}



if (Meteor.isServer) {

  Meteor.methods({

    // These three methods allow you to easily reset the database from
    // the browser console (alt + cmd + J). 

    // The first method fills the Waiting_deck with the cards from the
    // 'chars' array at the top of this file.
    // To call, type Meteor.call('fill_deck'); in the browser console.
    fill_deck: function () {
      if (Waiting_deck.find().count() === 0) {
        _.each(chars, function (char) {
          Waiting_deck.insert({
            character: char[0],
            meaning: char[1],
            description: char[2],
            file_name: char[3],
            alt: char[4],
            time: new Date(),
            seen: false,
            level: 0
          });
        });
      }
    },
    // The second method empties all collections.
    // To call, type Meteor.call('empty_deck'); in the browser console.
    empty_deck: function() {
      Current_deck.remove({});
      Waiting_deck.remove({});
    },
    // The third method calls both previous methods to empty the decks and
    // then fill the Waiting_deck with the cards from the 'chars' array at 
    // the top of this file.
    // To call, type Meteor.call('shuffle_deck'); in the browser console.
    shuffle_deck: function() {
      Meteor.call('empty_deck');
      Meteor.call('fill_deck');
    }

  });

}