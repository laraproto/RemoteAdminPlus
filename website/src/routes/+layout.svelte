<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/front/Navbar.svelte";
  import { ModeWatcher } from "mode-watcher";
  import type { LayoutProps } from "./$types";
  import { setContext } from "svelte";

  let { children, data }: LayoutProps = $props();

  if (data.user !== undefined) {
    setContext('user', () => data.user)
  }
</script>

<ModeWatcher />
<main>
  <Navbar />
  <article>
    {@render children()}
  </article>
</main>
