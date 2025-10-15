<script lang="ts">
  import { type Configuration } from "$lib/types/common";
  import { getContext } from "svelte";

  interface HeadProps {
    title: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    articleAuthor?: string;
  }

  const configuration = getContext<Configuration>("configuration");

  let titleDerived = $state<string>("");

  let { title, ogDescription, ogImage, ogUrl, articleAuthor }: HeadProps =
    $props();

  titleDerived = `${title} | ${configuration.appName}`;
</script>

<svelte:head>
  <meta property="og:title" content={titleDerived} />
  {#if ogDescription}
    <meta property="og:description" content={ogDescription} />
  {/if}
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
  {/if}
  {#if ogUrl}
    <meta property="og:url" content={ogUrl} />
  {/if}
  {#if articleAuthor}
    <meta property="article:author" content={articleAuthor} />
  {/if}
  <title>{titleDerived}</title>
</svelte:head>
