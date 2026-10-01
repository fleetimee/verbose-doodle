// Native-resolution (1x) trainer battle portraits: 64x64 canvas, ~40x62 px front-facing figures in
// GBA trainer-sprite proportions, plus the player's back view for the start of battles.
// Built like src/art/chars.js: ASCII templates with region codes, recoloured per G.CAST definition
// (palette extends G.chars.buildPal). Layering: cape/backpack -> body (+pose overlay) -> face (+variant
// rows) -> hair/hat overlay -> hairband/mask/beard/glasses.
// Region codes (light comes from the top-left):
//   O outline   S/s/Z skin base/shade/light   M skin line + mouth   l lips   E eye   W white
//   H/h/L/d hair base/shade/light/deep   C/c/K/B/k hat base/shade/light-or-panel/brim/deep
//   T/t/U/V shirt base/shade/light/deep   A/a accent   D tie   P/p/Q pants   F/r/f shoes base/shade/light
//   X/x/Y/w coat   G/g/y bag   J/j/I beard   N/n glasses frame/lens   b/e gloves   v/z/m cape   u/i lining
//   o hairband   7/8/9 arm light/base/shade in pose overlays (skin or sleeve per body)   _ erase
//   back view only: 1 hat light, 2/3 ball red, 4/5 ball white
// Extra portrait-only fields (face, pose, shades, cape, gloves, shorts, ...) come from G.PORTRAIT_LOOKS
// (src/art/trainerpics.js) or def.portrait.
(function (G) {
  'use strict';
  const { Surface, hex, shade, mix } = G.gfx;
  const HEAD_X = 21, BODY_X = 10, BODY_Y = 15; // head/body template origins on the 64x64 canvas

  const FACE = [
    '......................',
    '......................',
    '.......OOOOOOOO.......',
    '.....OOSZZSSSSSOO.....',
    '....OSZZSSSSSSSSsO....',
    '...OSZSSSSSSSSSSSsO...',
    '..OSZSSSSSSSSSSSSssO..',
    '..OSSSSSSSSSSSSSSssO..',
    '..OSSdddSSSSSSdddSsO..',
    '.OSsSSEESSSSSSEESsssO.',
    '.OSsSSWESSSSSSWESsssO.',
    '..OsSSEESSSSSSEESssO..',
    '..OSSSSSSSSsSSSSSssO..',
    '...OSSSSSSMMSSSSssO...',
    '....OSSSSSSSSSSssO....',
    '......OOOOOOOOOO......',
  ];
  const HAIR = {
    short: { dx: 0, rows: [
      '......OOOOOOOOOO......',
      '....OOLLdHHHHHHHOO....',
      '...OLLLdHHHHHHHHHhO...',
      '..OLLLdHHHHHHHHHHhhO..',
      '..OLLdHHHHHHHHHHHHhO..',
      '.OHLHHHHLLHHHHHHHHhhO.',
      '.OHHHHHHHHHHHHHHHhhhO.',
      '.OhHHSSSHHHHHHHHHhhhO.',
      '..Oh......hHHh...hhO..',
      '...h..............h...',
    ] },
    spiky: { dx: -2, rows: [
      '.......O....O....O........',
      '......OLO..OLO..OHO.......',
      '..O..OLHO.OLHHO.OHHO.O....',
      '..OO.OLHHOLHHHHOHHhOOhO...',
      '...OLOLHHHHHHHHHHHhhHhO...',
      '.OOLLHHHHHHHHHHHHHHHhhhOO.',
      '..OHHHHHHhHHHHHhHHHHHhhO..',
      '.OHHHhSShHHHhSSSShHHhhhhO.',
      '..OHh.......h.......hhO...',
      '.....h..............h.....',
    ] },
    cap: { dx: -2, rows: [
      '........OOOOOOOOOO........',
      '......OOCKKKKKKKCcOO......',
      '.....OCCKKKKKKKKKCccO.....',
      '....OCCCKKKKKKKKKCCccO....',
      '...OcCCCKKKKKKKKKCCcccO...',
      '...OCCCCCCCCCCCCCCCcccO...',
      '..OCCCCCCCCCCCCCCCCccccO..',
      '.OHOBBBBBBBBBBBBBBBBBBOhO.',
      '.OHhOOOOOOOOOOOOOOOOOOhHO.',
      '..OH..................hO..',
    ] },
    hat: { dx: -3, rows: [
      '.........OOOOOOOOOO.........',
      '........OCCKKCCCCCcO........',
      '.......OCCKCCCCCCCccO.......',
      '..OOOOOkkkkkkkkkkkkkkOOOOO..',
      '.OCCCCCCCCCCCCCCCCCCCCCCccO.',
      'OCCCCCCCCCCCCCCCCCCCCCCCcccO',
      'OBBBBBBBBBBBBBBBBBBBBBBBBBBO',
      '.OOOOOOOOOOOOOOOOOOOOOOOOOO.',
      '.....OHsdddssssssdddshO.....',
    ] },
    beanie: { dx: -1, rows: [
      '........OOOOOOOO........',
      '......OOKKCCCCCcOO......',
      '.....OKKCCCCCCCCccO.....',
      '....OKCCCCCCCCCCCccO....',
      '...OKCCCCCCCCCCCCCccO...',
      '...OCCCCCCCCCCCCCCccO...',
      '..OccccccccccccccccccO..',
      '..OkkkkkkkkkkkkkkkkkkO..',
      '..OH................hO..',
    ] },
    bun: { dx: 0, rows: [
      '........OOOOOO........',
      '.......OLLHHHhO.......',
      '.....OOOHHHHhhOOO.....',
      '....OLLHHHHHHHHHhO....',
      '...OLHHHHHHHHHHHHhO...',
      '..OLHHHHHHHdHHHHHhhO..',
      '..OHHHHHHHSSHHHHHhhO..',
      '..OHHHHHSSSSSSHHHhhO..',
      '..OHH.............hO..',
      '.OHh..............hhO.',
      '.OHh..............hhO.',
      '..Oh..............hO..',
    ] },
    long: { dx: -2, rows: [
      '.........OOOOOOOO.........',
      '.......OOHHHHHHHHOO.......',
      '......OHHHHHHHHHHHhO......',
      '.....OHLLLLHHHHHHHHhO.....',
      '....OHLHHHHLLLHHHHHhhO....',
      '....OHHHHHHHHHHHHHHhhO....',
      '...OHHHHhHHHHHhHHHHHhhO...',
      '...OHHHhHHHHhHHHHhHHhhO...',
      '..OHHH..............hhhO..',
      '..OHHh..............hhhO..',
      '..OHLh..............hhhO..',
      '..OHLh..............hhhO..',
      '..OHLhO............OhhdO..',
      '..OHLhO............OhhdO..',
      '..OHLhhO..........OhhhdO..',
      '..OHLhhO..........OhhhdO..',
      '..OHHhhO..........OhhhdO..',
      '..OHHhhO..........OhhhhO..',
      '..OHHhhO..........OhhhhO..',
      '..OHHhhO..........OhhhhO..',
      '..OHhhhO..........OhhhdO..',
      '...OhhO............OhdO...',
      '....OO..............OO....',
    ] },
    pony: { dx: 0, rows: [
      '.......OOOOOOOO...........',
      '.....OOLLLHHHHHOO...OOO...',
      '....OLLHHHHHHHHHhO.OLHHO..',
      '...OLHHHHHHHHHHHHhOLHHHhO.',
      '..OLHHHHHHHHHHHHHhAAHHHhO.',
      '..OHHHHHHHHHHHHHHhAAHHHhhO',
      '..OHHhHHHHHhHHHHhhOOHHhhhO',
      '..OHhSShSSSShhSSShhOOHhhhO',
      '..Oh..............hO.OhhhO',
      '...h..............h...OhdO',
      '......................OhdO',
      '.......................OO.',
    ] },
    bald: { dx: 0, rows: [
      '......................',
      '......................',
      '......................',
      '......................',
      '......................',
      '..OO..............OO..',
      '..OHh............hhO..',
      '..OHh............hhO..',
      '..OHh............hhO..',
    ] },
  };

  const BODIES = {
    normal: [
      '..............OOOOOSSSSssOOOOO..............',
      '............OOTTTTASSSSssATTTtOO............',
      '..........OOUUTTTTAAssssAATTTTttOO..........',
      '.........OUUUTTTTTTAAssAATTTTTTtttO.........',
      '........OUUUUtTTTTTTAAAATTTTTTtTTttO........',
      '........OUUTTOUUUUTTTTTTTTTTttOTTttO........',
      '........OUTTTOUUTTTTTTTTTTTTttOTTttO........',
      '........OTTTtOUTTTTTTTTTTTTTttOTTttO........',
      '........OAAAaOUTTTTTTTTTTTTtVtOAAaaO........',
      '.......OSSssOOTTTTTTTTTTTTTtVtOSSSsO........',
      '......OSSssO.OTTTTTTTTTTTTTTttOSSSsO........',
      '.....OSSssO..OTTTTTTTTTTTTTTttOSSSsO........',
      '....OSSSssO..OTTTtTTTTTTTTTTttOSSSsO........',
      '.....OSSSsO..OTTTTtTTTTTTTTtVtOSSSsO........',
      '......OSSSsO.OTTTTTTTTTTTTTTttOSSSsO........',
      '.......OSSSsOOtTTTTTTTTTTTTttVOSSSsO........',
      '........OSSSSSOTTTTTTTTTTTTttVOSSSsO........',
      '.........OSSSSSOttttttttttttVVOSSSsO........',
      '..........OssssOOOOOOOOOOOOOOOOSSSsO........',
      '...........OOOQQPPPPPPPPPPPPppOSSSsO........',
      '.............OQQPPPPPPPPPPPPppOssssO........',
      '.............OQQPPPPPPPPPPPPppOOOOO.........',
      '.............OQQPPPPPpOpPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPppPO..OQPPPppPpO...........',
      '............OQPPpPPpO..OQPPpPPppO...........',
      '............OQPPPPPpO..OQPPPPppO............',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OpppppppO....OpppppppO...........',
      '..........OfffFFFFrO....OfFFFFFrO...........',
      '.........OfFFFFFFFrO....OFFFFFFFFrO.........',
      '........OfFFFFFFFFrO....OFFFFFFFFFrrO.......',
      '........OrrrrrrrrrrO....OrrrrrrrrrrrO.......',
      '.........OOOOOOOOOO......OOOOOOOOOOOO.......',
    ],
    coat: [
      '..............OOOOOSSSSssOOOOO..............',
      '............OOXXXXASSSSssAXXXxOO............',
      '..........OOYYXXXXOAssssAOXXXXxxOO..........',
      '.........OYYYXXXXXOTAssATOXXXXXxxxO.........',
      '........OYYYYxYXXXXOUTTtOXXXxxxXXxxO........',
      '........OYYXXOYYXXXOUTTtOXXXxxOXXxxO........',
      '........OYXXXOYXXXXOTTTtOXXXxxOXXxxO........',
      '........OXXXxOXXXXXOTTTtOXXXxxOXXxxO........',
      '........OXXXxOXXXXXOTTTtOXXxwxOXXxxO........',
      '.......OXXxxOOXXXXXOTTTtOXXXxxOXXxxO........',
      '......OXXxxO.OXXXXXOTTTtOXXXxxOXXxxO........',
      '.....OXXxxO..OXXXXXXOTtOXXXXxxOXXxxO........',
      '....OXXXxxO..OXXXXXXXOOXXXXXxxOXXxxO........',
      '.....OXXXxO..OXXXXXXXwXXXXXXxxOXXxxO........',
      '......OwwwwO.OXXXXXXXwXXXXXXxxOXXxxO........',
      '.......OSSSsOOxXXXXXXwXXXXXxxwOXXxxO........',
      '........OSSSSSOXXXXXXwXXXXXxxwOwwwwO........',
      '.........OSSSSSOXXXXXwXXXXXxxwOSSSsO........',
      '..........OssssOXXXXXwXXXXXxxwOSSSsO........',
      '...........OOOOXXXXXXwXXXXXxxwOSSSsO........',
      '............OYXXXXXXXwXXXXXxxwOssssO........',
      '............OYXXXXXXXwXXXXXxxwOOOOO.........',
      '...........OYXXXXXXXXwXXXXXXxxwO............',
      '...........OYXXXXXXXXwXXXXXXxxwO............',
      '...........OYXXXXXXXXwXXXXXXxxwO............',
      '...........OYXXXXXXXXwXXXXXXxxwO............',
      '...........OYXXXXXXXXwXXXXXXxxwO............',
      '...........OYXXXXXXXXOXXXXXXxxwO............',
      '...........OxxxxxxxxOOOxxxxxwwwO............',
      '...........OOOOOOOOOO..OOOOOOOOOO...........',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPppPO..OQPPPppPpO...........',
      '............OQPPpPPpO..OQPPpPPppO...........',
      '............OQPPPPPpO..OQPPPPppO............',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OpppppppO....OpppppppO...........',
      '..........OfffFFFFrO....OfFFFFFrO...........',
      '.........OfFFFFFFFrO....OFFFFFFFFrO.........',
      '........OfFFFFFFFFrO....OFFFFFFFFFrrO.......',
      '........OrrrrrrrrrrO....OrrrrrrrrrrrO.......',
      '.........OOOOOOOOOO......OOOOOOOOOOOO.......',
    ],
    dress: [
      '................OOOOSSSsOOOO................',
      '..............OOTTTASSSsATTtOO..............',
      '............OOUUTTAAssssAATTttOO............',
      '...........OUUUTTTTAAssAATTTTtttO...........',
      '..........OUUUUtTTTTAAAATTTTtTttO...........',
      '..........OUUTTOUUTTTTTTTTttOTTttO..........',
      '..........OUTTTOUTTTTTTTTTttOTTttO..........',
      '..........OAAAaOUTTTTTTTTTttOAAaaO..........',
      '..........OSSsOOTTTTTTTTTTttOOSSsO..........',
      '.........OSSsO.OTTTTTTTTTTttOSSsO...........',
      '........OSSsO..OTTTTTTTTTTttOSSsO...........',
      '.......OSSsO...OtTTTTTTTTtVtOSSsO...........',
      '......OSSSsO...OOTTTTTTTTttOOSSsO...........',
      '.......OSSsO...O.TTTTTTTTttO.OSSsO..........',
      '........OSSsO..O.TTTTTTTTttO.OSSsO..........',
      '.........OSSsO.O.tTTTTTTTtVO.OSSsO..........',
      '..........OSSSSOAAAAAAAAaaO..OSSsO..........',
      '...........OSSSSOUTTTTTTttO..OSSsO..........',
      '............OsssOUTTTTTTTttO.OSSsO..........',
      '.............OOOUUTTTTTTTTttOOSSSsO.........',
      '..............OUUTTTtTTTTTTttOSSSsO.........',
      '..............OUTTTTtTTTTtTTtOssssO.........',
      '.............OUUTTTtTTTTTtTTttOOOO..........',
      '.............OUTTTtTTTTTTtTTTttO............',
      '............OUUTTTtTTTTTTtTTTtttO...........',
      '............OUTTTtTTTTTTTtTTTTttO...........',
      '...........OUUTTTtTTTTTTTTtTTTtttO..........',
      '...........OUTTTtTTTTTTTTTtTTTTttO..........',
      '..........OUTTTTtTTTTTTTTTtTTTTttO..........',
      '..........OtttttttttttttttttttttVO..........',
      '..........OOOOOOOOOOOOOOOOOOOOOOOO..........',
      '...............OsssssOOsssssO...............',
      '...............OSSSsO..OSSSsO...............',
      '...............OSSsSO..OSsSsO...............',
      '...............OSSSsO..OSSSsO...............',
      '...............OSSSsO..OSSSsO...............',
      '..............OSSSsO....OSSSsO..............',
      '..............OSSSsO....OSSSsO..............',
      '..............OSSSsO....OSSSsO..............',
      '..............OSSSsO....OSSSsO..............',
      '..............OSSSsO....OSSSsO..............',
      '..............OSSSsO....OSSSsO..............',
      '.............OOSSsO.....OSSsOO..............',
      '...........OfffFFFO.....OFFFFFrO............',
      '..........OfFFFFFFO.....OFFFFFFrO...........',
      '..........OFFFFFFrrO....OFFFFFFrrO..........',
      '..........OOOOOOOOOO....OOOOOOOOOO..........',
      '............................................',
    ],
    swim: [
      '..............OOOOOSSSSssOOOOO..............',
      '............OOSSSSSSSSSssSSSsOOO............',
      '..........OOZZSSSSSSSSSSSSSSssOOOO..........',
      '.........OZZZSSSSSSSSSSSSSSSsssOssO.........',
      '........OZZZZsSSSSSSSSSSSSSSsSSssOsO........',
      '........OZZSSOZZSSSSSsSSSSSsssOSSssO........',
      '........OZSSSOZSSSSSSsSSSSSSssOSSssO........',
      '........OSSSsOSsssSSSsSSSsssssOSSssO........',
      '........OSSSsOSSSSssMsMssSSSssOSSssO........',
      '.......OSSssOOSSSSSSsMsSSSSSssOSSSsO........',
      '......OSSssO.OSSSSsSsMsSsSSSssOSSSsO........',
      '.....OSSssO..OSSSSSSsMsSSSSSssOSSSsO........',
      '....OSSSssO..OSSSSsSsMsSsSSSssOSSSsO........',
      '.....OSSSsO..OSSSSSSSMsSSSSSssOSSSsO........',
      '......OSSSsO.OsSSSSsSMsSsSSSssOSSSsO........',
      '.......OSSSsOOsSSSSSSsSSSSSsssOSSSsO........',
      '........OSSSSSOSSSSSSMSSSSsssMOSSSsO........',
      '.........OSSSSSOssssssssssssssOSSSsO........',
      '..........OssssOOOOOOOOOOOOOOOOSSSsO........',
      '...........OOOQQPPPPPPPPPPPPppOSSSsO........',
      '.............OQQPPPPPPPPPPPPppOssssO........',
      '.............OQQPPPPPPPPPPPPppOOOOO.........',
      '.............OQPPPPPpOOPPPPPppO.............',
      '.............OOOOOOOOOOOOOOOOOOOO...........',
      '.............OZZSSSSsOOSSSSSssO.............',
      '.............OZZSSSSsOOSSSSSssO.............',
      '.............OZZSSSSsOOSSSSSssO.............',
      '............OZSSSSSsO..OZSSSSssO............',
      '............OZSSSSSsO..OZSSSSssO............',
      '............OZSSSSSsO..OZSSSSssO............',
      '............OZSSSSSsO..OZSSSSssO............',
      '............OZSSSSsSO..OSSSSssSsO...........',
      '............OZSsSSssO..OSsSSsSssO...........',
      '............OZSSSSSsO..OZSSSSssO............',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OZSSSSSsO....OZSSSSssO...........',
      '...........OSSSSSSsO....OOSSSSSsO...........',
      '..........OfffFFFFrO....OfFFFFFrO...........',
      '.........OfFFFFFFFrO....OFFFFFFFFrO.........',
      '........OfFFFFFFFFrO....OFFFFFFFFFrrO.......',
      '........OrrrrrrrrrrO....OrrrrrrrrrrrO.......',
      '.........OOOOOOOOOO......OOOOOOOOOOOO.......',
    ],
    suit: [
      '..............OOOOOSSSSssOOOOO..............',
      '............OOTTTTASSSSssATTTtOO............',
      '..........OOUUTTTTOAssssAOTTTTttOO..........',
      '.........OUUUTTTTTOAADDAAOTTTTTtttO.........',
      '........OUUUUtUTTTTOADDaOTTTtttTTttO........',
      '........OUUTTOUUTTTOADDaOTTTttOTTttO........',
      '........OUTTTOUTTTTOADDaOTTTttOTTttO........',
      '........OTTTtOTTTTTOADDaOTTTttOTTttO........',
      '........OTTTtOTTTTTOADDaOTTtVtOTTttO........',
      '.......OTTttOOTTTTTOADDaOTTTttOTTttO........',
      '......OTTttO.OTTTTTOADDaOTTTttOTTttO........',
      '.....OTTttO..OTTTTTTOOaOTTTTttOTTttO........',
      '....OTTTttO..OTTTTTTTOOTTTTTttOTTttO........',
      '.....OTTTtO..OTTTTTTTVTTTTTTttOTTttO........',
      '......OVVVVO.OTTTTTTTVTTTTTTttOTTttO........',
      '.......OSSSsOOtTTTTTTVTTTTTttVOTTttO........',
      '........OSSSSSOTTTTTTVTTTTTttVOVVVVO........',
      '.........OSSSSSOTTTTTVTTTTTttVOSSSsO........',
      '..........OssssOOOOOOOOOOOOOOOOSSSsO........',
      '...........OOOQQPPPPPPPPPPPPppOSSSsO........',
      '.............OQQPPPPPPPPPPPPppOssssO........',
      '.............OQQPPPPPPPPPPPPppOOOOO.........',
      '.............OQQPPPPPpOpPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '.............OQQPPPPpOOPPPPPppO.............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPPPpO..OQPPPPppO............',
      '............OQPPPppPO..OQPPPppPpO...........',
      '............OQPPpPPpO..OQPPpPPppO...........',
      '............OQPPPPPpO..OQPPPPppO............',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OQPPPPPpO....OQPPPPppO...........',
      '...........OpppppppO....OpppppppO...........',
      '..........OfffFFFFrO....OfFFFFFrO...........',
      '.........OfFFFFFFFrO....OFFFFFFFFrO.........',
      '........OfFFFFFFFFrO....OFFFFFFFFFrrO.......',
      '........OrrrrrrrrrrO....OrrrrrrrrrrrO.......',
      '.........OOOOOOOOOO......OOOOOOOOOOOO.......',
    ],
    robe: [ // floor-length dress
      '................OOOOSSSsOOOO................',
      '..............OOTTTASSSsATTtOO..............',
      '............OOUUTTAAssssAATTttOO............',
      '...........OUUUTTTTAAssAATTTTtttO...........',
      '..........OUUUUtTTTTAAAATTTTtTttO...........',
      '..........OUUTTOUUTTTTTTTTttOTTttO..........',
      '..........OUTTTOUTTTTTTTTTttOTTttO..........',
      '..........OAAAaOUTTTTTTTTTttOAAaaO..........',
      '..........OSSsOOTTTTTTTTTTttOOSSsO..........',
      '.........OSSsO.OTTTTTTTTTTttOSSsO...........',
      '........OSSsO..OTTTTTTTTTTttOSSsO...........',
      '.......OSSsO...OtTTTTTTTTtVtOSSsO...........',
      '......OSSSsO...OOTTTTTTTTttOOSSsO...........',
      '.......OSSsO...O.TTTTTTTTttO.OSSsO..........',
      '........OSSsO..O.TTTTTTTTttO.OSSsO..........',
      '.........OSSsO.O.tTTTTTTTtVO.OSSsO..........',
      '..........OSSSSOAAAAAAAAaaO..OSSsO..........',
      '...........OSSSSOUTTTTTTttO..OSSsO..........',
      '............OsssOUTTTTTTTttO.OSSsO..........',
      '.............OOOUUTTTTTTTTttOOSSSsO.........',
      '..............OUUTTTtTTTTTTttOSSSsO.........',
      '..............OUTTTTtTTTTtTTtOssssO.........',
      '.............OUUTTTtTTTTTtTTttOOOO..........',
      '.............OUTTTtTTTTTTtTTTttO............',
      '............OUUTTTtTTTTTTtTTTtttO...........',
      '............OUTTTtTTTTTTTtTTTTttO...........',
      '...........OUUTTTtTTTTTTTTtTTTtttO..........',
      '...........OUTTTtTTTTTTTTTtTTTTttO..........',
      '..........OUTTTTtTTTTTTTTTtTTTTttO..........',
      '..........OUUTTTtTTTTTTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTTTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTtTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTtTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTtTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTtTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTtTTTTtTTTttVO..........',
      '..........OUUTTTtTTTTtTTTTtTTTttVO..........',
      '.........OUTTTTtTTTTTtTTTTTtTTTttVO.........',
      '.........OUTTTTtTTTTTtTTTTTtTTTttVO.........',
      '.........OUTTTTtTTTTTtTTTTTtTTTttVO.........',
      '.........OUTTTTtTTTTTtTTTTTtTTTttVO.........',
      '.........OUTTTtTTTTTTtTTTTTTtTTttVO.........',
      '.........OUTTTtTTTTTTtTTTTTTtTTttVO.........',
      '.........OUTTTtTTTTTTtTTTTTTtTTttVO.........',
      '.........OUTTTtTTTTTTtTTTTTTtTTttVO.........',
      '........OttttttOfFFOttttOFFrOttttttVO.......',
      '........OOOOOOOFFFFOOOOOOFFFrOOOOOOOO.......',
      '..............OOOOOO....OOOOOO..............',
    ],
  };

  // Pose overlays on the body ('.' keeps the body pixel, '_' erases it; 7/8/9 = arm light/base/shade)
  const POSES = {
    cross: { y: 9, rows: [
      '_______O7889OO................O7889O________',
      '________O7889O................O7889O________',
      '________O7889OOOOOOOOOOOOOOOOOO7889O________',
      '________OZSSSsO77777777777777777789O________',
      '________OSSSssO88888888888888888889O________',
      '________OsssssO99999999999999999999O________',
      '________O7889OOOOOOOOOOOOOOOOOOOOO__________',
      '________O7777777777777777777OZSSSsO_________',
      '________O8888888888888888888OSSSssO_________',
      '_________O999999999999999999OsssssO_________',
      '_________OOOOOOOOOOOOOOOOOOOOOOOOOO_________',
      '_____________OQPPPPPPPPPPPPPppO_____________',
      '..............................._____........',
    ] },
  };

  // Face variants: replacement rows for FACE
  const FACE_VARIANTS = {
    f: {
      8: '..OSSShhSSSSSShhSSsO..',
      9: '.OSsSEEESSSSSSEEEsssO.',
      13: '...OSSSSSSllSSSSssO...',
    },
    old: {
      8: '..OSdddSSSSSSSSdddsO..',
      12: '..OSSSsSSSSsSSSsSssO..',
      13: '...OSSSsSSMMSSsSssO...',
    },
    slit: {
      8: '..OSdddSSSSSSSSdddsO..',
      9: '.OSsSSSSSSSSSSSSSsssO.',
      10: '.OSsSEEESSSSSSEEEsssO.',
      11: '..OsSSSSSSSSSSSSSssO..',
    },
  };

  // Accessories. Face-relative templates use HEAD_X/0 as origin; body-relative ones BODY_X/BODY_Y.
  const ACC = {
    glasses: [ // face rows 8..12 (rims around the 2x3 eyes)
      '.....NNNN....NNNN.....',
      '...NNN..NNNNNN..NNN...',
      '.....N..N....N..N.....',
      '.....N..N....N..N.....',
      '.....NNNN....NNNN.....',
    ],
    shades: [
      '....NNNNN....NNNNN....',
      '...NNnnNNNNNNNnnNNN...',
      '....NNNNN....NNNNN....',
      '.....NNN......NNN.....',
    ],
    beard: [ // face rows 11..18
      '...J..............j...',
      '..OJJ...IJJJJj...jjO..',
      '..OJJJJJJMMJJJJJjjO...',
      '..OJJJJJJJJJJJJJJjjO..',
      '...OJJJJJJJJJJJJjjO...',
      '....OJJJJJJJJJJjjO....',
      '.....OOjJJJJJJjOO.....',
      '.......OOOOOOOO.......',
    ],
    mustache: [ // face rows 12..14
      '.......OIJJJJjO.......',
      '......OJJJjjJJjO......',
      '......OO......OO......',
    ],
    emblem: [ // body rows 6..11
      '###.',
      '#..#',
      '###.',
      '#.#.',
      '#..#',
    ],
    strapsFront: [ // body rows 1..16
      '.....OGO........OgO.....',
      '....OyGO........OGgO....',
      '....OGgO........OGgO....',
      '....OGgO........OGgO....',
      '....OGgO........OGgO....',
      '....OGgO........OGgO....',
      '....OGgO........OGgO....',
      '....OGgO........OGgO....',
      '....OAaO........OAaO....',
      '....OGgO........OGgO....',
      '....OGgO........OGgO....',
      '....OOOO........OOOO....',
    ],
    mask: [ // face rows 12..14 (ninja mask in hat colours)
      '..OKCCCCCCCCCCCCCccO..',
      '...OCCCCCCCCCCCCccO...',
      '....OcCCCCCCCCcccO....',
    ],
    hairband: [ // face row 5
      '..OooooooooooooooooO..',
    ],
    cape: [ // body rows -3..46, behind the body
      '.......OOOOOOO................OOOOOOO.......',
      '.......OmmmuuO................OuuzzzO.......',
      '........OmmuuO................OuuzzO........',
      '.........OmuuO................OuuzO.........',
      '.........OmuuO................OuuzO.........',
      '.........OmuuO................OuuzO.........',
      '.......OOuuuuuOOOOOOOOOOOOOOOOiiiiiO........',
      '.......OuuuuuuuuuuuuuuiiiiiiiiiiiiiO........',
      '.......OuuuuuuuuuuuuuuiiiiiiiiiiiiiO........',
      '.......OuuuuuuuuuuuuuuiiiiiiiiiiiiiO........',
      '.......OuuuuuuuuuuuuuuiiiiiiiiiiiiiO........',
      '.......OuuuuuuuuuuuuuuiiiiiiiiiiiiiO........',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OuuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OmuuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '......OmvuuuuuuuuuuuuuiiiiiiiiiiiiiiO.......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiiiiiiO......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiiiiiiO......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiizzzzO......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiizzzzO......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiizzzzO......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiizzzzO......',
      '.....OmvvvvuuuuuuuuuuuiiiiiiiiiiizzzzO......',
      '.....OmvvvuuuuuuuuuuuuiiiiiiiiiiiizzzO......',
      '.....OmvvvuuuuuuuuuuuuiiiiiiiiiiiizzzO......',
      '.....OmvvvuuuuuuuuuuuuiiiiiiiiiiiizzzO......',
      '....OmvvvvuuuuuuuuuuuuiiiiiiiiiiiizzzzO.....',
      '....OmvvvvuuuuuuuuuuuuiiiiiiiiiiiizzzzO.....',
      '....OmvvvvuuuuuuuuuuuuiiiiiiiiiiiizzzzO.....',
      '....OmvvvvuuuuuuuuuuuuiiiiiiiiiiiizzzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '....OmvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzO.....',
      '...OmvvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzzO....',
      '...OmvvvvuuuuuuuuuuuuuiiiiiiiiiiiiizzzzO....',
      '...OmvvvuuuuuuuuuuuuuvziiiiiiiiiiiiizzzO....',
      '...OmvvuuuuuuuuuuuuuuuiiiiiiiiiiiiiiizzO....',
      '...OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....',
      '............................................',
      '............................................',
    ],
    packSmall: [ // body rows 8..16, behind the body (peeks through the arm gap)
      '.OOOOOOOO',
      'OyGGGGGGO',
      'OyGGGGGgO',
      'OGGGGGGgO',
      'OGGGGGGgO',
      'OgGGGGggO',
      'OggggggO.',
      '.OOOOOO..',
    ],
    packBack: [ // body rows -3..3, behind the body
      '....OOOOOOOOOOOOOOOOOO....',
      '...OyyyGGGGGGGGGGGGGGgO...',
      '..OyGGGGGGGGGGGGGGGGGggO..',
      '..OGGGGGGGGGGGGGGGGGGggO..',
      '..OGGGGGGGGGGGGGGGGGGggO..',
      '..OgGGGGGGGGGGGGGGGGgggO..',
      '..OggggggggggggggggggggO..',
    ],
  };

  const BACK = [
    '..................................................OOOO..........',
    '........................OOOOOO..................OOW222OO........',
    '.....................OOO11cc1COOO..............OW2222233O.......',
    '...................OO1111CccCCCCcOO...........O2W22222233O......',
    '..................O1111CCCcCCCCCccO...........O2222OO2233O......',
    '.................O11CCCCCCcCCCCCCccO..........OOOOOWWOOOOO......',
    '................O11CCCCcCCcCCcCCCCccO.........OOOOOW5OOOOO......',
    '...............O11CCCCcCCCcCCCcCCCccO.........OWW44OO4455O......',
    '...............O1CCCCcCCCCcCCCCcCCccO.........OZO4444445sO......',
    '..............O11CCCCcCCCCcCCCCcCCcccO........OZSO44445OsO......',
    '..............O1CCCCcCCCCCcCCCCCcCCccO........OZSSOO55OOsO......',
    '..............O1CCCCcCCCCCcCCCCCcCCccO.........OZSZZZsO.........',
    '..............O1CCCcCCCCCCcCCCCCCcCccO.........OZSSSSSsO........',
    '..............O1CCCcCCCCCCcCCCCCCcCccO..........OZSSSsO.........',
    '..............O1CCCcCCCOOOOOOOOCCcCccO..........OZSSSsO.........',
    '..............O1CCcCCCOHHHHHHHhOCCcccO..........OZSSSsO.........',
    '..............O1CCcCCOHHHHHHHHhhOCcccO..........OZSSSsO.........',
    '..............OcCCcCCOkkkkkkkkkkOCcckO..........OZSSSSsO........',
    '...............OcccccOKCCCCCCCCcOcckOHO.........OZSSSSsO........',
    '..............OOOOOOOOOOOOOOOOOOOOOOOhSO........OZSSSSsO........',
    '.............OSSOHHHHHHHHHHHHHHHHHHHhOsSO.......OZSSSSsO........',
    '.............OZSOHHHHHHHHHHHHHHHHHHHhOssO......OOZSSSSsO........',
    '..............OsOHHHHLHHHHHHHHHLHHHhhOsO......OAAOZSSSsO........',
    '...............OOHHHHLHHHHHHHHHLHHHhhOO......OUAAaOZSSsO........',
    '................OHHHhHHHHhHHHHhHHHhhhO.....OOUUTAaaOSSsO........',
    '................OhHHhOHHhOhHHhOHHhhhO.....OUUTTTTAaOssO.........',
    '.................OhhOsOhOssOhOsOhhO......OUUTTTTTTtOOO..........',
    '..................OOsssOssssOsssOO......OUUTTTTTTttO............',
    '................OOOOAAAAOOOOOOAAaaOOOOOOUTTTTTTTttO.............',
    '............OOOOOyGOAAAAAAAAAAAaaaOOyGOUTTTTTTTttO..............',
    '........OOUOUUUUOyGOOaaaaaaaaaaaaOOOyGOTTTTTTttO................',
    '.......OUUUOUUTTOyGOTTTTTTTTTTTTTTTOyGOTTTTTttO.................',
    '.......OUUTOUTTTOyGOTTTTTTTTTTTTTTTOyGOTTTTtttO.................',
    '......OUUTTOUTTOOOOOOOOOOOOOOOOOOOOOOOOOTTttOO..................',
    '......OUTTTTOTOyyyyyyyyyyyyyyyyyyyyyyyGgOtOOO...................',
    '......OUTTTtOOyyGGGGGGGGGGGGGGGGGGGGGGGgOtttO...................',
    '.....OUTTTttOOyGGGGGGGGGGGGGGGGGGGGGGGGgOtttO...................',
    '.....OUTTTttOOyGGGGGGGGGGGGGGGGGGGGGGGGgOtttO...................',
    '.....OTTTttOOOyGGGGGGGGGGGGGGGGGGGGGGGGgOtttO...................',
    '.....OAAAaaOOOyGGGGGGGGGGGGGGGGGGGGGGGggOtttO...................',
    '.....OOOOOOOOOgGGGGGGGGGGOOOOGGGGGGGGGggOtttO...................',
    '.....OZSSsO.OOggggggggggOy44OgggggggggggOtttO...................',
    '.....OZSSsO.OOOOOOOOOOOOO455OOOOOOOOOOOOOtttO...................',
    '....OZSSSsO.OOyGGGGGGGGGGOOOOGGGGGGGGGggOtttO...................',
    '....OZSSSsO.OOyGGGGGGGGGGGGGGGGGGGGGGGggOtttO...................',
    '....OZSSSsO.OOyGGGGGGGGGGGGGGGGGGGGGGGggOtttO...................',
    '....OZSSSsO.OOyGGGOOOOOOOOOOOOOOOOOOGGggOtttO...................',
    '....OZSSSsO.OOyGGOyGGGGGGGGGGGGGGGGgOGggOtttO...................',
    '....OZSSsO..OOyGGOGGGGGGGGGGGGGGGGGgOGggOtttO...................',
    '....OZSSsO..OOyGGOGGGGGGGGGGGGGGGGGgOGggOtttO...................',
    '....OZSSsO..OOyGGOgggggggggggggggggggOGggtttO...................',
    '....OZSSsO..OOyGGGOOOOOOOOOOOOOOOOOOGGggOtttO...................',
    '...OZSSSsO..OOyGGGGGGGGGGGGGGGGGGGGGGGggOttO....................',
    '...OZSSSsO..OOgGGGGGGGGGGGGGGGGGGGGGGgggOttO....................',
    '...OZSSSSsOOOOggggggggggggggggggggggggggOttO....................',
    '...OZSSSSsOOQOOOOOOOOOOOOOOOOOOOOOOOOOOOOppO....................',
    '...OZSsSssOOQPPPPPPPPPPPPPPPPPPPPPPPPPPPPppO....................',
    '...OsSsSsO.OQPPPPPPPPPPPPPPPPPPPPPPPPPPPPppO....................',
    '....OsOsO..OPPPPPPPPPPPPPPPPPPPPPPPPPPPPPppO....................',
    '....O.O....OPPPPPPPPPPPPPPPPPPPPPPPPPPPPPppO....................',
    '..........OPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPppO...................',
    '..........OPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPppO...................',
    '..........OpppppppppppppppppppppppppppppppppO...................',
    '..........OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO...................',
  ];

  function buildPal(def) {
    const base = G.chars.buildPal(def);
    const c = (v, d) => hex(v || d);
    const skin = c(def.skin, '#f0b88a'), hair = c(def.hair, '#4a3428'), hat = c(def.hat, '#d03a3a'), shirt = c(def.shirt, '#4a78c8');
    const pants = c(def.pants, '#3a4058'), shoes = c(def.shoes, '#2e2e3e'), accent = c(def.accent, '#f8f8f8'), coat = c(def.coat, '#f4f4f8');
    const bag = c(def.backpack, '#c8a040'), beard = c(def.beard, '#8a8a8a'), glove = c(def.gloves, '#f0f0f8');
    const cape = c(def.cape, '#2a2a3a'), capeIn = c(def.capeIn, '#c83a3a');
    return Object.assign(base, {
      Z: shade(skin, 0.18), s: mix(skin, hex('#6a3048'), 0.28), M: mix(skin, hex('#4a1a2a'), 0.62), d: shade(hair, -0.55), k: shade(hat, -0.55), V: shade(shirt, -0.5), a: shade(accent, -0.25),
      Q: shade(pants, 0.22), r: shade(shoes, -0.3), Y: shade(coat, 0.3), w: shade(coat, -0.4),
      G: bag, g: shade(bag, -0.3), y: shade(bag, 0.3), J: beard, j: shade(beard, -0.3), I: shade(beard, 0.3),
      N: hex(def.frames || '#2a2838'), n: hex('#c8e0f0'), R: hex(def.emblem || '#e04040'),
      D: hex(def.tie || '#3a3a58'), l: mix(skin, hex('#c03a50'), 0.45), o: hex(def.hairband || '#d84040'),
      b: glove, e: shade(glove, -0.3), v: cape, z: shade(cape, -0.3), m: shade(cape, 0.25), u: capeIn, i: shade(capeIn, -0.3),
    });
  }
  function paint(s, rows, pal, ox, oy) {
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]; if (ch === '.' || ch === ' ') continue;
        if (ch === '_') { s.pset(ox + x, oy + y, 0); continue; }
        const c = pal[ch]; if (c !== undefined) s.pset(ox + x, oy + y, c);
      }
    }
  }

  // Portrait-only extras: G.PORTRAIT_LOOKS[castName] (set in trainerpics.js) and def.portrait override the cast def.
  function withLooks(def) {
    let name = null;
    if (G.CAST) for (const k in G.CAST) if (G.CAST[k] === def) { name = k; break; }
    const look = name && G.PORTRAIT_LOOKS ? G.PORTRAIT_LOOKS[name] : null;
    return Object.assign({}, def, look || {}, def.portrait || {});
  }
  function recode(rows, y0, y1, map) {
    return rows.map((r, y) => y < y0 || y > y1 ? r : r.replace(/./g, ch => map[ch] || ch));
  }
  const GLOVE = { S: 'b', Z: 'b', s: 'e', M: 'e' };
  const ARMS = { suit: 'UTt', coat: 'YXx' };

  const cache = {};
  G.trainerPicPx = function (def0) {
    const def = withLooks(def0 || {});
    const key = JSON.stringify(def);
    if (cache[key]) return cache[key];
    const pal = buildPal(def);
    const bodyName = BODIES[def.body] ? def.body : 'normal';
    const arm = ARMS[bodyName] || 'ZSs';
    pal['7'] = pal[arm[0]]; pal['8'] = pal[arm[1]]; pal['9'] = pal[arm[2]];
    let body = BODIES[bodyName];
    if (def.shorts && (bodyName === 'normal' || bodyName === 'suit')) body = recode(recode(body, 26, 26, { P: 'p', Q: 'p' }), 27, 42, { P: 'S', Q: 'Z', p: 's' });
    const cross = def.pose === 'cross' && bodyName !== 'dress' && bodyName !== 'robe';
    if (def.gloves && !cross) body = recode(body, 16, 21, GLOVE);
    const s = new Surface(64, 64);
    if (def.cape) paint(s, ACC.cape, pal, BODY_X, BODY_Y - 3);
    if (def.backpack) {
      if (def.bigPack) paint(s, ACC.packBack, pal, BODY_X + 9, BODY_Y - 3);
      else paint(s, ACC.packSmall, pal, BODY_X + 7, BODY_Y + 8);
    }
    paint(s, body, pal, BODY_X, BODY_Y);
    if (def.backpack && bodyName !== 'coat') paint(s, ACC.strapsFront, pal, BODY_X + 10, BODY_Y + 1);
    if (def.emblem) {
      const ec = hex(def.emblem), sh = shade(ec, -0.3);
      ACC.emblem.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') s.pset(BODY_X + 20 + x, BODY_Y + 5 + y, x === 0 || y === 0 ? ec : sh); });
    }
    if (cross) paint(s, def.gloves ? recode(POSES.cross.rows, 0, 99, GLOVE) : POSES.cross.rows, pal, BODY_X, BODY_Y + POSES.cross.y);
    const fv = FACE_VARIANTS[def.face] || {};
    paint(s, FACE.map((r, y) => fv[y] || r), pal, HEAD_X, 0);
    const hr = HAIR[def.head] || HAIR.short;
    paint(s, hr.rows, pal, HEAD_X + hr.dx, 0);
    if (def.hairband) paint(s, ACC.hairband, pal, HEAD_X, 5);
    if (def.mask) paint(s, ACC.mask, pal, HEAD_X, 12);
    if (def.beard) {
      if (def.beardStyle === 'mustache') paint(s, ACC.mustache, pal, HEAD_X, 12);
      else paint(s, ACC.beard, pal, HEAD_X, 11);
    }
    if (def.shades) paint(s, ACC.shades, pal, HEAD_X, 9);
    else if (def.glasses) paint(s, ACC.glasses, pal, HEAD_X, 8);
    return (cache[key] = s);
  };
  // Back of the player's head for hair styles other than the cap: drawn procedurally over the BACK body
  // (rows 0-27, x 10-43), lit from the top-left, with ears, nape and per-style extras.
  function backHead(s, def, pal) {
    for (let y = 0; y < 28; y++) for (let x = 10; x < 44; x++) s.pset(x, y, 0);
    const style = def.head || 'short', cx = 27, cy = 15, rx = 12, ry = 12;
    const codes = new Map(), put = (x, y, c) => codes.set(y * 64 + x, c);
    const inHead = (x, y) => { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; };
    const hairShade = (x, y) => {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, lit = -nx * 0.6 - ny * 0.7;
      if (y > cy - 2 && (x + (y >> 2)) % 5 === 0) return 'h';
      return lit > 0.5 ? 'L' : lit > -0.15 ? 'H' : 'h';
    };
    const bald = style === 'bald';
    // neck and ears first, hair over them
    for (let y = 22; y < 28; y++) for (let x = 22; x < 33; x++) put(x, y, x > 30 ? 's' : 'S');
    for (const ex of [14, 39]) for (let y = 18; y < 22; y++) for (let x = ex; x < ex + 2; x++) put(x, y, ex > 20 ? 's' : 'S');
    const nape = style === 'long' ? 44 : style === 'bald' ? 0 : 23;
    for (let y = 0; y < 28; y++) for (let x = 12; x < 43; x++) {
      if (!inHead(x, y)) continue;
      if (bald) { const lit = -((x + 0.5 - cx) / rx) * 0.6 - ((y + 0.5 - cy) / ry) * 0.7; put(x, y, lit > 0.55 ? 'Z' : lit > -0.2 ? 'S' : 's'); continue; }
      if (y <= nape) put(x, y, hairShade(x, y));
    }
    if (style === 'spiky') for (const [bx, h] of [[16, 4], [21, 6], [27, 7], [33, 6], [38, 4]])
      for (let k = 0; k < h; k++) for (let w = -Math.ceil((h - k) / 2); w <= Math.floor((h - k) / 2); w++) put(bx + w, cy - ry + 2 - k, k > h - 3 ? 'L' : 'H');
    if (style === 'bun') for (let y = 0; y < 8; y++) for (let x = 22; x < 33; x++) { const d = Math.hypot(x + 0.5 - 27.5, y + 0.5 - 3.5); if (d < 4.6) put(x, y, d < 2 && x < 28 ? 'L' : x > 29 ? 'h' : 'H'); }
    if (style === 'beanie') for (let y = 0; y < 15; y++) for (let x = 12; x < 43; x++) {
      if (!inHead(x, y) && !(y >= 12 && y <= 14 && x >= 14 && x <= 40)) continue;
      put(x, y, y >= 11 ? (x % 2 ? 'K' : 'C') : (x - cx) < -4 && y < 8 ? 'K' : x > cx + 5 ? 'c' : 'C');
    }
    if (style === 'beanie') for (let y = 0; y < 5; y++) for (let x = 24; x < 31; x++) if (Math.hypot(x + 0.5 - 27.5, y + 0.5 - 2) < 2.8) put(x, y, 'K');
    if (style === 'hat') {
      for (let y = 0; y < 14; y++) for (let x = 12; x < 43; x++) { const dx = (x + 0.5 - cx) / 9.5, dy = (y + 0.5 - 8) / 7; if (dx * dx + dy * dy <= 1 && y < 13) put(x, y, dx < -0.35 ? 'K' : dx > 0.45 ? 'c' : 'C'); }
      for (let y = 10; y < 17; y++) for (let x = 8; x < 46; x++) { const dx = (x + 0.5 - cx) / 18.5, dy = (y + 0.5 - 13) / 3.2; if (dx * dx + dy * dy <= 1) put(x, y, y < 13 ? 'C' : 'B'); }
    }
    if (style === 'long') for (let y = 16; y < 43; y++) {
      const half = 12.5 - Math.max(0, y - 30) * 0.2;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) if (y < 40 || (x + y) % 3) put(x, y, hairShade(x, Math.min(y, 26)));
    }
    if (style === 'pony') {
      for (let y = 18; y < 40; y++) { const w = Math.max(1, 4 - (y - 18) / 7); for (let x = Math.round(27.5 - w); x < Math.round(27.5 + w); x++) put(x, y, x < 27 ? 'H' : 'h'); }
      for (let x = 24; x < 31; x++) put(x, 21, 'A');
    }
    const ok = (x, y) => codes.has(y * 64 + x);
    const out = [];
    for (const k of codes.keys()) { const x = k % 64, y = (k / 64) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!ok(x + dx, y + dy) && y + dy < 28 + (style === 'long' || style === 'pony' ? 16 : 0) && y + dy >= 0) out.push([x + dx, y + dy]); }
    for (const [x, y] of out) if (!(y >= 28 && style !== 'long' && style !== 'pony')) s.pset(x, y, pal.O);
    for (const [k, c] of codes) s.pset(k % 64, (k / 64) | 0, pal[c]);
  }
  G.playerBackPicPx = function () {
    const def = G.CAST.red, key = '_back' + JSON.stringify(def);
    if (cache[key]) return cache[key];
    const pal = buildPal(def);
    Object.assign(pal, { 1: shade(pal.C, 0.25), 2: hex('#f04848'), 3: hex('#b82838'), 4: hex('#dcdce8'), 5: hex('#a8a8bc') });
    const s = new Surface(64, 64);
    paint(s, BACK, pal, 0, 0);
    if ((def.head || 'cap') !== 'cap') backHead(s, def, pal);
    return (cache[key] = s);
  };
})(window.G);
