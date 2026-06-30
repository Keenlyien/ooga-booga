// ---------- Stage 1 ----------
const fusionLevel = document.getElementById('fusionLevel');
const xyzRank = document.getElementById('xyzRank');
const totalCards = document.getElementById('totalCards');
const stage1Result = document.getElementById('stage1Result');
const scaleFill = document.getElementById('scaleFill');
const scaleMarker = document.getElementById('scaleMarker');
const scaleLeftLabel = document.getElementById('scaleLeftLabel');
const scaleRightLabel = document.getElementById('scaleRightLabel');

const stage2Panel = document.getElementById('stage2Panel');
const unlockNote = document.getElementById('unlockNote');
const suggestions = document.getElementById('suggestions');
const suggChips = document.getElementById('suggChips');

let stage1Passed = false;

function showSuggestions(tc){
  suggChips.innerHTML = '';
  if(isNaN(tc) || tc <= 0){
    suggestions.classList.remove('show');
    return;
  }
  const combos = [];
  // Fusion Level 1-12, Xyz Rank 1-13, sum = fl + xr*2
  for(let xr = 1; xr <= 13; xr++){
    const fl = tc - xr*2;
    if(fl >= 1 && fl <= 12){
      combos.push({fl, xr});
    }
  }
  if(combos.length === 0){
    suggestions.classList.remove('show');
    return;
  }
  combos.slice(0, 8).forEach(c => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sugg-chip';
    chip.textContent = `Lv${c.fl} + Rk${c.xr}×2`;
    chip.addEventListener('click', () => {
      fusionLevel.value = c.fl;
      xyzRank.value = c.xr;
      evalStage1();
    });
    suggChips.appendChild(chip);
  });
  suggestions.classList.add('show');
}

function evalStage1(){
  const fl = parseInt(fusionLevel.value);
  const xr = parseInt(xyzRank.value);
  const tc = parseInt(totalCards.value);

  showSuggestions(tc);

  const haveAll = !isNaN(fl) && !isNaN(xr) && !isNaN(tc) && fl>0 && xr>0 && tc>=0;

  if(!haveAll){
    stage1Result.className = 'result';
    stage1Result.innerHTML = '<div class="dot"></div><div>Fill in the three numbers above to check if the cost is legal.</div>';
    updateScale(null,null);
    setStage1Passed(false);
    return;
  }

  const sum = fl + xr + xr;
  updateScale(sum, tc);

  if(sum === tc){
    stage1Result.className = 'result ok';
    stage1Result.innerHTML = `<div class="dot"></div><div><strong>Legal cost.</strong> ${fl} + ${xr} + ${xr} = ${sum}, matching the ${tc} total cards in play. You may banish this trio and activate the effect.<span class="math">Level ${fl} (Fusion) + Rank ${xr} + Rank ${xr} (Xyz \u00d72) = ${sum} = ${tc} cards</span></div>`;
    setStage1Passed(true);
  } else {
    stage1Result.className = 'result fail';
    stage1Result.innerHTML = `<div class="dot"></div><div><strong>Not legal.</strong> ${fl} + ${xr} + ${xr} = ${sum}, which does not equal ${tc} total cards in play. Adjust your monsters or recount the cards.<span class="math">Level ${fl} + Rank ${xr} + Rank ${xr} = ${sum} \u2260 ${tc}</span></div>`;
    setStage1Passed(false);
  }
}

function updateScale(sum, target){
  if(sum===null || target===null){
    scaleFill.style.width = '0%';
    scaleMarker.style.left = '0%';
    scaleMarker.style.background = 'var(--gold)';
    scaleMarker.style.boxShadow = '0 0 12px rgba(240,196,25,0.7)';
    scaleLeftLabel.textContent = 'Your sum: \u2014';
    scaleRightLabel.textContent = 'Target: \u2014';
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

[fusionLevel, xyzRank, totalCards].forEach(el => el.addEventListener('input', evalStage1));

// ---------- Stage 2 ----------
const returnFusionLevel = document.getElementById('returnFusionLevel');
const returnXyzRank = document.getElementById('returnXyzRank');
const oppList = document.getElementById('oppList');
const addOppBtn = document.getElementById('addOppBtn');
const stage2Result = document.getElementById('stage2Result');

let oppCount = 0;

function addOppRow(value){
  oppCount++;
  const row = document.createElement('div');
  row.className = 'opp-item';
  row.innerHTML = `
    <span class="opp-tag">Monster ${oppCount}</span>
    <input type="number" class="opp-input" min="1" max="13" placeholder="Level or Rank">
    <button type="button" class="icon-btn remove-opp" title="Remove">\u2715</button>
  `;
  oppList.appendChild(row);
  const input = row.querySelector('.opp-input');
  if(value !== undefined) input.value = value;
  input.addEventListener('input', evalStage2);
  row.querySelector('.remove-opp').addEventListener('click', () => {
    row.remove();
    relabelOppRows();
    evalStage2();
  });
}

function relabelOppRows(){
  const rows = oppList.querySelectorAll('.opp-item');
  rows.forEach((row, i) => {
    row.querySelector('.opp-tag').textContent = 'Monster ' + (i+1);
  });
  oppCount = rows.length;
}

addOppBtn.addEventListener('click', () => addOppRow());

function evalStage2(){
  const rfl = parseInt(returnFusionLevel.value);
  const rxr = parseInt(returnXyzRank.value);
  const oppInputs = Array.from(document.querySelectorAll('.opp-input'));
  const oppValues = oppInputs.map(i => parseInt(i.value)).filter(v => !isNaN(v) && v>0);

  if(isNaN(rfl) || isNaN(rxr) || rfl<=0 || rxr<=0 || oppValues.length===0){
    stage2Result.className = 'result';
    stage2Result.innerHTML = '<div class="dot"></div><div>Fill in the returned monsters and your opponent\u2019s board to check the wipe condition.</div>';
    return;
  }

  const sum = rfl + rxr;
  const matchIndex = oppValues.findIndex(v => v === sum);

  if(matchIndex !== -1){
    stage2Result.className = 'result ok';
    stage2Result.innerHTML = `<div class="dot"></div><div><strong>Condition met \u2014 banish their entire field.</strong> Level ${rfl} + Rank ${rxr} = ${sum}, matching Monster ${matchIndex+1} (Level/Rank ${oppValues[matchIndex]}).<span class="math">${rfl} + ${rxr} = ${sum} = opponent's Monster ${matchIndex+1}</span></div>`;
  } else {
    stage2Result.className = 'result fail';
    stage2Result.innerHTML = `<div class="dot"></div><div><strong>No match.</strong> Level ${rfl} + Rank ${rxr} = ${sum}, which doesn't equal the Level/Rank of any monster your opponent controls (${oppValues.join(', ')}). No field wipe \u2014 try a different pair.<span class="math">${rfl} + ${rxr} = ${sum} \u2260 [${oppValues.join(', ')}]</span></div>`;
  }
}

[returnFusionLevel, returnXyzRank].forEach(el => el.addEventListener('input', evalStage2));

// init
addOppRow();
addOppRow();
setStage1Passed(false);
evalStage1();
evalStage2();
