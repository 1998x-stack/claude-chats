# Claude 存档 · Claude Archive

A read-only viewer for a claude.ai data export, built to look and feel like
claude.ai's own dark interface. No framework, no dependencies.

```
node tools/build.mjs      # 238 MB conversations.json  ->  web/data/   (~8s)
node tools/questions.mjs --merge   # qwork/ -> web/data/questions.json (question gallery)
node tools/serve.mjs      # http://127.0.0.1:8787/
```

Then open the printed URL.

## Two ways to run it

**Local — the whole archive, full-text search.** `tools/serve.mjs` binds to
`127.0.0.1` only and adds `/api/search`, which scans the 45 MB corpus server-side
so it never reaches the browser.

**Published — `https://1998x-stack.github.io/claude-chats/`.** The same viewer,
served as a static site by GitHub Pages. **This copy is public: it contains every
conversation in the export, verbatim.** There is no server on Pages, so
`runSearch()` falls back to client-side matching over `data/index.json`
(names, summaries, previews); full-text corpus search is local-only. The question
gallery's own search is client-side either way, so it works in both.

Deploys run from `.github/workflows/pages.yml` on every push to `main`: it runs
the test suite, copies `web/` into an artifact (minus the pipeline inputs
`data/refine/` and `data/qdigest/`), and deploys it. `web/data/` is committed
precisely so Pages can serve it.

## What the export contains

| | |
|---|---|
| Conversations | 705 (73 never named, 79 hold no messages at all) |
| Messages | 2,733 (1,457 human / 1,276 assistant) |
| Prose | 4.9 MB in replies, 1.5 MB of extended thinking |
| Tool calls | 10,108 — `write` 3,398 · `bash` 2,391 · `read` 1,241 · `present` 674 · `search` 661 · `edit` 572 (1,094 errored) |
| Artifacts | 259 Claude artifacts + 2 Claude Docs documents, 3.0 MB |
| Files | 3,971 files written by Claude, 1,440 of them shared with you, 30.9 MB |
| Attachments | 491 pasted files, 17.7 MB of extracted text (382 of them lost their filename in the export) |
| Date range | 2024-11-07 → 2026-11-18 |
| Raw size | 238 MB in one JSON array |

## Artifacts and files

**The export does not contain artifacts as artifacts.** Only two rendered pages came with
it (`assets/frames-000.zip` → `data/artifacts/<container-id>/page.md`), and one of them is
*3D 高斯泼溅（3DGS）技术与产业调研*. Everything else — 259 Claude artifacts and 3,971 files —
exists only as tool-call payloads inside the conversations, so the viewer rebuilds it:

| Source | How it is recovered |
|---|---|
| `artifacts` tool | `create`/`rewrite` carry the whole body; each `update` carries an `old_str`/`new_str` delta that must be applied in order |
| `mcp__Claude_Docs__*` | `batch` creates the skeleton, each `update` carries block-replace ops whose inline content is the prose; concatenated in order they reproduce the document |
| `create_file` / `Write` | the full body per write, with later `str_replace` / `Edit` calls applied on top |
| `present_files` | marks which files were actually handed to you |
| message attachments | read straight out of the chat file — the export keeps the extracted text, so these need no reconstruction |

That reconstruction is verified, not assumed: for the 3DGS document, which also shipped
as a rendered page, it produces the same 29 headings as the exported `page.md`. The two
exported pages are matched by Claude Docs container id and used as the authoritative
body, so those two render exactly as claude.ai showed them. 21 of 261 rebuilds are
incomplete — an edit whose `old_str` no longer matches, or a file that was edited but
never written in the export — and each one says so in its panel footer.

- **Cards in the transcript** appear under the turn that produced them, for the
  artifacts and the shared files — the ones you were actually given. Everything stays
  visible in the list view.
