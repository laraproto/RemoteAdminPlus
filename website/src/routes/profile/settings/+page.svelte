<script lang="ts">
  import { getContext } from "svelte";
  import type { User } from "$lib/types/common";
  import * as Alert from "$lib/components/ui/alert";
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import Head from "$lib/components/front/Head.svelte";

  import { CircleAlert, CircleCheck } from "@lucide/svelte";

  import { type TRPCClientError } from "@trpc/client";
  import type { AppRouter } from "@remoteadminplus/backend/trpc";

  import trpcClient from "$lib/trpc";
  import { goto, invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Pathname } from "$app/types";

  import { splitName } from "$lib/avatar-fallback";

  const user = getContext<User>("user");

  let newUser = $state({
    username: user.username,
    displayName: user.displayName,
  });

  let message = $state<string>();
  let success = $state<boolean>();

  const handleSubmit = async () => {
    /*try {
      const response = await trpcClient.registration.register.mutate({
        username,
        email,
        password,
      });

      message = response?.message;
      success = response?.success;

      if (response?.success && "redirect" in response) {
        await invalidateAll();
        setTimeout(() => {
          goto(resolve(response.redirect as Pathname));
        }, 2000);
      }
    } catch (err) {
      if ((err as TRPCClientError<AppRouter>).cause?.message)
        message = (err as TRPCClientError<AppRouter>).cause?.message;
        }*/
    console.log($state.snapshot(newUser));
  };
</script>

<Head title="Public Profile Settings" />

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Public Profile</Card.Title>
      <Card.Description>Manage how you show up to others.</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if message}
        <Alert.Alert class="mb-6">
          {#if !success}
            <CircleAlert />
          {:else}
            <CircleCheck />
          {/if}
          <Alert.Title
            >{!success ? "Validation Errors" : "Messages"}</Alert.Title
          >
          <Alert.Description>
            {message}
          </Alert.Description>
        </Alert.Alert>
      {/if}
      <form>
        <div class="flex flex-row">
          <Avatar.Root class="h-40 w-40">
            <Avatar.Fallback class="text-3xl"
              >{splitName(user.displayName ?? user.username)}</Avatar.Fallback
            >
          </Avatar.Root>
          <ul class="ml-6 flex flex-col justify-center gap-2">
            <li class="grid gap-2">
              <Label for="username">Username:</Label>
              <Input id="username" bind:value={newUser.username} required />
            </li>
            <li class="grid gap-2">
              <Label for="displayname">Display Name:</Label>
              <Input id="displayname" bind:value={newUser.displayName} />
            </li>
          </ul>
        </div>
      </form>
    </Card.Content>
    <Card.Footer class="flex justify-end">
      <Button type="submit" class="" onclick={handleSubmit}>Save Changes</Button
      >
    </Card.Footer>
  </Card.Root>
</div>
