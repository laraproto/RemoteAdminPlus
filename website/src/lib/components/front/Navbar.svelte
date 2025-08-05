<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { User } from "../../../app";

  let { user }: { user: User | null } = $props();
</script>

<header>
  <nav class="flex flex-row items-center justify-between">
    <a href={user ? "/panel" : "/"} class="p-3 text-xl"> RemoteAdminPlus </a>
    <NavigationMenu.Root class="pr-8">
      <NavigationMenu.List>
        {#if user}
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>{user.username}</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul class="grid w-[100px] gap-4 p-2">
                <li>
                  <NavigationMenu.Link
                    href="/profile"
                    class="flex-row items-center gap-2"
                  >
                    Profile
                  </NavigationMenu.Link>

                  <NavigationMenu.Link
                    href="/api/auth/logout"
                    class="flex-row items-center gap-2"
                  >
                    Logout
                  </NavigationMenu.Link>
                </li>
              </ul>
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
