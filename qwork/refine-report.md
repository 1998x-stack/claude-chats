# 标准问题补全报告

共 411 条参与补全，其中 297 条改写、114 条确认无需改动。

## q-0006 — 补上参考项目 hashcards-local、本地部署、练题页确认/模糊反馈、3D 几何可视化与雷达图等细节；schema 的 tags 举例因长度略去

- 改前：结合 LeetMath 项目文档与数据库 schema（如 tags），调研 Anki 类复习产品的做法，设计一套重复训练系统与类 Anki 卡片网站方案。
- 改后：参考 hashcards-local，结合 LeetMath 的 phase1 文档与数据库 schema，设计可本地部署的类 Anki 重复训练网站：练题页有进度分数与逐步确认/模糊反馈，支持公式与 3D 几何可视化，含掌握度雷达图。

## q-0011 — 补上原任务第一部分的 markdown 分析报告交付物，skill 名沿用 long-running.skill

- 改前：综合 Anthropic 与 OpenAI 关于 harness engineering 的文章内容，用 skill creator 构建一个可下载的 long-running.skill，并注意自检。
- 改后：深度分析 Anthropic 与 OpenAI 的 harness engineering 文章并输出 markdown 报告，再用 skill creator 综合构建可下载、经自检的 long-running.skill。

## q-0012 — 补上节点行号等关键约束、bash/grep 查询输出与增量更新预留接口；OpenAI 环境变量因长度未写入

- 改前：设计并实现 Python 项目知识图谱生成系统：输入项目路径，用 AST 构建依赖、调用、包含等关系，以函数为核心并预留扩展接口（factory 模式）。
- 改后：设计并实现 Python 项目知识图谱生成系统：输入项目路径，用 AST 构建依赖、调用、包含关系，节点须带名称与行号；以函数为核心，factory 模式预留扩展与增量更新接口，可按用户问题生成 bash/grep 查询。

## q-0016 — 补上代码风格硬约束（Google 风格、typing、PEP 8 中文注释）与 artifact 逐文件完整交付要求

- 改前：设计 IterSearch 项目的代码分类与模块结构，按工业级标准逐文件给出完整实现代码（假定已有 OpenAI API 密钥）。
- 改后：为 WebResearcher 的 IterSearch 框架设计代码分类，逐文件以 artifact 交付工业级完整实现：遵循 Google 风格，带 typing、PEP 8 中文注释，不省略代码，假定已有 OpenAI API 密钥。

## q-0019 — 把笼统的「该类」明确为职位描述匹配类，并补上原文漏掉的第三条规则（类别分<80 取专业分≥80 者）

- 改前：改进并重写该类（重点是 process_job_descriptions），输出职位描述、Category、各专业及相似度评分：类别分超过 90 取该类别全部专业，超过 80 取专业分超过 70 的项。
- 改后：改进并重写处理职位描述的类（重点 process_job_descriptions），输出 job_desc、Category 与各专业相似度评分；规则：类别分>90 取全部专业，≥80 取专业分≥70 者，<80 取专业分≥80 者。

## q-0020 — 把「附件」明确为此前清洗后的职业编码结果，补上 info/subgroups 结构与五级 GROUP 定义

- 改前：按附件要求用 Python 实现列表数据的清洗与处理函数，并把处理结果组织成嵌套 JSON 结构输出。
- 改后：用 Python 实现函数，把此前清洗得到的职业编码列表构建成嵌套 JSON：每个节点含 info（CODE、TITLE、GROUP）与 subgroups，GROUP 表示大类/中类/小类/细类/工种五级。

## q-0021 — 补上需保留的意图分类与 isMajor/nodeName/relation/label 字段规则、同义词映射及中文输出要求

- 改前：改进「知识图谱问答分析专家」提示词，使其结构更清晰、表达更规范，同时不遗漏原有的任务说明与节点信息提取要求。
- 改后：把「知识图谱问答分析专家」提示词改写得更结构化、清晰，但不遗漏任何原有信息：保留意图分类、isMajor/nodeName/relation/label 字段规则与同义词映射，输出仍用中文。

## q-0024 — 补上代码风格硬约束（Google 风格、typing、PEP 8 中文注释）与 artifact 逐文件完整交付要求

- 改前：设计 Rainbow DQN 项目框架，采用 factory 模式支持消融实验，输出图表、TensorBoard 与 loguru 日志，并逐文件给出工业级实现代码。
- 改后：设计 Rainbow DQN 项目框架：factory 模式组织消融实验，输出图表、TensorBoard 与 loguru 日志，逐文件以 artifact 交付工业级完整代码（Google 风格、typing、PEP 8 中文注释）。

## q-0028 — 补上原文后段新增的 Step-Back Prompting 抽象要求，并点名改造对象是 Query 改写提示词

- 改前：改进 Query 改写提示词：按 5W2H 确定问题类型与数量、判断 query 与 context 相关性并抽取实体，补充 few-shot 示例与实体抽象规则（如把口语化表述转为高校专业术语）。
- 改后：改进 Query 改写提示词：按 5W2H 确定问题类型与数量、判断 QUERY 与 CONTEXT 相关性并抽取实体，加入 few-shot 示例与 Step-Back Prompting 实体抽象规则，把口语化表述转为高校专业术语。

## q-0032 — 补上原文被省略的熟练度分档、存储选型分析与根节点下三层汇总生成学情分析等关键要求

- 改前：整理并精炼基于知识树的学生学情分析系统 PRD，说明知识树节点结构与后续新增字段的设计。
- 改后：整理并精炼基于知识树的学生学情分析系统 PRD：给出知识树节点结构、新增做题次数与错误次数字段及熟练度分档，分析按学生或按节点存储的选型，并明确自下而上汇总、取根节点下三层生成学情分析。

## q-0037 — 把悬空的「给定模板」点名为此消息内的 Role/Profile/Goals/Constrains 风格模板

- 改前：详细分析 QUERY_REWRITE_PROMPT_GENERAL_V3 改写提示词，并按给定模板在内容不变的前提下改写其格式。
- 改后：详细分析 QUERY_REWRITE_PROMPT_GENERAL_V3 这一查询改写提示词，并按 Role/Profile/Goals/Constrains 风格模板在内容不变的前提下改写其格式。

## q-0038 — 信息已足够，仅压缩表述以合规（保留模型、数据集与逐文件组件清单）

- 改前：用 Qwen3-0.6B 与 Qwen3-Embedding-0.6B 搭建基于 simple-wikipedia 数据集的 RAG 项目，按 loguru 与 config 规范逐文件给出数据集处理、向量与 BM25 检索、混合检索、查询处理、上下文组织与流水线代码。
- 改后：用 Qwen3-0.6B 与 Qwen3-Embedding-0.6B 搭 simple-wikipedia 的 RAG 项目，按 loguru/config 逐文件给出数据处理、向量+BM25 混合检索、查询处理、上下文组织、流水线代码。

## q-0039 — 补上原文要求的成立年份与律师名单提取、JSON/CSV 输出及两张年份-价格曲线图

- 改前：对输入 JSON 中的所有律所 URL 并发抓取页面，提取表彰信息、行业处分、责任事故、司法建议四类数量并整数化，按行业处分/责任事故/司法建议大于 0 与表彰数量排序过滤，再改用 Selenium 重写。
- 改后：用 Selenium 重写律所爬虫：并发抓取输入 JSON 中所有律所 URL，提取表彰/行业处分/责任事故/司法建议数量、成立年份与律师名单，按处分类>0 及表彰数排序过滤，输出 JSON/CSV 与年份-价格、年份-人数-价格曲线图。

## q-0042 — 补上原文中后段的交付要求：基于 playwright 抓取、按 skill creator 渐进披露打包 7x24.skill。

- 改前：分析新浪财经 7×24 直播页面各 tag 分类对应的请求接口与响应结构，并据此构建对应的 Python 数据获取客户端。
- 改后：分析新浪财经 7×24 直播各 tag 分类的接口字段并输出 markdown 文档；再用 playwright 构建抓取各分类数据的 Python 客户端，并按 skill creator 渐进披露规范打包 7x24.skill 供下载。

## q-0043 — 补上原文主体任务：按 nodeLevel 构建双向树、叶子/兄弟判定、根→叶子父节点变换出非单节点 paths 并重构 PathTransformer。

- 改前：根据 paths 中 nodes 与 edges 的字段结构，设计并构建相应的图数据模型。
- 改后：为 paths 中每条路径构建自上而下与自下而上两棵树（按 nodeLevel 判定叶子及兄弟），再依“根节点→叶子父节点”规则变换出非单节点 paths，并重构 PathTransformer 输出结构。

## q-0044 — 补上六篇论文名称与“连续逐篇产出 markdown artifacts”的交付方式。

- 改前：深度搜索解析预训练语料清洗的奠基性论文，解耦其中各个组件并详细研究分析，构建成系列详细文章。
- 改后：搜索解析预训练语料清洗六篇奠基性论文（C4/T5、CCNet、The Pile、RefinedWeb、FineWeb、Dolma），逐篇解耦其组件详细分析，并连续产出系列 markdown artifacts。

## q-0045 — 补上脉络涉及的六篇论文名称，明确可视化对象。

- 改前：梳理预训练语料清洗工作的发展脉络，并构建 claude design 可视化呈现。
- 改后：梳理预训练语料清洗六篇奠基性论文（C4、CCNet、The Pile、RefinedWeb、FineWeb、Dolma）的发展脉络，并用 claude design 构建时间线可视化。

## q-0049 — 补上平台范围、代金券/早鸟票等标的与“标注不可行难点”的要求。

- 改前：以美团专家视角设计本地生活平台潜力爆品的抢购与转售机制，并围绕个人用户的潜力爆品发现与提醒工具需求逐一实现。
- 改后：以美团超级专家视角，为新公司设计本地生活平台（美团/大众点评/携程）爆品代金券、早鸟票等抢购后转售赚差价的机制并标注不可行难点；同时围绕个人用户的潜力爆品发现与提醒工具需求逐一实现。

## q-0055 — 补上该客户端调用的接口名与 base_url 可配置特征，使脱离对话可独立理解。

- 改前：重写 SimilarityServiceClient 相似度查询客户端代码。
- 改后：重写给定的 SimilarityServiceClient 相似度查询客户端代码（用 requests 调用 smartCerebellumSimilarity 接口，base_url 可配置）。

## q-0058 — 补上 prompt 常量名以明确润色对象，其余要求原文已明确。

- 改前：对一段大学政策类文件智能查询改写的 prompt 做小幅润色，只修正个别不通顺或有误的句子与词，要求不要大修大改。
- 改后：对大学政策类文件智能查询改写提示词 QUERY_REWRITE_PROMPT_WITH_CATEGORY_1220 做小幅润色，只修正个别不通顺或错误的句子与词，切勿大修大改。

## q-0061 — 补上报错缺失的字段名与键名/别名不一致的线索。

- 改前：调用生成问题接口时报 pydantic ValidationError（构造 QuestionGenerationData 时校验失败），请定位并修复。
- 改后：调用生成问题接口时构造 QuestionGenerationData 报 Pydantic 校验失败，缺少 questionList/totalQuestions 字段（传入的是 snake_case 键），请定位并修复。

## q-0062 — 补上报错原因（缺 xelatex，pandoc PDF 引擎），说明需按平台适配。

- 改前：文档导出接口在 convert_markdown_to_pdf 处报错，请修复并使其兼容不同平台。
- 改后：文档导出接口调用 convert_markdown_to_pdf 时报 xelatex not found 导致 pandoc 转换失败，请修复并使其兼容不同平台。

## q-0063 — 补上原文后半段的整套 Python 项目、三个服务清单、asyncio/loguru/openai 技术栈与「去掉文档导出服务」的约束；原 std 只覆盖了 skill 目录。

- 改前：参照 Skill 的两层结构（元数据 Name 与 Description、SKILL.md 详细指令）为教案生成搭建 skill_lesson_plan/ 目录。
- 改后：参照 Skill 的分层结构搭建 skill_lesson_plan/ 目录，并据此写一个 asyncio+loguru+openai 的 Python 教案生成项目：只保留问题生成、教案生成、段落润色三个服务，去掉文档导出服务。

## q-0068 — 解掉悬空指代「该项目」：由对话主题与 reply 中的文件路径可知是此前的 LangGraph agent 项目。

- 改前：依据各文件的 import 关系（用 bash 与 grep 提取）重新审视并改进该项目代码、修复问题，最后把整个项目打包成 zip 供下载。
- 改后：用 bash 与 grep 梳理各文件的 import 关系，据此重新审视并修复这个 LangGraph agent 项目（llm/client.py、graph/state.py 等文件）的代码问题，最后把整个项目打包成 zip 供下载。

## q-0069 — 补上原文中的重写交付要求与代码规范约束（单类封装、staticmethod、Google 风格、PEP8/PEP257、中文注释、typing）。

- 改前：详细分析附件 paste.txt（约 4.9KB 的 Python 代码），并用更清晰简洁的类结构重写它。
- 改后：详细分析附件 paste.txt 的 Python 文本提取代码，再用一个类封装全部函数、公共函数抽成 staticmethod 重写，遵循 Google 风格与 PEP8/PEP257，补中文注释与 typing。

## q-0072 — 点明大纲出处是附件中的「大模型面试指南」，并补上原文「四个 markdown、file by file artifact by artifact」的逐个交付要求。

- 改前：按附件中的 hashcards 思路与题目大纲，分别构造机器学习、深度学习、强化学习、大语言模型四份面试卡片 markdown。
- 改后：按 hashcards 的思路，围绕附件里的「大模型面试指南」大纲，分别为机器学习、深度学习、强化学习、大语言模型构造 hashcards 面试卡片 markdown，四份文件逐个输出。

## q-0076 — 原文真正的诉求是据这段工作经历优化其给出的简历条目，原 std 只写了梳理经历、漏掉简历优化这一交付物。

- 改前：梳理我在智慧树从零搭建、面向学校教学与教务场景的知识问答 RAG 系统，以及分三阶段提升效果的做法，做全链路深度分析。
- 改后：根据我在智慧树从零搭建教学、教务场景知识问答 RAG 的经历（数据治理、关键词+向量混合检索把单点准确率从 71% 提到 87%、知识图谱融合把多跳提到 87% 以上），深度思考并优化我给出的那段简历内容。

## q-0078 — 补上被重复粘贴的四个具体知识点、原文的 one by one 逐个交付要求与 verify_geometry.py 本地验证约束，原 std 的「数字 0–10」不够准确。

- 改前：按 Manim 数学教学动画生成指南，为小学数字 0–10 制作竖屏 1080×1920 的教学动画视频代码，并先构建分镜脚本。
- 改后：按 Manim 动画指南，为一年级「10 以内数的认识与加减法」的几和第几、比一比、分与合、加法初步认识四个知识点逐个生成 1080×1920 动画，每个先写 storyboard.md 并用 verify_geometry.py 校验。

## q-0079 — 补上原文第 3、4 项要求：factory 模式搭 ablation 项目框架、输出 figures/tensorboard/loguru，并逐个 artifact 给出完整代码。

- 改前：极致详细地分析 BERT 论文，并提取模型结构、数据集、实验设置、各项 ablation 实验对比与图表分析。
- 改后：详细分析 BERT 论文，提取模型结构、数据集、实验设置与各 ablation 对比及图表；再用 factory 模式设计可跑 ablation 的框架（输出 figures、tensorboard、loguru），并逐文件给出代码。

## q-0080 — 补上原文中段的论文深度分析要求（模型结构/数据集/实验设置/ablation 对比/图表）与代码风格约束（Google style、PEP8 中文注释、PEP257 DocString、typing）。

- 改前：为 BERT 论文设计项目框架，用 factory 模式支撑 ablation study，输出图表、TensorBoard 与 loguru 日志，并逐文件给出工业级代码。
- 改后：深度分析 BERT 论文的结构、数据、实验与 ablation 对比，设计以 factory 模式支撑 ablation 的项目框架，输出图表、TensorBoard、loguru 日志，逐文件给出 Google/PEP 风格工业级代码。

## q-0085 — 点明需适配的具体新格式（块内多行「原始/清洗后/分解」「单个要求+匹配类别」「匹配结果」，原正则按「=== 原始:」单行提取）与代码里的抽样量 1400 条。

- 改前：改进日志解析代码以适配现在的数据：用正则匹配 START 与 FINISHED 之间的职位日志块，并随机抽样处理提取内容。
- 改后：改进日志解析代码以适配新格式日志：正则匹配职位 ID 的 START 与 FINISHED 之间的块，解析块内新增的「原始/清洗后/分解」「单个要求+匹配类别」「匹配结果」内容，并随机抽样 1400 条。

## q-0086 — 补上被重复截断的<problem>知识点（八年级二次根式化简/运算、概率定义/列举/频率）、交付数量（3 份分镜+3 个 py）及 verify_geometry.py 仅用 numpy 的校验约束。

- 改前：依据 Manim 数学教学动画生成指南（附件），为给定数学题目/知识点生成 TikTok 竖屏教学动画代码：先解压研读技能文档并构建 storyboard.md 分镜脚本，再实现并渲染动画。
- 改后：按 manim-math.skill 为八年级二次根式、概率生成 3 份 storyboard.md 与 3 个 Manim 动画 py，用仅 numpy 的 verify_geometry.py 校验后修复，输出 TikTok 竖屏视频。

## q-0088 — 把原文的 numbered list 格式要求与 Role/Profile/Goals/Constrains/Skills/Workflow/Initialization 结构清单写清，保留「生动形象、由浅入深、细节不遗漏」的产出要求。

- 改前：完善“PPT 大纲内容生成大师”的 Prompt：根据 PDF 生成层次递进、采用 numbered list 的 PPT 大纲与内容，并按角色、Profile、Goals 等结构规范化 Prompt 模板。
- 改后：完善“PPT 大纲内容生成大师”Prompt：根据 PDF 生成层次递进、生动形象的 PPT 大纲内容，采用 numbered list，并按 Role/Goals/Constrains/Skills/Workflow 结构输出模板。

## q-0095 — 点明具体报错对象与正确方法名（应为 build_knowledge_prompt），并保留原文列出的四个模块；受 120 字限制把 chapter_generator/knowledge_generator 合并为「两个 generator」。

- 改前：复查并修复题目生成系统各模块（prompt_config、context_builder、chapter_generator、knowledge_generator）报错，如 PromptBuilder 的 AttributeError。
- 改后：复查并修复题目生成系统四模块（prompt_config、context_builder、两个 generator）：PromptBuilder 缺 build_knowledge_base_prompt 报 AttributeError。

## q-0096 — 补上数据集字段（document/doc_bio_tags）与模型（distilbert-base-uncased，num_labels=3，Trainer 训练）；原文只出现 TypeError 与 IndexError，故删去原 std 中并未出现的 ArrowInvalid，另在回复中可见 BIO 字符串需映射为整数标签的问题。

- 改前：详细分析并修正、最终给出使用 openkp 数据集训练关键词抽取/序列标注模型的完整可靠代码，解决 TypeError、IndexError、ArrowInvalid 等报错。
- 改后：详细分析并修正用 midas/openkp 的 BIO 标注（doc_bio_tags）训练 distilbert 序列标注模型的代码，解决 TypeError 与 IndexError，并给出完整可运行代码。

## q-0105 — 补上交付物要求（输出新的 markdown artifact）与原文的四个核心技术点范围。

- 改前：分析、评估并完善基于 LLM-as-Judge 的 Eval 系统技术架构，覆盖模型切换、知识变动等核心场景。
- 改后：分析评估并完善基于 LLM-as-Judge 的 Eval 系统技术架构，覆盖模型切换、知识变动、API 变动与降本增效四个核心技术点，并输出新的 markdown artifact。

## q-0107 — 点明接口为千帆 web_search、要交付 class/client 与 search function，并对齐 transform_search_response 的输出结构；URL 改为接口名。

- 改前：参照给定的 curl 调用示例（/v2/ai_search/web_search）与返回结构，开发封装百度千帆 AI 搜索网页搜索接口的客户端类，并整合附件中的搜索结果转换实现。
- 改后：参照给出的 curl 示例与返回结构，构建百度千帆 AI 搜索 web_search 的 search class 与 client，实现 search function，输出结构对齐 transform_search_response。

## q-0109 — 补上原文的交付形式：Claude design 设计流程、多阶段连续输出 markdown artifact，最后做前端设计。

