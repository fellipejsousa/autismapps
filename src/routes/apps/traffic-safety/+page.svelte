<script lang="ts">
  import TrafficSafetyApp from '$lib/components/traffic-safety/TrafficSafetyApp.svelte';
  import { locale, t } from '$lib/i18n';
  
  let preferredLanguage = $state<'sv' | 'en'>($locale === 'sv' ? 'sv' : 'en');
  
  $effect(() => {
    preferredLanguage = $locale === 'sv' ? 'sv' : 'en';
  });
</script>

<svelte:head>
  <title>{$t('app.traffic_safety')} — {$t('app.title.brand')}</title>
  <meta name="description" content={$t('app.traffic_safety.desc')} />
</svelte:head>

<TrafficSafetyApp bind:lang={preferredLanguage} />
