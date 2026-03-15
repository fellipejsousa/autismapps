<script>
  import { speak } from '$lib/tts';

  let { i18n = {}, onback } = $props();

  let currentMode = $state('overview'); // 'overview', 'comparison', 'dress-up'
  let isDaytime = $state(true);
  let dressUpProgress = $state([]);
  let score = $state(0);

  const reflectorItems = [
    {
      id: 'vest',
      name: 'Reflexväst',
      position: { x: 45, y: 35 },
      placed: false,
      emoji: '🦺'
    },
    {
      id: 'hat',
      name: 'Reflexmössa',
      position: { x: 48, y: 15 },
      placed: false,
      emoji: '🧢'
    },
    {
      id: 'bag',
      name: 'Reflexer på väska',
      position: { x: 35, y: 45 },
      placed: false,
      emoji: '🎒'
    },
    {
      id: 'shoes',
      name: 'Reflexer på skor',
      position: { x: 48, y: 80 },
      placed: false,
      emoji: '👟'
    },
    {
      id: 'band',
      name: 'Reflexband',
      position: { x: 55, y: 45 },
      placed: false,
      emoji: '📿'
    }
  ];

  let availableReflectors = $state([...reflectorItems]);

  function getI18nValue(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], i18n) || key;
  }

  function toggleDayNight() {
    isDaytime = !isDaytime;
    const timeText = isDaytime ? getI18nValue('reflectors.day') : getI18nValue('reflectors.night');
    speak(timeText);
  }

  function startComparison() {
    currentMode = 'comparison';
    isDaytime = true;
    speak('Jämför hur synlig en person är på dagen och på natten');
  }

  function startDressUp() {
    currentMode = 'dress-up';
    isDaytime = false;
    score = 0;
    // Reset all reflectors
    availableReflectors = reflectorItems.map(item => ({ ...item, placed: false }));
    dressUpProgress = [];
    speak('Klä personen med reflexer så att den syns bättre i mörkret');
  }

  function handleReflectorDrop(event, reflector) {
    event.preventDefault();
    if (!reflector.placed) {
      reflector.placed = true;
      score++;
      dressUpProgress = [...dressUpProgress, reflector];
      
      speak(`Bra! Du satte på ${reflector.name}`);
      
      if (dressUpProgress.length === reflectorItems.length) {
        setTimeout(() => {
          speak('Perfekt! Nu syns personen mycket bättre i mörkret. Reflexer räddar liv!');
        }, 1000);
      }
    }
  }

  function handleDragStart(event, reflector) {
    event.dataTransfer.setData('text/plain', reflector.id);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const reflectorId = event.dataTransfer.getData('text/plain');
    const reflector = availableReflectors.find(r => r.id === reflectorId);
    if (reflector) {
      handleReflectorDrop(event, reflector);
    }
  }

  function resetDressUp() {
    availableReflectors = reflectorItems.map(item => ({ ...item, placed: false }));
    dressUpProgress = [];
    score = 0;
  }

  function goBack() {
    currentMode = 'overview';
  }

  // Tips about reflectors
  const reflectorTips = [
    'Reflexer ökar synligheten med upp till 200 meter',
    'Bär alltid reflexer när du går ute i mörkret',
    'Sätt reflexer på både framsida och baksida',
    'Reflexer fungerar bäst på rörliga delar som armar och ben',
    'Tvätta reflexer försiktigt så de inte tappar sin effekt'
  ];
</script>

