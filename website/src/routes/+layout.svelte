<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/front/Navbar.svelte";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { ModeWatcher } from "mode-watcher";
  import type { LayoutProps } from "./$types";
  import { setContext } from "svelte";

  let { children, data }: LayoutProps = $props();

  if (data.user !== undefined) {
    setContext("user", data.user);
  }
</script>

<Toaster />
<ModeWatcher />
<main>
  <Navbar user={data.user} />
  <article>
    {@render children()}
  </article>
</main>
