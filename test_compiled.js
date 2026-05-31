
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
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0').substring(0, 2);
      return year + '/' + month + '/' + date + '(' + day + ') ' + hours + ':' + minutes + ':' + seconds + '.' + ms;
    }

    async function loadThreads() {
      try {
        const threads = await apiFetchThreads();
        const container = document.getElementById('thread-list-container');
        if (!container) return;
        container.innerHTML = '';
        
        if (!threads || threads.length === 0) {
          container.innerHTML = '<div style="padding: 15px; text-align: center; font-size: 11px; color: #666;">スレッドがありません</div>';
          return;
        }

        threads.forEach((t, index) => {
          const num = index + 1;
          const li = document.createElement('li');
          li.className = 'thread-item' + (activeThreadId === t.id ? ' active' : '');
          li.onclick = () => selectThread(t.id);
          
          li.innerHTML = `
            <div class="title">${num}: ${escapeHTML(t.title)} (${t.postCount || 0})</div>
            <div class="meta">
              <span>立て主: ${escapeHTML(t.author || '名無しさん')}</span>
            </div>
          `;
          container.appendChild(li);
        });
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
      try {
        const posts = await apiFetchPosts(activeThreadId);
        
        // Sort chronologically ascending
        if (Array.isArray(posts)) {
          posts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }

        const container = document.getElementById('posts-container');
        if (!container) return;
        container.innerHTML = '';
        
        if (!posts || posts.length === 0) {
          container.innerHTML = '<div style="color: #666; text-align: center; padding-top: 40px; font-size: 13px;">まだレスがありません。最初のレスを書き込みましょう！</div>';
          return;
        }

        posts.forEach((p, idx) => {
          const num = idx + 1;
          const card = document.createElement('div');
          card.className = 'post-card';
          card.id = 'post-card-' + num;
          
          const formattedDate = format2chDate(p.timestamp);
          const escapedContent = escapeHTML(p.content);
          
          // Match >>1 or &gt;&gt;1 and replace with interactive anchor link
          let parsedContent = escapedContent.replace(/&gt;&gt;(\d+)/g, '<span class="anchor-link" onclick="scrollToPost(event, $1)" title="レス #$1 へスクロール">&gt;&gt;$1</span>');
          
          // Match http/https URLs and replace with clickable links
          const urlRegex = /(https?:\/\/[^\s<"']+)/gi;
          parsedContent = parsedContent.replace(urlRegex, (url) => {
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: var(--link-color); text-decoration: underline; word-break: break-all;">' + url + '</a>';
          });
          
          const authorName = p.author || '名無しさん';
          const userIdStr = p.userId ? ' ID:' + escapeHTML(p.userId) : '';
          
          card.innerHTML = `
            <div class="post-header">
              <span class="post-number" onclick="insertAnchor(${num})" title="このレスに返信 (アンカー挿入)">${num}</span> ：
              <span class="post-author">${escapeHTML(authorName)}</span> ：
              <span class="post-date">${formattedDate}</span>
              ${p.userId ? '<span class="post-id" style="font-weight: bold; color: #a52a2a;">' + escapeHTML(userIdStr) + '</span>' : ''}
            </div>
            <div class="post-body">${parsedContent}</div>
          `;
          container.appendChild(card);
        });
        
        // Auto-scroll posts
        container.scrollTop = container.scrollHeight;
      } catch (err) {
        console.error("Error loading posts:", err);
        const container = document.getElementById('posts-container');
        if (container) {
          container.innerHTML = `<div style="color: #800000; text-align: center; padding-top: 40px; font-size: 13px; font-weight: bold;">⚠️ レス取得失敗: ${escapeHTML(err.message)}</div>`;
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
      const btn = document.getElementById('ai-btn');
      if (!btn) return;
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '✨ AI考察中...';
      
      try {
        const promptText = `We are in a thread. Build a helpful, professional, and insightfully creative paragraph suggestion as a reply to this context. Output only the content of the suggest reply text directly with no markdown annotations or wrapping quotes.`;
        const data = await apiCallAI(promptText);
        const textarea = document.getElementById('composer-content');
        if (textarea) textarea.value = data.content || '';
      } catch (err) {
        console.error("AI error:", err);
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
    setInterval(loadThreads, 15000); // refresh thread list counts every 15s
  