# Question gallery — execution log

Companion to `2026-11-23-question-gallery.md`. Every judgment call the executor made
while implementing it, in order, each with what it costs if wrong.



Task 0: Ruling: 就地开分支，不用 git worktree — assets/、data/、web/data/ 都被 .gitignore 排除（约 430MB 的输入与生成物），worktree 里没有这些数据，整条管道跑不起来；改为在同一目录切出 question-gallery 分支，同样保证不直接往 master 上提交 — 代价：没有第二份工作树，回滚靠分支与提交历史。

## Pre-flight interface scan

| 生产者 → 消费者 | 接口 | 发现 |
|---|---|---|
| T1 → T2 | questions-lib 的 isCandidate/partition/buildSlicePayload/clipSnippet | 一致 |
| T3 → T4/T6 | KINDS/QUESTION_FIELDS 从 questions-lib 导出 | 一致（T1 未列，属追加） |
| T2 → T6 | digest 的候选消息是 --check 覆盖校验的基准 | **冲突**：T8 Step 6 用 build.mjs 清空 web/data，digest 随之消失，--check 拿不到基准 |
| T4 → T6 | 提取记录字段 vs merge 的 sources[] 需要 convName/date | **缺口**：QUESTION_FIELDS 里没有 convName/date，--merge 无声明来源 |
| T5 → T6 | modules.json 的 id/tags | 一致 |
| T6 → T7 | questions.json 的 modules[]/questions[] | 一致 |
| T7 → T8 | #/c/<convId>/m/<msgId> 链接 | 一致（T8 扩路由正则） |
| T2 → T8 | 都改 README.md | 一致：T2 只加文件清单行，说明文字归 T8 |

