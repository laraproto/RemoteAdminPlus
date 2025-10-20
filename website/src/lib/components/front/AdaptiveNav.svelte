<script lang="ts">
  import {
    adaptiveNavContent,
    clearAdaptiveNavContent,
  } from "$lib/context/adaptive-nav";
  import type { AdaptiveNavContent } from "$lib/types/adaptive-nav";
  import { onDestroy } from "svelte";

  interface AdaptiveProps {
    content: AdaptiveNavContent;
  }

  let { content }: AdaptiveProps = $props();

  adaptiveNavContent.set(content);

  onDestroy(() => {
    clearAdaptiveNavContent();
  });
</script>
