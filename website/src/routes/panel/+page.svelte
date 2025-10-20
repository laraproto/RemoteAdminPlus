<script lang="ts">
  import client from "$lib/trpc";
  import type { User } from "$lib/types/common";
  import Head from "$lib/components/front/Head.svelte";

  let trpcResult = $state<User | null>(null);

  const buttonClick = async () => {
    trpcResult = await client.authed.user.me.query();

    console.log(trpcResult);
  };
</script>

<Head title="Panel" />

<h1 class="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">
  User Home
</h1>

<button onclick={buttonClick}>Click me</button>
{#if trpcResult}
  <p>{JSON.stringify(trpcResult)}</p>
{/if}

<style>
</style>
