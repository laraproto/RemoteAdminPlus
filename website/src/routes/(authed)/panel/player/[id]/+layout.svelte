<script lang="ts">
  import AdaptiveNav from "$lib/components/front/AdaptiveNav.svelte";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<AdaptiveNav
  content={[
    {
      text: "Overview",
      href: `/panel/player/${data.player.uuid}`,
    },
    {
      text: "Bans",
      href: `/panel/player/${data.player.uuid}/bans`,
    },
    {
      text: "Warns",
      href: `/panel/player/${data.player.uuid}/warns`,
    },
  ]}
/>

{@render children?.()}