- 改前：分析广告投放流程图，梳理 DSP 竞价、ECPM 出价到投放数据回传的完整链路并完成投放流程设计，随后构建对应的前端界面设计。
- 改后：分析图片中的广告投放流程图，用 Claude design 设计广告投放流程并分阶段输出多个 markdown artifact，再构建对应的前端界面设计。

## q-0111 — 补上可配置时间范围、qwen3:4b 段落级 comment 与 Notion 输出等被截掉的关键环节。；修复：压缩措辞并删去中文与英文间的多余空格，保留可配置时间范围、qwen3:0.6b 三用途、qwen3:4b 段落 comment 与 Notion 落库。

- 改前：构建 HuggingFace Papers 聚合系统：按月抓取 votes>50 论文存 JSONL，提取 ar5iv 正文，用 ollama qwen3:0.6b 做分类、关键词与 labels 提取，并写入 Notion 页面与数据库。
- 改后：构建HuggingFace Papers聚合系统：按可配置时间范围抓votes>50论文存JSONL、提取ar5iv正文，用ollama qwen3:0.6b分类/关键词/labels、qwen3:4b写段落comment，存Notion。

## q-0113 — 点名失败调用（notion_client 的 databases.retrieve）与目标数据库 HF-Papers，保留 404 现象。

- 改前：排查并修复 Notion 连接失败问题：调用 api.notion.com 时返回 404 Not Found。
- 改后：排查修复论文聚合系统的 Notion 连接失败：notion_client 调用 databases.retrieve 获取 HF-Papers 数据库时返回 404 Not Found。

## q-0114 — 补上所属项目与出问题的文件 notion_client_hf.py；原文报错还含 annotations 非法与数据库属性名不存在，为控制长度未全部列入。

- 改前：修复向 Notion 创建论文页面（如 1706.03762）时反复出现的 400 Bad Request 错误并改正相关代码。
- 改后：修复 HuggingFace 论文聚合系统 notion_client_hf.py 中向 Notion 数据库创建论文页面（如 1706.03762）时反复出现的 400 Bad Request 错误并改正代码。

## q-0117 — 补上 batch_size=32、chunk_size=512/overlap=64 的切分参数、overlap 必须为完整句子以及 chunk 向量取平均等原文关键约束。

- 改前：构建 embedding 部署项目：分批 batch_size=32 处理 textList，短文本直接取向量，长文本先按标点切句，再以 chunk_size=512、overlap 64 递归切分，overlap 须为完整句子。
- 改后：构建 embedding 部署项目：textList 按 batch_size=32 分批，长文本按中英文标点切句后以 chunk_size=512、overlap 64 递归切分（overlap 须完整成句），chunk 向量取平均。

## q-0121 — 补上所属提示词名称，并把原文列举的三类多意图/多主体拆分场景点名出来。

- 改前：改进提示词中「第三阶段：查询语句优化」的流程，使其处理多意图与多主体查询：确定问题类型与数量、提取实体关键词并细节化替换扩充、按意图数量返回单个或多个格式化查询。
- 改后：改进 RAG_FLOW 提示词中「第三阶段：查询语句优化」：识别三类多意图/多主体（两个独立主体、主次主体、同主体不同宾语）并拆成对应的多个格式化查询，单意图时返回单个查询。

## q-0124 — 补上原文要求的交付物形式（各个角度的 markdown artifact）。

- 改前：从多个角度搜索调查景德镇卡地克瓷瓦的品牌与产品信息。
- 改后：从多个角度搜索调查景德镇卡地克瓷瓦的品牌与产品信息，输出整理成 markdown artifact。

## q-0125 — 补上原文要求的交付物形式（两项各自一份 markdown artifact）与 Seedance 提示词这一范围。

- 改前：搜索调查 AI 短剧制作经验（包含 Seedance 提示词经验）与电影级制作经验。
- 改后：分别搜索调查 AI 短剧制作经验（含 Seedance 提示词经验）与电影级制作经验，各自输出 markdown artifact。

## q-0126 — 把推测性的“梳理风格与素材”还原为原文要求：交付配音 markdown artifact。

- 改前：搜集近期较火的抖音短视频配音，梳理可用的配音风格与素材。
- 改后：搜集最近较火的抖音短视频配音，输出配音 markdown artifact。

## q-0127 — 解掉“上述调研结果”的悬空指代，点名前四项调研，并把目标写清为用 skill creator 构建 kadike_prompt.skill 及其时长与参考文件要求。；修复：仅压缩“每部 10-15 秒”周围空格使字数降到 120 内，四项调研、kadike_prompt.skill、9:16 时长与 references 要求不变。

- 改前：基于上述调研结果，为抖音「卡地克」瓷瓦账号深度构建内容方案。
- 改后：结合卡地克瓷瓦、AI 短剧、电影级制作、抖音配音四项调研，用 skill creator 构建 kadike_prompt.skill，产出 9:16 电影级 AI 短剧（每部10-15秒），references/ 至少 4-5 个参考。

## q-0131 — 补上原文的核心内容约束：面向初高中生、带表情和标签、不使用数学符号。

- 改前：按 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 的结构，构建用于小红书数学主题内容创作的提示词。
- 改后：按 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 结构，构建面向初高中生的数学主题小红书文案提示词，要求带表情与标签、不使用数学符号。

## q-0132 — 补上原文要求的 artifact 逐个输出与可视化交付形式；原文未给出缩写展开，故不擅自展开。

- 改前：详解 MCP UI 是什么、能有什么作用、涉及哪些标准，并展开各标准的诞生背景、所解决的问题及对比分析，配合中文可视化图表深入讲解。
- 改后：详解 MCP UI 具体是什么、有什么作用、涉及哪些标准，逐个 artifact 展开各标准的诞生背景、解决的问题与对比分析，并配中文可视化图表深入讲解。

## q-0133 — 补上 raw/ 到 wiki/ 的输入输出目录约定、Obsidian 笔记形态与 SKILL creator 构建方式。

- 改前：构建一个隐性知识转显性知识的 skill：输入职场的会议、演讲报告与聊天记录，挖掘其中的隐性知识，做深度复盘与整合，最终提炼一系列方法论，并覆盖不同场景下的 reference。
- 改后：用 SKILL creator 构建职场隐性知识转显性的 skill：从 raw/ 下的会议、演讲、聊天记录与思考中挖掘隐性知识，深度复盘整合为方法论，输出 wiki/ 下的 Obsidian 笔记并覆盖各场景 reference。

## q-0146 — 补上原文要求的交付形式：三个阶段各一篇 markdown 加一篇三者对比文档。

- 改前：详细分析 LLM 工程三个阶段（prompt engineer → context engineer → harness engineer）的技术内容、机理、诞生条件与 5W2H，对比三者并预测未来 LLM 发展方向。
- 改后：详细分析 LLM 工程三阶段（prompt engineer → context engineer → harness engineer）的内容、机理、诞生条件与 5W2H，输出三篇 markdown 文档并对比三者，再预测 LLM 走向。

## q-0148 — 补上原文中的首页与任务页结构、层级统计加进度条，以及每个任务可设截止时间。；修复：英文大幅精简到 240 字内，保留 Apple 风格 HTML/CSS/JS、递归嵌套三类列表与优先级/截止、首页与任务页统计进度条。

- 改前：Build an Apple-style website in HTML/CSS/JavaScript that breaks a task into a nested numbered, todo and toggle list with priority order, done checkboxes showing strikethrough, and recursive sub-subtasks.
- 改后：Apple-style HTML/CSS/JS site breaking a task into recursive subtasks, each numbered/todo/toggle list (checkbox+strikethrough) with priority+deadline; home: create/rename/delete; task page: description, dates, per-level stats, progress bars.

## q-0150 — 补上原文 CodeStyle 段的关键约束（Google style、typing、中文注释），并去掉原文没有的“复现”说法。；修复：删去与 ablation 重复的 study/实验及多余空格，factory mode、figures/tensorboard/loguru、qwen+yaml、Google style/typing/中文注释全保留。

- 改前：按工业场景设计 GraphRAG 复现项目的框架与代码：用 factory mode 组织 ablation study，输出 figures、tensorboard 与 loguru 日志，并逐文件给出详细代码（LLM 用 qwen 并配 yaml 配置）。
- 改后：GraphRAG工业场景项目框架，逐文件完整代码：factory mode组织ablation，输出figures/tensorboard/loguru日志，LLM用qwen配yaml，遵循Google style、typing、中文注释。

## q-0157 — 把模糊的“图结构的 JSON”补成原文明确要求的 nodes/edges 两数组与 NodeData/EdgeData 元素结构。；修复：压缩空格并把函数说明写回更完整表述，paths 字段、nodes/edges 两数组与 NodeData/EdgeData 结构不变。

- 改前：把给定的 paths 数据（含 similarity、sourceDatabase、fromNodeUid/toNodeUid、节点名等字段）转换成图结构的 JSON。
- 改后：写函数把 paths 列表（含 similarity、sourceDatabase、fromNodeUid/toNodeUid、节点名、关系名）转 JSON，输出nodes、edges两数组，元素按给定NodeData、EdgeData。

## q-0160 — 点名了被修改的 prompt 变量及其用途，其余约束原已完整。；修复：删去“我给的”及重复用词降到 120 字内，被改 prompt 变量名、输入输出与“勿大改”约束不变。

- 改前：小幅修改我给出的大学政策类查询改写 prompt：只纠正个别用词或用词顺序的小问题，不要大改大动，让它更好用。
- 改后：小幅修改大学政策类查询改写 prompt（QUERY_REWRITE_PROMPT_WITH_CATEGORY_1220，输入 QUERY 与图谱簇、输出 rewriteQueryList JSON）：只纠正个别用词或顺序，切勿大改大动。

## q-0165 — 补上调研用途（为卡地克瓷瓦抖音账号的 Seedance 电影级 AI 短剧提供参考），原文这句本身已完整。

- 改前：搜索调查电影级别的视频制作经验，输出 markdown 调研报告。
- 改后：搜索调查电影级别的视频制作经验，输出 markdown 调研报告，供卡地克瓷瓦 Seedance AI 短剧参考。

## q-0166 — 把「上面的调研结果」点名为前三份调研，补上 skill 名称、目标受众与竖屏、单集时长约束。

- 改前：为已运营的卡地克抖音账户构建一套 skill：用 Seedance 制作 9:16 竖屏、电影级别、每部 10–15 秒的 AI 短剧，并结合上面的调研结果深度构建流程。
- 改后：结合前三份调研（卡地克瓷瓦品牌、AI 短剧制作经验、电影级制作经验），用 skill creator 构建 `卡地克瓷瓦短视频prompt.skill`，输入剧情后产出面向南方农村自建房人群的 9:16、10–15 秒电影级 AI 短剧。

## q-0168 — 把「前面那套短剧制作 skill」点名为该瓷瓦短视频 prompt skill，并补回原文同段末尾的 zip 中文路径修复要求。

- 改前：搜集近期较火的抖音短视频配音风格，输出配音相关的 markdown 报告，并据此改进前面那套短剧制作 skill。
- 改后：搜集最近较火的抖音短视频配音风格并输出配音 markdown 报告，据此为 `卡地克瓷瓦短视频prompt.skill` 增加配音模块，并修复 .skill 打包时中文路径导致的解压报错。

## q-0170 — 点明代码功能（合并起点相同、后续 label 相同的重复路径）并写清合并位置取 min(merge_indices)-1 的规则，避免「给定」悬空。

- 改前：详细分析给定的重复路径合并代码逻辑：分组依据、已访问索引记录与公共 label 节点的合并位置计算。
- 改后：详细分析这段重复路径合并代码的逻辑：按起始节点与公共 label 节点分组、visited_indices 的作用，以及取最小匹配位置的前一节点作为新 endNode 的合并计算。

## q-0174 — 补充该 prompt 的输入输出形态（query + 召回节点 markdown → 去重的图谱查询条件 JSON）与「中文、不遗漏任何信息」要求；原文其余为同一 prompt 的重复粘贴。

- 改前：改进知识图谱问答 prompt：根据用户自然语言问题与召回的节点 markdown 数据提取所有相关节点信息，使输出更结构化、更清晰，且不遗漏任何信息。
- 改后：把这份知识图谱问答 prompt 用中文改进得更结构化清晰：依据用户 query 与召回节点 markdown 提取图谱查询条件，输出 JSON 列表，且不遗漏原有信息与约束。

## q-0178 — 无需改动：本条对应原文“逐文件构建项目并补齐配置文件”一项，约束已完整且脱离对话可读。；修复：压缩措辞与空格到 120 字内，__main__ 入口、三个配置文件、OPENAI_*、factory 风格与 loguru 日志全保留。

- 改前：逐个文件实现 code interpreter 项目：每个 python 文件保留 __main__ 入口，补齐 .gitignore/requirements.txt/readme.md，使用 OPENAI_* 配置、factory 风格与 loguru 日志。
- 改后：逐文件实现 code interpreter：python 文件含 __main__ 入口，补齐 .gitignore/requirements.txt/readme.md，用 OPENAI_*、factory 风格与 loguru 日志。

## q-0180 — 补了原文被截断部分的关键要求：自动执行生成的代码并跑完 tasks，以及最终按 code category 打包交付。

- 改前：结合 fibonacci 任务的报错日志与已修正的代码，修复 code interpreter 中 code_block.py 的 function_call/tool_calls 解析等问题。
- 改后：修复 code interpreter 跑 tasks/task_01_fibonacci.py 报错的问题：解析需兼容 function_call 与 tool_calls，产出代码要自动执行跑完任务，最后按 category 打包代码。

## q-0181 — 补了原文要求的输出物（figures、tensorboard、loguru 日志）；代码风格约束较长，仅以“工业级实现代码”概括。；修复：只压缩措辞：删去“与/并”等冗余连接词，原有全部要点保留。

- 改前：极其详细地分析 AlphaGo Zero 论文，提取模型结构、数据结构/环境、实验设置、各 ablation 实验对比与图表分析，并设计采用 factory 模式的 ablation 研究框架，逐文件给出工业级实现代码。
- 改后：深度分析 AlphaGo Zero 论文的模型结构、数据结构/环境、实验设置与各 ablation 对比；设计 factory 模式的研究框架，输出 figures、tensorboard、loguru 日志，并逐文件给出工业级实现代码。

## q-0182 — 补了原文中段的 combined chunk 窗口/重叠大小与三种关系约束，并点明最终写入 Neo4j。；修复：压缩至限内：去掉虚词与英文两侧空格，book.txt、qwen-plus、text-embedding-v4、30000/8000 重叠 combined chunk、相关/递进/依赖、Neo4j 全保留。

- 改前：用 RAGFlow 切分超长 book.txt，以 qwen-plus 作 LLM、qwen/text-embedding-v4 作 embedding，递归构建带重叠的 combined chunk，再由 LLM 抽取实体关系构建知识图谱写入 Neo4j。
- 改后：用RAGFlow切分超长book.txt，以qwen-plus、text-embedding-v4作LLM/embedding，构建30000/8000重叠combined chunk，按相关/递进/依赖抽实体合并子图，写入Neo4j。

## q-0189 — 补了原文的大标题形态示例与小标题正文的边界规则（正文内不得出现以第xx开头的行）。

- 改前：构建一个类，按「第xx章 / 第xx条」的层级提取大标题及其下小标题与正文内容，要求第xx章/第xx条只出现在每行开头。
- 改后：构建一个类，按「第xx章 / 第xx条」层级提取大标题（如「第一章 总则」）及其下小标题与正文；第xx章/第xx条须出现在每行开头，小标题正文取到下一个第xx条/章为止且中间无以此开头的行。

## q-0199 — 修正 tag 拆分（原文“公司”“数据”为两个 tag），补上接口字段分析与渐进披露的 skill 打包交付方式。；修复：压缩至限内，并把 7×24 改回原文写法 7x24；tag 列表、字段分析、skill creator 渐进披露交付方式保留。

- 改前：详细搜索分析新浪财经 7×24 直播接口（含全部、A股、宏观、公司数据、市场、国际、观点、央行等 tags），构建对应的 Python 爬虫，并产出包含 API 分析、代码与 Skill 的完整交互式文档包。
- 改后：分析新浪财经 7x24 直播 feed 接口字段（全部、A股、宏观、公司、数据、市场、国际、观点、央行等 tag），构建分类抓取 Python 代码，用 skill creator 渐进披露产出 API 分析+代码+Skill 交互文档包。

## q-0205 — 解掉「上述两篇」指代、点名两种文章主题，并补上 skill 名称、eval.json 需在 Claude.ai 内联执行、强化 Anthropic 模式后复核迭代的要求。；修复：压缩至限内，略去两篇文章副标题；Anthropic/OpenAI 两篇 harness 文章、harness-engineering skill、Claude.ai 内联 eval.json、强化 Anthropic 模式并复核迭代保留。

- 改前：结合上述两篇 harness 文章的内容做优缺点与工程分析，据此构建 harness skill，并按 Anthropic 模式与 eval.json 复检、持续改进该技能。
- 改后：结合 Anthropic、OpenAI 两篇 harness 文章做优缺点与工程分析，构建 harness-engineering skill，编写 Claude.ai 内联 eval.json，强化 Anthropic 模式并复核迭代。

## q-0210 — 把「附件规格」落实为原文给出的 ai_qa_system/ 目录结构，保留逐文件完整代码的交付方式与核心组件。

- 改前：按附件规格逐文件生成 AI 问答系统代码：RAGFlow 混合检索、Neo4j 向量搜索与 N-hop 图遍历、MinHash 去重优先级保护、上下文工程防 Lost in Middle。
- 改后：按给定的 ai_qa_system/ 目录结构逐文件生成完整代码：RAGFlow 混合检索、Neo4j 向量搜索与 N-hop 图遍历、MinHash 去重优先级保护、上下文工程防 Lost in Middle、FastAPI SSE。

## q-0212 — 补上文件位置与原文日志中的规模/耗时（72 项、约 15 秒），使「这部分逻辑」落到具体函数与成因。；修复：删掉原文不存在的 ai_qa_system/deduplication.py 路径，改用原文日志里出现的 deduplication / deduplicate，其余原样保留。

- 改前：修复 MinHash 去重模块的问题并优化其性能，解决文本两两相似度比对过慢的情况。
- 改后：优化 deduplication 中 deduplicate 的逻辑：原始 72 项去重耗时约 15 秒，两两 MinHash 相似度比对过慢，请优化性能并修复其中相关问题。

## q-0222 — 补上原文 notice 中的硬约束：必须基于改写后的 JSONExtractor 重写、且保留 config 的配置导入。；修复：压缩至限内（去掉“先/依次/并提升质量”等），/extract、JSONExtractor、基于改写后的 JSONExtractor 重写接口、config 五个导入名全部保留。

- 改前：分析并改写知识抽取相关代码：先是 Flask 的 /extract 知识抽取接口，再是 JSONExtractor 的 JSON 块提取与解析，最后基于改写后的 JSONExtractor 重写该接口代码，改进代码质量。
- 改后：分析改写知识抽取代码：改 /extract 接口、JSONExtractor 的 JSON 块提取解析，再据此重写该接口；保留 config 的 KNOWLEDGE_PROMPT、HEADERS、LLM_URL、MODEL、PORT 导入。

## q-0224 — 补上原文明示的请求/响应字段（knowledge_triples、qa_summary、topic_tags、traceId）与 question/answer 示例输入。；修复：压缩至限内（“并给出示例”压成“附示例”），请求入参与 code/data/knowledge_triples/qa_summary/topic_tags/traceId 响应字段全保留。

- 改前：为 memory-extractor 接口编写 API 文档，说明请求字段与响应结构，并给出 question/answer 形式的示例。
- 改后：为 memory-extractor 知识抽取接口编写 API 文档：入参 question/answer，响应 code、data（knowledge_triples、qa_summary、topic_tags）、traceId，附示例。

## q-0225 — 补上原文要求的句级 BM25 打分取 topN、输出 relations 列表与 related_text，以及 history 少于 3 条时直接返回的边界规则。；修复：压缩至限内（去掉“现成/列表”等），split_text/tokenize_text 句级 BM25 取 topN、最相似 history 相关度 1、等长 relations、history≤3 全返全保留。

- 改前：使用 BM25 算法，根据当前 QA 从历史对话中检索出最相近的对话，并给出该检索能力的实现方案。
- 改后：实现 BM25 历史对话检索：用 split_text/tokenize_text 对当前 QA 与历史句子打分取 topN，判定最相似 history（相关度 1），按对话顺序返回句子及等长 relations；history≤3 全返。

