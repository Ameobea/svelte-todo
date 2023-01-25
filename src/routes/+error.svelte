<script lang="ts">
  import { page } from '$app/stores';

  $: error = $page.error;
  $: status = $page.status;
</script>

<div class="root">
  <h1>Custom Error Page</h1>
  <p>Status: {status}</p>

  {#if import.meta.env.DEV}
    <p style="white-space: pre-line;">{error?.message ?? 'No error message'}</p>
  {:else}
    <p>Error: {error?.message}</p>
  {/if}
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }
</style>
