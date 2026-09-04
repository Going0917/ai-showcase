(function () {
  "use strict";

  const deckData = window.DECK_CONTENT;
  const packagedPageOverrides = window.PACKAGED_PAGE_OVERRIDES || {};
  const isQaSession = new URLSearchParams(window.location.search).has("qa");
  const storageKey = `${deckData.meta.id}:${isQaSession ? "qa-state" : "collaboration-state"}`;

  const els = {
    deck: document.getElementById("deck"),
    progressFill: document.getElementById("progress-fill"),
    counter: document.getElementById("toolbar-counter"),
    prev: document.getElementById("prev-slide"),
    next: document.getElementById("next-slide"),
    edit: document.getElementById("toggle-edit"),
    fontDown: document.getElementById("font-down"),
    fontUp: document.getElementById("font-up"),
    bold: document.getElementById("toggle-bold"),
    resetSlide: document.getElementById("reset-slide"),
    panel: document.getElementById("collab-panel"),
    panelTitle: document.getElementById("panel-title"),
    panelNotes: document.getElementById("panel-notes"),
    panelSources: document.getElementById("panel-sources"),
    panelComments: document.getElementById("panel-comments"),
    closePanel: document.getElementById("close-panel"),
    openNotes: document.getElementById("open-notes"),
    openComments: document.getElementById("open-comments"),
    commentInput: document.getElementById("comment-input"),
    commentQuote: document.getElementById("comment-quote"),
    addComment: document.getElementById("add-comment"),
    commentList: document.getElementById("comment-list"),
    commentCount: document.getElementById("comment-count"),
    slideStatus: document.getElementById("slide-status"),
    drawer: document.getElementById("slide-drawer"),
    slideList: document.getElementById("slide-list"),
    openDrawer: document.getElementById("open-drawer"),
    closeDrawer: document.getElementById("close-drawer"),
    exportPack: document.getElementById("export-pack"),
    importPack: document.getElementById("import-pack"),
    importFile: document.getElementById("import-file"),
    presentMode: document.getElementById("present-mode"),
    toast: document.getElementById("toast"),
    outputSampleModal: document.getElementById("output-sample-modal"),
    outputSampleTitle: document.getElementById("output-sample-title"),
    outputSampleImage: document.getElementById("output-sample-image"),
    closeOutputSample: document.getElementById("close-output-sample"),
  };

  let currentIndex = 0;
  let editMode = false;
  let savedRange = null;
  let selectedQuote = "";
  let saveTimer = null;
  let toastTimer = null;

  const state = loadState();

  const representativeTemplates = {
    1: () => `
      <div class="cover-layout">
        <div>
          <div class="eyebrow editable">公司级 AI 提效实践 · 2026</div>
          <h1 class="cover-title editable">
            <span class="title-line">以 <span class="okr-line">OKR</span> 为圆心的</span>
            <span class="title-line">运营 × AI</span>
            <span class="title-line">协作操作系统</span>
          </h1>
          <p class="cover-question editable">当 AI 已经能帮我干活之后，<br>人的时间应该花在哪里？</p>
        </div>
        <div class="cover-side">
          <p class="cover-subtitle opening-cover-focus editable">一套持续运行的真实实践：<br><strong>人定方向，AI 放大能力</strong></p>
          <div class="cover-proof">
            <div><strong class="editable">非产研</strong><span class="editable">一线运营岗位</span></div>
            <div><strong class="editable">24 周</strong><span class="editable">连续真实运行</span></div>
            <div><strong class="editable">真实业务</strong><span class="editable">客户场景验证</span></div>
          </div>
          <div class="cover-byline editable">goinglin（林丽莹）<br>食品饮料一中心<br>2026 Q2 CDG AI 提效优秀实践</div>
        </div>
      </div>`,

    2: () => `
      <div class="triangle-layout">
        <div class="triangle-head opening-head">
          <div>
            <div class="eyebrow editable">开场 · 运营角色</div>
            <h1 class="slide-title editable">运营不是信息中转站，<br>而是把两端信息变成可复用方案</h1>
          </div>
          <p class="claim-side opening-claim editable">运营的核心价值，是把两端的复杂信息翻译成可执行、可复用、可产品化的方案。</p>
        </div>
        <div class="triangle-body">
          <div class="role-network">
            <div class="network-node customer editable"><strong>客户</strong><span>经营目标 · 日常投放问题</span></div>
            <div class="network-link top">↕</div>
            <div class="network-node sales editable"><strong>销售</strong><span>收入目标 · 客情关系</span></div>
            <div class="network-center editable"><strong>我的角色</strong><strong>行业运营</strong><span>提炼 · 翻译 · 落地</span></div>
            <div class="network-link bottom">↕</div>
            <div class="network-node rd editable"><strong>中台产品 / 运营 / 研发</strong><span>平台能力 · 工具规则</span></div>
          </div>
          <div class="operator-card operator-two-track">
            <div class="operator-title editable">运营的两条工作线</div>
            <div class="role-track internal">
              <div><span class="role-track-tag editable">对内 · 重要不紧急</span><strong class="editable">把反复痛点变成通用解法</strong></div>
              <p class="editable">识别反复出现的客户痛点与提收机会点，提炼共性，再推动成产品能力与行业方案。</p>
            </div>
            <div class="role-track external">
              <div><span class="role-track-tag editable">对外 · 高频有时限</span><strong class="editable">把复杂能力变成客户动作</strong></div>
              <p class="editable">把工具、政策和平台规则翻译成生意影响，以及客户今天能执行的动作。</p>
            </div>
            <div class="operator-foot editable">同一个岗位，同时承受即时响应与长期建设两种节奏。</div>
          </div>
        </div>
      </div>`,

    3: () => `
      <div class="quadrant-layout">
        <div class="quadrant-head opening-head">
          <div>
            <div class="eyebrow editable">开场 · 真正的冲突</div>
            <h1 class="slide-title editable">每天都很忙，<br>但核心目标仍可能没有推进</h1>
          </div>
          <p class="claim-side opening-claim editable">紧急事项不断进入，重要但不紧急的目标最容易被推迟。</p>
        </div>
        <div class="quadrant-body workload-body">
          <div class="workload-split">
            <article class="workload-column urgent-core">
              <div class="workload-share editable">40%</div>
              <div class="workload-label editable">紧急且重要</div>
              <ul>
                <li class="editable">客户消耗掉量诊断 / 赛道掉量排查</li>
                <li class="editable">关键客户复盘</li>
                <li class="editable">周会 / 双周会 / 月会</li>
              </ul>
              <p class="workload-pain editable"><strong>痛点：</strong>时间有限时，输出深度容易受影响</p>
              <span class="workload-ai editable">AI价值：压缩诊断与交付时间</span>
            </article>
            <article class="workload-column urgent-routine">
              <div class="workload-share editable">30%</div>
              <div class="workload-label editable">紧急 · 相对不重要</div>
              <ul>
                <li class="editable">扶持政策 / 产品能力覆盖通知</li>
                <li class="editable">客户例行报表与临时取数</li>
                <li class="editable">老板临时提问</li>
              </ul>
              <p class="workload-pain editable"><strong>痛点：</strong>经常面临加塞，打断原来的工作计划</p>
              <span class="workload-ai editable">AI价值：自动整理与重复传递</span>
            </article>
            <article class="workload-column long-term">
              <div class="workload-share editable">30%</div>
              <div class="workload-label editable">重要但不紧急</div>
              <ul>
                <li class="editable"><strong>赛道方法论 / 行业解决方案</strong></li>
                <li class="editable"><strong>重点能力建设</strong>：持续推动内部产品与研发</li>
                <li class="editable">把经验沉淀成团队可复用的能力</li>
              </ul>
              <p class="workload-pain editable"><strong>痛点：</strong>没有硬 DDL，最容易被一再推迟</p>
              <span class="workload-ai editable">AI价值：保护推进并帮助做深</span>
            </article>
          </div>
          <div class="workload-proof editable"><strong>真实后果</strong><span>一个 2–3 天可以整理完的人群数据挖掘需求，因为没有硬 DDL，硬生生把战线拉到了 3 周。</span><em>占比为工作结构估算，并非工时系统精确统计</em></div>
        </div>
      </div>`,

    5: () => `
      <div class="part-overview-layout">
        <div class="part-overview-head opening-head">
          <div>
            <div class="eyebrow editable">Part A · 对内不偏航：搭建路线图一览</div>
            <h1 class="slide-title editable">让 AI 围绕目标持续理解我，<br>并在实战中持续迭代</h1>
          </div>
          <p class="claim-side opening-claim editable">从工作超载到最小底座，再到早晚闭环：这一部分详细回答个人工作系统怎样真正跑起来，如何让 AI 介入工作流。</p>
        </div>
        <div class="part-route">
          <article class="route-step"><span>01</span><strong class="editable">为什么做</strong><p class="editable">工作量级为何需要外脑</p></article>
          <i>→</i>
          <article class="route-step"><span>02</span><strong class="editable">怎么搭建</strong><p class="editable">目标、记忆与读写机制</p></article>
          <i>→</i>
          <article class="route-step"><span>03</span><strong class="editable">如何生长</strong><p class="editable">在真实摩擦中持续升级</p></article>
          <i>→</i>
          <article class="route-step"><span>04</span><strong class="editable">早上怎么跑</strong><p class="editable">看全貌，再做取舍</p></article>
          <i>→</i>
          <article class="route-step"><span>05</span><strong class="editable">晚上怎么收</strong><p class="editable">归档、校验与复用</p></article>
        </div>
        <div class="part-overview-close editable">可复制路线：先建立目标与记忆 → 再让信息自动进入 → 最后跑通早晚闭环</div>
      </div>`,

    6: () => `
      <div class="diagnostic-layout">
        <div class="diagnostic-head opening-head">
          <div>
            <div class="eyebrow editable">Part A · 对内不偏航：为什么需要外脑</div>
            <h1 class="slide-title editable">我需要的不是另一个待办工具，<br>而是一个能理解上下文的外脑</h1>
          </div>
          <p class="claim-side opening-claim editable">信息量超过大脑容量是每天的痛点；更深的瓶颈是知识和判断标准没有持续进入上下文。</p>
        </div>
        <div class="diagnostic-body">
          <div class="reality-panel">
            <div class="small-label editable">没有 AI 托底时的工作现实</div>
            <div class="reality-stats">
              <div class="reality-stat"><strong class="editable">数十</strong><span class="editable">个核心工作源（群 / 私聊）</span></div>
              <div class="reality-stat wide"><strong class="editable">数百</strong><span class="editable">单日消息量级</span></div>
              <div class="reality-stat"><strong class="editable">21</strong><span class="editable">周核心待办</span></div>
              <div class="reality-stat"><strong class="editable">23</strong><span class="editable">周延续事项</span></div>
            </div>
            <div class="reality-result editable"><strong>靠脑子记 + 凭记忆推进事项</strong><span><strong>核心痛点：</strong>被一件又一件待办事项推着走，重要的事情存在遗漏和进展风险。</span></div>
          </div>
          <div class="diag-panel compact">
            <div class="diag-panel-head"><span class="small-label">AI 已进入流程后的 3/9 诊断</span><span class="diag-date editable">2026-03-09</span></div>
            <div class="diag-bars">
              <div class="diag-row"><span class="diag-name editable">流程拆解</span><div class="diag-bar"><i style="width:82%"></i></div><strong class="editable">82</strong></div>
              <div class="diag-row"><span class="diag-name editable">SKILL 定义</span><div class="diag-bar"><i style="width:80%"></i></div><strong class="editable">80</strong></div>
              <div class="diag-row"><span class="diag-name editable">Prompt 设计</span><div class="diag-bar"><i style="width:65%"></i></div><strong class="editable">65</strong></div>
              <div class="diag-row"><span class="diag-name editable">知识体系</span><div class="diag-bar mid"><i style="width:60%"></i></div><strong class="editable">60</strong></div>
              <div class="diag-row"><span class="diag-name editable">输出一致性</span><div class="diag-bar weak"><i style="width:50%"></i></div><strong class="editable">50</strong></div>
            </div>
            <div class="diag-quote editable">会做还不够：知识与质量机制才是瓶颈</div>
            <div class="diag-action editable"><strong>诊断结论</strong>：先补长期记忆与质量机制，再谈更多工具和功能。</div>
          </div>
        </div>
      </div>`,

    8: () => `
      <div class="starter-proof-layout">
        <div class="starter-head">
          <div>
            <div class="eyebrow editable">Part A · 你回去怎么搭</div>
            <h1 class="slide-title editable">三件套起步，三条建议让它更懂你</h1>
          </div>
          <p class="claim-side editable">不用复制完整系统：一小时先跑起来，再靠信息来源、Memory 设定和红线机制持续养它。</p>
        </div>
        <div class="starter-proof-body">
          <section class="starter-actions">
            <div class="section-kicker editable">一小时最小启动 · 三件套</div>
            <article class="starter-action">
              <span class="starter-index">01</span>
              <div><h3 class="editable">建一份每日工作日志</h3><p class="editable">专属工作区 ＋ 一天一篇：今天做了什么、发现什么规律。</p></div>
              <strong class="editable">事实</strong>
            </article>
            <article class="starter-action">
              <span class="starter-index">02</span>
              <div><h3 class="editable">写一份目标文件</h3><p class="editable">季度 OKR 与 KR 逐条编号——AI 判断优先级的唯一尺子。</p></div>
              <strong class="editable">方向</strong>
            </article>
            <article class="starter-action">
              <span class="starter-index">03</span>
              <div><h3 class="editable">亲手写下个人红线</h3><p class="editable">什么不能交给 AI、什么不能外发；只有本人能改。</p></div>
              <strong class="editable">边界</strong>
            </article>
          </section>
          <aside class="starter-evidence">
            <div class="section-kicker editable">三条延伸建议</div>
            <div class="evidence-item"><span class="evidence-no">A</span><div><h3 class="editable">明确信息来源</h3><p class="editable">给 AI 足够上下文：你的 Prompt 记录 ＋ 微信（沟通信息工具）＋ 工作沟通工具（智能助理大圆），其余口头补充。</p></div></div>
            <div class="evidence-item"><span class="evidence-no">B</span><div><h3 class="editable">完善 Memory 设定</h3><p class="editable">告诉 AI 你的 OKR、你是谁、你的目标与职责——它所有工作才能真正为你服务。</p></div></div>
            <div class="evidence-item"><span class="evidence-no">C</span><div><h3 class="editable">设立红线与审核机制</h3><p class="editable">让 AI 从你的 Prompt 词与偏好中反推偏好，实现自我审查与自我优化调整。</p></div></div>
          </aside>
        </div>
        <div class="starter-growth-rule">
          <span class="small-label accent-text">剩下的层会长出来</span>
          <p class="editable">习惯与踩坑不用第一天写——同一句纠正说到第 <strong>3</strong> 次，再固化成带来源的规则。</p>
        </div>
      </div>`,

    9: () => `
      <div class="leap-layout">
        <div class="leap-head">
          <div>
            <div class="eyebrow editable">Part A · 四次真实升级</div>
            <h1 class="slide-title editable">系统不是设计出来的，<br>而是在四次真实摩擦中长出来的</h1>
          </div>
          <p class="claim-side editable">系统成熟不是功能堆叠：每解决一个真实摩擦，才补一层可复用机制。</p>
        </div>
        <div class="leap-track">
          <article class="leap-node">
            <span class="leap-date editable">03 / 10</span>
            <span class="leap-friction editable">摩擦：AI 每次从零开始</span>
            <h3 class="editable">记忆底座</h3>
            <p class="editable">诊断次日把画像、习惯与纠错写进 记忆文件——系统第一次能记住我是谁。</p>
          </article>
          <article class="leap-node">
            <span class="leap-date editable">04 / 17</span>
            <span class="leap-friction editable">摩擦：有优先级，但判断依据与实际 OKR 脱钩</span>
            <h3 class="editable">OKR 锚点</h3>
            <p class="editable">目标独立成文件，早晚自动化首跑——判断优先级第一次有了 OKR 依据。</p>
          </article>
          <article class="leap-node milestone">
            <span class="leap-date editable">06 / 18 → 07 / 17</span>
            <span class="leap-friction editable">摩擦：每天手动口述进展</span>
            <h3 class="editable">自动扫描 &amp; 总结<span class="leap-badge">关键进展</span></h3>
            <p class="editable">沟通信息工具 自动扫描工作群 &amp; 客户沟通记录 → 自动写入新待办、自动更新进展；7/17 首次回填 大量沟通信息。</p>
            <a class="leap-link" href="#" target="_blank" rel="noreferrer">github.com/huohuoer/wechat-cli</a>
          </article>
          <article class="leap-node current">
            <span class="leap-date editable">08 月</span>
            <span class="leap-friction editable">摩擦：自动化也会失效</span>
            <h3 class="editable">可诊断 · 可修复</h3>
            <p class="editable">配置异常 + 任务定义受损；靠日志反推并完成重建。</p>
          </article>
        </div>
        <div class="leap-incident">
          <span class="small-label accent-text">8/21 故障实录</span>
          <p class="editable">出差期间自动化静默失效：配置异常、任务定义受损。<strong>靠日志反推故障窗口并补跑流程——系统坏了，记录还在，就能重建。</strong></p>
        </div>
      </div>`,

    10: () => `
      <div class="pipeline-layout">
        <div class="pipeline-head">
          <div>
            <div class="eyebrow editable">Part A · 每天早上</div>
            <h1 class="slide-title editable">每天早上：先看全貌，<br>再决定今天真正做什么</h1>
          </div>
          <p class="claim-side editable">AI 先给全貌和优先级建议，人再决定今天真正做什么。</p>
        </div>
        <div class="pipeline-body">
          <div class="pipeline-left">
            <div class="flow-rail">
              <div class="rail-phase">
                <div class="rail-phase-head"><span class="rail-time">08:00</span><strong class="editable">群扫描 · morning</strong><span class="rail-tool">沟通信息工具</span></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">扫 71 群 &amp; 客户沟通记录 → 粗筛出 a 类对客线索 + b 类四力待办 + 方向信号</p><span class="rail-src editable">来源：圈定工作群 &amp; 客户沟通记录</span></div></div>
              </div>
              <div class="rail-phase">
                <div class="rail-phase-head"><span class="rail-time">08:30</span><strong class="editable">晨间规划 · Mode I（4 步）</strong></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">读锚点，圈定今天的判断尺子</p><span class="rail-src editable">读取：目标文件 四力v2 + Q3 需求待办</span></div></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">合并群扫描产出 + 昨日未完事项 + DDL</p><span class="rail-src editable">读取：群扫描 morning 提炼 + 昨日 memory 日志</span></div></div>
                <div class="rail-step"><span class="rail-dot lime"></span><div class="rail-body"><p class="editable">输出今日 3 件事（带四力 / KR 标签）→ 落盘 + Git 推送</p><span class="rail-src editable">写入：memory/日期-morning.md</span></div></div>
              </div>
            </div>
          </div>
          <div class="p0-card morning-overview-card">
            <div class="p0-card-head"><span class="small-label">8/31 真实产出 · 今日 3 件事</span><span class="p0-tag editable">FROM OKR</span></div>
            <div class="p0-real-list">
              <div class="p0-real p0"><div class="p0-real-top"><strong class="editable">P0</strong><span class="p0-force editable">商品力 · 品KR2</span></div><p class="editable">金秋节拓品追击（在投品覆盖仅 16%）</p></div>
              <div class="p0-real p0"><div class="p0-real-top"><strong class="editable">P0</strong><span class="p0-force editable">内容力 · 内KR2</span></div><p class="editable">3 条违规集中跟进（多燕瘦 / 每日博士 / 贝卡罗莱）</p></div>
              <div class="p0-real"><div class="p0-real-top"><strong class="editable">P1</strong><span class="p0-force editable">内容力 · 内KR4</span></div><p class="editable">原生内容上新 + 实时画面 X 直播确认</p></div>
            </div>
            <div class="p0-boundary editable"><strong><span class="hl-lime">AI 提供全貌与建议</span>，<span class="hl-lime">不替人做最后取舍</span>。</strong>价值是<span class="hl-lime">避免遗漏</span>；人可以调整，但能看见调整与目标之间的关系。</div>
          </div>
        </div>
        <button class="output-sample-link" type="button" data-output-sample="assets/shot-morning-planning-output.png" data-output-title="晨间规划 · 实际输出样例">查看实际输出样例 <span aria-hidden="true">↗</span></button>
      </div>`,

    11: () => `
      <div class="compound-layout">
        <div class="compound-head">
          <div>
            <div class="eyebrow editable">Part A · 每天晚上</div>
            <h1 class="slide-title editable">每天晚上：自动归档进展，<br>顺手生成明天与汇报的原料</h1>
          </div>
          <p class="claim-side editable">晚上把事实写回系统：更新任务、检查遗漏，也为明天与汇报留下证据。</p>
        </div>
        <div class="compound-body">
          <div class="compound-left">
            <div class="flow-rail">
              <div class="rail-phase">
                <div class="rail-phase-head"><span class="rail-time">18:00</span><strong class="editable">群扫描 · evening</strong><span class="rail-tool">沟通信息工具</span></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">扫全天增量 → 完成事项、关键变化、新需求</p><span class="rail-src editable">来源：全天工作群 &amp; 客户沟通记录</span></div></div>
              </div>
              <div class="rail-phase">
                <div class="rail-phase-head"><span class="rail-time">21:00</span><strong class="editable">晚间归档 · Mode J（4 步）</strong></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">日志检查：缺了就反推补建</p><span class="rail-src editable">读取：规则文件 + git commits + 群扫描 morning/evening</span></div></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">按四力分区更新任务状态与 KR 标签</p><span class="rail-src editable">读取：目标文件 四力v2 + Q3 需求待办</span></div></div>
                <div class="rail-step"><span class="rail-dot"></span><div class="rail-body"><p class="editable">回写群扫描 evening 的 b 类进展 + 新需求 DDL</p><span class="rail-src editable">写入：Q3 需求待办（四力归类）</span></div></div>
                <div class="rail-step"><span class="rail-dot lime"></span><div class="rail-body"><p class="editable">生成明日清单 → Git 推送 + J-1/J-2/J-3 校验</p><span class="rail-src editable">校验：完成态 / 明日高优 / 新需求追 DDL</span></div></div>
              </div>
            </div>
          </div>
          <div class="compound-right">
            <div class="reuse-case">
              <span class="small-label accent-text">复用案例 · 双周报 3.0</span>
              <p class="editable">同一份日志，直接喂给「双周报 3.0」Skill——<strong>不用再从零回忆两周做了什么</strong>。</p>
              <div class="case-flow">
                <div class="case-node editable"><b>读原料</b>近两周 memory 日志 + 群扫描提炼</div>
                <div class="case-arrow">↓</div>
                <div class="case-node editable"><b>按标签归类</b>四力 / KR 标签自动对齐双周报矩阵</div>
                <div class="case-arrow">↓</div>
                <div class="case-node accent editable"><b>自动成稿</b>填入双周报 3.0「todo / 工作进展」列</div>
              </div>
              <div class="reuse-tri editable"><strong>短期</strong>明日直接接续 · <strong>中期</strong>双周报/月报按标签回收 · <strong>长期</strong>本场分享与 CDG 提报关键数字全部检索自日志，不靠回忆</div>
            </div>
          </div>
        </div>
        <button class="output-sample-link" type="button" data-output-sample="assets/shot-evening-scan-output.png" data-output-title="群扫描 · 晚间实际输出样例">查看实际输出样例 <span aria-hidden="true">↗</span></button>
      </div>`,

    4: () => `
      <div class="dual-map-layout">
        <div class="dual-map-head opening-head">
          <div>
            <div class="eyebrow editable">全场导航 · 两个问题</div>
            <h1 class="slide-title editable">今天只讲两件事：<br>对内不偏航，对外把业务做深</h1>
          </div>
          <p class="claim-side opening-claim editable">Part A 解决不漏事、不偏航；Part B 解决把业务做深、把经验复用。</p>
        </div>
        <div class="dual-lines">
          <section class="dual-line a">
            <div class="dual-number">A</div>
            <h3 class="editable">对内 · 如何让 AI<br><span class="blue-highlight">长期围绕目标工作</span></h3>
            <ul class="dual-bullets">
              <li class="editable">工作目标、日志与红线进入同一个上下文</li>
              <li class="editable">晨间取舍、晚间写回，持续形成闭环</li>
            </ul>
          </section>
          <div class="dual-divider"></div>
          <section class="dual-line b">
            <div class="dual-number">B</div>
            <h3 class="editable">对客 · 如何把经验<br><span class="highlight">变成可复用能力</span></h3>
            <ul class="dual-bullets">
              <li class="editable">把经验拆成 AI 可执行、可纠错的流程</li>
              <li class="editable">从商品、内容、经营与投放四个维度借助 AI 深挖应用</li>
            </ul>
          </section>
        </div>
        <div class="dual-map-close editable">OKR 给方向，AI 给杠杆</div>
      </div>`,

    7: () => `
      <div class="memsys-layout">
        <div class="co-brain-head">
          <div>
            <div class="eyebrow editable">Part A · 我的记忆系统</div>
            <h1 class="slide-title editable">照搬五层架构，长成我的记忆系统</h1>
          </div>
          <p class="claim-side editable">参考什么 → 有什么好处 → 长什么样</p>
        </div>
        <div class="memsys-mid">
          <section class="memsys-ref">
            <div class="memsys-block-head"><span class="q-badge">Q1</span><strong class="editable">参考了什么思路</strong></div>
            <p class="editable">照搬公开指南《个人 AI 记忆系统构建指南》，再<strong>结合运营业务改造</strong>。</p>
            <div class="memsys-guide-shots">
              <div class="shot-frame guide-shot"><img src="assets/shot-memory-guide-prompt.png" alt="指南原文：搭建记忆系统的参考 Prompt" loading="lazy"></div>
              <div class="shot-frame guide-shot"><img src="assets/shot-memory-guide-overview.png" alt="指南原文：五层记忆架构总览" loading="lazy"></div>
            </div>
            <div class="memsys-coldstart editable"><strong>冷启动一次性投入：</strong>AI 通读 100+ 条 Prompt（832 行）＋ 2 天日志 ＋ 9 Skill / 3 Rule。</div>
          </section>
          <section class="memsys-benefits">
            <div class="memsys-block-head"><span class="q-badge">Q2</span><strong class="editable">有什么好处</strong></div>
            <div class="benefit-row"><b class="editable">越用越好</b><span class="editable">不是一次性工具，是持续增值的资产——纠错 6→13 条</span></div>
            <div class="benefit-row"><b class="editable">冷启动后复利</b><span class="editable">它更懂你，同样任务交付更好——首版通过率 30%→60–70%</span></div>
            <div class="benefit-row"><b class="editable">可迁移不锁定</b><span class="editable">记忆库是自己的——谁家模型好换谁，画像不丢（150+ 纯文本）</span></div>
          </section>
        </div>
        <div class="memsys-table">
          <div class="memsys-block-head"><span class="q-badge">Q3</span><strong class="editable">长什么样：五层落地形态 × 存储地图（合并视图）</strong></div>
          <div class="mem-table">
            <div class="mem-tr mem-th"><span>层级 · 存什么</span><span>真实形态 · 迭代频率</span><span>谁写 → 谁读</span><span>是不是必须</span></div>
            <div class="mem-tr">
              <span class="mem-layer editable">① 状态层 · 当前对话上下文</span><span class="editable">AI 工具会话自带 · 零维护</span><span class="editable">系统自动管 → 无需额外维护</span><span class="mem-req editable">不用管</span>
            </div>
            <div class="mem-tr must">
              <span class="mem-layer editable">② 情境层 · 每天发生了什么</span><span class="editable"><b>156 个文件</b>（81 日志＋48 规划＋42 群提炼）· 每天在长</span><span class="editable">AI 自动写 · 早晚各一次 → 晨间规划当输入，汇报时读</span><span class="mem-req yes editable">必须 · 第一件要建</span>
            </div>
            <div class="mem-tr">
              <span class="mem-layer editable">③④ 行为＋认知层 · 习惯与踩坑</span><span class="editable"><b>22 条</b>习惯约定 ＋ <b>13 条纠错库</b> · 跑起来后生长</span><span class="editable">AI 起草 · 我审核 → 接任务前先读</span><span class="mem-req editable">不必第一天写</span>
            </div>
            <div class="mem-tr must">
              <span class="mem-layer editable">⑤ 核心层 · 价值观与红线</span><span class="editable"><b>17 条</b> · 几乎零修改（3/10 写完没动过）</span><span class="editable">只有我能写 → 判断「该不该做」时读</span><span class="mem-req yes editable">必须 · 一次亲手写完</span>
            </div>
            <div class="mem-tr must goal">
              <span class="mem-layer editable">⑥ 目标模块（刻意独立）· 当期目标</span><span class="editable"><b>独立规则文件</b> · 变化最快：5 个月 4 次大改</span><span class="editable">一起定 · 季度更新 → 判优先级必读</span><span class="mem-req yes editable">必须 · 唯一依据</span>
            </div>
          </div>
        </div>
      </div>`,

    12: () => `
      <div class="part-summary-layout">
        <div class="part-summary-head">
          <div>
            <div class="eyebrow editable">Part A · 这一部分带走什么</div>
            <h1 class="slide-title editable">AI 不只是列清单，<br>更要让工作不漏事、不偏航、能复用</h1>
          </div>
          <p class="claim-side editable">人保留目标、边界与最后判断；AI 承担记忆、整理和持续传递。</p>
        </div>
        <div class="summary-loop">
          <article><span>01</span><strong class="editable">OKR 定方向</strong><p class="editable">所有优先级有同一锚点</p></article><i>→</i>
          <article><span>02</span><strong class="editable">信息自动进入</strong><p class="editable">减少手动口述与遗漏</p></article><i>→</i>
          <article><span>03</span><strong class="editable">晨间看全貌</strong><p class="editable">由人完成当天取舍</p></article><i>→</i>
          <article><span>04</span><strong class="editable">晚间写回</strong><p class="editable">让明天与汇报直接复用</p></article>
        </div>
        <div class="summary-values">
          <div class="editable"><strong>不遗漏</strong><span>信息与待办有入口</span></div>
          <div class="editable"><strong>不偏航</strong><span>每天都能看见核心目标</span></div>
          <div class="editable"><strong>可复用</strong><span>做过的事不再从零回忆</span></div>
        </div>
        <div class="summary-transition editable">Part A 先建立目标、上下文与纠错机制 → Part B 把这套机制带进真实客户业务，让人专注问题定义与策略判断</div>
      </div>`,

    14: () => `
      <div class="capability-layout capability-v3">
        <div class="capability-head">
          <div>
            <div class="eyebrow editable">Part B · 投放力全貌</div>
            <h1 class="slide-title editable">两种 AI 优势，<br>支撑投放应用逐层做深</h1>
          </div>
          <p class="claim-side editable">计算力让分析跑得更快、更全；业务理解力让判断标准能够持续沉淀和复用。</p>
        </div>
        <section class="ai-advantage-band">
          <div class="capability-band-label editable">AI 能力 · 两大本质优势</div>
          <div class="ai-advantages">
            <article class="ai-advantage-card compute">
              <span class="ai-advantage-no">01</span>
              <div><h3 class="editable">极致的数据计算力</h3><p class="editable">多源取数、维度切换、交叉验证与大表清洗；复盘从人工 4–5 小时压缩到约 10 分钟，分析维度从 3–5 维扩展到 13 维。</p></div>
            </article>
            <article class="ai-advantage-card knowledge">
              <span class="ai-advantage-no">02</span>
              <div><h3 class="editable">可被教会的业务理解力</h3><p class="editable">把指标口径、ROI 出价逻辑、链路特性和归因边界写成 Rule，让 AI 逐步具备一线运营的判断标准。</p></div>
            </article>
          </div>
        </section>
        <div class="capability-derive editable"><span>能力叠加</span><i>↓</i><strong>从稳定执行，走向灵活判断与新方法共创</strong></div>
        <section class="application-growth">
          <div class="capability-band-label editable">应用逻辑 · 三层递进</div>
          <div class="application-ladder">
            <article class="application-step level-1">
              <div class="application-step-top"><span>01</span><em class="editable">基础层 · 稳定重复</em></div>
              <h3 class="editable">常规 Skill 的沉淀</h3>
              <p class="editable">把客户复盘、掉量排查、日报周报等高频工作，固化成框架清楚、可以验收的标准流程。</p>
              <div class="application-key editable"><b>能力落点</b>业务规则可沉淀，重复任务可稳定执行</div>
            </article>
            <i class="application-arrow">→</i>
            <article class="application-step level-2">
              <div class="application-step-top"><span>02</span><em class="editable">调用层 · 灵活适配</em></div>
              <h3 class="editable">单客户的灵活调用</h3>
              <p class="editable">沿用同一套 Skill，但根据客户阶段、数据规模和主要矛盾，重新组合维度并判断真正的问题。</p>
              <div class="application-key editable"><b>能力落点</b>计算框架可复用，分析问题随客户而变</div>
            </article>
            <i class="application-arrow">→</i>
            <article class="application-step level-3">
              <div class="application-step-top"><span>03</span><em class="editable">共创层 · 生成新方法</em></div>
              <h3 class="editable">深度应用</h3>
              <p class="editable">人定义业务痛点、分析维度与验收标准；AI 前置处理复杂计算，共同长出新的分析方法。</p>
              <div class="application-key editable"><b>能力落点</b>极致计算力 × 业务理解力，产出新洞察</div>
            </article>
          </div>
        </section>
      </div>`,

    13: () => `
      <div class="four-forces-layout">
        <div class="four-forces-head">
          <div>
            <div class="eyebrow editable">Part B · 四力全景</div>
            <h1 class="slide-title editable">客户的四个问题没变，<br>变化的是我们能回答多深</h1>
          </div>
          <p class="claim-side editable">商品、内容、经营和投放不是四个独立工具，而是同一个经营目标下的四个连续问题。</p>
        </div>
        <div class="force-pair-matrix">
          <aside class="perspective-rail" aria-label="两种业务视角">
            <div class="perspective-label customer"><span>客户视角</span><strong class="editable">客户在问什么？</strong></div>
            <div class="perspective-shift" aria-hidden="true">↓</div>
            <div class="perspective-label advertising"><span>广告视角</span><strong class="editable">我们怎样回答？</strong></div>
          </aside>
          <div class="force-pairs">
            <article class="force-pair">
              <div class="force-question"><span class="force-power-name editable">商品力</span><p class="editable">卖什么商品？</p></div>
              <div class="force-pair-arrow" aria-hidden="true">↓</div>
              <div class="force-answer"><div class="force-answer-copy"><p class="editable">看清大盘的潜力品和爆品</p><div class="force-offerings editable"><span>为商家提供：</span><b>爆品榜单，引导商家跟品</b><b>针对平台的开品建议</b></div></div><div class="effort-line e10"><strong class="editable">5–10%</strong><i></i></div></div>
            </article>
            <article class="force-pair">
              <div class="force-question"><span class="force-power-name editable">内容力</span><p class="editable">用什么素材转化？<br>直播话术怎么讲？</p></div>
              <div class="force-pair-arrow" aria-hidden="true">↓</div>
              <div class="force-answer"><div class="force-answer-copy"><p class="editable">提炼跑量内容的共性</p><div class="force-offerings editable"><span>为商家提供：</span><b>爆量素材洞察、素材制作建议</b><b>人货场话术建议</b></div></div><div class="effort-line e30"><strong class="editable">约 30%</strong><i></i></div></div>
            </article>
            <article class="force-pair">
              <div class="force-question"><span class="force-power-name editable">经营力</span><p class="editable">生意经营如何布局？</p></div>
              <div class="force-pair-arrow" aria-hidden="true">↓</div>
              <div class="force-answer"><div class="force-answer-copy"><p class="editable">经营触点诊断与建议</p></div><div class="effort-line e10"><strong class="editable">5–10%</strong><i></i></div></div>
            </article>
            <article class="force-pair focus">
              <div class="force-question"><span class="force-power-name editable">投放力</span><p class="editable">怎么投放，投产好且拿量？</p></div>
              <div class="force-pair-arrow" aria-hidden="true">↓</div>
              <div class="force-answer"><div class="force-answer-copy"><p class="editable">投放工具使用策略与建议</p><div class="force-offerings editable"><span>为商家提供：</span><b>产品能力使用指引</b><b>流量位 / 能力策略</b></div></div><div class="effort-line e60"><strong class="editable">50–60%</strong><i></i></div></div>
            </article>
          </div>
        </div>
        <div class="forces-close editable">讲述从最结构化的投放力切入，再展开内容力、经营力与商品力，最后回到整体整合。</div>
      </div>`,

    15: () => `
      <div class="five-steps-layout">
        <div class="five-steps-head">
          <div>
            <div class="eyebrow editable">投放力 · 阶段一：流程化</div>
            <h1 class="slide-title editable">Skill 的门槛不是写 Prompt，<br>而是把经验说清楚</h1>
          </div>
          <p class="claim-side editable">工作经验是原料，人工验收是终点，也是下一轮迭代的起点。</p>
        </div>
        <div class="five-steps-body">
          <div class="steps-column">
            <div class="step-row"><span class="step-num">01</span><div><strong class="editable">从重复工作切入</strong><p class="editable">客户复盘、日报、周报、月报：高频、有框架、结果能验收。</p></div></div>
            <div class="step-row key"><span class="step-num">02</span><div><strong class="editable">先梳理自己的分析逻辑 <em class="step-badge editable">最依赖经验</em></strong><p class="editable">明确分析目标、展开维度、判断口径和最终交付标准。</p></div></div>
            <div class="step-row key"><span class="step-num">03</span><div><strong class="editable">喂业务知识，磨合成 Skill <em class="step-badge editable">允许出错</em></strong><p class="editable">把客观知识、计算规则和纠错持续写回，让下一次不再重犯。</p></div></div>
            <div class="step-row key"><span class="step-num">04</span><div><strong class="editable">人工验收并反哺 <em class="step-badge editable">判断不可替代</em></strong><p class="editable">不同客户要的结论与可用性不同；人决定取舍，并把经验写回规则。</p></div></div>
          </div>
          <div class="correction-card">
            <div class="correction-head"><span class="small-label">验收拦下的真实案例 · 某客户 2/27</span><span class="diag-date editable">掉量 -25%</span></div>
            <div class="correction-flow">
              <div class="correction-step wrong">
                <span class="correction-tag editable">V1 误判</span>
                <p class="editable">AI 首版结论：「素材疲劳」导致 CTR 下降</p>
              </div>
              <div class="correction-step check">
                <span class="correction-tag editable">验收重算</span>
                <p class="editable">重算后发现 CTR 与 CVR 都在改善；真正变化来自 CPM 345→401。</p>
              </div>
              <div class="correction-step fixed">
                <span class="correction-tag editable">反哺规则</span>
                <p class="editable">把「先校验版位结构」写入规则，并升级为输出前强制检查。</p>
              </div>
            </div>
            <div class="correction-close editable">人工验收不是末端检查，而是 Skill 持续变准的学习入口。</div>
          </div>
        </div>
      </div>`,

    16: () => `
      <div class="compare-flow-layout">
        <div class="compare-flow-head">
          <div>
            <div class="eyebrow editable">投放力 · 阶段二：同框架，不同问题</div>
            <h1 class="slide-title editable">框架搭好以后，真正拉开差距的<br>是人的灵活改造</h1>
          </div>
          <p class="claim-side editable">AI 会沿框架执行；人要根据数据规模、客户阶段和主要矛盾，决定它这次该看什么。</p>
        </div>
        <div class="stage3-strip">
          <div class="stage3-label editable">同一框架 ≠ 同一答案</div>
          <div class="stage3-flow"><span class="stage3-step editable">数据规模</span><i>×</i><span class="stage3-step editable">客户阶段</span><i>×</i><span class="stage3-step editable">主要矛盾</span><i>→</i><span class="stage3-step accent editable">人重新定义问题与优先级</span></div>
        </div>
        <div class="compare-cards">
          <article class="client-card">
            <div class="client-card-head"><span class="client-stage editable">头部客户</span><h3 class="editable">某品牌</h3></div>
            <p class="client-q editable">30+ 直播间 · 近 10 个品线 · 链路覆盖完整</p>
            <p class="client-a editable">人工不可能把数据看齐；AI 先按链路与品线理清全貌，人再判断下一步增长结构。</p>
            <div class="shot-frame client-shot"><img src="assets/shot-ntld-review.png" alt="某品牌直播链路深度分析截图" loading="lazy"></div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开复盘报告</a>
          </article>
          <article class="client-card">
            <div class="client-card-head"><span class="client-stage new editable">新客户</span><h3 class="editable">每日博士</h3></div>
            <p class="client-q editable">潜力新客 · 直播间 CVR 仅为竞品约 23%</p>
            <p class="client-a editable">通用 Skill 会建议多搭基建；人的判断是先修直播转化，再考虑堆账户与广告。</p>
            <div class="shot-frame client-shot"><img src="assets/shot-mrdoctor-diagnosis.png" alt="每日博士竞价全景诊断核心结论与对标表" loading="lazy"></div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开竞价诊断</a>
          </article>
        </div>
      </div>`,

    17: () => `
      <div class="stage3-layout">
        <div class="stage3-head">
          <div>
            <div class="eyebrow editable">投放力 · 阶段三：复杂场景洞察</div>
            <h1 class="slide-title editable">复杂场景的价值，是和 AI 一起<br>长出新的分析方法</h1>
          </div>
          <p class="claim-side editable">人定义要看懂什么，AI 前置处理复杂计算；已有业务知识越扎实，共创新应用的空间越大。</p>
        </div>
        <div class="stage3-evidence">
          <div class="stage3-questions">
            <span class="small-label">一份报告前置回答四类复杂问题</span>
            <article><strong class="editable">哪个行业在涨？</strong><p class="editable">跨行业、链路识别环比增长与增量。</p></article>
            <article><strong class="editable">什么品类和商品在涨？</strong><p class="editable">从客户与主推商品定位机会形态。</p></article>
            <article><strong class="editable">打的是谁、什么功效？</strong><p class="editable">把目标人群、用户画像与解决痛点放在同一行看。</p></article>
            <article><strong class="editable">什么素材证明它在爆量？</strong><p class="editable">直接关联 Top 素材，验证趋势背后的内容表达。</p></article>
          </div>
          <figure class="stage3-figure">
            <div class="shot-frame stage3-shot"><img src="assets/shot-delivery-stage3.png" alt="爆品情报周报模块五高潜爆品明细视图" loading="lazy"></div>
            <figcaption><span class="editable">模块五 · 高潜爆品明细视图</span><a class="case-link" href="#" target="_blank" rel="noreferrer">打开完整周报</a></figcaption>
          </figure>
        </div>
        <div class="stage3-close editable">这份周报只是一个案例：先把业务知识沉淀清楚，新的业务痛点就能变成人与 AI 共同创造的新应用。</div>
      </div>`,

    19: () => `
      <div class="cf-layout">
        <div class="cf-head">
          <div>
            <div class="eyebrow editable">内容力 · 为什么是现在</div>
            <h1 class="slide-title editable">内容力：AI 的天然战场，是把「什么是好内容」<br>定义成可分析的框架</h1>
          </div>
          <p class="claim-side editable">先把「什么是好内容」定义成框架，再让 AI 跑全量；素材与直播使用同一套方法。</p>
        </div>
        <div class="cf-scenes">
          <article class="cf-scene">
            <div class="cf-scene-head"><h3 class="editable">广告素材</h3><span class="cf-scene-meta editable">15–60 秒短视频</span></div>
            <p class="cf-scene-essence editable">本质：一段音视频的转化效率</p>
            <span class="cf-insight-label editable">关键洞察 · 人工判断难以规模化</span>
            <div class="cf-scene-pains">
              <span class="editable">每个人看的重点不同</span><span class="editable">易遗漏</span><span class="editable">耗费人力、难以高频</span><span class="editable">依赖单人经验、不够全面</span>
            </div>
          </article>
          <article class="cf-scene">
            <div class="cf-scene-head"><h3 class="editable">直播间</h3><span class="cf-scene-meta editable">3–30 分钟长视频</span></div>
            <p class="cf-scene-essence editable">本质：一段更长、更复杂的音视频</p>
            <span class="cf-insight-label editable">关键洞察 · 长内容几乎没有诊断带宽</span>
            <div class="cf-scene-pains">
              <span class="editable">内容漫长、无限延伸</span><span class="editable">平台无法直接拉取</span><span class="editable">诊断频率极低</span><span class="editable">我们本身没那么懂直播经营</span>
            </div>
          </article>
        </div>
        <div class="cf-aivalue">
          <span class="small-label">框架提炼 · AI 的介入方式不是直接给结论</span>
          <div class="cf-aivalue-flow">
            <span class="cf-av-step editable">人先定义「什么是好内容」的框架<br><em class="editable">膳食赛道切入点：痛点挖掘 + 信任力构建</em></span>
            <i>→</i>
            <span class="cf-av-step accent editable">AI 按框架拆解全量音视频<br><em class="editable">频率 · 深度 · 全面性，三重提升</em></span>
          </div>
        </div>
        <div class="cf-guide editable">接下来两条线展开：素材线（赛道底座 → 单客户与节点延展）· 直播间线（人货场底座 → 诊断与场景赋能）</div>
      </div>`,

    20: () => `
      <div class="content-journey-layout">
        <div class="content-journey-head">
          <div>
            <div class="eyebrow editable">内容力 · 素材三层演进</div>
            <h1 class="slide-title editable">同一套素材框架，三层递进</h1>
          </div>
          <p class="claim-side editable">同一套内容框架逐层做深：看得全 → 看得准 → 做得前。</p>
        </div>
        <div class="content-journey-grid">
          <article class="content-stage stage-foundation">
            <div class="content-stage-top"><span>01</span><em class="editable">L1 · 赛道底座</em></div>
            <h3 class="editable">提炼赛道共性</h3>
            <p class="content-stage-role editable">看得全</p>
            <div class="shot-frame content-stage-shot"><img src="assets/shot-cf-track-common.png" alt="赛道爆量素材五大共性特征与素材类型矩阵" loading="lazy"></div>
            <div class="content-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">赛道好内容有哪些共性？</p></section>
              <section class="before"><b class="editable">过去服务</b><p class="editable">人工抽样看片，标准不一且容易遗漏。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">28 条 Top 素材 × 9 品类全量逐帧，提炼 5 大共性。</p></section>
            </div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开赛道拆解报告</a>
          </article>
          <article class="content-stage stage-diagnosis">
            <div class="content-stage-top"><span>02</span><em class="editable">L2 · 诊断跃迁</em></div>
            <h3 class="editable">单客户诊断</h3>
            <p class="content-stage-role editable">看得准</p>
            <div class="shot-frame content-stage-shot"><img src="assets/shot-cf-wonderlab.png" alt="某品牌益生菌素材深度分析：五品牌核心指标对比" loading="lazy"></div>
            <div class="content-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">这个客户具体差在哪里？</p></section>
              <section class="before"><b class="editable">过去服务</b><p class="editable">依赖经验看片，很难定位具体流失节点。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">逐帧拆解 + 指标对照，定位流失并下钻品类复用。</p></section>
            </div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开某品牌深度分析</a>
          </article>
          <article class="content-stage stage-forward">
            <div class="content-stage-top"><span>03</span><em class="editable">L3 · 前置跃迁</em></div>
            <h3 class="editable">营销节点构建</h3>
            <p class="content-stage-role editable">做得前</p>
            <div class="shot-frame content-stage-shot"><img src="assets/shot-cf-duoyanshou-node.png" alt="多燕瘦三伏天节点 P0 建议卡：问题诊断/优化方向/AB测试/口播钩子" loading="lazy"></div>
            <div class="content-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">节点到来前，内容该怎么准备？</p></section>
              <section class="before"><b class="editable">过去服务</b><p class="editable">临时拼创意，节点经验难复用。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">场景 × TA × 客户优势重组，输出诊断、AB 测试与口播钩子。</p></section>
            </div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开三伏天节点报告</a>
          </article>
        </div>
        <div class="content-journey-close editable"><strong>深度来自对客户诉求的理解；AI 让每一层都能规模化执行。</strong><span>下一页把同一套逻辑带进更长、更难的直播间。</span></div>
      </div>`,

    21: () => `
      <div class="livebase-layout">
        <div class="livebase-head">
          <div>
            <div class="eyebrow editable">内容力 · 直播间分析</div>
            <h1 class="slide-title editable">同一套逻辑，换一个更长、<br>更难的分析场景</h1>
          </div>
          <p class="claim-side editable">人先定义人货场框架，AI 再跑全量样本，最终沉淀成赛道可复用的方法论。</p>
        </div>
        <div class="livebase-body">
          <div class="livebase-left">
            <div class="bridge-card">
              <span class="small-label">与素材页相同的逻辑，两个变化</span>
              <div class="bridge-row"><span class="bridge-from editable">素材：15–60 秒 · 痛点 + 信任</span><i>→</i><span class="bridge-to editable">直播间：3–30 分钟 · 人货场 + 话术</span></div>
            </div>
            <div class="livebase-framework">
              <span class="small-label">直播间的框架怎么定（含赛道行业化特点）</span>
              <div class="fw-grid">
                <div class="fw-cell"><strong class="editable">人</strong><span class="editable">主播状态与人设</span></div>
                <div class="fw-cell"><strong class="editable">货</strong><span class="editable">货品设计与塑品</span></div>
                <div class="fw-cell"><strong class="editable">场</strong><span class="editable">场景与氛围</span></div>
                <div class="fw-cell"><strong class="editable">话术</strong><span class="editable">目标人群痛点挖掘 · 逼单循环</span></div>
              </div>
            </div>
            <div class="livebase-pains compact">
              <span class="pain-chip editable">平台拉不到内容</span>
              <span class="pain-chip editable">诊断频率极低</span>
              <span class="pain-chip editable">不懂直播经营</span>
            </div>
          </div>
          <div class="livebase-result">
            <div class="livebase-stats">
              <div><strong class="editable">14</strong><span class="editable">头部直播间</span></div>
              <div><strong class="editable">228</strong><span class="editable">关键帧</span></div>
              <div><strong class="editable">17 份 · 98%</strong><span class="editable">音频转写与准确率</span></div>
            </div>
            <div class="livebase-method">
              <span class="small-label">沉淀 · 赛道 CVR 人货场方法论</span>
              <ul>
                <li class="editable">四大人设类型</li>
                <li class="editable">单品聚焦是 CVR 最高的挂车策略</li>
                <li class="editable">品类定制场景五要素</li>
                <li class="editable">5–7 分钟标准话术循环</li>
              </ul>
            </div>
            <div class="branch-links dark-links">
              <a class="case-link" href="#" target="_blank" rel="noreferrer">分析框架文档</a>
              <a class="case-link" href="#" target="_blank" rel="noreferrer">方法论文档</a>
            </div>
          </div>
        </div>
        <div class="livebase-quote editable">「第一次看到 AI 跑出来的分析——它不仅帮我理解了赛道商家的打法与信任构建逻辑，更让我沉淀出一套赛道专属方法论，进而帮更多商家做延展。」</div>
      </div>`,

    22: () => `
      <div class="content-case-layout">
        <div class="content-case-head">
          <div>
            <div class="eyebrow editable">内容力 · 直播应用延展</div>
            <h1 class="slide-title editable">从「事后诊断」到「事前预案」</h1>
          </div>
          <p class="claim-side editable">方法论只有进入客户动作，才完成闭环：标杆经验变成清单，新场景变成预案。</p>
        </div>
        <div class="content-case-grid">
          <article class="content-case-card case-diagnosis">
            <div class="content-case-top"><span>01</span><em class="editable">事后诊断 · 每日博士 8/28</em></div>
            <h3 class="editable">单客户对标</h3>
            <p class="content-case-role editable">从经验到检查清单</p>
            <div class="shot-frame content-case-shot"><img src="assets/shot-live-mrdoctor-script.png" alt="每日博士直播间话术维度核心问题清单" loading="lazy"></div>
            <div class="content-case-detail">
              <section><b class="editable">客户需求</b><p class="editable">这个直播间与标杆差在哪里？</p></section>
              <section class="before"><b class="editable">过去服务</b><p class="editable">人工深诊成本高，只覆盖少数头部客户。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">标杆 + 转写逐项对照，生成检查清单。</p></section>
            </div>
            <div class="content-case-result editable"><strong>定位根因</strong>：3 段重复话术；最硬证据未口播。<span>当日客户完成复盘，并拆成五类调整动作。</span></div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开诊断报告</a>
          </article>
          <article class="content-case-card case-forward">
            <div class="content-case-top"><span>02</span><em class="editable">事前规划 · 某营销节点某直播场景</em></div>
            <h3 class="editable">特色场景赋能</h3>
            <p class="content-case-role editable">从复盘到预设方案</p>
            <div class="shot-frame content-case-shot"><img src="assets/shot-live-seaside-script.png" alt="华大某直播场景话术改造诊断与双直播间差异化话术框架" loading="lazy"></div>
            <div class="content-case-detail">
              <section><b class="editable">客户需求</b><p class="editable">新场景开播前，话术和脚本怎么准备？</p></section>
              <section class="before"><b class="editable">过去服务</b><p class="editable">临时把平播话术改成新场景。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">平播资产 × 海边场景，事前生成方案。</p></section>
            </div>
            <div class="content-case-result editable"><strong>5 个品牌 · 5 份方案</strong><span>并提报产品需求：从事后复盘走向事前规划。</span></div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开华大话术方案</a>
          </article>
        </div>
        <div class="content-case-close editable"><strong>能力平权化</strong>：过去只有少数头部客户才配得上的深度诊断，现在可以规模化给更多服务对象。<span>下一步回到更上游的商品决策：商家究竟该卖什么、开什么品。</span></div>
      </div>`,

    18: () => `
      <div class="evidence-layout">
        <div class="evidence-head">
          <div>
            <div class="eyebrow editable">投放力 · 从方法分享到平台资产</div>
            <h1 class="slide-title editable">先分享方法，<br>再把成熟能力沉淀成平台资产</h1>
          </div>
          <p class="claim-side editable">先让人理解方法，再把真实业务验证过的能力沉淀为团队与平台资产。</p>
        </div>
        <div class="spill-track">
          <article class="spill-node has-shot">
            <span class="leap-date editable">02 / 27</span>
            <h3 class="editable">授人以渔</h3>
            <p class="editable">第一版 Skill 压缩包 + 实践指南：让没有编程背景的人也能开始，并学会判断与纠偏。</p>
            <div class="shot-frame small spill-shot"><img src="assets/shot-skill-guide.png" alt="CodeBuddy Skill 实践指南截图" loading="lazy"></div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开实践指南</a>
          </article>
          <article class="spill-node has-shot">
            <span class="leap-date editable">05 / 12</span>
            <h3 class="editable">能力平台 会客厅</h3>
            <p class="editable">平台内分享：分析思路与人机分工，让更多同学理解方法。</p>
            <div class="shot-frame small spill-shot"><img src="assets/shot-adataclaw-sharing.png" alt="能力平台 Claw 分享页封面" loading="lazy"></div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开分享页</a>
          </article>
          <article class="spill-node has-shot">
            <span class="leap-date editable">成熟后</span>
            <h3 class="editable">平台化输出</h3>
            <p class="editable">成熟 Skill 上架平台，成为可直接调用的预制能力。</p>
            <div class="shot-frame small spill-shot"><img src="assets/shot-adata-marketplace.png" alt="能力平台 Skill 市集上架截图" loading="lazy"></div>
          </article>
        </div>
        <div class="value-cards">
          <article class="value-card">
            <span class="small-label">效率</span>
            <strong class="editable">4–5h → 约 10min</strong>
            <p class="editable">单客户复盘</p>
          </article>
          <article class="value-card">
            <span class="small-label">深度</span>
            <strong class="editable">3–5 维 → 13 维</strong>
            <p class="editable">按需拉通的分析维度</p>
          </article>
          <article class="value-card">
            <span class="small-label">外溢</span>
            <strong class="editable">20+ 客户 · 200+ 报告 · 多项 Skill 上架</strong>
            <p class="editable">从个人方法走向可复用资产</p>
          </article>
        </div>
        <div class="evidence-close editable">投放解决「投得准、跑得稳」；用户被触达之后，真正完成转化的是内容。下一页把同一套方法带进素材与直播。</div>
      </div>`,

    23: () => `
      <div class="product-journey-layout">
        <div class="product-journey-head">
          <div>
            <div class="eyebrow editable">商品力 · 四层服务演进</div>
            <h1 class="slide-title editable">从「追爆品」到「为单个商家开品」</h1>
          </div>
          <p class="claim-side editable">不是四个孤立工具，而是服务价值逐层升级：看见市场 → 建立底座 → 翻译场景 → 支持决策。</p>
        </div>
        <div class="product-journey-grid">
          <article class="product-stage stage-baseline">
            <div class="product-stage-top"><span>01</span><em class="editable">基础服务 · 无 AI</em></div>
            <h3 class="editable">广告爆品</h3>
            <p class="product-stage-role editable">看见市场</p>
            <div class="product-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">什么商品投得好、怎么投、表现如何？</p></section>
              <section class="before"><b class="editable">过去能交付</b><p class="editable">人工整理双周报，提供广告域投放参考。</p></section>
              <section class="after"><b class="editable">AI 后新增</b><p class="editable">把低频样本升级为后续全域分析的入口。</p></section>
            </div>
            <div class="product-stage-value editable">价值起点 · 从经验找品到有数据可追</div>
          </article>
          <article class="product-stage stage-data">
            <div class="product-stage-top"><span>02</span><em class="editable">1.0 · 数据底座</em></div>
            <h3 class="editable">全域爆品</h3>
            <p class="product-stage-role editable">补齐市场</p>
            <div class="product-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">全域卖什么、谁在买、应该怎样选品？</p></section>
              <section class="before"><b class="editable">过去能交付</b><p class="editable">人力只能抽样，无法持续跑全量商品。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">采集、清洗、纠错与聚类，形成可持续底座。</p></section>
            </div>
            <div class="product-stage-value editable">服务升级 · 从广告域走向全域商品机会</div>
          </article>
          <article class="product-stage stage-scene">
            <div class="product-stage-top"><span>03</span><em class="editable">2.0 · 场景跃迁</em></div>
            <h3 class="editable">营销地图</h3>
            <p class="product-stage-role editable">翻译场景</p>
            <div class="product-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">节点到来时，该卖什么、面向谁、怎么讲？</p></section>
              <section class="before"><b class="editable">过去能交付</b><p class="editable">只有大表，商家仍需自己理解和行动。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">把数据翻译成品类、人群、场景与内容策略。</p></section>
            </div>
            <div class="product-stage-value editable">关键亮点 · 从「有数据」到「会应用」</div>
          </article>
          <article class="product-stage stage-decision">
            <div class="product-stage-top"><span>04</span><em class="editable">3.0 · 决策跃迁</em></div>
            <h3 class="editable">单客开品</h3>
            <p class="product-stage-role editable">支持决策</p>
            <div class="product-stage-detail">
              <section><b class="editable">客户需求</b><p class="editable">结合自身约束，下一步该开什么品？</p></section>
              <section class="before"><b class="editable">过去能交付</b><p class="editable">通用报告 + 人工定制，首版约需一周。</p></section>
              <section class="after"><b class="editable">AI 核心增益</b><p class="editable">13 字段生成 P0 / P1 路线，人做终审。</p></section>
            </div>
            <div class="product-stage-value editable">决策亮点 · 从行业洞察到单客优先级</div>
          </article>
        </div>
        <div class="product-journey-close editable"><strong>递进不是数据越做越多，而是离客户决策越来越近。</strong><span>下一页用四类真实产物逐列验证。</span></div>
      </div>`,

    24: () => `
      <div class="product-proof-layout">
        <div class="product-proof-head">
          <div>
            <div class="eyebrow editable">商品力 · 四层真实产物</div>
            <h1 class="slide-title editable">同一条演进链，四类真实交付</h1>
          </div>
          <p class="claim-side editable">每一列都能现场打开；数字用于证明规模，人的判断仍负责最终决策。</p>
        </div>
        <div class="product-proof-grid">
          <article class="product-proof-card proof-baseline">
            <div class="product-proof-top"><span>01</span><em class="editable">无 AI · 广告域</em></div>
            <h3 class="editable">广告爆品双周报</h3>
            <div class="shot-frame product-proof-shot"><img src="assets/shot-prod-ad-domain.png" alt="健康滋补爆品及潜力新品周报表格" loading="lazy"></div>
            <div class="product-proof-copy">
              <p><b class="editable">客户要解决</b><span class="editable">什么在投、怎么投、表现如何？</span></p>
              <p class="before"><b class="editable">过去服务</b><span class="editable">人工整理，低频提供广告域参考。</span></p>
              <p class="after"><b class="editable">AI 增益</b><span class="editable">为全域扩展建立可比较的起点。</span></p>
            </div>
            <div class="product-proof-result editable"><strong>交付边界</strong>：看得到“投得好”，还看不到“全域卖得好”。</div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开双周报</a>
          </article>
          <article class="product-proof-card proof-data">
            <div class="product-proof-top"><span>02</span><em class="editable">1.0 · 全域底座</em></div>
            <h3 class="editable">爆品拓品机会榜</h3>
            <div class="shot-frame product-proof-shot"><img src="assets/shot-prod-full-domain.png" alt="食品饮料爆品拓品机会榜工作沟通工具表格" loading="lazy"></div>
            <div class="product-proof-copy">
              <p><b class="editable">客户要解决</b><span class="editable">全域卖什么、谁在买、怎么选品？</span></p>
              <p class="before"><b class="editable">过去服务</b><span class="editable">人力只能抽样，无法持续跑全量。</span></p>
              <p class="after"><b class="editable">AI 增益</b><span class="editable">采集、清洗、纠错、聚类与卖点识别。</span></p>
            </div>
            <div class="product-proof-result editable"><strong>多类商品信息</strong> · 4 段业务流 · 3 份报告 + 1 套工具</div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开拓品榜</a>
          </article>
          <article class="product-proof-card proof-scene">
            <div class="product-proof-top"><span>03</span><em class="editable">2.0 · 场景应用</em></div>
            <h3 class="editable">应季营销地图</h3>
            <div class="shot-frame product-proof-shot"><img src="assets/shot-prod-marketing-map.png" alt="某平台某营销节点应季营销地图五大节点" loading="lazy"></div>
            <div class="product-proof-copy">
              <p><b class="editable">客户要解决</b><span class="editable">节点来了，卖什么、面向谁、怎么讲？</span></p>
              <p class="before"><b class="editable">过去服务</b><span class="editable">拿到大表，仍要自己理解和行动。</span></p>
              <p class="after"><b class="editable">AI 增益</b><span class="editable">翻译成品类、人群、场景与内容策略。</span></p>
            </div>
            <div class="product-proof-result editable"><strong>11 类目</strong> · 多类商品 · 多类品牌 · 5 个节点</div>
            <a class="case-link" href="#" target="_blank" rel="noreferrer">打开某营销节点地图</a>
          </article>
          <article class="product-proof-card proof-decision">
            <div class="product-proof-top"><span>04</span><em class="editable">3.0 · 单客决策</em></div>
            <h3 class="editable">某产品开品报告</h3>
            <div class="product-proof-dual">
              <div class="shot-frame product-proof-shot"><img src="assets/shot-prod-prompt-gen.png" alt="商家开品洞察提示词生成器四步流程" loading="lazy"></div>
              <div class="shot-frame product-proof-shot"><img src="assets/shot-prod-tigernut.png" alt="某产品单客开品报告" loading="lazy"></div>
            </div>
            <div class="product-proof-copy">
              <p><b class="editable">客户要解决</b><span class="editable">结合自身约束，下一步开什么品？</span></p>
              <p class="before"><b class="editable">过去服务</b><span class="editable">通用洞察 + 人工定制，首版约一周。</span></p>
              <p class="after"><b class="editable">AI 增益</b><span class="editable">13 字段叠加约束，生成 P0 / P1 路线。</span></p>
            </div>
            <div class="product-proof-result editable"><strong>约 1 周 → 约 5 分钟</strong><span>仅指首版初稿；人终审供应链与品牌匹配。</span></div>
            <div class="product-proof-links"><a class="case-link" href="#" target="_blank" rel="noreferrer">打开生成器</a><a class="case-link" href="#" target="_blank" rel="noreferrer">打开报告</a></div>
          </article>
        </div>
      </div>`,

    25: () => `
      <div class="integrated-layout">
        <div class="integrated-head">
          <div>
            <div class="eyebrow editable">四力打通 · 同一个经营目标</div>
            <h1 class="slide-title editable">真正的价值不是四个工具，<br>而是一套完整经营方案</h1>
          </div>
          <div class="client-start"><strong class="editable">低量起步</strong><span class="editable">某海外保健食品客户直播起点；目标不是优化单一指标，而是把营销链路跑起来。</span></div>
        </div>
        <div class="force-table">
          <div class="force-row header"><span>模块</span><span>人做的事 · 策略判断</span><span>AI 做的事 · 数据整合</span></div>
          <div class="force-row"><div class="force-name editable"><span class="force-index">01</span>商品 / 选品</div><div class="force-human editable"><strong>决定方向</strong>：选择与客户能力匹配的品类与组合</div><div class="force-ai editable"><strong>交叉验证</strong>：赛道直播跑量品类 × 客户 CID 已验证品类</div></div>
          <div class="force-row"><div class="force-name editable"><span class="force-index">02</span>内容 / 素材</div><div class="force-human editable"><strong>判断迁移</strong>：找到客户素材与头部打法契合的要点</div><div class="force-ai editable"><strong>逐条拆解</strong>：客户全量素材 × 赛道头部素材，提取共同规律</div></div>
          <div class="force-row"><div class="force-name editable"><span class="force-index">03</span>内容 / 直播</div><div class="force-human editable"><strong>选择标杆</strong>：明确该追赶谁、差距在哪里</div><div class="force-ai editable"><strong>批量分析</strong>：多场标杆直播，提炼人货场与话术标杆</div></div>
          <div class="force-row"><div class="force-name editable"><span class="force-index">04</span>投放链路</div><div class="force-human editable"><strong>定义顺序</strong>：决定版位、智投和工具组合的突破优先级</div><div class="force-ai editable"><strong>差距定位</strong>：整合头部客户基建数据，与客户现状逐项对比</div></div>
        </div>
        <div class="integrated-close editable">人负责目标、策略与取舍；AI 负责跨数据源验证、批量拆解和差距定位。下一页回答：这套能力为什么能持续变强。</div>
      </div>`,

    26: () => `
      <div class="loop-layout">
        <div class="loop-head">
          <div>
            <div class="eyebrow editable">全篇回收 · 一条能力成长闭环</div>
            <h1 class="slide-title editable">这套能力为什么会持续变强：<br>对内与对客，共用一条闭环</h1>
          </div>
          <p class="claim-side editable">目标与上下文让 AI 不偏航，真实业务持续暴露问题并写回规则；能力因此从一次性交付变成持续生长。</p>
        </div>
        <div class="loop-chain">
          <article><span>01</span><strong class="editable">锚定</strong><p class="editable">OKR 给所有判断一个方向</p></article><i>→</i>
          <article><span>02</span><strong class="editable">感知</strong><p class="editable">信息自动进入，不靠口述</p></article><i>→</i>
          <article><span>03</span><strong class="editable">发现</strong><p class="editable">真实业务暴露痛点与错误</p></article><i>→</i>
          <article><span>04</span><strong class="editable">固化</strong><p class="editable">高频问题写成 SKILL / Rule</p></article><i>→</i>
          <article><span>05</span><strong class="editable">纠错</strong><p class="editable">从「能做」到「稳定做」</p></article><i>→</i>
          <article><span>06</span><strong class="editable">外溢</strong><p class="editable">团队分享与平台资产</p></article>
        </div>
        <div class="loop-evidence">
          <div class="editable"><strong>约 24 周</strong><span>连续运行</span></div>
          <div class="editable"><strong>四力</strong><span>真实客户实践</span></div>
          <div class="editable"><strong>200+</strong><span>份分析报告</span></div>
          <div class="editable"><strong>平台资产</strong><span>成熟 Skill 持续外溢</span></div>
        </div>
        <div class="loop-close editable">人负责目标、问题、真伪与取舍；AI 负责记忆、整合、执行与扩散。</div>
      </div>`,

    27: () => `
      <div class="action-layout">
        <div class="action-head">
          <div>
            <div class="eyebrow editable">行动建议 · 从一个真实痛点开始</div>
            <h1 class="slide-title editable">如果你也想开始：<br>一个真实痛点 + 三份文件</h1>
          </div>
          <p class="claim-side editable">先写目标、日志和红线，再选一个高频且可验收的真实场景，让 AI 连续做三次。</p>
        </div>
        <div class="action-steps">
          <span class="action-step editable">写目标</span><i>→</i>
          <span class="action-step editable">记事实</span><i>→</i>
          <span class="action-step editable">写红线</span><i>→</i>
          <span class="action-step editable">选重复场景</span><i>→</i>
          <span class="action-step accent editable">连续做三次，再把错误写回规则</span>
        </div>
        <div class="action-roles">
          <article class="role-card"><strong class="editable">产研</strong><p class="editable">从需求归类或评审纪要开始</p><span class="editable">验收：分类是否可直接用</span></article>
          <article class="role-card"><strong class="editable">销售</strong><p class="editable">从客户跟进与方案复盘开始</p><span class="editable">验收：下次拜访能否直接用</span></article>
          <article class="role-card"><strong class="editable">运营</strong><p class="editable">从日报或复盘开始</p><span class="editable">验收：是否不用再翻聊天记录</span></article>
          <article class="role-card"><strong class="editable">管理者</strong><p class="editable">从周复盘和决策记录开始</p><span class="editable">验收：决策依据是否可追溯</span></article>
        </div>
        <div class="action-close"><span class="editable">这套系统也不是从 25 个 Skill 开始的——而是从一个真实任务与三份文件开始的。</span><a class="case-link" href="starter-kit.html" target="_blank" rel="noreferrer">打开三件套模板</a></div>
      </div>`,

    28: () => `
      <div class="closing-layout">
        <div class="closing-main">
          <div class="eyebrow editable">最后一句</div>
          <h1 class="closing-quote editable">OKR 给方向，AI 给杠杆；<br><span class="okr-line">人的经验值得放大，关键判断不可替代。</span></h1>
          <p class="closing-sub editable">AI 真正放大的不是任务量，而是一个人持续判断、沉淀经验并创造新可能的能力。</p>
        </div>
        <div class="closing-links">
          <span class="small-label">会后延伸 · 公开资料与模板</span>
          <a class="case-link" href="starter-kit.html" target="_blank" rel="noreferrer">目标 / 日志 / 红线三件套</a>
          <a class="case-link" href="#" target="_blank" rel="noreferrer">运营 × AI 全局架构</a>
          <a class="case-link" href="#" target="_blank" rel="noreferrer">Townhall 四力实践</a>
          <a class="case-link" href="#" target="_blank" rel="noreferrer">能力平台 Claw 分享</a>
        </div>
      </div>`,
  };

  function loadState() {
    const templateRevision = deckData.meta.templateRevision || "base";
    const base = { overrides: {}, comments: {}, statuses: {}, lastSlide: 1, templateRevision };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved) return base;
      const merged = { ...base, ...saved };
      if (saved.templateRevision !== templateRevision) {
        const resetSlides = Array.isArray(deckData.meta.templateResetSlides)
          ? deckData.meta.templateResetSlides
          : Array.from({ length: deckData.slides.length }, (_, index) => index + 1);
        resetSlides.forEach((slideId) => delete merged.overrides[slideId]);
        merged.templateRevision = templateRevision;
        localStorage.setItem(storageKey, JSON.stringify(merged));
      }
      return merged;
    } catch (error) {
      console.warn("Unable to read collaboration state", error);
      return base;
    }
  }

  function persistState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      showToast("本机浏览器无法保存，请先导出修改包");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getChapter(slide) {
    return deckData.chapters.find((chapter) => chapter.id === slide.chapter);
  }

  const secondaryFlows = {
    open: {
      label: "开场路径",
      items: [
        { label: "角色与价值", range: [1, 2] },
        { label: "核心冲突", range: [3, 3] },
        { label: "双线导览", range: [4, 4] },
      ],
    },
    "part-a": {
      label: "对内流程",
      items: [
        { label: "总览", range: [5, 5] },
        { label: "为什么做", range: [6, 6] },
        { label: "怎么搭", range: [7, 8] },
        { label: "如何长", range: [9, 9] },
        { label: "早上运行", range: [10, 10] },
        { label: "晚上回收", range: [11, 11] },
        { label: "小结", range: [12, 12] },
      ],
    },
    "part-b": {
      label: "四力架构",
      items: [
        { label: "四力总览", range: [13, 13] },
        { label: "投放力", range: [14, 18] },
        { label: "内容力", range: [19, 22] },
        { label: "商品力", range: [23, 24] },
        { label: "四力整合", range: [25, 25] },
      ],
    },
    close: {
      label: "收束路径",
      items: [
        { label: "能力闭环", range: [26, 26] },
        { label: "开始行动", range: [27, 27] },
        { label: "最后一句", range: [28, 28] },
      ],
    },
  };

  function chapterNav(slide) {
    return deckData.chapters
      .map((chapter) => `<span class="${chapter.id === slide.chapter ? "is-current" : ""}">${escapeHtml(chapter.label)}</span>`)
      .join("");
  }

  function secondaryNav(slide) {
    const flow = secondaryFlows[slide.chapter];
    const items = flow.items
      .map((item, index) => {
        const current = slide.id >= item.range[0] && slide.id <= item.range[1];
        const arrow = index === 0 ? "" : `<i aria-hidden="true">→</i>`;
        return `${arrow}<span class="secondary-step ${current ? "is-current" : ""}"><b>${String(index + 1).padStart(2, "0")}</b>${escapeHtml(item.label)}</span>`;
      })
      .join("");
    return `
      <div class="secondary-nav">
        <span class="secondary-nav-label">${escapeHtml(flow.label)}</span>
        <div class="secondary-nav-track">${items}</div>
      </div>`;
  }

  function slideChrome(slide) {
    return `
      <header class="slide-chrome">
        <div class="deck-mark">AI × OPERATING SYSTEM</div>
        <div class="navigation-context">
          <div class="chapter-nav">${chapterNav(slide)}</div>
          ${secondaryNav(slide)}
        </div>
        <div class="page-mark">P${String(slide.id).padStart(2, "0")} / ${deckData.slides.length}</div>
      </header>`;
  }

  function slideFooter(slide) {
    const chapter = getChapter(slide);
    return `
      <footer class="slide-footer">
        <span class="current-question"><b>本页结论</b><span class="editable">${escapeHtml(slide.claim)}</span></span>
        <span class="time-mark">${escapeHtml(slide.time)}</span>
      </footer>`;
  }

  function defaultTemplate(slide) {
    return `
      <div class="skeleton-composition">
        <div>
          <div class="eyebrow editable">${escapeHtml(getChapter(slide).label)} · ${escapeHtml(slide.layout)}</div>
          <h1 class="slide-title editable">${escapeHtml(slide.title)}</h1>
          <p class="claim-copy editable">${escapeHtml(slide.claim)}</p>
        </div>
        <div class="skeleton-side">
          <span class="small-label accent-text">CURRENT MATERIAL</span>
          <p class="body-copy editable">${escapeHtml(slide.body)}</p>
          <div class="author-note author-only">
            <span class="author-note-label">AUTHOR LAYER</span>
            本页已进入 28 页完整初稿。后续修改应以 content.js 中的 layout「${escapeHtml(slide.layout)}」、讲稿原料和案例来源为准。
          </div>
        </div>
      </div>`;
  }

  function sourceTemplate(slide) {
    if (packagedPageOverrides[slide.id]) return packagedPageOverrides[slide.id];
    return representativeTemplates[slide.id]
      ? representativeTemplates[slide.id]()
      : defaultTemplate(slide);
  }

  function renderSlides() {
    els.deck.innerHTML = deckData.slides
      .map((slide) => {
        const originalContent = sourceTemplate(slide);
        const content = state.overrides[slide.id] || originalContent;
        return `
          <article class="slide ${slide.theme} ${slide.id === 1 ? "is-active" : ""}" data-slide-id="${slide.id}" data-chapter="${escapeHtml(slide.chapter)}" aria-label="P${slide.id} ${escapeHtml(slide.title)}">
            ${slideChrome(slide)}
            <section class="slide-content">${content}</section>
            ${slideFooter(slide)}
          </article>`;
      })
      .join("");

    attachEditListeners();
    prepareZoomableCaseImages();
  }

  function renderSlideList() {
    els.slideList.innerHTML = deckData.slides
      .map((slide) => {
        const status = state.statuses[slide.id] || slide.status || "skeleton";
        return `
          <button class="slide-list-item" data-jump="${slide.id}" type="button">
            <span class="slide-list-index">P${String(slide.id).padStart(2, "0")}</span>
            <span class="slide-list-title">${escapeHtml(slide.title)}</span>
            <span class="status-dot ${status}" title="${escapeHtml(status)}"></span>
          </button>`;
      })
      .join("");
  }

  function showSlide(index, options = {}) {
    const nextIndex = Math.max(0, Math.min(deckData.slides.length - 1, index));
    const previous = els.deck.querySelector(".slide.is-active");
    const next = els.deck.querySelector(`[data-slide-id="${deckData.slides[nextIndex].id}"]`);
    if (previous) previous.classList.remove("is-active");
    if (next) next.classList.add("is-active");
    currentIndex = nextIndex;
    state.lastSlide = currentIndex + 1;
    persistState();

    const humanPage = String(currentIndex + 1).padStart(2, "0");
    els.counter.textContent = `${humanPage} / ${deckData.slides.length}`;
    els.progressFill.style.width = `${((currentIndex + 1) / deckData.slides.length) * 100}%`;
    els.prev.disabled = currentIndex === 0;
    els.next.disabled = currentIndex === deckData.slides.length - 1;

    els.slideList.querySelectorAll(".slide-list-item").forEach((item) => {
      item.classList.toggle("is-active", Number(item.dataset.jump) === currentIndex + 1);
    });

    savedRange = null;
    selectedQuote = "";
    renderPanel();
    applyEditMode();

    if (options.closeDrawer !== false) closeDrawer();
  }

  function currentSlideData() {
    return deckData.slides[currentIndex];
  }

  function currentSlideElement() {
    return els.deck.querySelector(".slide.is-active");
  }

  function renderPanel() {
    const slide = currentSlideData();
    const speaker = ["本公开版保留页面主线与交互；讲稿原料、内部备注和具体案例说明未随页面对外提供。"];
    const sources = [{ label: "本公开版不包含外部资料链接", url: "" }];
    const facts = [];
    const needs = [];

    els.panelTitle.textContent = `P${slide.id} · ${slide.title}`;
    els.slideStatus.value = state.statuses[slide.id] || slide.status || "skeleton";
    els.panelNotes.innerHTML = `
      <div class="note-block"><h3>主讲必讲</h3><ul>${speaker.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
      ${slide.timing ? `<div class="note-block"><h3>时长分配</h3><p>${escapeHtml(slide.timing)}</p></div>` : ""}
      ${slide.mapping ? `<div class="note-block"><h3>通用映射</h3><p>${escapeHtml(slide.mapping)}</p></div>` : ""}
      <div class="note-block"><h3>待 goinglin 补 / 确认</h3><ul>${needs.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`;

    els.panelSources.innerHTML = `
      ${facts.length ? `<div class="note-block"><h3>事实与证据</h3><ul>${facts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
      <div class="note-block"><h3>案例与来源</h3><div class="source-list">${sources
        .map((source) => `<span class="case-link case-link-disabled">${escapeHtml(source.label)}</span>`)
        .join("")}</div></div>`;

    renderComments();
  }

  function renderComments() {
    const slideId = currentSlideData().id;
    const comments = state.comments[slideId] || [];
    const openComments = comments.filter((comment) => !comment.resolved).length;
    els.commentCount.textContent = openComments;
    els.commentQuote.hidden = !selectedQuote;
    els.commentQuote.textContent = selectedQuote ? `引用：“${selectedQuote}”` : "";
    els.commentList.innerHTML = comments.length
      ? comments
          .map(
            (comment) => `
              <article class="comment-item ${comment.resolved ? "is-resolved" : ""}" data-comment-id="${escapeHtml(comment.id)}">
                <div class="comment-meta"><span>${escapeHtml(comment.createdAt)}</span><span>${comment.resolved ? "已解决" : "待处理"}</span></div>
                ${comment.quote ? `<blockquote>${escapeHtml(comment.quote)}</blockquote>` : ""}
                <p>${escapeHtml(comment.text)}</p>
                <div class="comment-actions">
                  <button type="button" data-action="resolve">${comment.resolved ? "重新打开" : "标记已解决"}</button>
                  <button type="button" data-action="delete">删除</button>
                </div>
              </article>`,
          )
          .join("")
      : `<div class="note-block"><p class="muted">本页还没有评论。可以先在页面上选中文字，再打开评论面板添加修改说明。</p></div>`;
  }

  function openPanel(tab = "notes") {
    closeDrawer();
    els.panel.classList.add("is-open");
    els.panel.setAttribute("aria-hidden", "false");
    switchPanelTab(tab);
    renderPanel();
  }

  function closePanel() {
    els.panel.classList.remove("is-open");
    els.panel.setAttribute("aria-hidden", "true");
  }

  function openDrawer() {
    closePanel();
    els.drawer.classList.add("is-open");
    els.drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
  }

  function switchPanelTab(tab) {
    document.querySelectorAll(".panel-tab").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === tab);
    });
    document.querySelectorAll(".panel-view").forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === tab);
    });
  }

  function toggleEdit() {
    editMode = !editMode;
    applyEditMode();
    showToast(editMode ? "编辑模式已开启：直接点击文字修改" : "编辑已保存到本机浏览器");
  }

  function applyEditMode() {
    document.body.classList.toggle("edit-mode", editMode);
    els.edit.classList.toggle("is-active", editMode);
    els.edit.textContent = editMode ? "完成编辑" : "编辑";
    els.deck.querySelectorAll(".editable").forEach((node) => {
      node.contentEditable = editMode ? "true" : "false";
      node.spellcheck = false;
    });
  }

  function attachEditListeners() {
    els.deck.addEventListener("input", (event) => {
      if (!editMode || !event.target.closest(".editable")) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveCurrentSlide, 180);
    });
  }

  function saveCurrentSlide() {
    const slide = currentSlideElement();
    if (!slide) return;
    const content = slide.querySelector(".slide-content");
    state.overrides[currentSlideData().id] = content.innerHTML;
    persistState();
  }

  function resetCurrentSlide() {
    const slide = currentSlideData();
    if (!state.overrides[slide.id]) {
      showToast("本页没有浏览器内文字修改");
      return;
    }
    if (!window.confirm(`确认撤销 P${slide.id} 的浏览器内文字与字号修改？本页评论不会删除。`)) return;
    delete state.overrides[slide.id];
    persistState();
    const article = currentSlideElement();
    article.querySelector(".slide-content").innerHTML = sourceTemplate(slide);
    applyEditMode();
    prepareZoomableCaseImages(article);
    showToast("本页文字已恢复为源文件版本");
  }

  function adjustSelectedText(delta) {
    if (!editMode) {
      editMode = true;
      applyEditMode();
    }

    const activeSlide = currentSlideElement();
    if (!savedRange || !activeSlide.contains(savedRange.commonAncestorContainer)) {
      showToast("请先在当前页选中文字，或把光标放进一个文字块");
      return;
    }

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);

    if (savedRange.collapsed) {
      const startNode = savedRange.startContainer.nodeType === Node.ELEMENT_NODE
        ? savedRange.startContainer
        : savedRange.startContainer.parentElement;
      const editable = startNode && startNode.closest(".editable");
      if (!editable) return;
      const current = Number(editable.dataset.userScale || 100);
      const next = Math.max(70, Math.min(180, current + delta));
      editable.dataset.userScale = String(next);
      editable.style.fontSize = `${next}%`;
    } else {
      const span = document.createElement("span");
      span.className = "user-font-adjustment";
      span.style.fontSize = `${delta > 0 ? 115 : 87}%`;
      try {
        savedRange.surroundContents(span);
      } catch (error) {
        const fragment = savedRange.extractContents();
        span.appendChild(fragment);
        savedRange.insertNode(span);
      }
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);
      savedRange = newRange.cloneRange();
    }

    saveCurrentSlide();
    showToast(delta > 0 ? "已放大所选文字" : "已缩小所选文字");
  }

  function toggleBoldText() {
    if (!editMode) {
      editMode = true;
      applyEditMode();
    }

    const activeSlide = currentSlideElement();
    if (!savedRange || !activeSlide.contains(savedRange.commonAncestorContainer)) {
      showToast("请先在当前页选中文字，或把光标放进一个文字块");
      return;
    }

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);

    const startElement = savedRange.startContainer.nodeType === Node.ELEMENT_NODE
      ? savedRange.startContainer
      : savedRange.startContainer.parentElement;
    const endElement = savedRange.endContainer.nodeType === Node.ELEMENT_NODE
      ? savedRange.endContainer
      : savedRange.endContainer.parentElement;
    const startEditable = startElement && startElement.closest(".editable");
    const endEditable = endElement && endElement.closest(".editable");

    if (!startEditable || startEditable !== endEditable) {
      showToast("请在同一个文字块内选择需要加粗的内容");
      return;
    }

    const startBold = startElement.closest("strong, b");
    const endBold = endElement.closest("strong, b");
    let madeBold = true;

    if (startBold && startBold === endBold && startEditable.contains(startBold)) {
      const parent = startBold.parentNode;
      const movedNodes = Array.from(startBold.childNodes);
      movedNodes.forEach((node) => parent.insertBefore(node, startBold));
      startBold.remove();
      if (movedNodes.length) {
        const nextRange = document.createRange();
        nextRange.setStartBefore(movedNodes[0]);
        nextRange.setEndAfter(movedNodes[movedNodes.length - 1]);
        selection.removeAllRanges();
        selection.addRange(nextRange);
        savedRange = nextRange.cloneRange();
      }
      madeBold = false;
    } else if (!savedRange.collapsed) {
      const strong = document.createElement("strong");
      strong.className = "user-bold-adjustment";
      const fragment = savedRange.extractContents();
      strong.appendChild(fragment);
      savedRange.insertNode(strong);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(strong);
      selection.removeAllRanges();
      selection.addRange(nextRange);
      savedRange = nextRange.cloneRange();
    } else {
      showToast("请先选择需要加粗的文字");
      return;
    }

    els.bold.classList.toggle("is-active", madeBold);
    saveCurrentSlide();
    showToast(madeBold ? "已加粗所选文字" : "已取消加粗");
  }

  function addComment() {
    const text = els.commentInput.value.trim();
    if (!text) {
      showToast("请先填写修改说明");
      return;
    }
    const slideId = currentSlideData().id;
    state.comments[slideId] = state.comments[slideId] || [];
    state.comments[slideId].unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      quote: selectedQuote,
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      resolved: false,
    });
    els.commentInput.value = "";
    selectedQuote = "";
    savedRange = null;
    persistState();
    renderComments();
    showToast("评论已保存到本页");
  }

  function handleCommentAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = button.closest(".comment-item");
    const slideId = currentSlideData().id;
    const comments = state.comments[slideId] || [];
    const index = comments.findIndex((comment) => comment.id === item.dataset.commentId);
    if (index < 0) return;

    if (button.dataset.action === "resolve") {
      comments[index].resolved = !comments[index].resolved;
    } else if (button.dataset.action === "delete") {
      comments.splice(index, 1);
    }
    persistState();
    renderComments();
  }

  function exportPack() {
    saveCurrentSlide();
    const pack = {
      deckId: deckData.meta.id,
      deckVersion: deckData.meta.version,
      exportedAt: new Date().toISOString(),
      instructions: "导入 index.html，或由 Agent 读取 overrides/comments/statuses 合并回 content.js 与页面模板。",
      state,
      slideIndex: deckData.slides.map((slide) => ({ id: slide.id, title: slide.title, layout: slide.layout })),
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI分享_HTML修改包_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("修改包已导出");
  }

  function importPack(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const pack = JSON.parse(reader.result);
        if (pack.deckId !== deckData.meta.id || !pack.state) throw new Error("Deck ID mismatch");
        if (!window.confirm("导入会覆盖当前浏览器保存的文字修改、评论与页面状态。是否继续？")) return;
        Object.assign(state, pack.state);
        persistState();
        window.location.reload();
      } catch (error) {
        showToast("无法导入：文件不是本项目的有效修改包");
      }
    };
    reader.readAsText(file);
  }

  async function togglePresenterMode() {
    const entering = !document.body.classList.contains("presenter-mode");
    document.body.classList.toggle("presenter-mode", entering);
    if (entering) {
      closePanel();
      closeDrawer();
      editMode = false;
      applyEditMode();
      try {
        await document.documentElement.requestFullscreen?.();
      } catch (error) {
        showToast("已进入无工具栏演示模式；浏览器未允许全屏");
      }
    } else if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    }
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }

  function prepareZoomableCaseImages(scope = els.deck) {
    scope.querySelectorAll(".shot-frame img").forEach((image) => {
      if (image.classList.contains("zoomable-case-image")) return;
      const label = image.alt || "案例图片";
      image.classList.add("zoomable-case-image");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `${label}，点击查看完整大图`);
    });
  }

  function openOutputSample(source, title = "实际输出样例") {
    if (!source) return;
    els.outputSampleTitle.textContent = title;
    els.outputSampleImage.src = source;
    els.outputSampleImage.alt = `${title}截图`;
    els.outputSampleModal.classList.add("is-open");
    els.outputSampleModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("output-sample-open");
    els.closeOutputSample.focus();
  }

  function closeOutputSample() {
    if (!els.outputSampleModal.classList.contains("is-open")) return;
    els.outputSampleModal.classList.remove("is-open");
    els.outputSampleModal.setAttribute("aria-hidden", "true");
    els.outputSampleImage.removeAttribute("src");
    els.outputSampleImage.alt = "";
    document.body.classList.remove("output-sample-open");
  }

  function isTypingTarget(target) {
    return target.matches("input, textarea, select") || target.isContentEditable;
  }

  function bindEvents() {
    els.prev.addEventListener("click", () => showSlide(currentIndex - 1));
    els.next.addEventListener("click", () => showSlide(currentIndex + 1));
    els.edit.addEventListener("click", toggleEdit);
    els.fontDown.addEventListener("mousedown", (event) => event.preventDefault());
    els.fontUp.addEventListener("mousedown", (event) => event.preventDefault());
    els.bold.addEventListener("mousedown", (event) => event.preventDefault());
    els.fontDown.addEventListener("click", () => adjustSelectedText(-10));
    els.fontUp.addEventListener("click", () => adjustSelectedText(10));
    els.bold.addEventListener("click", toggleBoldText);
    els.resetSlide.addEventListener("click", resetCurrentSlide);
    els.openNotes.addEventListener("click", () => openPanel("notes"));
    els.openComments.addEventListener("click", () => openPanel("comments"));
    els.closePanel.addEventListener("click", closePanel);
    els.openDrawer.addEventListener("click", openDrawer);
    els.closeDrawer.addEventListener("click", closeDrawer);
    els.addComment.addEventListener("click", addComment);
    els.commentList.addEventListener("click", handleCommentAction);
    els.exportPack.addEventListener("click", exportPack);
    els.importPack.addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", () => {
      if (els.importFile.files[0]) importPack(els.importFile.files[0]);
      els.importFile.value = "";
    });
    els.presentMode.addEventListener("click", togglePresenterMode);
    els.deck.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-output-sample]");
      if (trigger) {
        openOutputSample(trigger.dataset.outputSample, trigger.dataset.outputTitle || "实际输出样例");
        return;
      }
      const image = event.target.closest(".zoomable-case-image");
      if (image) {
        event.preventDefault();
        openOutputSample(image.currentSrc || image.getAttribute("src"), image.alt || "案例大图");
      }
    });
    els.deck.addEventListener("keydown", (event) => {
      const image = event.target.closest(".zoomable-case-image");
      if (!image || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      event.stopPropagation();
      openOutputSample(image.currentSrc || image.getAttribute("src"), image.alt || "案例大图");
    });
    els.closeOutputSample.addEventListener("click", closeOutputSample);
    els.outputSampleModal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-output-sample]")) closeOutputSample();
    });
    els.slideStatus.addEventListener("change", () => {
      state.statuses[currentSlideData().id] = els.slideStatus.value;
      persistState();
      renderSlideList();
      showSlide(currentIndex, { closeDrawer: false });
      showToast("页面状态已更新");
    });

    document.querySelectorAll(".panel-tab").forEach((button) => {
      button.addEventListener("click", () => switchPanelTab(button.dataset.tab));
    });

    els.slideList.addEventListener("click", (event) => {
      const item = event.target.closest("[data-jump]");
      if (item) showSlide(Number(item.dataset.jump) - 1);
    });

    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      const activeSlide = currentSlideElement();
      if (!selection.rangeCount || !activeSlide || !activeSlide.contains(selection.anchorNode)) return;
      savedRange = selection.getRangeAt(0).cloneRange();
      const anchorElement = selection.anchorNode.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode
        : selection.anchorNode.parentElement;
      els.bold.classList.toggle("is-active", editMode && Boolean(anchorElement && anchorElement.closest("strong, b")));
      if (!selection.isCollapsed) {
        selectedQuote = selection.toString().trim().slice(0, 240);
        if (els.panel.classList.contains("is-open")) renderComments();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.outputSampleModal.classList.contains("is-open")) {
        event.preventDefault();
        closeOutputSample();
        return;
      }
      if (els.outputSampleModal.classList.contains("is-open")) return;
      if (isTypingTarget(event.target)) return;
      if (["ArrowRight", "PageDown"].includes(event.key) || event.key === " ") {
        event.preventDefault();
        showSlide(currentIndex + 1);
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        showSlide(currentIndex - 1);
      } else if (event.key === "Home") {
        showSlide(0);
      } else if (event.key === "End") {
        showSlide(deckData.slides.length - 1);
      } else if (event.key.toLowerCase() === "e") {
        toggleEdit();
      } else if (event.key.toLowerCase() === "n") {
        openPanel("notes");
      } else if (event.key.toLowerCase() === "c") {
        openPanel("comments");
      } else if (event.key.toLowerCase() === "o") {
        openDrawer();
      } else if (event.key.toLowerCase() === "f") {
        togglePresenterMode();
      } else if (event.key === "Escape") {
        closePanel();
        closeDrawer();
        if (document.body.classList.contains("presenter-mode") && !document.fullscreenElement) {
          document.body.classList.remove("presenter-mode");
        }
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) document.body.classList.remove("presenter-mode");
    });
  }

  renderSlides();
  renderSlideList();
  bindEvents();
  showSlide(Math.max(0, Math.min(deckData.slides.length - 1, Number(state.lastSlide || 1) - 1)));
})();
