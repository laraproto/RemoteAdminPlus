<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import Head from "$lib/components/front/Head.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageData } from "./$types";
  import { profileSettingsSchema } from "./schema";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { splitName } from "$lib/avatar-fallback";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { data }: { data: PageData } = $props();

  const form = superForm(data.form, {
    validators: zod4Client(profileSettingsSchema),
    onUpdated: async ({ form }) => {
      invalidateAll();
      toast(form.message);
    },
  });

  const { form: formData, enhance } = form;
</script>

<Head title="Public Profile Settings" />

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Public Profile</Card.Title>
      <Card.Description>Manage how you show up to others.</Card.Description>
    </Card.Header>
    <form method="POST" use:enhance>
      <Card.Content>
        <div class="flex flex-row">
          <Avatar.Root class="h-40 w-40">
            <Avatar.Fallback class="text-3xl"
              >{splitName(
                data.user.displayName ?? data.user.username,
              )}</Avatar.Fallback
            >
          </Avatar.Root>
          <ul class="ml-6 flex flex-col justify-center gap-2">
            <li class="grid gap-2">
              <Form.Field {form} name="displayName">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Display Name</Form.Label>
                    <Input {...props} bind:value={$formData.displayName} />
                  {/snippet}
                </Form.Control>
                <Form.Description
                  >Nicer name that will show on the panel, shows username if not
                  set</Form.Description
                >
                <Form.FieldErrors />
              </Form.Field>
            </li>
          </ul>
        </div>
      </Card.Content>
      <Card.Footer class="flex justify-end">
        <Form.Button>Submit</Form.Button>
      </Card.Footer>
    </form>
  </Card.Root>
</div>
