export const defaultBBSContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>■ 2ちゃんねる風 仮想掲示板 ■</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg-color: #fffff0; /* 2ch style warm ivory/beige */
      --text-color: #000000;
      --sidebar-bg: #efebde; /* vintage frame gray/beige */
      --border-color: #ccc;
      --name-color: #228b22; /* classic bold green */
      --link-color: #0000ee; /* classic browser blue */
      --link-hover: #ff0000;
    }
    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: "MS PGothic", "IPAMonaGothic", "Mona", "Meiryo", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
    }
    header {
      background-color: var(--sidebar-bg);
      border-bottom: 2px solid var(--border-color);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      gap: 12px;
    }
    .header-logo-area {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    header h1 {
      margin: 0;
      font-size: 15px;
      font-weight: bold;
      color: #800000; /* dark crimson/red typical of 2ch plate headers */
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    #sound-control-btn, #manual-reload-btn {
      background-color: #e0e0e0;
      border: 1px solid #777;
      border-radius: 2px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 1px 1px 0px white inset, -1px -1px 0px #555 inset;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    #sound-control-btn:hover, #manual-reload-btn:hover {
      background-color: #d5d5d5;
    }
    #sound-control-btn:active, #manual-reload-btn:active {
      box-shadow: -1px -1px 0px white inset, 1px 1px 0px #555 inset;
    }
    .badge {
      font-size: 10px;
      background: #800000;
      color: white;
      padding: 1px 4px;
      border-radius: 2px;
      font-family: monospace;
    }
    .main-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .sidebar {
      width: 260px;
      background-color: var(--sidebar-bg);
      border-right: 2px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 10px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .btn-create {
      background-color: #e0e0e0;
      color: black;
      border: 1px solid #777;
      border-radius: 2px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 1px 1px 0px white inset, -1px -1px 0px #555 inset;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .btn-create:hover {
      background-color: #d5d5d5;
    }
    .btn-create:active {
      box-shadow: -1px -1px 0px white inset, 1px 1px 0px #555 inset;
    }
    .thread-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .thread-item {
      padding: 8px 12px;
      border-bottom: 1px solid #e0d9c9;
      cursor: pointer;
      font-size: 13px;
      word-break: break-all;
    }
    .thread-item:hover, .thread-item.active {
      background-color: #fffff0;
    }
    .thread-item .title {
      font-weight: bold;
      color: var(--link-color);
      text-decoration: underline;
    }
    .thread-item:hover .title {
      color: var(--link-hover);
    }
    .thread-item .meta {
      font-size: 11px;
      color: #666;
      margin-top: 4px;
      display: flex;
      justify-content: space-between;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-color);
      overflow: hidden;
    }
    .board-title-banner {
      text-align: center;
      padding: 15px 10px;
      border-bottom: 1.5px solid var(--border-color);
      background-color: #fff;
      flex-shrink: 0;
    }
    .board-title-banner h2 {
      margin: 0 0 5px 0;
      font-size: 20px;
      color: #ff0000;
      font-family: "MS PGothic", sans-serif;
      font-weight: bold;
    }
    .ascii-art {
      font-family: "MS PGothic", "Mona", monospace;
      font-size: 12px;
      line-height: 1.2;
      background: none;
      border: none;
      padding: 0;
      margin: 8px auto;
      display: inline-block;
      text-align: left;
      white-space: pre;
    }
    .board-description {
      font-size: 12px;
      color: #333;
    }
    .posts-container {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .post-card {
      background-color: transparent;
      border: none;
      padding: 0;
      border-bottom: 1px dashed var(--border-color);
      padding-bottom: 14px;
    }
    .post-card:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
    .post-header {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    .post-number {
      font-weight: bold;
      color: var(--link-color);
      cursor: pointer;
    }
    .post-number:hover {
      text-decoration: underline;
      color: var(--link-hover);
    }
    .post-author {
      font-weight: bold;
      color: var(--name-color);
    }
    .post-date, .post-id {
      color: #666;
    }
    .anchor-link {
      color: var(--link-color);
      font-weight: bold;
      cursor: pointer;
      text-decoration: underline;
    }
    .anchor-link:hover {
      color: var(--link-hover);
    }
    .post-body {
      font-size: 14px;
      line-height: 1.6;
      color: #000;
      white-space: pre-wrap;
      padding-left: 20px; /* indent body of post */
      word-break: break-all;
    }
    .no-selection {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #666;
      text-align: center;
      padding: 20px;
    }
    .footer-composer {
      background-color: var(--sidebar-bg);
      border-top: 2px solid var(--border-color);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
    }
    .composer-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .composer-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }
    .composer-row label {
      font-weight: bold;
    }
    .composer-row input {
      background-color: #fff;
      border: 1px solid #aaa;
      border-radius: 2px;
      padding: 4px 6px;
      color: black;
      font-size: 13px;
      outline: none;
    }
    .input-author {
      width: 140px;
    }
    .input-email {
      width: 100px;
    }
    .composer-textarea-row {
      display: flex;
    }
    .input-content {
      flex: 1;
      height: 70px;
      min-height: 50px;
      max-height: 150px;
      background-color: #fff;
      border: 1px solid #aaa;
      border-radius: 2px;
      padding: 6px 10px;
      color: black;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      outline: none;
    }
    .input-content:focus, .composer-row input:focus {
      border-color: #555;
      background-color: #fffff8;
    }
    .composer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .btn-submit {
      background-color: #e0e0e0;
      color: black;
      border: 1px solid #777;
      border-radius: 2px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 1px 1px 0px white inset, -1px -1px 0px #555 inset;
    }
    .btn-submit:hover {
      background-color: #d5d5d5;
    }
    .btn-submit:active {
      box-shadow: -1px -1px 0px white inset, 1px 1px 0px #555 inset;
    }
    .btn-ai {
      background-color: transparent;
      border: 1px solid #9966cc;
      color: #9966cc;
      border-radius: 2px;
      padding: 5px 10px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-ai:hover {
      background-color: rgba(153, 102, 204, 0.08);
    }

    /* Mobile Responsive Optimizations */
    @media (max-width: 640px) {
      header {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 6px !important;
        padding: 6px 8px !important;
      }
      .header-logo-area {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
      }
      header h1 {
        font-size: 13px !important;
      }
      .header-controls {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        width: 100% !important;
        gap: 6px !important;
      }
      #autoload-control {
        border-radius: 2px !important;
        padding: 3px 6px !important;
        font-size: 10px !important;
        display: flex !important;
        border-radius: 2px !important;
        padding: 3px 6px !important;
        font-size: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 4px !important;
      }
      #autoload-control select {
        font-size: 10px !important;
        padding: 1px !important;
      }
      #sound-control-btn, #manual-reload-btn {
        padding: 3px 6px !important;
        font-size: 10px !important;
        flex: 1 1 auto !important;
        justify-content: center !important;
        text-align: center !important;
      }
      .mobile-back-btn {
        padding: 3px 5px !important;
        font-size: 11px !important;
        margin-right: 4px !important;
      }
      .sidebar {
        width: 100%;
        position: absolute;
        inset: 0;
        z-index: 10;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .content-area {
        width: 100%;
        position: absolute;
        inset: 0;
        z-index: 5;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Active thread mode */
      body.thread-active .sidebar {
        transform: translateX(-100%);
        pointer-events: none;
      }
      body.thread-active .content-area {
        z-index: 20;
      }
      
      .mobile-back-btn {
        display: flex !important;
      }
    }

    /* Toast Notification styles */
    #notif-toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .notif-toast {
      pointer-events: auto;
      background-color: #fff9c4; /* warm soft yellow */
      border: 2px solid #fbc02d;
      border-radius: 4px;
      padding: 10px 14px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      font-size: 12px;
      max-width: 280px;
      animation: slideIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .notif-toast.thread-toast {
      background-color: #e3f2fd; /* warm soft blue */
      border-color: #1e88e5;
    }
    .notif-toast-header {
      font-weight: bold;
      color: #800000;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .notif-toast.thread-toast .notif-toast-header {
      color: #0d47a1;
    }
    .notif-toast-body {
      color: #111;
      line-height: 1.4;
      font-family: inherit;
      word-break: break-all;
    }
    .notif-toast-close {
      cursor: pointer;
      font-weight: bold;
      font-size: 11px;
      color: #999;
      border: none;
      background: none;
      padding: 0;
      margin-left: 8px;
    }
    .notif-toast-close:hover {
      color: #333;
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(100px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    @keyframes fadeOut {
      to {
        transform: scale(0.9);
        opacity: 0;
      }
    }
    
    /* Highlight for new items */
    .new-post-highlight {
      animation: highlightPulse 3s ease-out;
    }
    @keyframes highlightPulse {
      0% {
        background-color: #fffde7;
        box-shadow: 0 0 12px rgba(253, 216, 53, 0.4) inset;
      }
      100% {
        background-color: transparent;
        box-shadow: none;
      }
    }

    .new-thread-tag {
      background-color: #e53935;
      color: white;
      font-size: 9px;
      font-weight: bold;
      padding: 1px 3px;
      border-radius: 2px;
      margin-left: 5px;
      display: inline-block;
      vertical-align: middle;
      animation: heartBeat 1s infinite alternate;
    }

    @keyframes heartBeat {
      0% { transform: scale(0.95); opacity: 0.85; }
      100% { transform: scale(1.05); opacity: 1; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinning {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    #sound-control-btn.sound-on {
      box-shadow: -1px -1px 0px white inset, 1px 1px 0px #555 inset !important;
      background-color: #d2d2d2 !important;
    }
  </style>
</head>
<body>

  <div id="notif-toast-container"></div>

  <header>
    <div class="header-logo-area">
      <button class="mobile-back-btn" onclick="backToSidebar()" style="display: none; background: #e0e0e0; border: 1px solid #777; color: black; padding: 4px 8px; border-radius: 2px; font-size: 12px; cursor: pointer; align-items: center; gap: 4px; margin-right: 10px; font-weight: bold; box-shadow: 1px 1px 0px white inset, -1px -1px 0px #555 inset;">
        ↩ スレッド一覧
      </button>
      <h1>📡 仮想掲示板 Nullちゃんねる <span class="badge">VFS RUNNING</span></h1>
    </div>
    
    <div class="header-controls">
      <!-- Autoload options selector -->
      <div id="autoload-control" style="background: rgba(0,0,0,0.04); border: 1px solid var(--border-color); padding: 4px 6px; border-radius: 3px; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        <span style="font-weight: bold; color: #555;">🔄 更新</span>
        <select id="autoload-interval" onchange="changeAutoloadInterval()" style="font-size: 11px; padding: 1px; border: 1px solid #999; outline: none; background: #fff; cursor: pointer;">
          <option value="0">オフ</option>
          <option value="5" selected>5秒</option>
          <option value="10">10秒</option>
          <option value="30">30秒</option>
          <option value="60">60秒</option>
        </select>
        <span id="autoload-timer" style="font-family: monospace; color: #800000; font-weight: bold; width: 34px; text-align: center; display: inline-block;">5秒</span>
      </div>
      
      <!-- Sound Toggle -->
      <button id="sound-control-btn" class="sound-on" onclick="toggleSound()">
        <span id="sound-icon">🔊</span>
        <span id="sound-label">新着音</span>
      </button>

      <!-- Manual Refresh Button -->
      <button id="manual-reload-btn" onclick="manualReloadAll()">
         <span>🔄</span> 手動更新
      </button>

      <!-- Autoload Indicator animation -->
      <div id="autoload-indicator" style="display: none; align-items: center; gap: 4px; color: #a52a2a; font-weight: bold; font-size: 11px;">
         <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background-color:#a52a2a; animation: heartBeat 0.5s infinite alternate;"></span>
         <span>更新中...</span>
      </div>
    </div>
  </header>

  <div class="main-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <button class="btn-create" onclick="openCreateThreadModal()">⚙️ + 新規スレッド作成</button>
      </div>
      <ul class="thread-list" id="thread-list-container">
        <!-- Thread list will load here -->
      </ul>
    </div>

    <div class="content-area">
      <div id="no-thread-selected" class="no-selection">
        <div class="board-title-banner">
          <h2>■ Nullちゃんねる (NullCh) ■</h2>
          <pre class="ascii-art">
 ∧＿∧     
（　´∀｀）＜ Nullちゃんねるへようこそ！
（　　　　）   スレを立ててレスを書き込もう！
 ｜ ｜ ｜  
（＿_）＿_）
          </pre>
        </div>
        <p style="font-size: 13px; font-weight: bold; margin: 15px 0 4px 0; color: #800000;">【スレッド未選択】</p>
        <p style="font-size: 11px; margin: 0; color: #555;">左側のスレッド一覧から読みたいディスカッションを選択するか、新しいスレッドを作成してください。</p>
      </div>

      <div id="thread-view" style="display: none; flex: 1; flex-direction: column; overflow: hidden;">
        <div class="posts-container" id="posts-container">
          <!-- Posts list will load here -->
        </div>

        <div class="footer-composer">
          <div class="composer-grid">
            <div class="composer-row">
              <label>名前：</label>
              <input type="text" id="composer-author" class="input-author" placeholder="名無しさん" value="名無しさん">
              <label style="margin-left: 10px;">E-mail：</label>
              <input type="text" id="composer-email" class="input-email" placeholder="sage" value="sage">
            </div>
            <div class="composer-textarea-row">
              <textarea id="composer-content" class="input-content" placeholder="ここにメッセージを書きます。Shift+Enterで改行、Enterで書き込みします。" required onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); submitPost(); }"></textarea>
            </div>
            <div class="composer-actions">
              <button class="btn-ai" id="ai-btn" onclick="askAiToDraft()">
                <span>✨</span> AIアシスタントに下書きを任せる
              </button>
              <button class="btn-submit" onclick="submitPost()">書き込む</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Thread Modal Overlay -->
  <div id="create-thread-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index: 1000; align-items: center; justify-content: center; padding: 16px;">
    <div style="background-color: var(--sidebar-bg); border: 2px solid #555; border-radius: 4px; width: 100%; max-width: 380px; padding: 20px; box-sizing: border-box; box-shadow: 2px 2px 10px rgba(0,0,0,0.3);">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #800000; font-weight: bold; display: flex; align-items: center; gap: 6px;">🆕 新規スレッドの作成</h3>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <div>
          <label style="display: block; font-size: 12px; color: #000; margin-bottom: 6px; font-weight: bold;">スレッドタイトル</label>
          <input type="text" id="modal-thread-title" style="width: 100%; background: #fff; border: 1px solid #aaa; padding: 6px 10px; color: black; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="例: レトロハードウェア総合スレ" required>
          <div id="modal-error-message" style="display: none; color: #f87171; font-size: 11px; margin-top: 8px; font-weight: bold;"></div>
        </div>
        <div>
          <label style="display: block; font-size: 12px; color: #000; margin-bottom: 6px; font-weight: bold;">最初の書き込み (本文 - 任意)</label>
          <textarea id="modal-thread-body" style="width: 100%; height: 80px; background: #fff; border: 1px solid #aaa; padding: 6px 10px; color: black; font-size: 13px; outline: none; box-sizing: border-box; resize: none;" placeholder="例: スレ立てました。ゆっくり語りましょう。"></textarea>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button style="background: #e0e0e0; border: 1px solid #777; color: black; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: bold; box-shadow: 1px 1px 0px white inset, -1px -1px 0px #555 inset;" onclick="closeCreateThreadModal()">キャンセル</button>
        <button style="background: #e0e0e0; border: 1px solid #777; color: #800000; padding: 6px 16px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 1px 1px 0px white inset, -1px -1px 0px #555 inset;" onclick="submitNewThread()">スレを立てる</button>
      </div>
    </div>
  </div>

  <script>
    let activeThreadId = null;

    async function getBBSApi() {
      try {
        if (window.parent && window.parent.virtualBBS) {
          return window.parent.virtualBBS;
        }
      } catch (e) {
        console.warn("Parent access blocked or unavailable, falling back to fetch REST API", e);
      }
      return null;
    }

    async function apiFetchThreads() {
      try {
        const parentBBS = await getBBSApi();
        if (parentBBS && parentBBS.fetchThreads) {
          return await parentBBS.fetchThreads();
        }
        const response = await fetch('/api/threads');
        if (!response.ok) throw new Error('REST API status ' + response.status);
        return await response.json();
      } catch (err) {
        console.error("apiFetchThreads error:", err);
        throw err;
      }
    }

    async function apiFetchPosts(threadId) {
      try {
        const parentBBS = await getBBSApi();
        if (parentBBS && parentBBS.fetchPosts) {
          return await parentBBS.fetchPosts(threadId);
        }
        const response = await fetch('/api/threads/' + threadId + '/posts');
        if (!response.ok) throw new Error('REST API status ' + response.status);
        return await response.json();
      } catch (err) {
        console.error("apiFetchPosts error:", err);
        throw err;
      }
    }

    async function apiCreateThreads(title, author) {
      try {
        const parentBBS = await getBBSApi();
        if (parentBBS && parentBBS.createThreads) {
          return await parentBBS.createThreads([{ title, author }]);
        }
        const response = await fetch('/api/threads/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ title, author }] })
        });
        if (!response.ok) throw new Error('REST API status ' + response.status);
        return await response.json();
      } catch (err) {
        console.error("apiCreateThreads error:", err);
        throw err;
      }
    }

    async function apiCreatePosts(threadId, author, content) {
      try {
        const parentBBS = await getBBSApi();
        if (parentBBS && parentBBS.createPosts) {
          return await parentBBS.createPosts([{ threadId, author, content }]);
        }
        const response = await fetch('/api/posts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ threadId, author, content }] })
        });
        if (!response.ok) throw new Error('REST API status ' + response.status);
        return await response.json();
      } catch (err) {
        console.error("apiCreatePosts error:", err);
        throw err;
      }
    }

    async function apiCallAI(prompt) {
      try {
        const parentBBS = await getBBSApi();
        if (parentBBS && parentBBS.callAI) {
          return await parentBBS.callAI({ prompt });
        }
        
        let key = null;
        let endpoint = null;
        let model = null;
        try {
          const savedEnv = localStorage.getItem("shellboards_env");
          if (savedEnv) {
            const parsed = JSON.parse(savedEnv);
            key = parsed.OPENAI_API_KEY;
            endpoint = parsed.OPENAI_BASE_URL;
            model = parsed.OPENAI_MODEL;
          }
        } catch (e) {}

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, key, endpoint, model })
        });
        if (!response.ok) {
          const errText = await response.text();
          let errMsg = errText;
          try {
            const errObj = JSON.parse(errText);
            errMsg = errObj.error || errText;
          } catch(e) {}
          throw new Error(errMsg);
        }
        return await response.json();
      } catch (err) {
        console.error("apiCallAI error:", err);
        throw err;
      }
    }

    function format2chDate(timestampStr) {
      const d = new Date(timestampStr);
      if (isNaN(d.getTime())) return timestampStr;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const day = dayNames[d.getDay()];
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0').substring(0, 2);
      return year + '/' + month + '/' + date + '(' + day + ') ' + hours + ':' + minutes + ':' + seconds + '.' + ms;
    }

    let isFirstThreadsLoad = true;
    let knownThreads = {}; // id -> title
    let lastLoadedThreadId = null;
    let knownPostsCount = 0;

    let autoloadIntervalSec = 5; // デフォルト5秒
    let countdownTimer = null;
    let secondsRemaining = 5;
    let isSoundEnabled = true;

    // Web Audio API for BBS nostalgic sound notifications
    let audioCtx = null;
    function playBeep(type) {
      if (!isSoundEnabled) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        
        if (type === 'post') {
          // 「ピコーン！」サウンド
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc1.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.15);
          
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(600, audioCtx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.12);
          
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc1.start();
          osc2.start();
          osc1.stop(audioCtx.currentTime + 0.25);
          osc2.stop(audioCtx.currentTime + 0.25);
        } else if (type === 'thread') {
          // 「テレレレ♪」（スレ立て検知などのファンファーレ）
          const frequencies = [600, 750, 900, 1200];
          frequencies.forEach((f, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.frequency.setValueAtTime(f, audioCtx.currentTime + index * 0.05);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime + index * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.05 + 0.1);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(audioCtx.currentTime + index * 0.05);
            osc.stop(audioCtx.currentTime + index * 0.05 + 0.11);
          });
        }
      } catch (e) {
        console.warn("Audio Context sound error:", e);
      }
    }

    // Helper to request sound approval or force-start Context on interact
    function ensureAudioContext() {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
    document.addEventListener('click', ensureAudioContext, { once: true });
    document.addEventListener('keydown', ensureAudioContext, { once: true });

    function showToast(title, body, className = "") {
      const container = document.getElementById('notif-toast-container');
      if (!container) return;
      
      const toast = document.createElement('div');
      toast.className = 'notif-toast ' + className;
      
      toast.innerHTML = \`
        <div class="notif-toast-header">
          <span>\${escapeHTML(title)}</span>
          <button class="notif-toast-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        <div class="notif-toast-body">\${escapeHTML(body)}</div>
      \`;
      
      container.appendChild(toast);
      
      // Auto-expire
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'fadeOut 0.4s forwards';
          setTimeout(() => {
            if (toast.parentNode) toast.remove();
          }, 400);
        }
      }, 5000);
    }

    function changeAutoloadInterval() {
      const select = document.getElementById('autoload-interval');
      if (!select) return;
      autoloadIntervalSec = parseInt(select.value);
      resetAutoloadTimer();
    }

    function toggleSound() {
      isSoundEnabled = !isSoundEnabled;
      const soundIcon = document.getElementById('sound-icon');
      const btn = document.getElementById('sound-control-btn');
      if (soundIcon && btn) {
        if (isSoundEnabled) {
          soundIcon.textContent = '🔊';
          btn.classList.add('sound-on');
          playBeep('post');
        } else {
          soundIcon.textContent = '🔇';
          btn.classList.remove('sound-on');
        }
      }
    }

    function resetAutoloadTimer() {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      
      const timerSpan = document.getElementById('autoload-timer');
      if (autoloadIntervalSec === 0) {
        if (timerSpan) timerSpan.textContent = 'オフ';
        return;
      }
      
      secondsRemaining = autoloadIntervalSec;
      updateTimerDisplay();
      
      countdownTimer = setInterval(() => {
        secondsRemaining--;
        if (secondsRemaining <= 0) {
          secondsRemaining = autoloadIntervalSec;
          triggerAutoload();
        }
        updateTimerDisplay();
      }, 1000);
    }

    function updateTimerDisplay() {
      const timerSpan = document.getElementById('autoload-timer');
      if (timerSpan) {
        if (!timerSpan.querySelector('.spinning')) {
          timerSpan.textContent = secondsRemaining + '秒';
        }
      }
    }

    async function triggerAutoload() {
      const timerSpan = document.getElementById('autoload-timer');
      const originalHTML = timerSpan ? timerSpan.innerHTML : '';
      if (timerSpan) {
        timerSpan.innerHTML = '<span class="spinning">🔄</span>';
      }
      
      try {
        await Promise.all([
          loadThreads(),
          loadPosts()
        ]);
      } catch (err) {
        console.error("Autoload error:", err);
      } finally {
        setTimeout(() => {
          if (timerSpan) {
            timerSpan.innerHTML = originalHTML;
          }
          if (autoloadIntervalSec > 0) {
            secondsRemaining = autoloadIntervalSec;
            updateTimerDisplay();
          } else {
            if (timerSpan) timerSpan.textContent = 'オフ';
          }
        }, 500);
      }
    }

    async function manualReloadAll() {
      const timerSpan = document.getElementById('autoload-timer');
      const originalHTML = timerSpan ? timerSpan.innerHTML : '';
      if (timerSpan) {
        timerSpan.innerHTML = '<span class="spinning">🔄</span>';
      }
      
      try {
        await Promise.all([
          loadThreads(),
          loadPosts()
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => {
          if (timerSpan) {
            timerSpan.innerHTML = originalHTML;
          }
          if (autoloadIntervalSec > 0) {
            secondsRemaining = autoloadIntervalSec;
            updateTimerDisplay();
          } else {
            if (timerSpan) timerSpan.textContent = 'オフ';
          }
        }, 500);
      }
    }

    async function loadThreads() {
      try {
        const threads = await apiFetchThreads();
        const container = document.getElementById('thread-list-container');
        if (!container) return;
        
        // Match brand new threads
        const brandNewThreadIds = [];
        if (threads && threads.length > 0) {
          threads.forEach(t => {
            if (!isFirstThreadsLoad && !knownThreads[t.id]) {
              brandNewThreadIds.push(t.id);
            }
          });
        }

        container.innerHTML = '';
        
        if (!threads || threads.length === 0) {
          container.innerHTML = '<div style="padding: 15px; text-align: center; font-size: 11px; color: #666;">スレッドがありません</div>';
          knownThreads = {};
          isFirstThreadsLoad = false;
          return;
        }

        threads.forEach((t, index) => {
          const num = index + 1;
          const li = document.createElement('li');
          li.className = 'thread-item' + (activeThreadId === t.id ? ' active' : '');
          li.onclick = () => selectThread(t.id);
          
          const isNew = brandNewThreadIds.includes(t.id);
          const newTagHtml = isNew ? '<span class="new-thread-tag">NEWスレ!</span>' : '';
          
          li.innerHTML = \`
            <div class="title">\${num}: \${escapeHTML(t.title)}\${newTagHtml} (\${t.postCount || 0})</div>
            <div class="meta">
              <span>立て主: \${escapeHTML(t.author || '名無しさん')}</span>
            </div>
          \`;
          container.appendChild(li);
        });

        // Fire toast + alarm for new thread
        if (brandNewThreadIds.length > 0) {
          brandNewThreadIds.forEach(id => {
            const match = threads.find(t => t.id === id);
            if (match) {
              showToast("🆕 新しいスレが立ちました！", "タイトル: " + match.title + " (立て主: " + (match.author || '名無しさん') + ")", "thread-toast");
            }
          });
          playBeep('thread');
        }

        // Cache threads lookups
        const tempObj = {};
        threads.forEach(t => { tempObj[t.id] = t.title; });
        knownThreads = tempObj;
        isFirstThreadsLoad = false;

      } catch (err) {
        console.error("Error loading threads:", err);
        const container = document.getElementById('thread-list-container');
        if (container) {
          container.innerHTML = '<div style="padding: 15px; color: #800000; font-size: 11px; font-weight: bold; background: rgba(255,0,0,0.05); border-bottom: 1px solid var(--border-color);">⚠️ 読み込みエラー:<br><span style="font-family:monospace; word-break:break-all;">' + escapeHTML(err.message) + '</span></div>';
        }
      }
    }

    function openCreateThreadModal() {
      const errorDiv = document.getElementById('modal-error-message');
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }
      document.getElementById('modal-thread-title').value = '';
      const bodyInput = document.getElementById('modal-thread-body');
      if (bodyInput) bodyInput.value = '';
      document.getElementById('create-thread-modal').style.display = 'flex';
      setTimeout(() => document.getElementById('modal-thread-title').focus(), 80);
    }

    function closeCreateThreadModal() {
      document.getElementById('create-thread-modal').style.display = 'none';
    }

    async function submitNewThread() {
      const input = document.getElementById('modal-thread-title');
      const bodyInput = document.getElementById('modal-thread-body');
      const errorDiv = document.getElementById('modal-error-message');
      const title = input.value.trim();
      const bodyContent = bodyInput ? bodyInput.value.trim() : "";
      
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }

      if (!title) {
        if (errorDiv) {
          errorDiv.textContent = 'スレッドタイトルを入力してください。';
          errorDiv.style.display = 'block';
        }
        return;
      }
      const author = document.getElementById('composer-author').value || '名無しさん';
      
      try {
        const data = await apiCreateThreads(title, author);
        closeCreateThreadModal();
        
        if (data.lastId && bodyContent) {
          await apiCreatePosts(data.lastId, author, bodyContent);
        }

        await loadThreads();
        if (data.lastId) {
          selectThread(data.lastId);
        }
      } catch (err) {
        if (errorDiv) {
          errorDiv.textContent = 'スレッド作成エラー: ' + err.message;
          errorDiv.style.display = 'block';
        }
      }
    }

    async function selectThread(id) {
      activeThreadId = id;
      document.body.classList.add('thread-active'); // Switch viewport view for mobile responsive
      document.getElementById('no-thread-selected').style.display = 'none';
      document.getElementById('thread-view').style.display = 'flex';
      
      // Update sidebar list items visual selection state
      const items = document.querySelectorAll('.thread-item');
      items.forEach(el => el.classList.remove('active'));
      
      // Refresh list to persist matching active selection
      await loadThreads();
      await loadPosts();
    }

    function backToSidebar() {
      document.body.classList.remove('thread-active');
    }

    window.scrollToPost = function(event, num) {
      if (event) event.preventDefault();
      const target = document.getElementById('post-card-' + num);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.transition = 'none';
        target.style.backgroundColor = 'rgba(240, 230, 140, 0.4)';
        setTimeout(() => {
          target.style.transition = 'background-color 0.8s';
          target.style.backgroundColor = '';
        }, 1200);
      }
    };

    window.insertAnchor = function(num) {
      const input = document.getElementById('composer-content');
      if (input) {
        const val = input.value;
        input.value = val + (val && !val.endsWith(' ') ? ' ' : '') + '>>' + num + ' ';
        input.focus();
      }
    };

    async function loadPosts() {
      if (!activeThreadId) return;
      const isThreadChanged = (activeThreadId !== lastLoadedThreadId);

      try {
        const posts = await apiFetchPosts(activeThreadId);
        
        // Sort chronologically ascending
        if (Array.isArray(posts)) {
          posts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }

        const container = document.getElementById('posts-container');
        if (!container) return;

        const originalScrollTop = container.scrollTop;
        const isNearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight < 120);
        const hasExistingPosts = container.querySelector('.post-card') !== null;

        let newPostsCount = 0;
        if (!isThreadChanged && posts && posts.length > knownPostsCount) {
          newPostsCount = posts.length - knownPostsCount;
        }

        if (isThreadChanged || !hasExistingPosts) {
          container.innerHTML = '';
        }
        
        if (!posts || posts.length === 0) {
          if (isThreadChanged || !hasExistingPosts) {
            container.innerHTML = '<div style="color: #666; text-align: center; padding-top: 40px; font-size: 13px;">まだレスがありません。最初のレスを書き込みましょう！</div>';
          }
          lastLoadedThreadId = activeThreadId;
          knownPostsCount = 0;
          return;
        }

        const renderStartIndex = (isThreadChanged || !hasExistingPosts) ? 0 : knownPostsCount;
        const postsToRender = posts.slice(renderStartIndex);

        postsToRender.forEach((p, relativeIdx) => {
          const idx = renderStartIndex + relativeIdx;
          const num = idx + 1;
          const card = document.createElement('div');
          
          // Apply new highlights class
          const isBrandNew = (newPostsCount > 0 && idx >= (posts.length - newPostsCount));
          card.className = 'post-card' + (isBrandNew ? ' new-post-highlight' : '');
          card.id = 'post-card-' + num;
          
          const formattedDate = format2chDate(p.timestamp);
          const escapedContent = escapeHTML(p.content);
          
          // Match >>1 or &gt;&gt;1 and replace with interactive anchor link
          let parsedContent = escapedContent.replace(/&gt;&gt;(\\d+)/g, '<span class="anchor-link" onclick="scrollToPost(event, $1)" title="レス #$1 へスクロール">&gt;&gt;$1</span>');
          
          // Match http/https URLs and replace with clickable links
          const urlRegex = /(https?:\\/\\/[^\\s<"']+)/gi;
          parsedContent = parsedContent.replace(urlRegex, (url) => {
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: var(--link-color); text-decoration: underline; word-break: break-all;">' + url + '</a>';
          });
          
          const authorName = p.author || '名無しさん';
          const userIdStr = p.userId ? ' ID:' + escapeHTML(p.userId) : '';
          
          card.innerHTML = \`
            <div class="post-header">
              <span class="post-number" onclick="insertAnchor(\${num})" title="このレスに返信 (アンカー挿入)">\${num}</span> ：
              <span class="post-author">\${escapeHTML(authorName)}</span> ：
              <span class="post-date">\${formattedDate}</span>
              \${p.userId ? '<span class="post-id" style="font-weight: bold; color: #a52a2a;">' + escapeHTML(userIdStr) + '</span>' : ''}
            </div>
            <div class="post-body">\${parsedContent}</div>
          \`;
          container.appendChild(card);
        });

        // Alarm + Toast for new posts in active thread
        if (newPostsCount > 0) {
          const latest = posts[posts.length - 1];
          const excerpt = latest.content.length > 35 ? latest.content.substring(0, 35) + "..." : latest.content;
          showToast("💬 新着レス (" + newPostsCount + "件)", (latest.author || '名無しさん') + ": " + excerpt);
          playBeep('post');
        }

        // Align scroll offset
        if (isThreadChanged || isNearBottom || newPostsCount > 0) {
          container.scrollTop = container.scrollHeight;
        } else {
          container.scrollTop = originalScrollTop;
        }

        lastLoadedThreadId = activeThreadId;
        knownPostsCount = posts.length;

      } catch (err) {
        console.error("Error loading posts:", err);
        const container = document.getElementById('posts-container');
        if (container) {
          container.innerHTML = \`<div style="color: #800000; text-align: center; padding-top: 40px; font-size: 13px; font-weight: bold;">⚠️ レス取得失敗: \${escapeHTML(err.message)}</div>\`;
        }
      }
    }

    async function submitPost() {
      const input = document.getElementById('composer-content');
      if (!input) return;
      const text = input.value.trim();
      if (!text || !activeThreadId) return;
      
      const author = document.getElementById('composer-author').value || '名無しさん';
      
      try {
        await apiCreatePosts(activeThreadId, author, text);
        input.value = '';
        await loadPosts();
        await loadThreads();
      } catch (err) {
        console.error("Error submitting post:", err);
        alert("書き込みに失敗しました: " + err.message);
      }
    }

    async function askAiToDraft() {
      const textarea = document.getElementById('composer-content');
      const btn = document.getElementById('ai-btn');
      if (!textarea || !btn || !activeThreadId) return;
      
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '✨ AI考察中...';
      
      try {
        const posts = await apiFetchPosts(activeThreadId);
        let historyPrompt = "";
        if (Array.isArray(posts)) {
          historyPrompt = posts.slice(-5).map((p, i) => "Res " + (i+1) + " by " + p.author + ": " + p.content).join("\\n");
        }

        let isJa = true;
        try {
          const parentBBS = await getBBSApi();
          if (parentBBS && parentBBS.getLang) {
            isJa = parentBBS.getLang() === 'ja';
          } else {
            isJa = localStorage.getItem("shellboards_lang") !== 'en';
          }
        } catch (e) {}

        const userText = textarea.value.trim();
        let userInstructionPrompt = "";
        if (userText) {
          userInstructionPrompt = "The user has provided the following guidance or rough draft for their reply:\\n" +
                                  "\\\"" + userText + "\\\"\\n" +
                                  "Please expand, polish, or generate a response that strictly aligns with this guidance.\\n";
        }

        const threadTitle = knownThreads[activeThreadId] || "";
        const langStr = isJa ? "in Japanese" : "in English";
        const promptText = "We are in a forum thread. " + 
                           (threadTitle ? "The thread title is: \\\"" + threadTitle + "\\\".\\n" : "") +
                           "Here is the recent chat history of the thread:\\n" + 
                           historyPrompt + "\\n" +
                           userInstructionPrompt +
                           "\\nPlease write a helpful, witty, or insightful reply (" + langStr + ") fitting the conversation. Output only the content of the reply directly, with no markdown tags or wrapping quotes.";

        const data = await apiCallAI(promptText);
        if (data && data.content) {
          textarea.value = data.content;
          textarea.focus();
        } else {
          showToast("⚠️ AIアシスタント", "下書きの生成に失敗しました。");
        }
      } catch (err) {
        console.error("AI error:", err);
        showToast("⚠️ AIエラー", err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    function escapeHTML(str) {
      if (!str) return '';
      return str.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
      );
    }

    // Initialize
    loadThreads();
    resetAutoloadTimer();
  </script>
</body>
</html>`;
