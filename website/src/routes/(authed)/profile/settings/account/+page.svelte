<script lang="ts">
  import { getContext } from "svelte";
  import type { User } from "$lib/types/common";
  import * as Card from "$lib/components/ui/card";
  import Head from "$lib/components/front/Head.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageData } from "./$types";
  import { usernameSchema, emailSchema, passwordSchema } from "../schema";
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

  const formEmail = superForm(data.formEmail, {
    validators: zod4Client(emailSchema),
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
</script>

<Head title="Account Settings" />

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Your Account</Card.Title>
      <Card.Description>Change your login details from here.</Card.Description>
    </Card.Header>
    <Card.Content></Card.Content>
    <Card.Footer class="flex justify-end"></Card.Footer>
  </Card.Root>
</div>
