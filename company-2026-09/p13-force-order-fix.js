/* P13：按讲述顺序先讲投放力，再讲经营力。 */
(function reorderP13Forces() {
  const overrides = window.PACKAGED_PAGE_OVERRIDES;
  if (!overrides || !overrides[13]) return;

  const template = document.createElement("template");
  template.innerHTML = overrides[13];
  const forcePairs = template.content.querySelector(".force-pairs");
  if (!forcePairs) return;

  const pairs = Array.from(forcePairs.querySelectorAll(":scope > .force-pair"));
  const delivery = pairs.find((pair) => pair.textContent.includes("投放力"));
  const operation = pairs.find((pair) => pair.textContent.includes("经营力"));
  if (!delivery || !operation) return;

  forcePairs.insertBefore(delivery, operation);
  overrides[13] = template.innerHTML;
})();
