/* 对外脱敏层：保留页面版式和交互，仅替换展示口径并阻断跳转。 */
(function () {
  "use strict";

  const replacements = [
    ["客户消耗掉量诊断 / 赛道掉量排查", "业务异常诊断 / 行业问题排查"],
    ["一个 2–3 天可以整理完的人群数据挖掘需求，因为没有硬 DDL，硬生生把战线拉到了 3 周。", "一个原本可快速完成的分析需求，因缺少明确节点而被反复延后。"],
    ["数十+", "数十"],
    ["70+", "数十"],
    ["377–573", "数百"],
    ["2222 条群消息", "大量沟通信息"],
    ["扫 71 群", "扫描已授权工作信息"],
    ["8/31 真实产出", "示例产出"],
    ["金秋节拓品追击（在投品覆盖仅 16%）", "重点品类机会跟进"],
    ["益生菌品类潜力腰客陪跑，复盘报告输出（呜XXX 室 / 每 XX士 ）+ 万 XX 直播间掉量诊断", "重点客户复盘与业务异常诊断"],
    ["原生内容能力上新 + 实时画面 X 直播覆盖推进", "内容能力建设与场景覆盖推进"],
    ["03 / 10", "阶段一"],
    ["04 / 17", "阶段二"],
    ["06 / 18 → 07 / 17", "阶段三"],
    ["08 月", "阶段四"],
    ["8/21 故障实录", "一次故障复盘"],
    ["7/17 首次回填 一周 大量沟通信息", "一次回填近期沟通信息"],
    ["本场分享与 CDG 提报关键数字", "本场分享与内部提报关键数字"],
    ["71 个工作群", "多个工作群"],
    ["14 间头部直播间", "多场标杆直播"],
    ["20,162 SKU", "多类商品信息"],
    ["10,601 商品", "多类商品"],
    ["5,333 品牌", "多类品牌"],
    ["虎坚果", "某产品"],
    ["万益蓝", "某品牌"],
    ["华大营养", "某客户"],
    ["诺特兰德", "某品牌"],
    ["每XX士", "某客户"],
    ["鹅选", "某平台"],
    ["清凉节", "某营销节点"],
    ["海边直播", "某直播场景"],
    ["晓辉博士", "公开分享者"],
    ["微信 CLI", "沟通信息工具"],
    ["客户私聊", "客户沟通记录"],
    ["微信群", "工作群"],
    ["企微", "工作沟通工具"],
    ["MEMORY.md", "记忆文件"],
    ["prompt.md", "规则文件"],
    ["okr-anchor", "目标文件"],
    ["AData", "能力平台"],
  ];

  function redactText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let value = node.nodeValue;
      replacements.forEach(([from, to]) => { value = value.split(from).join(to); });
      node.nodeValue = value;
    });
  }

  function disableLinks(root) {
    root.querySelectorAll("a").forEach((link) => {
      if (link.hasAttribute("data-preserve-external-link")) return;
      const label = link.textContent;
      const replacement = document.createElement("span");
      replacement.className = `${link.className} case-link-disabled`.trim();
      replacement.textContent = label;
      replacement.setAttribute("aria-label", "公开版已移除资料跳转");
      link.replaceWith(replacement);
    });
  }

  function applyRedaction() {
    redactText(document.body);
    disableLinks(document.body);
  }

  applyRedaction();
  const observer = new MutationObserver(() => applyRedaction());
  observer.observe(document.body, { childList: true, subtree: true });
})();
