<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table/index";
  import { resolve } from "$app/paths";
  import { formatDistance } from "date-fns";
  import { CircleCheck, CircleX } from "@lucide/svelte";
  import type { PageProps } from "./$types";
  import { banSchema } from "../schema";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import { onMount } from "svelte";

  let { data }: PageProps = $props();

  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });

  const form = superForm(data.form, {
    validators: zod4Client(banSchema),
    onSubmit({ formData }) {
      formData.set("uuid", data.player.uuid);
    },
  });

  const { form: formData, enhance } = form;

  let dateValue = $state<DateValue | undefined>();
  let timeValue = $state<string>();

  const expiresAtChange = () => {
    if (dateValue && timeValue) {
      const [hours, minutes, seconds] = timeValue.split(":").map(Number);
      const date = new Date(
        dateValue.year,
        dateValue.month - 1,
        dateValue.day,
        hours,
        minutes,
        seconds,
      );
      $formData.expiresAt = date;
    }
  };

  let contentRef = $state<HTMLElement | null>(null);

  onMount(() => {
    $formData.uuid = data.player.uuid;
  });
</script>

<div class="container mx-auto my-8 px-4">
  <div class="flex flex-col gap-4 md:flex-row">
    <div class="flex w-full flex-col gap-4 md:max-w-[30%] md:flex-[0_0_30%]">
      <Card.Root>
        <Card.Header>
          <Card.Title>Ban Player</Card.Title>
          <Card.Description>Add a Ban</Card.Description>
        </Card.Header>
        <form method="POST" use:enhance>
          <Card.Content>
            <Form.Field {form} name="reason">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Reason</Form.Label>
                  <Input {...props} bind:value={$formData.reason} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
            {#if !$formData.permanent}
              <Form.Field {form} name="expiresAt">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Expiry</Form.Label>
                    <div class="flex flex-row gap-2">
                      <Popover.Root>
                        <Popover.Trigger
                          {...props}
                          class={cn(
                            buttonVariants({
                              variant: "outline",
                              class:
                                "w-[160px] justify-start text-left font-normal",
                            }),
                            !dateValue && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon />
                          {dateValue
                            ? df.format(dateValue.toDate(getLocalTimeZone()))
                            : "Pick a date"}
                        </Popover.Trigger>
                        <Popover.Content
                          bind:ref={contentRef}
                          class="w-auto p-0"
                        >
                          <Calendar
                            type="single"
                            bind:value={dateValue}
                            onchange={expiresAtChange}
                          />
                        </Popover.Content>
                      </Popover.Root>
                      <Input
                        type="time"
                        step="1"
                        class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        bind:value={timeValue}
                        onchange={expiresAtChange}
                      />
                    </div>

                    <Form.FieldErrors />
                    <Input
                      hidden
                      value={$formData.expiresAt}
                      name={props.name}
                    />
                  {/snippet}
                </Form.Control>
              </Form.Field>
            {/if}
            <Form.Field {form} name="permanent">
              <div class="flex flex-row items-start space-x-3 py-4">
                <Form.Control>
                  {#snippet children({ props })}
                    <Checkbox {...props} bind:checked={$formData.permanent} />
                    <Form.Label>Permanent?</Form.Label>
                  {/snippet}
                </Form.Control>
              </div>

              <Form.FieldErrors />
            </Form.Field>
          </Card.Content>
          <Card.Footer class="flex justify-end">
            <Form.Button>Submit</Form.Button>
          </Card.Footer>
        </form>
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
                <Table.Head class="w-[20px]">Expired</Table.Head>
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
                  <Table.Cell class="flex justify-center">
                    {#if !ban.active}
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
      </Card.Root>
    </div>
  </div>
</div>
