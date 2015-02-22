Current_deck = new Mongo.Collection("current_deck");
Waiting_deck = new Mongo.Collection("waiting_deck");


time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 
1966080.0, 3932160.0, 7864320.0]



if (Meteor.isClient) {

  Session.set("Mongol", {
    'collections': ['Waiting_deck', 'Current_deck'],
    'display': true,
    'opacity_normal': ".7",
    'opacity_expand': ".9",
  });

  Template.body.helpers({
    cards: function () {
      var current_card = Current_deck.find({time: {$lt: new Date()}}, {sort: {time: 1}, limit: 1});
      if (current_card.count()) {
        return current_card;
      } else {
        return Waiting_deck.find({}, {sort: {time: 1}, limit: 1});
      }
    }
  });

  Template.card.events({
    'click #next-button': function () {
      this.seen = true;
      this.time = new Date(+new Date() + time_levels[this.level]*1000);
      Current_deck.insert(this);
      Waiting_deck.remove(this._id);
    },
    'click #answer-button': function () {
      var answer = $("#answer-field").val();
      if (answer === this.meaning) {
        console.log("Correct!!");
        console.log("The current time is: " + new Date())
        Current_deck.update(this._id, {$inc: {level: 1}, $set: {time: new Date(+new Date() + (time_levels[this.level] + 1)*1000)}});
      } else {
        console.log("Nope! It's " + this.meaning);
        console.log("The current time is: " + new Date())
        Current_deck.update(this._id, {$set: {time: new Date(+new Date() + time_levels[this.level]*1000)}});
      }
    }
  });

}



if (Meteor.isServer) {

  Meteor.startup(function () {
    if (Waiting_deck.find().count() === 0) {
      var chars = [['一','one'],['亠','lid'],['冖','cover'],['宀','roof'],
      ['立','stand, erect'], ['厂','cliff'], ['广','house on cliff'], 
      ['疒','sickness'], ['穴','cave'], ['人','human, person, people'], ];

      _.each(chars, function (char) {
        Waiting_deck.insert({
          character: char[0],
          level: 0,
          meaning: char[1],
          time: new Date(),
          seen: false
        });
      });
    }
  });

}