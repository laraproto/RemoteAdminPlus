<script lang="ts">
  import { resolve } from "$app/paths";
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import type { User, Configuration } from "$lib/types/common";
  import trpcClient from "$lib/trpc";
  import { goto, invalidateAll } from "$app/navigation";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import type { Pathname } from "$app/types";
  import { adaptiveNavContent } from "$lib/context/adaptive-nav";
  import type { AdaptiveNavContent } from "$lib/types/adaptive-nav";
  import { page } from "$app/state";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import templogo from "$lib/images/templogo.png";
  import { JointFlags } from "@remoteadminplus/shared/common/user";

  const logout = async () => {
    const value = await trpcClient.authed.authedUser.logout.mutate();
    setLogoutDialog(false);
    if (value?.success) {
      invalidateAll();
      goto(resolve(value?.redirect as Pathname));
    }
  };

  let logoutDialogOpen = $state(false);

  const setLogoutDialog = async (open: boolean) => {
    logoutDialogOpen = open;
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

{#snippet logoutDialog()}
  <AlertDialog.Root bind:open={logoutDialogOpen}>
    <AlertDialog.Trigger hidden />
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Log Out</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure you want to log out?
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action onclick={logout}>Log Out</AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/snippet}

{@render logoutDialog()}

<header class="bg-background relative z-50 w-full">
  <div class="mx-auto w-full px-4">
    <nav class="flex w-full flex-row items-center">
      <!-- Left: Logo/App Name -->
      <div class="ml-4 flex flex-1 items-center">
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
                        <li value={i.toString()}>
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
      <div class="mr-4 flex flex-1 justify-end">
        <NavigationMenu.Root viewport={false}>
          <NavigationMenu.List>
            {#if user}
              {#if user.flags & JointFlags.SUPERADMIN}
                <NavigationMenu.Item>
                  <NavigationMenu.Link href="/panel/admin"
                    >Admin Settings</NavigationMenu.Link
                  >
                </NavigationMenu.Item>
              {/if}
              <NavigationMenu.Item>
                <NavigationMenu.Trigger
                  >{user.displayName ?? user.username}</NavigationMenu.Trigger
                >
                <NavigationMenu.Content>
                  <ul class="grid w-[100px] gap-4 p-2">
                    <li>
                      <NavigationMenu.Link
                        href="/panel"
                        class="flex-row items-center gap-2"
                      >
                        Panel
                      </NavigationMenu.Link>
                      <Separator class="my-2" />
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
                      <Separator class="my-2" />
                      <NavigationMenu.Link
                        href="javascript:void"
                        class="flex-row items-center gap-2"
                        onclick={() => setLogoutDialog(true)}
                        >Logout</NavigationMenu.Link
                      >
                    </li>
                  </ul>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            {:else}
              {#if configuration?.registrationEnabled}
                <NavigationMenu.Item>
                  <NavigationMenu.Link href="/register"
                    >Register</NavigationMenu.Link
                  >
                </NavigationMenu.Item>
              {/if}
              <NavigationMenu.Item>
                <NavigationMenu.Link href="/login">Login</NavigationMenu.Link>
              </NavigationMenu.Item>
            {/if}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </nav>
  </div>
</header>

<style lang="postcss">
  @reference "tailwindcss";
</style>