Task 6: Ruling: --check 的候选基准改为直接扫 web/data/chats/*.json 并用 isCandidate 现算，不读 web/data/qdigest — 因为 tools/build.mjs 会 rmSync 整个 web/data，digest 会被删掉，而 chats 每次 build 都会重建，是更可靠的基准；且与 T8 Step 6 的验证顺序（build → merge → check）兼容 — 代价：--check 每次要重扫 705 个对话文件（约 1–2 秒）。
Task 6: Ruling: --merge 从 web/data/index.json 读每个对话的 name 与 created 来填 sources[].convName/date — 这两项在 spec 的 sources[] schema 里是必需字段，但不在 QUESTION_FIELDS（提取提示词不该让子代理抄对话元数据）— 代价：--merge 多依赖一个文件，build.mjs 之后仍可重建。

Task 1: complete (commits e775faa..e4c2150, tests: node --test test/questions-lib.test.mjs → 4/4 pass)
Task 2: complete (commits e4c2150..fd12b6c, tests: node --test test/questions-digest.test.mjs → 4/4 pass)
Task 3: complete (commits fd12b6c..b7e17b0, tests: node --test test/questions-prompt.test.mjs → 3/3 pass)
Task 4: Ruling: validateWork 不得禁止同一条 msgId 出现在多条问题里 — 提示词第 7 条要求把一条消息里的两个独立需求拆成两条问题（spec 的决策表也要求拆），两条问题的 msgIds 必然指向同一条消息；改成只拒绝"convId+msgIds+std 完全重复"的记录，同时允许合法拆分 — 代价：校验不再能抓住"同一消息被无意义地重复提取"，但覆盖检查仍能发现漏提取。
Task 6 (pure functions only): done ahead of order (commits b7e17b0..e026725, tests: node --test test/questions-merge.test.mjs → 8/8 pass). CLI wiring (--merge/--check) still pending on extraction output.
Task 4: Ruling: 批量从 6 降到 3 — 6 个并发 worker 触发 429（local request limit exceeded），chunk 4 与 chunk 5 各失败一次 — 按计划的重试策略重派这两个 chunk，并把后续批次的并发压到 3 — 代价：24 片的总耗时约翻倍。
Task 6: Ruling: 先做 Task 6 的纯函数部分（normalizeStd/dedupeQuestions/assignModule/validateQuestions）再做 Task 5 — 这部分只依赖夹具、不依赖提取产物，而 Task 5 的 --tags 必须等提取完成，顺带把等待时间用掉 — 代价：提交顺序与计划的任务编号不一致（ledger 已记录）。
Task 4: Ruling: 切片改为 20 个对话/片（36 片）、text/summary/snippet 按字节截断、cap 后单片 ≤32KB — 第一次提取尝试零产出：单条 read 最多 50KB，75–137KB 的切片读不完，worker 用 head -c/tail 分页把上下文撑爆后死于 stopReason=length — 代价：子代理运行次数从 24 增到 36。
Task 3/4: Ruling: 子代理不再产出 orig，改为 --merge 按 msgIds 从 web/data/chats/*.json 逐字还原 — 让模型逐字复现长中文是它最不可靠的能力，而"原文永远可见"是 spec 的硬要求，程序还原比信任抄写更稳；QUESTION_FIELDS 因此少一个字段，提示词加"不要抄原文"一节 — 代价：--merge 必须能读到 chats（build 之后仍在）。
Task 1: Ruling: clipSnippet 改为按 UTF-8 字节截断（原计划按字符） — 中文 3 字节/字，按字符 cap 600 仍产出 69KB 文件，达不到"一次读完"的目标 — 代价：同一参数下英文保留的字数比中文多，语义上仍是"约多少内容"。
Task 4 (redesign): committed 402c012, tests: node --test test/ → 29/29 pass
Task 5 (pure validator only): validateModules implemented (tests 3/4 pass; the 4th waits on the clustering pass), commit 300e25e
Task 4: complete — qwork/ 36 片（chunk 20 拆为 20-a/20-b 两个分片），926 条问题，未覆盖 0/1296，node tools/questions.mjs --check-work 通过。
Task 4: Ruling: 计划里"N ≥ 1200"是我的估算，实际 926 — 规则 8（同一需求的多轮追问并成一条）把 1,296 条候选消息压成 926 条问题，msgId 引用总数仍是 1,296（未覆盖 0），合并而非丢失 — 代价：条数比我原先预告的少，但每处原文都留了 msgIds。
Task 4: Ruling: 并发定为 4（计划写 3，首次尝试 6 触发 429）；最后一轮试了 5 也正常 — 代价：批次大小依赖当时的配额状况，不能当作硬保证。
Task 5: complete — qwork/modules.json 14 个模块（127 个高频标签全部逐字映射、无重复归属、无输入外标签），node --test test/questions-modules.test.mjs → 5/5。
Task 5: Ruling: 聚类输入只给词频 >=5 的 127 个标签（占全部标签槽位 41%），其余交给 misc — 前两次聚类子代理都因输出超长失败（它试图映射全部 1531 个标签）；缩小输入并把"输出必须 <6KB"写进任务后一次通过 — 代价：低频标签不进模块表，其问题落 misc（misc 因此会有一定量）。
Task 6: complete — 926 提取 → 去重合并 4 → 922 条问题，14 模块，覆盖 100%，node tools/questions.mjs --check 通过；test/questions-merge.test.mjs 13/13。
Task 6: Ruling: dedupeQuestions 只按 std 相似度合并，不再比较 orig — 提取产物没有 orig（改为 msgIds + 程序还原），按 orig 去重会让每条记录的 key 都是空字符串，把 926 条问题全并成 1 条（真发生过）；已加入回归测试"没有 orig 字段的记录不会被误并"。
Task 7: complete — #/questions 总览 + 模块页 + 复制 + 来源链接，test/questions-ui.test.mjs 6/6（含 CDP 实测点击复制得到的内容等于卡片上的标准问题）。
Task 7: Ruling: UI 测试不再断言 [data-copy] — app 层的 copyButton 是直接挂 onClick 的 helper，只有 markdown 代码块用 data-copy 走全局代理；给 copyButton 加 data-copy 反而会被全局处理器截走并复制空字符串。改为断言复制行为本身（更强）。
Task 8: complete (commits 5683830..ee298aa, tests: node --test test/ → 49/49 pass); 全量验证：build.mjs 之后 qwork/ 40 个文件仍在，--merge 重建出完全相同的 922 条 / 14 模块 / 覆盖 100%。
## Final review (fresh reviewer, package e775faa..ee298aa, model iagent/standard:max)

Verdict: "With fixes" — no Critical; 3 Important (all missing spec requirements); 13 Minor.

Final: fixed 模块内搜索缺失 — test 「模块内搜索会收窄结果，且不影响全局搜索」 RED→GREEN, suite 59/59
Final: fixed 附件类问题没有标记与筛选 — test 「附件类问题有标记，且可以一键只看附件」 RED→GREEN, suite 59/59
Final: fixed 冷启动 #/questions 卡在骨架 — test 「直接打开 #/questions 也会渲染出模块卡片」 RED→GREEN（先复现：cards=0，修后 14）, suite 59/59
Final: fixed 锚点每次重渲染都重新应用 — test 「跳转标记只应用一次」 RED→GREEN, suite 59/59
Final: fixed --check 阈值只有 90% 且不校验 msgId 可解析 — test 「找不到来源消息的 msgId 会被单独报出来」+「原文为空时区分附件与还原失败」 RED→GREEN, suite 59/59
Final: fixed --maxatt 是个死开关 — 已接入 candidateOf，digest 测试覆盖
Final: fixed 卡片展示 tags 而非 subtags（spec 说 tags 只作聚类输入） — UI 探针确认显示为 subtags
Final: fixed --tags 未按大小写/全半角归一（计划要求） — test 「--tags 给出按频次降序的标签表」 更新为用 tagKey 折叠后计数, suite 59/59
Final: fixed 冷启动/失败路径的可读性：requireJson 给出该跑什么命令；原文无法还原时不再谎称「只有附件」
Final: fixed 减少动效时锚点没有提示 — 加了静态 outline
Final: Ruling: 原文默认折叠（<details>）而不是常开 — spec 内部冲突（UI 段写「可展开」，反目标写「不折叠删减」）；922 张卡片全展开会让模块页（如 rag 104 条）无法扫读，而反目标的实质是「不删减、不截断」，已把 spec 的反目标措辞改为「完整、逐字、随时可展开，不删减不截断不摘要」 — 代价：想一眼看到原文的人要多点一次。
Final: Ruling: dedupe 只合并了 4 条（926→922），同一仓库的两个改写提问（gstack）没被合并 — 评审测出这两个 std 相似度 ≈0.32，而「同一模板套不同仓库」≈0.24，文本相似度无法分开两者，任何阈值都会误并；真正的去重发生在提取阶段（257 条问题已合并多轮追问），已在 README 写明这条限制 — 代价：跨对话的改写重复仍会各占一张卡。
Final: minor (deferred): 模块网格 minmax 用 232px（计划写 220px），纯观感
Final: minor (deferred): 模块内问题按提取顺序而非时间排序（spec 未规定）
Final: minor (deferred): --merge/--check 各解析一遍 705 个对话文件（约 238MB），语料再大需要重构成一次索引
Final: minor (deferred): dedupeQuestions 是 O(n²) 相似度比较（n=926 时约 4×10⁵ 次），语料再大需按 shingle 建索引
Final: minor (deferred): 提交了 qwork/tagfreq*.json 作为聚类输入的存档（无害的溯源材料）
Final:
