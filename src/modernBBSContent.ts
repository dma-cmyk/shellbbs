export const modernBBSContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Venus Premium BBS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');

    :root {
      --bg-base: #0f172a;
      --bg-sidebar: #1e293b;
      --bg-card: rgba(30, 41, 59, 0.7);
      --bg-card-hover: rgba(51, 65, 85, 0.8);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #8b5cf6;
      --primary-glow: rgba(139, 92, 246, 0.3);
      --secondary: #06b6d4;
      --accent: #ec4899;
      --success: #10b981;
      --font-sans: 'Plus Jakarta Sans', 'Noto Sans JP', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-base);
      color: var(--text-main);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      line-height: 1.5;
    }

    header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-logo .icon {
      font-size: 20px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 8px var(--primary-glow));
    }

    .header-logo h1 {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: linear-gradient(to right, #f8fafc, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .control-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
    }

    select, button, input, textarea {
      font-family: var(--font-sans);
    }

    .modern-select {
      background: var(--bg-sidebar);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .modern-select:focus {
      border-color: var(--primary);
    }

    .btn-icon {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 16px;
      padding: 6px;
      border-radius: 8px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .btn-icon.active {
      color: var(--secondary);
      background: rgba(6, 182, 212, 0.1);
    }

    .main-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .sidebar {
      width: 320px;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .btn-primary {
      width: 100%;
      background: linear-gradient(135deg, var(--primary), #7c3aed);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
      transition: all 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
    }

    .thread-list {
      flex: 1;
      overflow-y: auto;
      list-style: none;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .thread-item {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .thread-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, var(--primary), var(--secondary));
      opacity: 0;
      transition: opacity 0.2s;
    }

    .thread-item:hover {
      background: var(--bg-card-hover);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .thread-item.active {
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.3);
    }

    .thread-item.active::before {
      opacity: 1;
    }

    .thread-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .thread-title-text {
      flex: 1;
      word-break: break-all;
    }

    .post-count-badge {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 20px;
      font-weight: 700;
      transition: all 0.2s;
    }

    .thread-item:hover .post-count-badge {
      background: var(--primary);
      color: white;
    }

    .thread-meta {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .new-thread-tag {
      background: linear-gradient(135deg, var(--accent), #db2777);
      color: white;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      margin-left: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.03), transparent 40%),
                  radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.02), transparent 40%);
    }

    .no-selection {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }

    .no-selection .welcome-icon {
      font-size: 48px;
      margin-bottom: 20px;
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .no-selection h2 {
      font-size: 20px;
      color: var(--text-main);
      margin-bottom: 12px;
      font-weight: 700;
    }

    .no-selection p {
      font-size: 13px;
      max-width: 400px;
      line-height: 1.6;
    }

    .posts-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .post-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 18px;
      max-width: 85%;
      align-self: flex-start;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .post-card.new-post-highlight {
      animation: highlightPulse 2s ease-out;
    }

    @keyframes highlightPulse {
      0% {
        border-color: var(--secondary);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        background: rgba(6, 182, 212, 0.05);
      }
      100% {
        border-color: var(--border-color);
        box-shadow: none;
        background: var(--bg-card);
      }
    }

    .post-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .post-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 11px;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .post-number {
      font-weight: 700;
      color: var(--secondary);
      background: rgba(6, 182, 212, 0.1);
      padding: 2px 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .post-number:hover {
      background: var(--secondary);
      color: #0f172a;
    }

    .post-author {
      font-weight: 600;
      color: var(--text-main);
    }

    .post-id {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }

    .post-body {
      font-size: 13.5px;
      line-height: 1.6;
      color: #e2e8f0;
      word-break: break-all;
      white-space: pre-wrap;
    }

    .anchor-link {
      color: var(--secondary);
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.1s;
    }

    .anchor-link:hover {
      color: var(--primary);
      text-decoration: underline;
    }

    .footer-composer {
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(16px);
      border-top: 1px solid var(--border-color);
      padding: 20px 24px;
    }

    .composer-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-width: 900px;
      margin: 0 auto;
    }

    .composer-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .composer-input-group {
      display: flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 4px 10px;
      flex: 1;
    }

    .composer-input-group label {
      font-size: 11px;
      font-weight: bold;
      color: var(--text-muted);
      margin-right: 6px;
      text-transform: uppercase;
    }

    .composer-input-group input {
      background: none;
      border: none;
      color: var(--text-main);
      font-size: 12.5px;
      width: 100%;
      outline: none;
    }

    .composer-textarea-row {
      position: relative;
    }

    .composer-textarea {
      width: 100%;
      height: 80px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--text-main);
      font-size: 13.5px;
      outline: none;
      resize: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .composer-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
    }

    .composer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 12.5px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-secondary.loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .btn-secondary.loading span {
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .btn-submit-post {
      background: linear-gradient(135deg, var(--secondary), #0891b2);
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12.5px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2);
      transition: all 0.2s;
    }

    .btn-submit-post:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    /* Modal Overlay (Create Thread) */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-card {
      background: var(--bg-sidebar);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .modal-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .modal-field label {
      font-size: 11px;
      font-weight: bold;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .modal-input {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-main);
      font-size: 13px;
      outline: none;
      width: 100%;
    }

    .modal-textarea {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-main);
      font-size: 13px;
      outline: none;
      width: 100%;
      height: 80px;
      resize: none;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .modal-error {
      display: none;
      color: var(--accent);
      font-size: 11px;
      font-weight: bold;
    }

    /* Toast Notification Container */
    #toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 2000;
      max-width: 320px;
    }

    .toast-box {
      background: rgba(30, 41, 59, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-color);
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      color: var(--text-main);
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toast-title {
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 4px;
      color: var(--secondary);
    }

    .toast-body {
      font-size: 11.5px;
      color: var(--text-muted);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes fadeOut {
      to { transform: translateY(10px); opacity: 0; }
    }

    /* Autoload Indicator Animation */
    .autoload-timer-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--border-color);
    }

    .timer-dot {
      width: 6px;
      height: 6px;
      background: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
    }

    .timer-dot.loading {
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(0.8); opacity: 0.4; }
      to { transform: scale(1.2); opacity: 1; }
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.2);
    }

    .back-to-threads-btn {
      display: none;
    }

    @media (max-width: 768px) {
      header {
        padding: 8px 12px;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .header-logo {
        justify-content: center;
      }

      .header-controls {
        gap: 6px;
        width: 100%;
        justify-content: space-between;
        flex-wrap: nowrap;
      }

      .autoload-timer-wrapper {
        font-size: 11px;
        padding: 3px 6px;
        white-space: nowrap;
      }

      .modern-select {
        padding: 4px 8px;
        font-size: 11px;
      }

      .sidebar {
        width: 100% !important;
        border-right: none;
      }

      .content-area {
        width: 100% !important;
      }

      /* モバイルでの表示切り替え */
      body.thread-selected .sidebar {
        display: none !important;
      }

      body.thread-selected .content-area {
        display: flex !important;
      }

      body:not(.thread-selected) .sidebar {
        display: flex !important;
      }

      body:not(.thread-selected) .content-area {
        display: none !important;
      }

      .back-to-threads-btn {
        display: flex !important;
        align-items: center;
        gap: 4px;
      }

      .post-card {
        max-width: 95%;
        padding: 12px;
      }

      .composer-grid {
        gap: 8px;
      }

      .footer-composer {
        padding: 8px 12px !important;
      }

      .composer-grid {
        gap: 6px !important;
      }

      .composer-row {
        flex-direction: row !important;
        gap: 8px !important;
      }

      .composer-input-group {
        max-width: none !important;
        padding: 2px 6px !important;
      }

      .composer-input-group label {
        font-size: 9px !important;
        margin-right: 4px !important;
      }

      .composer-input-group input {
        font-size: 11.5px !important;
      }

      .composer-textarea {
        height: 38px !important;
        padding: 6px 10px !important;
        font-size: 12.5px !important;
        border-radius: 8px !important;
      }

      .composer-actions {
        margin-top: 2px;
      }

      #ai-btn {
        padding: 4px 8px !important;
        font-size: 11px !important;
      }

      #ai-btn span.btn-text {
        font-size: 0;
      }

      #ai-btn span.btn-text::before {
        content: "AI下書き";
        font-size: 11px;
      }

      .btn-submit-post {
        padding: 4px 12px !important;
        font-size: 11px !important;
      }

      .btn-secondary {
        padding: 4px 10px !important;
        font-size: 11px !important;
      }

      /* 投稿ヘッダーのモバイル最適化 */
      .post-header {
        display: grid !important;
        grid-template-columns: auto auto 1fr;
        grid-template-rows: auto auto;
        gap: 4px 8px !important;
        margin-bottom: 8px !important;
        align-items: center;
      }

      .post-avatar {
        grid-column: 1;
        grid-row: 1 / span 2;
        width: 32px !important;
        height: 32px !important;
        font-size: 13px !important;
      }

      .post-number {
        grid-column: 2;
        grid-row: 1;
        font-size: 11px !important;
        padding: 1px 5px !important;
      }

      .post-author {
        grid-column: 3;
        grid-row: 1;
        font-size: 12px !important;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .post-date {
        grid-column: 2 / span 2;
        grid-row: 2;
        font-size: 10.5px !important;
        color: var(--text-muted);
      }

      .post-id {
        display: inline-block;
        margin-left: 6px;
        font-size: 9.5px !important;
      }
    }
  </style>
</head>
<body>

  <header>
    <div class="header-logo">
      <span class="icon">💠</span>
      <h1>Venus Premium BBS</h1>
    </div>
    
    <div class="header-controls">
      <div class="autoload-timer-wrapper">
        <span class="timer-dot" id="timer-pulse"></span>
        <span class="control-item" style="gap: 4px;">
          自動更新: <span id="autoload-timer" style="font-weight: bold; color: var(--text-main);">5秒</span>
        </span>
      </div>

      <div class="control-item">
        <label>間隔:</label>
        <select id="autoload-interval" class="modern-select" onchange="changeAutoloadInterval()">
          <option value="3">3秒</option>
          <option value="5" selected>5秒</option>
          <option value="10">10秒</option>
          <option value="30">30秒</option>
          <option value="0">オフ</option>
        </select>
      </div>

      <button id="sound-control-btn" class="btn-icon active" onclick="toggleSound()" title="音声を切り替え">
        <span id="sound-icon">🔊</span>
      </button>

      <button class="btn-icon" onclick="manualReloadAll()" title="手動でリロード">
        <span>🔄</span>
      </button>
    </div>
  </header>

  <div class="main-container">
    <div class="sidebar" id="sidebar-panel">
      <div class="sidebar-header">
        <button class="btn-primary" onclick="openCreateThreadModal()">
          <span>✨</span> 新規スレッドの作成
        </button>
      </div>
      <ul class="thread-list" id="thread-list-container">
        <!-- Loaded dynamically -->
      </ul>
    </div>

    <div class="content-area">
      <div id="no-thread-selected" class="no-selection">
        <div class="welcome-icon">💠</div>
        <h2>Venus Premium BBS</h2>
        <p>左側のスレッド一覧から読みたいディスカッションを選択するか、新しいスレッドを作成してください。</p>
      </div>

      <div id="thread-view" style="display: none; flex: 1; flex-direction: column; overflow: hidden;">
        <div class="thread-view-header" style="padding: 10px 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; background: rgba(30, 41, 59, 0.4);">
          <button class="btn-secondary back-to-threads-btn" onclick="backToThreadList()" style="padding: 4px 10px; font-size: 11px;">
            <span>⬅</span> 一覧
          </button>
          <span id="active-thread-title" style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; color: var(--secondary);"></span>
        </div>
        <div class="posts-container" id="posts-container">
          <!-- Loaded dynamically -->
        </div>

        <div class="footer-composer">
          <div class="composer-grid">
            <div class="composer-row">
              <div class="composer-input-group">
                <label>名前</label>
                <input type="text" id="composer-author" placeholder="名無しさん" value="名無しさん">
              </div>
              <div class="composer-input-group" style="max-width: 200px;">
                <label>E-mail</label>
                <input type="text" id="composer-email" placeholder="sage" value="sage">
              </div>
            </div>
            
            <div class="composer-textarea-row">
              <textarea id="composer-content" class="composer-textarea" placeholder="ここにメッセージを入力します。Shift+Enterで改行、Enterで書き込みします。" required onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); submitPost(); }"></textarea>
            </div>
            
            <div class="composer-actions">
              <button class="btn-secondary" id="ai-btn" onclick="askAiToDraft()">
                <span>✨</span> <span class="btn-text">AIアシスタントに下書きを任せる</span>
              </button>
              <button class="btn-submit-post" onclick="submitPost()">書き込む</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Thread Modal -->
  <div id="create-thread-modal" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-title">
        <span>🆕</span> 新しいスレッドの作成
      </div>
      <div class="modal-field">
        <label>スレッドタイトル</label>
        <input type="text" id="modal-thread-title" class="modal-input" placeholder="例: モダンUIについて語るスレ" required>
        <div id="modal-error-message" class="modal-error"></div>
      </div>
      <div class="modal-field">
        <label>最初の書き込み (本文 - 任意)</label>
        <textarea id="modal-thread-body" class="modal-textarea" placeholder="例: 新しいモダンUIを作りました！ゆっくり語りましょう。"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" style="padding: 6px 14px;" onclick="closeCreateThreadModal()">キャンセル</button>
        <button class="btn-primary" style="width: auto; padding: 6px 16px; box-shadow: none;" onclick="submitNewThread()">スレを立てる</button>
      </div>
    </div>
  </div>

  <div id="toast-container"></div>

  <script>
    let activeThreadId = null;
    let knownThreads = {};
    let isFirstThreadsLoad = true;
    let knownPostsCount = 0;
    let lastLoadedThreadId = null;
    let isSoundEnabled = true;
    let autoloadIntervalSec = 5;
    let secondsRemaining = 5;
    let countdownTimer = null;

    // Helper for Avatar colors
    function stringToColor(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = Math.abs(hash % 360);
      return 'linear-gradient(135deg, hsl(' + h + ', 70%, 60%), hsl(' + ((h + 60) % 360) + ', 70%, 45%))';
    }

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
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!response.ok) throw new Error('REST API status ' + response.status);
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
      const secs = String(d.getSeconds()).padStart(2, '0');
      return year + '/' + month + '/' + date + '(' + day + ') ' + hours + ':' + minutes + ':' + secs;
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

    function showToast(title, body) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      
      const toast = document.createElement('div');
      toast.className = 'toast-box';
      toast.innerHTML = '<div class="toast-title">' + escapeHTML(title) + '</div><div class="toast-body">' + escapeHTML(body) + '</div>';
      container.appendChild(toast);
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'fadeOut 0.4s forwards';
          setTimeout(() => {
            if (toast.parentNode) toast.remove();
          }, 400);
        }
      }, 5000);
    }

    function playBeep(type) {
      if (!isSoundEnabled) return;
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'thread') {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.2);
        } else {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.1);
        }
      } catch (e) {
        console.warn("Audio Context beep failed", e);
      }
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
      const dot = document.getElementById('timer-pulse');
      
      if (autoloadIntervalSec === 0) {
        if (timerSpan) timerSpan.textContent = 'オフ';
        if (dot) {
          dot.style.backgroundColor = '#94a3b8';
          dot.style.boxShadow = 'none';
          dot.classList.remove('loading');
        }
        return;
      }
      
      if (dot) {
        dot.style.backgroundColor = 'var(--success)';
        dot.style.boxShadow = '0 0 8px var(--success)';
        dot.classList.add('loading');
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
        timerSpan.textContent = secondsRemaining + '秒';
      }
    }

    async function triggerAutoload() {
      const dot = document.getElementById('timer-pulse');
      if (dot) dot.style.backgroundColor = 'var(--secondary)';
      try {
        await Promise.all([
          loadThreads(),
          loadPosts()
        ]);
      } catch (err) {
        console.error("Autoload error:", err);
      } finally {
        setTimeout(() => {
          if (dot) dot.style.backgroundColor = 'var(--success)';
        }, 300);
      }
    }

    async function manualReloadAll() {
      const dot = document.getElementById('timer-pulse');
      if (dot) dot.style.backgroundColor = 'var(--secondary)';
      try {
        await Promise.all([
          loadThreads(),
          loadPosts()
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => {
          if (dot) dot.style.backgroundColor = 'var(--success)';
        }, 300);
      }
    }

    async function loadThreads() {
      try {
        const threads = await apiFetchThreads();
        const container = document.getElementById('thread-list-container');
        if (!container) return;
        
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
          container.innerHTML = '<div style="padding: 20px; text-align: center; font-size: 12px; color: var(--text-muted);">スレッドがありません</div>';
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
          const newTagHtml = isNew ? '<span class="new-thread-tag">NEW!</span>' : '';
          
          li.innerHTML = \`
            <div class="thread-title">
              <span class="thread-title-text">\${num}: \${escapeHTML(t.title)}\${newTagHtml}</span>
              <span class="post-count-badge">\${t.postCount || 0}</span>
            </div>
            <div class="thread-meta">
              <span>立て主: \${escapeHTML(t.author || '名無しさん')}</span>
            </div>
          \`;

          container.appendChild(li);
        });

        if (brandNewThreadIds.length > 0) {
          brandNewThreadIds.forEach(id => {
            const match = threads.find(t => t.id === id);
            if (match) {
              showToast("🆕 新しいスレッドが立ちました！", match.title + " (立て主: " + (match.author || '名無しさん') + ")");
            }
          });
          playBeep('thread');
        }

        const tempObj = {};
        threads.forEach(t => { tempObj[t.id] = t.title; });
        knownThreads = tempObj;
        isFirstThreadsLoad = false;

      } catch (err) {
        console.error("Error loading threads:", err);
        const container = document.getElementById('thread-list-container');
        if (container) {
          container.innerHTML = '<div style="padding: 20px; color: var(--accent); font-size: 12px;">⚠️ 読み込みエラー:<br>' + escapeHTML(err.message) + '</div>';
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
      document.getElementById('no-thread-selected').style.display = 'none';
      document.getElementById('thread-view').style.display = 'flex';
      
      // モバイル用の切り替えクラス
      document.body.classList.add('thread-selected');

      // スレッドタイトルを設定
      const activeTitleSpan = document.getElementById('active-thread-title');
      if (activeTitleSpan && knownThreads[id]) {
        activeTitleSpan.textContent = knownThreads[id];
      } else if (activeTitleSpan) {
        activeTitleSpan.textContent = "スレッド表示中";
      }
      
      const items = document.querySelectorAll('.thread-item');
      items.forEach(el => el.classList.remove('active'));
      
      await loadThreads();
      await loadPosts();
    }

    function backToThreadList() {
      activeThreadId = null;
      document.body.classList.remove('thread-selected');
      document.getElementById('no-thread-selected').style.display = 'flex';
      document.getElementById('thread-view').style.display = 'none';
      loadThreads();
    }

    window.scrollToPost = function(event, num) {
      if (event) event.preventDefault();
      const target = document.getElementById('post-card-' + num);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.transition = 'none';
        target.style.background = 'rgba(139, 92, 246, 0.2)';
        setTimeout(() => {
          target.style.transition = 'background-color 0.8s';
          target.style.background = 'var(--bg-card)';
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
            container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding-top: 40px; font-size: 13.5px;">まだレスがありません。最初のレスを書き込みましょう！</div>';
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
          
          const isBrandNew = (newPostsCount > 0 && idx >= (posts.length - newPostsCount));
          card.className = 'post-card' + (isBrandNew ? ' new-post-highlight' : '');
          card.id = 'post-card-' + num;
          
          const formattedDate = format2chDate(p.timestamp);
          const escapedContent = escapeHTML(p.content);
          
          let parsedContent = escapedContent.replace(/&gt;&gt;(\\d+)/g, '<span class="anchor-link" onclick="scrollToPost(event, $1)" title="レス #$1 へスクロール">&gt;&gt;$1</span>');
          
          const urlRegex = /(https?:\\/\\/[^\\s<"']+)/gi;
          parsedContent = parsedContent.replace(urlRegex, (url) => {
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: var(--secondary); text-decoration: underline; word-break: break-all;">' + url + '</a>';
          });
          
          const authorName = p.author || '名無しさん';
          const avatarColor = stringToColor(authorName);
          const initialLetter = authorName.substring(0, 1);
          
          card.innerHTML = \`
            <div class="post-header">
              <div class="post-avatar" style="background: \${avatarColor}">\${initialLetter}</div>
              <span class="post-number" onclick="insertAnchor(\${num})" title="このレスに返信">\${num}</span>
              <span class="post-author">\${escapeHTML(authorName)}</span>
              <span class="post-date">
                \${formattedDate}
                \${p.userId ? ' <span class="post-id" style="color: var(--secondary); font-size: 10px; margin-left: 6px;">ID:' + escapeHTML(p.userId) + '</span>' : ''}
              </span>
            </div>
            <div class="post-body">\${parsedContent}</div>
          \`;
          container.appendChild(card);
        });

        if (newPostsCount > 0) {
          const latest = posts[posts.length - 1];
          const excerpt = latest.content.length > 35 ? latest.content.substring(0, 35) + "..." : latest.content;
          showToast("💬 新着レス (" + newPostsCount + "件)", (latest.author || '名無しさん') + ": " + excerpt);
          playBeep('post');
        }

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
          container.innerHTML = '<div style="color: var(--accent); text-align: center; padding-top: 40px; font-size: 13.5px; font-weight: bold;">⚠️ レス取得失敗: ' + escapeHTML(err.message) + '</div>';
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
        input.focus();
        await loadPosts();
        
        // Auto scroll to bottom
        const container = document.getElementById('posts-container');
        if (container) container.scrollTop = container.scrollHeight;
      } catch (err) {
        showToast("⚠️ 送信失敗", err.message);
      }
    }

    async function askAiToDraft() {
      const input = document.getElementById('composer-content');
      const btn = document.getElementById('ai-btn');
      if (!input || !btn || !activeThreadId) return;
      
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>🔄</span> 考えています...';
      btn.classList.add('loading');
      
      try {
        // Collect current post history for context
        const posts = await apiFetchPosts(activeThreadId);
        let historyPrompt = "";
        if (Array.isArray(posts)) {
          historyPrompt = posts.slice(-5).map((p, i) => "Res " + (i+1) + " by " + p.author + ": " + p.content).join("\\n");
        }

        const promptText = "We are in a forum thread. Here is the recent chat history of the thread:\\n" + 
                           historyPrompt + 
                           "\\n\\nPlease write a helpful, witty, or insightful reply (in Japanese) fitting the conversation. Output only the content of the reply directly, with no markdown tags or wrapping quotes.";
        
        const res = await apiCallAI(promptText);
        if (res && res.content) {
          input.value = res.content;
          input.focus();
        } else {
          showToast("⚠️ AIアシスタント", "下書きの生成に失敗しました。");
        }
      } catch (err) {
        console.error(err);
        showToast("⚠️ AIエラー", err.message);
      } finally {
        btn.innerHTML = originalHTML;
        btn.classList.remove('loading');
      }
    }

    // Initialize
    loadThreads();
    resetAutoloadTimer();
  </script>
</body>
</html>`;
