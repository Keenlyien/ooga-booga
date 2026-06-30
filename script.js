// ---------- helpers ----------
function parseList(str){
  return str.split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n > 0);
}

// ---------- Stage 1 ----------
const yourHand = document.getElementById('yourHand');
const oppHand = document.getElementById('oppHand');
const fieldCards = document.getElementById('fieldCards');
const yourFusions = document.getElementById('yourFusions');
const yourXyz = document.getElementById('yourXyz');
const stage1Result = document.getElementById('stage1Result');
const scaleFill = document.getElementById('scaleFill');
const scaleMarker = document.getElementById('scaleMarker');
const scaleLeftLabel = document.getElementById('scaleLeftLabel');
const scaleRightLabel = document.getElementById('scaleRightLabel');

const stage2Panel = document.getElementById('stage2Panel');
const unlockNote = document.getElementById('unlockNote');

let stage1Passed = false;

function findCostCombos(fusionLevels, xyzRanks, total){
  // group xyz ranks by value, need at least 2 of a kind
  const rankCounts = {};
  xyzRanks.forEach(r => rankCounts[r] = (rankCounts[r]||0)+1);
  const validRanks = Object.keys(rankCounts).filter(r => rankCounts[r] >= 2).map(Number);

  const combos = [];
  fusionLevels.forEach(fl => {
    validRanks.forEach(xr => {
      if(fl + xr*2 === total){
        combos.push({fl, xr});
      }
    });
  });
  return combos;
}

function evalStage1(){
  const yh = parseInt(yourHand.value);
  const oh = parseInt(oppHand.value);
  const fc = parseInt(fieldCards.value);
  const fusions = parseList(yourFusions.value);
  const xyzs = parseList(yourXyz.value);

  const haveCounts = !isNaN(yh) && !isNaN(oh) && !isNaN(fc) && yh>=0 && oh>=0 && fc>=0;

  if(!haveCounts){
    stage1Result.className = 'result';
    stage1Result.innerHTML = '<div class="dot"></div><div>Fill in the card counts and your Extra Deck monsters to see which combos work.</div>';
    updateScale(null, null);
    setStage1Passed(false);
    return;
  }

  const total = yh + oh + fc;

  if(fusions.length === 0 || xyzs.length === 0){
    stage1Result.className = 'result';
    stage1Result.innerHTML = `<div class="dot"></div><div>Total cards in play: <strong>${total}</strong>. Now list your Fusion Monsters' Levels and Xyz Monsters' Ranks to find a legal combo.</div>`;
    updateScale(null, total);
    setStage1Passed(false);
    return;
  }

  const combos = findCostCombos(fusions, xyzs, total);
  updateScale(combos.length ? total : null, total);

  if(combos.length > 0){
    const list = combos.map(c => `Level ${c.fl} Fusion + two Rank ${c.xr} Xyz`).join('; ');
    stage1Result.className = 'result ok';
    stage1Result.innerHTML = `<div class="dot"></div><div><strong>Legal combo found.</strong> Total cards in play: ${total}. You can banish: ${list}.<span class="math">Fusion Level + Rank + Rank = ${total}</span></div>`;
    setStage1Passed(true);
  } else {
    stage1Result.className = 'result fail';
    stage1Result.innerHTML = `<div class="dot"></div><div><strong>No legal combo.</strong> Total cards in play: ${total}, but no Fusion Level + (matching pair of Xyz Ranks ×2) from your list adds up to it. Try different monsters or recheck your counts.<span class="math">Need Fusion + Rank×2 = ${total}</span></div>`;
    setStage1Passed(false);
  }
}

function updateScale(sum, target){
  if(sum===null || target===null){
    scaleFill.style.width = '0%';
    scaleMarker.style.left = '0%';
    scaleMarker.style.background = 'var(--gold)';
    scaleMarker.style.boxShadow = '0 0 12px rgba(240,196,25,0.7)';
    scaleLeftLabel.textContent = 'Your sum: —';
    scaleRightLabel.textContent = 'Target: ' + (target===null ? '—' : target);
    return;
  }
  const max = Math.max(sum, target, 1);
  const pct = Math.min(100, (sum/max)*100);
  scaleFill.style.width = pct + '%';
  scaleMarker.style.left = pct + '%';
  const match = sum === target;
  scaleMarker.style.background = match ? 'var(--good)' : 'var(--bad)';
  scaleMarker.style.boxShadow = match ? '0 0 12px rgba(95,227,157,0.8)' : '0 0 12px rgba(255,92,122,0.8)';
  scaleFill.style.background = match ? 'linear-gradient(90deg,var(--good),#9ef0c4)' : 'linear-gradient(90deg,var(--violet),var(--magenta))';
  scaleLeftLabel.textContent = 'Your sum: ' + sum;
  scaleRightLabel.textContent = 'Target: ' + target;
}

function setStage1Passed(passed){
  stage1Passed = passed;
  if(passed){
    stage2Panel.classList.remove('stage2-locked');
    unlockNote.style.display = 'none';
  } else {
    stage2Panel.classList.add('stage2-locked');
    unlockNote.style.display = 'flex';
  }
}

[yourHand, oppHand, fieldCards, yourFusions, yourXyz].forEach(el => el.addEventListener('input', evalStage1));

// ---------- Stage 2 ----------
const oppMonster = document.getElementById('oppMonster');
const bankedFusions = document.getElementById('bankedFusions');
const bankedXyz = document.getElementById('bankedXyz');
const stage2Result = document.getElementById('stage2Result');

function findEffectCombos(fusionLevels, xyzRanks, target){
  const combos = [];
  fusionLevels.forEach(fl => {
    xyzRanks.forEach(xr => {
      if(fl + xr === target){
        combos.push({fl, xr});
      }
    });
  });
  return combos;
}

function evalStage2(){
  const target = parseInt(oppMonster.value);
  const fusions = parseList(bankedFusions.value);
  const xyzs = parseList(bankedXyz.value);

  if(isNaN(target) || target <= 0){
    stage2Result.className = 'result';
    stage2Result.innerHTML = '<div class="dot"></div><div>Fill in the opponent\u2019s monster and your banished monsters to see which combo wipes the field.</div>';
    return;
  }

  if(fusions.length === 0 || xyzs.length === 0){
    stage2Result.className = 'result';
    stage2Result.innerHTML = `<div class="dot"></div><div>List your banished Fusion Monsters' Levels and Xyz Monsters' Ranks to check against Level/Rank ${target}.</div>`;
    return;
  }

  const combos = findEffectCombos(fusions, xyzs, target);

  if(combos.length > 0){
    const list = combos.map(c => `Level ${c.fl} Fusion + Rank ${c.xr} Xyz`).join('; ');
    stage2Result.className = 'result ok';
    stage2Result.innerHTML = `<div class="dot"></div><div><strong>Condition met \u2014 banish their entire field.</strong> You can return: ${list}.<span class="math">Fusion Level + Xyz Rank = ${target}</span></div>`;
  } else {
    stage2Result.className = 'result fail';
    stage2Result.innerHTML = `<div class="dot"></div><div><strong>No match.</strong> None of your banished monsters' Levels/Ranks combine to ${target}. No field wipe with this opponent monster.<span class="math">Need Fusion Level + Xyz Rank = ${target}</span></div>`;
  }
}

[oppMonster, bankedFusions, bankedXyz].forEach(el => el.addEventListener('input', evalStage2));

// init
setStage1Passed(false);
evalStage1();
evalStage2();
