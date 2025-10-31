<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Head from "$lib/components/front/Head.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageData } from "./$types";
  import { schemaCreateServer } from "./schema";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { invalidateAll } from "$app/navigation";

  let { data }: { data: PageData } = $props();

  let token = $state<string>();

  const form = superForm(data.form, {
    validators: zod4Client(schemaCreateServer),
    onUpdated: async ({ form }) => {
      invalidateAll();
      token = form.message;
    },
  });

  const { form: formData, enhance } = form;
</script>

<Head title="Placeholder Settings" />

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Placeholdeeeer</Card.Title>
      <Card.Description>Wawa.</Card.Description>
    </Card.Header>
    <form method="POST" use:enhance>
      <Card.Content>
        {#if token && token !== ""}
          <Alert.Root>
            <CheckCircle2Icon />
            <Alert.Title
              >Server API Token Made, save it as it won't be shown again</Alert.Title
            >
            <Alert.Description>{token}</Alert.Description>
          </Alert.Root>
        {/if}
        <Form.Field {form} name="description">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Description</Form.Label>
              <Input {...props} bind:value={$formData.description} />
            {/snippet}
          </Form.Control>
          <Form.Description>Bruh.</Form.Description>
          <Form.FieldErrors />
        </Form.Field>
      </Card.Content>
      <Card.Footer class="flex justify-end">
        <Form.Button>Submit</Form.Button>
      </Card.Footer>
    </form>
  </Card.Root>
</div>
