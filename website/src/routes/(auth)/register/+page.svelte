<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Head from "$lib/components/front/Head.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageProps } from "./$types";
  import { registerSchema } from "../schema";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();

  const form = superForm(data.form, {
    validators: zod4Client(registerSchema),
    onUpdated: async ({ form }) => {
      invalidateAll();
      toast(form.message);
    },
  });

  const { form: formData, enhance } = form;
</script>

<Head title="Register" />

<div class="grid h-[92vh] place-items-center">
  <Card.Root class="w-full max-w-sm">
    <Card.Header>
      <Card.Title>Register</Card.Title>
      <Card.Description>Create your account</Card.Description>
      <Card.Action>
        <Button variant="link" href="/login">Login</Button>
      </Card.Action>
    </Card.Header>
    <form method="POST" use:enhance>
      <Card.Content>
        <Form.Field {form} name="username">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Username</Form.Label>
              <Input {...props} bind:value={$formData.username} />
            {/snippet}
          </Form.Control>
          <Form.Description>Your username</Form.Description>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="password">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Password</Form.Label>
              <Input
                {...props}
                type="password"
                bind:value={$formData.password}
              />
            {/snippet}
          </Form.Control>
          <Form.Description>Minimum 8 characters, Maximum 128</Form.Description>
          <Form.FieldErrors />
        </Form.Field>
      </Card.Content>
      <Card.Footer class="flex-col gap-2">
        <Form.Button>Register</Form.Button>
      </Card.Footer>
    </form>
  </Card.Root>
</div>
