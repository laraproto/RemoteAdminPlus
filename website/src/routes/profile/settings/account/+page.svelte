<script lang="ts">
  import { getContext } from "svelte";
  import type { User } from "$lib/types/common";
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import Head from "$lib/components/front/Head.svelte";

  const user = getContext<User>("user");
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
