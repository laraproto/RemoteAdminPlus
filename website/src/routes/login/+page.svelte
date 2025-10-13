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
  import { goto, invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Pathname } from "$app/types";

  let { data }: PageProps = $props();

  let username = $state("");
  let password = $state<string>("");

  let errorMessage = $state<string>();

  const handleSubmit = async () => {
    try {
      const response = await trpcClient.registration.login.mutate({
        username,
        password,
      });

      if (response?.success && "redirect" in response) {
        await invalidateAll();
        goto(resolve(response.redirect as Pathname));
      }
    } catch (err) {
      if ((err as TRPCClientError<AppRouter>).cause?.message)
        errorMessage = (err as TRPCClientError<AppRouter>).cause?.message;
    }
  };
</script>

<div class="grid h-[92vh] place-items-center">
  <Card.Root class="w-full max-w-sm">
    <Card.Header>
      <Card.Title>Login</Card.Title>
      <Card.Description>Access your account</Card.Description>
      <Card.Action>
        <Button variant="link" href="/register">Register</Button>
      </Card.Action>
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
            <Label for="username">Username*</Label>
            <Input id="username" bind:value={username} required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password*</Label>
            <Input
              id="password"
              type="password"
              bind:value={password}
              required
            />
          </div>
        </div>
      </form>
    </Card.Content>
    <Card.Footer class="flex-col gap-2">
      <Button type="submit" class="w-full" onclick={handleSubmit}>Login</Button>
      <p>* Required fields</p>
    </Card.Footer>
  </Card.Root>
</div>