## q-0227 — 无需改动：附件、逐文件交付、CleanRL 原则、prompts.py 只导入、Qwen 与 loguru 约定均已写明。

- 改前：参考附件中 Mem0 记忆系统的设计说明，逐个文件实现 Mem0：遵循 CleanRL 原则（单一职责、显式依赖、易测试），prompts.py 只导入不实现，使用 DashScope 的 Qwen 模型与 loguru 统一异常日志。
- 改后：参考附件中 Mem0 记忆系统的设计说明，逐个文件实现 Mem0：遵循 CleanRL 原则（单一职责、显式依赖、易测试），prompts.py 只导入不实现，使用 DashScope 的 Qwen 模型与 loguru 统一异常日志。

## q-0228 — 补上原文强调的 step 五元组返回值（含 truncated），以及中文注释/DocString/typing 等风格规范。；修复：压缩至限内（合并重复的 MCTS 表述、去“在…中实现”），step 五元组（含 truncated）与 Google 风格/中文注释/DocString/typing 要求保留。

- 改前：在 FrozenLake-v1 环境中撰写 MCTS 实现代码，并进一步把 SARSA 与 MCTS 结合；代码需按 Google 风格编写，命名可读、边界条件完整、面向工业场景且具备可扩展性。
- 改后：结合 SARSA 与 MCTS 求解 FrozenLake-v1：注意 gymnasium step 返回五元组（含 truncated），需 Google 风格、中文注释、DocString、typing 注解，工业级可扩展、边界完备。

## q-0232 — 补上原文的 israg 取值语义（0 无需检索、1 联网检索、2 知识库检索，含分类规则）与先中文化并改进、再出保留核心能力精简版的顺序。

- 改前：按 Role/Profile/Goals/Constrains/Skills/Workflow/Initialization 的结构为 ISRAG 生成中英文 Prompt，随后持续改进，并再产出一个保留核心能力的精简版。
- 改后：按 Role/Profile/Goals/Constrains/Skills/Workflow/Initialization 结构生成 ISRAG 中文提示词，判定 0无需检索、1联网检索、2知识库检索，再出保留核心能力的精简版。

## q-0236 — 补上交付物（逐组件分析的 markdown 报告）与原文其余来源 Browserbase、x402 Foundation；按规则不写 URL，只保留名称。

- 改前：围绕 Agentic Commerce Protocol 做多方面深度调研，覆盖 MPP、ACP、Tempo、Stripe 的 Shared Payment Tokens 与 Agentic Commerce Suite 等来源。
- 改后：围绕 Agentic Commerce Protocol 做多方面调研，覆盖 MPP、ACP、Tempo、Stripe SPT、Agentic Commerce Suite、x402 等来源，产出逐组件 markdown 报告。

## q-0239 — 去掉原文没有的「要点表格」说法，明确以给定的 8 篇论文清单为起点、逐篇深度分析并逐篇产出 markdown artifact。

- 改前：深度研究 LLM Agent 错误分析方向的 8 篇论文（TRAIL、Aegis、AgentRx、多智能体失败原因、平台编排失败生命周期等），逐一分析其方法论与失败分类体系，并以附件中的论文清单与要点表格为起点展开。
- 改后：对 LLM Agent 错误分析方向的 8 篇论文（TRAIL、Aegis、AgentRx、多智能体失败原因、平台编排失败生命周期等）逐篇分析其方法论与失败分类体系，并逐篇产出 markdown artifact。

## q-0240 — 补上原文的 ES 连接配置（uris、账号密码、connection/socket 超时）与「class fetch data」的取数意图，保留字段改名说明。

- 改前：用 Python 编写 Elasticsearch 数据查询类：用 term 查询精确匹配 majorEntity（原 entityWord），或匹配 synonymList（原 keywordsList）中任一关键词，且必须是精确匹配。
- 改后：用 Python 写 Elasticsearch 查询类：按给定 uris、账号密码、超时连接，用 term 精确匹配 majorEntity（原 entityWord）或 synonymList（原 keywordsList）任一词。

## q-0241 — 修正题目：原文的知识点正切函数图像与性质（高一），并非三角形面积；并补上 storyboard.md 分镜、竖屏尺寸与仅用 numpy 的 verify_geometry.py 校验修错要求。

- 改前：依据附件中的 Manim 数学教学动画生成指南，为三角形面积题目生成 1080×1920 竖屏教学动画代码，并先产出包含场景、几何计算与元素生命周期的 storyboard.md 分镜脚本。
- 改后：按给定的 Manim 教学动画任务定义，为高一「正切函数的图像与性质」生成 1080×1920 竖屏动画代码，先产出含场景与几何计算的 storyboard.md，再用仅依赖 numpy 的校验脚本验证修复。

## q-0244 — 补上原文的具体知识点（二年级克与千克、认识千、数的读写与组成）与 storyboard.md、verify_geometry.py（仅 numpy）交付物。；修复：仅压缩冗词（删「教学」「并」「几何」）达标至 118 字，交付物与知识点全部保留。

- 改前：按附件中的 Manim 数学教学动画生成指南，用 Manim 为给定数学题生成 1080×1920 竖屏教学动画代码，并遵循其中的分镜与几何计算流程要求。
- 改后：按附件 Manim 动画指南，为小学二年级克与千克、认识千、数的读写与组成知识点产出 storyboard.md 分镜、1080×1920 竖屏 Python 动画代码，用仅 numpy 的 verify_geometry.py 校验。

## q-0247 — 原 std 误作「等差数列」，据原文更正为高二「数列求和方法」与「数列的极限」，并点明 storyboard.md 交付物。

- 改前：依据附件中的 Manim 数学教学动画生成指南，为等差数列题目生成 1080×1920 竖屏教学动画代码，并先产出包含场景、几何计算与元素生命周期的 storyboard.md 分镜脚本。
- 改后：按附件 Manim 教学动画指南，为高二「数列求和方法」与「数列的极限」知识点生成 1080×1920 竖屏教学动画代码，并先产出含场景、几何计算与元素生命周期的 storyboard.md 分镜。

## q-0250 — 补全 11 个教案章节名与「学科→章节→教案章节→信息维度→问题」层级，并点明需给出可直接使用的输出格式。

- 改前：设计按学科章节标题生成教案的框架：针对学情分析、教学目标、课程重点难点、教学过程、作业评价、思政案例等章节，列出每节需要填充的问题及其所需信息维度。
- 改后：设计教案生成的信息采集框架：层级为学科→章节→教案章节→信息维度→问题，覆盖学情分析、教学目标、课程重点/难点、教学准备、教学过程、作业与评价、教学反思、思政案例/元素、教学价值分析，并给出可直接使用的输出格式。

## q-0251 — 补上原文要求的「带 uri、用户名、密码配置的 Neo4j 客户端类」，其余已自洽。

- 改前：用工业生产级实现替换 get_details 存根函数：根据知识点节点 ID 从 Neo4j 图数据库查询 name、description、content 等详情，获取失败时返回 None。
- 改后：用工业生产级实现替换 get_details 存根函数：依据知识点节点 ID 从 Neo4j 查询 name、description、content 等详情，失败返回 None，并配套带 uri、用户名、密码配置的 Neo4j 客户端类。

## q-0254 — 补上图内各层具体组件，使脱离附件也能看懂；项目说明书需求归入另一条问题。

- 改前：在给出的 AI 底座、中间件、应用层三层架构 Mermaid 图基础上，给出改进后的架构图。
- 改后：在给出的 AI 三层架构 Mermaid 图（底座含 LLM、文档解析、embedding、分块、web 检索、数据库；中间件含混合检索、图谱检索、知识图谱；应用层含 AI 问答/AI 出题/AI 教案）基础上，输出改进后的架构图。

## q-0255 — 解掉「上述」指代，点名三层架构图，并说明与架构图改进同批交付。

- 改前：为上述 AI 三层架构撰写一份精炼扼要的项目说明书。
- 改后：为上述这张 AI 底座—中间件—应用层三层架构图撰写一份精炼扼要的项目说明书，与架构图改进方案一并给出。

## q-0261 — 补上批量输入、jieba 分词标签与「先判断是否有同义词，人名、基础词不挖」的规则；原 prompt 的 Role/Goals/Constrains/Workflow 分节保留。

- 改前：分析并迭代「同义词挖掘专家」Prompt：输入多个单词及其对应的 jieba 分词结果，先判断该词是否存在同义词，再返回专业化与口语化同义词的结构化 JSON。
- 改后：分析并迭代「同义词挖掘专家」Prompt：接收多个词及其 jieba 分词标签，先判断是否存在同义词（人名、基础词无需挖掘），再按原有结构化格式返回专业化与口语化同义词 JSON。

## q-0263 — 补上 8 位随机编号、任务内部「输入/TASK/输出」结构、mermaid 工作流、recheck/rethink；原文要求的 Role/Goals/Constrains/Skills/Workflow 分节未展开。

- 改前：设计一个任务分解 Prompt：按用户需求拆出带编号的网状任务，上一层任务的输出压缩为核心信息作为下层任务的输入，并规定每个任务的输入输出内部结构。
- 改后：设计任务分解 Prompt：把需求拆成带 8 位随机编号的网状任务，上层输出压缩为下层输入，任务含「输入/TASK/输出」结构，附 mermaid 工作流与任务出场顺序，核心任务后加 recheck、rethink。

## q-0266 — 补上原文中后段的代码风格硬约束（中文注释+PEP 8、DocString+PEP 257、typing、不得省略代码）与「假设已有 OpenAI API Key」前提；压缩到 120 字内

- 改前：逐步骤深度分析 GraphRAG 论文，提取其框架与实验设计，并设计工业级 GraphRAG 项目的代码结构，按文件逐个给出可读性优先、边界条件完整的实现代码。
- 改后：逐步骤深度分析 GraphRAG 论文并提取其框架与实验设计；再按文件逐个给出工业级 GraphRAG 项目代码，可读性优先、边界完整、不省略（假设已有 OpenAI API Key，中文注释＋DocString＋typing）。

## q-0267 — 补上原文要求的 Prompt 七段结构与 JSON 输出字段；压缩到 120 字内

- 改前：设计一个 Prompt：从大学政策文档的双向树结构中，根据输入的 query 解析出可能存在的起始节点与结束节点，并输出 NODE_LABEL、NODE_KEYWORDS 等结构化字段。
- 改后：设计提示词（Role/Goals/Constrains/Workflow 等七段），从大学政策双向树中解析 query 并判断可能的起止节点，输出 nodeLabel/nodeKeywords/relationType 的 JSON。

## q-0268 — 补上「Python 调用类」这一交付物，接口名沿用 openDomainRag-recommend；压缩到 120 字内

- 改前：为 ai-platform 的 openDomainRag-recommend 推荐接口封装调用类，并实现 wrapper_results 函数，把最长的 3 条 title、description、url 组合成一个字符串返回。
- 改后：为 ai-platform 的 openDomainRag-recommend 接口写 Python 调用类，并实现 wrapper_results 把最长 3 条结果的 title、description、url 拼成一个字符串返回。

## q-0270 — 补上原文的三项交付物（接口字段 markdown 分析、playwright 分栏目 Python 代码、7x24.skill 打包下载）

- 改前：基于我 F12 抓包得到的新浪财经 zhibo 接口返回数据（见附件），设计 7×24 快讯接口数据的分栏目爬取方案。
- 改后：分析我 F12 抓包得到的新浪财经 7×24 直播 zhibo feed 接口的字段并输出 markdown，再用 playwright 构建分栏目抓取快讯的 Python 代码，最后打包成可下载的 7x24.skill 技能包。

## q-0272 — 补上原文要求的七段 Prompt 结构与「用中文输出」约束，并按 120 字上限压缩；subject 缩短到 20 字

- 改前：Improve the prompt that generates an optimized title from parent title, filename, original title and content, keeping contextual continuity with the parent. Give the result in Chinese.
- 改后：Restructure the title prompt (parent title, filename, original title, content) into seven sections, in Chinese.

## q-0282 — 补上原文核心诉求：改写 query_body、必须用 query_term 变量（而非硬编码），使「免试」和「免试的流程」都能命中

- 改前：分析这条 Elasticsearch bool/should 查询：为什么用 query="免试" 能命中 majorEntity 为「免考」、synonymList 含「免试」的文档？并确认 query_term 在此查询中的正确用法。
- 改后：为什么用「免试」做 bool/should 查询能命中 synonymList 含「免试」的文档，而「免试的流程」查不到？请改写 query_body，用 query_term 让两字段完全匹配输入。

## q-0288 — 补上异常真因的定位（log_sync 在非主线程调用 asyncio.get_event_loop() 失败），替换原来含糊的「抛出的异常」

- 改前：修复 knowledge_extract.py 中 JsonlLogger.log 协程从未被 await 的 RuntimeWarning 并改进我的代码，同时解决随后 extract/_save_log 抛出的异常。
- 改后：修复 knowledge_extract.py 中 JsonlLogger.log 协程未 await 的 RuntimeWarning，以及 _save_log 非主线程经 log_sync 取不到事件循环的 RuntimeError。

## q-0295 — 补上原文的点/线/面三层题型说明与「不要给出 Python 代码」约束

- 改前：整理基于树状知识图谱的 AI 自动出题系统需求文档，覆盖节点结构（node_id、label、level、source_chunks、questions、children）以及各层级题型的生成要求。
- 改后：整理树状知识图谱 AI 自动出题系统的需求文档：说明节点结构（node_id/label/level/questions/children 等）与点、线、面三层（预存知识点题、多跳路径题、dropout 体系题）的生成要求，不写代码。

## q-0317 — 原文只称「该代码」未指明语言（同轮对话要求改用 Python），故去掉未经原文证实的 JavaScript 表述，其余保留。；修复：仅删冗余修饰（「那段用于」「的」）达标至 117 字，其余不变。

- 改前：分析附件中用于 Markdown 文本分块的 JavaScript 正则表达式，说明它如何覆盖标题、列表、代码块、表格、LaTeX 等结构，并解释 Emoji_Presentation、Extended_Pictographic 等 Unicode 属性的含义。
- 改后：分析此前提供的 Markdown 文本分块正则代码，说明它如何覆盖标题、列表、代码块、表格、LaTeX 等结构，并解释 Emoji_Presentation、Extended_Pictographic 等 Unicode 属性的含义。

## q-0318 — 无需改动：重写目标、Unicode 属性处理与代码风格约束均已完整。；修复：仅压缩冗余表述（删「中」「完整」「情况」「并」等）达标至 119 字，要求项全部保留。

- 改前：用 Python 重写附件中的文本分块正则逻辑，完整处理 Emoji_Presentation、Extended_Pictographic 等 Unicode 属性；要求工业级实现、命名与可读性良好、遵循 Google 风格并覆盖全部边界情况与所有模式，不得遗漏。
- 改后：用 Python 重写附件的文本分块正则，处理 Emoji_Presentation、Extended_Pictographic 等 Unicode 属性；工业级实现、命名与可读性佳、遵循 Google 风格，覆盖全部边界与模式，不遗漏。

## q-0320 — 补上原文中「获得的数据结构要和 get_neighber 保持一致」这一硬约束，并沿用原文的关系类型写法。

- 改前：在 Neo4j 知识图谱中实现按关系类型区分邻居检索的函数：连接为「包含」的边沿用 get_neighbour 逻辑，连接为「关联」或「前后序」的边改用 BFS 沿该类关系取全部节点。
- 改后：在 Neo4j 知识图谱中实现按关系类型区分邻居检索的函数：「包含」关系沿用 get_neighbour 逻辑，「关联」与「前后序」关系改为沿该类关系 BFS 取全部节点，且返回数据结构需与原函数保持一致。

## q-0326 — 把含糊的 qwen-0.6B 细化为原文的 Qwen3-0.6B（LLM）与 Qwen3-Embedding-0.6B（向量），点明数据集 Simple Wikipedia，并去掉原链接。

- 改前：设计 HyDE 项目的代码分类并逐文件给出工业级实现（假设已有 API key）；随后改用 qwen-0.6B 模型并加载 Wikipedia 数据集重建该项目，按给定目录结构生成各模块文件。
- 改后：设计 HyDE 项目的代码分类并逐文件给出工业级实现（假设已有 API key）；再改用 Qwen3-0.6B 与 Qwen3-Embedding-0.6B，加载 Simple Wikipedia 数据集，按给定目录结构重建各模块文件。

## q-0327 — 补明整合后仍按七段结构模板改进、并用 Mermaid 呈现工作流；原文只提到「三个prompt」而没有给出内容，该指代无法确定。

- 改前：把附件中的三个 prompt 逐步整合为一个，再按 Role/Profile/Goals/Constrains/Skills/Workflow/Initialization 结构模板改进，最后结合 Mermaid 图呈现其工作流。
- 改后：把三个 prompt 逐步整合为一个，再按 Role/Profile/Goals/Constrains/Skills/Workflow/Initialization 结构模板改进，并用 Mermaid 图呈现其工作流。

## q-0328 — 补上原文的 BM25+embedding 加权混合检索要求、ROUGE/BLEU-1/BLEU-4/METEOR 四项指标名称与「按文件逐个给出完整代码」的交付约束。

- 改前：基于 allenai/qasper 数据集构建工业级检索评估系统，实现 BM25、moka-ai/m3e-base 向量检索以及两者加权混合共三种检索方法并给出评估指标。
- 改后：基于 allenai/qasper 数据集构建工业级检索评估系统：实现 BM25、moka-ai/m3e-base 向量检索及加权混合三种方法，用 ROUGE/BLEU-1/BLEU-4/METEOR 评估，分文件给出完整代码。

## q-0329 — 补上原文的 12 轮对话上限与「输入 node_id 返回最终状态」的 FastAPI 交付要求；教授即费曼 agent。

- 改前：基于 settings.yml 中读入的知识树 JSON 数据，用 LangGraph 设计费曼学习法工作流：由教授与学生对 agent 对话，把知识节点讲清并检验学生理解。
- 改后：基于 settings.yml 读入的知识树 JSON，用 LangGraph 设计费曼学习法工作流：教授与学生两个 agent 交替对话最多 12 轮，并暴露 FastAPI 接口按 node_id 返回最终状态。

## q-0330 — 补上被重写 prompt 的实际任务内容（节点关系链转成一句话 / 按路径生成三个口语化问题并输出 JSON）；模板中 Profile 的 author/version/description 因长度上限从略。

- 改前：按 Role、Profile（author/version/description）、Goals、Constrains、Skills、Workflow、Initialization 的结构模板重写给定的 prompt。
- 改后：用 Role/Profile/Goals/Constrains/Skills/Workflow/Initialization 模板重写提示词：把知识图谱节点关系链重组为一句自然语言或生成三个口语化问题，输出 JSON。

## q-0331 — 原 std 为 134 字超出 120 字上限，压缩措辞后补明 query 可空、以及压缩结果需保持 chunk 原顺序。

- 改前：基于已有的 DocChunker 与 tokenize_text，用 SingleRank 构建文档压缩类：输入 doc、query、max_length、topN（query 默认 None），按 topN 或 max_length 截取并保持 chunk 原顺序。
- 改后：基于 DocChunker 与 tokenize_text，用 SingleRank 实现文档压缩类：入参 doc、query（可空）、max_length、topN，按 topN/max_length 压缩并保持 chunk 原顺序。

## q-0332 — 把悬空指代「上述代码逻辑」点名成上一轮的 SingleRank 压缩器（DocChunker 分块 + PageRank 打分），并补上保持 chunk 原顺序的约束。

- 改前：沿用前述分块与打分逻辑，实现 PositionRank 的文档压缩方案，覆盖带 query 与不带 query 两种模式。
- 改后：基于上一轮 SingleRank 压缩器的分块与 PageRank 打分逻辑，实现 PositionRank 文档压缩，覆盖带 query 与不带 query 两种模式，并保持 chunk 原顺序。

## q-0337 — 补上原文中后段的两项交付物：接口字段分析 markdown 文档与可下载的 7x24 skill 包。

- 改前：深度搜索分析新浪财经 7x24 实时快讯接口（含全部、A股、宏观、公司、市场、国际、观点等 tags），并据此构建 Python 爬虫抓取该数据。
- 改后：深度分析新浪财经 7x24 实时快讯接口（全部、A股、宏观等 tags），构建覆盖各分类的 Python 抓取代码与文档，并打包为可下载的 skill。

