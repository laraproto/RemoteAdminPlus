<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/front/Navbar.svelte";

  let { children } = $props();
</script>

<main>
  <Navbar />
  <article>
    {@render children()}
  </article>
</main>