- **The document panel** (right-hand side) is the one reader for everything: a Claude
  artifact, a Claude Docs page, a file Claude wrote, or an attachment you uploaded. It
  renders markdown, highlighted source, or an HTML artifact with a 预览 / 源码 toggle,
  shows the exported comments, and carries 复制 and 下载 (with a sensible filename and
  extension). `Esc` closes it; it steps out of the sidebar's way on narrower windows,
  and it closes when you move to a different conversation.
- **`全部产物`** in the sidebar indexes all 4,723 items across 415 conversations, with
  counts on every filter (文档 / 代码 / 网页 / 附件 / 文件 / 已分享). Attachments are
  included, and the 382 unnamed pastes carry a content snippet so they can be told
  apart. Search matches artifact titles and paths too, listed under the conversation
  results.
- **Copy and download** — every message has a 复制 button on hover (the Markdown of
  that turn), the top bar copies the whole conversation as Markdown, and the document
  panel copies or downloads whatever it is showing. Clipboard writes fall back to a
  hidden textarea when the async Clipboard API is unavailable.

## What the viewer does

- **Sidebar** — the 40 most recent conversations, collapsing to a header. `查看全部`
  opens all 705 grouped by month, with message counts and sizes.
- **One conversation** (`#/c/<id>`) — user messages as right-aligned bubbles,
  assistant replies as prose, extended thinking and tool activity behind collapsible
  disclosures that are closed by default, exactly as claude.ai does it.
- **Tool activity** is summarised in one line per assistant turn, in the same idiom
  claude.ai uses: `读取了 2 个文件 · 执行了 8 条命令 · 创建了 1 个文件`. Expand it for
  each call's input, output, and error state.
- **The rail** — the thin column of ticks in the gutter to the left of the text is a
  positional index of the conversation. One tick per message, amber for you and grey
  for Claude, taller where a message is longer. Click or drag it to jump; hover for a
  preview. It turns blue where your search term appears. This is the one thing the
  original interface doesn't have, and it exists because a 42-message, 1.7 MB
  conversation is otherwise unreadable.
- **Search** (the composer at the bottom, or ⌘K) matches conversation titles and
  previews instantly, then asks the local server for full-text matches across every
  message, thinking block, tool output, and pasted attachment. Results show a real
  snippet with a hit count; opening one highlights every occurrence in place.
- **Dates** — a separator whenever the day changes, plus per-message timestamps on
  hover.
- **Artifacts and files** — see above.
- **Theme and layout** — dark by default with a light mirror, both persisted. The
  sidebar collapses from a chevron in its header or the top-bar toggle. The rail is
  hidden when there is no gutter for it, and the sidebar and the document panel never
  overlap: below ~1100px both are overlays, so opening one closes the other.
- Empty conversations, load failures, and no-result searches all say what happened
  and what to do rather than showing a blank page.

## Fidelity
The interface was matched against a real claude.ai screenshot rather than guessed at.
Every value below was sampled from its pixels (`tools/inspect/colprobe.swift` decodes
colour along a column; `tools/inspect/layout.swift` prints a luminance map):

| | Reference | This build |
|---|---|---|
| Sidebar | 287 px, `#1f1f1f` | 287 px, `#1f1f1f` |
| Canvas | `#191919` | `#191919` |
| Reading column | 767 px wide, inner padding 18 px | 767 px wide, inner padding 18 px |
| Banner | inset 8 px, 40 px tall, `#2b261b` on `#e39c08`, centred | identical |
| Top bar | 44 px, 1 px hairline | 44 px, 1 px hairline |
| User bubble | 612 px wide, 72 px tall, `#252525` | 614 px wide, 72 px tall, `#252525` |
| Composer | 767 × 42 px, `#303030` | 767 × 42 px, `#303030` |
| Accent / link | `#efaa54` badge, `#68a8f0` links | identical |

The user bubble coming out 72 px tall in both, for the same message, is the check
that matters: same font size, line height, padding, and wrap point.

The type stack is the system UI face, deliberately — claude.ai uses Anthropic's
licensed brand fonts, and substituting a lookalike webfont would be a worse lie than
rendering in the face the reader's own machine already uses.

