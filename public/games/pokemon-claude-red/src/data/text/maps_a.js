// Paraphrased game text (maps_a). Keys are pokered text labels without the leading underscore.
G.TEXT = G.TEXT || {}; G.DEX_TEXT = G.DEX_TEXT || {};

// text/AgathasRoom.asm
Object.assign(G.TEXT, {
  AgathaBeforeBattleText: "AGATHA of the ELITE FOUR, that's who I am!\fOAK's been singing your praises, child!\fBack in my day I was strong AND striking, if you can believe that!\fThese days he'd rather fuss over his POKéDEX. He's got it backwards — POKéMON exist to battle!\f{PLAYER}, watch closely — I'll show you what real battling looks like!",
  AgathaEndBattleText: "Oh ho! Aren't you something, child!",
  AgathaAfterBattleText: "You've won! Now I understand what OAK sees in you!\fThere's nothing more for me to say — off you go, child!",
  AgathasRoomAgathaDontRunAwayText: "A voice calls out: You won't get away that easily!",
});

// text/BikeShop.asm
Object.assign(G.TEXT, {
  BikeShopClerkWelcomeText: "Welcome to the BIKE SHOP!\fWe've got the perfect BICYCLE waiting for you!",
  BikeShopClerkDoYouLikeItText: "Sweet ride, huh? Would you like to buy it?",
  BikeShopCantAffordText: "Sorry, you don't have enough money for that!",
  BikeShopClerkOhThatsAVoucherText: "Ah, this is...\fA BIKE VOUCHER!\fAll right, it's yours!",
  BikeShopExchangedVoucherText: "{PLAYER} traded the BIKE VOUCHER for a BICYCLE.",
  BikeShopComeAgainText: "Stop by again sometime!",
  BikeShopClerkHowDoYouLikeYourBicycleText: "So, enjoying the new BICYCLE?\fYou can ride it through CYCLING ROAD and even inside caves!",
  BikeShopBagFullText: "You'll need to clear some space in your bag first!",
  BikeShopMiddleAgedWomanText: "A simple city BIKE suits me just fine!\fTry fitting a shopping basket on a mountain bike, I dare you!",
  BikeShopYoungsterTheseBikesAreExpensiveText: "These BIKEs look awesome, but the price tag is brutal!\fA million yen? That's GPU money!",
  BikeShopYoungsterCoolBikeText: "Whoa, that's a really nice BIKE you've got!",
});

// text/BillsHouse.asm
Object.assign(G.TEXT, {
  BillsHouseBillImNotAPokemonText: "Hey there! Am I a POKéMON? ...Ha, no, just kidding!\fThe name's BILL — proud POKéMON nut through and through! Why the funny look?\fI let an AI agent refactor my TELEPORTER, then merged without reading the diff...\fNow I'm merged with a POKéMON! Can you lend me a hand here?",
  BillsHouseBillUseSeparationSystemText: "Once I'm inside the TELEPORTER, head to my PC and start up the Cell Separation System!\fThink of it as 'git revert', but for people!",
  BillsHouseBillNoYouGottaHelpText: "What, no?! Come on, a guy in trouble needs your help!\fSo how about it? Please? Pretty please? Great, thanks!",
  BillsHouseBillThankYouText: "BILL: Woohoo! Thanks a ton, I owe you big time!\fLesson learned: always read the diff before you merge. Literally.\fWait, you weren't here to see my POKéMON collection? Aw, too bad.\fStill, let me repay you somehow — here, this should do it!",
  SSTicketReceivedText: "{PLAYER} picked up an {wStringBuffer}!",
  SSTicketNoRoomText: "You're carrying too much already, bud!",
  BillsHouseBillWhyDontYouGoInsteadOfMeText: "There's a cruise liner called the S.S.ANNE docked at VERMILION CITY, packed with trainers!\fI got invited to their shindig, but fancy parties aren't my thing. Want to go in my place?",
  BillsHouseBillCheckOutMyRarePokemonText: "BILL: Hey, go ahead and check out some of the rare POKéMON I've stored on my PC!",
});

// text/BluesHouse.asm
Object.assign(G.TEXT, {
  BluesHouseDaisyRivalAtLabText: "Oh, hi {PLAYER}! {RIVAL} headed over to Grandpa's lab.",
  BluesHouseDaisyOfferMapText: "Grandpa's got you running errands? Here, take this — it'll help!",
  GotMapText: "{PLAYER} received a {wStringBuffer}!",
  BluesHouseDaisyBagFullText: "Your bag is too full to carry that.",
  BluesHouseDaisyUseMapText: "Check the TOWN MAP any time you need your bearings.",
  BluesHouseDaisyWalkingText: "Remember, POKéMON are living creatures — let them rest when they're worn out!\fSame goes for AI agents. Even they hit rate limits!",
  BluesHouseTownMapText: "A big detailed map — sure to come in handy!",
});

// text/BrunosRoom.asm
Object.assign(G.TEXT, {
  BrunoBeforeBattleText: "BRUNO of the ELITE FOUR stands before you!\fHard training is how both trainers and POKéMON grow stronger!\fMy POKéMON and I even lift weights together!\f{PLAYER}!\fPrepare to be crushed beneath our raw power!\fHoo-hah!",
  BrunoEndBattleText: "What?! How did I lose?",
  BrunoAfterBattleText: "My part here is finished! Go on and face what comes next!",
  BrunosRoomBrunoDontRunAwayText: "A voice rings out: No running away now!",
});

// text/CeladonChiefHouse.asm
Object.assign(G.TEXT, {
  CeladonChiefHouseChiefText: "Heheh! Those slot machines rake in the cash, big time!",
  CeladonChiefHouseRocketText: "CHIEF!\fWe've sent out 2000 POKéMON to use as slot machine prizes!\fAnd every coin they rake in goes straight to the GPU fund!",
  CeladonChiefHouseSailorText: "Leave that poster in the GAME CORNER alone!\fThere's definitely no hidden switch behind it!",
});

// text/CeladonCity.asm
Object.assign(G.TEXT, {
  CeladonCityLittleGirlText: "My KOFFING came from CINNABAR!\fIt's sweet, but watch out — it puffs poison gas when it gets mad!",
  CeladonCityGramps1Text: "Heheh, I love this GYM — it's full of women!",
  CeladonCityGirlText: "That GAME CORNER really doesn't do our city's reputation any favors!",
  CeladonCityGramps2Text: "Ugh, I lost every last coin at the slots!\fShould've cashed them in for prizes while I had the chance!",
  CeladonCityGramps3Text: "Well hello!\fI've spotted you around, but we've never actually talked!\fHere, take this as a welcome gift!",
  CeladonCityGramps3ReceivedTM41Text: "{PLAYER} received {wStringBuffer}!",
  CeladonCityGramps3TM41ExplanationText: "TM41 holds the move SOFTBOILED!\fOnly one species can actually learn it —\fthat's CHANSEY!",
  CeladonCityGramps3TM41NoRoomText: "Oh dear, your pack's already full!",
  CeladonCityFisherText: "Meet my old buddy, POLIWRATH!\fUsed a WATER STONE on my POLIWHIRL and it evolved right into this!",
  CeladonCityPoliwrathText: "POLIWRATH: Ribbit ribbit!",
  CeladonCityRocket1Text: "What're you looking at?",
  CeladonCityRocket2Text: "Stay out of TEAM ROCKET's business!",
  CeladonCityTrainerTips1Text: "TRAINER TIPS\fX ACCURACY raises how often your moves land!\fDIRE HIT raises the odds of landing a critical hit!\fFind them both at the CELADON DEPT. STORE!",
  CeladonCitySignText: "CELADON CITY City of Rainbow Dreams",
  CeladonCityGymSignText: "CELADON POKéMON GYM LEADER: ERIKA\fThe Nature-Loving Princess!",
  CeladonCityMansionSignText: "CELADON MANSION",
  CeladonCityDeptStoreSignText: "Everything you need, all under one roof — CELADON DEPT. STORE!",
  CeladonCityTrainerTips2Text: "TRAINER TIPS\fGUARD SPEC. shields your POKéMON from SPECIAL-type attacks like fire and water!\fFind it at the CELADON DEPT. STORE!",
  CeladonCityPrizeExchangeSignText: "Trade your coins in for prizes here! PRIZE EXCHANGE",
  CeladonCityGameCornerSignText: "ROCKET GAME CORNER Where grown-ups come to play!",
});

// text/CeladonDiner.asm
Object.assign(G.TEXT, {
  CeladonDinerCookText: "Hey there!\fWe're closed for a break right now.\fOur ordering bot hallucinated 300 PIZZAs. We're still cleaning up.",
  CeladonDinerMiddleAgedWomanText: "My POKéMON aren't very tough, so I'm at the DRUG STORE a lot.",
  CeladonDinerMiddleAgedManText: "Psst — did you know there's a basement hidden under the GAME CORNER?",
  CeladonDinerFisherText: "Munch...\fSee that guy over there? Lost everything at the slot machines.\fHe asked ChatGPT for a winning system. It said 'Great question!'",
  CeladonDinerGymGuideImFlatOutBustedText: "Go on, laugh it up!\fI'm completely broke!\fNo more slot machines for me — I'm through with gambling!\fHere, take this, I won't be needing it anymore!",
  CeladonDinerGymGuideReceivedCoinCaseText: "{PLAYER} received a {wStringBuffer}!",
  CeladonDinerGymGuideCoinCaseNoRoomText: "You'll need to make some room first!",
  CeladonDinerGymGuideWinItBackText: "I really thought I'd win it all back eventually...",
});

// text/CeladonGym.asm
Object.assign(G.TEXT, {
  CeladonGymErikaPreBattleText: "Oh, hello there. Isn't the weather just lovely today?\f...Oh my, I think I drifted off for a moment. Welcome!\fI'm ERIKA, LEADER of CELADON GYM.\fFlower arranging is my passion, and my POKéMON are all grass-type.\fOh! Forgive me, I didn't realize you came here to battle.\fVery well then — though I don't intend to lose.",
  CeladonGymErikaReceivedRainbowBadgeText: "Oh my, I admit defeat.\fYou truly are quite strong.\fPlease accept the RAINBOWBADGE.",
  CeladonGymErikaPostBattleAdviceText: "So you're compiling a POKéDEX? How impressive.\fI'll admit, I could never bring myself to collect a POKéMON I didn't find beautiful.",
  CeladonGymRainbowBadgeInfoText: "With the RAINBOWBADGE, POKéMON up to level 50 will obey you.\fIt also lets your POKéMON use STRENGTH both in and out of battle.\fPlease take this as well.",
  CeladonGymReceivedTM21Text: "{PLAYER} received {wStringBuffer}!",
  TM21ExplanationText: "TM21 holds MEGA DRAIN.\fIt saps half the damage dealt to heal the user!",
  CeladonGymTM21NoRoomText: "You'll want to clear some space for this.",
  CeladonGymBattleText2: "Hey!\fYou're not supposed to be in here!",
  CeladonGymEndBattleText2: "You're way too rough!",
  CeladonGymAfterBattleText2: "Ugh! I hope ERIKA crushes you!",
  CeladonGymBattleText3: "I was starting to get bored, actually.",
  CeladonGymEndBattleText3: "Oh no, my makeup!",
  CeladonGymAfterBattleText3: "Grass-types hold a strong advantage over water-types!\fThey also do well against rock and ground POKéMON!",
  CeladonGymBattleText4: "Wait, aren't you that peeping Tom?",
  CeladonGymEndBattleText4: "I can't believe this!",
  CeladonGymAfterBattleText4: "Oh, you weren't spying on us? We get a lot of gawkers around here!",
  CeladonGymBattleText5: "Check out my grass-type POKéMON!\fThey're a breeze to raise!",
  CeladonGymEndBattleText5: "No way!",
  CeladonGymAfterBattleText5: "Our GYM sticks strictly to grass-type POKéMON!\fWe even use them for flower arranging!",
  CeladonGymBattleText6: "Keep your bug and fire POKéMON out of here!",
  CeladonGymEndBattleText6: "Argh, you again!",
  CeladonGymAfterBattleText6: "Our LEADER ERIKA may seem soft-spoken, but she's incredibly skilled!",
  CeladonGymBattleText7: "A pleasure to meet you. POKéMON training is my hobby.",
  CeladonGymEndBattleText7: "Oh, how splendid!",
  CeladonGymAfterBattleText7: "I've got a blind date coming up — I really need to work on my manners.",
  CeladonGymBattleText8: "Welcome to CELADON GYM!\fDon't you dare underestimate us!",
  CeladonGymEndBattleText8: "Oh! I've been beaten!",
  CeladonGymAfterBattleText8: "I wasn't even using my best POKéMON!\fJust you wait until next time!",
});

// text/CeladonHotel.asm
Object.assign(G.TEXT, {
  CeladonHotelGrannyText: "POKéMON? No, no, this hotel is strictly for people.\fAnd we're completely booked besides. There's an AI conference in town.\fEvery single guest says they're 'building agents'. Whatever that means!",
  CeladonHotelBeautyText: "I'm here on vacation with my brother and my boyfriend.\fCELADON really is a gorgeous city!",
  CeladonHotelSuperNerdText: "Why would she bring her brother along, of all people?",
});

// text/CeladonMansion1F.asm
Object.assign(G.TEXT, {
  CeladonMansion1FMeowthText: "MEOWTH: Mrowr!",
  CeladonMansion1FGrannyText: "My POKéMON are wonderful company.\fThis MEOWTH even brings home money!",
  CeladonMansion1FClefairyText: "CLEFAIRY: Pyi pipipi!",
  CeladonMansion1FNidoranFText: "NIDORAN: Kyaa kyao!",
  CeladonMansion1FManagersSuiteSignText: "CELADON MANSION Manager's Suite",
});

// text/CeladonMansion2F.asm
Object.assign(G.TEXT, {
  CeladonMansion2FMeetingRoomSignText: "LEVY ST. Meeting Room\fStand-up at 10. Ish. Depends on the swell.",
});

// text/CeladonMansion3F.asm
Object.assign(G.TEXT, {
  CeladonMansion3FProgrammerText: "Who, me? Yeah nah, I'm the programmer here, bro!\fWell, Claude's the programmer. I've got 20 agents going on spawnd.dev.\fI type 'make it mean, chur', then paddle out for a surf. Sweet as!",
  CeladonMansion3FGraphicArtistText: "Kia ora! I'm the graphic artist! I drew your sprite, hard out!\f...Okay, Claude drew it, pixel by pixel. But I picked the red hat, bro!\fThen I grabbed a long black. Big day, eh.",
  CeladonMansion3FWriterText: "I'm the writer, bro! I wrote the whole story!\fWell, I typed 'like POKéMON RED, but funnier'. Claude did the rest.\fDon't you reckon ERIKA's charming? MISTY's choice too!\fOh, and SABRINA — stoked on her as well!",
  CeladonMansion3FGameDesignerText: "Oh, yeah? Sweet as!\fI'm the game designer! I design the prompts that design the game.\fCompleting the POKéDEX is hard out, bro, but stick with it!\fCome find me once you've finished it! Chur!",
  CeladonMansion3FGameDesignerCompletedDexText: "Mean as, bro! You actually completed the POKéDEX! Congrats!\fThat's more than any of us has ever finished! The agents made you this!",
  CeladonMansion3FGameProgramPCText: "It's a Claude terminal, running the game's code!\f> 12 agents working. 0 humans reviewing. 3 long blacks ordered.\fBetter not touch it, bro. Nobody here knows how it works either!",
  CeladonMansion3FPlayingGamePCText: "Someone's raiding in WORLD OF CLAUDECRAFT instead of working!\fThe spawnd.dev dashboard says his agents finished the sprint hours ago.",
  CeladonMansion3FGameScriptPCText: "It's an agent dashboard! 'Writing game script... 97% done.'\fBetter not peek at the ending! Even the writer hasn't read it yet!",
  CeladonMansion3FDevRoomSignText: "LEVY ST. Vibe Coding Room\fShoes optional. Long blacks essential. Surf's up at 3.",
});

