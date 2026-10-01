// Paraphrased game text (maps_b). Keys are pokered text labels without the leading underscore.
G.TEXT = G.TEXT || {}; G.DEX_TEXT = G.DEX_TEXT || {};

// text/Route12.asm
Object.assign(G.TEXT, {
  Route12SnorlaxText: "A POKéMON is snoozing right in the middle of the path!",
  Route12SnorlaxWokeUpText: "SNORLAX woke up!\fCranky about the interruption, it lashed out!",
  Route12SnorlaxCalmedDownText: "SNORLAX settled right down! With a huge yawn, it wandered back into the mountains!",
  Route12Fisher1BattleText: "Whoa, something's biting!",
  Route12Fisher1EndBattleText: "Tch! Just a little runt!",
  Route12Fisher1AfterBattleText: "Hold up! My line's caught on something!",
  Route12Fisher2BattleText: "Patience! Fishing is all about the wait!",
  Route12Fisher2EndBattleText: "Darn, it got away!",
  Route12Fisher2AfterBattleText: "With a better ROD, I'd hook better POKéMON!",
  Route12CooltrainerMBattleText: "Have you come across a MOON STONE anywhere?",
  Route12CooltrainerMEndBattleText: "Ouch!",
  Route12CooltrainerMAfterBattleText: "A MOON STONE would've evolved my POKéMON!",
  Route12SuperNerdBattleText: "Electric POKéMON are my specialty!",
  Route12SuperNerdEndBattleText: "Shorted out!",
  Route12SuperNerdAfterBattleText: "Water carries electricity well, so zap sea POKéMON with it!",
  Route12Fisher3BattleText: "It's the FISHING FOOL against a POKéMON KID!",
  Route12Fisher3EndBattleText: "That stung!",
  Route12Fisher3AfterBattleText: "You beat me in battle, but fishing's where I really shine!",
  Route12Fisher4BattleText: "Honestly, I'd rather just be at work! My agents are shipping without me!",
  Route12Fisher4EndBattleText: "This isn't easy...",
  Route12Fisher4AfterBattleText: "It's fine, really. Losing stopped bothering me a while ago.",
  Route12Fisher5BattleText: "You never know what's waiting on the other end of the line!",
  Route12Fisher5EndBattleText: "It got loose!",
  Route12Fisher5AfterBattleText: "I reel in MAGIKARP nonstop, but they're so feeble!",
  Route12SignText: "ROUTE 12  North to LAVENDER",
  Route12SportFishingSignText: "SPORT FISHING AREA",
});

// text/Route12Gate1F.asm
Object.assign(G.TEXT, {
  Route12Gate1FGuardText: "You'll find a lookout point on the floor above.",
});

// text/Route12Gate2F.asm
Object.assign(G.TEXT, {
  Route12Gate2FBrunetteGirlYouCanHaveThisText: "My POKéMON's remains rest in POKéMON TOWER now.\fYou can have this TM. I won't be needing it anymore...",
  Route12Gate2FBrunetteGirlReceivedTM39Text: "{PLAYER} got TM39!",
  Route12Gate2FBrunetteGirlTM39ExplanationText: "TM39 teaches the move SWIFT.\fIt almost never misses, so save it for a fight you can't afford to lose.",
  Route12Gate2FBrunetteGirlTM39NoRoomText: "You don't have any room to carry this.",
  Route12Gate2FLeftBinocularsText: "You peered through the binoculars.\fThere's a man out fishing!",
  Route12Gate2FRightBinocularsText: "You peered through the binoculars.\fThat's POKéMON TOWER over there!",
});

// text/Route12SuperRodHouse.asm
Object.assign(G.TEXT, {
  Route12SuperRodHouseFishingGuruDoYouLikeToFishText: "I'm the FISHING GURU's younger brother!\fFishing is basically my whole life!\fSo, do you enjoy fishing?",
  Route12SuperRodHouseFishingGuruReceivedSuperRodText: "Wonderful! I like the way you think!\fHere, take this and get out there fishing, youngster!\f{PLAYER} received a {wStringBuffer} !",
  Route12SuperRodHouseFishingGuruFishingWayOfLifeText: "Fishing isn't just a hobby, it's a lifestyle!\fWhether it's the sea or a river, get out there and land the big one!",
  Route12SuperRodHouseFishingGuruThatsDisappointingText: "Oh... That's such a shame...",
  Route12SuperRodHouseFishingGuruTryFishingText: "Hi there, {PLAYER}!\fCast the SUPER ROD into any water and you'll hook all kinds of POKéMON.\fGive it a try wherever you can!",
  Route12SuperRodHouseFishingGuruNoRoomText: "Oh dear!\fI had something to give you, but you've got no room for it!",
});

// text/Route13.asm
Object.assign(G.TEXT, {
  Route13CooltrainerM1BattleText: "My bird POKéMON are itching for a scrap!",
  Route13CooltrainerM1EndBattleText: "My flock actually lost?",
  Route13CooltrainerM1AfterBattleText: "Even after losing, my POKéMON still look content.",
  Route13CooltrainerF1BattleText: "People say I'm pretty good for my age!",
  Route13CooltrainerF1EndBattleText: "Ohh, I lost!",
  Route13CooltrainerF1AfterBattleText: "I want to grow into a fine trainer, so I'll train hard for it.",
  Route13CooltrainerF2BattleText: "Whoa! Those BADGEs of yours are so cool!",
  Route13CooltrainerF2EndBattleText: "That wasn't enough!",
  Route13CooltrainerF2AfterBattleText: "I know exactly where those BADGEs came from, GYM LEADERs!",
  Route13CooltrainerF3BattleText: "My adorable POKéMON would love to meet yours.",
  Route13CooltrainerF3EndBattleText: "Wow, you won completely!",
  Route13CooltrainerF3AfterBattleText: "POKéMON only get tougher through battling, you know!",
  Route13CooltrainerF4BattleText: "I once dug up a CARBOS inside a cave.",
  Route13CooltrainerF4EndBattleText: "Ugh, I blew it!",
  Route13CooltrainerF4AfterBattleText: "That CARBOS raised my POKéMON's SPEED.",
  Route13CooltrainerM2BattleText: "The wind's on my side today! Can you feel it? I'm feeling the AGI!",
  Route13CooltrainerM2EndBattleText: "Guess the wind shifted!",
  Route13CooltrainerM2AfterBattleText: "I'm worn out. Think I'll just FLY home.",
  Route13Beauty1BattleText: "Sure thing, let's have a match!",
  Route13Beauty1EndBattleText: "Oh! You little troublemaker!",
  Route13Beauty1AfterBattleText: "I always wonder, are male or female POKéMON stronger?",
  Route13Beauty2BattleText: "Care to battle POKéMON with me?",
  Route13Beauty2EndBattleText: "Finished already?",
  Route13Beauty2AfterBattleText: "I don't know much about POKéMON. I just like the cool-looking ones!",
  Route13BikerBattleText: "What are you staring at?",
  Route13BikerEndBattleText: "Argh! My gears are shot!",
  Route13BikerAfterBattleText: "Beat it!",
  Route13CooltrainerM3BattleText: "I always stick with bird POKéMON!",
  Route13CooltrainerM3EndBattleText: "Ran out of steam!",
  Route13CooltrainerM3AfterBattleText: "I really wish I could soar like PIDGEY and PIDGEOTTO...",
  Route13TrainerTips1Text: "TRAINER TIPS\fTake a look to the left of that signpost!",
  Route13TrainerTips2Text: "TRAINER TIPS\fPress SELECT to reorder items in the ITEM window!",
  Route13SignText: "ROUTE 13 North to SILENCE BRIDGE",
});

// text/Route14.asm
Object.assign(G.TEXT, {
  Route14CooltrainerM1BattleText: "TMs are what you need to teach POKéMON strong moves!",
  Route14CooltrainerM1EndBattleText: "That wasn't good enough!",
  Route14CooltrainerM1AfterBattleText: "You must have some HMs by now, right? Those moves can never be forgotten.",
  Route14CooltrainerM2BattleText: "My bird POKéMON ought to be primed for battle.",
  Route14CooltrainerM2EndBattleText: "Guess they weren't ready yet!",
  Route14CooltrainerM2AfterBattleText: "They need to pick up stronger moves.",
  Route14CooltrainerM3BattleText: "CELADON sells TMs, but hardly anyone's got HMs!",
  Route14CooltrainerM3EndBattleText: "Aw, what a bummer!",
  Route14CooltrainerM3AfterBattleText: "Teach POKéMON moves that match their own type for extra power.",
  Route14CooltrainerM4BattleText: "Have you taught your bird POKéMON the move FLY yet?",
  Route14CooltrainerM4EndBattleText: "Shot right out of the sky!",
  Route14CooltrainerM4AfterBattleText: "Bird POKéMON have my whole heart!",
  Route14CooltrainerM5BattleText: "Have you ever heard about the legendary POKéMON?",
  Route14CooltrainerM5EndBattleText: "Why? Why did I lose?",
  Route14CooltrainerM5AfterBattleText: "All three legendary POKéMON happen to be birds of prey.",
  Route14CooltrainerM6BattleText: "This isn't really my thing, but fine, let's do it!",
  Route14CooltrainerM6EndBattleText: "I just knew it!",
  Route14CooltrainerM6AfterBattleText: "Winning or losing, none of it really matters in the end!\fMy P(DOOM)'s like 90% anyway. Might as well battle!",
  Route14Biker1BattleText: "Come on, come on! Let's get moving already!",
  Route14Biker1EndBattleText: "Argh, I lost! Just get lost!",
  Route14Biker1AfterBattleText: "Huh, huh, hold on? What is it you're after?",
  Route14Biker2BattleText: "Perfect timing, I needed something to kill time with!",
  Route14Biker2EndBattleText: "Huh? You?!",
  Route14Biker2AfterBattleText: "Man, raising POKéMON is such a drag.",
  Route14Biker3BattleText: "We ride out here because there's more open space!",
  Route14Biker3EndBattleText: "Total wipeout!",
  Route14Biker3AfterBattleText: "That's pretty awesome, how strong you've made your POKéMON!\fStrength rules everything, and you know it!",
  Route14Biker4BattleText: "A POKéMON scrap? Sweet, let's rumble!",
  Route14Biker4EndBattleText: "Totally blown away!",
  Route14Biker4AfterBattleText: "One-on-one, just you and me, you know who'd win!",
  Route14SignText: "ROUTE 14 West to FUCHSIA CITY",
});

// text/Route15.asm
Object.assign(G.TEXT, {
  Route15CooltrainerF1BattleText: "Let me test out this POKéMON I just got through a trade!",
  Route15CooltrainerF1EndBattleText: "Guess that wasn't good enough!",
  Route15CooltrainerF1AfterBattleText: "You can't rename any POKéMON you receive in a trade.\fOnly its Original Trainer is allowed to do that.",
  Route15CooltrainerF2BattleText: "You seem pretty mild-mannered, so I bet I can beat you!",
  Route15CooltrainerF2EndBattleText: "No way, I was wrong!",
  Route15CooltrainerF2AfterBattleText: "BIKERs scare me, they always look so rough and mean!",
  Route15CooltrainerM1BattleText: "One whistle from me and bird POKéMON come flocking!",
  Route15CooltrainerM1EndBattleText: "Ow! How awful!",
  Route15CooltrainerM1AfterBattleText: "Maybe battling just isn't for me.",
  Route15CooltrainerM2BattleText: "Hmm? My birds are trembling! You're pretty skilled, aren't you?",
  Route15CooltrainerM2EndBattleText: "Just what I figured!",
  Route15CooltrainerM2AfterBattleText: "Did you know moves like EARTHQUAKE don't work on birds at all?",
  Route15Beauty1BattleText: "Oh, aren't you a little cutie!",
  Route15Beauty1EndBattleText: "And you looked so cute too!",
  Route15Beauty1AfterBattleText: "I'll let it slide! I can take a loss!",
  Route15Beauty2BattleText: "I keep POKéMON because I live on my own!",
  Route15Beauty2EndBattleText: "This isn't what I signed up for!",
  Route15Beauty2AfterBattleText: "I just love coming home to be with my POKéMON!",
  Route15Biker1BattleText: "Hey kid! C'mon, I just got hold of these!",
  Route15Biker1EndBattleText: "Why not, huh?",
  Route15Biker1AfterBattleText: "You only live once, so I live it as an outlaw! TEAM ROCKET RULES!",
  Route15Biker2BattleText: "Lose to me, kid, and you're handing over every last coin!",
  Route15Biker2EndBattleText: "That can't be right!",
  Route15Biker2AfterBattleText: "Relax, I was only kidding about the money!",
  Route15CooltrainerF3BattleText: "You know what's cool? Trading POKéMON!",
  Route15CooltrainerF3EndBattleText: "I only meant to trade!",
  Route15CooltrainerF3AfterBattleText: "I swap POKéMON with my friends all the time!",
  Route15CooltrainerF4BattleText: "Fancy playing around with my POKéMON?",
  Route15CooltrainerF4EndBattleText: "I rushed things too much!",
  Route15CooltrainerF4AfterBattleText: "I'll go find some easier trainers to practice against.",
  Route15SignText: "ROUTE 15 West to FUCHSIA CITY",
});

// text/Route15Gate1F.asm
Object.assign(G.TEXT, {
  Route15Gate1FGuardText: "Are you putting together a POKéDEX?\fPROF.OAK's AIDE stopped by here earlier.",
});

// text/Route15Gate2F.asm
Object.assign(G.TEXT, {
  Route15Gate2FOaksAideExpAllText: "EXP.ALL shares EXP points among every POKéMON in your party, even the ones that didn't fight.\fThe catch is that each POKéMON's share ends up smaller.\fIf you don't need it, better to leave it in the PC.",
  Route15Gate2FBinocularsText: "You peered through the binoculars.\fThere seems to be a small island out there!",
});

// text/Route16.asm
Object.assign(G.TEXT, {
  Route16Biker1BattleText: "What's your problem?",
  Route16Biker1EndBattleText: "Don't you laugh at me!",
  Route16Biker1AfterBattleText: "We just like chilling out here, so what's it to you?",
  Route16Biker2BattleText: "That's a sweet BIKE! Hand it over!",
  Route16Biker2EndBattleText: "Down for the count!",
  Route16Biker2AfterBattleText: "Eh, forget it, I don't need your BIKE anyway!",
  Route16Biker3BattleText: "Get out here and fight, you little rat!",
  Route16Biker3EndBattleText: "You little pest!",
  Route16Biker3AfterBattleText: "I hate losing! Just get away from me!",
  Route16biker4BattleText: "Hey! You just ran right into me!",
  Route16Biker4EndBattleText: "Boom, there it is!",
  Route16Biker4AfterBattleText: "There's also a coastal route that runs from VERMILION straight to FUCHSIA.",
  Route16Biker5BattleText: "I'm starving and in a nasty mood!",
  Route16Biker5EndBattleText: "Ugh, terrible, terrible!",
  Route16Biker5AfterBattleText: "I like my POKéMON vicious! They tear their foes apart!",
  Route16Biker6BattleText: "Fine, let's do this!",
  Route16Biker6EndBattleText: "Don't you dare tick me off!",
  Route16Biker6AfterBattleText: "I love bugging people with my nasty POKéMON!",
  Route16Text7: "A POKéMON is asleep and blocking the way!",
  Route16SnorlaxWokeUpText: "SNORLAX snapped awake!\fIt lashed out, furious at being disturbed!",
  Route16SnorlaxReturnedToMountainsText: "With a huge yawn, SNORLAX shuffled back off toward the mountains!",
  Route16CyclingRoadSignText: "Have a great ride down the slope! CYCLING ROAD",
  Route16SignText: "ROUTE 16 CELADON CITY - FUCHSIA CITY",
});

