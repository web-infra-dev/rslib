<script>
  let { label = 'Demo Button', onclick } = $props();
  let count = $state(0);

  function increment() {
    count++;
    onclick?.(count);
  }
</script>

<button class="demo-button" onclick={increment}>
  {label}: {count}
</button>

<style>
  .demo-button {
    padding: 0.6em 1.2em;
    font-size: 1em;
    border: 1px solid #ff3e00;
    border-radius: 4px;
    background-color: #ff3e00;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .demo-button:hover {
    background-color: #ff5722;
    border-color: #ff5722;
  }

  .demo-button:active {
    transform: scale(0.98);
  }
</style>