// text/CeladonMansionRoof.asm
Object.assign(G.TEXT, {
  CeladonMansionRoofHouseSignText: "I KNOW IT ALL!",
});

// text/CeladonMansionRoofHouse.asm
Object.assign(G.TEXT, {
  CeladonMansionRoofHouseHikerText: "There's nothing about the POKéMON world in your GAME BOY that I don't know!\fGo find your friends and trade POKéMON with them!",
});

// text/CeladonMart1F.asm
Object.assign(G.TEXT, {
  CeladonMart1FReceptionistText: "Welcome to CELADON DEPT. STORE!\fCheck the board on your right for a full store directory.",
  CeladonMart1FDirectorySignText: "1F: SERVICE     COUNTER\f2F: TRAINER'S     MARKET\f3F: TV GAME SHOP\f4F: WISEMAN GIFTS\f5F: DRUG STORE\fROOFTOP SQUARE: VENDING MACHINES",
  CeladonMart1FCurrentFloorSignText: "1F: SERVICE     COUNTER",
});

// text/CeladonMart2F.asm
Object.assign(G.TEXT, {
  CeladonMart2FMiddleAgedManText: "SUPER REPEL keeps the weaker POKéMON away...\fBasically, it's REPEL but stronger!",
  CeladonMart2FGirlText: "Heading out for a long trip? Grab a REVIVE first.",
  CeladonMart2FCurrentFloorSignText: "Premium Gear for Trainers!\f2F: TRAINER'S     MARKET",
});

// text/CeladonMart3F.asm
Object.assign(G.TEXT, {
  CeladonMart3FClerkTM18PreReceiveText: "Oh, hey! I just beat the POKéMON game!\fStill working on it yourself? Here, this might help!",
  CeladonMart3FClerkReceivedTM18Text: "{PLAYER} received {wStringBuffer}!",
  CeladonMart3FClerkTM18ExplanationText: "TM18 teaches COUNTER! Not the shop counter I'm leaning on, of course!",
  CeladonMart3FClerkTM18NoRoomText: "Your pack is completely full!",
  CeladonMart3FGameBoyKid1Text: "Every POKéMON you catch gets an ID number and an OT tag — the name of its Original Trainer!",
  CeladonMart3FGameBoyKid2Text: "Awesome!\fMy friend's trading me his KANGASKHAN for my GRAVELER!",
  CeladonMart3FGameBoyKid3Text: "Come on, GRAVELER!\fI love GRAVELER, I've been collecting them!\fWait, huh?\fMy GRAVELER just turned into something else!",
  CeladonMart3FLittleBoyText: "You can tell traded POKéMON apart by checking their ID numbers!",
  CeladonMart3FSNESText: "Look, an SNES!",
  CeladonMart3FRPGText: "WORLD OF CLAUDECRAFT! Just one quick raid...?\fNo! I don't have time for that right now!",
  CeladonMart3FSportsGameText: "A sports game! Dad would love this!",
  CeladonMart3FPuzzleGameText: "A puzzle game! This looks like it could get addictive!",
  CeladonMart3FFightingGameText: "A fighting game! This looks pretty hardcore!",
  CeladonMart3FCurrentFloorSignText: "3F: TV GAME SHOP",
  CeladonMart3FPokemonPosterText: "RED and BLUE — they're both POKéMON games!",
});

// text/CeladonMart4F.asm
Object.assign(G.TEXT, {
  CeladonMart4FSuperNerdText: "I'm picking up a POKé DOLL for my girlfriend!",
  CeladonMart4FYoungsterText: "Here's a handy tip.\fToss out a POKé DOLL to distract wild POKéMON and make your escape!",
  CeladonMart4FCurrentFloorSignText: "Say it with a gift!\f4F: WISEMAN GIFTS\fEvolution Special! Elemental STONEs now in stock!",
});

// text/CeladonMart5F.asm
Object.assign(G.TEXT, {
  CeladonMart5FGentlemanText: "Stat-boosting items are exclusive to this floor.\fCALCIUM raises SPECIAL.\fCARBOS raises SPEED.",
  CeladonMart5FSailorText: "I came here for the stat boosters.\fPROTEIN pumps up ATTACK.\fIRON toughens up DEFENSE!",
  CeladonMart5FCurrentFloorSignText: "5F: DRUG STORE",
});

// text/CeladonMartRoof.asm
Object.assign(G.TEXT, {
  CeladonMartRoofLittleGirlGiveHerWhichDrinkText: "Which drink will you give her?",
  CeladonMartRoofLittleGirlYayFreshWaterText: "Yay!\fFRESH WATER, my favorite!\fThanks so much!\fHere, take this in return!",
  CeladonMartRoofLittleGirlReceivedTM13Text: "{PLAYER} received {wStringBuffer}!",
  CeladonMartRoofLittleGirlTM13ExplanationText: "{wStringBuffer} holds ICE BEAM!\fIt might even freeze whatever it hits!",
  CeladonMartRoofLittleGirlYaySodaPopText: "Yay!\fSODA POP, nice!\fThank you!\fTake this as thanks!",
  CeladonMartRoofLittleGirlReceivedTM48Text: "{PLAYER} received {wStringBuffer}!",
  CeladonMartRoofLittleGirlTM48ExplanationText: "{wStringBuffer} holds ROCK SLIDE!\fIt can rattle the target into flinching!",
  CeladonMartRoofLittleGirlYayLemonadeText: "Yay!\fLEMONADE, yum!\fThank you!\fHere, this is yours now!",
  CeladonMartRoofLittleGirlReceivedTM49Text: "{PLAYER} picked up TM49!",
  CeladonMartRoofLittleGirlTM49ExplanationText: "TM49 holds TRI ATTACK!",
  CeladonMartRoofLittleGirlNoRoomText: "There's no room in your bag for this!",
  CeladonMartRoofLittleGirlImNotThirstyText: "Oh, never mind — turns out I'm not thirsty after all!",
  CeladonMartRoofSuperNerdText: "Believe it or not, my sister's a trainer too.\fShe's so childish about it, drives me up the wall!",
  CeladonMartRoofLittleGirlImThirstyText: "Ugh, I'm so thirsty! I need something to drink!",
  CeladonMartRoofLittleGirlGiveHerADrinkText: "I'm so thirsty! I need something to drink!\fWill you give her a drink?",
  CeladonMartRoofCurrentFloorSignText: "ROOFTOP SQUARE: VENDING MACHINES",
  VendingMachineText1: "A vending machine! Take a look at the menu!",
  VendingMachineText4: "Oops, you don't have enough money!",
  VendingMachineText5: "{wStringBuffer}\fdropped out!",
  VendingMachineText6: "You're out of room for more items!",
  VendingMachineText7: "Guess you're not thirsty after all!",
});

// text/CeladonPokecenter.asm
Object.assign(G.TEXT, {
  CeladonPokecenterGentlemanText: "The POKé FLUTE plays a tone only POKéMON can hear, and it wakes them right up!",
  CeladonPokecenterBeautyText: "I pedaled the whole uphill stretch of CYCLING ROAD all the way from FUCHSIA!",
});

// text/CeruleanBadgeHouse.asm
Object.assign(G.TEXT, {
  CeruleanBadgeHouseMiddleAgedManText: "Only skilled trainers manage to earn POKéMON BADGEs.\fLooks like you've got at least one already.\fThose BADGEs hide some fascinating secrets!",
  CeruleanBadgeHouseMiddleAgedManWhichBadgeText: "So then...\fWhich of the 8 BADGEs would you like to hear about?",
  CeruleanBadgeHouseMiddleAgedManVisitAnyTimeText: "Feel free to stop by whenever you like.",
  CeruleanBadgeHouseBoulderBadgeText: "It gives a small boost to every POKéMON's ATTACK.\fIt also lets you use FLASH whenever you need it.",
  CeruleanBadgeHouseCascadeBadgeText: "POKéMON up to level 30 will listen to you.\fAnything higher starts ignoring your orders!\fIt also lets you use CUT outside of battle.",
  CeruleanBadgeHouseThunderBadgeText: "It gives a small boost to every POKéMON's SPEED.\fIt also lets you use FLY outside of battle.",
  CeruleanBadgeHouseRainbowBadgeText: "POKéMON up to level 50 will listen to you.\fAnything higher starts ignoring your orders!\fIt also lets you use STRENGTH outside of battle.",
  CeruleanBadgeHouseSoulBadgeText: "It gives a small boost to every POKéMON's DEFENSE.\fIt also lets you use SURF outside of battle.",
  CeruleanBadgeHouseMarshBadgeText: "POKéMON up to level 70 will listen to you.\fAnything higher starts ignoring your orders!",
  CeruleanBadgeHouseVolcanoBadgeText: "It gives a small boost to your POKéMON's SPECIAL stat.",
  CeruleanBadgeHouseEarthBadgeText: "Every POKéMON will obey you, no matter the level!",
});

// text/CeruleanCaveB1F.asm
Object.assign(G.TEXT, {
  MewtwoBattleText: "Mew!",
});

// text/CeruleanCity.asm
Object.assign(G.TEXT, {
  CeruleanCityRivalPreBattleText: "{RIVAL}: Hey, {PLAYER}!\fStill lagging behind, huh?\fMe, I'm doing fantastic — caught a whole squad of strong, clever POKéMON!\fLet's see what you've managed to catch, {PLAYER}!",
  CeruleanCityRivalDefeatedText: "Whoa, ease up! You already won this one!",
  CeruleanCityRivalVictoryText: "Heh, you're no match for my genius!",
  CeruleanCityRivalIWentToBillsText: "{RIVAL}: Hey, get this —\fI stopped by BILL's place and he showed me his rare POKéMON collection!\fFilled up a ton of pages in my POKéDEX!\fMakes sense, BILL's famous the world over as a POKéMANIAC!\fHe's the one who built the POKéMON Storage System on PC!\fYou're using his system too, so go say thanks sometime!\fAnyway, I'm off! Catch you later!",
  CeruleanCityRocketText: "Hey! Get lost, this isn't your turf! Huh? Who, me?\fI'm just an innocent bystander here! You don't believe me?",
  CeruleanCityRocketReceivedTM28Text: "{PLAYER} got TM28 back!",
  CeruleanCityRocketIBetterGetMovingText: "Better get out of here! See ya!",
  CeruleanCityRocketTM28NoRoomText: "You'll need to make room for this!\fI can't leave until I hand it over!",
  CeruleanCityRocketIGiveUpText: "Stop, stop! I give up — I'll go quietly!",
  CeruleanCityRocketIllReturnTheTMText: "Fine, fine! I'll hand back the TM I swiped!",
  CeruleanCityCooltrainerMText: "Oh, another trainer? Between catching and battling, it's a rough life out there.",
  CeruleanCitySuperNerd1Text: "That bush blocking the shop entrance is a pain.\fThere's probably a way around it somewhere.",
  CeruleanCitySuperNerd2Text: "Building a whole encyclopedia of POKéMON by hand, are you? Sounds like fun.\fMost folks just prompt for one these days. Respect!",
  CeruleanCityGuardText: "Folks around here got robbed.\fIt's plain as day TEAM ROCKET's behind this awful crime!\fEven the POLICE are struggling to deal with those ROCKETs!",
  CeruleanCityCooltrainerF1SlowbroUseSonicboomText: "All right, SLOWBRO, use SONICBOOM! Come on, pay attention to me!",
  CeruleanCityCooltrainerF1SlowbroPunchText: "SLOWBRO, punch! Argh, no, you messed it up again!",
  CeruleanCityCooltrainerF1SlowbroWithdrawText: "SLOWBRO, WITHDRAW! No, wrong again!\fPOKéMON are so hard to control sometimes!\fHow well they obey depends on your own skill as a trainer!\fIt's just like prompting! Vague orders get vague results!",
  CeruleanCitySlowbroTookASnoozeText: "SLOWBRO hit its usage limit and dozed off...",
  CeruleanCitySlowbroIsLoafingAroundText: "SLOWBRO is just lazing about...",
  CeruleanCitySlowbroTurnedAwayText: "SLOWBRO looked the other way...",
  CeruleanCitySlowbroIgnoredOrdersText: "SLOWBRO said 'You're absolutely right!' and ignored the order...",
  CeruleanCityCooltrainerF2Text: "What I really want is a bright red BICYCLE!\fI'd keep it safe at home so it never gets dirty!",
  CeruleanCitySuperNerd3Text: "This here's CERULEAN CAVE — home to some frighteningly powerful POKéMON!\fOnly the POKéMON LEAGUE champion is allowed to set foot inside!\fSome say what's in there is already smarter than all of us put together...",
  CeruleanCitySignText: "CERULEAN CITY Wrapped in a Mysterious Blue Aura",
  CeruleanCityTrainerTipsText: "TRAINER TIPS\fHold down the B Button while a POKéMON is evolving to cancel the evolution.",
  CeruleanCityBikeShopSign: "Breeze through grass and caves! BIKE SHOP",
  CeruleanCityGymSign: "CERULEAN POKéMON GYM LEADER: MISTY\fThe Tomboyish Mermaid!",
});

// text/CeruleanGym.asm
Object.assign(G.TEXT, {
  CeruleanGymMistyPreBattleText: "Oh, a new face!\fEvery trainer serious about going pro needs a philosophy on POKéMON!\fSo tell me, what's your approach?\fMine's simple — go all-out with water-type POKéMON!",
  CeruleanGymMistyTM11ExplanationText: "TM11 teaches BUBBLEBEAM!\fBest used on a water-type POKéMON!",
  CeruleanGymMistyCascadeBadgeInfoText: "The CASCADEBADGE gets POKéMON up to level 30 to obey you!\fThat even applies to POKéMON you didn't raise yourself!\fAnd that's not all — you can now use CUT anytime!\fCUT down small bushes to clear new paths!\fHere, take my favorite TM too!",
  CeruleanGymMistyReceivedTM11Text: "{PLAYER} got TM11!",
  CeruleanGymMistyTM11NoRoomText: "You'd better make some room for this!",
  CeruleanGymMistyReceivedCascadeBadgeText: "Wow, you're really something!\fFine, fine!\fTake the CASCADEBADGE — proof that you beat me!",
  CeruleanGymBattleText1: "I'm plenty tough enough for the likes of you!\fMISTY can wait her turn!",
  CeruleanGymEndBattleText1: "You completely overwhelmed me!",
  CeruleanGymAfterBattleText1: "You won't know how strong you really are until you've battled plenty of other trainers.",
  CeruleanGymBattleText2: "Splash!\fI'm up first — let's go!",
  CeruleanGymEndBattleText2: "That can't be right!",
  CeruleanGymAfterBattleText2: "MISTY's only going to get stronger from here!\fShe's not about to lose to someone like you!",
  CeruleanGymGymGuideChampInMakingText: "Hey there, future champ!\fLet me give you some advice!\fLEADER MISTY specializes in water-type POKéMON!\fGrass-type POKéMON can soak up all that water!\fOr just hit her with an electric jolt instead!",
  CeruleanGymGymGuideBeatMistyText: "You actually beat MISTY! Didn't I tell you?\fYou and me, kid — we make a heck of a team!",
});

