<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table/index";
  import { formatDistance } from "date-fns";
  import type { PageProps } from "./$types";
  import { resolve } from "$app/paths";
  import type { Warn } from "$lib/types/common";
  import trpc from "$lib/trpc";
  import { Button } from "$lib/components/ui/button/index";
  import { CircleCheck, CircleX } from "@lucide/svelte";
  import { Label } from "$lib/components/ui/label/index";

  let { data }: PageProps = $props();

  let warns = $state<Warn[]>(data.warns);
  let page = $state<number>(1);

  const pageUpdate = async () => {
    const result = await trpc.authed.warns.get.query({
      page: page,
    });

    warns = result;
  };
</script>

<div class="container mx-auto my-8 px-4">
  <Card.Root>
    <Card.Header>
      <Card.Title>Warnings</Card.Title>
      <Card.Description>Warnings issued</Card.Description>
    </Card.Header>
    <Card.Content>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[150px]">Punished</Table.Head>
            <Table.Head class="w-[150px]">Issuer</Table.Head>
            <Table.Head>Reason</Table.Head>
            <Table.Head class="w-[100px]">Issued</Table.Head>
            <Table.Head class="w-[100px] text-right">Expires</Table.Head>
            <Table.Head class="w-[20px]">Expired</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each warns as warn (warn)}
            <Table.Row>
              <Table.Cell
                ><a
                  class="hover:underline"
                  href={resolve(`/panel/player/${warn.warnVictim.uuid}`)}
                  >{warn.warnVictim.name}</a
                ></Table.Cell
              >
              <Table.Cell
                ><a
                  class="hover:underline"
                  href={resolve(
                    `/panel/user/${warn.warnAuthor?.uuid ?? "ghost"}`,
                  )}
                  >{warn.warnAuthor?.username ??
                    warn.warnAuthor?.displayName ??
                    "Ghost"}</a
                ></Table.Cell
              >
              <Table.Cell>{warn.reason}</Table.Cell>
              <Table.Cell
                >{formatDistance(warn.createdAt, new Date(), {
                  addSuffix: true,
                })}</Table.Cell
              >
              <Table.Cell class="text-right"
                >{warn.type === "tempmajor" || warn.type === "tempminor"
                  ? formatDistance(warn.expiresAt, new Date(), {
                      addSuffix: true,
                    })
                  : "Never Expires"}</Table.Cell
              >
              <Table.Cell class="flex justify-center">
                {#if !warn.active}
                  <CircleCheck class="h-5 w-5 text-green-500" />
                {:else}
                  <CircleX class="h-5 w-5 text-red-500" />
                {/if}
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
