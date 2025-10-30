<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table/index";
  import { resolve } from "$app/paths";
  import { formatDistance } from "date-fns";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="container mx-auto my-8 px-4">
  <div class="flex flex-col gap-4 md:flex-row">
    <div class="flex w-full flex-col gap-4 md:max-w-[30%] md:flex-[0_0_30%]">
      <Card.Root>
        <Card.Header>
          <Card.Title>Warn Player</Card.Title>
          <Card.Description>Add a Warning</Card.Description>
        </Card.Header>
        <Card.Content>
          <!-- Insert your form here -->
        </Card.Content>
      </Card.Root>
    </div>
    <div class="flex w-full flex-col gap-4 md:flex-1">
      <Card.Root>
        <Card.Header>
          <Card.Title>Warnings</Card.Title>
          <Card.Description>Warnings of {data.player.name}</Card.Description>
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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.warns as warn (warn)}
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
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