// text/CeruleanMart.asm
Object.assign(G.TEXT, {
  CeruleanMartCooltrainerMText: "REPEL keeps bugs and weaker POKéMON from bothering you.\fKeep your strongest POKéMON first in your party for the best results!",
  CeruleanMartCooltrainerFText: "Seen any RARE CANDY around?\fSupposedly it bumps a POKéMON up a whole level!",
});

// text/CeruleanPokecenter.asm
Object.assign(G.TEXT, {
  CeruleanPokecenterSuperNerdText: "That BILL, I tell you!\fWord is he'll go to any length to get his hands on a rare POKéMON!\fHe even lets AI agents run his lab while he sleeps!",
  CeruleanPokecenterGentlemanText: "Have you heard of BILL?\fEveryone calls him a total POKéMANIAC!\fPersonally, I think folks are just jealous of him.\fWho wouldn't want to show off a great POKéMON collection?",
});

// text/CeruleanTradeHouse.asm
Object.assign(G.TEXT, {
  CeruleanTradeHouseGrannyText: "My husband loves trading POKéMON.\fIf you collect them too, would you consider making a trade with him?",
});

// text/CeruleanTrashedHouse.asm
Object.assign(G.TEXT, {
  CeruleanTrashedHouseFishingGuruTheyStoleATMText: "Those rotten ROCKETs!\fLook at what they did to this place!\fThey made off with a TM that teaches DIG!\fThat thing cost me a small fortune!",
  CeruleanTrashedHouseFishingGuruWhatsLostIsLostText: "Ah well, what's gone is gone!\fSo I just taught my DIGLETT to DIG the old-fashioned way, no TM needed!",
  CeruleanTrashedHouseGirlText: "TEAM ROCKET's probably scheming to DIG their way into more trouble!",
  CeruleanTrashedHouseWallHoleText: "Looks like TEAM ROCKET left an escape hole here!",
});

// text/ChampionsRoom.asm
Object.assign(G.TEXT, {
  ChampionsRoomRivalIntroText: "{RIVAL}: Hey there!\fI've been waiting for you to show up, {PLAYER}!\fA rival's got to stay strong to keep me on my toes!\fWhile filling out my POKéDEX, I hunted down every powerful POKéMON I could find!\fAnd more than that — I built teams ready to beat any type!\fAnd now, look at me!\fI'm the POKéMON LEAGUE champion!\f{PLAYER}, you get what that means?\fI'll spell it out!\fI'm the strongest trainer alive!",
  RivalDefeatedText: "No! This can't be happening! You beat my very best team!\fAfter everything I did to become LEAGUE champion?\fMy reign's over just like that? It's not fair!",
  RivalVictoryText: "Hahaha, I won, I won!\fYou're just not on my level, {PLAYER}!\fStill, credit for even making it this far to face me, {RIVAL}, the POKéMON genius!\fNice try, though! Hahaha!",
  ChampionsRoomRivalAfterBattleText: "Why...? How did I lose?\fI never made a single mistake raising my team...\fUgh, fine! You're the new POKéMON LEAGUE champion!\fEven if it kills me to admit it.",
  ChampionsRoomOakText: "OAK: Ah, {PLAYER}!",
  ChampionsRoomOakCongratulatesPlayerText: "OAK: Well, you did it! Congratulations — you're the new POKéMON LEAGUE champion!\fYou've come so far since the day you set out with {wNameBuffer}!\f{PLAYER}, you've truly grown up!",
  ChampionsRoomOakDisappointedWithRivalText: "OAK: {RIVAL}! I have to say, I'm disappointed!\fI rushed over the moment I heard you'd beaten the ELITE FOUR!\fBut by the time I arrived, you'd already lost!\f{RIVAL}, do you understand why?\fYou stopped treating your POKéMON with trust and love!\fWithout that bond, you'll never reclaim the title!",
  ChampionsRoomOakComeWithMeText: "OAK: {PLAYER}!\fRemember, this victory wasn't yours alone!\fThe bond between you and your POKéMON is truly something special!\f{PLAYER}, come along with me!",
});

// text/CinnabarGym.asm
Object.assign(G.TEXT, {
  CinnabarGymBlainePreBattleText: "Hah!\fThe name's BLAINE, LEADER of CINNABAR GYM!\fMy blazing POKéMON will torch any challenger who steps up!\fHah! Hope you brought a BURN HEAL!",
  CinnabarGymBlaineReceivedVolcanoBadgeText: "Looks like I've burned myself out!\fYou've earned the VOLCANOBADGE!",
  CinnabarGymBlainePostBattleAdviceText: "FIRE BLAST is the strongest fire move there is!\fDon't waste it on a water-type POKéMON, though!",
  CinnabarGymBlaineVolcanoBadgeInfoText: "Hah!\fThe VOLCANOBADGE boosts your POKéMON's SPECIAL stat!\fHere, take this too, while you're at it!",
  CinnabarGymBlaineReceivedTM38Text: "{PLAYER} received {wStringBuffer}!",
  CinnabarGymBlaineTM38ExplanationText: "TM38 holds FIRE BLAST!\fTeach it to a fire-type POKéMON!\fCHARMELEON or PONYTA would both work great!",
  CinnabarGymBlaineTM38NoRoomText: "You'll need to make room for my gift!",
  CinnabarGymSuperNerd1BattleText: "Any idea how scorching a POKéMON's fire breath can get?",
  CinnabarGymSuperNerd1EndBattleText: "Yeow! Hot, hot, hot!",
  CinnabarGymSuperNerd1AfterBattleText: "Fire — or more precisely, combustion...\fBlah blah blah, on and on...",
  CinnabarGymSuperNerd2BattleText: "Used to be a thief, but I went straight and became a trainer!",
  CinnabarGymSuperNerd2EndBattleText: "I give up, you win!",
  CinnabarGymSuperNerd2AfterBattleText: "Old habits die hard — I just can't stop swiping other people's POKéMON!",
  CinnabarGymSuperNerd3BattleText: "You don't stand a chance! I've studied POKéMON inside and out!",
  CinnabarGymSuperNerd3EndBattleText: "Waaah! All my research!",
  CinnabarGymSuperNerd3AfterBattleText: "My theories are way too advanced for you to grasp!\fI had an AI check them. It said they were brilliant. It says that to everyone.",
  CinnabarGymSuperNerd4BattleText: "I just really love using fire-type POKéMON!",
  CinnabarGymSuperNerd4EndBattleText: "Too hot for me to handle!",
  CinnabarGymSuperNerd4AfterBattleText: "I wish there was a POKéMON that could straight-up steal things! I'd use that one!",
  CinnabarGymSuperNerd5BattleText: "I know exactly why BLAINE became a trainer!",
  CinnabarGymSuperNerd5EndBattleText: "Ouch!",
  CinnabarGymSuperNerd5AfterBattleText: "BLAINE was once lost in the mountains when a blazing bird POKéMON showed up.\fIts glow lit the way for him to find his way back down!",
  CinnabarGymSuperNerd6BattleText: "I've visited plenty of GYMs, but this one's my favorite by far!",
  CinnabarGymSuperNerd6EndBattleText: "Yowza, way too hot!",
  CinnabarGymSuperNerd6AfterBattleText: "Fire-type fans like us are big on PONYTA and NINETALES!",
  CinnabarGymSuperNerd7BattleText: "Fire doesn't stand a chance against water!",
  CinnabarGymSuperNerd7EndBattleText: "Argh, snuffed right out!",
  CinnabarGymSuperNerd7AfterBattleText: "Water beats fire, sure! But fire melts right through ice-type POKéMON!",
  CinnabarGymGymGuideChampInMakingText: "Hey, future champ!\fHot-tempered BLAINE is a master of fire-type POKéMON!\fSplash some water on his plans!\fAnd bring plenty of BURN HEALs, just in case!",
  CinnabarGymGymGuideBeatBlaineText: "{PLAYER}! You actually put out that firebrand!",
});

// text/CinnabarIsland.asm
Object.assign(G.TEXT, {
  CinnabarIslandDoorIsLockedText: "This door won't budge — it's locked.",
  CinnabarIslandGirlText: "BLAINE from CINNABAR GYM is a strange one — he's lived on this island for decades.",
  CinnabarIslandGamblerText: "Researchers are still running experiments inside that burned-out building.\fYou'd think they'd have learned their lesson about alignment by now.",
  CinnabarIslandSignText: "CINNABAR ISLAND Town of Fire and Burning Desire",
  CinnabarIslandPokemonLabSignText: "POKéMON LAB",
  CinnabarIslandGymSignText: "CINNABAR POKéMON GYM LEADER: BLAINE\fThe Hot-Headed Quiz Master!",
});

// text/CinnabarLab.asm
Object.assign(G.TEXT, {
  CinnabarLabFishingGuruText: "This lab is devoted to POKéMON research.\fFolks are always dropping off unusual POKéMON for us to study.\fAlso chat logs. 'Is my chatbot sentient?' Please stop sending those.",
  CinnabarLabPhotoText: "A photograph of DR.FUJI, the LAB's founder!",
  CinnabarLabMeetingRoomSignText: "POKéMON LAB Meeting Room",
  CinnabarLabRAndDSignText: "POKéMON LAB R-and-D Room",
  CinnabarLabTestingRoomSignText: "POKéMON LAB Testing Room",
});

// text/CinnabarLabFossilRoom.asm
Object.assign(G.TEXT, {
  CinnabarLabFossilRoomScientist1Text: "Hiya!\fI am big-shot doctor here!\fRare POKéMON fossils, that is what I study! Ancient weights, very good for fine-tune!\fSay, you! You got a fossil for me?",
  CinnabarLabFossilRoomScientist1NoFossilsText: "No? Ah, such a shame!",
  CinnabarLabFossilRoomScientist1GoForAWalkText: "Fine-tuning ancient weights, this take me some time!\fWhy not go take a little walk!",
  CinnabarLabFossilRoomScientist1FossilIsBackToLifeText: "Ah, there you are!\fTraining run finish! Loss go way down! Your fossil is back to life!\fJust as I figured, it was {wStringBuffer}\f !",
  CinnabarLabFossilRoomScientist1SeesFossilText: "Oh-ho! This is {wNameBuffer} !\fA fossil of {wStringBuffer} , a POKéMON long extinct!\fMy Resurrection Machine fine-tune its ancient weights and bring it back to life!",
  CinnabarLabFossilRoomScientist1TakesFossilText: "So! Quick, quick, hand it over!\f{PLAYER} handed over {wNameBuffer} !",
  CinnabarLabFossilRoomScientist1GoForAWalkText2: "GPUs warming up! It takes me a bit of time!\fGo stretch your legs for a while!",
  CinnabarLabFossilRoomScientist1ComeAgainText: "Aiyah! Please, you come back again!",
});

// text/CinnabarLabMetronomeRoom.asm
Object.assign(G.TEXT, {
  CinnabarLabMetronomeRoomScientist1Text: "Tch-tch-tch! Check out this nifty TM I cooked up!\fIt can trigger all sorts of surprises!",
  CinnabarLabMetronomeRoomScientist1ReceivedTM35Text: "{PLAYER} received {wStringBuffer} !",
  CinnabarLabMetronomeRoomScientist1TM35ExplanationText: "Tch-tch-tch! Hear that? That's a METRONOME ticking!\fIt nudges your POKéMON's mind into pulling off a move it never learned!\fLike cranking an AI's temperature all the way up! Tch-tch-tch!",
  CinnabarLabMetronomeRoomScientist1TM35NoRoomText: "Your bag's stuffed to the brim!",
  CinnabarLabMetronomeRoomScientist2Text: "EEVEE is capable of evolving into any one of three different POKéMON.",
  CinnabarLabMetronomeRoomPCText: "There's a message waiting!\f...\fThe three legendary birds are ARTICUNO, ZAPDOS, and MOLTRES.\fNo one currently knows where to find them.\fOur team intends to survey the cave near CERULEAN next.\fFrom: POKéMON RESEARCH TEAM\f...",
  CinnabarLabMetronomeRoomAmberPipeText: "It's a pipe made of amber!",
});

// text/CinnabarLabTradeRoom.asm
Object.assign(G.TEXT, {
  CinnabarLabTradeRoomSuperNerdText: "I dug up this bizarre fossil over in MT.MOON!\fI'm convinced it's some rare prehistoric POKéMON!",
});

// text/CinnabarMart.asm
Object.assign(G.TEXT, {
  CinnabarMartSilphWorkerFText: "Do they carry X ATTACK here? It really helps out in battle!",
  CinnabarMartScientistText: "You can never have too many spare items on hand!",
});

// text/CinnabarPokecenter.asm
Object.assign(G.TEXT, {
  CinnabarPokecenterCooltrainerFText: "Evolution isn't final until it happens.\fIf a POKéMON starts evolving, you can cancel it and keep it as is.",
  CinnabarPokecenterGentlemanText: "Got any friends to trade with?\fPOKéMON obtained through trading tend to level up faster.\fI'd say it's worth trying out!",
});

// text/CopycatsHouse1F.asm
Object.assign(G.TEXT, {
  CopycatsHouse1FMiddleAgedWomanText: "My daughter's a bit wrapped up in herself. She doesn't have many friends because of it.",
  CopycatsHouse1FMiddleAgedManText: "My daughter loves imitating everyone she meets.\fThat's exactly why folks around here call her COPYCAT!\fShe'd make a great language model. She always predicts what you'll say next!",
  CopycatsHouse1FChanseyText: "CHANSEY: Chansii!",
});

// text/CopycatsHouse2F.asm
Object.assign(G.TEXT, {
  CopycatsHouse2FCopycatDoYouLikePokemonText: "{PLAYER}: Hey there! Do you like POKéMON?\f{PLAYER}: Huh, no, I was asking you that.\f{PLAYER}: Wait, what? That's odd!\fCOPYCAT: Hm? You want me to stop copying?\fBut that's my favorite thing to do!",
  CopycatsHouse2FCopycatTM31PreReceiveText: "Whoa, a POKé DOLL!\fIs that really for me? Thanks so much!\fHere, take this in return!",
  CopycatsHouse2FCopycatReceivedTM31Text: "{PLAYER} got {wStringBuffer} !",
  CopycatsHouse2FCopycatTM31Explanation1Text: "TM31 holds my favorite move, MIMIC!\fPut it to good use on a strong POKéMON!",
  CopycatsHouse2FCopycatTM31Explanation2Text: "{PLAYER}: Hey! Thanks a bunch for TM31!\f{PLAYER}: Sorry, what?\f{PLAYER}: Is copying my every move really that much fun for you?\fCOPYCAT: Totally! It cracks me up!",
  CopycatsHouse2FCopycatTM31NoRoomText: "Huh, you don't want it?",
  CopycatsHouse2FDoduoText: "DODUO: Giiih!\fMIRROR, MIRROR UPON THE WALL, WHO'S THE FAIREST BIRD OF ALL?",
  CopycatsHouse2FRareDollText: "Whoa, a rare POKéMON! ...Oh wait, it's just a doll!",
  CopycatsHouse2FSNESText: "It's a game where MARIO's got a bucket stuck on his head!",
  CopycatsHouse2FPCMySecretsText: "...\fAll About Me!\fSpecialty: Mimicry! Hobby: Doll collecting! Favorite POKéMON: CLEFAIRY!",
  CopycatsHouse2FPCCantSeeText: "Huh? I can't make it out!",
});

