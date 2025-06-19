<script lang="ts">
  import { enhance } from '$app/forms';
  import { PUBLIC_API_URL } from "$env/static/public";
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="card">
    <h1 class="text-2xl font-bold">Register for RemoteAdminPlus</h1>
    <p class="mt-4">
      Gwa
    </p>
    <form method="post" action="{PUBLIC_API_URL}/auth/register" use:enhance class="flex flex-col pt-4">
      <label class="flex flex-col items-start">
        <span class="input-label">Email</span>
        <input name="email" type="email" class="flex-grow"/>
      </label>
      <label class="flex flex-col items-start">
        <span class="input-label">Username</span>
        <input name="username" class="flex-grow"/>
      </label>
      <label class="flex flex-col items-start">
        <span class="input-label">Password</span>
        <input name="password" type="password" class="flex-grow"/>
      </label>
      <button class="cursor-pointer">Submit</button>
    </form>
  </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    label {
        @apply mb-4 flex flex-col text-left text-xl;
    }

    .input-label {
        @apply mb-1 text-sm font-medium text-neutral-300;
    }

    input {
        @apply w-full rounded-lg bg-neutral-950/50 p-2 outline outline-zinc-700 transition hover:outline-2 hover:outline-sky-500;
    }

    button {
        @apply my-4 rounded-lg bg-neutral-950/50 p-2 outline outline-zinc-700 transition hover:outline-2 hover:outline-sky-500;
    }
</style>