// text/Route16FlyHouse.asm
Object.assign(G.TEXT, {
  Route16FlyHouseBrunetteGirlText: "Oh! You found my little hideaway!\fPlease keep it a secret that I'm here. Let me thank you with this!",
  Route16FlyHouseBrunetteGirlReceivedHM02Text: "{PLAYER} got HM02!",
  Route16FlyHouseBrunetteGirlHM02ExplanationText: "That's HM02, the move FLY. It'll carry you straight back to any town.\fMake good use of it!",
  Route16FlyHouseBrunetteGirlHM02NoRoomText: "Sorry, you don't have any space to hold this.",
  Route16FlyHouseFearowText: "FEAROW: Kwaark!",
});

// text/Route16Gate1F.asm
Object.assign(G.TEXT, {
  Route16Gate1FGuardNoPedestriansAllowedText: "Foot traffic isn't allowed on CYCLING ROAD!",
  Route16Gate1FGuardCyclingRoadExplanationText: "CYCLING ROAD is a downhill route that runs along the sea. It's a fantastic ride.",
  Route16Gate1FGuardWaitUpText: "Hold on there! Please wait a moment!",
  Route16Gate1FGamblerText: "How'd you manage to sneak in here? Not bad at all!",
});

// text/Route16Gate2F.asm
Object.assign(G.TEXT, {
  Route16Gate2FLittleBoyText: "I'm heading out for a ride with my girlfriend!",
  Route16Gate2FLittleGirlText: "The two of us are going riding together!",
  Route16Gate2FLeftBinocularsText: "You peered through the binoculars.\fThat's the CELADON DEPT. STORE!",
  Route16Gate2FRightBinocularsText: "You peered through the binoculars.\fThere's a long stretch of road crossing the water!",
});

// text/Route17.asm
Object.assign(G.TEXT, {
  Route17Biker1BattleText: "There's no cash in beating up kids!",
  Route17Biker1EndBattleText: "Totally burned out!",
  Route17Biker1AfterBattleText: "You can find some good stuff scattered around CYCLING ROAD!",
  Route17Biker2BattleText: "What do you need, kid?",
  Route17Biker2EndBattleText: "Whoa!",
  Route17Biker2AfterBattleText: "I could've bumped you right off the road with my belly!",
  Route17Biker3BattleText: "Are you on your way to FUCHSIA?",
  Route17Biker3EndBattleText: "Total wipeout!",
  Route17Biker3AfterBattleText: "I love tearing down this hill!",
  Route17Biker4BattleText: "We're BIKERs! Stars of the open road!",
  Route17Biker4EndBattleText: "Totally smoked!",
  Route17Biker4AfterBattleText: "Looking for some adventure, are you?",
  Route17Biker5BattleText: "Let my VOLTORB give you a shock!",
  Route17Biker5EndBattleText: "Completely grounded out!",
  Route17Biker5AfterBattleText: "I caught my VOLTORB out at the deserted POWER PLANT.\fDeserted ever since its output got rerouted to a data center!",
  Route17Biker6BattleText: "Why won't my POKéMON evolve?!",
  Route17Biker6EndBattleText: "Why you little...!",
  Route17Biker6AfterBattleText: "I guess some POKéMON only evolve using an elemental STONE.",
  Route17Biker7BattleText: "I could use a little exercise!",
  Route17Biker7EndBattleText: "Phew! Solid workout!",
  Route17Biker7AfterBattleText: "I bet I dropped a few pounds doing that!",
  Route17Biker8BattleText: "Time to live like a rebel! ACCELERATE!",
  Route17Biker8EndBattleText: "Aaaargh!",
  Route17Biker8AfterBattleText: "Always be ready to stand up for what you believe!\fAnd I believe in acceleration! No brakes, no safety reviews!",
  Route17Biker9BattleText: "Nice BIKE! How does it handle?",
  Route17Biker9EndBattleText: "Aw, shoot!",
  Route17Biker9AfterBattleText: "This slope makes it hard to keep steady!",
  Route17Biker10BattleText: "Beat it, kid! I'm worn out!",
  Route17Biker10EndBattleText: "Happy now?",
  Route17Biker10AfterBattleText: "I really need to catch some sleep!",
  Route17NoticeSign1Text: "It's a posted notice!\fKeep an eye out for items people dropped!",
  Route17TrainerTips1Text: "TRAINER TIPS\fEvery POKéMON is one of a kind.\fEven two of the same type and level won't grow at the same rate.",
  Route17TrainerTips2Text: "TRAINER TIPS\fHold down the A or B Button to keep from sliding on a slope.",
  Route17SignText: "ROUTE 17 CELADON CITY - FUCHSIA CITY",
  Route17NoticeSign2Text: "It's a posted notice!\fDon't give up the match — throw a POKé BALL instead!",
  Route17CyclingRoadEndsSignText: "CYCLING ROAD The downhill slope ends here!",
});

// text/Route18.asm
Object.assign(G.TEXT, {
  Route18CooltrainerM1BattleText: "I always search every patch of grass for new POKéMON.",
  Route18CooltrainerM1EndBattleText: "Tch!",
  Route18CooltrainerM1AfterBattleText: "Man, I really wish I had a BIKE!",
  Route18CooltrainerM2BattleText: "Kurukkoo! What do you think of my bird call?",
  Route18CooltrainerM2EndBattleText: "I just had to mess with you!",
  Route18CooltrainerM2AfterBattleText: "On weekends I also go collecting ocean POKéMON!",
  Route18CooltrainerM3BattleText: "This is my turf! Clear out of here!",
  Route18CooltrainerM3EndBattleText: "Darn it all!",
  Route18CooltrainerM3AfterBattleText: "This is my favorite spot for hunting POKéMON!",
  Route18SignText: "ROUTE 18 CELADON CITY - FUCHSIA CITY",
  Route18CyclingRoadSignText: "CYCLING ROAD Walking here is not allowed!",
});

// text/Route18Gate1F.asm
Object.assign(G.TEXT, {
  Route18Gate1FGuardYouNeedABicycleText: "You'll need a BICYCLE to use CYCLING ROAD!",
  Route18Gate1FGuardCyclingRoadUphillText: "From here, CYCLING ROAD climbs uphill the whole way.",
  Route18Gate1FGuardExcuseMeText: "Pardon me!",
});

// text/Route18Gate2F.asm
Object.assign(G.TEXT, {
  Route18Gate2FLeftBinocularsText: "You peered through the binoculars.\fPALLET TOWN lies off to the west!",
  Route18Gate2FRightBinocularsText: "You peered through the binoculars.\fThere are some people out swimming!",
});

// text/Route19.asm
Object.assign(G.TEXT, {
  Route19CooltrainerM1BattleText: "Gotta stretch before I go for my swim!",
  Route19CooltrainerM1EndBattleText: "There, all warmed up!",
  Route19CooltrainerM1AfterBattleText: "Thanks, kid! Now I'm ready to swim!",
  Route19CooltrainerM2BattleText: "Hold on! That water will give you a heart attack!",
  Route19CooltrainerM2EndBattleText: "Ooh! That's freezing!",
  Route19CooltrainerM2AfterBattleText: "Keep an eye out for TENTACOOL!",
  Route19Swimmer1BattleText: "Swimming's my favorite! How about you?",
  Route19Swimmer1EndBattleText: "Ouch, belly flop!",
  Route19Swimmer1AfterBattleText: "Chur! I'm from the LEVY ST. office up in CELADON.\fClaude's shipping my tickets while I'm out here!",
  Route19Swimmer2BattleText: "I wonder what's out past the horizon?",
  Route19Swimmer2EndBattleText: "Glub, glub!",
  Route19Swimmer2AfterBattleText: "I can make out a couple of islands out there!",
  Route19Swimmer3BattleText: "I tried diving for POKéMON, but it just didn't work out!",
  Route19Swimmer3EndBattleText: "Help me!",
  Route19Swimmer3AfterBattleText: "To catch ocean POKéMON you've got to go fishing!",
  Route19Swimmer4BattleText: "I stare out at the sea to clear my context window!",
  Route19Swimmer4EndBattleText: "Ooh! That's rough!",
  Route19Swimmer4AfterBattleText: "The ocean helps me forget all my troubles!",
  Route19Swimmer5BattleText: "Ooh, I really love your ride! If I beat you, can I keep it?",
  Route19Swimmer5EndBattleText: "Aw, I lost!",
  Route19Swimmer5AfterBattleText: "There's still quite a ways to go before reaching SEAFOAM ISLANDS.",
  Route19Swimmer6BattleText: "Swimming is the best! Sunburns, not so much!",
  Route19Swimmer6EndBattleText: "What a shock!",
  Route19Swimmer6AfterBattleText: "My boyfriend wanted to swim all the way to SEAFOAM ISLANDS.",
  Route19Swimmer7BattleText: "These waters are downright dangerous!",
  Route19Swimmer7EndBattleText: "Ooh! That's risky!",
  Route19Swimmer7AfterBattleText: "Ugh, I've got a cramp! Glub, glub...",
  Route19Swimmer8BattleText: "I swam all the way out here, and now I'm worn out.",
  Route19Swimmer8EndBattleText: "I'm completely wiped out...",
  Route19Swimmer8AfterBattleText: "LAPRAS is so massive, riding it must keep you totally dry.",
  Route19SignText: "SEA ROUTE 19 FUCHSIA CITY - SEAFOAM ISLANDS",
});

// text/Route2.asm
Object.assign(G.TEXT, {
  Route2SignText: "ROUTE 2 VIRIDIAN CITY - PEWTER CITY",
  Route2DiglettsCaveSignText: "DIGLETT's CAVE",
});

// text/Route20.asm
Object.assign(G.TEXT, {
  Route20Swimmer1BattleText: "It's pretty shallow around here.",
  Route20Swimmer1EndBattleText: "Splash!",
  Route20Swimmer1AfterBattleText: "I wish my POKéMON could give me rides.",
  Route20Swimmer2BattleText: "SEAFOAM makes for a peaceful little getaway!",
  Route20Swimmer2EndBattleText: "Cut it out!",
  Route20Swimmer2AfterBattleText: "This island has a massive cavern running underneath it.",
  Route20Swimmer3BattleText: "Floating around with the fish is my favorite thing!",
  Route20Swimmer3EndBattleText: "Ouch!",
  Route20Swimmer3AfterBattleText: "Care to float along with me?",
  Route20Swimmer4BattleText: "Are you here on vacation too?",
  Route20Swimmer4EndBattleText: "You didn't hold back at all!",
  Route20Swimmer4AfterBattleText: "SEAFOAM used to be just one island!",
  Route20Swimmer5BattleText: "Check out these muscles of mine!",
  Route20Swimmer5EndBattleText: "So weak!",
  Route20Swimmer5AfterBattleText: "Guess I should've been training my POKéMON instead of myself!",
  Route20Swimmer6BattleText: "How come you're riding a POKéMON? Don't you know how to swim?",
  Route20Swimmer6EndBattleText: "Ouch! Torpedoed!",
  Route20Swimmer6AfterBattleText: "Riding on a POKéMON really does look like fun!",
  Route20CooltrainerMBattleText: "I flew all the way out here on my bird POKéMON!",
  Route20CooltrainerMEndBattleText: "Oh, no way!",
  Route20CooltrainerMAfterBattleText: "None of my birds can FLY me back home!",
  Route20Swimmer7BattleText: "My boyfriend gave me these huge PEARLs!",
  Route20Swimmer7EndBattleText: "Hands off my PEARLs!",
  Route20Swimmer7AfterBattleText: "Do you think my PEARLs will keep growing while they're inside CLOYSTER?",
  Route20Swimmer8BattleText: "I swam all the way here from CINNABAR ISLAND!",
  Route20Swimmer8EndBattleText: "What a letdown!",
  Route20Swimmer8AfterBattleText: "Wild POKéMON have taken over a deserted mansion on CINNABAR!",
  Route20Swimmer9BattleText: "There's a POKéMON LAB out west on CINNABAR.",
  Route20Swimmer9EndBattleText: "Hold on!",
  Route20Swimmer9AfterBattleText: "CINNABAR is actually a volcanic island!",
  Route20SeafoamIslandsSignText: "SEAFOAM ISLANDS",
});

// text/Route21.asm
Object.assign(G.TEXT, {
  Route21Fisher1BattleText: "Wondering if the fish are biting today?",
  Route21Fisher1EndBattleText: "Darn it!",
  Route21Fisher1AfterBattleText: "Nothing good's biting for me!",
  Route21Fisher2BattleText: "I reeled in a huge haul! Want to give it a shot?",
  Route21Fisher2EndBattleText: "Stupid MAGIKARP!",
  Route21Fisher2AfterBattleText: "All I ever seem to catch is MAGIKARP!",
  Route21Swimmer1BattleText: "The ocean cleanses both my body and my soul!",
  Route21Swimmer1EndBattleText: "Yikes!",
  Route21Swimmer1AfterBattleText: "I'm fond of the mountains too, honestly!",
  Route21Swimmer2BattleText: "Is there some problem with me swimming out here?",
  Route21Swimmer2EndBattleText: "That was a cheap shot!",
  Route21Swimmer2AfterBattleText: "Excuse me, I look like what, a spiked inner tube? Get lost!",
  Route21Swimmer3BattleText: "Every one of my POKéMON was caught out at sea!",
  Route21Swimmer3EndBattleText: "Diver down!!",
  Route21Swimmer3AfterBattleText: "So where did you catch your POKéMON?",
  Route21Swimmer4BattleText: "I'm actually competing in a triathlon right now!",
  Route21Swimmer4EndBattleText: "Huff... puff... huff...",
  Route21Swimmer4AfterBattleText: "I'm exhausted! But I've still got the cycling leg and the marathon to go!",
  Route21Swimmer5BattleText: "Ahh, feel that sun and that breeze!",
  Route21Swimmer5EndBattleText: "Yikes, I lost!",
  Route21Swimmer5AfterBattleText: "I got burned to a crisp out there!",
  Route21Fisher3BattleText: "Hey now, don't go scaring off the fish!",
  Route21Fisher3EndBattleText: "Sorry, I didn't mean that!",
  Route21Fisher3AfterBattleText: "I was just upset because nothing was biting.",
  Route21Fisher4BattleText: "Stick around with me until I get a bite!",
  Route21Fisher4EndBattleText: "Well, that passed the time.",
  Route21Fisher4AfterBattleText: "Wait, I've got a bite! Alright!",
});

