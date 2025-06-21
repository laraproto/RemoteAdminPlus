<script lang="ts">
</script>

<header>
  <nav class="flex justify-between items-center dark:bg-neutral-800 bg-neutral-200">
    <a href="/" class="text-xl">
      RemoteAdminPlus
    </a>
    <ul class="flex space-x-4 text-lg">
      <li>
        <a href="/auth/register">Register</a>
      </li>
      <li>
        <a href="/auth/login">Login</a>
      </li>
    </ul>
  </nav>
</header>

<style lang="postcss">
  @reference "tailwindcss";

  a {
      @apply p-3;
  }
</style>