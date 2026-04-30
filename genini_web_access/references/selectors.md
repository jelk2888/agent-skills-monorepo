# Gemini CSS Selectors Reference

## Core Elements

| Element | Selector | Notes |
|---------|----------|-------|
| New Chat Button | [data-test-id="new-chat-button"] | Primary, top-left |
| Mode Selector | button[aria-label="打开模式选择器"] | Opens mode dropdown |
| Quick Mode Option | [data-test-id="bard-mode-option-快速"] | role=menuitem |
| Quill Editor Input | div.ql-editor[contenteditable="true"][role="textbox"] | Rich text editor |
| Send Button | .send-button-container button.send-button | After text input |
| Generated Images | img.image.animate.loaded | Newly animated |
| All Loaded Images | img.image.loaded | Including static |
| Download Button | button[data-test-id="download-generated-image-button"] | On hover toolbar |
| More Options (per-session) | button[aria-label*="更多选项"] | Exclude Gem/notebook |
| Delete Option | [data-test-id*="delete"] | In dropdown menu |
| User Query Container | [class*="user-query"] | User message bubble |

## Fallback Selectors (ordered by priority)

### New Chat
1. [data-test-id="new-chat-button"]
2. button[aria-label*="新建"]
3. button[aria-label*="new chat"]
4. [aria-label="新建聊天"]
5. a[href="/app"]

### Mode Options
1. [data-test-id="bard-mode-option-快速"]
2. [role="menuitem"] containing text match

### Send Button
1. .send-button-container button.send-button
2. .send-button-container button
3. button[aria-label*="发送" i]
4. Enter key fallback

## Headless Mode Notes

- NEVER use offsetWidth/offsetHeight for visibility checks (returns 0 in headless)
- Always use Page.bringToFront + mouse click to activate page after load/reload
- After Page.reload, wait 8s then re-activate before DOM operations
