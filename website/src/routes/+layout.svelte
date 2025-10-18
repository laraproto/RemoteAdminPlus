<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/front/Navbar.svelte";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { ModeWatcher } from "mode-watcher";
  import type { LayoutProps } from "./$types";
  import { setContext } from "svelte";
  import { adaptiveNavContent } from "$lib/context/adaptive-nav";

  let { children, data }: LayoutProps = $props();

  if (data.user !== undefined) {
    setContext("user", data.user);
  }
  if (data.configuration !== undefined) {
    setContext("configuration", data.configuration);
  }

  adaptiveNavContent.set(null);
</script>

<Toaster />
<ModeWatcher />

<div class="bg-background z-10 flex min-h-svh flex-col overflow-auto">
  <Navbar user={data.user} configuration={data.configuration} />
  <main>
    {@render children()}
  </main>
</div>
