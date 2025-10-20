<script lang="ts">
  import { resolve } from "$app/paths";
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { User, Configuration } from "$lib/types/common";
  import trpcClient from "$lib/trpc";
  import { goto, invalidateAll } from "$app/navigation";
  import type { Pathname } from "$app/types";
  import { adaptiveNavContent } from "$lib/context/adaptive-nav";
  import type { AdaptiveNavContent } from "$lib/types/adaptive-nav";
  import { page } from "$app/state";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import templogo from "$lib/images/templogo.png";

  const logout = async () => {
    const value = await trpcClient.authed.user.logout.mutate();
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

  let adaptiveNavContentState = $state<AdaptiveNavContent | null>(null);

  adaptiveNavContent.subscribe((value) => {
    adaptiveNavContentState = value;
  });

  const isMobile = new IsMobile();
</script>

<header class="bg-background relative z-50 w-full">
  <div class="mx-auto w-full px-4">
    <nav class="flex w-full flex-row items-center">
      <!-- Left: Logo/App Name -->
      <div class="flex flex-1 items-center">
        <a href={resolve(user ? "/panel/" : "/")} class="py-3 text-xl">
          {#if isMobile.current}
            <img alt="small" src={templogo} class="h-12 w-12 animate-spin" />
          {:else}
            {configuration?.appName || "RemoteAdminPlus"}
          {/if}
        </a>
      </div>
      <!-- Center: Navigation Menu -->
      <div class="flex flex-1 justify-center">
        {#if adaptiveNavContentState}
          <NavigationMenu.Root>
            <NavigationMenu.List>
              {#if isMobile.current}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger>Menu</NavigationMenu.Trigger>
                  <NavigationMenu.Content>
                    <ul class="grid w-[150px] gap-4 p-2">
                      {#each adaptiveNavContentState as item, i (item)}
                        <li>
                          <NavigationMenu.Link
                            active={page.url.pathname === item.href}
                            href={item.href}>{item.text}</NavigationMenu.Link
                          >
                        </li>
                      {/each}
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              {:else}
                {#each adaptiveNavContentState as item, i (item)}
                  <NavigationMenu.Item value={i.toString()}>
                    <NavigationMenu.Link
                      active={page.url.pathname === item.href}
                      href={item.href}>{item.text}</NavigationMenu.Link
                    >
                  </NavigationMenu.Item>
                {/each}
              {/if}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        {/if}
      </div>
      <!-- Right: User Menu -->
      <div class="flex flex-1 justify-end">
        <NavigationMenu.Root>
          <NavigationMenuPrimitive.Sub>
            <NavigationMenu.List>
              {#if user}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger
                    >{user.displayName ?? user.username}</NavigationMenu.Trigger
                  >
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
                          href="/profile/settings"
                          class="flex-row items-center gap-2"
                        >
                          Settings
                        </NavigationMenu.Link>
                        <NavigationMenu.Link
                          href="javascript:void"
                          class="flex-row items-center gap-2"
                          onclick={logout}>Logout</NavigationMenu.Link
                        >
                      </li>
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              {:else}
                <NavigationMenu.Item>
                  <NavigationMenu.Link href="/register"
                    >Register</NavigationMenu.Link
                  >
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link href="/login">Login</NavigationMenu.Link>
                </NavigationMenu.Item>
              {/if}
            </NavigationMenu.List>
            <NavigationMenu.Viewport class="overflow-hidden" />
          </NavigationMenuPrimitive.Sub>
        </NavigationMenu.Root>
      </div>
    </nav>
  </div>
</header>

<style lang="postcss">
  @reference "tailwindcss";
</style>