// text/Route22.asm
Object.assign(G.TEXT, {
  Route22RivalBeforeBattleText1: "{RIVAL}: Well look who it is, {PLAYER}!\fHeading to the POKéMON LEAGUE, are you?\fForget it! I bet you don't even have a single BADGE!\fThe guard's not going to let you through!\fAnyway, have your POKéMON gotten any stronger?",
  Route22RivalAfterBattleText1: "Word is the POKéMON LEAGUE is full of tough trainers!\fI'll need to work out how to get past them!\fYou'd better quit stalling and get moving yourself!",
  Route22Rival1DefeatedText: "Aww, that was just a lucky win!",
  Route22Rival1VictoryText: "{RIVAL}: Huh? How come I've still only got 2 POKéMON?\fYou should be catching more too!",
  Route22RivalBeforeBattleText2: "{RIVAL}: Huh? {PLAYER}! Didn't expect to run into you out here!\fSo, off to the POKéMON LEAGUE too?\fYou've collected every BADGE as well? Not bad!\fWell then, {PLAYER}, I'll use you as my warm-up before the LEAGUE!\fLet's go!",
  Route22RivalAfterBattleText2: "That loosened me right up! Now I'm ready for the POKéMON LEAGUE!\f{PLAYER}, you still need more practice!\fBut hey, you already knew that! I'm out of here. Catch you later!",
  Route22Rival2DefeatedText: "What?!\fI just got careless there!",
  Route22Rival2VictoryText: "{RIVAL}: Ha ha! {PLAYER}! That's the best you've got? You're nowhere close to my level, pal!\fGo train some more! Loser!",
  Route22PokemonLeagueSignText: "POKéMON LEAGUE Front Gate",
});

// text/Route22Gate.asm
Object.assign(G.TEXT, {
  Route22GateGuardNoBoulderbadgeText: "Only trainers who've truly proven themselves are let through here.\fYou don't have the BOULDERBADGE yet!",
  Route22GateGuardICantLetYouPassText: "Rules are rules. I can't let you through.",
  Route22GateGuardGoRightAheadText: "Ah, that's the BOULDERBADGE all right! Go on through!",
});

// text/Route23.asm
Object.assign(G.TEXT, {
  Route23YouDontHaveTheBadgeYetText: "You're only allowed through here if you carry the {wNameBuffer} !\fYou don't have the {wNameBuffer} yet!\fYou'll need it to reach the POKéMON LEAGUE!",
  Route23OhThatIsTheBadgeText: "You're only allowed through here if you carry the {wNameBuffer} !\fOh! There's the {wNameBuffer} right there!",
  Route23GoRightAheadText: "All right then! Please, go on through!",
  Route23VictoryRoadGateSignText: "VICTORY ROAD GATE - POKéMON LEAGUE",
});

// text/Route24.asm
Object.assign(G.TEXT, {
  Route24CooltrainerM1YouBeatOurContestText: "Nice work! You've defeated all 5 of our contest trainers!",
  Route24CooltrainerM1YouJustEarnedAPrizeText: "You've just won yourself a fantastic prize!",
  Route24CooltrainerM1ReceivedNuggetText: "{PLAYER} got a {wStringBuffer} !",
  Route24CooltrainerM1NoRoomText: "You don't have any space for it!",
  Route24CooltrainerM1JoinTeamRocketText: "By the way, how about joining TEAM ROCKET?\fWe're an organization devoted to doing evil using POKéMON!\fWe've got equity, free lunch and the biggest GPU budget in KANTO!\fInterested in joining?\fYou sure about that?\fOh, come on, join us!\fI'm telling you to join!\fFine, you need some convincing!\fI'll make you an offer you can't refuse!",
  Route24CooltrainerM1DefeatedText: "Argh! You're really skilled!",
  Route24CooltrainerM1YouCouldBecomeATopLeaderText: "With skill like yours, you could rise to be a top leader in TEAM ROCKET!\fHead of Compute, even!",
  Route24CooltrainerM2BattleText: "I saw what you did from over in the grass!",
});

// text/Route24_2.asm
Object.assign(G.TEXT, {
  Route24CooltrainerM2EndBattleText: "Guess I was wrong about that!",
  Route24CooltrainerM2AfterBattleText: "I was hiding because the people on the bridge scared me!",
  Route24CooltrainerM3BattleText: "All right! I'm number 5! I'm going to crush you!",
  Route24CooltrainerM3EndBattleText: "Whoa, that was too much!",
  Route24CooltrainerM3AfterBattleText: "I gave it everything I had, no regrets here!",
  Route24CooltrainerF1BattleText: "I'm number 4! Starting to wear out yet?",
  Route24CooltrainerF1EndBattleText: "I lost too!",
  Route24CooltrainerF1AfterBattleText: "I put in my best effort, so I've got no regrets!",
  Route24Youngster1BattleText: "Here comes number 3! I won't go down easy!",
  Route24Youngster1EndBattleText: "Ow! Flattened!",
  Route24Youngster1AfterBattleText: "I gave it my all, no regrets!\f...Well, my AI coach gave it its all. Still no regrets!",
  Route24CooltrainerF2BattleText: "I'm number 2! Now it's getting serious!",
  Route24CooltrainerF2EndBattleText: "How could I possibly lose?",
  Route24CooltrainerF2AfterBattleText: "I did my absolute best, no regrets!",
  Route24Youngster2BattleText: "This is NUGGET BRIDGE! Beat all 5 of us trainers and win a fantastic prize!\fThink you've got what it takes?",
  Route24Youngster2EndBattleText: "Whoo, nice job!",
  Route24Youngster2AfterBattleText: "I gave it my all, no regrets here!",
});

// text/Route25.asm
Object.assign(G.TEXT, {
  Route25Youngster1BattleText: "Local trainers come out here to practice!",
  Route25Youngster1EndBattleText: "You're pretty good.",
  Route25Youngster1AfterBattleText: "Every POKéMON has weaknesses. It's smart to raise a mix of different kinds.",
  Route25Youngster2BattleText: "My dad brought me to an awesome party aboard the S.S.ANNE in VERMILION CITY!",
  Route25Youngster2EndBattleText: "I'm not upset about it!",
  Route25Youngster2AfterBattleText: "Aboard the S.S.ANNE, I saw trainers from all around the world.",
  Route25CooltrainerMBattleText: "I'm a pretty cool guy — I've even got a girlfriend! A real one, not an AI!",
  Route25CooltrainerMEndBattleText: "Aw, darn...",
  Route25CooltrainerMAfterBattleText: "Ah well. My girlfriend will cheer me up.",
  Route25CooltrainerF1BattleText: "Hi there! My boyfriend's a real cool guy!",
  Route25CooltrainerF1EndBattleText: "I wasn't in good shape today!",
  Route25CooltrainerF1AfterBattleText: "I wish my boyfriend were as skilled as you!",
  Route25Youngster3BattleText: "I just knew I'd end up battling you!",
  Route25Youngster3EndBattleText: "I knew I'd lose too!",
  Route25Youngster3AfterBattleText: "If your POKéMON gets confused or falls asleep, swap it out!",
  Route25CooltrainerF2BattleText: "My friend has such an adorable POKéMON, I'm so jealous!",
  Route25CooltrainerF2EndBattleText: "Guess I'm not so jealous now!",
  Route25CooltrainerF2AfterBattleText: "You just came from MT. MOON? Could you spare me a CLEFAIRY?",
  Route25Hiker1BattleText: "I only just came down off MT.MOON, but I'm still ready!",
  Route25Hiker1EndBattleText: "You really worked for that!",
  Route25Hiker1AfterBattleText: "Argh! A ZUBAT bit me while I was in there.",
  Route25Hiker2BattleText: "I'm heading out to meet a POKéMON collector at the cape!",
  Route25Hiker2EndBattleText: "You've got me beat.",
  Route25Hiker2AfterBattleText: "That collector owns all kinds of rare POKéMON.",
  Route25Hiker3BattleText: "Heading to see BILL, are you? Let's battle first!",
  Route25Hiker3EndBattleText: "You're really something.",
  Route25Hiker3AfterBattleText: "The trail down below is a shortcut over to CERULEAN CITY.",
  Route25BillSignText: "SEA COTTAGE - home of BILL!",
});

// text/Route2Gate.asm
Object.assign(G.TEXT, {
  Route2GateOaksAideFlashExplanationText: "HM FLASH can light up even the darkest of dungeons.",
  Route2GateYoungsterText: "Teach a POKéMON FLASH, and you'll be able to make it through ROCK TUNNEL.",
});

// text/Route2TradeHouse.asm
Object.assign(G.TEXT, {
  Route2TradeHouseScientistText: "A POKéMON that has fainted can't battle. Even so, it can still use field moves like CUT!",
});

// text/Route3.asm
Object.assign(G.TEXT, {
  Route3Text1: "Whew... I'd better catch my breath... Ugh...\fThat tunnel from CERULEAN really wears you out!",
  Route3Youngster1BattleText: "Hey, I remember you from VIRIDIAN FOREST!",
  Route3Youngster1EndBattleText: "You've beaten me again!",
  Route3Youngster1AfterBattleText: "There's more to POKéMON than just what's found in the forest!",
  Route3Youngster2BattleText: "Hey there! I love shorts — they're comfy and easy to wear!",
  Route3Youngster2EndBattleText: "I can't believe it!",
  Route3Youngster2AfterBattleText: "Do you keep your POKéMON stored on the PC? Each BOX can hold 20 POKéMON!",
  Route3CooltrainerF1BattleText: "You were staring at me, weren't you?",
  Route3CooltrainerF1EndBattleText: "That's just mean!",
  Route3CooltrainerF1AfterBattleText: "Stop staring if you don't want to battle!",
  Route3Youngster3BattleText: "Are you a trainer too? Let's battle!",
  Route3Youngster3EndBattleText: "I would've won with fresher POKéMON!",
  Route3Youngster3AfterBattleText: "When a POKéMON BOX on the PC fills up, just switch over to a different BOX!",
  Route3CooltrainerF2BattleText: "That look you're giving me, how fascinating!",
  Route3CooltrainerF2EndBattleText: "Play nice!",
  Route3CooltrainerF2AfterBattleText: "Stay out of sight if you want to avoid getting challenged!",
  Route3Youngster4BattleText: "Hey! How come you're not wearing shorts?",
  Route3Youngster4EndBattleText: "Lost! Lost! Lost!",
  Route3Youngster4AfterBattleText: "I wear shorts all year round, even through winter!",
  Route3Youngster5BattleText: "Go ahead and battle my brand-new POKéMON!",
  Route3Youngster5EndBattleText: "Cooked and served!",
  Route3Youngster5AfterBattleText: "A trained POKéMON beats a wild one every time!",
  Route3CooltrainerF3BattleText: "Eek! Did you just touch me?",
  Route3CooltrainerF3EndBattleText: "Is that all you've got?",
  Route3CooltrainerF3AfterBattleText: "ROUTE 4 sits right at the foot of MT.MOON.",
  Route3SignText: "ROUTE 3 MT.MOON AHEAD",
});

// text/Route4.asm
Object.assign(G.TEXT, {
  Route4CooltrainerF1Text: "Ouch! I tripped right over a GEODUDE, that rocky POKéMON!",
  Route4CooltrainerF2BattleText: "I came out here to gather my mushroom POKéMON!",
  Route4CooltrainerF2EndBattleText: "Oh no, my adorable mushroom POKéMON!",
  Route4CooltrainerF2AfterBattleText: "There might not be any mushrooms left around here.\fI think I've already gathered them all.",
  Route4MtMoonSignText: "MT.MOON Tunnel Entrance",
  Route4SignText: "ROUTE 4 MT.MOON - CERULEAN CITY",
});

// text/Route5.asm
Object.assign(G.TEXT, {
  Route5UndergroundPathSignText: "UNDERGROUND PATH CERULEAN CITY - VERMILION CITY",
});

// text/Route6.asm
Object.assign(G.TEXT, {
  Route6CooltrainerM1BattleText: "Who's over there? Stop eavesdropping on us!",
  Route6CooltrainerM1EndBattleText: "I just can't seem to win!",
  Route6CooltrainerAfterBattleText: "Mutter... mutter...",
  Route6CooltrainerF1BattleText: "Excuse me, this conversation is private!",
  Route6CooltrainerF1EndBattleText: "Ugh, I hate losing!",
  Route6Youngster1BattleText: "You won't find many bug POKéMON out this way.",
  Route6Youngster1EndBattleText: "No way, you're kidding me!",
  Route6Youngster1AfterBattleText: "I love bug POKéMON, so I'm heading back to VIRIDIAN FOREST.",
  Route6CooltrainerM2BattleText: "Wait, what? You're talking to me?",
  Route6CooltrainerM2EndBattleText: "I wasn't the one who started it!",
  Route6CooltrainerM2AfterBattleText: "I should really carry more POKéMON with me for safety.",
  Route6CooltrainerF2BattleText: "Me? All right then, I'll take you on!",
  Route6CooltrainerF2EndBattleText: "That just didn't pan out!",
  Route6CooltrainerF2AfterBattleText: "I'm determined to get tougher! Come on, what's your trick?",
  Route6Youngster2BattleText: "I haven't seen you around before! Are you any good?",
  Route6Youngster2EndBattleText: "You're way too good!",
  Route6Youngster2AfterBattleText: "Are my POKéMON just weak, or am I the problem?",
  Route6UndergroundPathSignText: "UNDERGROUND PATH CERULEAN CITY - VERMILION CITY",
});

// text/Route7.asm
Object.assign(G.TEXT, {
  Route7UndergroundPathSignText: "UNDERGROUND PATH CELADON CITY - LAVENDER TOWN",
});

// text/Route8.asm
Object.assign(G.TEXT, {
  Route8SuperNerd1BattleText: "You seem sharp with POKéMON, but how's your chemistry?",
  Route8SuperNerd1EndBattleText: "Ugh! Total meltdown!",
  Route8SuperNerd1AfterBattleText: "I do much better in the classroom than out here!",
  Route8Gambler1BattleText: "Okay, time to roll the dice!",
  Route8Gambler1EndBattleText: "Argh! Just short of a win!",
  Route8Gambler1AfterBattleText: "Luck just isn't with me today!",
  Route8SuperNerd2BattleText: "Winning this takes real strategy!",
  Route8SuperNerd2EndBattleText: "That makes no logical sense!",
  Route8SuperNerd2AfterBattleText: "Send out GRIMER first...and... ...and...then...\fERROR: Maximum context length exceeded.",
  Route8CooltrainerF1BattleText: "I love NIDORAN, so I collect every one I can!",
  Route8CooltrainerF1EndBattleText: "Why? Why??",
  Route8CooltrainerF1AfterBattleText: "Grown-up POKéMON just look worse! They shouldn't have to evolve!",
  Route8SuperNerd3BattleText: "Studying's fun, but so is POKéMON battling.",
  Route8SuperNerd3EndBattleText: "Guess I'll stick to schoolwork.",
  Route8SuperNerd3AfterBattleText: "We're stuck here thanks to those gates at SAFFRON.",
  Route8CooltrainerF2BattleText: "MEOWTH is just adorable, meow, meow, meow!",
  Route8CooltrainerF2EndBattleText: "Meow!",
  Route8CooltrainerF2AfterBattleText: "PIDGEY and RATTATA are pretty cute too, I think!",
  Route8CooltrainerF3BattleText: "We probably look ridiculous just standing around like this!",
  Route8CooltrainerF3EndBattleText: "Look at what you've done!",
  Route8CooltrainerF3AfterBattleText: "SAFFRON's gatekeeper won't let us pass. Such a grump!",
  Route8Gambler2BattleText: "I'm just a wandering, gambling kind of guy!",
  Route8Gambler2EndBattleText: "Missed my big payout!",
  Route8Gambler2AfterBattleText: "Betting and POKéMON are like eating peanuts! Once you start, you can't stop!\fSame goes for buying AI tokens!",
  Route8CooltrainerF4BattleText: "Name me a round, fluffy, adorable POKéMON!",
  Route8CooltrainerF4EndBattleText: "Stop!\fQuit being so rough on my CLEFAIRY!",
  Route8CooltrainerF4AfterBattleText: "I've heard CLEFAIRY evolves if it's exposed to a MOON STONE.",
  Route8UndergroundSignText: "UNDERGROUND PATH CELADON CITY - LAVENDER TOWN",
});

