function parseList(str) {
  return str.split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n > 0);
}

// ---------- Stage 1 ----------
const yourHand   = document.getElementById('yourHand');
const oppHand    = document.getElementById('oppHand');
const fieldCards = document.getElementById('fieldCards');
const yourFusions = document.getElementById('yourFusions');
const yourXyz    = document.getElementById('yourXyz');
const stage1Result = document.getElementById('stage1Result');
const stage2Section = document.getElementById('stage2Section');
const unlockNote = document.getElementById('unlockNote');

function findCostCombos(fusionLevels, xyzRanks, total) {
  // Each rank in the list is assumed to have at least 2 copies available
  const uniqueRanks = [...new Set(xyzRanks)];
  const combos = [];
  fusionLevels.forEach(fl => {
    uniqueRanks.forEach(xr => {
      if (fl + xr * 2 === total) combos.push({ fl, xr });
    });
  });
  return combos;
}

function evalStage1() {
  const yh = parseInt(yourHand.value);
  const oh = parseInt(oppHand.value);
  const fc = parseInt(fieldCards.value);
  const fusions = parseList(yourFusions.value);
  const xyzs = parseList(yourXyz.value);

  const haveCounts = !isNaN(yh) && !isNaN(oh) && !isNaN(fc);

  if (!haveCounts) {
    setResult(stage1Result, 'idle', 'Fill in the card counts and your Extra Deck to find a legal combo.');
    unlock(false); return;
  }

  const total = yh + oh + fc;

  if (fusions.length === 0 || xyzs.length === 0) {
    setResult(stage1Result, 'idle', `Total cards in play: <strong>${total}</strong>. Now enter your Extra Deck monsters to find a legal combo.`);
    unlock(false); return;
  }

  const combos = findCostCombos(fusions, xyzs, total);

  if (combos.length > 0) {
    const list = combos.map(c => `Level\u00a0${c.fl} Fusion + two Rank\u00a0${c.xr} Xyz`).join('<br>');
    setResult(stage1Result, 'ok',
      `<strong>Legal combo found.</strong> Total cards in play: ${total}.<br>${list}<span class="math">Fusion Level + Rank + Rank = ${total}</span>`);
    unlock(true);
  } else {
    setResult(stage1Result, 'fail',
      `<strong>No legal combo.</strong> Total in play: ${total}. None of your Extra Deck monsters add up. Recheck your counts or try different monsters.<span class="math">Need: Fusion Level + Rank\u00d72 = ${total}</span>`);
    unlock(false);
  }
}

function unlock(passed) {
  if (passed) {
    stage2Section.classList.remove('stage-locked');
    unlockNote.style.display = 'none';
  } else {
    stage2Section.classList.add('stage-locked');
    unlockNote.style.display = 'flex';
  }
}

[yourHand, oppHand, fieldCards, yourFusions, yourXyz].forEach(el => el.addEventListener('input', evalStage1));

// ---------- Stage 2 ----------
const oppMonster   = document.getElementById('oppMonster');
const bankedFusions = document.getElementById('bankedFusions');
const bankedXyz    = document.getElementById('bankedXyz');
const stage2Result = document.getElementById('stage2Result');

function findEffectCombos(fusionLevels, xyzRanks, target) {
  const combos = [];
  fusionLevels.forEach(fl => {
    xyzRanks.forEach(xr => {
      if (fl + xr === target) combos.push({ fl, xr });
    });
  });
  return combos;
}

function evalStage2() {
  const target  = parseInt(oppMonster.value);
  const fusions = parseList(bankedFusions.value);
  const xyzs    = parseList(bankedXyz.value);

  if (isNaN(target) || target <= 0) {
    setResult(stage2Result, 'idle', 'Fill in the opponent\u2019s monster and your banished monsters to check the wipe condition.');
    return;
  }
  if (fusions.length === 0 || xyzs.length === 0) {
    setResult(stage2Result, 'idle', `Checking against Level/Rank\u00a0${target}. Enter your banished monsters.`);
    return;
  }

  const combos = findEffectCombos(fusions, xyzs, target);

  if (combos.length > 0) {
    const list = combos.map(c => `Level\u00a0${c.fl} Fusion + Rank\u00a0${c.xr} Xyz`).join('<br>');
    setResult(stage2Result, 'ok',
      `<strong>Condition met \u2014 banish their entire field.</strong><br>${list}<span class="math">Fusion Level + Xyz Rank = ${target}</span>`);
  } else {
    setResult(stage2Result, 'fail',
      `<strong>No match.</strong> None of your banished monsters combine to ${target}. No field wipe with this opponent monster.<span class="math">Need: Fusion Level + Xyz Rank = ${target}</span>`);
  }
}

[oppMonster, bankedFusions, bankedXyz].forEach(el => el.addEventListener('input', evalStage2));

// ---------- shared helper ----------
function setResult(el, state, html) {
  el.className = 'result' + (state === 'ok' ? ' ok' : state === 'fail' ? ' fail' : '');
  el.innerHTML = `<div class="dot"></div><div>${html}</div>`;
}

// init
unlock(false);
evalStage1();
evalStage2();