## q-0340 — 解掉悬空指代「上述」：据 reply 指向路线图代码（PathElement/RoadMapEdge 构建与相似度评分）。

- 改前：复查上述路线图代码并改进，输出改进后的完整代码。
- 改后：复查此前路线图代码中路径元素构建与相似度评分的问题并改进，输出改进后的完整代码。

## q-0343 — 补上原 std 缺失的规模与交付格式：500 条、每批 10 条、随机抽样、CSV 字段。

- 改前：结合已有的 gpt_service 调用（prompt 构造与 JSON 解析）和 baike_alias.json 数据格式，编写百科实体抽取与分类的处理代码，并按总记录数随机抽样条目。
- 改后：基于已有的 gpt_service 构造 prompt 并解析 JSON，从 baike_alias.json 随机抽取 500 条（每批 10 条）做实体分类，结果（name/分类/置信度）写入 CSV。

## q-0345 — 补上原文中被漏掉的硬约束「每轮路径至少 4 个节点」，并以更紧凑表述容纳它。

- 改前：用 Python 逐文件实现知识图谱探索系统：以 query 与 parentKbIds 为输入，经 Milvus 召回与文本相似度融合评分选出 top10 唯一节点，通过图搜索获取路径并递归三次、合并公共节点形成大图。
- 改后：用 Python 逐文件实现知识图谱探索系统：输入 query 与 parentKbIds，经 Milvus 召回与文本相似度融合评分取 top10 唯一节点，图搜索得至少 4 节点路径并递归 3 次合并公共节点成大图。

## q-0347 — 补上原文 notice 里的技术约束：artifact 分文件交付、LangChain 递归分块、插件化、bge-m3 embedding、MAP@K 等指标。

- 改前：设计 LightRAG 项目的详细代码分类，并逐个文件给出工业级实现；遵循 Google 代码风格，重视可读性、命名、边界条件与可扩展性。
- 改后：设计 LightRAG 项目结构并逐文件以 artifact 输出工业级实现：LangChain 递归分块、插件化机制、bge-m3 embedding、MAP@K 等指标，代码遵循 Google 风格、重视可读性与扩展性。

## q-0348 — 补上原文末尾点名的具体交付文件 tree_builder.py 与 main.py，以及需同步更新相关文件。

- 改前：补全 RAPTOR 项目中尚未实现的部分，并按指定目录结构（config、core、retrieval、evaluation、utils 等）逐文件重组代码。
- 改后：补全 RAPTOR 项目未实现的部分：按规定的 raptor_project 目录结构实现 raptor/core/tree_builder.py 与 main.py，并同步更新相关文件。

## q-0349 — 补上原文的关键模型约束（0.5b 抽实体、7b 生成答案）与 cypher+embedding 混合检索，保留预留扩展接口的要求。

- 改前：参考 CleanRL 的设计框架与解耦原则，基于 Neo4j 与 Ollama 构建 AI 回答助手：生成 embedding、构建图 schema 并写入节点数据，同时为后续新增功能预留可扩展接口。
- 改后：参考 CleanRL 解耦设计，基于 Neo4j 与 Ollama（qwen2.5:0.5b 抽实体、7b 生成答案）构建 AI 回答助手：写入节点 embedding、cypher 与 embedding 混合检索，并为新功能预留接口。

## q-0354 — 补上原文中段的功能硬约束（增、完成、删除、拖拽与个人页时间流），使需求脱离对话仍可执行

- 改前：设计并实现「重要紧急四象限」事项安排的前端动态网页：首页为直角坐标系（横轴紧急程度、纵轴重要程度），并按坐标转换函数续写后续完整代码。
- 改后：设计并实现「重要紧急四象限」事项安排前端网页：首页为直角坐标系（横轴紧急程度、纵轴重要程度），支持事项新增、完成、删除、拖拽及个人页时间流；接着坐标转换函数续写完整代码。

## q-0357 — 点明被分析的是 determine_rag 函数，并限定改进范围只针对中文问句词

- 改前：详细分析给定代码（含 IGNORE_WORD_LIST 词表与 intent_determine_rule 调用）的逻辑，并针对中文问句词给出可迭代改进的点。
- 改后：详细分析 determine_rag 函数的判断逻辑（含 IGNORE_WORD_LIST 词表与 intent_determine_rule 调用），并只针对中文问句词给出可迭代的改进点。

## q-0360 — 补上待改写提示词的具体内容（提炼金句、设计知识卡片），消解 the prompt 的悬空指代

- 改前：按给定的结构化框架（Role、Profile、Goals、Constraints、Skills、Workflow、Initialization）改进提示词，使角色、目标、约束与工作流层次清晰。
- 改后：按 Role/Profile/Goals/Constraints/Skills/Workflow/Initialization 框架，改写那条「内容策展人与视觉设计师提炼金句并设计知识卡片」的提示词。

## q-0363 — 补上按文件逐个交付、new/append/delete/fetch 记忆操作代码，以及 Redis 与 OpenAI 的对应关系

- 改前：基于四层架构设计并实现 AI 教学对话记忆系统：数据库用 Redis、LLM 用 OpenAI，遵循 CleanRL 设计原则，并为各模块设计与实现相应 Prompt。
- 改后：基于四层架构设计并实现 AI 教学对话记忆系统：Redis 存数据、OpenAI 作 LLM，按文件逐个给出 new/append/delete/fetch 等代码与配套 Prompt，遵循 CleanRL 原则。

## q-0364 — 三条新规定（key 长度≥4 的归一化编辑距离阈值、label 过滤词、lang 尽量用 get）均已写入，仅把长度条件改写得更短

- 改前：清洗 baike_alias.json 百科别名数据并改进代码：当 key 长度不小于 4 时，剔除与其归一化编辑距离大于 0.8 的 baikeAlias；当 label 中含书籍、人物、出版社时删除整个词条；访问 lang 尽量用 get。
- 改后：清洗 baike_alias.json 百科别名数据并改进代码：key 长度≥4 时，剔除与其归一化编辑距离大于 0.8 的 baikeAlias；label 含书籍、人物、出版社时删除整个词条；lang 尽量用 get。

## q-0366 — 补上原文要求的 Role/Goals/Constrains/Skills/Workflow 提示词结构与三个输出 key

- 改前：构造一个 Prompt：从输入的一对 Question-Answer 中提取 topic_tags、qa_summary 与 knowledge_triples，并以这三个 key 输出 JSON。
- 改后：构造 Prompt：按 Role/Profile/Goals/Constrains/Skills/Workflow 结构，从 QA 提取 topic_tags、qa_summary、knowledge_triples 并输出 JSON。

## q-0368 — 点名支持的格式（PDF/Word/PPT）、overlap_size=64 与「overlap 必须是完整句子」的硬约束，并补上交付物 main.py/test.py/FastAPI app.py。

- 改前：用 Python 构建多格式文档解析项目（PDF 用 fitz、Word、PPT 等提取文本），并实现按中英文标点切分的递归文本分割器：给定 chunk_size 与 overlap_size（64），overlap 必须保留完整句子而非按长度截断；随后补齐 main.py、test.py 以及使用 FastAPI 的 app.py。
- 改后：构建 Python 多格式文档解析项目（PDF/Word/PPT），实现按中英文标点递归切分、overlap 须为完整句子（overlap_size=64）的分割器，交付 main.py、test.py 与 FastAPI app.py。

## q-0369 — 补上改写约束（陈述句式、最多保留 2 条）并保留「步骤分析 + JSON 输出」与高频相关词要求。

- 改前：分析并改进大学政策类文件智能查询改写 Prompt：根据用户 QUERY 与目录结构生成适合政策搜索的查询语句列表，并展示步骤分析与 JSON 输出；同时要求目录结构中与 QUERY 相关且反复出现的词出现在最终结果中。
- 改后：分析并改进大学政策类文件智能查询改写 Prompt：按 QUERY 与目录结构生成适合政策检索的查询列表（陈述句、最多 2 条），输出步骤分析与 JSON，且目录中与 QUERY 相关且反复出现的词须出现在结果中。

## q-0370 — 补上原文核心要求——按指定结构构造 prompt（而非直接分类），并点名输入为 name 与 label 列表。

- 改前：给定一个名称（如「詹姆斯·韦伯太空望远镜」）及其 label 列表，依据给定的学科门类体系（工程学、计算机科学与技术等）判断并输出其所属学科类别。
- 改后：按 Role/Profile/Goals/Constrains/Skills/Workflow 结构构造学科分类 Prompt：输入 name（如「詹姆斯·韦伯太空望远镜」）与 label 列表，判断所属学科门类并输出 JSON。

## q-0374 — 点明交付物为完整 MVP，并列出文档中的核心功能模块。

- 改前：按给定的产品设计文档构建婚恋网站的微信小程序代码，覆盖产品定位、合规与审核要求、实名匹配与沟通、风险防控等模块。
- 改后：根据给定的婚恋网站产品设计文档构建微信小程序代码，交付完整 MVP：实名认证与资料、推荐匹配、聊天、内容审核与举报风控等模块。

## q-0377 — 去掉原文没有的「保留现有方式」约束，点名 Qwen_All 与「远端已存在该目录」，并移除原文中的服务器地址。

- 改前：用 scp -r 把本地 Qwen_All 目录传到远程服务器时，远端已存在该目录且只有少量代码改动，如何在保留现有方式的前提下减少传输量？
- 改后：本地 Qwen_All 目录已用 scp -r 传到远程服务器，远端已有该目录且只有少量代码改动，如何避免全量传输、减少传输量？

## q-0380 — 解掉「前述调研」指代——即此前对散户 Serenity 投资方法论的调研。

- 改前：基于前述调研，用 skill creator 设计一个技能：编写 skill.md 与 references/，在 skill.md 中支持加载或委派子代理补充调研信息，并打包成可下载的 .skill 文件。
- 改后：基于此前对散户 Serenity 投资方法论的调研，用 skill creator 设计技能：写 SKILL.md 与 references/，SKILL.md 支持加载或委派子代理补充调研，并打包成可下载的 .skill 文件。

## q-0387 — 补上原文第二步：用 skill creator 生成 skill.md + references 并打包 .skill 供下载。

- 改前：对世界上著名的五大学习法（费曼学习法、西蒙学习法、SQ3R 阅读法、番茄学习法、康奈尔笔记法）做深度搜索与详细调研思考，逐一产出 markdown 分析文档。
- 改后：对世界五大学习法（费曼、西蒙、SQ3R、番茄、康奈尔笔记）做深度调研，逐一产出 markdown 分析文档，再用 skill creator 生成含 skill.md 与 references 的技能并打包成 .skill 供下载。

## q-0391 — 点名被重写的模块职责（chunk_text 分发 SemanticChunker/GeneralTextSplitter）及其依赖来源，替换原先含糊的表述。

- 改前：Rewrite the Python module depending on config and util.semantic_chunks utilities for better structure and readability.
- 改后：Rewrite the given Python text-chunking module (chunk_text dispatching to SemanticChunker and GeneralTextSplitter, importing from config.config and util.*) to improve structure, readability and maintainability.

## q-0392 — 补上原文类中的方法名 fast_compress/slow_compress 以锚定改写对象为原文那段 Python 代码；改写目标取自对话标题。

- 改前：Analyze and rewrite the DocCompress class (document compression) for better structure, readability and maintainability.
- 改后：Analyze and rewrite the provided DocCompress class code (document compression with fast_compress and slow_compress) to improve structure, readability and maintainability.

## q-0395 — 补上任务本体（撰写某主题科普文章）与「大学生语言、多用比喻、活泼有趣、便于读者代入」等约束。

- 改前：按照给定的 prompt 结构（Role、Profile、Goals、Constrains、Skills、Workflow、Initialization）设计一个用于科学传播的提示词。
- 改后：按给定 prompt 结构（Role、Profile、Goals、Constrains、Skills、Workflow、Initialization）设计科普文章写作 prompt，要求用大学生语言、多比喻、活泼有趣、易代入。

## q-0396 — 补上 string list + query 的应用场景、score 分母定义，以及预处理加速、中文注释与类型标注等交付要求。

- 改前：针对给出的应用场景优化 Ratcliff/Obershelp 字符串相似度算法（附有现有实现），从多个角度给出改进方案。
- 改后：优化 Ratcliff/Obershelp 字符串相似度算法：给定 string list 与 query，按分母为 string 长度的 score 找最高分 string，要求预处理加速并给出带中文注释、类型标注的工业级完整代码。

## q-0399 — 删去原文没有的「搜索/结果处理/错误处理」三角度（那来自回复），补上类中方法 search_knowledge 以锚定改写对象。

- 改前：Improve the ElasticSearchClient class from multiple perspectives: search, result processing and error handling.
- 改后：Improve the provided ElasticSearchClient class code (Elasticsearch client with a search_knowledge method) from multiple perspectives.

## q-0401 — 把「上述调研内容」解为新闻学/传播学知识与抖音、小红书爆款文案经验，并保留 skill-creator 与打包为 skill 文件的交付要求。

- 改前：依据上述调研内容，使用 skill-creator 构建短视频脚本撰写 skill，产出 SKILL.md、references、examples 等文件并打包为 skill。
- 改后：依据对新闻学/传播学知识及抖音、小红书爆款文案经验的深度调研，用 skill-creator 构建短视频脚本撰写 skill，产出 skill md、references、examples 并打包为 skill 文件。

## q-0404 — 原文只给了 github 链接，故去掉「GitHub」字样、改用项目名 gsd-build/get-shit-done 指代，其余与原文一致。

- 改前：深度调查 GitHub 项目 gsd-build/get-shit-done 中 GSD-skill 各组件的核心内容框架系统，逐个展开详细讲解，并撰写多篇 markdown 科普博客。
- 改后：深度调查 gsd-build/get-shit-done 项目中 GSD-skill 各组件 skill 的核心内容框架体系，逐个展开详细讲解，逐篇撰写多篇 markdown 科普博客。

## q-0405 — 点名四个接口（生成问题、生成教案、段落润色、文档生成）以替代笼统的「四个接口」，其余保持。

- 改前：根据 AI 教案生成的流程设计接口文档，覆盖四个接口，要求输入输出参数精准、参数命名规范，给出完善的接口文档。
- 改后：根据 AI 教案生成流程（生成问题、生成教案、段落润色、word/pdf/ppt 文档生成）设计四个接口的文档，要求输入输出参数精准、命名规范、文档完善。

## q-0410 — 把「奠基性论文」具体化为原文列出的六篇论文与数据集名，使检索对象明确。

- 改前：深度搜索并解析预训练语料清洗领域的奠基性论文，包括 C4 数据集等定义工业标准清洗流水线的工作。
- 改后：深度搜索解析 C4、CCNet、The Pile、RefinedWeb、FineWeb、Dolma 等预训练语料清洗奠基性论文（工业标准流水线）。

## q-0411 — 把「这些语料清洗工作」具体化为六篇论文工作，并保留 claude design 可视化与逐篇持续产出 markdown 的要求。

- 改前：构建这些语料清洗工作的系列发展脉络并做可视化设计，解耦并逐一详细分析各个组件与各篇论文，持续产出 markdown 文档。
- 改后：为上述 C4、CCNet、The Pile、RefinedWeb、FineWeb、Dolma 等语料清洗工作构建发展脉络并用 claude design 做可视化，解耦各组件与论文逐一详析，持续产出 markdown 文档。

## q-0412 — 补上原文后半段的委托交付物——宏观经济政策类短视频内容引流规划，并把「产学研合作」还原为原文用语「高校/科研机构技术合作」。

- 改前：为 ESR（易商红木，港交所 1821）制定从工业地产开发商升级为企业综合服务平台的业务战略，设计空间载体与涵盖政府资源对接、产学研合作、产业链整合、FA 服务的增值服务包。
- 改后：为 ESR（易商红木，港交所 1821）制定从工业地产开发商升级为企业综合服务平台的业务战略，设计空间载体与政府资源对接、高校/科研机构技术合作、产业链整合、FA 服务等增值服务包，并规划宏观经济政策类短视频内容引流。

## q-0416 — 把悬空的「该检索代码」明确为原文所述从 PDF 提取的树状知识图谱检索代码，其余字段与要求原文已具备。

- 改前：改进该检索代码：按中英文标点把口语化 query 切分为多个子 query，结合 nodeName、nodeKeyWordList、relatedTreeNodeList、nodeLevel 重新设计查询逻辑，尤其是 query_body。
- 改后：改进树状知识图谱的检索代码：按中英文标点把口语化 query 切成多个子 query，结合 nodeName、nodeKeyWordList、relatedTreeNodeList、nodeLevel 重设计 query_body。

## q-0418 — 删掉原文没有的「基于 Selenium」这一推断修饰，补上同一条消息里的 URL_QUEUE 探索与利用要求。

- 改前：检索并检查改进 intelligent-browser-tool 项目的 browser_engine.py（基于 Selenium 的网页获取与交互引擎），修复其中的问题。
- 改后：检索、检查并改进 intelligent-browser-tool 项目的 browser_engine.py，修复其中的问题，并充分利用 URL_QUEUE 做探索与利用。

## q-0422 — 结构清单补上原文要求的 Initialization，并把输出要求明确为含 title 字段的 JSON。

- 改前：按指定结构（Role、Profile、Goals、Constrains、Skills、Workflow）构建「标题生成」PROMPT，输出 title 字段的 JSON，并在保留核心能力的前提下简化该 PROMPT。
- 改后：按指定结构（Role、Profile、Goals、Constrains、Skills、Workflow、Initialization）构建「标题生成」PROMPT，输出 title 字段 JSON，并在此基础上简化但保留核心能力。

## q-0423 — 补上交付物（县级数据库、可复现代码、研究报告）与禁止编造数据的硬约束，去掉悬空的“按任务书”。

- 改前：按任务书以专家研究团队的标准，系统研究江西省县域社会结构、人口变迁、劳动就业、退休养老、住房公积金与公共资源分配之间的关系，给出真实可追溯的实证分析与政策研究。
- 改后：以社会学、人口学、公共财政等专家研究团队的标准，系统研究江西省县域社会结构、人口变迁、劳动就业、退休养老、住房公积金与公共资源分配的实证研究，交付县级数据库、可复现代码与研究报告，禁止编造数据。

## q-0424 — 补上原输出字段 unique_cleaned_job_names 与原文中后段的交付要求（Google 风格、中文注释、typing 注解的完整代码）。

- 改前：分析招聘数据处理代码，构建以 job_names 为输入、输出唯一清洗后职位名称的函数，并持续补充清洗模式与规则、修复清洗效果差的边界案例。
- 改后：分析招聘职位清洗代码，构建以 job_names 为输入、unique_cleaned_job_names 为输出的函数，补充更多清洗模式并修复效果差的边界案例，交付遵循 Google 风格、含中文注释与 typing 注解的完整代码。

## q-0426 — 点名“大学政策类文件搜索改写师”这一指代对象，补上术语映射示例与输出最终 PROMPT 的交付要求。

- 改前：改进实体抽取 prompt：判断每个提取的实体是否需要抽象、是否需要保留，把保研、综测等口语化实体转化为高校专业术语，并补充示例。
- 改后：改进大学政策类文件搜索改写师 PROMPT：为每个提取实体判断是否需抽象与保留，把保研、综测等口语化实体转为本科生推免、综合素质测评等专业术语，补两个 context 为空的示例并输出最终优化 PROMPT。

## q-0427 — 用项目结构里的 epub-to-notion 名称替换泛指的项目指代，并点明图片导入与 blocks 数量限制这两项具体诉求。

- 改前：完善 EPUB 解析并存入 Notion 嵌套页面的项目：更全面地解析 EPUB（含图片导入 Notion）、充分利用 quote 等 Notion 元素增强阅读体验、改善 blocks 超限截断导致的内容缺失，并给出代码。
- 改后：继续完善 epub-to-notion 项目：更全面地解析 EPUB 并尝试导入图片、充分利用 quote 等 Notion 元素增强阅读体验、解决 blocks 数量超限截断导致的内容缺失，并给出完善后的代码。

## q-0428 — 点名参考文件 scraper_ar5iv.py 与 epub2notion 的逻辑，并保留 arxiv api 抓参考文献、建子页面的要求。

- 改前：参考已有 ar5iv 与 epub2notion 代码构建 ar5iv2notion：输入 arXiv id 提取标题作者，用 quote、table 等元素写入 Notion，再用 arXiv API 抓取参考文献并建子页面。
- 改后：参考 epub2notion 与 scraper_ar5iv.py 构建 ar5iv2notion：输入 arxiv id 提取标题作者，用 quote、table 建 notion 页面，再用 arxiv api 解析参考文献建子页面。

