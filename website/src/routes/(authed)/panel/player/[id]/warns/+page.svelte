<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table/index";
  import { resolve } from "$app/paths";
  import { formatDistance } from "date-fns";
  import { CircleCheck, CircleX } from "@lucide/svelte";
  import type { PageProps } from "./$types";
  import { warnSchema } from "../schema";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
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
    validators: zod4Client(warnSchema),
    onSubmit({ formData }) {
      formData.set("uuid", data.player.uuid);
    },
  });

  const { form: formData, enhance } = form;

  const warnType = [
    { value: "tempmajor", label: "Temporary Major" },
    {
      value: "tempminor",
      label: "Temporary Minor",
    },
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
  ];

  const triggerContent = $derived(
    warnType.find((f) => f.value === $formData.type)?.label ?? "Select a type",
  );

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
    if (!$formData.uuid) {
      $formData.uuid = data.player.uuid;
    }
  });
</script>

<div class="container mx-auto my-8 px-4">
  <div class="flex flex-col gap-4 md:flex-row">
    <div class="flex w-full flex-col gap-4 md:max-w-[30%] md:flex-[0_0_30%]">
      <Card.Root>
        <Card.Header>
          <Card.Title>Warn Player</Card.Title>
          <Card.Description>Add a Warning</Card.Description>
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
            <Form.Field {form} name="type">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Type</Form.Label>
                  <Select.Root
                    type="single"
                    bind:value={$formData.type}
                    name={props.name}
                  >
                    <Select.Trigger {...props}>
                      {triggerContent}
                    </Select.Trigger>
                    <Select.Content>
                      {#each warnType as type (type.value)}
                        <Select.Item value={type.value} label={type.label}>
                          {type.label}
                        </Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
            {#if !($formData.type === "major" || $formData.type === "minor")}
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
                <Table.Head class="w-[20px]">Expired</Table.Head>
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
      </Card.Root>
    </div>
  </div>
</div>
