Current_deck = new Mongo.Collection("current_deck");
Waiting_deck = new Mongo.Collection("waiting_deck");


var chars = [['一','one'],['亠','lid'],['冖','cover'],['宀','roof'],
  ['立','stand, erect'], ['厂','cliff'], ['广','house on cliff'], 
  ['疒','sickness'], ['穴','cave'], ['人','human, person, people']];



time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 
1966080.0, 3932160.0, 7864320.0]



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

  Template.card.events({
    'click #next-button': function () {
      Session.set('date', new Date());
      this.seen = true;
      this.time = new Date(+new Date() + time_levels[0]*1000);
      Current_deck.insert(this);
      Waiting_deck.remove(this._id);
    },
    'submit .answer': function (event) {
      var answered = true;
      var answer = event.target.text.value;
      if (answer === this.meaning) {
        var correct = true;
        Current_deck.update(this._id, {$inc: {level: 1}, $set: {time: new Date(+new Date() + (time_levels[this.level] + 1)*1000)}});
      } else {
        var correct = false;
        Current_deck.update(this._id, {$set: {time: new Date(+new Date() + time_levels[this.level]*1000)}});
        event.target.text.value = '';
      }
      return false;
    }
  });

  Template.card.rendered = function () {
    $('.answer input').focus();
    $('#next-button').focus();
  }

}



if (Meteor.isServer) {

  Meteor.methods({
    fill_deck: function () {
      if (Waiting_deck.find().count() === 0) {
        _.each(chars, function (char) {
          Waiting_deck.insert({
            character: char[0],
            meaning: char[1],
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