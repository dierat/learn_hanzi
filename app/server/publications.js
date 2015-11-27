// Publish the whole main deck to the client.
Meteor.publish( 'main_deck', ()=> Main_deck.find() );
// Publish the users' cards to the client based on the user_id on the document.
Meteor.publish('users_deck', function() {
  return Users_deck.find({user_id: this.userId});
});
