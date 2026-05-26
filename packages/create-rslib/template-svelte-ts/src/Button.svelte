<script lang="ts">
  type Size = 'small' | 'medium' | 'large'

  interface Props {
    primary?: boolean
    backgroundColor?: string
    size?: Size
    label?: string
    onClick?: () => void
  }

  let {
    primary = false,
    backgroundColor,
    size = 'medium',
    label = 'Demo Button',
    onClick,
  }: Props = $props()

  const mode = $derived(
    primary ? 'demo-button--primary' : 'demo-button--secondary',
  )
</script>

<button
  type="button"
  class={['demo-button', `demo-button--${size}`, mode].join(' ')}
  style:background-color={backgroundColor}
  onclick={onClick}
>
  {label}
</button>

<style>
  .demo-button {
    font-weight: 700;
    border: 0;
    border-radius: 3em;
    cursor: pointer;
    display: inline-block;
    line-height: 1;
  }

  .demo-button--primary {
    color: white;
    background-color: #1ea7fd;
  }

  .demo-button--secondary {
    color: #333;
    background-color: transparent;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
  }

  .demo-button--small {
    font-size: 12px;
    padding: 10px 16px;
  }

  .demo-button--medium {
    font-size: 14px;
    padding: 11px 20px;
  }

  .demo-button--large {
    font-size: 16px;
    padding: 12px 24px;
  }
</style>
