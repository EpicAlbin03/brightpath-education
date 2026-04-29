<script setup lang="ts">
import { ArrowUpIcon } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import TestComponent from "~/components/TestComponent.vue"
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 md:flex-row">
    <Button variant="outline"> Button </Button>
    <Button variant="outline"> Button </Button>
    <Button> Button </Button>
    <Button variant="destructive"> Button </Button>
    <Button variant="secondary"> Button </Button>
    <Button variant="outline" size="icon" aria-label="Submit">
      <ArrowUpIcon />
    </Button>

    <TestComponent />
  </div>
</template>
