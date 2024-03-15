import './button.css'

export const renderButton = () => {
  const button = document.createElement('button')
  button.className = 'button theme-button'
  return button
}
