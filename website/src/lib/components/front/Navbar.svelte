<script lang="ts">
  import { resolve } from "$app/paths";
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { User, Configuration } from "$lib/types/common";
  import trpcClient from "$lib/trpc";
  import { goto, invalidateAll } from "$app/navigation";
  import type { Pathname } from "$app/types";

  const logout = async () => {
    const value = await trpcClient.authed.logout.mutate();
    console.log(value);
    if (value?.success) {
      invalidateAll();
      goto(resolve(value?.redirect as Pathname));
    }
  };

  let {
    user,
    configuration,
  }: { user: User | null; configuration: Configuration | null } = $props();
</script>

<header>
  <nav class="flex flex-row items-center justify-between">
    <a href={resolve(user ? "/panel/" : "/")} class="p-3 text-xl">
      {configuration?.appName || "RemoteAdminPlus"}
    </a>
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

                  <Button
                    variant="ghost"
                    class="flex-row items-center gap-2"
                    onclick={logout}>Logout</Button
                  >
                </li>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        {:else}
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/register">Register</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/login">Login</NavigationMenu.Link>
          </NavigationMenu.Item>
        {/if}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  </nav>
</header>

<style lang="postcss">
  @reference "tailwindcss";
</style>
