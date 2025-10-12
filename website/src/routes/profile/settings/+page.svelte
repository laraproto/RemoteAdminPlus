<script lang="ts">
  import { getContext } from "svelte";
  import type { User } from "$lib/types/common";

  const user = getContext<User>("user");
</script>

<h1 class="text-2xl">Hello {user.username}</h1>
