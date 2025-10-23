<script lang="ts">
  import AdaptiveNav from "$lib/components/front/AdaptiveNav.svelte";

  let { children } = $props();
</script>

<AdaptiveNav
  content={[
    {
      text: "Bans",
      href: "/panel/bans",
    },
    {
      text: "Warns",
      href: "/panel/warns",
    },
    {
      text: "Player Search",
      href: "/panel/search",
    },
  ]}
/>

{@render children?.()}
