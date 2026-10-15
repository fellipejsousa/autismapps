<script lang="ts">
  import { base } from '$app/paths';
  import { t } from '$lib/i18n';
</script>

<svelte:head>
  <title>{$t('instructions.title')} · {$t('app.title.brand')}</title>
  <meta name="description" content={$t('instructions.intro')} />
</svelte:head>

<main class="instructions-page">
  <section class="instructions-hero" aria-labelledby="instructions-title">
    <div class="hero-copy">
      <p class="eyebrow"><span class="eyebrow-dot"></span>{$t('instructions.eyebrow')}</p>
      <h1 id="instructions-title">{$t('instructions.heading')}</h1>
      <p class="hero-intro">{$t('instructions.intro')}</p>
      <a class="hero-link" href={base + '/'}>
        {$t('instructions.cta')}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>
    <div class="hero-art" role="img" aria-label={$t('instructions.heading')}>
      <img src={`${base}/images/home-journey.webp`} alt="" fetchpriority="high" />
    </div>
  </section>

  <section class="steps" aria-label={$t('instructions.title')}>
    <article class="step-card">
      <span class="step-number">01</span>
      <div><h2>{$t('instructions.step1.title')}</h2><p>{$t('instructions.step1.body')}</p></div>
      <span class="step-symbol" aria-hidden="true">⌕</span>
    </article>
    <article class="step-card">
      <span class="step-number">02</span>
      <div><h2>{$t('instructions.step2.title')}</h2><p>{$t('instructions.step2.body')}</p></div>
      <span class="step-symbol" aria-hidden="true">↗</span>
    </article>
    <article class="step-card">
      <span class="step-number">03</span>
      <div><h2>{$t('instructions.step3.title')}</h2><p>{$t('instructions.step3.body')}</p></div>
      <span class="step-symbol" aria-hidden="true">◌</span>
    </article>
    <article class="step-card">
      <span class="step-number">04</span>
      <div><h2>{$t('instructions.step4.title')}</h2><p>{$t('instructions.step4.body')}</p></div>
      <span class="step-symbol" aria-hidden="true">↗</span>
    </article>
  </section>

  <aside class="gentle-note">
    <span class="note-mark" aria-hidden="true">✳</span>
    <div><h2>{$t('instructions.note.title')}</h2><p>{$t('instructions.note.body')}</p></div>
    <a href={base + '/about'}>{$t('instructions.about')}<span aria-hidden="true">→</span></a>
  </aside>
</main>

<style>
  .instructions-page { width: min(1320px, calc(100% - 64px)); margin: 0 auto; padding-bottom: 70px; }
  .instructions-hero { display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: 52px; padding: 60px 0 48px; }
  .hero-copy { padding: 8px 0; }
  .eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 18px; color: var(--accent); font-size: .76rem; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
  .eyebrow-dot { width: 8px; height: 8px; border-radius: 50%; background: #b66d4c; box-shadow: 0 0 0 4px #b66d4c1d; }
  h1 { max-width: 560px; margin: 0; color: var(--text); font-size: clamp(2.5rem, 4.8vw, 4rem); font-weight: 680; letter-spacing: -.06em; line-height: 1.04; text-wrap: balance; }
  .hero-intro { max-width: 490px; margin: 20px 0 0; color: var(--text-secondary); font-size: 1.04rem; line-height: 1.7; }
  .hero-link { width: fit-content; display: inline-flex; align-items: center; gap: 12px; margin-top: 24px; padding: 13px 18px; border-radius: 999px; background: var(--accent); color: var(--bg-card); font-size: .9rem; font-weight: 700; text-decoration: none; transition: background .18s, transform .18s; }
  .hero-link:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .hero-art { height: 330px; overflow: hidden; border: 1px solid var(--border); border-radius: 24px; background: #f5f0e5; }
  .hero-art img { width: 100%; height: 100%; display: block; object-fit: cover; }
  .steps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; padding-top: 25px; border-top: 1px solid var(--border); }
  .step-card { min-height: 166px; display: grid; grid-template-columns: 34px 1fr 32px; align-items: start; gap: 14px; padding: 22px; border: 1px solid var(--border); border-radius: 17px; background: var(--bg-card); }
  .step-number { padding-top: 2px; color: var(--accent); font-size: .72rem; font-weight: 760; letter-spacing: .06em; }
  .step-card h2, .gentle-note h2 { margin: 0; color: var(--text); font-size: 1.02rem; font-weight: 700; letter-spacing: -.025em; }
  .step-card p, .gentle-note p { margin: 8px 0 0; color: var(--text-secondary); font-size: .87rem; line-height: 1.65; }
  .step-symbol { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 10px; background: var(--bg-hover); color: var(--accent); font-size: 1.2rem; }
  .gentle-note { display: flex; align-items: center; gap: 16px; margin-top: 22px; padding: 22px 24px; border: 1px solid #dbe4dc; border-radius: 17px; background: color-mix(in srgb, var(--accent) 6%, var(--bg-card)); }
  .note-mark { width: 38px; height: 38px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; background: var(--accent); color: var(--bg-card); font-size: 1.2rem; }
  .gentle-note div { flex: 1; }
  .gentle-note a { display: inline-flex; align-items: center; gap: 9px; color: var(--accent); font-size: .81rem; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .gentle-note a:hover { text-decoration: underline; }
  @media (max-width: 900px) {
    .instructions-page { width: min(100% - 44px, 780px); }
    .instructions-hero { gap: 28px; grid-template-columns: 1fr .92fr; }
    .hero-art { height: 280px; }
  }
  @media (max-width: 650px) {
    .instructions-page { width: calc(100% - 36px); padding-bottom: 45px; }
    .instructions-hero { display: flex; flex-direction: column; align-items: stretch; gap: 22px; padding: 38px 0 32px; }
    .eyebrow { margin-bottom: 13px; font-size: .67rem; }
    h1 { font-size: clamp(2.4rem, 11vw, 3.4rem); }
    .hero-intro { margin-top: 14px; font-size: .97rem; }
    .hero-link { margin-top: 18px; }
    .hero-art { height: clamp(180px, 48vw, 260px); border-radius: 18px; }
    .steps { grid-template-columns: 1fr; gap: 9px; padding-top: 19px; }
    .step-card { min-height: 0; grid-template-columns: 30px 1fr 30px; gap: 10px; padding: 17px 15px; }
    .gentle-note { align-items: flex-start; flex-wrap: wrap; gap: 12px; padding: 17px; }
    .gentle-note div { flex-basis: calc(100% - 54px); }
    .gentle-note a { margin-left: 50px; }
  }
</style>
