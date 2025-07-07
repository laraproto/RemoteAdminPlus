<script lang="ts">
  import { getContext } from "svelte";
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { PUBLIC_API_URL } from "$env/static/public";

  const user = getContext("user");
</script>

<header>
  <nav class="flex flex-row items-center justify-between">
    <a href="/" class="p-3 text-xl"> RemoteAdminPlus </a>
    <NavigationMenu.Root class="pr-8">
      <NavigationMenu.List>
        {#if user}
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Lara</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <div class="mb-2 flex flex-col items-center">
                <div class="flex items-center justify-center py-2">
                  <Badge class="bg-pink-400">User Rank</Badge>
                </div>
                <Separator class="mb-2" />
                <NavigationMenu.Link href="/profile">
                  Profile
                </NavigationMenu.Link>
                <Separator class="my-2 w-full" />
                <NavigationMenu.Link
                  class="mb-2"
                  href="{PUBLIC_API_URL}/auth/logout"
                >
                  Logout
                </NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        {:else}
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/auth/register">
              Register
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/auth/login">Login</NavigationMenu.Link>
          </NavigationMenu.Item>
        {/if}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  </nav>
</header>

<style lang="postcss">
  @reference "tailwindcss";
</style>
