#Learn Hanzi

This project is no longer being maintained.

![Learn Hanzi! desktop incorrect answer view](http://i132.photobucket.com/albums/q17/dierat/software%20dev%20portfolio%20images/Screen%20Shot%202015-09-18%20at%206.09.17%20PM.png)

![Learn Hanzi! mobile successful answer view](http://i132.photobucket.com/albums/q17/dierat/software%20dev%20portfolio%20images/Screen%20Shot%202015-09-18%20at%206.10.39%20PM.png)


#What is it?

<p>Learn Hanzi is a spaced-repetition flashcards app that is designed to teach you <a href="http://en.wikipedia.org/wiki/Chinese_characters">Chinese characters</a>. It's actually a prototype that I made to help me learn Chinese (and <a href="https://www.meteor.com/">Meteor</a>), but you're welcome to use it too. Currently the app will teach you the 101 most common <a href="http://en.wikipedia.org/wiki/Radical_(Chinese_characters)">Chinese radicals</a> from the 2,000 most common Chinese characters. The source for the list of radicals used can be found on <a href="http://www.hackingchinese.com/kickstart-your-character-learning-with-the-100-most-common-radicals/">Hacking Chinese</a>. (You may notice that the original list contains 100 radicals while this app uses 101 - the extra character is 屮 ("sprout").)</p>
<p>Radicals are root characters that are combined to make compound characters, which can also be combined to make even more complex characters. Many of these radicals are not words on their own, but learning them first can make it much easier to learn more complicated characters later on because you will already know the building blocks. There are 214 <a href="http://en.wikipedia.org/wiki/Kangxi_radical">Kangxi radicals</a>, but some of them are only used a few times and are not as useful to learn on their own. This app focuses on teaching the most common radicals found in the most common characters for higher efficiency. Keep in mind though that they are not ordered according to frequency. They have instead been organized based on visual similarity so you can learn to tell similar images apart and learn new information based on characters you already know.</p>
<p>Chinese radicals sometimes have several forms and which form is used depends on where in the compound character the radical is placed. For example, "heart" (心) has two additional radical forms that sometimes appear in compound characters. If "heart" is placed in an overhead position, it is made shorter to match the space (⺗), but if it's placed on the left or right side, it becomes thinner to fit into that location (忄). <a href="http://en.wikipedia.org/wiki/Chinese_characters#Phono-semantic_compounds">(Wikipedia has a very helpful set of illustrations that show the various positions radicals can occupy in a compound character.)</a></p>
<p>The character descriptions in this app often cite the history of the characters, and some of the images shown with the characters are copies of the characters' ancient forms. The <a href="http://en.wikipedia.org/wiki/Oracle_bone_script">oracle bone script</a> is the oldest confirmed Chinese writing and dates back to 1200–1050 <a href="http://en.wikipedia.org/wiki/Common_Era">BCE</a>. Other forms include the <a href="http://en.wikipedia.org/wiki/Chinese_bronze_inscriptions">bronze inscriptions</a>, <a href="http://en.wikipedia.org/wiki/Large_Seal_Script">large seal script</a>, and <a href="http://en.wikipedia.org/wiki/Small_Seal_Script">small seal script</a>. There were usually several different methods of writing Chinese characters in use at any given time, so the different forms mentioned were contemporaries of each other (rather than one being used, discarded, and traded for the next).</p>
<p>There are currently two forms of hanzi used for written Chinese today - <a href="http://en.wikipedia.org/wiki/Traditional_Chinese_characters">traditional</a> and <a href="http://en.wikipedia.org/wiki/Simplified_Chinese_characters">simplified</a>. The traditional character set has been more or less stable since the 5th century while the simplified character system was developed very recently in the 1950s by the People's Republic of China to increase literacy rates within China. The simplified characters mostly resemble their traditional counterparts but with fewer strokes, and many Chinese characters are the same in both sets. Most beginners start with learning the simplified characters, which this app uses. The simplified system is used in mainland China while the traditional characters are used in Taiwan, Singapore, and Hong Kong. Other languages that adopted the Chinese system of writing (Japanese, Korean, and Vietnamese) use the traditional system as well (though some have their own simplified versions).</p>
<p>If you have any feedback, suggestions, bug reports, or just general comments that you'd like to send me, you can e-mail me at diedra.rater@gmail.com.</p>


#How do I get it running on my computer?

Fork this repository, then clone your fork down onto your machine.

Navigate to the directory of your clone in your terminal and type

```
meteor
```

to run the server. Then open your browser at the URL

```
localhost:3000
```

to see the app.

To fill the database, you will need to uncomment the meteor methods in app/server/meteorMethods.js
Then open the browser console (ctrl + j) while viewing the app and type:

```
Meteor.call('shuffle_deck');
```

You can run that command again at any time to reset the database, but it will also reset any the history for any users that have been viewing and answering cards.
