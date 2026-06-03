import express from "express";
import path from "path";
import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc } from "firebase/firestore";
import crypto from "crypto";

interface Thread {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  postCount?: number;
  preview?: string;
}

interface Post {
  id: string;
  threadId: string;
  author: string;
  content: string;
  timestamp: string;
  userId?: string;
}

function parseTripcode(author: string): string {
  if (!author) return "anonymous";
  const index = author.indexOf('#');
  if (index === -1) return author;
  
  const namePart = author.substring(0, index) || "anonymous";
  const key = author.substring(index + 1);
  if (!key) return namePart;
  
  const hash = crypto.createHash('sha256').update(key + "safe_salt_for_trip").digest('base64');
  const cleanTrip = hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  return `${namePart} ◆${cleanTrip}`;
}

function calculateUserId(ipAddress: string): string {
  const todayStr = new Date().toISOString().substring(0, 10);
  const hashInput = `${ipAddress}_${todayStr}_safe_salt_id_2026`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('base64');
  const cleanId = hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  return `ID:${cleanId}`;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

let firebaseConfig: any = {};
try {
  if (process.env.FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  } else {
    firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
  }
} catch (error) {
  console.warn("Warning: Failed to load Firebase config. Using empty config.", error);
}

const firebaseApp = initializeApp(firebaseConfig);
let db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

let isDbCheckInProgress = false;
let isDbCheckDone = false;

async function checkAndFallbackDb() {
  if (isDbCheckDone) return;
  
  // If a custom firestoreDatabaseId is explicitly configured, we should strictly use it
  // and avoid falling back to the default database on temporary connection or loading errors.
  if (firebaseConfig.firestoreDatabaseId) {
    console.log(`Firestore custom database ID [${firebaseConfig.firestoreDatabaseId}] is configured. Strictly using custom database.`);
    isDbCheckDone = true;
    return;
  }

  if (isDbCheckInProgress) return;
  isDbCheckInProgress = true;
  try {
    await getDocs(collection(db, "threads"));
    isDbCheckDone = true;
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    if (
      errMsg.includes("not found") || 
      errMsg.includes("Requested entity was not found") || 
      errMsg.includes("database") || 
      errMsg.includes("Database") ||
      errMsg.includes("NOT_FOUND")
    ) {
      console.warn(`Firestore check failed. Falling back to (default) database. Error: ${errMsg}`);
      try {
        db = getFirestore(firebaseApp);
      } catch (innerErr) {
        console.error("Critical error while resetting to default Firestore db name:", innerErr);
      }
    }
    isDbCheckDone = true;
  } finally {
    isDbCheckInProgress = false;
  }
}

function handleFirestoreError(res: express.Response, error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  res.status(500).json({ error: error instanceof Error ? error.message : String(error), details: errInfo });
}

// Database seeding is disabled to prevent automatic thread creation on startup

const app = express();
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Database seeding disabled

app.get("/api/threads", async (req, res) => {
  await checkAndFallbackDb();
  try {
    const threadsSnap = await getDocs(collection(db, "threads"));
    const threadsData: Thread[] = [];
    threadsSnap.forEach(snap => {
      threadsData.push({ id: snap.id, ...snap.data() } as Thread);
    });

    const postsSnap = await getDocs(collection(db, "posts"));
    const postsData: Post[] = [];
    postsSnap.forEach(snap => {
      postsData.push({ id: snap.id, ...snap.data() } as Post);
    });

    const counts = postsData.reduce((acc, p) => {
      acc[p.threadId] = (acc[p.threadId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const latestPostTime = postsData.reduce((acc, p) => {
      const pTime = new Date(p.timestamp).getTime();
      if (!acc[p.threadId] || pTime > acc[p.threadId]) {
        acc[p.threadId] = pTime;
      }
      return acc;
    }, {} as Record<string, number>);

    const enriched = threadsData.map(t => {
      const lastActiveTime = latestPostTime[t.id] || new Date(t.createdAt).getTime();
      
      // Find all posts of this thread and sort chronologically to find the oldest (first post)
      const threadPosts = postsData
        .filter(p => p.threadId === t.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const preview = threadPosts.length > 0 ? threadPosts[0].content : "";

      return { 
        ...t, 
        postCount: counts[t.id] || 0,
        lastActiveTime,
        preview
      };
    });

    enriched.sort((a, b) => b.lastActiveTime - a.lastActiveTime);

    res.json(enriched);
  } catch (error) {
    handleFirestoreError(res, error, OperationType.GET, "threads");
  }
});

app.get("/api/threads/:id/posts", async (req, res) => {
  await checkAndFallbackDb();
  try {
    const postsSnap = await getDocs(collection(db, "posts"));
    const postsData: Post[] = [];
    postsSnap.forEach(snap => {
      postsData.push({ id: snap.id, ...snap.data() } as Post);
    });
    const filtered = postsData.filter(p => p.threadId === req.params.id);
    res.json(filtered);
  } catch (error) {
    handleFirestoreError(res, error, OperationType.GET, `threads/${req.params.id}/posts`);
  }
});

app.post("/api/threads/bulk", async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid array" });
  
  let added = 0;
  let lastId = "";
  await checkAndFallbackDb();
  try {
    for (const item of items) {
      if (!item.title) continue;
      const newThreadId = Math.random().toString(36).substring(2, 9);
      const threadDocRef = doc(collection(db, "threads"), newThreadId);
      await setDoc(threadDocRef, {
        title: String(item.title).substring(0, 200),
        author: parseTripcode(item.author || "anonymous"),
        createdAt: new Date().toISOString()
      });
      lastId = newThreadId;
      added++;
    }
    res.json({ added, lastId });
  } catch (error) {
    handleFirestoreError(res, error, OperationType.WRITE, "threads");
  }
});

app.post("/api/posts/bulk", async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid array" });
  
  let added = 0;
  await checkAndFallbackDb();
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
    const userId = calculateUserId(clientIp);

    for (const item of items) {
       if (!item.threadId || !item.content) continue;
       const newPostId = Math.random().toString(36).substring(2, 9);
       const postDocRef = doc(collection(db, "posts"), newPostId);
       await setDoc(postDocRef, {
         threadId: String(item.threadId),
         author: parseTripcode(item.author || "anonymous"),
         content: String(item.content).substring(0, 1000),
         timestamp: new Date().toISOString(),
         userId
       });
       added++;
    }
    res.json({ added });
  } catch (error) {
    handleFirestoreError(res, error, OperationType.WRITE, "posts");
  }
});

app.get("/api/github/login", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send("GitHub Client ID is not configured on the server. Please set GITHUB_CLIENT_ID environment variable.");
  }
  
  const host = req.headers.host || "localhost:3100";
  const protocol = req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
  const redirectUri = `${protocol}://${host}/api/github/callback`;
  
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authorizeUrl);
});