## q-0430 — 用原文用词 arxiv-id、nested pages、sub pages、market 替换中文泛称，保留市场调研与发布要求。

- 改前：设计两个 Notion 插件（传入 EPUB 在当前或指定页面创建一本书的嵌套页面；传入 arXiv id 创建论文页面并含参考文献子页面），并做市场调研、产品设计与发布到 Notion 市场的方案。
- 改后：设计两个 notion 插件：传入 epub 创建一本书的 nested pages，传入 arxiv-id 创建含参考文献 sub pages 的论文页面；并做市场调研、产品设计与发布到 notion market 的方案。

## q-0434 — 去掉原文没有的附件标题，改用 orig 中真实存在的 manim-math.skill、storyboard.md、verify_geometry.py，并补上 1080×1920 竖屏约束。

- 改前：按附件《Manim 数学教学动画生成专业指南》与任务定义，为五年级梯形面积公式一课生成 Manim 教学动画：研读技能文档、产出 storyboard.md 分镜脚本并完成验证实现，输出 1080×1920 竖屏视频代码。
- 改后：为五年级「梯形的面积」生成 Manim 教学动画：研读 manim-math.skill，产出 storyboard.md 分镜脚本，用 verify_geometry.py 校验几何与边界，输出 1080×1920 竖屏视频。

## q-0437 — 去掉只出现在回复里的 ReSP 展开，其余无需改动。

- 改前：对 Iterative RAG（ReSP：Retrieve、Summarize、Plan）多跳问答论文做极详细的逐步分析：提取模型结构、数据结构与数据集、实验设置、不同 ablation 对比以及图表分析。
- 改后：对 Iterative RAG 多跳问答论文做极详细的逐步分析：提取模型结构、数据结构与数据集、实验设置、不同 ablation 对比以及图表分析。

## q-0438 — 补上论文名与 config yaml、逐文件实现等交付要求；为控长度未写入 LLM 用 qwen3-0.6B 与中文注释细节。

- 改前：为 Iterative RAG 论文设计工业级项目框架：用 factory 模式组织 ablation 实验，输出 figures、tensorboard、loguru 日志与 config yaml，并逐个代码文件给出详细实现，注释与 docstring 用中文。
- 改后：为 Iterative RAG 论文设计工业级项目框架：用 factory 模式组织 ablation 实验，输出 figures、tensorboard、loguru 与 config yaml，逐文件给出完整实现。

## q-0439 — 补上「prompt 用中文」的要求，并写清输入项与 chapterTitle/subTitle 双键 JSON 输出。

- 改前：把两个 prompt 合并成一个：输入文本内容、当前标题、所在文件名、上级与上上级标题，输出含 chapterTitle 与 subTitle 两个键的 JSON。
- 改后：把两个 prompt 合并成一个中文 prompt：输入文本的内容、当前标题、所在文件名、上级与上上级标题，输出含 chapterTitle 与 subTitle 两个键的 JSON。

## q-0442 — 补上论文名与 config yaml，并明确可读性优先、命名规范的代码要求。

- 改前：为 ALBERT 论文的实验设计工业级项目框架：用 factory 模式组织 ablation 实验，输出 figures、tensorboard、loguru 与 config yaml，并逐个代码文件给出可读性优先、命名规范的详细实现。
- 改后：为 ALBERT 论文设计工业级实验框架：用 factory 模式组织 ablation 实验，输出 figures、tensorboard、loguru 与 config yaml，逐代码文件给出可读性优先、命名规范的实现。

## q-0445 — 去掉 orig 与 reply 中都查不到的附件名 paste.txt，改为泛指原始文本，并补上 regex 列表与 Google/PEP 风格要求。

- 改前：分析附件 paste.txt（约 9.8KB）中从原始文本转成 Markdown 文本的规律，并用 Python 实现该转换器。
- 改后：分析原始文本转成 Markdown 的规律，用 Python 实现基于 regex 列表的转换器，要求工业级完整实现（Google 风格、PEP 8 中文注释、PEP 257 DocString、类型注解）。

## q-0446 — 原 std 已 170 字超限，压缩到 116 字，保留层级相等的 relation、dfs_paths、a.level=b.level 停止递归与 r->...->a->b 路径等要点。

- 改前：详细分析 PathBuilder._build_all_paths 的代码，处理 fromNodeLevel 与 toNodeLevel 相等的 relation 会导致 DFS 死循环的问题，并按要求完善 dfs_paths：从根节点出发，遇到 a.level=b.level 时在 b 处停止 DFS，保留 r->…->a->b 路径。
- 改后：分析 PathBuilder._build_all_paths：层级相等的 relation 会导致 DFS 死循环，完善 dfs_paths，遇 a.level=b.level 在 b 处停止递归，保留 r->...->a->b。

## q-0453 — 解掉「上述」的悬空指代，点名为原 AI 教案生成系统的对话代码逻辑；文件清单共 8 个模块，故以 4 个举例加总数。

- 改前：把上述 AI 对话的全部代码逻辑改造为可视化 Gradio 对话框，涉及 config.py、llm_service.py、memory.py、nodes.py、graph.py、main.py、models.py、question_bank.py 等模块。
- 改后：把原有 AI 教案生成系统的对话代码逻辑改造为可视化 Gradio 对话框，涉及 config.py、nodes.py、graph.py、main.py 等 8 个模块。

## q-0454 — 点名要简化的 prompt 是 QUERY_REWRITE_PROMPT_WITH_CATEGORY_1220，其余原意与约束不变。

- 改前：分析现有大学政策查询改写 prompt，产出一个精炼、专业、简化的版本，要求保留核心工作流并最终输出 JSON。
- 改后：分析现有的大学政策类智能查询改写 prompt（QUERY_REWRITE_PROMPT_WITH_CATEGORY_1220），产出一个精炼、专业、简化的版本，保留核心工作流并最终以 JSON 输出。

## q-0455 — URL 改为 owner/repo 写法 gumyr/build123d，并明确交付物是 markdown artifact；技能打包要求归入另一条问题。

- 改前：深度分析 build123d Python CAD 库（github.com/gumyr/build123d），覆盖各类内容、技巧、函数与组件，输出一份详细的 markdown 参考文档。
- 改后：深度分析 build123d（gumyr/build123d）Python CAD 库，覆盖各类内容、技巧、函数与组件，输出一份详细的 markdown artifact。

## q-0467 — 补上按文件分别产出 artifact 的交付要求；「上述需求文档」在 orig 与 reply 中都没有具体内容，指代无法确定，按原文保留。

- 改前：基于上述产品需求文档设计项目框架并划分代码模块（含 prompts.py、config.py 等），本地题库使用 data/questions.json，逐个文件给出。
- 改后：基于上述需求文档设计项目框架、划分代码模块（包括 prompts.py、config.py 等），本地题库用 data/questions.json，逐个文件分别以 artifact 给出。

## q-0469 — 补上模型名 Qwen2.5-32B 与报错定位 messages 中 role 非法，保留排查与修正 validate_messages 的交付要求。

- 改前：排查本地部署的大模型（Qwen2.5）用 curl 调用正常、但接入 next-ai-draw-io 时报参数验证错误的问题，并给出 validate_messages 的正确实现。
- 改后：本地部署的 Qwen2.5-32B 用 curl 调用正常，接入 next-ai-draw-io 时却报参数验证失败（messages 中 role 非法）；排查原因并给出修正后的 validate_messages 实现。

## q-0470 — 去掉原文没有的「附件 JSON」，补上原文的 Google 风格、边界条件、完成后自检等约束。

- 改前：针对附件 JSON 中查询与多条路径的数据，用 Levenshtein 与 rapidfuzz 从多角度为每条路径评分；给出工业级、高可扩展、可读性优先、命名良好的完整代码，遵循 Google 风格并妥善处理边界条件。
- 改后：给定一个 query 和包含多条路径的数据，用 Levenshtein 与 rapidfuzz 从多角度为每条路径评分；给出工业级、高可扩展、可读性优先、命名良好的完整代码，遵循 Google 风格、处理边界条件并在完成后自检。

## q-0475 — 补上原文的三段式要求（v0.dev 拆解、Hugging Face 数据集调研、游戏评估体系）与 markdown artifact 交付物；原有「深度视觉分析」「评估体系极少」的动因因长度略去。

- 改前：由于游戏代码质量评估需要深度视觉分析且现有评估体系极少，参考 v0.dev 的网页制作逻辑，设计游戏代码生成质量的评估体系。
- 改后：分三个方向调研并各出 markdown artifact：拆解 v0.dev 的网页制作与评估逻辑、深挖 Hugging Face 上网页代码生成质量评估体系与数据集，再据此设计游戏代码生成质量评估体系。

## q-0476 — 补上原文第三问（这些评估对游戏代码评估体系的可参考之处），并明确三项各出 Markdown文档。

- 改前：调查网页代码、游戏代码之外的视觉类代码生成质量评估：查找相关生成网站及其评估标准、对应的 Hugging Face 数据集，并给出 markdown 文档。
- 改后：调查网页、游戏代码之外的视觉类代码生成：找出专门生成这类代码的网站及其评估标准、Hugging Face 上对应数据集，并说明对游戏代码评估体系的可参考之处，各出 Markdown文档。

## q-0477 — 补出原文四问的完整结构（评判我的思考 + 微调派/物理模型派/gamecode2webcode派三方向）与 detailed markdown artifact 交付要求。

- 改前：评判分析我的判断：design2code 评估效果好可能源于大模型在大量优质网页数据中习得布局等视觉理解，而公开可玩游戏代码极其稀缺，导致游戏生成出现视觉理解问题；并输出详细 markdown 文档。
- 改后：评判我的判断（design2code 效果好源于网页数据多、公开可玩游戏代码极稀缺），再沿微调派、物理模型派（李飞飞）与 gamecode2webcode派调研，各出 detailed markdown artifact。

## q-0478 — 补上 detailed markdown artifact 交付物；其余信息与原文一致，std 本身已自洽。

- 改前：搜索调查对大模型进行游戏代码微调的方法，以提升其在游戏领域的视觉理解能力。
- 改后：调研对大模型进行游戏代码微调、改造其在游戏领域视觉理解能力的可行方案，输出 detailed markdown artifact。

## q-0484 — 按原文小写写法统一为 readme.md；项目名沿用对话主题（orig 只写 give me readme.md，未点名项目）。

- 改前：为该知识树 RAG 项目编写 README.md 文档，并给出从头到尾可执行的完整 bash 命令（环境准备到启动运行）。
- 改后：为知识树 RAG 项目编写 readme.md，并给出从头到尾可执行的完整 bash 命令（环境准备到启动运行）。

## q-0487 — 删去原文没有的「附件规章条文」限定，补上 PEP 8、PEP 257、中文注释、DocString、边界条件与完成后自查等原文约束。

- 改前：为附件中的规章条文原始文本设计正则模式列表（Patterns 数据类），把原始文本准确映射为格式化文本，代码需符合 Google 风格并处理边界条件。
- 改后：用 @dataclass 定义 Patterns 类，列出把原始文本映射为格式化文本的正则模式；需符合 Google style guides、PEP 8 与 PEP 257，含中文注释与 DocString，处理边界条件并自查。

## q-0492 — 补出原文的输入格式 txt、job_description、major/category_names、正则匹配「专业」行与一份描述多个专业等要点。

- 改前：编写 Python 类，把附件中的岗位职责描述文本解析并归类到专业大类与细分方向。
- 改后：编写 Python 类，把 txt 里的 job_description 转成 major/category_names：用正则匹配含“专业”的行并归类到对应类别，一份描述可对应多个专业；需符合 Google style guides。

## q-0493 — 去掉 orig 中没有的 paths 字段，改用 orig 代码里已有的 knowledgeList/knowledgeRelationDtoList 与 nodeId→nodeName、nodeUid；目标响应结构只见于 reply 的推理，未写入问题。

- 改前：重写 _process_response 静态方法，正确处理附件接口响应中 paths/knowledgeList 的节点名映射与结果组装。
- 改后：重写 _process_response 静态方法，正确处理响应里的 knowledgeList 与 knowledgeRelationDtoList，把 nodeId 映射到 nodeName、nodeUid 并组装结果。

## q-0494 — 补上原文后半段的交付要求：按分类/回归/聚类/降维四个带编号文件夹搭 tree 结构，py 只给 class 名并 pass。

- 改前：解读这段 sklearn 模型选型 roadmap 流程图：按预测问题类型、样本量、特征量、数据类型等分支说明各模型的适用场景与选择依据。
- 改后：解读这段 sklearn 模型选型 roadmap 流程图，并按分类、回归、聚类、降维四个带编号的文件夹构建项目 tree 结构：每部分写简单的 markdown，py 代码只给出 class 名并直接 pass。

## q-0495 — 原文实为 7 个段落（原 std 误写六段式），并点名重写的目标任务：路径+多节点生成口语化 question、JSON 输出。

- 改前：按 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 六段式结构重写给定 prompt，明确各段的作用与写法。
- 改后：用 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 七段模板重写 prompt，任务是按路径结合多个节点生成三条口语化 question 并输出 JSON。

## q-0504 — 解掉「该博客项目」指代，点名要分析的 tree.md 与四个源文件，并保留 apple dynamic style 约束。

- 改前：以 code category 设计重建该博客项目，采用 Apple 动态风格，并逐文件给出改进后的完整代码。
- 改后：分析 tree.md、build_htmls.py、index.html、scripts.js、styles.css，用 code category 设计重建该博客项目，按 apple dynamic style 逐文件给出完整代码。

## q-0519 — 补上「不要 demo」、prompts.py 以及 DSL Schema/模板库/LangGraph 三部分与逐文件交付，同时压到限长内。

- 改前：设计 text2manim：把自然语言数学问题生成 Manim 教学动画，先梳理整体思路与 Manim 组成结构，再构建 pipeline——动画 DSL Schema、数学动画模板库、基于 LangGraph 的多步 LLM 生成流程。
- 改后：设计 text2manim 完整 pipeline（不要 demo）：定义动画 DSL Schema、构建数学动画 Manim 模板库、用 LangGraph 实现多步 LLM 生成流程并写 prompts.py，逐文件给出代码。

## q-0521 — 把报错对象由 manimpango 更正为日志里实际的 pycairo，并点名 libicu-dev 冲突与 pkg-config 缺失。

- 改前：解决安装 manim 时的环境问题：apt 中 libicu-dev 等依赖版本冲突（held broken packages），以及 manimpango 构建 wheel 失败，按附件日志给出修复步骤。
- 改后：修复 pip install manim 的两处报错：apt 安装依赖时 libicu-dev 版本冲突（held broken packages），以及构建 pycairo 时找不到 pkg-config。

## q-0524 — 补上目标系统 text2manim 与「逐文件修复」的交付要求，并压缩表述。

- 改前：修复生成的 mp4 中字体大小忽大忽小、单句超出画面宽度、新句子覆盖上一句文字，以及新图形与已有图形关系混乱导致数学证明无法看懂的问题，例如勾股定理中由四个三角形拼成大正方形与小正方形的过程。
- 改后：修复 text2manim 生成 mp4 的排版问题：字体大小不一、句子超出画面宽度、新句子覆盖上一句文字，以及新旧图形关系混乱致数学证明看不懂（如勾股定理四个三角形拼大小正方形），逐文件修复。

## q-0526 — 删去原文未出现的 LangGraph 与悬空的「附件」，把节点/状态/图流转重审、max_iterations、保存每轮 llm 数据、改进 prompts 收紧到 120 字内

- 改前：在 text2manim 的 LangGraph pipeline 中引入 ReAct 机制，再重审节点、状态与图流转，确保 max_iterations 生效，保存每轮 LLM 生成数据以便核验，并按附件改进 prompts。
- 改后：在 text2manim 的 pipeline 中引入 ReAct 机制，重审节点、状态与图流转，确保 max_iterations 生效，保存每轮 llm 生成数据便于核验，并改进 prompts。

## q-0527 — 补上被改写对象是「RAG 检索渠道选择的人工智能助手」，并点明 Profile 需含作者/版本/说明

- 改前：把我的 Prompt 改写为指定结构：Role 角色、Profile（作者/版本/说明）、Goals、Constrains、Skills、Workflow、Initialization 冷启动等模块。
- 改后：把这份 RAG 检索渠道选择助手的 Prompt 改写为指定结构：Role、Profile（作者/版本/说明）、Goals、Constrains、Skills、Workflow、Initialization 冷启动。

## q-0528 — 补上 apple dynamic style 风格约束，并说明先分析四个文件、再按代码分类结构重组并逐文件交付代码

- 改前：概览 github.io 书籍与课程站点项目，分析 build_htmls.py、index.html、scripts.js、styles.css，按代码分类结构重新组织项目，说明各文件应如何放置，并逐文件给出改进后的代码。
- 改后：概览 github.io 站点并分析 build_htmls.py、index.html、scripts.js、styles.css，按 apple dynamic style 与代码分类结构重组，说明各文件放置方式并逐文件给出改进代码。

## q-0529 — 把「该站点」点名为原文中的 KnowledgeHub，并补齐三次报错的具体对象与原因

- 改前：修复该站点本地预览时连续出现的加载错误：file:// 协议下的 CORS 拦截、book.css 与 markdown.css 的 404，以及请求 /api/home 返回 404 导致内容加载失败。
- 改后：修复 KnowledgeHub 站点本地预览时的加载报错：file:// 协议下 fetch 被 CORS 拦截、book.css 与 markdown.css 返回 404、请求 /api/home 返回 404 导致内容加载失败。

## q-0533 — 补齐原文中被截掉的输出格式（章节→信息维度→问题的 JSON 结构）和「问题尽可能是 ABCD 选择题」这一硬约束

- 改前：针对某学科某一章节标题生成教案的流程，为学情分析、教学目标、课程重难点、教学过程、思政案例等各章节定制需要向用户提问的问题，并梳理每个章节所需的信息维度。
- 改后：针对某学科某章节标题生成教案，为学情分析、教学目标、课程重点、课程难点、教学过程、思政案例等章节定制要问用户的问题，梳理各章节的信息维度，并按 章节→信息维度→问题 的 JSON 输出，问题尽量用 ABCD 选择题。

## q-0534 — 原文（orig）为空，无法核对细节，保留原样；仅 prompts.py 可在回复中找到，Python 与附件 6.5KB 等说法既不在 orig 也不在 reply 中验证

- 改前：按附件中的任务说明（6.5KB）实现该教案生成方案：用 Python 编写代码、按不同场景设计所需提示词并给出 prompts.py，同时规划代码分类与文件结构。
- 改后：按附件中的任务说明（6.5KB）实现该教案生成方案：用 Python 编写代码、按不同场景设计所需提示词并给出 prompts.py，同时规划代码分类与文件结构。

## q-0540 — 补上动画的输入是简单三层网络+relu 的 SymPy 计算结果，以及竖屏 1080x1920 尺寸与 LaTeX/排版约束

- 改前：把神经网络的梯度传播计算结果用 Manim 制作成动画视频，注意避免 LaTeX 中文报错、字体与图像过大等排版问题。
- 改后：把简单三层网络+relu 梯度传播的 SymPy 计算结果用 Manim 做成 tiktok 竖屏 1080x1920 动画视频，注意避免 LaTeX 中文报错、字体与图像过大等排版问题。

## q-0542 — 补上教学对象（初中生水平、30 年经验老师、逐步讲题）与交付物（LaTeX 公式 + 生成 PPT 的 pptx 代码）；PPT 视觉细节受 120 字上限未展开

- 改前：按 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 这一结构编写一个数学教学助手的 Prompt。
- 改后：按 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 结构写初中数学教学助手 Prompt：30 年经验老师逐步讲题，用 LaTeX 公式，输出 pptx 代码。

## q-0547 — 把「附件中这份」改成「这份」——原文是直接粘贴在对话里的 prompt 块，并无附件；其余信息点保留。

- 改前：把附件中这份面向中学生、基于 manim skill 的数学解题动画视频生成 Prompt 改写得更专业、更详细，明确解压探索 skill、构建 storybook.md 与生成 Python 代码的步骤。
- 改后：把这份面向中学生、基于 manim skill 的数学解题动画视频生成 Prompt 改写得更专业、更详细，明确解压探索 skill、构建 storybook.md 与生成 python 代码的步骤。

