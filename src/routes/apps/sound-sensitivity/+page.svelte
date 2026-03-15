<script lang="ts">
  import { t } from '$lib/i18n';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { speak } from '$lib/tts';
  import { fade } from 'svelte/transition';

  let currentView = $state<'menu' | 'diary' | 'strategies' | 'exposure'>('menu');
  
  // Sound diary entries
  let diaryEntries = $state<{sound: string, level: number, date: string}[]>([]);
  let newSound = $state('');
  let newLevel = $state(3);
  
  // Exposure training
  let exposureLevel = $state(1);
  let exposurePlaying = $state(false);
  
  const STRATEGIES = [
    { emoji: '🎧', title: 'Hörselskydd', desc: 'Använd hörselskydd eller brusreducerande hörlurar i miljöer med mycket ljud.' },
    { emoji: '🫁', title: 'Djupandning', desc: 'Andas in i 4 sekunder, håll i 4, andas ut i 6. Upprepas tills du känner dig lugnare.' },
    { emoji: '🚪', title: 'Avbryta', desc: 'Det är helt okej att lämna ett rum om ljudet blir för mycket. Planera en flyktväg.' },
    { emoji: '⏰', title: 'Förberedelse', desc: 'Veta i förväg att det kommer vara högt ljud hjälper. Förbered dig mentalt.' },
    { emoji: '🎵', title: 'Ersättningsljud', desc: 'Lyssna på musik du gillar eller naturljud för att maskera obehagliga ljud.' },
    { emoji: '🤲', title: 'Tryckstimulering', desc: 'Krama dig själv, bär tyngdväst eller håll i något mjukt för att lugna nervsystemet.' },
  ];

  const EXPOSURE_SOUNDS = [
    { name: 'Regn', emoji: '🌧️', level: 1 },
    { name: 'Fågelkvitter', emoji: '🐦', level: 1 },
    { name: 'Trafik', emoji: '🚗', level: 2 },
    { name: 'Diskmaskin', emoji: '🍽️', level: 2 },
    { name: 'Dammsugare', emoji: '🧹', level: 3 },
    { name: 'Hund som skäller', emoji: '🐕', level: 3 },
    { name: 'Brandlarm', emoji: '🔔', level: 4 },
    { name: 'Fyrverkerier', emoji: '🎆', level: 4 },
  ];

  function addDiaryEntry() {
    if (!newSound.trim()) return;
    diaryEntries = [...diaryEntries, { sound: newSound.trim(), level: newLevel, date: new Date().toLocaleDateString('sv-SE') }];
    newSound = '';
    newLevel = 3;
  }

  function goBack() {
    if (currentView === 'menu') goto(base + '/');
    else currentView = 'menu';
  }
</script>

