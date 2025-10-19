export const googleLogin = () => {
  const width = 500
  const height = 600
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  window.open(
    `https://localhost:7249/api/Auth/google-login?returnUrl=${encodeURIComponent(window.location.href)}`,
    'GoogleLoginPopup',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  )
}