## q-0553 — 补上原文要求的交付物形态：一个输入 paths 的函数，以及 nodes/edges 两组类型为 NodeData、EdgeData 的列表。

- 改前：把带有 similarity、fromNodeUid、toNodeUid、chunkId 等字段的 paths 路径数据转换成节点-边结构的 JSON。
- 改后：写一个函数，输入含 fromNodeUid、toNodeUid、chunkId、similarity 等字段的 paths，输出 nodes 与 edges 两个列表（NodeData、EdgeData）的 JSON。

## q-0554 — 补上原文末尾明确要求的交付物 professional 产品文档，并压缩现有描述以控制长度。

- 改前：梳理基于鸿蒙课本的 AI 知识图谱生成项目需求：现有流程为人工自定义 schema 生成实体、再由实体生成问题，存在 schema 定义不准、人工定义耗时、问题质量不高等问题，需整理需求与改进方向。
- 改后：梳理基于鸿蒙课本的 AI 知识图谱项目需求：现为人工定义 schema 再据实体生成问题，存在 schema 不准、耗人工、问题质量低等问题，需给出改进方向并输出 professional 产品文档。

## q-0555 — 删掉原文不存在的「附件 paste.txt（约 23KB）」，补上原文真正的约束「based on the source code in langchain」。

- 改前：基于附件 paste.txt（约 23KB）分析并处理 RecursiveCharacterTextSplitter 递归文本分割器代码：把长文本递归切成不超过 chunk_size 的块并保留块间重叠。
- 改后：改进这份 RecursiveCharacterTextSplitter 代码：对齐 langchain 中对应实现的写法，仍递归把长文本切成不超过 chunk_size、块间带 chunk_overlap 重叠的块。

## q-0557 — 补上原文 CodeStyle 段落的硬约束：面向工业场景、代码不可省略、PEP 8 中文注释与 typing 注解。

- 改前：设计 GPT-1 复现的项目框架：采用 factory mode 支持消融实验，输出图表、TensorBoard、loguru 日志与 YAML 配置，并逐文件给出详细代码设计，代码需可读、命名良好、面向工业场景。
- 改后：设计 GPT-1 复现的工业场景项目框架：factory mode 支持消融实验，输出图表、TensorBoard、loguru、YAML 配置，逐文件给出完整代码，含 PEP 8 中文注释与 typing 注解。

## q-0559 — 补上原文 CodeStyle 段落的硬约束：面向工业场景、代码不可省略、PEP 8 中文注释与 typing 注解。

- 改前：设计 AlexNet 复现的项目框架：采用 factory mode 支持消融实验，输出图表、TensorBoard、loguru 日志与 YAML 配置，并逐文件给出详细代码设计，代码需可读、命名良好、面向工业场景。
- 改后：设计 AlexNet 复现的工业场景项目框架：factory mode 支持消融实验，输出图表、TensorBoard、loguru、YAML 配置，逐文件给出完整代码，含 PEP 8 中文注释与 typing 注解。

## q-0565 — 补上被截断部分里的交付物与依据（参考示例代码、Python 代码），其余信息原文已明确。

- 改前：基于 manim 技能制作切线长定理证明动画视频：先构建含步骤与场景的 storybook.md，再据此编写 manim 代码，并避免 LaTeX Unicode 报错、控制字号与元素间距。
- 改后：基于 manim 技能制作切线长定理证明视频：先构建含步骤与场景的 storybook.md，再参考示例代码编写 python 代码，避免 LaTeX Unicode 报错并控制字号与元素间距。

## q-0573 — 补上原文中后段的关键要求：生成教案接口新增 isSearch 入参、isSearch 为 true 时的 search_query 与 search_results 事件，以及文档只抓核心。

- 改前：分析附件中的 AI 教案生成系统接口文档并理解需求，按照 SSE + 事件类型分段的方式重新设计文档中的 stream 接口。
- 改后：分析 AI教案生成系统接口文档，按 SSE + 事件类型分段重设 stream 接口：生成教案接口增加 isSearch 入参，为 true 时新增 search_query 与 search_results 事件，文档抓核心少细节。

## q-0581 — 用原文实际标识符替换笼统描述（T5 tokenizer→T5Tokenizer、批量预测与分类→batch_predict/batch_classify），并去掉原文没有的“提升代码质量”。

- 改前：分析并重写模型加载相关代码（load_model 及其对配置、随机种子、T5 tokenizer、批量预测与分类的调用），提升代码质量。
- 改后：分析并重写这段 load_model 模型加载代码，梳理其对配置、随机种子、T5Tokenizer、batch_predict 与 batch_classify 的调用。

## q-0582 — 去掉原文未提的“附件设计文档”及自造的 code_graph、loguru；补上原文中段的输入/输出与 artifact 逐个交付要求。

- 改前：依据附件设计文档构建 Python 知识图谱工具 code_graph：用 AST 构造文件/类/函数节点及依赖、调用、包含关系，支持 OpenAI API 配置、loguru 日志与 factory mode，输入项目路径输出依赖图。
- 改后：设计 Python 代码知识图谱工具：用 AST 构造以函数为核心的节点及依赖、调用、包含关系，支持 OpenAI API key 等环境变量与可插拔 factory mode，输入项目路径输出图谱，逐个 artifact 交付。

## q-0583 — 补明 readme.md 交付物、graph.pkl 统计与子图插图、node_id 相对路径与剪枝非本地导入，替掉含糊的「减少图谱冗余」。

- 改前：改进 code_graph 项目：撰写含 output/graph.pkl 统计量与子图插图、说明 query 上下文构造逻辑的 GitHub 推广 README；llm/client 改流式输出；完善大模型 prompt；减少图谱冗余。
- 改后：改进 code_graph：撰写含 output/graph.pkl 统计与子图插图、说明 query 上下文构造的 readme.md；改 llm/client 流式输出、完善 prompt；node_id 改相对路径并剪枝非本地导入。

## q-0587 — 解掉悬空指代：改为图 json 数据，并把「另外三类关系分别 DFS」展开为三种关系各沿本关系遍历。

- 改前：分析 HarmonyOS NEXT 开发文档的图数据：用 networkx 可视化并解决中文乱码；按 CONTAINS 取一层、另外三类关系分别 DFS 取全部相关节点；输出 37 个 JSON 与 37 张图。
- 改后：分析图 json 数据：用 networkx 可视化并解决中文乱码；CONTAINS 取一层，RELATES_TO、PRECEDES、FOLLOWS 各沿本关系 DFS 取全部相关节点；输出 37 个 JSON 与 37 张图。

## q-0588 — 补上「图数据中的」这一指代对象与输出格式，避免脱离对话后不知道是哪个 37 个节点。

- 改前：为 37 个节点分别构造 2 个全局问题与 2 个局部问题，共 148 个问题，并输出为 JSON。
- 改后：为图数据中的 37 个节点各构造 2 个全局问题与 2 个局部问题，共 148 个问题，输出为 JSON。

## q-0591 — 删掉 orig 里并不存在的附件名 paste.txt，补上 score_list 对应 TreeManager.names 及几何平均最大路径的要求。

- 改前：基于附件 paste.txt（TreeNode/TreeManager 代码）：在 TreeNode 加 is_end 末端标记，实现求根到末端 score 几何平均及几何平均最大路径 value 列表的函数，注意命名与边界条件。
- 改后：基于 TreeNode/TreeManager 代码：在 TreeNode 加 self.is_end 标记末端节点，实现求根到末端所有 score 的几何平均、以及几何平均最大路径的 value list 的函数，注意命名与边界条件。

## q-0593 — 仅把项目名改回原文写法 nano vllm，内容已自洽，无需其他改动。

- 改前：以系统论视角吃透 nano-vllm 库：深入分析各个组件与模块，梳理组件与源码之间的衔接关系，分析该项目的核心内容与板块，并输出一系列 markdown 文档逐个展开。
- 改后：以系统论视角吃透 nano vllm 库：深入分析各个组件与模块，梳理组件与源码之间的衔接关系，分析该项目的核心内容与板块，并输出一系列 markdown 文档逐个展开。

## q-0604 — 补上项目名与三处具体报错（../constants 无法解析、VALIDATION/formatRelativeDate 缺导出）以及 npm run build。

- 改前：修复重构后项目的构建期报错（Vite 无法解析 ../constants、constants 与 date 模块缺少导出、npm run build 的 TS 编译错误），并复查代码。
- 改后：修复 eisenhower-matrix 重构后 npm run build 的构建报错：../constants 无法解析、constants 缺 VALIDATION、date 缺 formatRelativeDate，并复查代码。

## q-0606 — 把标识符改回原文写法 llm as judge 与 json，并保留「附录写清指标计算方式」这一硬约束。

- 改前：参考给出的评估文档与 JSON 指标数据，构建一份清晰明了的工作报告，说明该 LLM-as-Judge 评估结果，并在附录中加入每个指标是如何计算获取的。
- 改后：参考给出的文档与 json 指标数据，构建清晰明了的工作报告说明该 llm as judge 评估结果，附录加入每个指标如何计算获取。

## q-0612 — 点明所调研的 Generative Agents 论文，去掉悬空的「该系统」，其余约束保留。

- 改前：在调研基础上详细思考并设计该系统及其子模块，输出完整代码结构体系并逐文件给出 markdown/python 实现（未完成处可先用 pass 占位），遵循 CleanRL 设计原则并使用 openai async client。
- 改后：调研 Generative Agents 论文后详细设计系统及子模块，给出完整代码结构，逐文件输出 markdown/python 实现（TODO 处可先 pass），遵循 CleanRL 原则并使用 openai 异步客户端。

## q-0615 — 无需改动。

- 改前：按给定的 <structure>（Role、Profile、Goals、Constrains、Skills、Workflow、Initialization）改进我的深度技术学习提示词。
- 改后：按给定的 <structure>（Role、Profile、Goals、Constrains、Skills、Workflow、Initialization）改进我的深度技术学习提示词。

## q-0620 — 补上 steps 去重的具体口径（nodes 按 id、edges 按 from 与 to），并点名合并终点由 label 与相对 startNode 位置决定。

- 改前：重新检查并改进 _merge_paths 函数：依据节点 label 与相对 startNode 的位置确定合并终点，并改进 steps 合并时的去重逻辑。
- 改后：重新检查并改进 `_merge_paths` 函数：依据 label 与相对 startNode 的位置确定合并终点，并在合并 steps 时对 nodes 按 id、edges 按 from 与 to 去重。

## q-0621 — 补上原文的输出约束「以 JSON 形式输出」，并把单/多知识点两条出题路径与题型范围写清。

- 改前：根据给出的知识点拆解与分层出题策略，构造一个出题 Prompt，支持单知识点与多知识点的联系区别、多理解层级以及选择、填空、问答等题型。
- 改后：根据给出的知识点拆解与分层出题策略，构造出题 Prompt：单知识点产出不同理解层级的题，多知识点先辨明概念的联系与区别再出题，覆盖选择题、填空题、问答题，并以 JSON 输出。

## q-0625 — 补上未输出的完成日志 GENERATE QUESTION DONE! 与「无报错」这一症状，并保留部署环境与 AsyncOpenAI lifespan 的怀疑点。

- 改前：排查 FastAPI 流式生成问题：流式 JSON 数据中途截断、未输出完成日志并出现 CancelledError，分析是否与 AsyncOpenAI 的 lifespan 管理有关，以及背后的解决思路。
- 改后：排查 fastapi 流式生成：json 数据无报错却中途截断、未打印 GENERATE QUESTION DONE!，出现 CancelledError，是否与 AsyncOpenAI 的 lifespan 管理有关及解决思路。

## q-0636 — 把原文的 90/80/70 分档规则写进问题，替代原来笼统的「分数规则」。

- 改前：改进并重写职位描述处理类 process_job_descriptions：按 category 与 major 的分数规则输出各专业及相似度评分，并补充人类可读的匹配规则描述。
- 改后：改进并重写 process_job_descriptions：按 category 与 major 的分数规则（>90 取全专业、≥80 取 major≥70、<80 取 major≥80）输出各专业相似度评分与匹配规则说明。

## q-0637 — 补上「可 pip 安装」这一交付约束，并去掉原文中并不存在的项目名 StockMock。

- 改前：设计股票回测 mock 数据框架 StockMock：由股票代码哈希生成随机种子、生成不同模式与粒度的数据并参考正规股票数据格式，遵循 CleanRL 设计原则；并列出已实现文件、补齐未完成文件后打包下载。
- 改后：设计股票回测 mock 数据框架：由股票代码哈希生成随机种子、生成不同模式与粒度的数据并参考正规股票数据格式，遵循 CleanRL 设计原则且可 pip 安装；列出已实现文件、补齐未完成文件后打包下载。

## q-0642 — 无需改动

- 改前：实现 Everyday Echoes 个人博客系统：精选文章滑块、富媒体文章页、嵌套评论与存档过滤、订阅管理，含前后端与 markdown 上传（可选标签），并列出已实现文件、继续补全并打包下载。
- 改后：实现 Everyday Echoes 个人博客系统：精选文章滑块、富媒体文章页、嵌套评论与存档过滤、订阅管理，含前后端与 markdown 上传（可选标签），并列出已实现文件、继续补全并打包下载。

## q-0643 — 补出『搜索足够资料』与保存本地的交付约束，并点名 browser-use 文章与 browser-harness 仓库。

- 改前：基于给定的 browser-use 博客文章与 browser-harness 仓库，先详细展开文章要点，再逐个组件分析其代码实现，产出详细的 markdown 文档。
- 改后：阅读给定的 browser-use 博客文章与 browser-harness 仓库并收集足够资料，先详细展开文章要点，再逐个组件分析其代码实现，产出并保存 markdown artifact。

## q-0644 — 把臆造的 TITAN 改回原文拼写 Titian，补出 arXiv 编号与本地保存要求。

- 改前：详细分析 arXiv 论文 TITAN（2509.22170），剖析其背后的原理与方法，撰写详细的 markdown 分析文档。
- 改后：详细分析 arxiv 论文 Titian（2509.22170v1），剖析其背后的原理与方法，撰写并本地保存 markdown artifact。

## q-0645 — 点名融合对象 Titian 与 browser-harness，补出可行性方案探究 + markdown artifact 交付物；结尾 go next 只作推进指令保留。

- 改前：借鉴 browser-harness 的架构思想，结合前述调研仔细思考并设计可落地方案，随后继续推进下一部分内容。
- 改后：采用 browser-harness 的思想，分析 Titian 与 browser-harness 融合的思路，构造可行性方案探究并撰写 markdown artifact，然后继续下一部分。

## q-0646 — 补出原文沙箱硬约束（no root escalation、no arbitrary network）与『DESIGN PYTHON CODE』的交付要求。

- 改前：设计单台个人电脑（8–16GB RAM、支持 AVX）上的对话式 Code-Interpreter：本地 LLM 生成并安全执行 Python 脚本、读写本地文件，在受限沙箱内运行并返回表格/图片/文本/文件结果。
- 改后：设计单台个人电脑（8–16GB RAM、支持 AVX）上运行本地模型的对话式 Code-Interpreter：LLM 生成并安全执行 Python 脚本、读写文件，在受限沙箱内运行（禁止 root 提权与任意联网），并给出详细代码。

## q-0650 — 原 std 把 IDF 写成有错，但原文 IDF 公式并无错误；改为点名真实问题：fit/get_scores 的实现问题与缺失的 List、Counter、math 导入。

- 改前：改进、复查并修正给定的 BM25 算法实现，指出并修复其 fit、文档频率与 IDF 计算等逻辑中的错误。
- 改后：改进并复查这段 BM25 算法代码，修正 fit 与 get_scores 中的错误，补齐 List、Counter、math 等缺失导入。

## q-0651 — 压缩表述以控长，保留『BM25 加权分数取 top_n 个 QA』的核心目标与『涉及函数已给定、不需修改』约束。

- 改前：分析 find_related_history 代码并完善其逻辑：用 BM25 计算一轮 QA 对话所有 sentence 的加权分数作为该 QA 分数，据此选出 top_n 个相关历史 QA 并赋分（涉及的其他函数已给定、无需修改）。
- 改后：分析并完善 find_related_history：以一轮 QA 对话所有 sentence 的 BM25 加权分数作为该 QA 分数，据此选出 top_n 个历史 QA 并赋分（其他函数已给定，无需改动）。

## q-0655 — 补出项目名 intelligent-browser-tool；用构造函数参数不一致概括首轮 IntentAnalyzer/ContentAnalyzer/URLQueue 的 TypeError，其余 NameError 因长度未逐一列出。

- 改前：修复浏览器自动化工具运行错误：trafilatura Document 无 get、组件构造函数签名不一致、StorageManager 缺 save_json、StorageStats 缺 files_saved，并保持接口一致。
- 改后：修复 intelligent-browser-tool 报错：Document 无 get、构造函数参数不一致、StorageManager 缺 save_json、StorageStats 缺 files_saved，并保持接口一致。

## q-0657 — 补出 0.6b 模型、搜索词形如 xxx or xxx site:yyy.com、取 top5 链接作初始种子且原始链接同为一个种子的约束。

- 改前：改进设计：初始 URL 有时与目标 URL 相距较远，故先用意图和 0.6B 模型构造形如 xxx or xxx site:yyy.com 的搜索词，经 Google 或 Bing 取 top5 链接作为初始种子链接，原始链接也是种子之一。
- 改后：改进设计：初始 URL 与目标 URL 常相距较远，先用意图和 0.6b 模型构造形如 xxx or xxx site:yyy.com 的搜索词，经 google 或 bing 取 top5 链接作初始种子，原始链接也算一个种子。

## q-0659 — 把原文没有的 search_engine/proxy_manager/Clash 回改为原文用词 search engine、proxy manager、yaml，0.6B 改回原文的 0.6b，并补出代理配置来源（原文所附 yaml 配置，mixed-port: 7890）

- 改前：改造 search_engine：使用 0.6B 模型润色并生成中英文搜索词以适配不同语言渠道，并接入 proxy_manager（Clash 配置）管理代理节点。
- 改后：改造 search engine：用 0.6b 模型润色生成中英文搜索词以适配不同语言渠道，并通过 proxy manager 按所附 yaml 配置（mixed-port: 7890）管理代理节点。

## q-0669 — 按原文回填 factory mode/ablation study/tensorboards/loguru/config yaml 等标识符并补上逐文件交付要求；seq2seq 取自对话标题，原文只写 the paper。

- 改前：设计 seq2seq 论文复现的项目框架与代码分类：用 factory 模式支持 ablation 研究，输出图表、TensorBoard、loguru 日志与 YAML 配置，并逐文件给出工业级代码实现。
- 改后：为seq2seq论文设计project框架与code category：用factory mode做ablation study，逐文件给出工业级代码，输出figures、tensorboards、loguru、config yaml。

## q-0673 — 把 hit@k 改为原文写法 hit_at_k，并补上中文 markdown 报告与逐条补充策略含义这两项要求。

- 改前：根据给出的检索测试结果 JSON，输出中文详细分析报告，并逐条补充每个检索策略的含义及其 hit@k 表现。
- 改后：根据给出的检索测试结果 JSON，输出中文 markdown 详细分析报告，并逐条补充每个具体策略的含义及其 hit_at_k 表现。

## q-0674 — 把 Ollama 改为原文的 ollamaclient，补上每个节点/边各生成 3 个问题、构建节点与边组合检索，以及描述存 JSON、hit@1 存 CSV 的保存要求。

- 改前：实现并迭代 embedding_test_edge_node.py：生成节点与边的问题、构建组合做嵌入检索、用 Ollama 生成节点与边的描述并参与检索，同时把描述存为 JSON、问题与命中率存为 CSV。
- 改后：实现并迭代 embedding_test_edge_node.py：为节点与边各生成 3 个问题，用 ollamaclient 生成节点与边的新描述，构建节点/边组合做嵌入检索，描述存 JSON、问题与 hit@1 存 CSV。

## q-0678 — 把 Wikipedia API 改为原文写法 wiki api，并补上 code category 与逐文件代码实现的交付要求；ReAct 在原文写作 react。

- 改前：设计 ReAct 项目的代码分类与文件结构，逐文件给出工业级详细代码，假定已具备 OpenAI API key 与 Wikipedia API。
- 改后：设计 ReAct 项目的 code category 与文件结构，逐文件给出极详细的工业级代码实现，假定已有 openai api-key 与 wiki api。

