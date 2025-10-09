<script lang="ts">
  import * as Alert from "$lib/components/ui/alert/index";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";

  import { CircleAlert } from "@lucide/svelte";

  import type { PageProps } from "./$types";

  import { type TRPCClientError } from "@trpc/client";
  import type { AppRouter } from "@remoteadminplus/backend/trpc";

  import trpcClient from "$lib/trpc";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Pathname } from "$app/types";

  let { data }: PageProps = $props();

  let databaseUrl = $state(data.firstrun?.database_hint);
  let appName = $state(data.configuration?.appName);
  let adminUsername = $state<string>("");
  let adminPassword = $state<string>("");

  let errorMessage = $state<string>();

  const handleSubmit = async () => {
    try {
      const response = await trpcClient.firstrun.set.mutate({
        database_url: data.firstrun?.database_hint || databaseUrl,
        app_name: appName,
        admin_username: adminUsername,
        admin_password: adminPassword,
      });

      if (response?.success) goto(resolve(response.redirect as Pathname));
    } catch (err) {
      if ((err as TRPCClientError<AppRouter>).cause?.message)
        errorMessage = (err as TRPCClientError<AppRouter>).cause?.message;
    }
  };
</script>

<div class="grid h-[94vh] place-items-center">
  <Card.Root class="w-full max-w-sm">
    <Card.Header>
      <Card.Title>{data.configuration?.appName} Wizard</Card.Title>
      <Card.Description>Gwa</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if errorMessage}
        <Alert.Alert class="mt-4">
          <CircleAlert />
          <Alert.Title>Validation Errors</Alert.Title>
          <Alert.Description>
            {errorMessage}
          </Alert.Description>
        </Alert.Alert>
      {/if}

      <form>
        <div class="flex flex-col gap-6">
          <div class="grid gap-2">
            <Label for="database_url">Database URL</Label>
            <Input
              id="database_url"
              readonly={!!data.firstrun?.database_hint}
              bind:value={databaseUrl}
            />
          </div>
          <div class="grid gap-2">
            <Label for="app_name">App Name</Label>
            <Input id="app_name" bind:value={appName} />
          </div>
          <div class="grid gap-2">
            <Label for="admin_username">Admin Username</Label>
            <Input id="admin_username" bind:value={adminUsername} />
          </div>
          <div class="grid gap-2">
            <Label for="admin_password">Admin Password</Label>
            <Input
              id="admin_password"
              type="password"
              bind:value={adminPassword}
            />
          </div>
        </div>
      </form>
    </Card.Content>
    <Card.Footer>
      <Button type="submit" class="w-full" onclick={handleSubmit}
        >Submit configuration</Button
      >
    </Card.Footer>
  </Card.Root>
</div>
