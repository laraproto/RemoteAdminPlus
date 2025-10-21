<script lang="ts">
  import AdaptiveNav from "$lib/components/front/AdaptiveNav.svelte";

  let { children } = $props();
</script>

<AdaptiveNav
  content={[
    {
      text: "Public Profile",
      href: "/profile/settings",
    },
    {
      text: "Account",
      href: "/profile/settings/account",
    },
  ]}
/>

{@render children?.()}
