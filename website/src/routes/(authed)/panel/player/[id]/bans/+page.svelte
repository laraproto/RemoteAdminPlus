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
          <Card.Title>Ban Player</Card.Title>
          <Card.Description>Add a Ban</Card.Description>
        </Card.Header>
        <Card.Content>
          <!-- Insert your form here -->
        </Card.Content>
      </Card.Root>
    </div>
    <div class="flex w-full flex-col gap-4 md:flex-1">
      <Card.Root>
        <Card.Header>
          <Card.Title>Bans</Card.Title>
          <Card.Description>Bans of {data.player.name}</Card.Description>
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
              {#each data.bans as ban (ban)}
                <Table.Row>
                  <Table.Cell>
                    <a
                      class="hover:underline"
                      href={resolve(`/panel/player/${ban.banVictim.uuid}`)}
                      >{ban.banVictim.name}</a
                    >
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      class="hover:underline"
                      href={resolve(
                        `/panel/user/${ban.banAuthor?.uuid ?? "ghost"}`,
                      )}
                      >{ban.banAuthor?.username ??
                        ban.banAuthor?.displayName ??
                        "Ghost"}</a
                    >
                  </Table.Cell>
                  <Table.Cell>{ban.reason}</Table.Cell>
                  <Table.Cell>
                    {formatDistance(ban.createdAt, new Date(), {
                      addSuffix: true,
                    })}
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    {ban.type === "permanent"
                      ? formatDistance(ban.expiresAt, new Date(), {
                          addSuffix: true,
                        })
                      : "Never Expires"}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
