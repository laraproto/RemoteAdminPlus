<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table/index";
  import { formatDistance } from "date-fns";
  import type { PageProps } from "./$types";
  import { resolve } from "$app/paths";
  import type { Player } from "$lib/types/common";
  import trpc from "$lib/trpc";
  import { Button } from "$lib/components/ui/button/index";
  import { Label } from "$lib/components/ui/label/index";

  let { data }: PageProps = $props();

  let players = $state<Player[]>(data.search);
  let page = $state<number>(1);

  const pageUpdate = async () => {
    const result = await trpc.authed.search.get.query({
      page: page,
    });

    players = result;
  };
</script>

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Search</Card.Title>
      <Card.Description>Search for players</Card.Description>
    </Card.Header>
    <Card.Content>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[150px]">Name</Table.Head>
            <Table.Head class="w-[150px]">Platform ID</Table.Head>
            <Table.Head class="w-[100px]">Do Not Track</Table.Head>
            <Table.Head class="w-[100px] text-right">First Joined</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each players as player (player)}
            <Table.Row>
              <Table.Cell>
                <a
                  class="hover:underline"
                  href={resolve(`/panel/player/${player.uuid}`)}
                  >{player.name}</a
                >
              </Table.Cell>
              <Table.Cell>
                {player.platformId}
              </Table.Cell>
              <Table.Cell>{player.doNotTrack ? "Yes" : "No"}</Table.Cell>
              <Table.Cell class="text-right">
                {formatDistance(player.createdAt, new Date(), {
                  addSuffix: true,
                })}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </Card.Content>
    <Card.Footer
      class="flex w-full flex-col items-center gap-4 px-3 py-2 sm:flex-row sm:justify-between"
    >
      <div
        class="flex w-full flex-col justify-center gap-2 sm:w-auto sm:justify-start"
      >
        <Label
          >Search eventually, api stuff is implemented, just no frontend</Label
        >
      </div>
      <div
        class="flex w-full flex-col items-center gap-2 sm:w-auto sm:items-end"
      >
        <div class="flex gap-2">
          <Button
            onclick={() => {
              if (page > 1) {
                page -= 1;
                pageUpdate();
              }
            }}
            disabled={page === 1}
            class="min-w-[120px]"
          >
            Previous Page
          </Button>

          <Button
            onclick={() => {
              page += 1;
              pageUpdate();
            }}
            class="min-w-[120px]"
          >
            Next Page
          </Button>
        </div>

        <p
          class="text-muted-foreground max-w-prose text-center text-xs sm:text-right"
        >
          This doesn't actually know how many pages there are, ran out of time,
          sorry!
        </p>
      </div>
    </Card.Footer>
  </Card.Root>
</div>