app.get("/api/github/callback", async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  if (!code || !clientId || !clientSecret) {
    return res.status(400).send("Missing code, GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET.");
  }
  
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });
    
    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).send(`Failed to fetch access token: ${tokenResponse.statusText}`);
    }
    
    const data = await tokenResponse.json();
    const token = data.access_token;
    
    if (!token) {
      return res.status(400).send(`Failed to parse access token from GitHub response: ${JSON.stringify(data)}`);
    }
    
    res.send(`
      <html>
      <head>
        <title>GitHub Authorization Success</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f1f5f9; }
          .card { text-align: center; background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); max-width: 360px; }
          h3 { color: #34d399; margin-top: 0; font-size: 20px; }
          p { color: #94a3b8; font-size: 14px; margin-bottom: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>🔑 認証に成功しました！</h3>
          <p>トークンが設定されました。このウィンドウは自動的に閉じます。</p>
        </div>
        <script>
          const token = "${token}";
          const configKey = "shellbbs_github_config";
          let config = { token: "", repo: "" };
          try {
            const stored = localStorage.getItem(configKey);
            if (stored) config = JSON.parse(stored);
          } catch (e) {}
          config.token = token;
          localStorage.setItem(configKey, JSON.stringify(config));
          
          if (window.opener) {
            window.opener.postMessage({ type: 'GITHUB_LOGIN_SUCCESS', token: token }, '*');
          }
          setTimeout(() => { window.close(); }, 1500);
        </script>
      </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`OAuth callback failed: ${error.message}`);
  }
});

app.get("/api/proxy", async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }
  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    const text = await response.text();
    res.send(text);
  } catch (error: any) {
    res.status(500).json({ error: `Proxy fetch failed: ${error.message}` });
  }
});

app.post("/api/ai", async (req, res) => {
  const { endpoint, key, model, prompt } = req.body;

  if (!key) {
    return res.status(400).json({ error: "APIキーが設定されていません。「ai config」コマンドからAPIキーを設定してください。" });
  }

  let url = endpoint || "https://api.openai.com/v1/chat/completions";
  if (endpoint && !endpoint.endsWith("/chat/completions")) {
    url = endpoint.endsWith("/") ? `${endpoint}chat/completions` : `${endpoint}/chat/completions`;
  }
  const actualModel = model || "gpt-3.5-turbo";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: actualModel,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = errText;
      try {
         const errObj = JSON.parse(errText);
         errMsg = errObj.error?.message || errText;
      } catch(e) {}
      return res.status(response.status).json({ error: `API Error ${response.status}: ${errMsg}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    res.json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Only start the dev server / static server if we are running locally (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3100;

  if (process.env.NODE_ENV !== "production") {
    import("vite").then(({ createServer }) => {
      createServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
        app.listen(Number(PORT), "0.0.0.0", () => {
          console.log(`Server running on http://localhost:${PORT}`);
        });
      }).catch(err => {
        console.error("Failed to start Vite dev server:", err);
      });
    }).catch(err => {
      console.error("Failed to dynamically import vite:", err);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

export default app;
