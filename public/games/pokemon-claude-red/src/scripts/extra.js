// Extra systems not tied to a region agent: the Route 5 Day Care.
(function (G) {
  'use strict';
  const S = G.S;
  G.stepHooks = G.stepHooks || [];
  // Gen I Day Care: the stored Pokémon gains 1 EXP per step
  G.stepHooks.push(st => { if (st.daycare) st.daycare.steps++; });
  G.defMapScript('Daycare', {
    talk: {
      DAYCARE_GENTLEMAN: function* () {
        const st = G.state;
        if (st.daycare) {
          const m = G.Mon.from(st.daycare.mon);
          const startLv = m.level;
          m.exp += st.daycare.steps;
          while (m.level < 100 && m.exp >= m.expToNext()) { m.level++; }
          m.recalc(true); m.hp = m.maxhp;
          G.textVars.wNameBuffer = m.name; G.textVars.wDayCareMonName = m.name;
          const grown = m.level - startLv;
          if (st.daycare.steps === 0) { yield* S.say('DaycareGentlemanMonNeedsMoreTimeText'); return; }
          if (grown > 0) { G.textVars.wDayCareNumLevelsGrown = grown; yield* S.say('DaycareGentlemanMonHasGrownText'); }
          const cost = 100 + 100 * grown;
          G.textVars.wDayCareTotalCost = cost;
          if (!(yield* S.ask(G.fmt(S.t('DaycareGentlemanOweMoneyText')) + '\fWant it back?'))) { yield* S.say('DaycareGentlemanAllRightThenText'); yield* S.say('DaycareGentlemanComeAgainText'); return; }
          if (st.party.length >= 6) { yield* S.say('DaycareGentlemanNoRoomForMonText'); return; }
          if (st.money < cost) { yield* S.say('DaycareGentlemanNotEnoughMoneyText'); return; }
          st.money -= cost;
          // learn level-up moves it would have learned
          for (let lv = startLv + 1; lv <= m.level; lv++) for (const mv of m.movesAtLevel(lv)) if (!m.moves.find(x => x.id === mv)) { if (m.moves.length < 4) m.addMove(mv); else { m.moves.shift(); m.addMove(mv); } }
          st.party.push(m); st.daycare = null;
          yield* S.say('DaycareGentlemanHeresYourMonText');
          G.sfx && G.sfx('get_mon');
          yield* S.say('DaycareGentlemanGotMonBackText');
          return;
        }
        if (!(yield* S.ask('DaycareGentlemanIntroText'))) { yield* S.say('DaycareGentlemanAllRightThenText'); yield* S.say('DaycareGentlemanComeAgainText'); return; }
        if (G.state.party.length <= 1) { yield* S.say('DaycareGentlemanOnlyHaveOneMonText'); return; }
        yield* S.say('DaycareGentlemanWhichMonText');
        const i = yield* G.partyScreen({ msg: 'Leave which POKéMON?', pick: function* () { return true; } });
        if (i < 0) { yield* S.say('DaycareGentlemanAllRightThenText'); yield* S.say('DaycareGentlemanComeAgainText'); return; }
        const m = G.state.party[i];
        if (m.moves.some(x => G.DATA.hmMoves.includes(x.id))) { yield* S.say('DaycareGentlemanCantAcceptMonWithHMText'); return; }
        G.state.party.splice(i, 1);
        G.state.daycare = { mon: m.toJSON(), steps: 0 };
        G.textVars.wNameBuffer = m.name;
        yield* S.say('DaycareGentlemanWillLookAfterMonText');
        yield* S.say('DaycareGentlemanComeSeeMeInAWhileText');
      },
    },
  });
})(window.G);
