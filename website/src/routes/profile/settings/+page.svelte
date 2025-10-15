<script lang="ts">
  import { getContext } from "svelte";
  import type { User } from "$lib/types/common";
  import Head from "$lib/components/front/Head.svelte";

  const user = getContext<User>("user");
</script>

<Head title="Profile Settings" />

<h1 class="text-2xl">Hello {user.username}</h1>