## q-0680 — 指代只能到上文的分析，据 reply 判断是搜索模块代码，未编造文件名；保留“调用的函数视为已导入”这一前提。

- 改前：基于上述分析重写该代码，改善并重新组织其结构，把其中调用的函数视为已导入。
- 改后：基于此前的代码分析，重写那段搜索模块代码，改善并重新组织其结构，其中调用的函数一律视为已导入。

## q-0683 — 补上论文编号 1706.03762 与 Building 阶段失败、无 HTML 产出这一症状；Google Colab 按记录 tags、arXiv 按 reply 写，原文只有 /content 路径。

- 改前：修复用 LaTeXML 在 Google Colab 中把 arXiv 论文（1706.03762）LaTeX 转 HTML 时 Building 阶段失败、不产出 HTML 的问题，并深入搜索原因与解决方案。
- 改后：修复用 LaTeXML 在 Google Colab 中把 arXiv 论文 1706.03762 的 LaTeX 转 HTML 时 Building 阶段失败、没有 HTML 输出的问题，并深入排查原因与可行方案。

## q-0686 — 删去原文没有的「paste.txt」并补上新增代码的标识符；原附件代码块为空，只能称「该类」，类名无法确定。

- 改前：分析并重写附件 paste.txt 中的代码（汉字数字与正则匹配工具类），把新增的学院关键词变体代码并入该类，并给出完整代码。
- 改后：分析并重写现有代码，把新增的学院关键词变体提取逻辑（含 extract_faculty_from_text、FIELD_MODE、EXTRACT_FUNCTIONS_BY_SCHOOL_ID）并入该类，并给出完整代码。

## q-0691 — 补上示例 JSON 的字段清单与「继续深度思考」要求，并按对话概述点明上海初中数学背景。

- 改前：根据附件列出的上海初中六至九年级各学期章节内容，展开分析所有知识点，构建一个顶层为 LIST 的 JSON，逐条给出知识点描述、数学公式与相关知识点。
- 改后：根据此前给出的上海初中数学各年级、学期、章节内容，继续深度思考并按示例输出 JSON：逐条给出知识点、知识点内容详细描述、数学公式、相关知识点与 manim动画涉及元素 等字段。

## q-0692 — 补上两轮 feedback 的来源、BAD_EXAMPLE 禁令与更新 TYPE_EXAMPLES 的交付物。

- 改前：根据反馈迭代改进编程知识点出题 prompt：问题中不得出现选项、选项需给出具体内容，并明确答案解析要讲清原理与解题思路，据此更新 TYPE_EXAMPLES 示例。
- 改后：根据两轮反馈改进编程知识点出题 prompt：问题中不得出现选项、选项要展示具体内容且不要再出现 BAD_EXAMPLE 那样的问题，并明确答案解析要讲清原理与解题思路，据此更新 TYPE_EXAMPLES。

## q-0694 — 补上输入项与输出字段名，并把原 std 里的「相关长文本」改成原文的「相关长文本信息」。

- 改前：优化用于生成知识图谱节点基本信息的 prompt（含角色定义、任务描述、输入信息中当前节点/领域背景/上文链路/相关长文本等字段），提升其清晰度与可执行性。
- 改后：优化生成知识图谱节点基本信息的 prompt：含角色定义、任务描述，输入为当前节点、领域背景、上文链路与相关长文本信息，输出 name/aliases/description/type/labels 等字段。

## q-0695 — 补上示例输出 JSON 的四个字段名，使交付物明确。

- 改前：优化知识图谱关系提取的 prompt：基于当前节点与上游链路信息识别直接父节点，生成父子节点间的逻辑关系并构建标准三元组。
- 改后：优化知识图谱关系提取的 prompt：利用当前节点和上文链路识别直接父节点，生成父子关系三元组，输出 node_name、parent_name、parent_relation 与 parent_relation_desc。

## q-0696 — 补上模板变量 {topic}/{existing_subtopics}/{name_list}/{n} 与输出字段 new_subtopics。

- 改前：优化知识图谱新节点生成的 prompt：根据主题与现有节点列表生成一批同层级、不重复、与主题高度相关且数量不少于 n 的新节点及其属性。
- 改后：优化知识图谱新节点生成的 prompt：基于主题 {topic}、现有子节点列表 {existing_subtopics} 与 name_list，生成不少于 {n} 个同层级、不重复的新节点，输出 new_subtopics 列表。

## q-0698 — 补上三条 feedback 的要点（三引号包裹、language 字段位置）与「给出完整代码」的交付要求，删去原文没有的「附件」说法。

- 改前：按附件给出的多条 feedback 修改教育题目生成的模块化 Prompt 构建器：统一 question/answer/explanation 的引号包裹与换行格式、厘清答案等字段的定义，并补充新功能。
- 改后：按三条 feedback 修改模块化出题 prompt 构建器：question/answer/explanation 统一三引号包裹并注意换行，区分答案解析与参考答案，qstart 后新增 language 字段，给出完整代码。

## q-0702 — 补上 1080×1920 竖屏输出与 verify_geometry.py 验证步骤，删去冗余修饰以控制长度

- 改前：按给出的任务定义执行 Manim 教学动画生成流程：解压研读 manim-math.skill，先基于题目构建含场景与几何计算的 storyboard.md 分镜脚本，再生成竖屏动画代码。
- 改后：按给出的任务定义执行 Manim 教学动画生成：解压研读 manim-math.skill，先构建 storyboard.md 分镜脚本，再生成 1080×1920 竖屏动画代码，并用 verify_geometry.py 验证几何。

## q-0705 — 原文仅『fix same error:』，据 reply 点名指代为 Sector 的 .move_to/.shift 错位；删去原文没有的『分数加减法』『附件』

- 改前：在附件所提供的分数加减法 Manim 动画脚本中修复与前述相同的错误。
- 改后：修复与前述相同的错误：Sector 的 .move_to(pos) 移动的是包围盒中心而非圆弧轴心，请把各场景（场景2/场景4/场景5）中的 Sector 改为 .shift(pos)。

## q-0712 — 补上两种思路要点（完整知识库方案、三阶段流程）与输出产品文档的交付要求

- 改前：详细整理 AI 教员助手产品的两种设计思路及其细化内容，说明如何解决现有教案助手固定输入输出、内容不贴合教师与学生实际需求的问题。
- 改后：详细整理 AI教员助手产品的两种设计思路（完整知识库方案与三阶段流程方案）及细化内容，解决现有教员助手固定输入输出、不贴合不同层次教师需求的问题，并输出产品文档。

## q-0716 — 补上复用既有 DocChunker/batch_chunk/tokenize_text、分块顺序约束及中文注释、Google 风格、PEP 257 等要求

- 改前：Build a class using TopicRank to compress a doc, taking doc, query, max_length and topN, and keeping the chunks in their original order.
- 改后：Build a class using TopicRank to compress a doc: inputs doc, query (default None), max_length, topN; reuse DocChunker, batch_chunk, tokenize_text; keep chunk order; Google style, typing, PEP 257 docstrings, Chinese comments.

## q-0718 — 补上 figures/tensorboards/loguru 交付物与 artifacts 逐文件输出，标识符改用原文写法

- 改前：设计 GPT-2 论文复现的项目框架与代码分类：用 factory 模式支持 ablation 研究，输出图表、TensorBoard 与 loguru 日志，并逐文件给出工业级代码实现。
- 改后：设计 GPT-2 论文复现的项目框架与代码分类：采用 factory 模式支持 ablation 研究，输出 figures、tensorboards 与 loguru 文件，并分多个 artifacts 逐文件给出工业级代码。

## q-0720 — 把原文没有的 app/config/models/question_pool 等写法改回原文文件名 app.py、config.py、models.py、memory.py、question_pool.py

- 改前：实现 teachplan_chat 教学计划对话系统：按给定项目结构（app / config / models / memory / question_pool 等）编写 Python 代码，并为各场景设计 prompts.py。
- 改后：实现 teachplan_chat 教学计划对话系统：按给定项目结构（app.py、config.py、models.py、memory.py、question_pool.py 等）编写代码，并设计各场景的 prompts.py。

## q-0721 — 补上输入 name/label、Role 等 prompt 结构、JSON 输出与中文撰写要求

- 改前：构造学科分类类别器的 prompt：把工程学、计算机、医学、经济学等学科类别的边界写清楚，并用中文输出完整 prompt。
- 改后：构造学科分类类别器 prompt：输入 name 与 label，按 Role/Profile/Goals/Constrains/Skills/Workflow 结构写清各学科类别边界，并输出 JSON，且用中文撰写。

## q-0722 — 补上原文 outformat 的硬约束：输出为含同义词列表与可靠信息源 URL 的 JSON。

- 改前：按 Role/Profile/Goals/Constrains/Skills/Workflow 结构构造同义词生成 prompt：先判断输入词是否有必要构造同义词（如“奖学金”“选修课”则不必要），必要时再输出同义词列表。
- 改后：按 Role/Profile/Goals/Constrains/Skills/Workflow 结构构造同义词 prompt：先判断输入词是否需要同义词（奖学金、选修课等不必），必要时输出同义词列表与可靠信息源 URL 的 JSON。

## q-0732 — 补上原文交付要求：论文分析 markdown 文档需包含论文链接。

- 改前：按厂商分类整理游戏领域美术资产检索方向的头部厂商核心论文与成果，覆盖多模态检索、RAG 与智能体搜索的技术原理、创新点与落地场景，输出 markdown。
- 改后：按厂商分类整理游戏领域美术资产检索方向的头部厂商核心论文与成果，聚焦多模态检索、RAG 与智能体搜索，覆盖技术原理、创新点与落地场景，交付含论文链接的 markdown 分析文档。

## q-0736 — 原文只有重复的「give me the class please」，指代对象在原文中无对应，改为点明被封装的模块并去掉悬空的「上述」。

- 改前：把上述文本分类与关键词抽取逻辑封装成类，给出完整的类实现代码。
- 改后：把此前给出的文本分类与关键词抽取模块封装成一个类，给出完整的类实现代码。

## q-0744 — 原文（orig）为空，项目名无从核实，故不写 chatgpt_memory，只保留对上文项目文档的指代并点明主题。

- 改前：根据上述 ChatGPT 记忆机制项目文档，构建 chatgpt_memory 项目代码实现。
- 改后：根据上文的 ChatGPT 记忆机制项目文档，实现对应的项目代码。

## q-0750 — 删去原文没有的 paste.txt，补上原文明确点名的改善目标 PathTransformer。

- 改前：根据附件 paste.txt 中 paths 的结构建立 len(paths)*2 棵树，区分自上而下与自下而上两种方向，判断节点是否叶子、叶子是否有兄弟节点（node level 0 为根、-1 为最底层）。
- 改后：根据 paths 结构建立 len(paths)*2 棵树，区分自上而下与自下而上方向，判断节点是否为叶子及叶子是否有兄弟节点（node level 0 为根、-1 为最底层），据此重新分析改善 PathTransformer。

## q-0753 — 删掉原文没有的「附件」，点名新浪直播 feed 接口的 jQuery 数据与 zhibo_id 分类调查。

- 改前：分析附件中的新浪直播接口 jQuery 返回数据，调查 zhibo_id 有哪些类别及其分别代表什么含义。
- 改后：调查新浪直播 feed 接口返回的 jQuery 数据，弄清 zhibo_id 有哪些类别、分别代表什么含义。

## q-0757 — 去掉原 std 里提前写死的「编码错误」结论，保留用户「怀疑加密」的原始表述与「哪个代码要改」的诉求。

- 改前：新浪新闻数据出现乱码（编码错误），排查原因并说明需要修改或增加哪个代码。
- 改后：新浪新闻采集到的数据全是乱码（怀疑被加密），应如何处置、需要修改或新增哪段代码？

## q-0758 — 补上原文日志里的报错 KeyError: 'title'、出错的 format(categories=...) 调用以及「检查其他 prompt 错误」这一诉求。

- 改前：排查 _build_system_prompt 中分类提示词模板用 format 填充 categories 时的问题，并结合流水线运行日志定位并修复异常。
- 改后：排查 _build_system_prompt 用 format 填充 categories 时抛 KeyError: 'title' 的问题，结合流水线日志定位并修复，同时检查其他提示词错误。

## q-0761 — 补明首版语言为 Python、C++ 是改写版本，并把「逐文件给出代码」对应到 C++ 版。

- 改前：实现 FTRL（Follow-the-Regularized-Leader）在线学习优化算法的代码，包含 L1/L2 正则化、稀疏与大规模数据处理；再将其改写为 C++ 版本，逐文件给出代码。
- 改后：先写 FTRL（Follow-the-Regularized-Leader）在线学习算法的 Python 代码，包含 L1/L2 正则化、面向稀疏大规模数据；再改写为 C++ 版本，逐文件给出代码。

## q-0762 — 补上原文明确要求的 Prompt 结构（Role/Profile/Goals/Constrains/Skills/Workflow/Initialization），其余保留。；修复：仅压缩冗余表述达标至 119 字，七段结构与四象限内容全部保留。

- 改前：为「知识状态决定指令策略」的方法论构造 Prompt：交叉用户与大模型的知识状态形成四个象限，逐象限解析场景特征并匹配最适配的指令方向与策略。
- 改后：按给定结构（Role/Profile/Goals/Constrains/Skills/Workflow/Initialization）构造「知识状态决定指令策略」Prompt：交叉用户与模型知识状态成四象限，逐象限解析场景特征并匹配策略。

## q-0764 — 点名 MCTS 控制器、删去原文未出现的 SnakeEnv，并按原文补全五条优化点：并行模拟、NumPy 向量化、减少深拷贝、反向传播、动作缓存。

- 改前：优化附件中与 SnakeEnv 深度集成的 MCTS 控制器代码：并行处理模拟、NumPy 向量化操作、减少深拷贝、优化反向传播，并用 lru_cache 缓存动作选择。
- 改后：优化 MCTS 控制器代码：并行模拟（multiprocessing/concurrent.futures）、NumPy 向量化状态哈希与观测生成、减少环境深拷贝、反向传播只更新必要节点、缓存已访问节点的最佳动作。

## q-0769 — 压缩到 120 字内，补上原文的论文方向与逐篇构建 markdown artifacts 的交付要求。

- 改前：深度分析 GitHub 仓库 ulab-uiuc/AgentDebug 的技术细节与代码架构（仓库结构、多 Provider 抽象、Rollout 系统），再逐篇分析智能体系统级可观测性与诊断方向的论文，构建详细 markdown 文档。
- 改后：深度分析 GitHub 仓库 ulab-uiuc/AgentDebug 的代码架构（仓库结构、多 Provider 抽象、Rollout 系统），再逐篇分析系统级可观测性与诊断方向的论文，构建 markdown artifacts。

## q-0770 — 补上原文的输出要求（去重后的最佳图谱路径查询条件 JSON），其余保留原意。

- 改前：优化知识图谱问答分析专家 Prompt：依据用户自然语言问题与召回的节点 markdown 数据，提取所有与 query 相关的节点、关系与标签信息，并把原 Prompt 写得更清晰完善。
- 改后：优化知识图谱问答分析专家 Prompt：依据用户自然语言问题（query）与召回节点 markdown 数据，提取相关节点、关系与标签信息，输出去重后的图谱查询条件 JSON，并让 Prompt 更清晰明确。

## q-0771 — 精简到 120 字内，保留基础技能 manim.skill 与 MathTex 中文、度数符号、LaTeX 编译三类已知报错。

- 改前：分析附件 manim_video_generation_prompt，用 skill creator 转换为 manim_math.skill，需规避 MathTex 中文、度数符号与 LaTeX 编译问题（基础 manim.skill）。
- 改后：用 skill creator 将 manim_video_generation_prompt 转成 manim_math.skill，基于 manim.skill，需规避 MathTex 中文、度数符号与 LaTeX 编译报错。

## q-0774 — 补上原文的中文输出约束（the prompt should be in Chinese）与两组输入标题，其余保留。

- 改前：把两个 Prompt 合并为一个，用于根据文本内容、当前标题、所在文件名、上级与上上级标题，输出包含互补的 chapterTitle 与 subTitle 的 JSON。
- 改后：把两个 Prompt 合并为一个中文 Prompt：根据文本内容、当前标题、所在文件名、上级与上上级标题，输出包含互补 chapterTitle 与 subTitle 的 JSON。

## q-0775 — 补上原文的关键现象与目标：query=「免试」可召回而「免试的流程」为空，需让长 query 也能命中。

- 改前：分析并改进给出的 Elasticsearch 实体检索 query_body：entity_word 精确匹配 content.keyword，并匹配 keywords_list 中的任意关键词（精确词项）。
- 改后：改进 Elasticsearch 实体检索 query_body：保留 entity_word 精确匹配 content.keyword 与 keywords_list 词项匹配，使 query=「免试的流程」也能召回。

## q-0776 — 补上原文的对比现象（「免试」命中、「免试的流程」为空）与修改 query_body 的诉求。

- 改前：分析 Elasticsearch 中按 majorEntity/synonymList 精确词项检索的查询：为何 query=「免试」会召回 majorEntity 为「免考」的文档，并说明如何改进查询写法。
- 改后：分析 Elasticsearch 中按 majorEntity/synonymList 精确匹配的查询：为何 query=「免试」会召回 majorEntity 为「免考」的文档，而「免试的流程」为空，并给出改进写法。

## q-0780 — 补上原文里的第二处报错（EvaluationConfig 的 max_chunks）与「对比各个参数细节」的要求。

- 改前：列出已实现的所有文件，并修复 main.py 中 create_evaluator() 不接受 ragflow_client 参数（unexpected keyword argument）导致的报错。
- 改后：列出全部已实现文件，并对比参数细节修复 main.py 中的两处报错：create_evaluator() 不接受 ragflow_client、EvaluationConfig 不接受 max_chunks。

## q-0783 — 补上评估对象：55 条 query 上 similarity_ranking 等三种策略的指标对比。

- 改前：以工作报告的角度分析给出的评估结论，对比各检索策略的优劣，输出清晰明了的 markdown 报告，并把各指标的计算方式放在附录展开。
- 改后：依据 55 条测试查询在 similarity_ranking 等三种检索策略下的指标，对比各策略在质量与耗时上的优劣，以工作报告角度输出 markdown 报告，并将各指标的计算方式放在附录展开。

## q-0788 — 点名项目目录 mbti-game-website，并补上其目录结构涵盖的组件、data、utils 与可选 backend。

- 改前：按已确定的结构逐文件实现 MBTI 游戏化测试网站的全部代码，并使用 Apple 设计风格。
- 改后：按已给出的目录结构逐文件实现 mbti-game-website 全部代码（含 src 组件、data、utils 与可选 backend），采用 Apple 设计风格。

## q-0798 — 补上交付形式：最终输出 markdown artifact。

- 改前：搜索调查景德镇卡地克瓷瓦，从各个角度梳理并输出调研文档。
- 改后：搜索调查景德镇卡地克瓷瓦品牌，从各角度梳理并以 markdown artifact 输出调研文档。

## q-0799 — 补上交付形式：最终输出 markdown artifact。

- 改前：搜索调查 AI 短剧制作经验，包含 seedance prompt 的使用经验，并输出调研文档。
- 改后：搜索调查 AI短剧制作经验，包含 seedance prompt 的实战经验，以 markdown artifact 输出调研文档。

## q-0800 — 补上交付形式：最终输出 markdown artifact。

- 改前：搜索调查电影级别的视频制作经验，并输出调研文档。
- 改后：搜索调查电影级别的视频制作经验，以 markdown artifact 输出调研文档。

## q-0801 — 补上交付形式：最终输出配音 markdown artifact。

- 改前：搜集最近比较火的抖音短视频配音，整理成配音调研文档。
- 改后：搜集最近比较火的抖音短视频配音，以 markdown artifact 形式整理配音调研文档。

## q-0802 — 补上 skill 名称与 skill creator、seedance、先出 3-5 道选择题、9:16 电影级 10-15s 及南方农村自建房目标人群。

- 改前：基于上述调研结果与现有卡地克瓷瓦抖音账号的视频风格，深度构建该账号的 AI 短剧制作框架。
- 改后：结合卡地克瓷瓦与 AI 短剧调研，用 skill creator 构建 `卡地克瓷瓦短视频prompt.skill`：先出 3-5 道选择题，再以 seedance 制作面向南方农村自建房小镇青年的 9:16 电影级 10-15s 短剧

## q-0803 — 点明问题面向大学生课程学习，删去重复表述，保留 .format 输入要求。