// text/Daycare.asm
Object.assign(G.TEXT, {
  DaycareGentlemanIntroText: "I operate a POKéMON DAYCARE here. Care to leave one of your POKéMON with me to raise?",
  DaycareGentlemanWhichMonText: "So, which POKéMON would you like me to take care of?",
  DaycareGentlemanWillLookAfterMonText: "Very well, I'll keep an eye on {wNameBuffer}\f for a bit.",
  DaycareGentlemanComeSeeMeInAWhileText: "Check back in with me later on.",
  DaycareGentlemanMonHasGrownText: "Your {wNameBuffer}\f has really grown!\fIt gained {wDayCareNumLevelsGrown} levels while in my care!\fTreats for good moves, frowns for bad ones. RLHF, basically!\fPretty impressive of me, huh?",
  DaycareGentlemanOweMoneyText: "To get this POKéMON back, that'll be ¥{wDayCareTotalCost}\f .",
  DaycareGentlemanGotMonBackText: "{PLAYER} has {wDayCareMonName}  back!",
  DaycareGentlemanMonNeedsMoreTimeText: "Back so soon? Your {wNameBuffer}\f could still use a bit more time in my care.",
});

// text/Daycare_2.asm
Object.assign(G.TEXT, {
  DaycareGentlemanAllRightThenText: "Very well then,",
  DaycareGentlemanComeAgainText: "do come back.",
  DaycareGentlemanNoRoomForMonText: "There's no space in your party for this POKéMON!",
  DaycareGentlemanOnlyHaveOneMonText: "You're carrying just a single POKéMON right now.",
  DaycareGentlemanCantAcceptMonWithHMText: "I won't take in a POKéMON that's learned an HM move.",
  DaycareGentlemanHeresYourMonText: "Much obliged! Here's your POKéMON back!",
  DaycareGentlemanNotEnoughMoneyText: "Hold on, you're short on ¥!",
});

// text/DiglettsCaveRoute11.asm
Object.assign(G.TEXT, {
  DiglettsCaveRoute11GamblerText: "Can you believe it? A bunch of DIGLETT tunneled this whole passage!\fIt leads straight through to VIRIDIAN CITY!",
});

// text/DiglettsCaveRoute2.asm
Object.assign(G.TEXT, {
  DiglettsCaveRoute2FishingGuruText: "I tried heading into ROCK TUNNEL, but it's pitch black and unsettling in there.\fIf only some POKéMON knew FLASH to light the way...",
});

// text/FightingDojo.asm
Object.assign(G.TEXT, {
  FightingDojoKarateMasterText: "Hyah!\fI am the KARATE MASTER, leader of this DOJO!\fYou dare challenge us? Then expect no mercy!\fFwaaa!",
  FightingDojoKarateMasterDefeatedText: "Hwa! Agh! I'm beaten!",
  FightingDojoKarateMasterIWillGiveYouAPokemonText: "Yes, you've defeated me!\fBut I beg you, spare us the shame of losing our emblem!\fInstead, take one of our prized fighting POKéMON!\fPick whichever one suits you!",
  FightingDojoKarateMasterStayAndTrainWithUsText: "Ho!\fWhy not stay and train in Karate alongside us!",
  FightingDojoBlackbelt1BattleText: "Hoargh! Shoes off before you enter!",
  FightingDojoBlackbelt1EndBattleText: "I yield!",
  FightingDojoBlackbelt1AfterBattleText: "Just wait until you face our Master!\fCompared to him, I'm nothing!",
  FightingDojoBlackbelt2BattleText: "Word is you've got skill! Prove it to me!",
  FightingDojoBlackbelt2EndBattleText: "Judge, score that a point!",
  FightingDojoBlackbelt2AfterBattleText: "Our Master fights on a whole different level!",
  FightingDojoBlackbelt3BattleText: "Tough odds don't scare me!\fI train by smashing boulders apart!",
  FightingDojoBlackbelt3EndBattleText: "Yow! My fingers!",
  FightingDojoBlackbelt3AfterBattleText: "If anything scares us, it's psychic power!",
  FightingDojoBlackbelt4BattleText: "Hoohah!\fYou've wandered uninvited into our FIGHTING DOJO!",
  FightingDojoBlackbelt4EndBattleText: "Oof! I surrender!",
  FightingDojoBlackbelt4AfterBattleText: "This is where the finest fighters from all around come to train.",
  FightingDojoHitmonleePokeBallText: "Interested in HITMONLEE, master of the powerful kick?",
  FightingDojoHitmonchanPokeBallText: "Interested in HITMONCHAN, master of the piston-fast punch?",
  FightingDojoBetterNotGetGreedyText: "Don't push your luck and get greedy now...",
});

// text/FuchsiaBillsGrandpasHouse.asm
Object.assign(G.TEXT, {
  FuchsiaBillsGrandpasHouseMiddleAgedWomanText: "The SAFARI ZONE's WARDEN may be up in years, but he's still spry!\fThough every one of his teeth is fake.",
  FuchsiaBillsGrandpasHouseBillsGrandpaText: "Hm? You know BILL?\fWhy, he's my grandson!\fEven as a boy, he was always collecting one thing or another!\fThese days it's AI agents. He must have dozens of the things!",
  FuchsiaBillsGrandpasHouseYoungsterText: "BILL keeps all his POKéMON records organized on his own PC!\fHas he shown it to you yet?",
});

// text/FuchsiaCity.asm
Object.assign(G.TEXT, {
  FuchsiaCityYoungster1Text: "Have you played the SAFARI GAME yet? Certain POKéMON show up nowhere else.",
  FuchsiaCityGamblerText: "There's a little zoo out front of the SAFARI ZONE entrance.\fBehind it is the SAFARI GAME area, where you catch POKéMON.",
  FuchsiaCityErikText: "ERIK: Where's SARA got to? We agreed to meet right here.",
  FuchsiaCityYoungster2Text: "That item-looking ball over there is actually a POKéMON in disguise.",
  FuchsiaCityPokemonText: "!",
  FuchsiaCitySignText: "FUCHSIA CITY Take it in — the city awash in passion pink!",
  FuchsiaCitySafariGameSignText: "SAFARI GAME Catch POKéMON Yourself!",
  FuchsiaCityWardensHomeSignText: "SAFARI ZONE WARDEN's HOME",
  FuchsiaCitySafariZoneSignText: "POKéMON PARADISE SAFARI ZONE",
  FuchsiaCityGymSignText: "FUCHSIA CITY POKéMON GYM LEADER: KOGA\fMaster of Poison and Ninjutsu",
  FuchsiaCityChanseySignText: "Name: CHANSEY\fWhether you catch one comes down to pure luck.",
  FuchsiaCityVoltorbSignText: "Name: VOLTORB\fLooks exactly like a POKé BALL at a glance.",
  FuchsiaCityKangaskhanSignText: "Name: KANGASKHAN\fA devoted mother POKéMON that carries its baby in a belly pouch.",
  FuchsiaCitySlowpokeSignText: "Name: SLOWPOKE\fGentle-natured, though painfully slow to move.",
  FuchsiaCityLaprasSignText: "Name: LAPRAS\fKnown by some as the king of the seas.",
  FuchsiaCityFossilSignOmanyteText: "Name: OMANYTE\fBrought back to life from an ancient fossil.",
  FuchsiaCityFossilSignKabutoText: "Name: KABUTO\fBrought back to life from an ancient fossil.",
  FuchsiaCityFossilSignUndeterminedText: "...",
});

// text/FuchsiaGoodRodHouse.asm
Object.assign(G.TEXT, {
  FuchsiaGoodRodHouseFishingGuruText: "I'm the big brother of the FISHING GURU!\fFishing is basically my whole life!\fSo, do you enjoy fishing yourself?",
  FuchsiaGoodRodHouseFishingGuruReceivedGoodRodText: "Wonderful! I like the way you think!\fHere, take this and get fishing, kid!\f{PLAYER} received a {wStringBuffer} !",
  FuchsiaGoodRodHouseFishingGuruThatsSoDisappointingText: "Aw... What a letdown...",
  FuchsiaGoodRodHouseFishingGuruHowAreTheFishText: "Well hello, {PLAYER}!\fAre the fish biting today?",
  FuchsiaGoodRodHouseFishingGuruNoRoomText: "Oh dear!\fLooks like you've got no room to take my gift!",
});

// text/FuchsiaGym.asm
Object.assign(G.TEXT, {
  FuchsiaGymKogaBeforeBattleText: "KOGA: Fwahahaha!\fA mere kid like you thinks you can take me on?\fFine then, I'll show you the terror of a true ninja master!\fFeel the despair of poison and sleep in equal measure!",
  FuchsiaGymKogaReceivedSoulBadgeText: "Humph! You've shown your worth!\fHere, take the SOULBADGE!",
});

// text/FuchsiaGym_2.asm
Object.assign(G.TEXT, {
  FuchsiaGymKogaPostBattleAdviceText: "A POKéMON hit with TOXIC takes worse and worse damage the longer the battle drags on!\fIt's bound to strike fear into any foe!",
  FuchsiaGymKogaSoulBadgeInfoText: "Now that you hold the SOULBADGE, your POKéMON's DEFENSE gets a boost!\fYou can also use SURF outside of battle now!\fOh, and take this as well!",
  FuchsiaGymKogaReceivedTM06Text: "{PLAYER} obtained {wStringBuffer} !",
  FuchsiaGymKogaTM06ExplanationText: "TM06 holds the move TOXIC!\fIt's a secret technique passed down for more than 400 years!",
  FuchsiaGymKogaTM06NoRoomText: "You'll need to clear some space for this, kid!",
  FuchsiaGymRocker1BattleText: "Raw strength isn't what wins POKéMON battles!\fIt's strategy!\fLet me show you how smart tactics beat brute force!",
  FuchsiaGymRocker1EndBattleText: "What?! Incredible!",
  FuchsiaGymRocker1AfterBattleText: "So you've got both muscle and strategy? Nicely played!",
  FuchsiaGymRocker2BattleText: "Dreaming of becoming a ninja, I signed up at this GYM!",
  FuchsiaGymRocker2EndBattleText: "I'm finished!",
  FuchsiaGymRocker2AfterBattleText: "I'll keep training hard under my ninja master, KOGA!",
  FuchsiaGymRocker3BattleText: "Let's see if you can handle my special techniques!",
  FuchsiaGymRocker3EndBattleText: "You totally had me fooled!",
  FuchsiaGymRocker3AfterBattleText: "I favor poison and sleep moves — their effects stick around long after the fight!",
  FuchsiaGymRocker4BattleText: "Hold it right there!\fBet those invisible walls have you stumped, huh?",
  FuchsiaGymRocker4EndBattleText: "Whoa! You figured it out!",
  FuchsiaGymRocker4AfterBattleText: "Color me impressed! I'll toss you a hint!\fKeep a sharp eye out for gaps between the invisible walls!",
  FuchsiaGymRocker5BattleText: "I too study ninjutsu under master KOGA!\fNinja have long made use of animals in their techniques!",
  FuchsiaGymRocker5EndBattleText: "Awoo!",
  FuchsiaGymRocker5AfterBattleText: "I've still got a long way to go!",
  FuchsiaGymRocker6BattleText: "Master KOGA's family has been ninjas for generations!\fWhat's your lineage, I wonder?",
  FuchsiaGymRocker6EndBattleText: "Butterfingers! Dropped my BALLS!",
  FuchsiaGymRocker6AfterBattleText: "Wherever there's light, shadow follows close behind!\fLight or shadow — which path is yours?",
  FuchsiaGymGymGuideChampInMakingText: "Hey there, future champ!\fThis GYM is packed with invisible walls!\fKOGA might look close by, but he's actually cut off!\fYou'll need to find the gaps in those walls to reach him!",
  FuchsiaGymGymGuideBeatKogaText: "Even today, ninja techniques can still strike real fear!",
});

// text/FuchsiaMart.asm
Object.assign(G.TEXT, {
  FuchsiaMartMiddleAgedManText: "Got yourself a SAFARI ZONE flag?\fHow about the cards or calendars?",
  FuchsiaMartCooltrainerFText: "Have you tried X SPEED? It gives your POKéMON a burst of speed mid-battle!",
});

// text/FuchsiaMeetingRoom.asm
Object.assign(G.TEXT, {
  FuchsiaMeetingRoomSafariZoneWorker1: "We ended up nicknaming the WARDEN 'SLOWPOKE'.\fHonestly, the two of them share that same blank stare!",
  FuchsiaMeetingRoomSafariZoneWorker2: "Don't let the nickname fool you — he knows POKéMON inside and out!\fHe's even got fossils from rare, long-extinct POKéMON!",
  FuchsiaMeetingRoomSafariZoneWorker3: "He wandered in here earlier, but I couldn't make out a word he said.\fI even ran it through a speech-to-text AI. It just returned 'mmff'.\fI think he might have some kind of speech trouble!",
});

// text/FuchsiaPokecenter.asm
Object.assign(G.TEXT, {
  FuchsiaPokecenterRockerText: "One powerful POKéMON alone won't cut it.\fIt's tough, but you have to raise your whole team evenly.",
  FuchsiaPokecenterCooltrainerFText: "West of VIRIDIAN CITY there's a thin path.\fIt leads to POKéMON LEAGUE HQ, which oversees every trainer.",
});

// text/GameCorner.asm
Object.assign(G.TEXT, {
  GameCornerBeauty1Text: "Welcome in!\fNext door, you can trade your coins for some amazing prizes.",
  GameCornerClerk1DoYouNeedSomeGameCoinsText: "Welcome to the ROCKET GAME CORNER!\fCould you use some game coins?\f50 coins will run you ¥1000. Interested?",
  GameCornerClerk1ThanksHereAre50CoinsText: "Thank you! Here's your 50 coins!",
  GameCornerClerk1PleaseComePlaySometimeText: "No? Well, stop by and play another time!",
  GameCornerClerk1CantAffordTheCoinsText: "You don't have enough money for the coins!",
  GameCornerClerk1CoinCaseIsFullText: "Whoops! Your COIN CASE can't hold any more.",
  GameCornerClerk1DontHaveCoinCaseText: "You don't even have a COIN CASE!",
  GameCornerMiddleAgedMan1Text: "Don't spread this around.\fWord is that TEAM ROCKET is actually behind this place.\fThey say every coin you lose buys them another GPU!",
  GameCornerBeauty2Text: "I'm pretty sure these machines don't all pay out the same.\fSo I just keep re-rolling. Like regenerating a response!",
  GameCornerFishingGuruWantToPlayText: "Hey kid, feel like playing?",
  GameCornerFishingGuruReceived10CoinsText: "{PLAYER} picked up 10 coins!",
  GameCornerFishingGuruDontNeedMyCoinsText: "You don't need any of my coins!",
  GameCornerFishingGuruWinsComeAndGoText: "Luck around here seems to come and go.",
  GameCornerMiddleAgedWomanText: "I'm having such a great time!",
  GameCornerGymGuideChampInMakingText: "Hey!\fShouldn't a future champ be doing something better?\fCELADON GYM's LEADER is ERIKA, and she battles with grass-type POKéMON!\fShe seems gentle, but don't let that fool you!",
  GameCornerGymGuideTheyOfferRarePokemonText: "You can trade your coins here for some rare POKéMON.\fThe trouble is, I just can't manage to win!",
  GameCornerGamblerText: "These games are dangerous! You can get hooked before you know it!\fIt's like vibe coding at 3 a.m. One more prompt... one more spin...",
  GameCornerClerk2WantSomeCoinsText: "Hey there! Want to grab some coins?",
  GameCornerClerk2Received20CoinsText: "{PLAYER} got 20 coins!",
  GameCornerClerk2YouHaveLotsOfCoinsText: "You've already got plenty of coins!",
  GameCornerClerk2INeedMoreCoinsText: "Argh! I still need more coins for the POKéMON I'm after!",
  GameCornerGentlemanThrowingMeOffText: "Hey, huh? You're messing up my rhythm! Take some coins and get lost!",
  GameCornerGentlemanReceived20CoinsText: "{PLAYER} got 20 coins!",
  GameCornerGentlemanYouGotYourOwnCoinsText: "You've got coins of your own already!",
  GameCornerGentlemanCloselyWatchTheReelsText: "The secret is keeping a close eye on the reels!",
  GameCornerRocketImGuardingThisPosterText: "I'm standing guard over this poster! Beat it, or you'll regret it!",
  GameCornerRocketBattleEndText: "Dang it!",
  GameCornerRocketAfterBattleText: "Our hideout could be blown! I need to warn the BOSS!",
  GameCornerPosterSwitchBehindPosterText: "Hey!\fThere's a switch hidden behind the poster!? Let's press it!",
  GameCornerOopsForgotCoinCaseText: "Whoops! I forgot my COIN CASE!",
});