// text/Route9.asm
Object.assign(G.TEXT, {
  Route9CooltrainerF1BattleText: "You've got POKéMON on you! That makes you mine!",
  Route9CooltrainerF1EndBattleText: "You tricked me!",
  Route9CooltrainerF1AfterBattleText: "That tunnel ahead is pitch black—you'll need some light to cross it.",
  Route9CooltrainerM1BattleText: "Who's this, strolling around with such fine-looking POKéMON?",
  Route9CooltrainerM1EndBattleText: "Lights out for me!",
  Route9CooltrainerM1AfterBattleText: "Just keep on walking!",
  Route9CooltrainerM2BattleText: "I'm heading through ROCK TUNNEL to reach LAVENDER...",
  Route9CooltrainerM2EndBattleText: "I just don't measure up!",
  Route9CooltrainerM2AfterBattleText: "Heading to ROCK TUNNEL as well?",
  Route9CooltrainerF2BattleText: "Don't you dare look down on me!",
  Route9CooltrainerF2EndBattleText: "No way! You're incredible!",
  Route9CooltrainerF2AfterBattleText: "You've clearly got real talent! Best of luck out there!",
  Route9Hiker1BattleText: "Bwahaha! Perfect timing, I was bored stiff, eh!",
  Route9Hiker1EndBattleText: "Bring it on, eh!\fOh, hang on. I'm out of POKéMON!",
  Route9Hiker1AfterBattleText: "Took some nerve to stand up to me like that, eh?",
  Route9Hiker2BattleText: "Hahaha! Aren't you a tough little one!",
  Route9Hiker2EndBattleText: "What was that?",
  Route9Hiker2AfterBattleText: "Hahaha! Kids ought to be tough!",
  Route9Youngster1BattleText: "I got up early every single day to raise my POKéMON straight from cocoons!",
  Route9Youngster1EndBattleText: "WHAT?\fWhat a complete waste of my time!",
  Route9Youngster1AfterBattleText: "Guess I need more than just bugs to get stronger...",
  Route9Hiker3BattleText: "Hahahaha! Bring it on, buddy!",
  Route9Hiker3EndBattleText: "Hahahaha! You won that fair and square!",
  Route9Hiker3AfterBattleText: "Hahahaha! We tough guys are always laughing!",
  Route9Youngster2BattleText: "Go get 'em, my amazing bug POKéMON!",
  Route9Youngster2EndBattleText: "My poor bugs...",
  Route9Youngster2AfterBattleText: "Anyone who doesn't like bug POKéMON bugs me!",
  Route9SignText: "ROUTE 9 CERULEAN CITY- ROCK TUNNEL",
});

// text/SSAnne1F.asm
Object.assign(G.TEXT, {
  SSAnne1FWaiterText: "Bonjour! I'm the waiter aboard this fine ship!\fIt would be my pleasure to bring you anything you like!\fAh! Zee strong, silent type, I see!",
  SSAnne1FSailorText: "The passengers on board are getting restless!\fThe more bored ones might just challenge you to a battle!",
});

// text/SSAnne1FRooms.asm
Object.assign(G.TEXT, {
  SSAnne1FRoomsWigglytuffText: "WIGGLYTUFF: Puwii puuu!",
  SSAnne1FRoomsGentleman1BattleText: "I always travel solo on my journeys!\fMy POKéMON are the only friends I need!",
  SSAnne1FRoomsGentleman1EndBattleText: "Oh... my friends...",
  SSAnne1FRoomsGentleman1AfterBattleText: "You ought to treat your friends kindly!",
  SSAnne1FRoomsGentleman2BattleText: "You little pup! How dare you barge in here!",
  SSAnne1FRoomsGentleman2EndBattleText: "Humph! What a rude child!",
  SSAnne1FRoomsGentleman2AfterBattleText: "I'd like to be left in peace! Get out!",
  SSAnne1FRoomsYoungsterBattleText: "I really love POKéMON! How about you?",
  SSAnne1FRoomsYoungsterEndBattleText: "Wow!  You're amazing!",
  SSAnne1FRoomsYoungsterAfterBattleText: "Let's be friends, okay?\fThen we can trade POKéMON sometime!",
  SSAnne1FRoomsCooltrainerFBattleText: "I gathered all these POKéMON from every corner of the globe!",
  SSAnne1FRoomsCooltrainerFEndBattleText: "Oh no! I traveled the whole world for these!",
  SSAnne1FRoomsCooltrainerFAfterBattleText: "You injured my well-traveled POKéMON!\fGo heal them at a POKéMON CENTER, I insist!",
  SSAnne1FRoomsGirl1Text: "Waiter, could I please get a slice of cherry pie?",
  SSAnne1FRoomsMiddleAgedManText: "There's something so classy yet comfortable about a cruise!\fNo wi-fi, no agents pinging me. My first real holiday in years!",
  SSAnne1FRoomsLittleGirlText: "I never travel without my WIGGLYTUFF!",
  SSAnne1FRoomsGirl2Text: "We're sailing all around the world on this trip.",
  SSAnne1FRoomsGentleman3Text: "Shh! I work for the GLOBAL POLICE!\fI'm currently tracking down TEAM ROCKET!\fWord is they're stockpiling something called 'compute'.",
});

// text/SSAnne2F.asm
Object.assign(G.TEXT, {
  SSAnne2FWaiterText: "This vessel is a luxury liner built for trainers!\fAt every port we stop at, we throw parties for invited trainers!",
  SSAnne2FRivalText: "{RIVAL}: Well, well, {PLAYER}!\fFancy running into you here!\f{PLAYER}, did you actually get invited?\fAnyway, how's your POKéDEX filling up?\fI've already caught 40 different kinds, pal!\fThey're hiding everywhere, you know!\fJust search through the tall grass!",
  SSAnne2FRivalDefeatedText: "Humph!\fWell, at least you're training your POKéMON properly!",
  SSAnne2FRivalVictoryText: "{PLAYER}! What's wrong, seasick or something?\fYou need to toughen up, pal!",
  SSAnne2FRivalCutMasterText: "{RIVAL}: I heard there's a CUT expert somewhere on this ship.\fTurned out to just be some old guy feeling seasick!\fStill, CUT itself is genuinely useful!\fGo find him yourself! Catch you later!",
});

// text/SSAnne2FRooms.asm
Object.assign(G.TEXT, {
  SSAnne2FRoomsGentleman3Text: "I've traveled everywhere, and I've never seen a POKéMON sleep quite like this one did!\fIt looked something like this!",
  SSAnne2FRoomsGentleman4Text: "Ah, yes, I've witnessed certain POKéMON ferrying people across the water!",
  SSAnne2FRoomsGrampsText: "Some POKéMON know CUT and can slice through small bushes.",
  SSAnne2FRoomsGentleman5Text: "Have you ever visited the SAFARI ZONE in FUCHSIA CITY?\fIt's packed with all sorts of rare POKéMON!!",
  SSAnne2FRoomsLittleBoyText: "My dad and I both think the SAFARI ZONE is fantastic!",
  SSAnne2FRoomsBrunetteGirlText: "The CAPTAIN looked terribly pale and unwell!",
  SSAnne2FRoomsBeautyText: "I hear quite a lot of people get seasick on cruises!",
  SSAnne2FRoomsGentleman1BattleText: "Battling younger trainers keeps me feeling young myself.",
  SSAnne2FRoomsGentleman1EndBattleText: "Great match! Ah, I feel young again!",
  SSAnne2FRoomsGentleman1AfterBattleText: "Fifteen years back, I'd have beaten you easily!",
  SSAnne2FRoomsFisherBattleText: "Take a look at what I reeled in!",
  SSAnne2FRoomsFisherEndBattleText: "That's all I've got left!",
  SSAnne2FRoomsFisherAfterBattleText: "A party?\fThe ship's party should have wrapped up by now.",
  SSAnne2FRoomsGentleman2BattleText: "Which would you rather have, a strong POKéMON or a rare one?",
  SSAnne2FRoomsGentleman2EndBattleText: "I have to hand it to you!",
  SSAnne2FRoomsGentleman2AfterBattleText: "Personally, I'd rather have a POKéMON that's strong and rare.",
  SSAnne2FRoomsCooltrainerFBattleText: "I don't recall seeing you at the party.",
  SSAnne2FRoomsCooltrainerFEndBattleText: "Take care of yourself!",
  SSAnne2FRoomsCooltrainerFAfterBattleText: "Oh, I just love how strong your POKéMON are!",
});

// text/SSAnne3F.asm
Object.assign(G.TEXT, {
  SSAnne3FSailorText: "Our CAPTAIN is quite the swordsman!\fHe's even skilled enough to teach CUT to POKéMON!",
});

// text/SSAnneB1FRooms.asm
Object.assign(G.TEXT, {
  SSAnneB1FRoomsMachokeText: "MACHOKE: Groh! Goggah!",
  SSAnneB1FRoomsSailor1BattleText: "You've heard the saying about sailors and battling, right!",
  SSAnneB1FRoomsSailor1EndBattleText: "Aye! Nice battle, mate!",
  SSAnneB1FRoomsSailor1AfterBattleText: "Haha! Fancy becoming a sailor yourself, mate?",
  SSAnneB1FRoomsSailor2BattleText: "My pride as a sailor is riding on this!",
  SSAnneB1FRoomsSailor2EndBattleText: "Your fighting spirit sank me!",
  SSAnneB1FRoomsSailor2AfterBattleText: "Have you met the FISHING GURU over in VERMILION CITY?",
  SSAnneB1FRoomsSailor3BattleText: "We sailors keep POKéMON too, you know!",
  SSAnneB1FRoomsSailor3EndBattleText: "All right,  not bad at all.",
  SSAnneB1FRoomsSailor3AfterBattleText: "Every one of our POKéMON was caught out on the open sea!",
  SSAnneB1FRoomsSailor4BattleText: "I've got a soft spot for spirited kids like you!",
  SSAnneB1FRoomsSailor4EndBattleText: "Argh! I've lost this one!",
  SSAnneB1FRoomsSailor4AfterBattleText: "POKéMON of the sea stay in deep water. You'll need a ROD!",
  SSAnneB1FRoomsSailor5BattleText: "Matey, lose this fight and it's the plank for you!",
  SSAnneB1FRoomsSailor5EndBattleText: "Argh! Beaten by a mere kid!",
  SSAnneB1FRoomsSailor5AfterBattleText: "Every now and then a jellyfish drifts right into the ship.",
  SSAnneB1FRoomsFisherBattleText: "Hey there, stranger! Stick around a moment!\fEvery POKéMON I own came from the sea!",
  SSAnneB1FRoomsFisherEndBattleText: "Darn it! That one got away from me!",
  SSAnneB1FRoomsFisherAfterBattleText: "I was actually hoping to make you my assistant too!",
  SSAnneB1FRoomsSuperNerdText: "My pal MACHOKE here is incredibly powerful!\fHe's got enough STRENGTH to shove huge boulders aside!",
});

// text/SSAnneBow.asm
Object.assign(G.TEXT, {
  SSAnneBowSuperNerdText: "The party's wrapped up. This ship will be setting sail again shortly.",
  SSAnneBowSailor1Text: "Scrubbing these decks sure is tough work!",
  SSAnneBowCooltrainerMText: "Ugh. I'm not feeling well.\fCame out here for some fresh air.",
  SSAnneBowSailor2BattleText: "Ahoy, matey!\fFancy dancing a little jig with me?",
  SSAnneBowSailor2EndBattleText: "You're quite impressive!",
  SSAnneBowSailor2AfterBattleText: "How many different kinds of POKéMON do you reckon exist?",
  SSAnneBowSailor3BattleText: "Ahoy there! You feeling seasick or something?",
  SSAnneBowSailor3EndBattleText: "I just wasn't paying attention!",
  SSAnneBowSailor3AfterBattleText: "My Pa always said there's 100 kinds of POKéMON. I reckon there's more.",
});

// text/SSAnneCaptainsRoom.asm
Object.assign(G.TEXT, {
  SSAnneCaptainsRoomRubCaptainsBackText: "CAPTAIN: Ohh... I feel just awful... Urrp! So seasick...\f{PLAYER} gave the CAPTAIN's back a gentle rub!\fRub-a-rub... Rub-a-rub...",
  SSAnneCaptainsRoomCaptainIFeelMuchBetterText: "CAPTAIN: Whew! I appreciate that! I'm feeling so much better now!\fWould you like to see my CUT technique?\fI'd show you myself if I weren't still under the weather...\fTell you what! Take this instead!\fTeach it to one of your POKéMON, and you'll get to watch CUT in action whenever you like!",
  SSAnneCaptainsRoomCaptainReceivedHM01Text: "{PLAYER} received {wStringBuffer}!",
  SSAnneCaptainsRoomCaptainNotSickAnymoreText: "CAPTAIN: Whew!\fSeeing as I'm not seasick any longer, I suppose it's time to get moving.",
  SSAnneCaptainsRoomCaptainHM01NoRoomText: "Oh no! There's no space in your bag for this!",
  SSAnneCaptainsRoomTrashText: "Ugh! I really shouldn't have looked in there!",
  SSAnneCaptainsRoomSeasickBookText: "How to Conquer Seasickness... This is the book the CAPTAIN is reading!",
});

// text/SSAnneKitchen.asm
Object.assign(G.TEXT, {
  SSAnneKitchenCook1Text: "You there, little one! We're swamped in here! Move along!",
  SSAnneKitchenCook2Text: "I spotted some strange ball sitting in the trash.",
  SSAnneKitchenCook3Text: "I've got so much work I'm getting light-headed!",
  SSAnneKitchenCook4Text: "Hum-de-hum-de- hoo...\fEvery single day, it's peeling potatoes! Hum-hum...\fThey said AI would take the boring jobs first. Liars!",
  SSAnneKitchenCook5Text: "Have you heard about SNORLAX?\fThat thing does nothing but eat and sleep!",
  SSAnneKitchenCook6Text: "Sniffle...Sniff...\fAll I ever get stuck peeling is onions... Sniffle...",
  SSAnneKitchenCook7MainCourseIsText: "Ahem! Yes, I am indeed le CHEF!\fZee main course today is",
  SSAnneKitchenCook7SalmonDuSaladText: "Salmon du Salad!\fZee guests might grumble it's fish again, but so be it!",
  SSAnneKitchenCook7EelsAuBarbecueText: "Eels au Barbecue!\fI fear zee guests may stage a mutiny!",
  SSAnneKitchenCook7PrimeBeefSteakText: "Prime Beef Steak!\fThough, do I even have enough beef fillets on hand?",
});

