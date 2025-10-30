<script lang="ts">
  import client from "$lib/trpc";
  import type { User } from "$lib/types/common";
  import Head from "$lib/components/front/Head.svelte";

  let trpcResult = $state<User | null>(null);

  const buttonClick = async () => {
    trpcResult = await client.authed.authedUser.me.query();

    console.log($state.snapshot(trpcResult));
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

<p>
  Tbh I don't really know what to put on this page rn, if stat tracking was
  working it would probably have info on a player's playtime, would probably
  show a banner too if the user was banned
</p>

<style>
</style>
