document.addEventListener("DOMContentLoaded", () => {
  const params = new URL(window.location).searchParams;

  document.querySelector(
    "#latest"
  ).textContent = `Applesauce version v${params.get("latest")}`;

  document.querySelector(
    "#current"
  ).textContent = `You are currently using Applesauce version v${params.get(
    "current"
  )}.`;
});
