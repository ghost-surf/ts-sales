/**
 * Triggers the browser print dialog using a temporary document.title so that
 * "Save as PDF" suggests a filename built from the document being viewed
 * (e.g. client name + document code) instead of the page title.
 */
export function printAs(filename: string) {
  const originalTitle = document.title;
  const safeName = filename.replace(/[\\/:*?"<>|]/g, "-").trim();

  document.title = safeName || originalTitle;

  const restore = () => {
    document.title = originalTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  // Fallback in case the browser doesn't fire `afterprint` reliably.
  setTimeout(restore, 3000);

  window.print();
}