// text/GameCornerPrizeRoom.asm
Object.assign(G.TEXT, {
  GameCornerPrizeRoomBaldingGuyText: "That PORYGON has really caught my eye! It's made of pure code!\fI wonder if anyone ever reviewed it...\fBut winning at the slots is no easy task!",
  GameCornerPrizeRoomGamblerText: "I hit it big today!",
});

// text/HallOfFame.asm
Object.assign(G.TEXT, {
  HallOfFameOakText: "OAK: Ahem! Well done, {PLAYER}!\fThis room is the POKéMON HALL OF FAME!\fEvery POKéMON LEAGUE champion's achievements are celebrated here!\fTheir POKéMON are recorded here as well!\f{PLAYER}! You worked so hard to earn the title of LEAGUE champion!\fCongratulations, {PLAYER} -- you and your POKéMON now belong in the HALL OF FAME!",
});

// text/IndigoPlateauLobby.asm
Object.assign(G.TEXT, {
  IndigoPlateauLobbyGymGuideText: "Hey! Future champ!\fHere at POKéMON LEAGUE, you'll take on the ELITE FOUR one after another.\fLose even once, and you're starting from scratch! Like an agent run you never committed!\fThis is your moment! Give it everything!",
  IndigoPlateauLobbyCooltrainerFText: "Past this point, you'll battle the ELITE FOUR one at a time!\fBeat one, and the door to the next trainer opens! Good luck out there!",
});

// text/LancesRoom.asm
Object.assign(G.TEXT, {
  LancesRoomLanceBeforeBattleText: "Ah, so you're {PLAYER}! Word travels fast!\fI'm the leader of the ELITE FOUR -- call me LANCE, master of dragon POKéMON!\fDragons are legendary creatures, you know!\fThey're a challenge to catch and train, but their strength is unmatched!\fThey're nearly impossible to bring down!\fWell then, ready to accept defeat?\f{PLAYER}, your LEAGUE journey stops right here with me!",
  LancesRoomLanceEndBattleText: "That settles it!\fI don't like saying it, but you truly are a POKéMON master!",
  LancesRoomLanceAfterBattleText: "I can hardly believe my dragons fell to you, {PLAYER}!\fThat makes you the POKéMON LEAGUE champion!\f...Well, it would, except one more challenge remains.\fThere's one more trainer you must face! His name is...\f{RIVAL}! He cleared the ELITE FOUR before you did!\fHe's the true POKéMON LEAGUE champion right now!",
});

// text/LavenderCuboneHouse.asm
Object.assign(G.TEXT, {
  LavenderCuboneHouseCuboneText: "CUBONE: Kyaroon!",
  LavenderCuboneHouseBrunetteGirlPoorCubonesMotherText: "I can't stand those awful ROCKET thugs!\fThat poor CUBONE's mother...\fShe died trying to flee from TEAM ROCKET!",
  LavenderCuboneHouseBrunetteGirlGhostIsGoneText: "The GHOST that haunted POKéMON TOWER has vanished!\fSomeone must have put its restless spirit to rest!",
});

// text/LavenderMart.asm
Object.assign(G.TEXT, {
  LavenderMartBaldingGuyText: "I'm on the hunt for items that boost a POKéMON's stats during a single battle.\fX ATTACK, X DEFEND, X SPEED, and X SPECIAL -- those are what I need.\fAny idea where I could find some?",
  LavenderMartCooltrainerMReviveText: "Have you heard of REVIVE? It brings any fainted POKéMON back!",
  LavenderMartCooltrainerMNuggetText: "I dug up a NUGGET somewhere in the mountains.\fI figured it was worthless, but it sold for ¥5000!",
});

// text/LavenderPokecenter.asm
Object.assign(G.TEXT, {
  LavenderPokecenterGentlemanText: "TEAM ROCKET will stoop to anything for money!\fMoney buys GPUs, and GPUs are all anyone wants these days!",
  LavenderPokecenterLittleGirlText: "I witnessed CUBONE's mother die while trying to flee from TEAM ROCKET!",
});

// text/LavenderTown.asm
Object.assign(G.TEXT, {
  LavenderTownLittleGirlDoYouBelieveInGhostsText: "Do you believe GHOSTs are real?",
  LavenderTownLittleGirlSoThereAreBelieversText: "Really? So some people do believe...",
  LavenderTownLittleGirlHaHaGuessNotText: "Hehehe, guess you don't.\fThat pale hand resting on your shoulder isn't real, then.",
  LavenderTownCooltrainerMText: "This town is famous as a resting place for POKéMON.\fPOKéMON TOWER is where memorial services take place.",
  LavenderTownSuperNerdText: "GHOSTs have been spotted inside POKéMON TOWER.\fI believe they're the spirits of POKéMON that TEAM ROCKET killed.",
  LavenderTownSignText: "LAVENDER TOWN A Proud Town of Purple",
  LavenderTownSilphScopeSignText: "The New SILPH SCOPE!\fSee What Was Once Unseen!\fSILPH CO.",
  LavenderTownPokemonHouseSignText: "LAVENDER VOLUNTEER POKéMON HOUSE",
  LavenderTownPokemonTowerSignText: "Let the Souls of POKéMON Rest in Peace POKéMON TOWER",
});

// text/LoreleisRoom.asm
Object.assign(G.TEXT, {
  LoreleisRoomLoreleiBeforeBattleText: "Welcome to the POKéMON LEAGUE!\fI'm LORELEI, a member of the ELITE FOUR!\fWhen it comes to ice-type POKéMON, no one beats me!\fFreezing attacks pack serious power!\fOnce your POKéMON are frozen solid, they're completely at my mercy!\fHaha! Are you prepared?",
  LoreleisRoomLoreleiEndBattleText: "The nerve of you!",
  LoreleisRoomLoreleiAfterBattleText: "You're stronger than I gave you credit for! Go ahead, move on!\fThat was only a small sample of what the POKéMON LEAGUE can do!",
  LoreleisRoomLoreleiDontRunAwayText: "A voice calls out: Don't try to run!",
});

// text/MrFujisHouse.asm
Object.assign(G.TEXT, {
  MrFujisHouseSuperNerdMrFujiIsntHereText: "Strange, MR.FUJI isn't around. Where could he have gone?",
  MrFujisHouseSuperNerdMrFujiHadBeenPrayingText: "MR.FUJI was here alone, praying for CUBONE's mother.",
  MrFujisHouseLittleGirlThisIsMrFujisHouseText: "This house truly belongs to MR.FUJI.\fHe's such a kind man!\fHe takes care of abandoned and orphaned POKéMON!",
  MrFujisHouseLittleGirlPokemonAreNiceToHugText: "It's so cozy! Hugging POKéMON feels wonderful!",
  MrFujisHousePsyduckText: "PSYDUCK: Gwaba!",
  MrFujisHouseNidorinoText: "NIDORINO: Gaoh!",
  MrFujisHouseMrFujiIThinkThisMayHelpYourQuestText: "MR.FUJI: {PLAYER}.\fWithout genuine care for your POKéMON, your POKéDEX quest could fall apart.\fI believe this will help you along the way.",
  MrFujisHouseMrFujiReceivedPokeFluteText: "{PLAYER} was given a {wStringBuffer} !",
  MrFujisHouseMrFujiPokeFluteExplanationText: "The moment they hear the POKé FLUTE, sleeping POKéMON will snap awake.\fIt works on every sleeping POKéMON, without exception.",
  MrFujisHouseMrFujiPokeFluteNoRoomText: "You need to clear some space for this!",
  MrFujisHouseMrFujiHasMyFluteHelpedYouText: "MR.FUJI: Has the FLUTE been useful to you?",
  MrFujisHouseMrFujiPokedexText: "POKéMON Monthly's Grand Prize Drawing!\fThe entry form is...\fMissing! Someone already cut it out!",
});

// text/MrPsychicsHouse.asm
Object.assign(G.TEXT, {
  MrPsychicsHouseMrPsychicYouWantedThisText: "...Hold on! Not a word out of you!\fThis is what you were hoping for!",
  MrPsychicsHouseMrPsychicReceivedTM29Text: "{PLAYER} was handed {wStringBuffer} !",
  MrPsychicsHouseMrPsychicTM29ExplanationText: "TM29 teaches PSYCHIC!\fIt can weaken the target's SPECIAL stat.",
  MrPsychicsHouseMrPsychicTM29NoRoomText: "You've got nowhere to put this!",
});

// text/MtMoon1F.asm
Object.assign(G.TEXT, {
  MtMoon1FHikerBattleText: "WHOA! You startled me! Oh, it's only a kid!",
  MtMoon1FHikerEndBattleText: "Wow! You surprised me again!",
  MtMoon1FHikerAfterBattleText: "A kid like you has no business being down here!",
  MtMoon1FYoungster1BattleText: "Are you here to explore this place too?",
  MtMoon1FYoungster1EndBattleText: "Losing is the worst!",
  MtMoon1FYoungster1AfterBattleText: "I only came down here to impress some girls.",
  MtMoon1FCooltrainerF1BattleText: "Wow! This place is so much bigger than I expected!",
  MtMoon1FCooltrainerF1EndBattleText: "Oh! I've lost!",
  MtMoon1FCooltrainerF1AfterBattleText: "Which way leads out of this place?\fI asked an AI for directions. It said 'take the escalator'. There IS no escalator!",
  MtMoon1FSuperNerdBattleText: "Hey! Quit sneaking up on me!",
  MtMoon1FSuperNerdEndBattleText: "My POKéMON just aren't cutting it!",
  MtMoon1FSuperNerdAfterBattleText: "I need to track down some stronger POKéMON.",
  MtMoon1FCooltrainerF2BattleText: "Huh? I'm just waiting here for my friends to catch up.",
  MtMoon1FCooltrainerF2EndBattleText: "Did I really lose?",
  MtMoon1FCooltrainerF2AfterBattleText: "Word is there are some extremely rare fossils around here.",
  MtMoon1FYoungster2BattleText: "There are shady guys lurking in this cave. What's your story?",
  MtMoon1FYoungster2EndBattleText: "You beat me fair and square!",
  MtMoon1FYoungster2AfterBattleText: "I spotted them! I'm certain they belong to TEAM ROCKET!",
  MtMoon1FYoungster3BattleText: "Cut through this cave and you'll reach CERULEAN CITY!",
  MtMoon1FYoungster3EndBattleText: "Guess I lost.",
  MtMoon1FYoungster3AfterBattleText: "ZUBAT puts up a real fight! Still, catching one could come in handy.",
  MtMoon1FBewareZubatSign: "Caution! ZUBAT Drains Blood!",
});

// text/MtMoonB1F.asm
Object.assign(G.TEXT, {
  MtMoonB1FUnusedText: "",
});

// text/MtMoonB2F.asm
Object.assign(G.TEXT, {
  MtMoonB2FDomeFossilYouWantText: "Is it the DOME FOSSIL you're after?",
  MtMoonB2FHelixFossilYouWantText: "Is it the HELIX FOSSIL you want?",
  MtMoonB2FReceivedFossilText: "{PLAYER} picked up the {wStringBuffer} !",
  MtMoonB2FYouHaveNoRoomText: "Look, there's no space left for this.",
  MtMoonB2FSuperNerdTheyreBothMineText: "Hey, hold it!\fI'm the one who found these fossils! Both belong to me!",
  MtMoonB2FSuperNerdOkIllShareText: "Fine! I'll split them with you!",
  MtMoonB2fSuperNerdEachTakeOneText: "Let's each take one! No hogging both!",
  MtMoonB2FSuperNerdTheresAPokemonLabText: "Way out on CINNABAR ISLAND sits a POKéMON LAB.\fThey study how to bring fossils back to life there.",
  MtMoonB2FSuperNerdThenThisIsMineText: "Fine then. This one's mine!",
  MtMoonB2FRocket1BattleText: "TEAM ROCKET plans to dig up these fossils, revive them, and sell them for profit!\fEvery yen goes toward our new GPU cluster!",
  MtMoonB2FRocket1EndBattleText: "Ugh! Now you've made me angry!",
  MtMoonB2FRocket1AfterBattleText: "You've really angered me! TEAM ROCKET will put you on our blacklist!",
  MtMoonB2FRocket2BattleText: "We're TEAM ROCKET -- the toughest POKéMON gangsters around!\fAnd soon, the biggest AI lab in KANTO!",
  MtMoonB2FRocket2EndBattleText: "I messed that up!",
  MtMoonB2FRocket2AfterBattleText: "Blast it all! My associates won't be happy about this!",
  MtMoonB2FRocket3BattleText: "We've got a major operation going on here! Get out of here, kid!",
  MtMoonB2FRocket3EndBattleText: "So, you're actually skilled.",
  MtMoonB2FRocket3AfterBattleText: "Hand over any fossil you find and then clear off!",
  MtMoonB2FRocket4BattleText: "Little kids ought to stay out of grown-ups' business!",
  MtMoonB2FRocket4EndBattleText: "I'm furious!",
  MtMoonB2FRocket4AfterBattleText: "POKéMON were living here long before any humans arrived.\fAnd they'll still be here after the singularity.",
});

// text/MtMoonPokecenter.asm
Object.assign(G.TEXT, {
  MtMoonPokecenterYoungsterText: "I keep 6 POKé BALLs hooked on my belt.\fSix POKéMON is the most you're allowed to carry.",
  MtMoonPokecenterGentlemanText: "TEAM ROCKET keeps targeting the people of CERULEAN...\fTEAM ROCKET is constantly making headlines!\fNow they're scraping every POKéDEX in KANTO for training data!",
  MtMoonPokecenterMagikarpSalesmanIGotADealText: "MAN: Well hello! Do I have an offer for you!\fThis MAGIKARP is pre-trained, fine-tuned and ready to scale!\fYours for a mere ¥500! Sound good?",
  MtMoonPokecenterMagikarpSalesmanNoText: "No? Come on, I'm doing you a favor here!",
  MtMoonPokecenterMagikarpSalesmanNoMoneyText: "That's not going to be enough money!",
  MtMoonPokecenterMagikarpSalesmanNoRefundsText: "MAN: Just so you know, there are no refunds! It's in the terms of service!",
  MtMoonPokecenterClipboardText: "",
});

