<script lang="ts">
  import { getContext } from "svelte";
  import type { User } from "$lib/types/common";
  import * as Card from "$lib/components/ui/card";
  import Head from "$lib/components/front/Head.svelte";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageData } from "./$types";
  import { profileSettingsSchema } from "../schema";
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

<Head title="Account Settings" />

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Your Account</Card.Title>
      <Card.Description>Change your login details from here.</Card.Description>
    </Card.Header>
    <form>
    <Card.Content></Card.Content>
    <Card.Footer class="flex justify-end"></Card.Footer>
    </form>
  </Card.Root>
</div>
