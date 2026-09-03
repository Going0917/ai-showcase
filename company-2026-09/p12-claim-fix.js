/*
 * P12「本页要看」修复：原修改包将 div 放在 p 内，浏览器会自动拆分为两段横向内容。
 * 这里在渲染前统一替换为一个合法的段落，保持与其他页面相同的右侧说明样式。
 */
(function fixP12Claim() {
  const overrides = window.PACKAGED_PAGE_OVERRIDES;
  if (!overrides || !overrides[12]) return;

  overrides[12] = overrides[12].replace(
    /<p class="claim-side editable"[^>]*>[\s\S]*?<\/p>/,
    '<p class="claim-side editable">人保留目标、边界与最后判断；AI 承担记忆、整理和持续传递。</p>'
  );
})();