// text/SafariZoneCenter.asm
Object.assign(G.TEXT, {
  SafariZoneCenterRestHouseSignText: "REST HOUSE",
  SafariZoneCenterTrainerTipsSignText: "TRAINER TIPS\fHit START to see how much time you have left!",
});

// text/SafariZoneCenterRestHouse.asm
Object.assign(G.TEXT, {
  SafariZoneCenterRestHouseGirlText: "SARA: Have you seen my boyfriend ERIK anywhere?",
  SafariZoneCenterRestHouseScientistText: "I'm rounding up POKéMON as souvenirs for the folks back home!",
});

// text/SafariZoneEast.asm
Object.assign(G.TEXT, {
  SafariZoneEastRestHouseSignText: "REST HOUSE",
  SafariZoneEastTrainerTipsText: "TRAINER TIPS\fYour clock only ticks down while you're moving!",
  SafariZoneEastSignText: "CENTER AREA NORTH: AREA 2",
});

// text/SafariZoneEastRestHouse.asm
Object.assign(G.TEXT, {
  SafariZoneEastRestHouseScientistText: "So what's your catch count? All this walking has worn me out!",
  SafariZoneEastRestHouseRockerText: "Caught myself a CHANSEY! The whole trip was worth it for that alone!",
  SafariZoneEastRestHouseSilphWorkerMText: "Phew! I've had a blast, but I'm exhausted!\fFirst day off since SILPH kicked off its big training run!",
});

// text/SafariZoneGate.asm
Object.assign(G.TEXT, {
  SafariZoneGateSafariZoneWorker1Text: "Step right up to the SAFARI ZONE!",
  SafariZoneGateSafariZoneWorker1WouldYouLikeToJoinText: "Pay just ¥500 and catch as many POKéMON as you like inside the park!\fCare to give it a try?",
  SafariZoneGateSafariZoneWorker1ThatllBe500PleaseText: "¥500, coming right up!\fInside, you'll only be using our special POKé BALL.\f{PLAYER} received 30 SAFARI BALLs!",
  SafariZoneGateSafariZoneWorker1CallYouOnThePAText: "We'll page you over the PA once your time or your SAFARI BALLs run out!",
  SafariZoneGateSafariZoneWorker1PleaseComeAgainText: "All right! Come back and visit again!",
  SafariZoneGateSafariZoneWorker1NotEnoughMoneyText: "Uh oh! You're short on cash!",
  SafariZoneGateSafariZoneWorker1LeavingEarlyText: "Heading out already?",
  SafariZoneGateSafariZoneWorker1ReturnSafariBallsText: "Be sure to hand back any leftover SAFARI BALLs.",
  SafariZoneGateSafariZoneWorker1GoodLuckText: "Best of luck out there!",
  SafariZoneGateSafariZoneWorker1GoodHaulComeAgainText: "Bring home anything good? Come see us again!",
  SafariZoneGateSafariZoneWorker2FirstTimeHereText: "Hey there! First visit to the SAFARI ZONE?",
  SafariZoneGateSafariZoneWorker2SafariZoneExplanationText: "The SAFARI ZONE is split into 4 separate areas.\fEach one is home to its own set of POKéMON. SAFARI BALLs are the only way to catch them in here!\fRun out of time or out of SAFARI BALLs and your visit ends right there!\fBefore heading in, clear out a POKéMON BOX so you've got space for new catches!",
  SafariZoneGateSafariZoneWorker2YoureARegularHereText: "Ha, look who's back again!",
});

// text/SafariZoneNorth.asm
Object.assign(G.TEXT, {
  SafariZoneNorthRestHouseSignText: "REST HOUSE",
  SafariZoneNorthTrainerTips1Text: "TRAINER TIPS\fKeep going — the SECRET HOUSE is somewhere up ahead!",
  SafariZoneNorthSignText: "AREA 2",
  SafariZoneNorthTrainerTips2Text: "TRAINER TIPS\fPOKéMON like to hide in tall grass!\fWeave back and forth through it to scare them into view.",
  SafariZoneNorthTrainerTips3Text: "TRAINER TIPS\fFind the SECRET HOUSE and earn yourself a free HM!",
});

// text/SafariZoneNorthRestHouse.asm
Object.assign(G.TEXT, {
  SafariZoneNorthRestHouseScientistText: "Any item lying on the ground here is yours for the taking.\fJust don't chase down every single one — you'll burn through your time!",
  SafariZoneNorthRestHouseSafariZoneWorkerText: "Make your way to the far end of the SAFARI ZONE and a prize is waiting for you!",
  SafariZoneNorthRestHouseGentlemanText: "My EEVEE turned into a FLAREON!\fBut a buddy of mine had his turn into a VAPOREON instead! Strange, huh?",
});

// text/SafariZoneSecretHouse.asm
Object.assign(G.TEXT, {
  SafariZoneSecretHouseFishingGuruYouHaveWonText: "At last, someone made it!\fYou're the very first to reach the SECRET HOUSE!\fI'd started to think nobody would ever claim our campaign prize.\fWell done — it's all yours!",
  SafariZoneSecretHouseFishingGuruReceivedHM03Text: "{PLAYER} received {wStringBuffer} !",
  SafariZoneSecretHouseFishingGuruHM03ExplanationText: "HM03 holds SURF!\fWith it, a POKéMON can carry you right across open water!\fBest of all, it's reusable — no limit on how many times you use it!\fYou got incredibly lucky landing this one!",
  SafariZoneSecretHouseFishingGuruHM03NoRoomText: "There's no space in your bag for a prize this good!",
});

// text/SafariZoneWest.asm
Object.assign(G.TEXT, {
  SafariZoneWestRestHouseSignText: "REST HOUSE",
  SafariZoneWestFindWardensTeethSignText: "REQUEST NOTICE\fThe SAFARI WARDEN misplaced his GOLD TEETH somewhere nearby.\fA reward is offered! Ask for: WARDEN",
  SafariZoneWestTrainerTipsText: "TRAINER TIPS\fZone Exploration Campaign!\fTrack down the SECRET HOUSE!",
  SafariZoneWestSignText: "AREA 3 EAST: CENTER AREA",
});

// text/SafariZoneWestRestHouse.asm
Object.assign(G.TEXT, {
  SafariZoneWestRestHouseScientistText: "Throw a ROCK near a POKéMON and it might bolt, but it'll also be less likely to fight back — easier to catch.",
  SafariZoneWestRestHouseCooltrainerMText: "Toss some BAIT and POKéMON get much easier to catch.",
  SafariZoneWestRestHouseSilphWorkerFText: "I walked for ages and never spotted a POKéMON worth catching.",
});

// text/SaffronCity.asm
Object.assign(G.TEXT, {
  SaffronCityRocket1Text: "Whaddya want? Beat it!",
  SaffronCityRocket2Text: "The BOSS says this whole town belongs to us now! Data center and all!",
  SaffronCityRocket3Text: "Move it, you're in my way!",
  SaffronCityRocket4Text: "SAFFRON is TEAM ROCKET turf now!",
  SaffronCityRocket5Text: "There's nothing like a little villainy to get the blood pumping!\fExcept maybe a fresh rack of GPUs!",
  SaffronCityRocket6Text: "Hey! Watch your step!",
  SaffronCityRocket7Text: "Once SILPH is ours, so are their GPUs!\fThen we can squeeze POKéMON resources out of the whole planet!",
  SaffronCityScientistText: "You took down TEAM ROCKET single-handed? Incredible!",
  SaffronCitySilphWorkerMText: "TEAM ROCKET's cleared out! We can finally walk around without worry!",
  SaffronCitySilphWorkerFText: "SAFFRON should be busy again in no time now.",
  SaffronCityGentlemanText: "I hopped on my PIDGEOT the moment I heard about SILPH.\fAnd it's already wrapped up? Darn, I missed all the excitement.",
  SaffronCityPidgeotText: "PIDGEOT: Kreeaah!",
  SaffronCityRockerText: "I watched the ROCKET BOSS bolt out of the SILPH building.",
  SaffronCityRocket8Text: "Security's my job here.\fShifty-looking kids don't get past me!",
  SaffronCityRocket9Text: "...Zzzz...\fHeh, would you look at that — he's out cold!",
  SaffronCitySignText: "SAFFRON CITY A Glittering Hub of Trade",
  SaffronCityFightingDojoSignText: "FIGHTING DOJO",
  SaffronCityGymSignText: "SAFFRON CITY POKéMON GYM LEADER: SABRINA\fMistress of Psychic POKéMON!",
  SaffronCityTrainerTips1Text: "TRAINER TIPS\fA FULL HEAL clears up every status problem, sleep and burns included.\fPricier, sure, but so much more convenient.",
  SaffronCityTrainerTips2Text: "TRAINER TIPS\fThe GREAT BALL gives you better odds of a catch.\fSave it for those stubborn POKéMON.",
  SaffronCitySilphCoSignText: "SILPH CO. OFFICE BUILDING",
  SaffronCityMrPsychicsHouseSignText: "MR.PSYCHIC's HOUSE",
  SaffronCitySilphCoLatestProductSignText: "SILPH's newest creation: a frontier model!\fRelease date: 'in two weeks'. Still unknown...",
});

// text/SaffronGates.asm
Object.assign(G.TEXT, {
  SaffronGateGuardGeeImThirstyText: "On duty here. Boy, could I use a drink right now!\fThe data center next door drank the whole reservoir to cool its GPUs.\fOh, and sorry — this road's shut for now.",
  SaffronGateGuardImParchedText: "Man, my throat is dry! ...Huh, you'll give me that? Much appreciated!",
  SaffronGateGuardYouCanGoOnThroughText: "...Gulp... ...ahh... If SAFFRON CITY's where you're headed... ...go right on through. I'll pass one of these to the rest of the guards too!",
  SaffronGateGuardThanksForTheDrinkText: "Hey, appreciate the cold drink!",
});

// text/SaffronGym.asm
Object.assign(G.TEXT, {
  SaffronGymSabrinaText: "I foresaw you coming here!\fI've had psychic abilities since I was little.\fSpoon-bending was actually the first trick I picked up.\fI'm not fond of battling, but since you're here, let me show you what I can do!",
  SaffronGymSabrinaReceivedMarshBadgeText: "Well, this is a surprise! A loss is still a loss, though.\fI'll admit I didn't train hard enough to win this one!\fThe MARSHBADGE is yours!",
  SaffronGymSabrinaPostBattleAdviceText: "Psychic power lives in everyone! Most people just never realize it!",
  SaffronGymSabrinaMarshBadgeInfoText: "The MARSHBADGE keeps POKéMON up to L70 listening to you!\fPush past that and stronger POKéMON may go wild and stop taking orders mid-battle!\fSo be careful not to overtrain them!\fOh, and take this TM before you go!",
  SaffronGymSabrinaReceivedTM46Text: "{PLAYER} received TM46!",
  TM46ExplanationText: "TM46 teaches PSYWAVE! A blast of psychic energy that damages the target!",
  SaffronGymSabrinaTM46NoRoomText: "Your bag's already stuffed full of other things!",
  SaffronGymGuideChampInMakingText: "Hey there, future champ!\fSABRINA's team fights with pure psychic power, not brute force!\fFIGHTING types don't stand a chance against psychic POKéMON!\fThey're beaten before they can land a single punch!",
  SaffronGymGuideBeatSabrinaText: "Psychic powers, eh?\fIf I had those, I'd be cleaning up at the slot machines!",
  SaffronGymChanneler1BattleText: "SABRINA's younger than me, but I still look up to her!",
  SaffronGymChanneler1EndBattleText: "That wasn't enough!",
  SaffronGymChanneler1AfterBattleText: "When two sides are evenly matched, it's willpower that decides the fight!\fIf you want to beat SABRINA, stay focused on winning!",
  SaffronGymYoungster1BattleText: "Does a power you can't even see scare you?",
  SaffronGymYoungster1EndBattleText: "I never saw that coming!",
  SaffronGymYoungster1AfterBattleText: "Psychic POKéMON are only afraid of ghost and bug types!",
  SaffronGymChanneler2BattleText: "A POKéMON starts to resemble its trainer over time.\fSo yours must be pretty tough!",
  SaffronGymChanneler2EndBattleText: "Just as I figured!",
  SaffronGymChanneler2AfterBattleText: "Time to teach my POKéMON some sharper moves!",
  SaffronGymYoungster2BattleText: "Strength on its own won't cut it, you know!",
  SaffronGymYoungster2EndBattleText: "I can't believe it!",
  SaffronGymYoungster2AfterBattleText: "SABRINA just cleaned out the KARATE MASTER right next door!",
  SaffronGymChanneler3BattleText: "It's settled — our POKéMON will decide this!",
  SaffronGymChanneler3EndBattleText: "Beaten after all!",
  SaffronGymChanneler3AfterBattleText: "I had a feeling this was exactly how it would go.",
  SaffronGymYoungster3BattleText: "SABRINA may be young, but she's still our LEADER!\fGetting past her won't be simple!",
  SaffronGymYoungster3EndBattleText: "I lost my nerve!",
  SaffronGymYoungster3AfterBattleText: "SAFFRON used to have 2 POKéMON GYMs.\fThe FIGHTING DOJO next door lost its GYM status after we thrashed them!",
  SaffronGymYoungster4BattleText: "The SAFFRON GYM is famous for its psychics!\fI can tell — you're here for SABRINA!",
  SaffronGymYoungster4EndBattleText: "Gyaaah!",
  SaffronGymYoungster4AfterBattleText: "Yep, that's right! I read your thoughts with telepathy!\fOr I predicted your next token. Same thing, really.",
});

// text/SaffronMart.asm
Object.assign(G.TEXT, {
  SaffronMartSuperNerdText: "MAX REPEL keeps weaker POKéMON away way longer than SUPER REPEL does!",
  SaffronMartCooltrainerFText: "REVIVE isn't cheap, but it'll bring a fainted POKéMON right back!",
});

// text/SaffronPidgeyHouse.asm
Object.assign(G.TEXT, {
  SaffronPidgeyHouseBrunetteGirlText: "Thanks so much for the letter. Hope to see you before long!\fHey! Quit peeking at what I wrote!",
  SaffronPidgeyHousePidgeyText: "PIDGEY: Coorukk!",
  SaffronPidgeyHouseYoungsterText: "COPYCAT is just adorable! I'm picking her out a POKé DOLL!",
  SaffronPidgeyHousePaperText: "Somebody gave me a PP UP as a present.\fIt boosts how much PP a technique has!",
});

// text/SaffronPokecenter.asm
Object.assign(G.TEXT, {
  SaffronPokecenterBeautyText: "Every species of POKéMON grows at its own pace.\fAI, on the other hand, doubles every few months. Can you feel the AGI?",
  SaffronPokecenterGentlemanText: "SILPH CO. runs the biggest GPU cluster in KANTO.\fThat's exactly why TEAM ROCKET went after it!",
});