<div class="app">
  <header class="top-bar">
    <button class="back-btn" onclick={goBack}>← Tillbaka</button>
    <h1>🔊 Ljudkänslighet</h1>
  </header>

  {#if currentView === 'menu'}
    <div class="menu" transition:fade>
      <p class="intro">Här kan du logga ljud som stör, lära dig strategier och öva på att hantera ljud.</p>
      <div class="cards">
        <button class="card" onclick={() => currentView = 'diary'}>
          <span class="card-emoji">📓</span>
          <span class="card-title">Ljuddagbok</span>
          <span class="card-desc">Logga vilka ljud som stör dig</span>
        </button>
        <button class="card" onclick={() => currentView = 'strategies'}>
          <span class="card-emoji">💡</span>
          <span class="card-title">Strategier</span>
          <span class="card-desc">Tips för att hantera ljud</span>
        </button>
        <button class="card" onclick={() => currentView = 'exposure'}>
          <span class="card-emoji">🎚️</span>
          <span class="card-title">Exponering</span>
          <span class="card-desc">Öva gradvis med ljud</span>
        </button>
      </div>
    </div>
  {:else if currentView === 'diary'}
    <div class="diary" transition:fade>
      <h2>📓 Ljuddagbok</h2>
      <div class="diary-form">
        <input type="text" bind:value={newSound} placeholder="Vilket ljud störde dig?" class="input" />
        <div class="level-picker">
          <span>Obehag:</span>
          {#each [1,2,3,4,5] as lvl}
            <button class="level-btn" class:active={newLevel === lvl} onclick={() => newLevel = lvl}>
              {lvl === 1 ? '😊' : lvl === 2 ? '😐' : lvl === 3 ? '😟' : lvl === 4 ? '😣' : '😱'}
            </button>
          {/each}
        </div>
        <button class="primary-btn" onclick={addDiaryEntry} disabled={!newSound.trim()}>Lägg till</button>
      </div>
      {#if diaryEntries.length > 0}
        <div class="entries">
          {#each diaryEntries.toReversed() as entry}
            <div class="entry">
              <span class="entry-sound">{entry.sound}</span>
              <span class="entry-level">{'😊😐😟😣😱'[entry.level - 1]}</span>
              <span class="entry-date">{entry.date}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty">Inga ljud loggade än. Börja med att skriva in ett ljud ovan.</p>
      {/if}
    </div>
  {:else if currentView === 'strategies'}
    <div class="strategies" transition:fade>
      <h2>💡 Strategier</h2>
      <div class="strategy-list">
        {#each STRATEGIES as s}
          <button class="strategy-card" onclick={() => speak(s.title + '. ' + s.desc)}>
            <span class="strategy-emoji">{s.emoji}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.desc}</p>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {:else if currentView === 'exposure'}
    <div class="exposure" transition:fade>
      <h2>🎚️ Exponeringsträning</h2>
      <p>Börja med lugna ljud och öka gradvis. Tryck på ett ljud för att lyssna.</p>
      <div class="sound-grid">
        {#each EXPOSURE_SOUNDS as sound}
          <button class="sound-card" class:locked={sound.level > exposureLevel + 1}
                  onclick={() => speak(sound.name)}>
            <span class="sound-emoji">{sound.emoji}</span>
            <span class="sound-name">{sound.name}</span>
            <span class="sound-level">Nivå {sound.level}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .app { min-height: 100dvh; display: flex; flex-direction: column; background: var(--bg, #f8f9fa); }
  .top-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
  .top-bar h1 { font-size: 1.3rem; margin: 0; flex: 1; }
  .back-btn { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 8px 12px; border-radius: 8px; min-height: 44px; }
  .intro { text-align: center; color: #666; padding: 0 20px; }
  .cards { display: flex; flex-direction: column; gap: 12px; padding: 20px; max-width: 500px; margin: 0 auto; width: 100%; }
  .card { display: flex; align-items: center; gap: 16px; padding: 20px; background: white; border: 2px solid #e0e0e0; border-radius: 16px; cursor: pointer; text-align: left; min-height: 80px; }
  .card:hover { border-color: #4CAF50; background: #f8fff8; }
  .card-emoji { font-size: 2rem; }
  .card-title { font-weight: 700; font-size: 1.1rem; display: block; }
  .card-desc { font-size: 0.9rem; color: #666; }
  .diary, .strategies, .exposure { padding: 20px; max-width: 500px; margin: 0 auto; width: 100%; }
  h2 { margin: 0 0 16px; }
  .diary-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .input { padding: 12px; border: 2px solid #ddd; border-radius: 10px; font-size: 1rem; min-height: 44px; }
  .level-picker { display: flex; align-items: center; gap: 8px; }
  .level-btn { font-size: 1.5rem; background: none; border: 2px solid transparent; border-radius: 50%; width: 48px; height: 48px; cursor: pointer; }
  .level-btn.active { border-color: #FF9800; background: #FFF3E0; }
  .primary-btn { background: #4CAF50; color: white; border: none; padding: 14px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; min-height: 48px; }
  .primary-btn:disabled { opacity: 0.5; }
  .entries { display: flex; flex-direction: column; gap: 8px; }
  .entry { display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 10px; }
  .entry-sound { flex: 1; font-weight: 600; }
  .entry-level { font-size: 1.3rem; }
  .entry-date { font-size: 0.8rem; color: #999; }
  .empty { text-align: center; color: #999; padding: 20px; }
  .strategy-list { display: flex; flex-direction: column; gap: 12px; }
  .strategy-card { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: white; border: 2px solid #e0e0e0; border-radius: 14px; text-align: left; cursor: pointer; }
  .strategy-card:hover { border-color: #2196F3; }
  .strategy-emoji { font-size: 2rem; }
  .strategy-card p { margin: 4px 0 0; font-size: 0.9rem; color: #555; }
  .sound-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .sound-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 20px; background: white; border: 2px solid #e0e0e0; border-radius: 14px; cursor: pointer; min-height: 100px; }
  .sound-card:hover { border-color: #9C27B0; }
  .sound-card.locked { opacity: 0.4; pointer-events: none; }
  .sound-emoji { font-size: 2.5rem; }
  .sound-name { font-weight: 600; }
  .sound-level { font-size: 0.8rem; color: #999; }
</style>
