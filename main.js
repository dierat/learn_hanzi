Characters = new Mongo.Collection("characters");


time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 
1966080.0, 3932160.0, 7864320.0]



if (Meteor.isClient) {
  Template.body.helpers({
    characters: function () {
      return Characters.find({}, {limit: 1});
    }
  });
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Characters.find().count() === 0) {
      var chars = [['一','one'],['亠','lid'],['冖','cover'],['宀','roof'],
      ['立','stand, erect'], ['厂','cliff'], ['广','house on cliff'], 
      ['疒','sickness'], ['穴','cave'], ['人','human, person, people'], ];

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