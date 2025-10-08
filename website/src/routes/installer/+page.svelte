<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h1>Meowmeowmeow</h1>
<p>{data.firstrun?.database_hint}</p>