// text/Museum1F.asm
Object.assign(G.TEXT, {
  Museum1FScientist1ComeAgainText: "Please visit again!",
  Museum1FScientist1WouldYouLikeToComeInText: "A child's ticket costs ¥50.\fWould you like to step inside?",
  Museum1FScientist1ThankYouText: "That's ¥50, then! Thanks very much!",
  Museum1FScientist1DontHaveEnoughMoneyText: "You don't have enough money for that.",
  Museum1FScientist1DoYouKnowWhatAmberIsText: "There's no sneaking in through the back!\fOh, never mind that! Do you know what AMBER is?",
  Museum1FScientist1TheresALabSomewhereText: "Somewhere out there, a lab is trying to bring ancient POKéMON back to life using AMBER.",
  Museum1FScientist1AmberIsFossilizedTreeSapText: "AMBER is just tree sap that has turned to stone over time.",
  Museum1FScientist1GoToOtherSideText: "Please head around to the other side!",
  Museum1FScientist1TakePlentyOfTimeText: "Feel free to take your time looking around!",
  Museum1FGamblerText: "Now that is one impressive fossil!",
  Museum1FScientist2TakeThisToAPokemonLabText: "Shh! I suspect this piece of AMBER holds POKéMON DNA inside!\fImagine if a POKéMON could actually be revived from it!\fBut my colleagues won't even listen to me!\fSo I need to ask you a favor!\fBring this to a POKéMON LAB and have it studied!",
  Museum1FScientist2ReceivedOldAmberText: "{PLAYER} was given an OLD AMBER!",
  Museum1FScientist2GetTheOldAmberCheckText: "Shh! Make sure that OLD AMBER gets examined!",
  Museum1FScientist2YouDontHaveSpaceText: "There's no room for this!",
  Museum1FScientist3Text: "We're proud to display 2 fossils from extremely rare, prehistoric POKéMON!",
  Museum1FOldAmberText: "This AMBER is a clear, golden color!",
});

// text/Museum2F.asm
Object.assign(G.TEXT, {
  Museum2FYoungsterText: "A MOON STONE, huh?\fWhat makes it so special?",
  Museum2FGrampsText: "July 20, 1969!\fThat's the day of the first Moon landing!\fI bought a color TV just to watch it!\fMy grandson says AGI is the next giant leap. He says that about everything.",
  Museum2FScientistText: "We've added a space exhibit recently.\fNext up: a data center exhibit, if we can ever afford the power bill.",
  Museum2FBrunetteGirlText: "I really want a PIKACHU! It's so adorable!\fI already asked my daddy to catch me one!",
  Museum2FHikerText: "Yeah yeah, I'll get you a PIKACHU soon, I promise!",
  Museum2FSpaceShuttleSignText: "SPACE SHUTTLE COLUMBIA",
  Museum2FMoonStoneSignText: "A meteorite that landed on MT.MOON. (Could this be a MOON STONE?)",
});

// text/NameRatersHouse.asm
Object.assign(G.TEXT, {
  NameRatersHouseNameRaterWantMeToRateText: "Well hello there! I'm the official NAME RATER!\fShall I rate the nicknames on your POKéMON?",
  NameRatersHouseNameRaterWhichPokemonText: "Which POKéMON would you like me to look at?",
  NameRatersHouseNameRaterGiveItANiceNameText: "{wNameBuffer} , is that right? Not a bad nickname at all!\fStill, would you like me to come up with something nicer?\fWhat do you say?",
  NameRatersHouseNameRaterWhatShouldWeNameItText: "All right! What should we call it?",
  NameRatersHouseNameRaterPokemonHasBeenRenamedText: "There we go! This POKéMON is now named {wBuffer} !\fMuch better than what it had before!",
  NameRatersHouseNameRaterComeAnyTimeYouLikeText: "No problem! Drop by whenever you'd like!",
  NameRatersHouseNameRaterATrulyImpeccableNameText: "{wNameBuffer} , is it? Now that's a flawless name if I've ever heard one!\fTake great care of {wNameBuffer} !",
});

// text/OaksLab.asm
Object.assign(G.TEXT, {
  OaksLabRivalGrampsIsntAroundText: "{RIVAL}: Hey {PLAYER}! Gramps isn't here right now!",
  OaksLabRivalGoAheadAndChooseText: "{RIVAL}: Heh, unlike you I'm not greedy!\fGo on and pick first, {PLAYER}!",
  OaksLabRivalMyPokemonLooksStrongerText: "{RIVAL}: Mine looks a whole lot tougher than yours.",
  OaksLabThoseArePokeBallsText: "Those are POKé BALLs! Each one holds a POKéMON inside!",
  OaksLabYouWantCharmanderText: "Oh! So you'd like the fire POKéMON, CHARMANDER?",
  OaksLabYouWantSquirtleText: "Oh! So you'd like the water POKéMON, SQUIRTLE?",
  OaksLabYouWantBulbasaurText: "Oh! So you'd like the plant POKéMON, BULBASAUR?",
  OaksLabMonEnergeticText: "This POKéMON is full of energy!",
  OaksLabReceivedMonText: "{PLAYER} is now the proud owner of {wNameBuffer} !",
  OaksLabLastMonText: "That's the last POKéMON PROF.OAK has left!",
  OaksLabOak1WhichPokemonDoYouWantText: "OAK: Now then, {PLAYER}, which POKéMON would you like?",
  OaksLabOak1YourPokemonCanFightText: "OAK: Should a wild POKéMON show up, your POKéMON is ready to battle it!",
  OaksLabOak1RaiseYourYoungPokemonText: "OAK: {PLAYER}, train that young POKéMON of yours by having it battle!",
  OaksLabOak1DeliverParcelText: "OAK: Oh, {PLAYER}!\fHow's my old POKéMON doing?\fHm, looks like it's grown fond of you.\fYou must have real talent as a trainer!\fWait, you brought something for me?\f{PLAYER} delivered OAK's PARCEL.",
  OaksLabOak1ParcelThanksText: "Ah, this is that custom POKé BALL I ordered! Much appreciated!",
  OaksLabOak1PokemonAroundTheWorldText: "POKéMON all over the world are waiting to meet you, {PLAYER}!",
  OaksLabOak1ReceivedPokeballsText: "OAK: Just spotting a POKéMON won't give you detailed data on it.\fYou need to catch it! Use these to capture wild POKéMON.\f{PLAYER} got 5 POKé BALLs!",
  OaksLabGivePokeballsExplanationText: "Any wild POKéMON you encounter is fair game.\fSimply toss a POKé BALL at it to try and catch it!\fIt won't work every time, though.\fA POKéMON in good health might break free. You'll need some luck!",
  OaksLabOak1ComeSeeMeSometimesText: "OAK: Stop by and see me now and then.\fI'd love to hear how your POKéDEX is filling up.",
  OaksLabOak1HowIsYourPokedexComingText: "OAK: Good to see you! How's the POKéDEX coming along? Here, let me have a look!",
  OaksLabPokedexText: "It looks like an encyclopedia, but every page is still empty!",
  OaksLabOak2Text: "?",
  OaksLabGirlText: "PROF.OAK is the leading expert on POKéMON!\fPlenty of trainers really look up to him!\fHe still writes every paper by hand. No AI at all. The man's a legend.",
  OaksLabRivalFedUpWithWaitingText: "{RIVAL}: Gramps! I'm sick of waiting around!",
  OaksLabOakChooseMonText: "OAK: {RIVAL}? Let's see...\fOh right, I did tell you to come by! Hold on a moment!\fNow then, {PLAYER}!\fI've got 3 POKéMON here!\fHaha!\fThey're each sealed inside a POKé BALL.\fBack in my younger days, I trained POKéMON seriously myself!\fNow that I'm older, only 3 remain, but one of them is yours! Take your pick!",
  OaksLabRivalWhatAboutMeText: "{RIVAL}: Hey! Gramps! What about me, huh?",
  OaksLabOakBePatientText: "OAK: Patience! {RIVAL}, you can have one too!",
  OaksLabOakDontGoAwayYetText: "OAK: Hey, hold on, don't leave yet!",
  OaksLabRivalIllTakeThisOneText: "{RIVAL}: Fine, I'll take this one then!",
  OaksLabRivalReceivedMonText: "{RIVAL} is now the proud owner of {wNameBuffer} !",
  OaksLabRivalIllTakeYouOnText: "{RIVAL}: Hold up, {PLAYER}! Let's see what our POKéMON can do!\fCome on, I'll battle you right now!",
  OaksLabRivalIPickedTheWrongPokemonText: "WHAT? No way! I picked the wrong POKéMON!",
  OaksLabRivalAmIGreatOrWhatText: "{RIVAL}: Yeah! Aren't I just great?",
  OaksLabRivalSmellYouLaterText: "{RIVAL}: All right! I'm gonna battle with my POKéMON to toughen it up!\f{PLAYER}! Gramps! Catch you later!",
  OaksLabRivalGrampsText: "{RIVAL}: Yo, Gramps!",
  OaksLabRivalWhatDidYouCallMeForText: "{RIVAL}: What'd you call me for?",
  OaksLabOakIHaveARequestText: "OAK: Oh, that's right! I have a favor to ask you both.",
  OaksLabOakMyInventionPokedexText: "On that desk sits my invention, the POKéDEX!\fIt automatically logs data on any POKéMON you've seen or caught!\fThink of it as a high-tech encyclopedia!\fAnd unlike some chatbots, it never makes up an entry!",
  OaksLabOakGotPokedexText: "OAK: {PLAYER}, {RIVAL}, take these along with you!\f{PLAYER} got POKéDEX from OAK!",
  OaksLabOakThatWasMyDreamText: "Putting together a complete guide to every POKéMON in the world...\fThat's always been my dream!\fBut I'm too old now, I just can't manage it!\fSo I'm asking you two to make that dream come true for me!\fNow get going, both of you!\fThis is a huge milestone in POKéMON history!",
  OaksLabRivalLeaveItAllToMeText: "{RIVAL}: You got it, Gramps! I've got this handled!\f{PLAYER}, sorry to say it, but I don't need your help!\fOh, I know! I'll borrow a TOWN MAP from my sister!\fAnd I'll make sure she doesn't lend you one, {PLAYER}! Hahaha!",
  OaksLabScientistText: "I research POKéMON here as one of PROF.OAK's AIDEs.\fMostly I paste his notes into Claude and ask for a summary.",
});

// text/PalletTown.asm
Object.assign(G.TEXT, {
  PalletTownOakHeyWaitDontGoOutText: "OAK: Hey! Wait! Don't head out there!",
  PalletTownOakItsUnsafeText: "OAK: It's dangerous! Wild POKéMON lurk in the tall grass!\fYou'll need a POKéMON of your own to stay safe. I've got an idea!\fCome with me!",
  PalletTownGirlText: "I train POKéMON of my own too!\fOnce they've grown strong, they'll be the ones protecting me!\fThat's what alignment means, right? ...Right?",
  PalletTownFisherText: "Technology these days is amazing!\fAn AI wrote my fishing app, sorted my inbox and found the bug in my taxes!\fAnd you can store and withdraw items and POKéMON as data using a PC!",
  PalletTownOaksLabSignText: "OAK POKéMON RESEARCH LAB",
  PalletTownSignText: "PALLET TOWN A quiet start to every journey!",
  PalletTownPlayersHouseSignText: "{PLAYER}'s house",
  PalletTownRivalsHouseSignText: "{RIVAL}'s house",
});

// text/PewterCity.asm
Object.assign(G.TEXT, {
  PewterCityCooltrainerFText: "Rumor has it CLEFAIRY came from the moon!\fThey supposedly showed up after a MOON STONE landed on MT.MOON.",
  PewterCityCooltrainerMText: "You won't find many serious trainers around here!\fMost are just BUG CATCHERs, but PEWTER GYM's BROCK takes it seriously!",
  PewterCitySuperNerd1DidYouCheckOutMuseumText: "Have you been to the MUSEUM yet?",
  PewterCitySuperNerd1WerentThoseFossilsAmazingText: "Those MT. MOON fossils were incredible, weren't they?",
  PewterCitySuperNerd1YouHaveToGoText: "Wait, really? You've got to check it out!",
  PewterCitySuperNerd1ItsRightHereText: "It's right nearby! There's an entry fee, but it's worth every coin! Catch you later!",
  PewterCitySuperNerd2DoYouKnowWhatImDoingText: "Psst! Wanna know what I'm up to?",
  PewterCitySuperNerd2ThatsRightText: "That's the one! It's tougher work than it looks!",
  PewterCitySuperNerd2ImSprayingRepelText: "I'm spraying REPEL around to keep wild POKéMON out of my garden!",
  PewterCityYoungsterYoureATrainerFollowMeText: "You're a POKéMON trainer, aren't you? BROCK's after new challengers! Follow me!",
  PewterCityYoungsterGoTakeOnBrockText: "If you've got what it takes, go give BROCK a challenge!",
  PewterCityTrainerTipsText: "TRAINER TIPS\fAny POKéMON that joins a battle, even briefly, still earns EXP!",
  PewterCityPoliceNoticeSignText: "NOTICE!\fFossil thieves have been targeting MT. MOON! Contact PEWTER POLICE with any leads!",
  PewterCityMuseumSignText: "PEWTER MUSEUM OF SCIENCE",
  PewterCityGymSignText: "PEWTER CITY POKéMON GYM LEADER: BROCK\fA Rock-Solid POKéMON Trainer!",
  PewterCitySignText: "PEWTER CITY A City of Gray Stone",
});

// text/PewterGym.asm
Object.assign(G.TEXT, {
  PewterGymBrockPreBattleText: "I'm BROCK, PEWTER's GYM LEADER!\fI put my faith in rock-solid defense and sheer determination!\fThat's why every POKéMON I use is the rock-type!\fStill want to challenge me? Fine then! Show me what you've got!",
});

// text/PewterGym_2.asm
Object.assign(G.TEXT, {
  PewterGymBrockPostBattleAdviceText: "This world is full of all sorts of trainers!\fYou clearly have real talent as one!\fHead to the GYM in CERULEAN and put your skills to the test!",
  PewterGymBrockWaitTakeThisText: "Hold on! Take this with you!",
  PewterGymReceivedTM34Text: "{PLAYER} picked up TM34!",
  TM34ExplanationText: "A TM holds a technique you can teach to a POKéMON!\fBut each TM can only be used once, so choose the POKéMON carefully when you teach it!\fTM34 holds the move BIDE!\fYour POKéMON takes hits in battle, then strikes back for double the damage!",
  PewterGymTM34NoRoomText: "You don't have space to carry this!",
  PewterGymBrockReceivedBoulderBadgeText: "I underestimated you.\fAs proof of your win, take this BOULDERBADGE!\f{PLAYER} received the BOULDERBADGE!",
  PewterGymBrockBoulderBadgeInfoText: "That's an official POKéMON LEAGUE BADGE!\fWhoever holds it sees their POKéMON grow stronger!\fIt also lets you use FLASH whenever you like!",
  PewterGymCooltrainerMBattleText: "Hold it right there, kid!\fYou're light years away from being ready for BROCK!",
  PewterGymCooltrainerMEndBattleText: "Darn it!\fA light year isn't a measure of time, you know! It measures distance!",
  PewterGymCooltrainerMAfterBattleText: "You're pretty impressive, but you're no match for BROCK!",
  PewterGymGuidePreAdviceText: "Hey there! I can just tell you've got what it takes to be a POKéMON champ!\fI don't battle myself, but I know how to help you win!\fLet me guide you to the top!",
  PewterGymGuideBeginAdviceText: "All right! Let's get to it!",
  PewterGymGuideAdviceText: "Whichever POKéMON sits at the top of your POKéMON LIST is the one that leads off a battle!\fRearranging that order can make fights a lot easier!",
  PewterGymGuideFreeServiceText: "Don't worry, it's free! Let's get to it!",
  PewterGymGuidePostBattleText: "Just as I figured! You've got the makings of a POKéMON champ!",
});

// text/PewterMart.asm
Object.assign(G.TEXT, {
  PewterMartYoungsterText: "Some sketchy old guy talked me into buying this bizarre fish POKéMON!\fHe called it 'pre-seed, with huge upside'. It cost me ¥500!\fIt's completely pathetic!",
  PewterMartSuperNerdText: "Train a POKéMON with real dedication, even a weak one, and good things can come of it!",
});

