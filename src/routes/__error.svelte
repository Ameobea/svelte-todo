<script context="module" lang="ts">
  import type { ErrorLoad } from '@sveltejs/kit';

  export const load: ErrorLoad = ({ error, status }) => {
    return {
      props: { error, status },
    };
  };
</script>

<script lang="ts">
  export let error: Error;
  export let status: number;
</script>

<div class="root">
  <h1>Custom Error Page</h1>
  <p>Status: {status}</p>

  {#if import.meta.env.DEV}
    <p style="white-space: pre-line;">{error.stack ?? ''}</p>
  {:else}
    <p>Error: {error.message}</p>
  {/if}
</div>

<style lang="scss">
  .root {
    display: flex;
    flex-direction: column;
  }
</style>