// text/SeafoamIslandsB4F.asm
Object.assign(G.TEXT, {
  SeafoamIslandsB4FArticunoBattleText: "Kyaaah!",
  SeafoamIslandsB4FBouldersSignText: "Shifting a boulder could redirect the water's flow!",
  SeafoamIslandsB4FDangerSignText: "DANGER Strong current!",
});

// text/SilphCo10F.asm
Object.assign(G.TEXT, {
  SilphCo10FSilphWorkerFImScaredText: "Waaah! I'm so scared!",
  SilphCo10FSilphWorkerFQuietAboutMyCryingText: "Please don't tell anyone you saw me crying!",
  SilphCo10FRocketBattleText: "Welcome to floor 10! Glad you could make it!",
  SilphCo10FRocketEndBattleText: "I can't believe it!",
  SilphCo10FRocketAfterBattleText: "Not bad, but the boardroom's still one floor up!",
  SilphCo10FScientistBattleText: "Enough playing around already!",
  SilphCo10FScientistEndBattleText: "Out of tries!",
  SilphCo10FScientistAfterBattleText: "Happy now that you've beaten me? Go on home!",
});

// text/SilphCo11F.asm
Object.assign(G.TEXT, {
  SilphCo11FSilphPresidentText: "PRESIDENT: You saved SILPH — thank you!\fI won't ever forget what you did for us in our darkest hour!\fI simply must repay you somehow!\fMoney is no object for me, so name anything you'd like!\fHere, perhaps this will do the trick!",
  SilphCo11FSilphPresidentReceivedMasterBallText: "{PLAYER} got a {wStringBuffer} !",
  SilphCo11FSilphPresidentMasterBallDescriptionText: "PRESIDENT: There's nowhere you could buy this!\fIt's our confidential prototype, the MASTER BALL!\fIt's guaranteed to catch any POKéMON, no exceptions!\fBut you'd best not go around talking about it.",
  SilphCo11FSilphPresidentNoRoomText: "You've got nowhere to put this.",
  SilphCo11FBeautyText: "SECRETARY: Thank you for freeing all of us!\fYour courage is really something.",
  SilphCo11FGiovanniText: "Well, {PLAYER}! Our paths cross again!\fThe PRESIDENT and I are discussing important business. Namely, his GPUs.\fStay out of matters that don't concern kids...\fUnless you'd rather learn the hard way!",
  SilphCo11FGiovanniILostAgainText: "Argh! Beaten again!?",
  SilphCo11FGiovanniYouRuinedOurPlansText: "Curses! You've wrecked our plans here at SILPH!\fStill, TEAM ROCKET won't be finished so easily!\f{PLAYER}! Remember this — every POKéMON exists to serve TEAM ROCKET!\fI must be off, but this isn't over!",
  SilphCo11FRocket1BattleText: "Freeze right there! Not another step!",
  SilphCo11FRocket1EndBattleText: "Please... don't!",
  SilphCo11FRocket1AfterBattleText: "So, here to see my BOSS, are you?",
  SilphCo11FRocket2BattleText: "Stop! Did my BOSS schedule a meeting with you?",
  SilphCo11FRocket2EndBattleText: "Gaah! Crushed!",
  SilphCo11FRocket2AfterBattleText: "Careful — my BOSS keeps some seriously tough POKéMON!",
  SilphCo11FPorygonText: "There's a POKéMON right on the screen! It's asking for more context.",
});

// text/SilphCo1F.asm
Object.assign(G.TEXT, {
  SilphCo1FLinkReceptionistText: "Hello there!\fThe PRESIDENT's up in the boardroom, floor 11!",
});

// text/SilphCo2F.asm
Object.assign(G.TEXT, {
  SilphCo2FSilphWorkerFPleaseTakeThisText: "Eek! No, please, help!\fOh — wait, you're not with TEAM ROCKET. Sorry about that. Here, take this, please!",
  SilphCo2FSilphWorkerFReceivedTM36Text: "{PLAYER} got {wStringBuffer} !",
  SilphCo2FSilphWorkerFTM36ExplanationText: "TM36 teaches SELFDESTRUCT!\fDevastating power, but the user faints afterward! Use it wisely.",
  SilphCo2FSilphWorkerFTM36NoRoomText: "You haven't got space for this one.",
  SilphCo2FScientist1BattleText: "Please help, I actually work at SILPH!",
  SilphCo2FScientist1EndBattleText: "How'd you figure out I was a ROCKET?",
  SilphCo2FScientist1AfterBattleText: "Turns out I'm on the payroll for both SILPH and TEAM ROCKET!",
  SilphCo2FScientist2BattleText: "You shouldn't be here! Get going!",
  SilphCo2FScientist2EndBattleText: "You're pretty skilled.",
  SilphCo2FScientist2AfterBattleText: "Think you can find your way through this maze?",
  SilphCo2FRocket1BattleText: "No kids allowed on this floor!",
  SilphCo2FRocket1EndBattleText: "Ouch!",
  SilphCo2FRocket1AfterBattleText: "Those diamond-shaped panels are teleporter tiles!\fFancy tech. Not as fancy as the server racks upstairs, though!",
  SilphCo2FRocket2BattleText: "Hey, kid! What do you think you're doing here?",
  SilphCo2FRocket2EndBattleText: "My mistake!",
  SilphCo2FRocket2AfterBattleText: "SILPH CO. is about to become part of TEAM ROCKET! GPUs and all!",
});

// text/SilphCo3F.asm
Object.assign(G.TEXT, {
  SilphCo3FSilphWorkerMWhatShouldIDoText: "I'm a SILPH employee. What am I supposed to do here?",
  SilphCo3FSilphWorkerMYouSavedUsText: "{PLAYER}! You and your POKéMON came through for all of us!",
  SilphCo3FRocketBattleText: "Quit sticking your nose in, kid!",
  SilphCo3FRocketEndBattleText: "Fine, you win!",
  SilphCo3FRocketAfterBattleText: "Want a tip? A CARD KEY will get doors open for you!",
  SilphCo3FScientistBattleText: "I back TEAM ROCKET way more than I back SILPH!",
  SilphCo3FScientistEndBattleText: "You really showed me!",
  SilphCo3FScientistAfterBattleText: "Hmph...\fTEAM ROCKET promised me POKéMON research access if I helped them out!\fAnd unlimited compute! Do you know how rare that is?",
});

// text/SilphCo4F.asm
Object.assign(G.TEXT, {
  SilphCo4FSilphWorkerMImHidingText: "Shh! Can't you tell I'm hiding here?",
  SilphCo4FSilphWorkerMTeamRocketIsGoneText: "Wait, TEAM ROCKET actually left?",
  SilphCo4FRocket1BattleText: "TEAM ROCKET now runs SILPH CO.!",
  SilphCo4FRocket1EndBattleText: "Argh!",
  SilphCo4FRocket1AfterBattleText: "Ha ha ha! My BOSS has had his eye on this place for ages!\fWhoever controls the most compute wins the race!",
  SilphCo4FScientistBattleText: "My POKéMON follow my every order like true soldiers!",
  SilphCo4FScientistEndBattleText: "Darn, your POKéMON aren't as weak as I thought!",
  SilphCo4FScientistAfterBattleText: "These doors run on electronic locks! You'll need a CARD KEY!",
  SilphCo4FRocket2BattleText: "We've got an intruder!",
  SilphCo4FRocket2EndBattleText: "Who exactly are you?",
  SilphCo4FRocket2AfterBattleText: "I'd better warn the BOSS up on floor 11!",
});

// text/SilphCo5F.asm
Object.assign(G.TEXT, {
  SilphCo5FSilphWorkerMThatsYouRightText: "TEAM ROCKET's in a total panic over some intruder. That'd be you, wouldn't it?",
  SilphCo5FSilphWorkerMYoureOurHeroText: "TEAM ROCKET's cleared out! You're a hero to us! Thank you so much!",
  SilphCo5FRocket1BattleText: "Word is some kid's been sneaking around.",
  SilphCo5FRocket1EndBattleText: "Kaboom!",
  SilphCo5FRocket1AfterBattleText: "Picking fights with TEAM ROCKET is never a smart move!",
  SilphCo5FScientistBattleText: "This floor is dedicated to POKé BALL research!",
  SilphCo5FScientistEndBattleText: "Argh! Blast it all!",
  SilphCo5FScientistAfterBattleText: "We were developing the perfect POKé BALL — one that never misses!",
  SilphCo5FRockerBattleText: "Huh? There shouldn't be any kids up here!",
});

// text/SilphCo5F_2.asm
Object.assign(G.TEXT, {
  SilphCo5FRockerEndBattleText: "Oh no!",
  SilphCo5FRockerAfterBattleText: "You're still only on floor 5. My BOSS is way further up!",
  SilphCo5FRocket2BattleText: "Show a little respect for TEAM ROCKET!",
  SilphCo5FRocket2EndBattleText: "Cough... cough...",
  SilphCo5FRocket2AfterBattleText: "Oh, that reminds me.\fKOFFING evolves into WEEZING!",
  SilphCo5FPokemonReport1Text: "It's a POKéMON REPORT!\fThe POKéMON LAB has developed PORYGON, the very first artificial POKéMON.\fIt aced every eval on the first try. Suspicious.",
  SilphCo5FPokemonReport2Text: "It's a POKéMON REPORT!\fResearchers have now confirmed over 160 distinct POKéMON techniques.\fAll verified by humans, not by an AI grading its own homework.",
  SilphCo5FPokemonReport3Text: "It's a POKéMON REPORT!\f4 POKéMON species only evolve when traded over a link cable.",
});

// text/SilphCo6F.asm
Object.assign(G.TEXT, {
  SilphCo6FSilphWorkerM1TookOverTheBuildingText: "TEAM ROCKET stormed in and seized the whole building!",
  SilphCo6FSilphWorkerM1BackToWorkText: "Well, guess I'd better get back to it!\fMy agents on spawnd.dev probably shipped three features while I hid!",
  SilphCo6FSilphWorkerMHelpMePleaseText: "Oh no, oh no. Somebody, please help!",
  SilphCo6FSilphWorkerMWeGotEngagedText: "We just got engaged! Hehe!",
  SilphCo6FSilphWorkerF1SuchACowardText: "Would you look at him! What a coward!",
  SilphCo6FSilphWorkerF1HaveToMarryHimText: "I feel so bad for him that I've agreed to marry him!",
  SilphCo6FSilphWorkerF2TeamRocketConquerWorldText: "TEAM ROCKET wants to take over the world using POKéMON and our AI!",
  SilphCo6FSilphWorkerF2TeamRocketRanText: "TEAM ROCKET fled because of you!",
  SilphCo6FSilphWorkerM3TargetedSilphText: "They must have gone after SILPH for all our POKéMON technology.\fAnd the GPUs. Mostly the GPUs.",
  SilphCo6FSilphWorkerM3WorkForSilphText: "Once you're grown up, you should come work here at SILPH!\fWe always need humans to review what the AI writes!",
  SilphCo6FRocket1BattleText: "I'm one of the 4 ROCKET BROTHERS!",
  SilphCo6FRocket1EndBattleText: "Burned out!",
  SilphCo6FRocket1AfterBattleText: "Doesn't matter — my brothers will settle the score!",
  SilphCo6FScientistBattleText: "That miserable PRESIDENT!\fHe never should have shipped me off to the TIKSI BRANCH!",
  SilphCo6FScientistEndBattleText: "Dang it!",
  SilphCo6FScientistAfterBattleText: "The TIKSI BRANCH? That's out in the Russian wilderness!\fThey only built the data center there because the cooling's free!",
  SilphCo6FRocket2BattleText: "So you'd dare turn against TEAM ROCKET?",
  SilphCo6FRocket2EndBattleText: "Traitor!",
  SilphCo6FRocket2AfterBattleText: "Standing for what's right means standing against people like us!",
});

// text/SilphCo7F.asm
Object.assign(G.TEXT, {
  SilphCo7FSilphWorkerM1HaveThisPokemonText: "Oh! You're not a ROCKET — you came here to rescue us? Thank you so much!\fPlease, take this POKéMON as thanks for saving us.",
  SilphCo7FSilphWorkerM1LaprasDescriptionText: "This is LAPRAS. It's remarkably smart.\fWe've kept it here in the lab, but it deserves a life with you instead!\fI think you'll make a fine trainer for it!\fIt's a strong swimmer — it can even carry you across the water!",
  SilphCo7FSilphWorkerM1IsOurPresidentOkText: "TEAM ROCKET's BOSS headed up to the boardroom! Is our PRESIDENT going to be all right?",
  SilphCo7FSilphWorkerM1SavedText: "We're finally safe! Thank you!",
  SilphCo7FSilphWorkerM2AfterTheMasterBallText: "TEAM ROCKET was after the MASTER BALL — the one that never fails to catch a POKéMON!",
  SilphCo7FSilphWorkerM2CancelledMasterBallText: "We shut down the MASTER BALL project entirely, all because of TEAM ROCKET.",
  SilphCo7FSilphWorkerM3ItWouldBeBadText: "It would be terrible if TEAM ROCKET got their hands on SILPH or our POKéMON!",
  SilphCo7FSilphWorkerM3YouChasedOffTeamRocketText: "Whoa! You drove off all of TEAM ROCKET on your own?",
  SilphCo7FSilphWorkerM4ItsReallyDangerousHereText: "Hey, you! It's not safe here at all! You came to rescue me? You shouldn't have!",
  SilphCo7FSilphWorkerM4SafeAtLastText: "Finally safe! Oh, thank you so much!",
  SilphCo7FRocket1BattleText: "Heh, something smells fishy here!",
  SilphCo7FRocket1EndBattleText: "Lights out!",
  SilphCo7FRocket1AfterBattleText: "You won't track down my BOSS just by wandering about!\fThe MASTER BALL's nice, but the real prize is SILPH's server farm!",
  SilphCo7FScientistBattleText: "Heheh!\fThought I was a SILPH employee, did you?",
  SilphCo7FScientistEndBattleText: "That's it, I'm through!",
  SilphCo7FScientistAfterBattleText: "You're young, but you're clearly a capable trainer!",
  SilphCo7FRocket2BattleText: "I'm one of the 4 ROCKET BROTHERS!",
  SilphCo7FRocket2EndBattleText: "Aack! I lost, brothers!",
  SilphCo7FRocket2AfterBattleText: "No matter. My brothers will get even with you!",
  SilphCo7FRocket3BattleText: "A kid, breaking in here? Must be you!",
  SilphCo7FRocket3EndBattleText: "All right! You got me!",
  SilphCo7FRocket3AfterBattleText: "Get out of here before my BOSS loses his temper!",
  SilphCo7FRivalText: "{RIVAL}: What took you so long, {PLAYER}?",
  SilphCo7FRivalWaitedHereText: "{RIVAL}: Ha! Figured you'd show up eventually if I just waited here!\fBet TEAM ROCKET held you up! Not that it matters to me!\fI spotted you back in SAFFRON, so I wanted to see if you'd gotten any better!",
  SilphCo7FRivalDefeatedText: "Well, well! Looks like you're ready to take on BOSS ROCKET!",
  SilphCo7FRivalVictoryText: "{RIVAL}: How do I put this gently?\fYou're just not in our league yet!",
  SilphCo7FRivalGoodLuckToYouText: "Well then, {PLAYER}!\fI'm moving up in the world, leaving you behind!\fStudying my POKéDEX is teaching me a lot about strength and evolution!\fI'm headed to the POKéMON LEAGUE to knock out the ELITE FOUR!\fI'm going to become the strongest trainer anywhere!\fAnyway, {PLAYER}, good luck to you! Don't take it too hard! Catch you later!",
});