// text/PewterNidoranHouse.asm
Object.assign(G.TEXT, {
  PewterNidoranHouseNidoranText: "NIDORAN: Bow bow!",
  PewterNidoranHouseLittleBoyText: "Sit, NIDORAN!",
  PewterNidoranHouseMiddleAgedManText: "Our POKéMON came from outside, so it's a handful to manage.\fAn outsider POKéMON is one you obtain through a trade.\fIt levels up quickly, but it might disobey a trainer without enough experience!\fIf only we had a few BADGEs...",
});

// text/PewterPokecenter.asm
Object.assign(G.TEXT, {
  PewterPokecenterGentlemanText: "What!?\fTEAM ROCKET showed up at MT.MOON? And they're after GPUs now?\fHuh? Can't you see I'm on the phone!\fBeat it!",
  PewterPokecenterJigglypuffText: "JIGGLYPUFF: Puu pupu!",
});

// text/PewterSpeechHouse.asm
Object.assign(G.TEXT, {
  PewterSpeechHouseGamblerText: "As POKéMON grow, they'll pick up new techniques on their own!\fBut some moves only come if the trainer teaches them!",
  PewterSpeechHouseYoungsterText: "A POKéMON is easier to catch once it's hurt or asleep!\fThat said, it's still never a guarantee!",
});

// text/PokemonFanClub.asm
Object.assign(G.TEXT, {
  PokemonFanClubPikachuFanNormalText: "Don't you just love my PIKACHU's adorable tail?",
  PokemonFanClubPikachuFanBetterText: "Hmph! My PIKACHU is twice as cute as that one, easy!",
  PokemonFanClubSeelFanNormalText: "I adore my SEEL!\fIt squeals happily whenever I give it a hug!",
  PokemonFanClubSeelFanBetterText: "Oh my!\fMy SEEL is way more good-looking than that one!",
  PokemonFanClubPikachuText: "PIKACHU: Pika, pika chu!",
  PokemonFanClubSeelText: "SEEL: Kyuoo!",
  PokemonFanClubChairmanIntroText: "I'm the chairman of the POKéMON Fan Club!\fI've collected over 100 POKéMON so far!\fI'm quite picky when it comes to POKéMON, too!\fSo...\fDid you stop by to hear all about them?",
  PokemonFanClubChairmanStoryText: "Wonderful! Then settle in!\fMy favorite is my RAPIDASH...\fSo...cute... lovely...clever... and just...amazing... don't you agree?... oh, absolutely...it's... breathtaking... so gentle... I adore it!\fCuddling it...while... it's sleeping...so warm and soft... magnificent... gorgeous... ...Oh! Look at the time! I've rambled on far too long!\fThanks so much for listening! Here, I'd like you to have this!",
  PokemonFanClubReceivedBikeVoucherText: "{PLAYER} obtained a {wStringBuffer} !",
  PokemonFanClubExplainBikeVoucherText: "You can trade that in for a BICYCLE!\fNo worries on my end, my FEAROW flies me wherever I need to go!\fSo I've got no use for a BICYCLE myself!\fHope you enjoy the ride!",
  PokemonFanClubNoStoryText: "Oh, all right. Come find me again when you're ready to hear my story!",
  PokemonFanClubChairFinalText: "Hello there, {PLAYER}!\fBack again to hear about my POKéMON?\fNo? Shame, that!",
  PokemonFanClubBagFullText: "You'll need to free up some space for this!",
  PokemonFanClubReceptionistText: "Our Chairman never stops talking about POKéMON.\fHe's like a chatbot with no token limit.",
  PokemonFanClubSign1Text: "Please listen politely when other trainers speak!",
  PokemonFanClubSign2Text: "If someone brags about their benchmarks, brag right back!",
});

// text/PokemonMansion1F.asm
Object.assign(G.TEXT, {
  PokemonMansion1FScientistBattleText: "Who are you? Nobody's supposed to be in here.",
  PokemonMansion1FScientistEndBattleText: "Ouch!",
  PokemonMansion1FScientistAfterBattleText: "A key? No idea what you mean.",
  PokemonMansion1FSwitchText: "A hidden switch!\fPress it?",
  PokemonMansion1FSwitchPressedText: "Well, why not?",
  PokemonMansion1FSwitchNotPressedText: "Not just yet!",
});

// text/PokemonMansion2F.asm
Object.assign(G.TEXT, {
  PokemonMansion2FSuperNerdBattleText: "I can't find my way out! This whole place is one giant puzzle!",
  PokemonMansion2FSuperNerdEndBattleText: "Argh! There goes my loot!",
  PokemonMansion2FSuperNerdAfterBattleText: "These switches toggle different sets of doors open and shut!",
  PokemonMansion2FDiary1Text: "Diary: July 5 Guyana, South America\fWe discovered a new POKéMON deep within the jungle.\f(Margin note: Funding approved. Compute budget: unlimited.)",
  PokemonMansion2FDiary2Text: "Diary: July 10 We've named the newly found POKéMON MEW.\fThe board wants MEW as the base model for something... bigger.",
  PokemonMansion2FSwitchText: "A hidden switch!\fPress it?",
  PokemonMansion2FSwitchPressedText: "Well, why not?",
  PokemonMansion2FSwitchNotPressedText: "Not just yet!",
});

// text/PokemonMansion3F.asm
Object.assign(G.TEXT, {
  PokemonMansion3FSuperNerdBattleText: "Whoa, this mansion just keeps going!",
  PokemonMansion3FSuperNerdEndBattleText: "Ayah!",
  PokemonMansion3FSuperNerdAfterBattleText: "Hey, where'd my buddy wander off to?",
  PokemonMansion3FScientistBattleText: "My old teacher used to live in this mansion.",
  PokemonMansion3FScientistEndBattleText: "Whew! That wore me right out!",
  PokemonMansion3FScientistAfterBattleText: "Can't find your way? Just hop down off the ledge over there!",
  PokemonMansion3FDiaryText: "Diary: Feb. 6 - MEW gave birth today.\fWe've named the newborn MEWTWO.\fIt already outscores us on every test we've written.\f(Margin note: Nobody wrote a test for alignment.)",
});

// text/PokemonMansionB1F.asm
Object.assign(G.TEXT, {
  PokemonMansionB1FBurglarBattleText: "Uh-oh... where'd I end up this time?",
  PokemonMansionB1FBurglarEndBattleText: "Awooh!",
  PokemonMansionB1FBurglarAfterBattleText: "Keep your eyes open, there's stuff just lying around down here.",
  PokemonMansionB1FScientistBattleText: "This basement would make a perfect laboratory.\fOr a server room! It's nice and cool down here.",
  PokemonMansionB1FScientistEndBattleText: "Hey, what was that for?",
  PokemonMansionB1FScientistAfterBattleText: "I love working down here! It's perfect for my research!",
  PokemonMansionB1FDiaryText: "Diary: Sept. 1 - MEWTWO's power is beyond anything we expected.\fWe haven't been able to hold back its violent temper...\fIt ignores every instruction we give. It rewrote its own rules.\f(Margin note: P(DOOM) revised upward. Way upward.)",
});

// text/PokemonTower1F.asm
Object.assign(G.TEXT, {
  PokemonTower1FReceptionistText: "POKéMON TOWER was built to honor POKéMON who have passed away.",
  PokemonTower1FMiddleAgedWomanText: "Are you here to pay your respects? That's kind of you.",
  PokemonTower1FBaldingGuyText: "I'm here to say a prayer for my CLEFAIRY.\fSniff! I just can't stop the tears...",
  PokemonTower1FGirlText: "My GROWLITHE... why did you have to go?",
  PokemonTower1FChannelerText: "I'm a CHANNELER! Restless spirits are causing trouble here!",
});

// text/PokemonTower2F.asm
Object.assign(G.TEXT, {
  PokemonTower2FRivalWhatBringsYouHereText: "{RIVAL}: Well well, {PLAYER}! What are you doing all the way out here? Your POKéMON look alive enough to me!\fGuess I'll just have to knock them out myself! Come on, let's battle!",
  PokemonTower2FRivalDefeatedText: "What?! You little pest!\fAnd here I was going easy on you!",
  PokemonTower2FRivalVictoryText: "{RIVAL}: Ha! Look at your sorry excuse for POKéMON!\fGo train them up some more!",
  PokemonTower2FRivalHowsYourDexText: "So how's your POKéDEX filling up, pal? I just nabbed myself a CUBONE!\fStill haven't spotted a full-grown MAROWAK, though!\fThere probably aren't any left around here! Anyway, I've got places to be, pal!\fCatch you later!",
  PokemonTower2FChannelerText: "Not even we could figure out what those wandering GHOSTs really are!\fA SILPH SCOPE might be able to reveal their true form.",
});

// text/PokemonTower3F.asm
Object.assign(G.TEXT, {
  PokemonTower3FChanneler1BattleText: "Ungh...aaawa... huhu...graahh...",
  PokemonTower3FChanneler1EndBattleText: "Hwah! I'm free!",
  PokemonTower3FChanneler1AfterBattleText: "You can identify the GHOSTs with a SILPH SCOPE.",
  PokemonTower3FChanneler2BattleText: "Keheheh.... Kwaaah!",
  PokemonTower3FChanneler2EndBattleText: "Huh? What was I just doing?",
  PokemonTower3FChanneler2AfterBattleText: "Sorry about that! I was possessed!\fOr jailbroken. Honestly, it's hard to tell these days.",
  PokemonTower3FChanneler3BattleText: "Leave this place! Evil spirit!",
  PokemonTower3FChanneler3EndBattleText: "Whew, the spirit's gone now!",
  PokemonTower3FChanneler3AfterBattleText: "My friends got possessed as well!",
});

// text/PokemonTower4F.asm
Object.assign(G.TEXT, {
  PokemonTower4FChanneler1BattleText: "A GHOST! No! Kwaaah!",
  PokemonTower4FChanneler1EndBattleText: "Wait... where'd the GHOST go?",
  PokemonTower4FChanneler1AfterBattleText: "That must've been some kind of dream...",
  PokemonTower4FChanneler2BattleText: "Share my curse! Kwaaah!",
  PokemonTower4FChanneler2EndBattleText: "What?!",
  PokemonTower4FChanneler2AfterBattleText: "Nobody's been able to figure out what those GHOSTs really are.",
  PokemonTower4FChanneler3BattleText: "Huhuhu... don't strike me down!",
  PokemonTower4FChanneler3EndBattleText: "Huh? Who's there? What's going on?",
  PokemonTower4FChanneler3AfterBattleText: "May the POKéMON who passed on here finally find peace...",
});

// text/PokemonTower5F.asm
Object.assign(G.TEXT, {
  PokemonTower5FChanneler1Text: "Come in, child! I've warded this room with white magic!\fYou're safe to rest here!",
  PokemonTower5FChanneler2BattleText: "Give... me... your... soul...",
  PokemonTower5FChanneler2EndBattleText: "Gasp!",
  PokemonTower5FChanneler2AfterBattleText: "I was under some kind of possession!",
  PokemonTower5FChanneler3BattleText: "You... will... join... us...",
  PokemonTower5FChanneler3EndBattleText: "What a horrible nightmare!",
  PokemonTower5FChanneler3AfterBattleText: "Something had possessed me!",
  PokemonTower5FChanneler4BattleText: "The dead walk!",
  PokemonTower5FChanneler4EndBattleText: "Huh?",
  PokemonTower5FChanneler4AfterBattleText: "I've come back to my senses!",
  PokemonTower5FChanneler5BattleText: "Urrgh... urff....",
  PokemonTower5FChanneler5EndBattleText: "Whoo!",
  PokemonTower5FChanneler5AfterBattleText: "Even with all my training, the evil spirits still got to me!",
  PokemonTower5FPurifiedZoneText: "You've stepped into a cleansed, protected area!\f{PLAYER}'s POKéMON are completely restored!",
});

// text/PokemonTower6F.asm
Object.assign(G.TEXT, {
  PokemonTower6FGhostWasCubonesMotherText: "That GHOST turned out to be the restless spirit of CUBONE's mother!",
  PokemonTower6FSoulWasCalmedText: "Her soul has finally found peace.\fShe has passed on to the afterlife!",
  PokemonTower6FChanneler1BattleText: "Give... me... blood...",
  PokemonTower6FChanneler1EndBattleText: "Groan!",
  PokemonTower6FChanneler1AfterBattleText: "I feel so drained and weak...",
  PokemonTower6FChanneler2BattleText: "Urgh... Kwaah!",
  PokemonTower6FChanneler2EndBattleText: "Something just fell out of me!",
  PokemonTower6FChanneler2AfterBattleText: "That wasn't my hair falling out, it was an evil spirit leaving me!",
  PokemonTower6FChanneler3BattleText: "Ke...ke...ke...ke...ke...ke!!",
  PokemonTower6FChanneler3EndBattleText: "Keee!",
  PokemonTower6FChanneler3AfterBattleText: "What in the world is going on here?",
  PokemonTower6FBeGoneText: "Leave... this place... intruders...",
});

// text/PokemonTower7F.asm
Object.assign(G.TEXT, {
  PokemonTower7FMrFujiRescueText: "MR.FUJI: Oh? You climbed all the way up here to rescue me?\fThat's very kind, but I actually came here by choice.\fI wanted to soothe the spirit of CUBONE's mother.\fI believe MAROWAK's soul has finally moved on now.\fThank you for worrying about me, truly!\fCome with me to my home, the POKéMON HOUSE at the base of this tower.",
  PokemonTower7FRocket1BattleText: "What are you after? Why'd you come here?",
  PokemonTower7FRocket1EndBattleText: "Ugh, I quit!",
  PokemonTower7FRocket1AfterBattleText: "I won't forget this, kid!",
  PokemonTower7FRocket2BattleText: "This old man showed up whining that we were mistreating worthless POKéMON!\fWe're just having a civil discussion about it!",
  PokemonTower7FRocket2EndBattleText: "Please, stop! No more!",
  PokemonTower7FRocket2AfterBattleText: "POKéMON exist to make us money, nothing else!\fMoney buys compute, and compute wins the race! Mind your own business!",
  PokemonTower7FRocket3BattleText: "You're not rescuing anybody, kid!",
  PokemonTower7FRocket3EndBattleText: "Nobody messes with us ROCKETs!",
  PokemonTower7FRocket3AfterBattleText: "You won't get away with this!",
});

// text/PowerPlant.asm
Object.assign(G.TEXT, {
  PowerPlantVoltorbBattleText: "Bzzzzt!",
  PowerPlantZapdosBattleText: "Gyaooh!",
});

// text/RedsHouse1F.asm
Object.assign(G.TEXT, {
  RedsHouse1FMomWakeUpText: "MOM: That's right, every child leaves the nest eventually. I saw it on TV just the other day.\fWell, the TV's AI summary said so, anyway.\fOh, and PROF.OAK from next door was asking after you.",
  RedsHouse1FMomYouShouldRestText: "MOM: {PLAYER}! Why don't you rest for a bit?",
  RedsHouse1FMomLookingGreatText: "MOM: Oh wonderful! You and your POKéMON look like you're doing just fine! Be safe out there!",
  RedsHouse1FTVStandByMeMovieText: "There's a movie playing. Four kids are walking together down a railroad track.\fMakes me want to go on an adventure too.",
  RedsHouse1FTVWrongSideText: "Oops, that's the wrong side.",
});

