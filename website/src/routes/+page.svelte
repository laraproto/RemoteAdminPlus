<script lang="ts">
  import client from "$lib/trpc";
  let trpcResult = $state<string>();

  const buttonClick = async () => {
    trpcResult = await client.hello.query("World");

    console.log(trpcResult);
  };
</script>

<button onclick={buttonClick}>Click me</button>
<p>{trpcResult}</p>