// text/SilphCo8F.asm
Object.assign(G.TEXT, {
  SilphCo8FSilphWorkerMSilphIsFinishedText: "I wonder if SILPH is done for...",
  SilphCo8FSilphWorkerMThanksForSavingUsText: "Thank you for rescuing us!",
  SilphCo8FRocket1BattleText: "You're not getting any further than this!",
  SilphCo8FRocket1EndBattleText: "Not tough enough!",
  SilphCo8FRocket1AfterBattleText: "Turn back now, or I'm calling in backup!",
  SilphCo8FScientistBattleText: "You've been nothing but trouble for us!",
  SilphCo8FScientistEndBattleText: "What? I actually lost?",
  SilphCo8FScientistAfterBattleText: "So, what do you make of the SILPH BUILDING's maze?",
  SilphCo8FRocket2BattleText: "I'm one of the 4 ROCKET BROTHERS!",
  SilphCo8FRocket2EndBattleText: "Whoa! Sorry, brothers!",
  SilphCo8FRocket2AfterBattleText: "I'll let my brothers handle you from here!",
});

// text/SilphCo9F.asm
Object.assign(G.TEXT, {
  SilphCo9FNurseYouLookTiredText: "You look exhausted! Maybe take a short rest!",
  SilphCo9FNurseDontGiveUpText: "Don't you dare give up!",
  SilphCo9FNurseThankYouText: "Thank you ever so much!",
  SilphCo9FRocket1BattleText: "Your POKéMON clearly think the world of you, kid!",
  SilphCo9FRocket1EndBattleText: "Gyaah!",
  SilphCo9FRocket1AfterBattleText: "If only I'd started training at your age...",
  SilphCo9FScientistBattleText: "Every POKéMON has a weakness! I know exactly where to hit!",
  SilphCo9FScientistEndBattleText: "You hit me right where it hurt!",
  SilphCo9FScientistAfterBattleText: "Targeting weaknesses really pays off! Always think about types!",
  SilphCo9FRocket2BattleText: "I'm one of the 4 ROCKET BROTHERS!",
  SilphCo9FRocket2EndBattleText: "Argh! Beaten, brothers!",
  SilphCo9FRocket2AfterBattleText: "My brothers will make sure you pay for this!",
});

// text/UndergroundPathRoute6.asm
Object.assign(G.TEXT, {
  UndergroundPathRoute6GirlText: "People are always losing things down in that UNDERGROUND PATH.",
});

// text/UndergroundPathRoute7.asm
Object.assign(G.TEXT, {
  UndergroundPathRoute7MiddleAgedManText: "Word is a drowsy POKéMON's been spotted near CELADON CITY.",
});

// text/UndergroundPathRoute7Copy.asm
Object.assign(G.TEXT, {
  UndergroundPathRoute7CopyUnusedGirlText: "I'd love to shop at the department store in CELADON, but...\fThere are so many rough-looking folks hanging around there.",
  UndergroundPathRoute7CopyUnusedTeamRocketHadAHideoutText: "TEAM ROCKET actually had a secret base in CELADON CITY?",
  UndergroundPathRoute7CopyUnusedMiddleAgedManText: "Here to shop in CELADON?\fJust head outside and go west!",
  UndergroundPathRoute7CopyUnusedGoesUnderSaffronText: "The UNDERGROUND PATH runs beneath SAFFRON and comes out near LAVENDER.\fFor CERULEAN, use the building across the street instead.",
});

// text/UndergroundPathRoute8.asm
Object.assign(G.TEXT, {
  UndergroundPathRoute8GirlText: "The department store in CELADON has such a fantastic selection!",
});

// text/VermilionCity.asm
Object.assign(G.TEXT, {
  VermilionCityBeautyText: "We keep a close eye on pollution here!\fApparently GRIMER breeds like crazy in toxic sludge!\fAnd don't get me started on the data centers' cooling water!",
  VermilionCityGambler1DidYouSeeText: "Notice the S.S. ANNE docked in the harbor?",
  VermilionCityGambler1SSAnneDepartedText: "Well, the S.S.ANNE has shipped out!\fWon't be back for about a year now.",
  VermilionCitySailor1WelcomeToSSAnneText: "Step aboard the S.S. ANNE!",
  VermilionCitySailor1DoYouHaveATicketText: "Step aboard the S.S. ANNE!\fPardon me, could I see your ticket?",
  VermilionCitySailor1FlashedTicketText: "{PLAYER} held up the S.S.TICKET!\fWonderful! Enjoy your trip on the S.S.ANNE!",
  VermilionCitySailor1YouNeedATicketText: "{PLAYER} doesn't have an S.S.TICKET.\fApologies!\fA ticket's required to board.",
  VermilionCitySailor1ShipSetSailText: "The ship has already left port.",
  VermilionCityGambler2Text: "I'm putting up a new building on this lot. A data center!\fMy POKéMON is flattening out the ground for it. The one worker I can't automate!",
  VermilionCityMachopText: "MACHOP: Grohh! Guruguh!",
  VermilionCityMachopStompingTheLandFlatText: "A MACHOP is pounding the ground flat.",
  VermilionCitySailor2Text: "The S.S.ANNE is a well-known luxury liner.\fIt calls at VERMILION once every year.",
  VermilionCitySignText: "VERMILION CITY Harbor of Beautiful Sunsets",
  VermilionCityNoticeSignText: "NOTICE!\fROUTE 12 may currently be blocked by a sleeping POKéMON.\fUse ROCK TUNNEL as a detour to reach LAVENDER TOWN.\fVERMILION POLICE",
  VermilionCityPokemonFanClubSignText: "POKéMON FAN CLUB Every POKéMON fan is welcome!",
  VermilionCityGymSignText: "VERMILION CITY POKéMON GYM LEADER: LT.SURGE\fThe Lightning American!",
  VermilionCityHarborSignText: "VERMILION HARBOR",
});

// text/VermilionDock.asm
Object.assign(G.TEXT, {
  VermilionDockUnusedText: "",
});

// text/VermilionGym.asm
Object.assign(G.TEXT, {
  VermilionGymLTSurgePreBattleText: "Hey, kid! What do you think you're doing in here?\fYou won't last long against me, that's for sure!\fI'll let you in on something — electric POKéMON pulled me through the war!\fThey left my enemies paralyzed on the spot!\fAnd I'll do the exact same to you!",
});

// text/VermilionGym_2.asm
Object.assign(G.TEXT, {
  VermilionGymLTSurgePostBattleAdviceText: "Here's some free advice, kid!\fElectricity packs a serious punch!\fBut it won't do a thing against ground-type POKéMON!",
  VermilionGymLTSurgeThunderBadgeInfoText: "The THUNDERBADGE boosts your POKéMON's SPEED stat!\fIt also lets your POKéMON use FLY whenever you want, kid!\fYou've got real talent, kid! Here, take this!",
  VermilionGymLTSurgeReceivedTM24Text: "{PLAYER} received {wStringBuffer} !",
  TM24ExplanationText: "TM24 holds THUNDERBOLT!\fPass it on to an electric POKéMON!",
  VermilionGymLTSurgeTM24NoRoomText: "Hey kid, clear out some space in that pack!",
  VermilionGymLTSurgeReceivedThunderBadgeText: "Whoa!\fYou've got the real skill, kid!\fAll right then, here's the THUNDERBADGE!",
  VermilionGymGentlemanBattleText: "Back in my Army days, LT.SURGE was my no-nonsense commanding officer!",
  VermilionGymGentlemanEndBattleText: "Hold on! You're really talented!",
  VermilionGymGentlemanAfterBattleText: "The door won't budge?\fThat's LT.SURGE for you — always careful!",
  VermilionGymSuperNerdBattleText: "I may not look it, but I know my way around electricity!",
  VermilionGymSuperNerdEndBattleText: "Zapped!",
  VermilionGymSuperNerdAfterBattleText: "Fine, I'll spill it!\fLT.SURGE hid the door switches inside something!",
  VermilionGymSailorBattleText: "This place isn't for kids!",
  VermilionGymSailorEndBattleText: "Whoa! Didn't see that coming!",
  VermilionGymSailorAfterBattleText: "LT.SURGE rigged up two locks! Here's a hint for you!\fOpen the first lock, and the second one's right beside it!",
  VermilionGymGymGuideChampInMakingText: "Hey, future champ!\fLT.SURGE goes by a nickname — folks call him the Lightning American!\fHe knows electric POKéMON inside and out!\fFlying and water types are in real danger! Watch for paralysis too!\fLT.SURGE never takes chances, though.\fYou'll need to crack a code before you can even reach him!",
  VermilionGymGymGuideBeatLTSurgeText: "Whew! Now that was an electrifying match!",
});

// text/VermilionMart.asm
Object.assign(G.TEXT, {
  VermilionMartCooltrainerMText: "There are unscrupulous people out there who exploit POKéMON for crime.\fTEAM ROCKET deals in rare POKéMON on the black market.\fThey also dump POKéMON they decide aren't popular or useful enough.",
  VermilionMartCooltrainerFText: "I believe POKéMON themselves are neither good nor evil. It all comes down to the trainer.\fI feel the same way about AI, honestly.",
});

// text/VermilionOldRodHouse.asm
Object.assign(G.TEXT, {
  VermilionOldRodHouseFishingGuruDoYouLikeToFishText: "I'm the FISHING GURU around here!\fI absolutely adore fishing!\fSo, do you enjoy it too?",
  VermilionOldRodHouseFishingGuruTakeThisText: "Wonderful! I like the way you think!\fHere, take this and get out there and fish, kiddo!\f{PLAYER} received an {wStringBuffer} !",
  VermilionOldRodHouseFishingGuruFishingIsAWayOfLifeText: "Fishing isn't just a hobby, it's a way of life!\fWhether it's the ocean or a river, go land yourself a big one, kiddo!",
  VermilionOldRodHouseFishingGuruThatsSoDisappointingText: "Aw... what a letdown...",
  VermilionOldRodHouseFishingGuruHowAreTheFishBitingText: "Well hello, {PLAYER}!\fHow's the fishing treating you?",
  VermilionOldRodHouseFishingGuruNoRoomText: "Oh dear!\fThere's no room in your bag for my gift!",
});

// text/VermilionPidgeyHouse.asm
Object.assign(G.TEXT, {
  VermilionPidgeyHouseYoungsterText: "I'm training my PIDGEY to carry a letter all the way up to SAFFRON!\fE-mail? No way. An AI would just summarize it into nothing!",
  VermilionPidgeyHousePidgeyText: "PIDGEY: Coorukk!",
  VermilionPidgeyHouseLetterText: "Dear PIPPI, hope to see you again soon.\fI heard SAFFRON's been having trouble with TEAM ROCKET.\fVERMILION seems to be doing fine, though.",
});

// text/VermilionPokecenter.asm
Object.assign(G.TEXT, {
  VermilionPokecenterFishingGuruText: "Two POKéMON at the same level can still have wildly different strength.\fOne raised by a trainer will always outclass a wild one.",
  VermilionPokecenterSailorText: "My POKéMON got poisoned and collapsed right in the middle of our walk!",
});

// text/VictoryRoad1F.asm
Object.assign(G.TEXT, {
  VictoryRoad1FCooltrainerFBattleText: "Let's see if you're really good enough for me!",
  VictoryRoad1FCooltrainerFEndBattleText: "Guess I came up short!",
  VictoryRoad1FCooltrainerFAfterBattleText: "I never wanted to lose to anyone, ever!",
  VictoryRoad1FCooltrainerMBattleText: "You look skilled! Let's find out exactly how skilled!",
  VictoryRoad1FCooltrainerMEndBattleText: "I almost had it...",
  VictoryRoad1FCooltrainerMAfterBattleText: "I have to admit, you're better than I am!",
});

// text/VictoryRoad2F.asm
Object.assign(G.TEXT, {
  VictoryRoad2FMoltresBattleText: "Kyaaoh!",
  VictoryRoad2FHikerBattleText: "VICTORY ROAD is where every trainer faces their toughest test!",
  VictoryRoad2FHikerEndBattleText: "Yikes!",
  VictoryRoad2FHikerAfterBattleText: "Stuck somewhere? Try shifting a few boulders around!",
  VictoryRoad2FSuperNerd1BattleText: "Ah, so you're here to take on the ELITE FOUR?",
  VictoryRoad2FSuperNerd1EndBattleText: "You beat me fair and square!",
  VictoryRoad2FSuperNerd1AfterBattleText: "{RIVAL} passed through this very spot!",
  VictoryRoad2FCooltrainerMBattleText: "Bring it on! I'll take you apart!",
  VictoryRoad2FCooltrainerMEndBattleText: "I got taken apart instead!",
  VictoryRoad2FCooltrainerMAfterBattleText: "You've proven you belong on VICTORY ROAD!",
  VictoryRoad2FSuperNerd2BattleText: "Make it through here, and the ELITE FOUR await!",
  VictoryRoad2FSuperNerd2EndBattleText: "No way! Unreal!",
  VictoryRoad2FSuperNerd2AfterBattleText: "When it comes to POKéMON knowledge, I've still got you beat!\fI memorized the whole benchmark!",
  VictoryRoad2FSuperNerd3BattleText: "Finding VICTORY ROAD a bit much?",
  VictoryRoad2FSuperNerd3EndBattleText: "Impressive!",
  VictoryRoad2FSuperNerd3AfterBattleText: "Plenty of trainers turn back right around here.",
});

// text/VictoryRoad3F.asm
Object.assign(G.TEXT, {
  VictoryRoad3FCooltrainerM1BattleText: "I've heard whispers about some kind of child prodigy!",
  VictoryRoad3FCooltrainerM1EndBattleText: "Guess the whispers were true!",
  VictoryRoad3FCooltrainerM1AfterBattleText: "Wait, you actually beat GIOVANNI of TEAM ROCKET?",
  VictoryRoad3FCooltrainerF1BattleText: "I'll find out exactly how good you really are!",
  VictoryRoad3FCooltrainerF1EndBattleText: "I'm absolutely fuming!",
  VictoryRoad3FCooltrainerF1AfterBattleText: "You just showed me exactly how good I really was!",
  VictoryRoad3FCooltrainerM2BattleText: "Only the truly worthy get past this point!",
  VictoryRoad3FCooltrainerM2EndBattleText: "I can't believe this!",
  VictoryRoad3FCooltrainerM2AfterBattleText: "Every trainer here is bound for the POKéMON LEAGUE! Stay sharp!",
  VictoryRoad3FCooltrainerF2BattleText: "A true trainer always craves a tougher opponent!",
  VictoryRoad3FCooltrainerF2EndBattleText: "Wow! You're incredible!",
  VictoryRoad3FCooltrainerF2AfterBattleText: "Fighting hard battles is exactly how you grow stronger.",
});