<div class="reflectors-container">
  <header class="activity-header">
    <button class="back-button" onclick={onback}>
      ← {getI18nValue('common.back')}
    </button>
    <h1>✨ {getI18nValue('reflectors.title')}</h1>
  </header>

  <div class="reflectors-content">
    {#if currentMode === 'overview'}
      <!-- Overview and menu -->
      <div class="overview-section">
        <div class="intro">
          <h2>Varför är reflexer viktiga?</h2>
          <p>
            Reflexer hjälper dig att synas i mörkret. När billjus träffar reflexer 
            lyser de upp och gör dig synlig för förare på långt håll.
          </p>
        </div>
        
        <div class="activity-buttons">
          <button class="activity-btn" onclick={startComparison}>
            <div class="btn-icon">🌞🌙</div>
            <h3>Dag vs Natt</h3>
            <p>Se skillnaden i synlighet</p>
          </button>
          
          <button class="activity-btn" onclick={startDressUp}>
            <div class="btn-icon">👕✨</div>
            <h3>Klä med reflexer</h3>
            <p>Dra reflexer till rätt plats</p>
          </button>
        </div>

        <div class="tips-section">
          <h3>Bra att veta om reflexer:</h3>
          <ul class="tips-list">
            {#each reflectorTips as tip}
              <li>{tip}</li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}

    {#if currentMode === 'comparison'}
      <!-- Day/Night comparison -->
      <div class="comparison-section">
        <div class="comparison-header">
          <h2>Synlighet på dagen och natten</h2>
          <button class="toggle-button" onclick={toggleDayNight}>
            {isDaytime ? '🌙 Växla till natt' : '🌞 Växla till dag'}
          </button>
        </div>
        
        <div class="visibility-demo" class:night={!isDaytime} class:day={isDaytime}>
          <div class="environment">
            <div class="road">
              <div class="person" class:with-reflectors={!isDaytime}>
                <div class="person-body">🚶‍♂️</div>
                {#if !isDaytime}
                  <div class="reflector-glow r1"></div>
                  <div class="reflector-glow r2"></div>
                  <div class="reflector-glow r3"></div>
                {/if}
              </div>
              
              <div class="car">
                <div class="car-body">🚗</div>
                {#if !isDaytime}
                  <div class="headlight left"></div>
                  <div class="headlight right"></div>
                {/if}
              </div>
            </div>
          </div>
          
          <div class="visibility-info">
            <div class="time-indicator">
              {isDaytime ? '☀️ DAG' : '🌙 NATT'}
            </div>
            
            <div class="visibility-stats">
              {#if isDaytime}
                <div class="stat good">
                  <strong>Synlighet: Bra</strong><br>
                  Du syns tydligt i dagsljus
                </div>
              {:else}
                <div class="stat {dressUpProgress.length > 0 ? 'excellent' : 'poor'}">
                  <strong>Synlighet: {dressUpProgress.length > 0 ? 'Utmärkt med reflexer!' : 'Dålig utan reflexer'}</strong><br>
                  {dressUpProgress.length > 0 ? 
                    'Reflexer gör dig synlig på 200m avstånd!' : 
                    'Utan reflexer syns du bara på 20-30m avstånd'}
                </div>
              {/if}
            </div>
          </div>
        </div>
        
        <button class="back-demo-button" onclick={goBack}>
          Tillbaka till meny
        </button>
      </div>
    {/if}

    {#if currentMode === 'dress-up'}
      <!-- Dress-up activity -->
      <div class="dress-up-section">
        <div class="dress-up-header">
          <h2>Klä personen med reflexer</h2>
          <div class="progress-info">
            <span class="progress">Reflexer på plats: {score}/{reflectorItems.length}</span>
            <button class="reset-button" onclick={resetDressUp}>Börja om</button>
          </div>
        </div>
        
        <div class="dress-up-game">
          <div class="character-area"
               ondragover={handleDragOver}
               ondrop={handleDrop}>
            <div class="character">
              <div class="character-body">🧍‍♀️</div>
              
              <!-- Show placed reflectors -->
              {#each dressUpProgress as reflector}
                <div 
                  class="placed-reflector"
                  style="left: {reflector.position.x}%; top: {reflector.position.y}%"
                >
                  ✨
                </div>
              {/each}
            </div>
            
            <div class="drop-instruction">
              Dra reflexer hit
            </div>
          </div>
          
          <div class="reflector-items">
            <h3>Tillgängliga reflexer:</h3>
            <div class="items-grid">
              {#each availableReflectors as reflector}
                {#if !reflector.placed}
                  <div 
                    class="reflector-item"
                    draggable="true"
                    ondragstart={(e) => handleDragStart(e, reflector)}
                  >
                    <div class="item-icon">{reflector.emoji}</div>
                    <div class="item-name">{reflector.name}</div>
                  </div>
                {/if}
              {/each}
            </div>
            
            {#if score === reflectorItems.length}
              <div class="completion-message">
                🎉 Fantastiskt! Nu syns personen mycket bättre i mörkret!
              </div>
            {/if}
          </div>
        </div>
        
        <button class="back-game-button" onclick={goBack}>
          Tillbaka till meny
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .reflectors-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: white;
  }

  .activity-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: #333;
  }

  .back-button {
    background: #2196F3;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 18px;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: #1976D2;
  }

  .activity-header h1 {
    font-size: 32px;
    color: #2E7D32;
    margin: 0;
    font-weight: bold;
  }

  .reflectors-content {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .overview-section {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .intro h2 {
    font-size: 28px;
    color: #2E7D32;
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .intro p {
    font-size: 18px;
    line-height: 1.6;
    margin: 0 0 2rem 0;
    text-align: center;
  }

  .activity-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .activity-btn {
    background: white;
    border: 3px solid #ddd;
    border-radius: 16px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    min-height: 44px;
    min-width: 44px;
  }

  .activity-btn:hover {
    border-color: #4CAF50;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btn-icon {
    font-size: 48px;
    margin-bottom: 1rem;
  }

  .activity-btn h3 {
    font-size: 24px;
    color: #2E7D32;
    margin: 0 0 0.5rem 0;
  }

  .activity-btn p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  .tips-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .tips-section h3 {
    font-size: 20px;
    color: #2E7D32;
    margin: 0 0 1rem 0;
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tips-list li {
    padding: 0.5rem 0;
    font-size: 16px;
    border-bottom: 1px solid #ddd;
    position: relative;
    padding-left: 1.5rem;
  }

  .tips-list li::before {
    content: '💡';
    position: absolute;
    left: 0;
    top: 0.5rem;
  }

  .tips-list li:last-child {
    border-bottom: none;
  }

  .comparison-section {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .comparison-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .comparison-header h2 {
    font-size: 28px;
    color: #2E7D32;
    margin: 0;
  }

  .toggle-button {
    background: #FF9800;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
    transition: all 0.2s ease;
  }

  .toggle-button:hover {
    background: #F57C00;
  }

  .visibility-demo {
    border-radius: 16px;
    padding: 2rem;
    margin: 2rem 0;
    transition: all 0.5s ease;
  }

  .visibility-demo.day {
    background: linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%);
  }

  .visibility-demo.night {
    background: linear-gradient(to bottom, #1a1a1a 0%, #2a2a2a 100%);
  }

  .environment {
    position: relative;
    min-height: 200px;
  }

  .road {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
  }

  .person {
    position: relative;
    transition: all 0.3s ease;
  }

  .person-body {
    font-size: 40px;
  }

  .person.with-reflectors {
    filter: drop-shadow(0 0 10px #fff);
  }

  .reflector-glow {
    position: absolute;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  .reflector-glow.r1 {
    width: 20px;
    height: 20px;
    top: 5px;
    left: 10px;
  }

  .reflector-glow.r2 {
    width: 15px;
    height: 15px;
    top: 15px;
    right: 5px;
  }

  .reflector-glow.r3 {
    width: 18px;
    height: 18px;
    bottom: 5px;
    left: 15px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  .car {
    position: relative;
  }

  .car-body {
    font-size: 32px;
  }

  .headlight {
    position: absolute;
    top: 10px;
    width: 100px;
    height: 20px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.8) 0%, transparent 100%);
    border-radius: 10px;
  }

  .headlight.left {
    left: -100px;
  }

  .headlight.right {
    left: -80px;
    top: 20px;
  }

  .visibility-info {
    text-align: center;
    margin-top: 2rem;
  }

  .time-indicator {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .visibility-stats {
    background: rgba(0, 0, 0, 0.1);
    padding: 1rem;
    border-radius: 8px;
  }

  .stat {
    font-size: 16px;
    line-height: 1.5;
  }

  .stat.good {
    color: #4CAF50;
  }

  .stat.poor {
    color: #F44336;
  }

  .stat.excellent {
    color: #2E7D32;
  }

  .back-demo-button, .back-game-button {
    background: #9E9E9E;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
    transition: all 0.2s ease;
    display: block;
    margin: 2rem auto 0 auto;
  }

  .back-demo-button:hover, .back-game-button:hover {
    background: #757575;
  }

  .dress-up-section {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .dress-up-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .dress-up-header h2 {
    font-size: 28px;
    color: #2E7D32;
    margin: 0;
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .progress {
    font-size: 16px;
    font-weight: bold;
    color: #4CAF50;
  }

  .reset-button {
    background: #FF9800;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
    transition: all 0.2s ease;
  }

  .reset-button:hover {
    background: #F57C00;
  }

  .dress-up-game {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 2rem 0;
  }

  .character-area {
    background: linear-gradient(to bottom, #1a1a1a 0%, #2a2a2a 100%);
    border-radius: 16px;
    padding: 2rem;
    min-height: 400px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 3px dashed #ccc;
  }

  .character {
    position: relative;
    font-size: 80px;
  }

  .character-body {
    position: relative;
    z-index: 1;
  }

  .placed-reflector {
    position: absolute;
    font-size: 20px;
    z-index: 2;
    animation: sparkle 1s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.3); opacity: 1; }
  }

  .drop-instruction {
    position: absolute;
    bottom: 1rem;
    color: #ccc;
    font-size: 16px;
    text-align: center;
  }

  .reflector-items {
    background: #f8f9fa;
    border-radius: 16px;
    padding: 2rem;
  }

  .reflector-items h3 {
    font-size: 20px;
    color: #2E7D32;
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .reflector-item {
    background: white;
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    cursor: grab;
    transition: all 0.2s ease;
    min-height: 44px;
    min-width: 44px;
  }

  .reflector-item:hover {
    border-color: #4CAF50;
    transform: translateY(-2px);
  }

  .reflector-item:active {
    cursor: grabbing;
  }

  .item-icon {
    font-size: 32px;
    margin-bottom: 0.5rem;
  }

  .item-name {
    font-size: 12px;
    color: #666;
    line-height: 1.2;
  }

  .completion-message {
    background: #E8F5E8;
    color: #4CAF50;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
    margin-top: 1rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .reflectors-content {
      padding: 1rem;
    }
    
    .activity-header {
      padding: 1rem;
    }
    
    .activity-header h1 {
      font-size: 24px;
    }
    
    .activity-buttons {
      grid-template-columns: 1fr;
    }
    
    .comparison-header {
      flex-direction: column;
      text-align: center;
    }
    
    .dress-up-game {
      grid-template-columns: 1fr;
    }
    
    .character {
      font-size: 60px;
    }
    
    .dress-up-header {
      flex-direction: column;
      text-align: center;
    }
    
    .progress-info {
      flex-direction: column;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .overview-section, .comparison-section, .dress-up-section {
      border: 2px solid #000;
      background: #fff;
    }
    
    .activity-btn {
      border-color: #000;
    }
    
    .reflector-item {
      border-color: #000;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .reflector-glow, .placed-reflector {
      animation: none;
    }
    
    .activity-btn:hover, .reflector-item:hover {
      transform: none;
    }
  }

  /* Ensure minimum font sizes for accessibility */
  * {
    font-size: max(16px, 1em);
  }
</style>