### Deliberate differences from claude.ai

- **The composer is a search box.** claude.ai's input is for sending messages; this
  archive is read-only, and a working field is better than a decorative one. Same
  shape, same place, same ⌘K-reachable feel — it does something true.
- **The banner states provenance, not account status.** The reference's banner warns
  that the account is unverified. That is a claim about your account, not your data,
  so this one says `本地存档 · 只读 · XM 的 claude.ai 导出 2024-11-07 至 2026-11-18 ·
  数据不离开这台设备`. On a published copy the label becomes `公开存档` and the closing
  claim `此副本已发布到公网` — see `web/provenance.mjs`, which decides this from the host.
- **No billing chrome** (`Free 套餐 · 升级`) and no share/upgrade buttons.
- **`injected_prompt_block` content is folded away.** 50 of these exist — date notes,
  agent listings, `<system-reminder>` scaffolding. claude.ai never shows them, so they
  are not rendered as if you had typed them; they sit behind a collapsed `系统注入`
  disclosure instead of being silently dropped.
- **Envelope decoration is dropped.** Empty conversations show `这段对话在导出里没有消息`
  instead of an empty row, and 73 auto-titled conversations are marked `标题为自动生成`.

## Data notes

Two things in the export will bite anyone parsing it:

- **`m.text` is not the message text.** It is `thinking` + `text` concatenated, which
  makes the export look like it holds 2.1 MB more prose than it does. This viewer keeps
  them as separate blocks, matching how claude.ai displays them.
- **The file contains U+2028 LINE SEPARATOR.** It is legal JSON, so `JSON.parse` is
  happy, but Node's `readline` treats it as a line break — splitting the file into
  710 records instead of 705. A first attempt at a streaming brace-scanner silently
  truncated 20 of 705 objects, which is why the build now pipes `jq -c '.[]'` and
  validates that every record has a `chat_messages` array.

Internal system-injection blocks, `token_budget` markers, and tool-result payloads
that are not text are not carried into the per-chat files.

Artifacts are not duplicated into `web/data`: only metadata is indexed, and each body
is rebuilt in the browser from the conversation file that already holds the tool calls
that produced it. The build and the browser share one implementation of the
reassembly rules (`web/artifacts.js`).

## Question gallery

The archive holds a second reading of itself: every question you asked, rewritten
into a self-contained standard question and grouped into theme modules, at
`#/questions` in the viewer.

```
node tools/questions.mjs --digest     # 705 conversations -> 36 slices in web/data/qdigest/
   36 × extraction subagent           # each writes qwork/part-NN.json
node tools/questions.mjs --tags       # tag frequencies — the input to the module table
   1 × clustering subagent            # writes qwork/modules.json
node tools/questions.mjs --merge      # -> web/data/questions.json
node tools/questions.mjs --check      # schema, counts and coverage
```

| | |
|---|---|
| Questions | 922, deduped from 926 extractions |
| Candidate messages | 1,296 (of 1,457 human messages; 151 are `continue`-style, 10 are empty) |
| Modules | 14, plus `未分类` |
| Coverage | every candidate message is pointed at by at least one question |

Rules that matter, because each was learned the hard way:

- **The extraction subagents never copy your text.** They point at messages by id
  (`msgIds`), and `--merge` restores each original verbatim from
  `web/data/chats/*.json`. Asking a model to reproduce a long Chinese message
  exactly is the least reliable step in the pipeline; the first extraction
  attempt produced nothing at all proving it.
- **Merging never drops anything.** A question asked in several conversations, or
  a follow-up that only continues an earlier request, becomes one question with
  several `sources[]`, each keeping its own conversation, message ids and text.
- **`qwork/` is not disposable.** `web/data/` is deleted and rebuilt by
  `build.mjs`; `qwork/` holds model output that cannot be recomputed, which is
  the only reason `--merge` can be re-run at all.
- Module membership is a partition: one primary module per question, so the module
  counts add up to the question count.
