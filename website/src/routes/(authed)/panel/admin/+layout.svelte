<script lang="ts">
  import AdaptiveNav from "$lib/components/front/AdaptiveNav.svelte";

  let { children } = $props();
</script>

<AdaptiveNav
  content={[
    {
      text: "Configuration",
      href: "/panel/admin",
    },
    {
      text: "Roles",
      href: "/panel/admin/roles",
    },
    {
      text: "Generated In-Game Config",
      href: "/panel/admin/generated",
    },
  ]}
/>

{@render children?.()}
