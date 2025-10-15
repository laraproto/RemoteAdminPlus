<script lang="ts">
  import Head from "$lib/components/front/Head.svelte";
  import client from "$lib/trpc";

  let trpcResult = $state<string>();

  const buttonClick = async () => {
    trpcResult = await client.hello.query("World");

    console.log(trpcResult);
  };
</script>

<Head title="Home" />

<button onclick={buttonClick}>Click me</button>
<p>{trpcResult}</p>