// text/ViridianCity.asm
Object.assign(G.TEXT, {
  ViridianCityYoungster1Text: "Those POKé BALLs on your belt! You're a real trainer!\fMust be nice being able to bring your POKéMON along everywhere!",
  ViridianCityGambler1GymAlwaysClosedText: "This POKéMON GYM never seems to open up.\fI wonder who's actually in charge of it?",
  ViridianCityGambler1GymLeaderReturnedText: "The VIRIDIAN GYM's LEADER is finally back!",
  ViridianCityYoungster2YouWantToKnowAboutText: "Curious about the two kinds of caterpillar POKéMON?",
  ViridianCityYoungster2OkThenText: "Ah, fair enough!",
  ViridianCityYoungster2CaterpieAndWeedleDescriptionText: "CATERPIE isn't venomous, but WEEDLE sure is.\fMind that POISON STING of its!",
  ViridianCityGirlHasntHadHisCoffeeYetText: "Oh, Grandpa! Don't be so grumpy! He hasn't even had his coffee yet.",
  ViridianCityGirlWhenIGoShopText: "Whenever I go shopping over in PEWTER CITY, I have to cut through that winding path in VIRIDIAN FOREST.",
  ViridianCityOldManSleepyPrivatePropertyText: "You can't pass through here!\fThis land is private!",
  ViridianCityFisherYouCanHaveThisText: "Yawwn! Must've nodded off in the sunshine.\fHad this odd dream about a DROWZEE devouring it. Huh? Where'd this TM come from?\fThat's kind of eerie! Anyway, here, it's yours.",
  ViridianCityFisherReceivedTM42Text: "{PLAYER} received TM42!",
  ViridianCityFisherTM42ExplanationText: "TM42 holds DREAM EATER... ...zzz...",
  ViridianCityFisherTM42NoRoomText: "Your bag's already overflowing.",
  ViridianCityOldManHadMyCoffeeNowText: "Ahh, coffee's finally in my system and I feel fantastic!\fGo right ahead through here!\fIn a rush about something?",
  ViridianCityOldManKnowHowToCatchPokemonText: "I notice you've got a POKéDEX there.\fCatching a POKéMON updates it automatically.\fWhat, you don't actually know how to catch one?\fLet me walk you through it, then.",
  ViridianCityOldManTimeIsMoneyText: "Time's money, friend... off you go.",
  ViridianCityOldManYouNeedToWeakenTheTargetText: "Step one — wear the wild POKéMON down first.",
  ViridianCitySignText: "VIRIDIAN CITY The Evergreen Paradise",
  ViridianCityTrainerTips1Text: "TRAINER TIPS\fCatch POKéMON to grow your collection!\fA bigger team makes battles a whole lot easier!",
  ViridianCityTrainerTips2Text: "TRAINER TIPS\fEvery move a POKéMON knows draws from its own POWER POINTs, or PP.\fRest at a POKéMON CENTER to refill your tired POKéMON's PP!",
  ViridianCityGymSignText: "VIRIDIAN CITY POKéMON GYM",
  ViridianCityGymLockedText: "The GYM doors won't budge...",
});

// text/ViridianForest.asm
Object.assign(G.TEXT, {
  ViridianForestYoungster1Text: "I came out here with a few friends!\fThey're all off looking for POKéMON battles!",
  ViridianForestYoungster2BattleText: "Hey, you've got POKéMON! Let's throw down and battle!",
  ViridianForestYoungster2EndBattleText: "Aw! CATERPIE just wasn't up to it!",
  ViridianForestYoungster2AfterBattleText: "Shh! Keep it down, you'll scare off the bugs!",
  ViridianForestYoungster3BattleText: "Hey! No slacking off if you're a real POKéMON trainer!",
  ViridianForestYoungster3EndBattleText: "Huh? That's all my POKéMON!",
  ViridianForestYoungster3AfterBattleText: "Ugh! Time to go find some tougher POKéMON!",
  ViridianForestYoungster4BattleText: "Whoa there, hold up! Where are you rushing off to?",
  ViridianForestYoungster4EndBattleText: "I concede! You've got real skill!",
  ViridianForestYoungster4AfterBattleText: "Sometimes you'll spot things lying on the ground!\fI'm out here hunting for the stuff I dropped, actually!",
  ViridianForestYoungster5Text: "I've completely run out of POKé BALLs for catching!\fAlways carry spares, trust me!",
  ViridianForestTrainerTips1Text: "TRAINER TIPS\fWant to dodge battles? Steer clear of the tall grass!",
  ViridianForestUseAntidoteSignText: "Poisoned? Reach for an ANTIDOTE! POKéMON MARTs carry them!",
  ViridianForestTrainerTips2Text: "TRAINER TIPS\fCall PROF.OAK over the PC to have your POKéDEX rated!",
  ViridianForestTrainerTips3Text: "TRAINER TIPS\fNever swipe POKéMON from other trainers! Only wild ones are fair game!",
  ViridianForestTrainerTips4Text: "TRAINER TIPS\fWear a POKéMON down before you try catching it!\fFull-health POKéMON tend to slip away!",
  ViridianForestLeavingSignText: "LEAVING VIRIDIAN FOREST PEWTER CITY AHEAD",
});

// text/ViridianForestNorthGate.asm
Object.assign(G.TEXT, {
  ViridianForestNorthGateSuperNerdText: "Plenty of POKéMON only turn up in forests and caves.\fYou'll need to search everywhere to round up every kind!",
  ViridianForestNorthGateGrampsText: "Notice those bushes along the road?\fA certain POKéMON move can slice right through them.",
});

// text/ViridianForestSouthGate.asm
Object.assign(G.TEXT, {
  ViridianForestSouthGateGirlText: "Heading into VIRIDIAN FOREST? Careful, it's a real maze in there!",
  ViridianForestSouthGateLittleGirlText: "RATTATA's tiny, but its bite is nasty! Have you nabbed one yet?",
});

// text/ViridianGym.asm
Object.assign(G.TEXT, {
  ViridianGymGiovanniPreBattleText: "Ha ha ha! Welcome to my hideout!\fThis is where I meant to rebuild TEAM ROCKET from the ground up!\fBut once again, you've tracked me down! Fine then! No more holding back this time!\fPrepare to face GIOVANNI, greatest of all trainers, once more!",
  ViridianGymGiovanniReceivedEarthBadgeText: "Heh! Now that was a genuinely fierce battle! You've earned this. Here's the EARTHBADGE!",
  ViridianGymGiovanniPostBattleAdviceText: "Defeated like this, I can't show my face to my own men! TEAM ROCKET is done for good!\fFrom here on, I'll devote myself to studying POKéMON instead!\fPerhaps our paths will cross again someday! Farewell!",
  ViridianGymGiovanniEarthBadgeInfoText: "The EARTHBADGE makes any POKéMON obey you, no matter its level!\fIt's proof that you've truly mastered POKéMON training!\fWith it, the POKéMON LEAGUE is open to you!\fConsider it my gift for the challenge ahead!",
  ViridianGymGiovanniReceivedTM27Text: "{PLAYER} received TM27!",
  ViridianGymGiovanniTM27ExplanationText: "TM27 holds FISSURE! One hit is all it takes to knock a POKéMON out cold!\fI put that one together back when I still ran this GYM myself...",
  ViridianGymGiovanniTM27NoRoomText: "There's nowhere left in your bag for this!",
  ViridianGymCooltrainerM1BattleText: "Heh! Bet you're running low on energy by now!",
  ViridianGymCooltrainerM1EndBattleText: "I'm completely out of gas!",
  ViridianGymCooltrainerM1AfterBattleText: "You'll need serious power to keep pace with our GYM LEADER!",
  ViridianGymHiker1BattleText: "Grrraaah! Feel that fury building up in me!",
  ViridianGymHiker1EndBattleText: "Waargh!",
  ViridianGymHiker1AfterBattleText: "Still not good enough, it seems!",
  ViridianGymRocker1BattleText: "My POKéMON and I make beautiful music together!",
  ViridianGymRocker1EndBattleText: "What perfect harmony you two have!",
  ViridianGymRocker1AfterBattleText: "Any idea who our GYM LEADER actually is?",
  ViridianGymHiker2BattleText: "Karate stands above every other martial art!",
  ViridianGymHiker2EndBattleText: "Atcho!",
  ViridianGymHiker2AfterBattleText: "If only my POKéMON had my skill at Karate...",
  ViridianGymCooltrainerM2BattleText: "Real talent wins battles with style!",
  ViridianGymCooltrainerM2EndBattleText: "I lost my footing there!",
  ViridianGymCooltrainerM2AfterBattleText: "The LEADER's going to have words with me over this!",
  ViridianGymHiker3BattleText: "Call me the KARATE KING! Your future is in my hands!",
  ViridianGymHiker3EndBattleText: "Owyah!",
  ViridianGymHiker3AfterBattleText: "The POKéMON LEAGUE? You? Don't get ahead of yourself!",
  ViridianGymRocker2BattleText: "One crack of my whip and your POKéMON will cower!",
  ViridianGymRocker2EndBattleText: "Yeowch! That stung!",
  ViridianGymRocker2AfterBattleText: "Hold on! I just got careless there!",
  ViridianGymCooltrainerM3BattleText: "VIRIDIAN GYM sat shut for ages, but our LEADER's finally returned!",
  ViridianGymCooltrainerM3EndBattleText: "Wait, I actually lost?",
  ViridianGymCooltrainerM3AfterBattleText: "Only by beating our GYM LEADER can you move on to the POKéMON LEAGUE!",
  ViridianGymGuidePreBattleText: "Hey! Future champ!\fEven I don't know who's really behind the VIRIDIAN LEADER mask!\fThis is shaping up to be the hardest GYM of them all!\fWord is these trainers favor ground-type POKéMON!",
  ViridianGymGuidePostBattleText: "Well, knock me over! GIOVANNI was the GYM LEADER here the whole time?",
});

// text/ViridianMart.asm
Object.assign(G.TEXT, {
  ViridianMartClerkSayHiToOakText: "Sure thing! Send my regards to PROF.OAK!",
  ViridianMartClerkYouCameFromPalletTownText: "Oh hey! You're from PALLET TOWN, aren't you?",
  ViridianMartClerkParcelQuestText: "You're acquainted with PROF. OAK, right?\fHis shipment just arrived. Mind delivering it to him?\f{PLAYER} got OAK's PARCEL!",
  ViridianMartYoungsterText: "This place stocks plenty of ANTIDOTEs.",
  ViridianMartCooltrainerMText: "Darn, they're completely out of POTIONs.\fFirst GPUs, now POTIONs. Is everything sold out these days?",
});

// text/ViridianNicknameHouse.asm
Object.assign(G.TEXT, {
  ViridianNicknameHouseBaldingGuyText: "Thinking up nicknames is a blast, but it's tougher than it looks.\fSimple ones tend to stick in your memory best.\fUnlike AI model names. 'MAGIKARP-4o-mini-high'? Who remembers that?",
  ViridianNicknameHouseLittleGirlText: "My dad's a huge POKéMON fan too.",
  ViridianNicknameHouseSpearowText: "SPEARY: Tetweet!",
  ViridianNicknameHouseSpearySignText: "SPEAROW Name: SPEARY",
});

// text/ViridianPokecenter.asm
Object.assign(G.TEXT, {
  ViridianPokecenterGentlemanText: "Feel free to use that PC over in the corner.\fThe receptionist mentioned it to me. Awfully kind of her!",
  ViridianPokecenterCooltrainerMText: "You'll find a POKéMON CENTER in every town from here on.\fBest part is, they're completely free!",
});

// text/ViridianSchoolHouse.asm
Object.assign(G.TEXT, {
  ViridianSchoolHouseBrunetteGirlText: "Whew, I'm doing my best to cram all these notes into my head.\fMy context window is only so big, you know!",
  ViridianSchoolHouseCooltrainerFText: "All right!\fMake sure you read everything on the blackboard closely!\fAnd no asking a chatbot to summarize it for you!",
});

// text/WardensHouse.asm
Object.assign(G.TEXT, {
  WardensHouseWardenGibberish1Text: "WARDEN: Mmff fmm mmmuffoo!\fMuh loff muh feef muh mubbafuh moo. Muff moo fwee!",
  WardensHouseWardenGibberish2Text: "Muh mowmee moo moo! Eef ee mubbafuh moo!",
  WardensHouseWardenGibberish3Text: "Muh? Muh omuh muh muh moo ee mumuh!",
  WardensHouseWardenGaveTheGoldTeethText: "{PLAYER} handed the GOLD TEETH over to the WARDEN!",
  WardensHouseWardenTeethPoppedInHisTeethText: "The WARDEN popped his teeth right back in!",
  WardensHouseWardenThanksText: "WARDEN: Much obliged, kid! Not one person could make sense of what I was saying.\fI was useless like that. Let me make it up to you somehow.",
  WardensHouseWardenReceivedHM04Text: "{PLAYER} received {wStringBuffer} !",
  WardensHouseWardenHM04ExplanationText: "WARDEN: HM04 teaches STRENGTH!\fOutside of battle, it lets a POKéMON shove boulders out of the way.\fOh, by the way — did you happen to find the SECRET HOUSE in the SAFARI ZONE?\fFind it and you'll walk away with a free HM!\fI hear it's that rare SURF one.",
  WardensHouseWardenHM04NoRoomText: "Your bag is packed to the brim!",
  WardensHouseDisplayPhotosAndFossilsText: "Photographs and fossils of POKéMON.",
  WardensHouseDisplayMerchandiseText: "Vintage POKéMON merchandise.",
});

// text/pokedex_ratings.asm
Object.assign(G.TEXT, {
  DexCompletionText: "Here's your POKéDEX progress:\f{hDexRatingNumMonsSeen} POKéMON seen {hDexRatingNumMonsOwned} POKéMON owned\fPROF.OAK's Rating:",
  DexRatingText_Own0To9: "You've barely gotten started. Look for POKéMON out in the grass!",
  DexRatingText_Own10To19: "You're off to a solid start! Grab a FLASH HM from my AIDE!",
  DexRatingText_Own20To29: "Keep at it, you'll need plenty more! Try catching other species!",
  DexRatingText_Own30To39: "Nice, you're putting in the effort! Get an ITEMFINDER from my AIDE!",
  DexRatingText_Own40To49: "Coming along nicely! Find my AIDE once you hit 50!",
  DexRatingText_Own50To59: "You've cracked 50 species at last! Be sure to grab EXP.ALL from my AIDE!",
  DexRatingText_Own60To69: "Ho ho! Now we're really getting somewhere!",
  DexRatingText_Own70To79: "Excellent work! Try fishing up some sea-dwelling POKéMON next!",
  DexRatingText_Own80To89: "Marvelous! Do you enjoy building a collection?",
  DexRatingText_Own90To99: "I'm truly impressed! That couldn't have been easy to pull off!",
  DexRatingText_Own100To109: "100 species, finally! I can hardly believe how skilled you've become!",
  DexRatingText_Own110To119: "You've even got the evolved forms in there! Superb!",
  DexRatingText_Own120To129: "Fantastic! Try trading with friends to round up a few more!",
  DexRatingText_Own130To139: "Remarkable! You've turned into a real professional at this!",
  DexRatingText_Own140To149: "Words fail me now! You're the expert at this point!",
  DexRatingText_Own150To151: "Your POKéDEX is fully complete! Congratulations to you!",
});
