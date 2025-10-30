<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  import { splitName } from "$lib/avatar-fallback";
</script>

<div class="container mx-auto my-8 flex flex-col gap-4 px-4">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div class="md:col-span-1">
      <Card.Root>
        <Card.Content>
          <div class="flex flex-col items-center space-y-4">
            <Avatar.Root class="h-32 w-32">
              <Avatar.Fallback class="text-4xl"
                >{splitName(data.player.name)}</Avatar.Fallback
              >
            </Avatar.Root>
            <div class="text-center">
              <h2 class="text-xl font-semibold">{data.player.name}</h2>
              <p class="text-sm text-gray-500">{data.player.platformId}</p>
            </div>
          </div></Card.Content
        >
      </Card.Root>
    </div>
    <div class="md:col-span-2">
      <Card.Root class="h-full">
        <Card.Content>Statistics stuff</Card.Content>
      </Card.Root>
    </div>
  </div>
  <Card.Root>
    <Card.Header>
      <Card.Title>History</Card.Title>
    </Card.Header>
    <Card.Content>Filler here</Card.Content>
  </Card.Root>
</div>