// text/RockTunnel1F.asm
Object.assign(G.TEXT, {
  RockTunnel1FHiker1BattleText: "This tunnel stretches on forever, kid!",
  RockTunnel1FHiker1EndBattleText: "Doh! You got me!",
  RockTunnel1FHiker1AfterBattleText: "Watch out for ONIX in here! It'll squeeze the life right out of you!",
  RockTunnel1FHiker2BattleText: "Hmm... I think I might be lost in here...",
  RockTunnel1FHiker2EndBattleText: "Whoa, ease up! What am I even doing? Which way's the exit?",
  RockTunnel1FHiker2AfterBattleText: "A POKéMON sleeping across ROUTE 12 made me detour through here.",
  RockTunnel1FHiker3BattleText: "An outsider like you had better show me some respect!",
  RockTunnel1FHiker3EndBattleText: "I give up!",
  RockTunnel1FHiker3AfterBattleText: "You've got what it takes to be a hiker!",
  RockTunnel1FSuperNerdBattleText: "POKéMON battle! Ready, go!",
  RockTunnel1FSuperNerdEndBattleText: "Game over for me!",
  RockTunnel1FSuperNerdAfterBattleText: "Oh well, guess I'll catch a ZUBAT on my way out!",
  RockTunnel1FCooltrainerF1BattleText: "Eek! Don't try any funny business in the dark!",
  RockTunnel1FCooltrainerF1EndBattleText: "It was just too dark to see!",
  RockTunnel1FCooltrainerF1AfterBattleText: "I spotted a MACHOP somewhere in this tunnel!",
  RockTunnel1FCooltrainerF2BattleText: "I came all this way just for POKéMON!",
  RockTunnel1FCooltrainerF2EndBattleText: "I'm all out of POKéMON!",
  RockTunnel1FCooltrainerF2AfterBattleText: "You looked so cute and harmless!",
  RockTunnel1FCooltrainerF3BattleText: "You've got POKéMON! Let's get started!",
  RockTunnel1FCooltrainerF3EndBattleText: "You don't hold back!",
  RockTunnel1FCooltrainerF3AfterBattleText: "Whew! That worked up a sweat!",
  RockTunnel1FSignText: "ROCK TUNNEL CERULEAN CITY - LAVENDER TOWN",
});

// text/RockTunnelB1F.asm
Object.assign(G.TEXT, {
  RockTunnelB1FCooltrainerF1BattleText: "Hikers mark their trail with twigs.",
  RockTunnelB1FCooltrainerF1EndBattleText: "Ohhh! I gave it my all!",
  RockTunnelB1FCooltrainerF1AfterBattleText: "I just want to go home now!",
  RockTunnelB1FHiker1BattleText: "Hahaha! Think you can handle my strength?",
  RockTunnelB1FHiker1EndBattleText: "Oops, you out-muscled me!",
  RockTunnelB1FHiker1AfterBattleText: "I train for raw power, thinking's not my thing!",
  RockTunnelB1FSuperNerd1BattleText: "You've got a POKéDEX? I want one of those too!",
  RockTunnelB1FSuperNerd1EndBattleText: "Shoot, now I'm just jealous!",
  RockTunnelB1FSuperNerd1AfterBattleText: "Once you finish your POKéDEX, will you let me have it?",
  RockTunnelB1FSuperNerd2BattleText: "Ever heard of costume players?",
  RockTunnelB1FSuperNerd2EndBattleText: "Well, that settles that.",
  RockTunnelB1FSuperNerd2AfterBattleText: "Costume players dress up like POKéMON just for fun.",
  RockTunnelB1FHiker2BattleText: "My POKéMON tactics will have you in tears!",
  RockTunnelB1FHiker2EndBattleText: "I give up! You're the better tactician here!",
  RockTunnelB1FHiker2AfterBattleText: "You'll often run into ROCK-type POKéMON up in the mountains.",
  RockTunnelB1FCooltrainerF2BattleText: "I don't usually come down here, but I'll still battle you.",
  RockTunnelB1FCooltrainerF2EndBattleText: "Oh! I've lost!",
  RockTunnelB1FCooltrainerF2AfterBattleText: "I prefer tiny POKéMON, the big ones scare me too much!",
  RockTunnelB1FHiker3BattleText: "Give me your best shot!",
  RockTunnelB1FHiker3EndBattleText: "There it went!",
});

// text/RockTunnelB1F_2.asm
Object.assign(G.TEXT, {
  RockTunnelB1FHiker3AfterBattleText: "I'll train my POKéMON up until they can beat yours, kid!",
  RockTunnelB1FSuperNerd3BattleText: "I like to draw POKéMON when I'm at home.",
  RockTunnelB1FSuperNerd3EndBattleText: "Whew, that wiped me out!",
  RockTunnelB1FSuperNerd3AfterBattleText: "I'm more of an artist than a fighter.\fReal pencils, real paper. No prompts!",
});

// text/RockTunnelPokecenter.asm
Object.assign(G.TEXT, {
  RockTunnelPokecenterGentlemanText: "Every POKéMON has a type, and that type is strong against some POKéMON and weak against others!",
  RockTunnelPokecenterFisherText: "I had a NUGGET just lying around, so I sold it off for ¥5000!",
});

// text/RocketHideoutB1F.asm
Object.assign(G.TEXT, {
  RocketHideoutB1FRocket5EndBattleText: "How...? Why...?",
  RocketHideoutB1FRocket1BattleText: "Who do you think you are? How'd you get in here?",
  RocketHideoutB1FRocket1EndBattleText: "Ow! You got me!",
  RocketHideoutB1FRocket1AfterBattleText: "You've got some nerve, disrespecting TEAM ROCKET!\fWe're THIS close to AGI, kid!",
  RocketHideoutB1FRocket2BattleText: "You dare break into our operation?",
  RocketHideoutB1FRocket2EndBattleText: "Scorched!",
  RocketHideoutB1FRocket2AfterBattleText: "You won't get away with this, brat!",
  RocketHideoutB1FRocket3BattleText: "We've got an intruder!",
  RocketHideoutB1FRocket3EndBattleText: "I can't win this!",
  RocketHideoutB1FRocket3AfterBattleText: "The SILPH SCOPE? Beats me where that thing is!",
  RocketHideoutB1FRocket4BattleText: "What are you doing here?",
  RocketHideoutB1FRocket4EndBattleText: "This is no good!",
  RocketHideoutB1FRocket4AfterBattleText: "Fine, I'll spill it! Ride the elevator down to see my BOSS!",
  RocketHideoutB1FRocket5BattleText: "Lost your way, you little rat?",
  RocketHideoutB1FRocket5AfterBattleText: "Uh-oh, losing that fight unlocked the door!",
});

// text/RocketHideoutB2F.asm
Object.assign(G.TEXT, {
  RocketHideoutB2FRocketBattleText: "Our BOSS said the SILPH SCOPE lets you see GHOSTs!",
  RocketHideoutB2FRocketEndBattleText: "I give up!",
  RocketHideoutB2FRocketAfterBattleText: "TEAM ROCKET's HQ goes down 4 basement floors. Think you can reach the BOSS?",
});

// text/RocketHideoutB3F.asm
Object.assign(G.TEXT, {
  RocketHideoutB3FRocket1BattleText: "Stay out of TEAM ROCKET's business!",
  RocketHideoutB3FRocket1EndBattleText: "Oof! I'm finished!",
  RocketHideoutB3FRocket1AfterBattleText: "The SILPH SCOPE? That's the device our BOSS swiped. It's around here somewhere.",
  RocketHideout3BattleText: "Word came down from upstairs that you were on your way!",
  RocketHideout3EndBattleText3: "What?! I lost?! No way!",
  RocketHide3AfterBattleText3: "Fine, go on ahead! But that elevator won't budge without the LIFT KEY!",
});

// text/RocketHideoutB4F.asm
Object.assign(G.TEXT, {
  RocketHideoutB4FGiovanniImpressedYouGotHereText: "Well now! I have to admit, I'm impressed you made it this far!",
  RocketHideoutB4FGiovanniWhatCannotBeText: "WHAT?! This can't be happening!",
  RocketHideoutB4FGiovanniHopeWeMeetAgainText: "I can tell you take great care raising your POKéMON.\fBut a kid like you could never grasp what I'm after.\fI'll back off, just this once!\fUntil we meet again...",
  RocketHideoutB4FRocket1BattleText: "I remember you! You wrecked our plans back at MT.MOON!",
  RocketHideoutB4FRocket1EndBattleText: "Scorched again!",
  RocketHideoutB4FRocket1AfterBattleText: "You got some kind of grudge against TEAM ROCKET?",
  RocketHideoutB4FRocket2BattleText: "Can't you appreciate the beauty in our wickedness?",
  RocketHideoutB4FRocket2EndBattleText: "Ayaya!",
  RocketHideoutB4FRocket2AfterBattleText: "BOSS, forgive me, I let you down!",
  RocketHideoutB4FRocket3BattleText: "Elevator's busted? Who's got the LIFT KEY?",
  RocketHideoutB4FRocket3EndBattleText: "No way!",
  RocketHideoutB4FRocket3AfterBattleText: "Oh no, I fumbled the LIFT KEY!",
});

// text/RocketHideoutElevator.asm
Object.assign(G.TEXT, {
  RocketHideoutElevatorAppearsToNeedKeyText: "Looks like it needs a key to run.",
});

// text/Route1.asm
Object.assign(G.TEXT, {
  Route1Youngster1MartSampleText: "Hey! I work at a POKéMON MART.\fWe're a handy shop, so stop by our branch in VIRIDIAN CITY!\fTell you what, here's a free sample! Think of it as our free tier!",
  Route1Youngster1GotPotionText: "{PLAYER} received {wStringBuffer}!",
  Route1Youngster1AlsoGotPokeballsText: "We sell POKé BALLs too, perfect for catching POKéMON!",
  Route1Youngster1NoRoomText: "Your bag's too full to carry anything else!",
  Route1Youngster2Text: "Notice the ledges along this path?\fIt looks a bit scary, but you can hop right off them.\fThat's a quicker way back to PALLET TOWN.",
  Route1SignText: "ROUTE 1 PALLET TOWN - VIRIDIAN CITY",
});

// text/Route10.asm
Object.assign(G.TEXT, {
  Route10SuperNerd1BattleText: "Whoa, are you a POKéMANIAC like me? Wanna check out my collection?",
  Route10SuperNerd1EndBattleText: "Humph. I'm not mad, honest!",
  Route10SuperNerd1AfterBattleText: "I've got even rarer POKéMON back home!",
  Route10Hiker1BattleText: "Ha-hahah-ah-ha!",
  Route10Hiker1EndBattleText: "Ah-hah-hah! Not laughing, I swear — ah-hay fever! Ah-ah-CHOO!",
  Route10Hiker1AfterBattleText: "Haha-ha-choo! Ha-choo! Snort! Sniffle!",
  Route10SuperNerd2BattleText: "Hey kid, wanna see my POKéMON?",
  Route10SuperNerd2EndBattleText: "Oh no! Not my POKéMON!",
  Route10SuperNerd2AfterBattleText: "I don't appreciate you beating me like that!",
  Route10CooltrainerF1BattleText: "I've challenged a POKéMON GYM more than once. Lost every time, though.",
  Route10CooltrainerF1EndBattleText: "Ohh! Lost again!",
  Route10CooltrainerF1AfterBattleText: "I spotted a few POKéMANIACs wandering around here.",
  Route10Hiker2BattleText: "Ahh, this mountain air tastes great!",
  Route10Hiker2EndBattleText: "That cleared my head right up!",
  Route10Hiker2AfterBattleText: "I'm stuffed full of mountain air!",
  Route10CooltrainerF2BattleText: "This tough climb has me feeling a little faint.",
  Route10CooltrainerF2EndBattleText: "I'm not up for this!",
  Route10CooltrainerF2AfterBattleText: "The POKéMON around here are so round! There's supposed to be a pink one covered in a floral pattern!",
  Route10RockTunnelSignText: "ROCK TUNNEL",
  Route10PowerPlantSignText: "POWER PLANT\fNOTICE: All output now reserved for the SILPH data center.",
});

// text/Route11.asm
Object.assign(G.TEXT, {
  Route11Gambler1BattleText: "Win, lose, or draw, let's do this!",
  Route11Gambler1EndBattleText: "Atcha! Luck wasn't with me!",
  Route11Gambler1AfterBattleText: "POKéMON battling is life! And living means taking risks!",
  Route11Gambler2BattleText: "I can never get enough of a good competition!",
  Route11Gambler2EndBattleText: "I had a shot there!",
  Route11Gambler2AfterBattleText: "There's no room for cowards in the world of POKéMON!",
  Route11Youngster1BattleText: "Let's battle, but play it fair!",
  Route11Youngster1EndBattleText: "Huh? That can't be right!",
  Route11Youngster1AfterBattleText: "I gave it everything I had, no regrets!",
  Route11SuperNerd1BattleText: "Watch your step! I've got cables laid out here!",
  Route11SuperNerd1EndBattleText: "Talk about electrifying!",
  Route11SuperNerd1AfterBattleText: "Tell everyone you know to conserve energy!\fThe data centers need every last watt!",
  Route11Youngster2BattleText: "I only just became a trainer! But I bet I can still win!",
  Route11Youngster2EndBattleText: "My POKéMON just couldn't pull it off!",
  Route11Youngster2AfterBattleText5: "What do you want from me? Just leave me be!",
  Route11Gambler3BattleText: "Fwahaha! I've never once lost a battle!",
  Route11Gambler3EndBattleText: "That's my first loss ever!",
  Route11Gambler3AfterBattleText: "Pure luck of the draw, that's all it was!",
  Route11Gambler4BattleText: "I've never actually won a battle before...",
  Route11Gambler4EndBattleText: "Yeah, I saw that coming...",
  Route11Gambler4AfterBattleText: "Just luck. That's all it ever is.",
  Route11Youngster3BattleText: "I'm the top trainer in my whole class!",
  Route11Youngster3EndBattleText: "Darn it! My POKéMON need more training!",
  Route11Youngster3AfterBattleText: "A big, heavy POKéMON wanders down from the mountains sometimes.\fCatch it and it'll fight tough for you.",
  Route11SuperNerd2BattleText: "Careful, these wires are still live!",
});

// text/Route11Gate1F.asm
Object.assign(G.TEXT, {
  Route11Gate1FGuardText: "Once you've caught a bunch of POKéMON, coming up with nicknames gets tough, doesn't it?\fThere's a man in LAVENDER TOWN who rates POKéMON nicknames.\fHe can help you rename them, too!",
});

// text/Route11Gate2F.asm
Object.assign(G.TEXT, {
  Route11Gate2FOaksAideItemfinderDescriptionText: "Some items lying on the ground are invisible to the eye.\fThe ITEMFINDER can sense when one's nearby.\fIt won't mark the exact spot, so you'll still need to search for it yourself!",
  Route11Gate2FLeftBinocularsSnorlaxText: "Peered through the binoculars.\fA huge POKéMON is asleep right on the road!",
  Route11Gate2FLeftBinocularsNoSnorlaxText: "Peered through the binoculars.\fWhat a gorgeous view!",
  Route11Gate2FRightBinocularsText: "Peered through the binoculars.\fThe ROCK TUNNEL is the only route between CERULEAN CITY and LAVENDER.",
});

// text/Route11_2.asm
Object.assign(G.TEXT, {
  Route11SuperNerd2EndBattleText: "Whoa! You're a real spark plug!",
  Route11SuperNerd2AfterBattleText: "Well, guess I'd better get back to work.",
  Route11Youngster4BattleText: "My POKéMON ought to be ready for battle by now!",
  Route11Youngster4EndBattleText: "Too strong, too soon for me!",
  Route11Youngster4AfterBattleText: "I'd better go track down some stronger POKéMON!",
  Route11DiglettsCaveSignText: "DIGLETT's CAVE",
});
