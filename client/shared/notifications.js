(() => {
  let removalTimer = null;

  function notify(message) {
    let region = document.getElementById("notificationRegion");
    if (!region) {
      region = document.createElement("div");
      region.id = "notificationRegion";
      region.className = "notificationRegion";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-relevant", "additions text");
      document.body.append(region);
    }

    region.replaceChildren();
    const toast = document.createElement("div");
    toast.className = "notificationToast artifact-drop";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    region.append(toast);

    if (removalTimer !== null) window.clearTimeout(removalTimer);
    removalTimer = window.setTimeout(() => {
      toast.classList.add("notificationToastExit");
      window.setTimeout(() => toast.remove(), 180);
    }, 3200);
  }

  window.notify = notify;
})();
