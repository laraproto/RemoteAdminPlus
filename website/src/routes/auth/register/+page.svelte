<script lang="ts">
  import * as Alert from '$lib/components/ui/alert/index'
  import * as Card from '$lib/components/ui/card';
  import { Button } from "$lib/components/ui/button";
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';

  import { AlertCircleIcon } from "@lucide/svelte";

  import { type ParsableError, parse, type ValidationData } from "$lib/elysiaValidationParser";
  import comm from '$lib/comm';
  import type { AxiosError } from "axios";
  import { getContext, onMount } from "svelte";
  import { goto } from "$app/navigation";

  const user = getContext('user');
  let email = $state<string>();
  let username = $state<string>();
  let password = $state<string>();
  let parsedErrors = $state<ParsableError[]>([])
  let badRequestError = $state<string | null>(null);

  onMount(() => {
    if (user) goto('/panel');
  })

  async function formSubmit() {
    parsedErrors = [];
    badRequestError = null;
    try {
      const axiosResponse = await comm.postForm('auth/register', {
        email,
        username,
        password,
      })
      if (axiosResponse.status === 200) await goto('/panel');
    } catch (error) {
      const axiosError: AxiosError = error as AxiosError;
      switch (axiosError.response?.status) {
        case 422: {
          // Parse the validation errors
          // assume already parsed json data
          parsedErrors = parse(axiosError.response.data as ValidationData);
          break;
        }
        case 400: {
          const data = axiosError.response?.data as { message: string };
          badRequestError = data.message;
          break;
        }
        default: {
          badRequestError = axiosError.response?.data as string;
        }
      }
    }
  }
</script>

<div class="grid place-items-center h-[94vh]">
  <Card.Root class="w-full max-w-sm">
    <Card.Header>
      <Card.Title>Register for RemoteAdminPlus</Card.Title>
      <Card.Description>
        Gwa
      </Card.Description>
    </Card.Header>
    <Card.Content>
      {#if parsedErrors.length > 0 || badRequestError !== null}
        <Alert.Alert class="mt-4">
          <AlertCircleIcon />
          <Alert.Title>Validation Errors</Alert.Title>
          <Alert.Description>
            <ul class="list-inside list-disc text-sm">
              {#each parsedErrors as error (error.field)}
                <li>{error.field}: {error.message}</li>
              {/each}
              {#if badRequestError !== null}
                <li>{badRequestError}</li>
              {/if}
            </ul>
          </Alert.Description>
        </Alert.Alert>
      {/if}

      <form>
        <div class="flex flex-col gap-6">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" autocomplete required bind:value={email} />
          </div>
          <div class="grid gap-2">
            <Label for="username">Username</Label>
            <Input id="username" autocomplete required bind:value={username} />
          </div>
          <div class="grid gap-2">
              <Label for="password">Password</Label>
            <Input id="password" type="password" required bind:value={password} />
          </div>
        </div>
      </form>
    </Card.Content>
    <Card.Footer>
      <Button type="submit" class="w-full" onclick={formSubmit}>Register</Button>
    </Card.Footer>
  </Card.Root>
</div>