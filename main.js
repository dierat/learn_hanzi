Characters = new Mongo.Collection("characters");


if (Meteor.isClient) {
  Template.body.helpers({
    characters: function () {
      return Characters.find({});
    }
  });
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Characters.find().count() === 0) {
      var chars = [['一','one'],['亠','lid'],['冖','cover'],['宀','roof'],['立','stand, erect'], ['厂','cliff'], ['广','house on cliff'], ['疒','sickness'], ['穴','cave'], ['人','human, person, people'], ];
      _.each(chars, function (char) {
        Characters.insert({
          character: char[0],
          level: 0,
          meaning: char[1]
        });
      });
    }
  });
}