- `--digest` caps each message at 600 UTF-8 bytes and uses 20 conversations per
  slice, because a slice has to be readable in one tool call (the first attempt
  used 30-conversation slices of up to 137 KB, which workers paged with `head -c`
  and ran out of context on). A chunk whose output will not fit in one response
  can be split into `part-NN-a.json` / `part-NN-b.json`; the validator and the
  merge treat the shards as one chunk.

## Layout

```
assets/
  *.zip          the original export, untouched: conversations, frames, projects,
                 memories, light_metadata, plus the manifest
  manifest-*.json
data/            unzipped from assets/; the build reads only from here
  conversations.json   the raw array the build streams
qwork/           question extraction output — NOT regenerable, see the gallery section
tools/
  build.mjs      data/conversations.json -> web/data/{index,artifacts,pages,corpus}.json + chats/*.json
  questions.mjs  question gallery pipeline: --digest / --check-work / --tags / --merge / --check
  qextract-prompt.md the single source of the extraction instructions
  serve.mjs      static server + /api/search, 127.0.0.1 only
  cdp.mjs        run an expression in a headless Chrome and print the result
  shot.mjs       pixel-exact screenshots at a given size and device scale factor
  inspect/       Swift instruments used to decode the reference screenshot
test/            node --test suites (zero dependencies)
web/
  index.html  styles.css  app.js  md.js  artifacts.js  questions-lib.mjs
                 (artifacts.js and questions-lib.mjs are shared with tools/)
  data/          generated; safe to delete and rebuild
```

To rebuild from the original export:

```
unzip -o assets/conversations-000.zip -d data   # -> data/conversations.json
unzip -o assets/frames-000.zip       -d data   # -> data/artifacts/<container-id>/page.md
unzip -o assets/projects-000.zip     -d data   # -> data/projects/*.json
unzip -o assets/memories-000.zip     -d data   # -> data/memories/*.json
unzip -o assets/light_metadata-000.zip -d data # -> data/users.json, data/login_history.json
node tools/build.mjs
```

The zips are never read by the code, so they can live anywhere; only the unzipped
files under `data/` are read.

`cdp.mjs` and `shot.mjs` are how this was built without being able to see the screen:
measure the live DOM, screenshot, then decode the pixels back into numbers.

## Known limits

- Downloads are plain text with a sensible filename. Binary attachments (PDFs and the
  like) were never stored in the export — only their extracted text — so those
  download as `.txt`.
- Search is server-side and in-memory: the first query costs ~150 ms to load and
  lowercase the 37 MB corpus, each query after that is ~10 ms. Opening `index.html`
  directly as a `file://` URL disables full-text search (the page says so) because
  `fetch` is blocked for local files — use the server.
- The build needs `jq`; without it, it falls back to `JSON.parse` and re-execs itself
  with an 8 GB heap.
- Artifact search matches titles and paths client-side. The server's corpus already
  contains the artifact *bodies* (they are tool inputs), so a phrase from inside a
  document finds the conversation, not the artifact row.
- HTML artifacts run in an `<iframe sandbox="allow-scripts">`, so their scripts execute
  in an opaque origin. That is the same tradeoff claude.ai makes; they are local files
  you generated, but read the 源码 tab first if you want to know what they do.
- Projects and the memories file are still not shown. Nothing is missing from the data —
  `data/projects/` and `data/memories/` hold them, they just have no view yet.
- No keyboard navigation between messages (⌘K searches, `Esc` closes the document panel).
- 79 conversations are empty in the export itself; nothing can display what isn't there.
- The gallery's standard questions are **model rewrites**, not your words — that is
  the point of them, and why every card also shows the verbatim original, with a
  separate copy button for each.
- A question lands in `未分类` when its tags fall outside the 127 high-frequency
  tags the module table was built from (that head covers ~41% of all tag uses;
  the rest is a long tail of one-off labels).
- `web/data/questions.json` is generated, so after `node tools/build.mjs` you have
  to run `node tools/questions.mjs --merge` again. The gallery says so rather than
  showing an empty page.