- 改前：优化课程知识图谱的提问生成提示词：为名词给出清晰定义，强化【任务说明】中不同路径下的生成策略；生成至少 2 条流畅自然、口语化的问题，不可出现「路径」字样，保留 {course}、{node_path} 等 .format 输入。
- 改后：优化课程知识图谱提问生成提示词：为名词给出清晰定义，强化【任务说明】中不同路径的生成策略；生成至少 2 条流畅自然、口语化、大学生关心的问题，不出现「路径」字样，保留 {course}、{node_path} 等 .format 输入。

## q-0804 — 把「其中的名词」明确为被优化的提示词自身，其余原意不变。

- 改前：优化路径总结生成的提示词：为其中的名词给出清晰定义，强化【任务说明】中不同路径下的不同生成策略；生成 1–2 条流畅自然、清晰简短、高度概括的路径总结，不做多余解释。
- 改后：优化路径总结生成的提示词：为提示词中的名词给出清晰定义，强化【任务说明】中不同路径下的不同生成策略；生成 1-2 条流畅自然、清晰简短、高度概括、不做多余解释的路径总结。

## q-0809 — 把「上述计算结果」点明为 SymPy 梯度传播推导结果，补竖屏 1080x1920 尺寸。

- 改前：用 Manim 将上述计算结果可视化，制作展示神经网络梯度传播的动画视频，并避免中文导致的 LaTeX 报错、元素尺寸过大以及文字与文字/图形重叠的问题。
- 改后：用 Manim 将 SymPy 推导的简单三层网络（含 ReLU）梯度传播结果做成竖屏 1080x1920 动画视频，并避免中文导致的 LaTeX 报错、元素超框与文字图形重叠。

## q-0817 — 补上 Single-Agent 与多工具表述，保留单轮思维链传播、记忆管理式上下文压缩与逐文件交付要求。

- 改前：假设已有 websearch API 与 OpenAI key，用 LangGraph 构建带多工具的单 Agent Deep Research 系统（单轮思维链传播 + 记忆管理式上下文压缩），按文件逐个给出工业级代码。
- 改后：假设已有 websearch API 与 OpenAI key，用 LangGraph 构建带多工具的 Single-Agent 深度研究系统（单轮思维链传播 + 记忆管理式上下文压缩），按文件逐个给出工业级代码。

## q-0819 — 补上数学教师 step by step 讲题、latex 语法生成 PPT 的交付物与格式约束。

- 改前：按照 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 的结构，构建一个数学教学场景的 Prompt 模板。
- 改后：按照 Role、Profile、Goals、Constrains、Skills、Workflow、Initialization 的结构构建数学教学 Prompt：教师 step by step 讲题，并以 latex 语法生成 PPT。

## q-0822 — 无需改动

- 改前：修复 inscribed_angle.py 中 LaTeX 编译报错（公式内汉字 圆、圆周角 导致的 Unicode 错误），并排查代码里同类错误。
- 改后：修复 inscribed_angle.py 中 LaTeX 编译报错（公式内汉字 圆、圆周角 导致的 Unicode 错误），并排查代码里同类错误。

## q-0827 — 补上 similarity_threshold 同样不用于控制，其余无需改动

- 改前：分析并修改 chunk 选择逻辑：改为选最相似的若干 chunk，总长度不超过 max_length（不用 top_k 控制），把 chunk embedding 合成数组向量化算相似度，选出后保持原始顺序。
- 改后：分析并修改 chunk 选择逻辑：选最相似的若干 chunk，总长度不超过 max_length（不用 top_k、similarity_threshold），把 chunk embedding 合成数组向量化算相似度，选出后保持原顺序。

## q-0829 — 删掉原文未出现的附件名 paste.txt

- 改前：重写附件 paste.txt 中的同义词服务代码，补全所有同义词映射，并完成测试与查询验证。
- 改后：重写同义词服务代码，补全所有给定的同义词映射，并完成测试与查询验证。

## q-0830 — 补上原文缺失的两条替换规则：互相包含时排除短的 majorEntity、多个同义词列表取组合

- 改前：分析 synonym_replacement 的正则替换实现，并构造查询同义词服务：输入 query，先在 service.query_synonyms 中查同义词，命中 majorEntity 的内容直接替换，返回改写结果。
- 改后：分析 synonym_replacement 并构建查询改写函数：输入 query，用 service.query_synonyms 查同义词，按 majorEntity 替换；互相包含时排除短的，多个同义词列表取组合。

## q-0831 — 补上原 std 缺失的两个 JSON list 及其字段（根节点为第1章 ArkTS 声明式 UI 开发规范对应的节点）

- 改前：用 Cypher 从指定根节点出发遍历实体子图，并聚合每个实体关联的 Chunk 文本与 chunk id。
- 改后：用 Cypher 从 root 节点遍历实体子图，输出两个 JSON：每个节点含 node_name、node_id、description、adj_node_ids、chunk_ids，分块含 chunk_id、chunk_text。

## q-0834 — 「上述」指向前文对话，orig 不含其内容，改写为「上一轮给出」并保留该指代

- 改前：按上述查询重写与筛选逻辑改造 QAService：保留为流式输出而并行检索原始数据的业务逻辑不改动，并把 LLM 结果筛选改为 ragflow、neo4j、chathistory（优先时间靠近）三路并发过滤。
- 改后：按上一轮给出的查询重写与筛选逻辑改造 QAService：为流式输出并行检索原始数据的业务逻辑保持不动，把 LLM 结果筛选改为 ragflow、neo4j、chathistory（优先时间靠近）三路并发过滤。

## q-0836 — 删掉原文未出现的「附件」，其余无需改动

- 改前：分析附件中的职位名称解析代码，针对给出的中文招聘标题 bad cases 增加更完善的正则与函数以提升鲁棒性，并去掉英文职位名的匹配。
- 改后：分析职位名称解析代码，针对给出的中文招聘标题 bad cases 增加更完善的正则与函数以提升鲁棒性，并去掉英文职位名的匹配。

## q-0839 — 原 std 丢掉「生成 Prompt」这一交付物，改为按原文要求写 prompt 并保留 emoji、tags

- 改前：依据 AIDA 结构、问题-解决-行动等爆款文案框架，创作面向小红书数学教育的内容。
- 改后：写一个 Prompt：根据给定的数学知识点和资料，生成适合小红书发布的初高中数学文案，带 emoji 和 tags，吸引家长与学生；按 AIDA、问题-解决-行动等爆款结构。

## q-0841 — 原文规则为中文，改用中文表述并补上 steps 的去重口径（nodes 按 id、edges 按 from 与 to）

- 改前：Improve _merge_paths: end merging at the node before the first relative-position/label match, and dedupe the merged steps.
- 改后：复查并改进 _merge_paths：合并应在首个相对位置与 label 都一致（非起始点）的节点的上一个节点结束；steps 去重，nodes 按 id、edges 按 from 与 to 拼接去重。

## q-0844 — 补上原 std 漏掉的 minhash 去重、context engineering 与 SSE 流式输出等原文要点，压缩措辞以符合长度限制

- 改前：构建以 query 为输入的 AI 问答 Python 系统：RAGFlow 混合搜索、Qwen embedding 加 Neo4j 向量检索与 n-hop 邻居扩展、minhash 去重、context engineering 与 SSE 流式输出。
- 改后：构建 AI 问答 Python 系统：RAGFlow 混合搜索、Qwen embedding + Neo4j 向量检索与 n-hop 邻居扩展、minhash 去重、context engineering、SSE 流式输出。

## q-0847 — 把模型名订正为原文的 qwen2-0.6B，删去原文未提的“文章”与 RAG 分块说法，补上 Google style guides、PEP 8 注释、PEP 257 DocString、typing 与完工自检等硬约束。

- 改前：Build a pluggable-factory RAG chunking system in Python with M3E embedding and Qwen2-0.5B or OpenAI, per the attached article.
- 改后：Build an industrial Python code system file by file with a pluggable factory mode, m3e embedding plus qwen2-0.6B or OpenAI api-key, Google style guides, PEP 8 comments, PEP 257 DocString, typing, and a final correctness recheck.

## q-0850 — 补上两张表的列名（job_description、category_name、major）与两个子目标：先从岗位描述中提取带专业信息的行，再映射到标准 category_name/major；保留多角度解法要求。

- 改前：针对两个 CSV（一个含 job_description 列，另一个含匹配用字段）完成跨表匹配分析，给出清晰完整的方案并从多个角度提出不同解法。
- 改后：有两个 CSV：一个含 job_description 列，另一个含 category_name、major 两列；需从每条岗位描述中提取带专业信息的行，再映射到标准 category_name 或 major，并从多个角度给出不同解法。

## q-0853 — 删去原文没有的 PRD 提法，补上 prompts.py 工厂模式、正则稳健提取 JSON、单文件可单独运行等约束，asyncio 并发 2、loguru、langgraph、OpenAI 按原文保留。

- 改前：按 PRD 用 Python 实现递归长文压缩系统，并改写为 asyncio(并发2)、loguru 日志、LangGraph 工作流与 OpenAI 接口，prompt 采用 COT 与工厂模式并稳健提取 JSON。
- 改后：重写该长文压缩系统的 Python 代码：改用 asyncio（并发 2）、loguru、LangGraph、OpenAI 接口，prompt 采用 COT 与 prompts.py 工厂模式，正则稳健提取 JSON，每个文件可单独运行。

## q-0861 — 补上原文的输出格式约束（JSON），把“特定结构 prompt”与从 query 提取起始/结束节点这一交付物写清，三字段名与原文一致。

- 改前：基于大学政策文档的双向树结构，解析 query 含义并判断可能的起始节点与结束节点（含 NODE_LABEL、NODE_KEYWORDS、RELATION_TYPE），并设计成特定结构的 prompt 来完成节点提取。
- 改后：基于大学政策文档的双向树结构，解析 query 含义并判断可能的起始与结束节点（含 NODE_LABEL、NODE_KEYWORDS、RELATION_TYPE，输出为 JSON），并设计成指定结构的 prompt 完成节点提取。

## q-0862 — 补上原文要求的核心任务后加 recheck/rethink、mermaid 工作流、上游输出压缩传给下游等细节，其余要求保持原样。

- 改前：设计一个任务分解 prompt：对用户需求做带方向的网状任务分解并编号、区分核心与一般任务，分析每个任务的搜索需求与搜索关键词，并将上游任务输出压缩后传给下游任务。
- 改后：设计任务分解 prompt：对用户需求做带方向的网状任务分解并编号、区分核心与一般任务，为每个任务分析搜索需求与关键词，把上游任务输出压缩后作为下游输入，核心任务后加 recheck 和 rethink，以 mermaid 给出工作流。

## q-0864 — 删去 orig 中不存在的附件名 paste.txt 与 Flask 说法，明确对象是粘贴的 load_model 模型加载代码及其 T5Tokenizer/torch.load 细节。

- 改前：分析并重写关键词提取相关的模型加载与 Flask 接口代码（含消息内粘贴代码与附件 paste.txt），假定所提及的函数均已导入。
- 改后：Analyze and rewrite the pasted code where load_model loads Chinese and English keyword-extraction and numerical-data classification models with T5Tokenizer and torch.load; assume all mentioned imported functions are given.

## q-0865 — 补上 task_prompt 所属的 base_tree/riched_tree 流水线上下文，并保留按 improved_logic 修正、确保 LLM 可读两项要求。

- 改前：Check my LangGraph ReAct task_prompt for logic contradictions and LLM readability, then apply the improved_logic fixes.
- 改后：Check my LangGraph ReAct task_prompt for a base_tree/riched_tree pipeline for logical contradictions and LLM readability, then apply the improved_logic fixes.

## q-0870 — 去掉悬空的「附件」表述并压缩长度，保留论文、factory 模式、LangGraph 与两层模块的交付要求。

- 改前：基于附件 METAGPT 论文分析并提取 MetaGPT 的框架与逻辑，用 factory 模式与 LangGraph 设计项目架构，逐文件给出 Agent Layer 与 Orchestration Layer 的详细代码。
- 改后：基于 MetaGPT 论文提取其框架与逻辑，用 factory 模式与 LangGraph 设计项目架构，逐文件实现 Agent Layer 与 Orchestration Layer。

## q-0871 — 压缩到 120 字内，保留算法清单、CleanRL 三原则与 torch/loguru/tensorboard 约束（gym-atari 与 checkpoint 因长度省略）。

- 改前：调研策略类（REINFORCE、A2C、SAC、DDPG、DPG、PPO）与值类（Rainbow 系列）强化学习算法的底层逻辑，设计系统与子模块，遵循 CleanRL 的单一职责、显式依赖、易于测试原则逐文件给出完整代码。
- 改后：调研策略类（REINFORCE、A2C、SAC、DDPG、PPO）与 Rainbow 值类强化学习算法的底层逻辑，遵循 CleanRL 单一职责、显式依赖、易于测试原则逐文件实现，用 torch、loguru、tensorboard。

## q-0874 — 把悬空的「该最初逻辑」改为指向本条已描述的三步检索逻辑，其余保留。

- 改前：构建图检索服务：neo4j 的 text 切片入 ragflow，用 top5 chunk 映射 neo4j 节点取相邻 text，另用 embedding 检索 top3 节点，保持该最初逻辑。
- 改后：构建图检索服务：neo4j 的 text 切片入 ragflow，用 top5 chunk 映射 neo4j 节点取相邻 text，另用 embedding 检索 top3 节点，保持上述检索逻辑不变。

## q-0875 — 补上原文 task1：llm_client 改用 qwen-plus、embedding_client 改用 text-embedding-v4；「不用 cypher+entity」由「只用 embedding 检索」覆盖。

- 改前：为 ExerciseService 增加练题 API，并改为使用 neo4j 服务且只用 embedding 检索，不使用 cypher+entity 检索。
- 改后：为 ExerciseService 增加练题 API，改用 neo4j 且只用 embedding 检索，并把 LLM 与 embedding 客户端换成 qwen-plus 和 text-embedding-v4。

## q-0880 — 去掉原文未出现的 Referer/防盗链字样，改用原文中的 TengineCDN、fetch、zip、403 Forbidden。

- 改前：排查并修复 IPO 报告下载系统的 403 Forbidden（Referer ACL 防盗链）错误，解释浏览器点击可下载而代码直连 zip 链接失败的原因。
- 改后：排查并修复 IPO zip 下载的 403 Forbidden 错误（TengineCDN 拒绝），解释浏览器点击链接能下载、代码直接 fetch 却失败的原因。

## q-0881 — 去掉原文未出现的 Clash，改用原文 yaml 里的 mixed-port；proxy manager 按原文写法保留。

- 改前：修正 main.py 中对 downloadscraper 的引用，并改为通过 ProxyManager 的 select_random 获取 proxy_url，配套 Clash 配置与代理管理器代码。
- 改后：修正 main.py 中对 downloadscraper 的引用，并改为用 proxy manager 的 select_random 获取 proxy_url，配套 mixed-port 代理配置与管理器代码。

## q-0888 — 补上原文报错中的 brotli 解码失败这一具体异常，并去掉原文没有的「并发」表述。

- 改前：排查并发抓取时的 aiohttp 连接异常，以及部分页面找不到 #chaptercontent 的问题，并给出解决方案。
- 改后：排查抓取时的 aiohttp brotli 解码异常和部分页面找不到 #chaptercontent 的问题，并给出解决方案。

## q-0894 — 补上原报错定位的文件与函数（knowledge_processor.py 的 process_knowledge_nodes）及异常类型。

- 改前：修复 knowledge_processor 递归处理知识点节点时抛出的异常。
- 改后：修复 knowledge_processor.py 中 process_knowledge_nodes 递归处理知识点节点时的 'NoneType' object is not iterable 报错。

## q-0899 — 补上 query 默认 None 这一入参约定，其余已自洽。

- 改前：基于已有的 DocChunker 与 tokenize_text，用 TF-IDF 实现文档压缩类，输入 doc、query、max_length、topN，按 topN 或 max_length 压缩且保持分块原有顺序。
- 改后：基于 DocChunker 与 tokenize_text，用 TF-IDF 实现文档压缩类：输入 doc、query（默认 None）、max_length、topN，按 topN 或 max_length 压缩并保持分块原有顺序。

## q-0900 — 去掉悬空的「前述」，点名 TF-IDF，并补上 k1、b 参数约束。

- 改前：参照前述 TF-IDF 压缩逻辑，构建基于 BM25 的文档压缩逻辑，支持带查询与不带查询两种模式。
- 改后：参照 TF-IDF 文档压缩的思路，构建基于 BM25 的文档压缩逻辑，支持带查询与不带查询两种模式，k1、b 参数可调。

## q-0901 — 去掉无法独立理解的「前述逻辑」，改为直接描述任务与两种压缩模式。

- 改前：参照前述逻辑构建基于 TextRank 的文档压缩逻辑，并给出参数以选择按共现关系或语义相似性构建边。
- 改后：构建基于 TextRank 的文档压缩逻辑，支持带查询与不带查询两种模式，并给出参数以选择按共现关系或语义相似性构建边。

## q-0902 — 补上第三种特征来源的模型名 qwen2.5-7B 与「语义+递归分块」前提。

- 改前：在 LLM 应用中用 SimHash 对大规模相似文档去重，给出高可扩展的工业级实现；并构建三种 DocumentDeduplicator：基础 simhash、分块关键词特征、分块 embedding 均值。
- 改后：在 LLM 应用中用 SimHash 对大规模相似文档去重，要求工业级高可扩展实现；并构建三种 DocumentDeduplicator：基础 simhash、分块关键词（qwen2.5-7B 提取）、分块 embedding 平均。

## q-0914 — 补上原文后段的本地复刻要求（langgraph + qwen3.6-plus/Opus），删去原文的文档链接，并压缩措辞以守住 120 字上限。

- 改前：深度调研并分析 Anthropic Advisor Tool（服务端插入的二级推理通道）的底层逻辑与网络技术实现方案，撰写详细 markdown 文档并绘制便于理解的架构图。
- 改后：深度调研 Anthropic Advisor Tool 底层逻辑与本地复刻，输出 markdown 文档与架构图；用 langgraph 以 qwen3.6-plus 为 Executor、Opus 为 Advisor 实现。

## q-0916 — 补上原文的交付要求（可直接用于立项决策），并把“B 站”写成原文的“B站”，压缩重复措辞。

- 改前：撰写一份治愈系农场模拟经营品类的游戏市场分析报告：近一年爆款游戏的核心玩法、卖点与 TapTap、B 站玩家好评差评；品类内卷程度、用户规模天花板与增长趋势；玩家未被满足的需求与中小团队可切入的蓝海方向；政策风险、合规红线与立项避坑要点。
- 改后：撰写治愈系农场模拟经营品类的游戏市场分析报告：近一年爆款玩法与卖点、TapTap和B站玩家评价；内卷程度、用户规模天花板与增长趋势；玩家未满足需求与中小团队可切入方向；政策风险、合规红线与立项避坑要点，结论可直接用于立项决策。

## q-0920 — 补上原文中“算法工程师”与 JSON 流式输出这两个关键约束，并压缩长度到限制内。

- 改前：用 skill-creator 创建 Prompt 优化 Skill：面向算法工程师，输入原始 Prompt 或新需求，输出按类别变量模块化的结构化 Prompt 与优化建议，并约定 JSON 输出格式、嵌套标记与防提示词暴露的拒止策略。
- 改后：用 skill-creator 创建 Prompt 优化 Skill：面向算法工程师，输入原始 Prompt 或新需求，输出按类别变量模块化的 Prompt 及优化建议，约定 JSON 流式输出、嵌套标记与防提示词暴露的拒止策略。

## q-0921 — 解掉悬空的“上述 Skill”，按原文“improve skill based on”改指之前那个用于优化 prompt 的 skill（指代由 reply 的“优化Prompt/更新SKILL.md”确定），并补上让用户补充业务场景字段含义的对齐要求。

- 改前：在上述 Skill 中增加核心字段提取能力：从用户输入或需求中提炼核心字段并给出字段含义，若用户不认可则请其补充说明；例如教育场景下的答案解析字段需解释原理与解题思路，而非仅给评分标准。
- 改后：在之前那个 skill 中增加核心字段提取与对齐能力：从用户输入或需求中提炼核心字段并给出字段含义，若用户不认可则让其补充业务场景下的含义；例如教育场景的答案解析字段需解释原理与解题思路，而非仅给评分标准。
