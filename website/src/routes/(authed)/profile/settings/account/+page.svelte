<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Head from "$lib/components/front/Head.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageData } from "./$types";
  import { usernameSchema, passwordSchema } from "../schema";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { data }: { data: PageData } = $props();

  const formUsername = superForm(data.formUsername, {
    validators: zod4Client(usernameSchema),
    onUpdated: async ({ form }) => {
      invalidateAll();
      toast(form.message);
    },
  });

  const formPassword = superForm(data.formPassword, {
    validators: zod4Client(passwordSchema),
    onUpdated: async ({ form }) => {
      invalidateAll();
      toast(form.message);
    },
  });

  const {
    form: formDataUsername,
    enhance: enhanceUsername,
    errors: errorsUsername,
    constraints: constraintsUsername,
    message: messageUsername,
  } = formUsername;
  const {
    form: formDataPassword,
    enhance: enhancePassword,
    errors: errorsPassword,
    constraints: constraintsPassword,
    message: messagePassword,
  } = formPassword;
</script>

<Head title="Account Settings" />

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Your Account</Card.Title>
      <Card.Description>Change your login details from here.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex w-full flex-col gap-4 md:flex-row">
        <!-- Form 1 -->
        <div class="flex-1 p-6">
          <form
            method="POST"
            action="?/username"
            use:enhanceUsername
            class="w-120"
          >
            <Form.Field form={formUsername} name="username">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Username</Form.Label>
                  <Input {...props} bind:value={$formDataUsername.username} />
                {/snippet}
              </Form.Control>
              <Form.Description>Your username</Form.Description>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Field form={formUsername} name="password">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Password</Form.Label>
                  <Input {...props} bind:value={$formDataUsername.password} />
                {/snippet}
              </Form.Control>
              <Form.Description>Password confirmation</Form.Description>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Button>Submit</Form.Button>
          </form>
        </div>

        <!-- Form 2 -->
        <div class="flex-1 p-6">
          <form
            method="POST"
            action="?/password"
            use:enhancePassword
            class="w-120"
          >
            <Form.Field form={formPassword} name="currentPassword">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Current Password</Form.Label>
                  <Input
                    {...props}
                    bind:value={$formDataPassword.currentPassword}
                  />
                {/snippet}
              </Form.Control>
              <Form.Description>Your current password</Form.Description>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Field form={formPassword} name="newPassword">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>New Password</Form.Label>
                  <Input
                    {...props}
                    bind:value={$formDataPassword.newPassword}
                  />
                {/snippet}
              </Form.Control>
              <Form.Description>Your new password</Form.Description>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Field form={formPassword} name="confirmNewPassword">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>New Password Confirmation</Form.Label>
                  <Input
                    {...props}
                    bind:value={$formDataPassword.confirmNewPassword}
                  />
                {/snippet}
              </Form.Control>
              <Form.Description>Confirm your new password</Form.Description>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Button>Submit</Form.Button>
          </form>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</div>
