<script lang="ts">
  import Head from "$lib/components/front/Head.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Head title="Profile" />

<h1 class="text-2xl">Hello {data.user.username}</h1>
