// Disallows insertions into the Main_deck from the client
Main_deck.deny({
  insert: ()=> true
});


// Only allows inserting and updating into the Users_deck if the user is altering
// documents with their own user_id
Users_deck.allow({
  insert: (user_id, doc)=> doc.user_id === user_id,
  update: (user_id, doc, fields, modifier)=> doc.user_id === user_id
});

// Denies ability to change a document's user id
Users_deck.deny({
  update: (user_id, doc, fields, modifier)=> _.contains(fields, user_id)
});



// 'time_levels' is an array containing the number of seconds that will transpire
// before a card will be shown again. Each time a card is answered correctly, the
// length of time before it is shown again will double.
time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0, 7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0, 1966080.0, 3932160.0, 7864320.0];



if (Meteor.isClient) {

  Meteor.startup(()=> {
    Session.setDefault('date', new Date());
    Session.setDefault('answered', false);
  });

  // This should be only the cards in the Users_deck with the current user's id,
  Meteor.subscribe('users_deck');
  // and this should be the card in Main_deck that has an order number equal to
  // the number of cards in the Users_deck with the current user's id (ie the
  // next card the user will learn)
  Meteor.subscribe('main_deck');

  Template.home.helpers({
    cards: function () {
      Session.set('date', new Date());
      // Find the cards in the Users_deck that have a timestamp earlier than now,
      // sort them in ascending order, and take the first one (if there is one)
      let ref_card = Users_deck.findOne({user_id: Meteor.userId(), time: {$lt: Session.get("date")}}, {sort: {time: 1}});
      // If there was a card with a timestamp earlier than now, return it.
      if (ref_card) return Main_deck.find({_id: ref_card.card_id});
      else {
        // Finds number of cards currently in play,
        const users_deck_num = Users_deck.find({user_id: Meteor.userId()}).count();
        // then gets the next card from the Main_deck.
        const waiting_card = Main_deck.find({order: users_deck_num});
        // If there was a card in the Main_deck, return it.
        if (waiting_card.count()) return waiting_card;
        else {
          // Otherwise, get the card in the user's card with the oldest timestamp.
          ref_card = Users_deck.findOne({user_id: Meteor.userId()}, {sort: {time: 1}});
          if (ref_card) return Main_deck.find({_id: ref_card.card_id});
        }
      }
    }
  });

  Template.card.helpers({
    seen: function() {
      // Checks if this card exists in the Users_deck with the current user's
      // id and turns the result into a boolean
      return !!Users_deck.findOne({user_id: Meteor.userId(), card_id: this._id});
    },
    answered: ()=> Session.get('answered'),
    correct: ()=> Session.get('correct'),
    // Tells the card template if an answer has been submitted, and, if so, to
    // disable the text field so the user can't re-answer.
    disabled: ()=> Session.get('answered')
  });

  Template.card.events({
    // When hitting the next button after seeing a card for the first time,
    'click #first-time': function () {
      Session.set('date', new Date());
      // insert a reference card into the Users_deck that contains the user's id,
      // the card's id, when the user should see this card again, and the initial
      // level of 0
      Users_deck.insert({
        user_id: Meteor.userId(),
        card_id: this._id,
        time: new Date(+new Date() + time_levels[0]*1000),
        level: 0
      });
    },
    // When hitting the next button after answering a card incorrectly,
    'click #wrong-answer': function() {
      Session.set('date', new Date());
      // update the timestamp to be the current time + the current card's time
      // level value (multiplied by 1000 to make it into seconds)
      const ref_card = Users_deck.findOne({user_id: Meteor.userId(), card_id: this._id});
      const new_time = new Date(+new Date() + time_levels[ref_card.level]*1000);
      Users_deck.update(ref_card._id, {$set: {time: new_time}});
      // and reset the Session's 'answered' state to false (for the next card)
      Session.set('answered', false);
    },
    // When submitting an answer,
    'submit .answer': function (event) {
      // get the user's answer
      const answer = event.target.text.value;
      // and make sure something was submitted before continuing.
      if (answer.length) {
        Session.set('answered', true);
        // If the answer is correct,
        if (answer.toLowerCase() === this.meaning) {
          Session.set('correct', true);
          // wait two seconds before
          Meteor.setTimeout(function(){
            // increasing the card's level by one and updating the timestamp,
            Session.set('date', new Date());
            const ref_card = Users_deck.findOne({user_id: Meteor.userId(), card_id: this._id});
            const new_time = new Date(+new Date() + (time_levels[ref_card.level] + 1)*1000);
            Users_deck.update(ref_card._id, {$inc: {level: 1}, $set: {time: new_time}});
            // and setting the Session's 'answered' value to false (for the next card)
            Session.set('answered', false);
          }.bind(this), 1250);
        // If the answer was false,
        } else {
          // tell the client that so it can show the correct answer.
          Session.set('correct', false);
        }
        // This overrides the default form return function.
        return false;
      }
    }

  });

  Template.card.rendered = function () {
    $('.answer input').focus();
    $('.next-button').focus();
    $(document).scrollTop( $("body").offset().top );
  };

  // Login requires username instead of e-mail address for easier testing.
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  // Renders the login panel as uncollapsed on login_page template.
  Template.login_page.rendered = ()=> {
    Accounts._loginButtonsSession.set('dropdownVisible', true);
  };

}
