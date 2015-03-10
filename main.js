// To reset the cards, type Meteor.call('shuffle_deck'); in the browser console (ctrl+ alt + J).


// This creates two empty collections.
// The Waiting_deck collection is for cards that the user has not yet seen,
// and the Current_deck is for cards the user is currently being tested on.
Waiting_deck = new Mongo.Collection("waiting_deck");
Current_deck = new Mongo.Collection("current_deck");


// These are the first ten characters for testing purposes.
// Database information should follow the format:
// [ ['question1', 'answer1', 'explanation1'], ['question2', 'answer2', 'explanation2'], etc]
var chars = [
  ['一','one', '"One" is represented by a single horizontal line. The first three numbers in Mandarin are written as horizontal tally marks.'],
  ['亠','lid', '"Lid" is a horizontal line topped with a small vertical line, like a handle on a pot lid.'],
  ['冖','cover', '"Cover is a horizontal line with two small vertical lines hanging from each side, like a tablecloth covering a table.'],
  ['宀','roof', '"Roof" looks like a combination of "lid" (亠) and "cover" (冖), but now the handle stands for the peak of a roof or a chimney and the sides are eaves.'],
  ['立','stand, erect', 'The character for "to stand" represents a person standing, but that is easier to see in earlier versions of the character. The horizontal lines describe the shoulders and the ground, the dash on top is the head, and the two long vertical lines outline the torso. It may be easier, however, to imagine it as a pot or vase standing on a table.'], 
  ['厂','cliff', '"Cliff" is drawn as a horizontal line with a slightly curves vertical line hanging down from the left, like the edge of a cliff.'], 
  ['广','house on cliff', 'The character for "house on cliff" looks just like "cliff" (厂) but with a dot on top representing a house.'], 
  ['疒','sickness', '"Sickness" looks like "house on cliff" () with two additional dashes on the left, but the words have very different meaings and histories. The character for sickenss represents a sick person sweating, possibly from a fever. Earlier versions of the character had a stretcher or bed drawn to the left of the figure. '], 
  ['穴','cave', 'The "cave" character is composed of roof (宀) with two curved horizontal lines on either side representing the walls of the cave.'], 
  ['人','human, person, people', 'The character for "person" depicts the torso and legs of a person standing or walking. In earlier versions, the person shown also had arms.']
];


// time_levels is an array containing the number of seconds that will
// transpire before a card will be shown again. Each time a card is
// answered correctly, the length of time before it is shown again will
// double.
time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 
1966080.0, 3932160.0, 7864320.0]


// Client code
if (Meteor.isClient) {

  Session.set("Mongol", {
    'collections': ['Waiting_deck', 'Current_deck'],
    'display': true,
    'opacity_normal': ".7",
    'opacity_expand': ".9",
    'disable_warning': 'false'
  });

  Meteor.startup(function() {
    Session.setDefault("date", new Date());
  })

  Template.body.helpers({
    cards: function () {
      var current_card = Current_deck.find({time: {$lt: Session.get("date")}}, {sort: {time: 1}, limit: 1});
      if (current_card.count() > 0) {
        return current_card;
      } else {
        var waiting_card = Waiting_deck.find({}, {sort: {time: 1}, limit: 1});
        if (waiting_card.count() > 0) {
          return waiting_card;
        } else {
          return Current_deck.find({}, {sort: {time: 1}, limit: 1});
        }
      }
    }
  });

  Template.card.helpers({
    answered: function() {
      return Session.get('answered');
    },
    correct: function() {
      return Session.get('correct');
    },
    disabled: function() {
      return Session.get('answered');
    }
  });

  Template.card.events({
    'click #first-time': function () {
      Session.set('date', new Date());
      this.seen = true;
      this.time = new Date(+new Date() + time_levels[0]*1000);
      Current_deck.insert(this);
      Waiting_deck.remove(this._id);
    },
    'click #wrong-answer': function() {
      Current_deck.update(this._id, {$set: {time: new Date(+new Date() + time_levels[this.level]*1000)}});
      Session.set('answered', false);
    },
    'submit .answer': function (event) {
      Session.set('answered', true);
      var answer = event.target.text.value;
      if (answer === this.meaning) {
        Session.set('correct', true);
        Meteor.setTimeout(function(){
          Current_deck.update(this._id, {$inc: {level: 1}, $set: {time: new Date(+new Date() + (time_levels[this.level] + 1)*1000)}});
          Session.set('answered', false);
        }.bind(this), 2000);
      } else {
        Session.set('correct', false);
        
        //event.target.text.value = '';
      }
      //Session.set('answered', false);
      return false;
    }
  });

  // auto-focuses on the next button and input fields
  Template.card.rendered = function () {
    $('.answer input').focus();
    $('.next-button').focus();
  }

}



if (Meteor.isServer) {

  Meteor.methods({

    // These three methods allow you to easily reset the database from
    // the browser console. 
    fill_deck: function () {
      if (Waiting_deck.find().count() === 0) {
        _.each(chars, function (char) {
          Waiting_deck.insert({
            character: char[0],
            meaning: char[1],
            description: char[2],
            time: new Date(),
            seen: false,
            level: 0
          });
        });
      }
    },
    empty_deck: function() {
      Current_deck.remove({});
      Waiting_deck.remove({});
    },
    shuffle_deck: function() {
      Meteor.call('empty_deck');
      Meteor.call('fill_deck');
    }

  });

}