<script lang="ts">
  import FirstThenBoard from '$lib/components/FirstThenBoard.svelte';
  import VisualCountdown from '$lib/components/VisualCountdown.svelte';
  import TransitionStories from '$lib/components/TransitionStories.svelte';
  import EmotionCheckin from '$lib/components/EmotionCheckin.svelte';
  import SavedTransitions from '$lib/components/SavedTransitions.svelte';
  import { t } from '$lib/i18n';

  type Section = 'board' | 'timer' | 'stories' | 'checkin' | 'saved';
  type SavedSelection = { firstId: string; thenId: string; revision: number };

  let activeSection = $state<Section>('board');
  let savedSelection = $state<SavedSelection | null>(null);
  let savedRevision = $state(0);

  const sections: { id: Section; key: string; icon: string }[] = [
    { id: 'board', key: 'th.tab.board', icon: '↔' },
    { id: 'timer', key: 'th.tab.timer', icon: '◷' },
    { id: 'stories', key: 'th.tab.stories', icon: '▤' },
    { id: 'checkin', key: 'th.tab.checkin', icon: '☺' },
    { id: 'saved', key: 'th.tab.saved', icon: '☆' }
  ];

  function useSavedTransition(firstId: string, thenId: string) {
    savedSelection = { firstId, thenId, revision: Date.now() };
    activeSection = 'board';
  }

  function handleTabKeydown(event: KeyboardEvent, current: Section) {
    const index = sections.findIndex((section) => section.id === current);
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % sections.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + sections.length) % sections.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = sections.length - 1;
    else return;

    event.preventDefault();
    const next = sections[nextIndex];
    activeSection = next.id;
    document.getElementById(`tab-${next.id}`)?.focus();
  }
</script>

<svelte:head>
  <title>{$t('app.transition_helper')} — {$t('app.title.brand')}</title>
  <meta name="description" content={$t('app.transition_helper.desc')} />
</svelte:head>

<main class="transition-page">
  <header class="page-intro">
    <div>
      <p class="eyebrow">{$t('app.category.daily')}</p>
      <h1>{$t('app.transition_helper')}</h1>
      <p class="intro-copy">{$t('th.intro')}</p>
    </div>
  </header>

  <div class="section-tabs" role="tablist" aria-label={$t('th.title')}>
    {#each sections as section}
      <button
        id={`tab-${section.id}`}
        class="section-tab"
        class:active={activeSection === section.id}
        role="tab"
        aria-selected={activeSection === section.id}
        aria-controls={`panel-${section.id}`}
        tabindex={activeSection === section.id ? 0 : -1}
        onclick={() => activeSection = section.id}
        onkeydown={(event) => handleTabKeydown(event, section.id)}
      >
        <span class="tab-icon" aria-hidden="true">{section.icon}</span>
        <span class="tab-label">{$t(section.key)}</span>
      </button>
    {/each}
  </div>

  <div class="section-content">
    <div id="panel-board" class="panel" role="tabpanel" aria-labelledby="tab-board" tabindex="0" hidden={activeSection !== 'board'}>
      <FirstThenBoard
        onStartTimer={() => activeSection = 'timer'}
        onSaved={() => savedRevision += 1}
        preset={savedSelection}
      />
    </div>

    <div id="panel-timer" class="panel" role="tabpanel" aria-labelledby="tab-timer" tabindex="0" hidden={activeSection !== 'timer'}>
      <VisualCountdown />
    </div>

    <div id="panel-stories" class="panel" role="tabpanel" aria-labelledby="tab-stories" tabindex="0" hidden={activeSection !== 'stories'}>
      <TransitionStories />
    </div>

    <div id="panel-checkin" class="panel" role="tabpanel" aria-labelledby="tab-checkin" tabindex="0" hidden={activeSection !== 'checkin'}>
      <EmotionCheckin />
    </div>

    <div id="panel-saved" class="panel" role="tabpanel" aria-labelledby="tab-saved" tabindex="0" hidden={activeSection !== 'saved'}>
      <SavedTransitions onUse={useSavedTransition} refreshKey={savedRevision} />
    </div>
  </div>
</main>

<style>
  .transition-page {
    width: min(100%, 1080px);
    margin: 0 auto;
    padding: clamp(16px, 3vw, 32px);
  }

  .page-intro { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .eyebrow { margin: 0 0 5px; color: var(--text-muted); font-size: .78rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
  h1 { margin: 0; color: var(--text); font-size: clamp(1.65rem, 3vw, 2.25rem); letter-spacing: -.04em; }
  .intro-copy { margin: 7px 0 0; color: var(--text-secondary); font-size: 1rem; }

  .section-tabs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    padding: 7px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--bg-card);
    box-shadow: var(--shadow);
  }

  .section-tab {
    min-width: 0;
    min-height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--text-secondary);
    font-size: .92rem;
    font-weight: 650;
    transition: background var(--transition), color var(--transition), border-color var(--transition);
  }

  .section-tab:hover { background: var(--bg-hover); color: var(--text); }
  .section-tab.active { border-color: color-mix(in srgb, var(--accent) 18%, var(--border)); background: color-mix(in srgb, var(--accent) 9%, var(--bg-card)); color: var(--accent); }
  .tab-icon { font-size: 1.25rem; line-height: 1; }
  .tab-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .section-content { margin-top: 14px; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-card); box-shadow: var(--shadow); }
  .panel { min-width: 0; }
  .panel[hidden] { display: none; }

  @media (max-width: 620px) {
    .transition-page { padding: 14px 12px 24px; }
    .page-intro { margin-bottom: 14px; }
    .intro-copy { max-width: 34ch; font-size: .92rem; }
    .section-tabs { gap: 4px; padding: 5px; border-radius: 15px; }
    .section-tab { min-height: 58px; flex-direction: column; gap: 4px; padding: 6px 3px; border-radius: 10px; font-size: clamp(.62rem, 2.4vw, .78rem); }
    .tab-icon { font-size: 1.2rem; }
    .section-content { margin-top: 10px; border-radius: 16px; }
  }
</style>
