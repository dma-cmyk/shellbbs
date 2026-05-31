import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  throw new Error(JSON.stringify(errInfo));
}

async function seedDatabaseIfEmpty() {
  try {
    const threadsSnap = await getDocs(collection(db, "threads"));
    if (threadsSnap.empty) {
      console.log("Firestore threads collection is empty. Seeding default data...");
      const defaultThreadDoc = doc(collection(db, "threads"), "1");
      await setDoc(defaultThreadDoc, {
        title: "General Discussion",
        author: "root",
        createdAt: new Date().toISOString()
      });
      console.log("Seeded default thread.");
    }
    const postsSnap = await getDocs(collection(db, "posts"));
    if (postsSnap.empty) {
      console.log("Firestore posts collection is empty. Seeding default data...");
      const defaultPostDoc = doc(collection(db, "posts"), "1");
      await setDoc(defaultPostDoc, {
        threadId: "1",
        author: "root",
        content: "Welcome to the root node. Keep your logs clean and your scripts optimized.",
        timestamp: new Date().toISOString()
      });
      console.log("Seeded default post.");
    }
  } catch (error) {
    console.error("Error seeding Firestore database on startup:", error);
  }
}

const app = express();
app.use(express.json({ limit: "50mb" }));

// Seed database on startup
seedDatabaseIfEmpty().catch(err => {
  console.error("Database seeding failed:", err);
});

  app.get("/api/threads", async (req, res) => {
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
      handleFirestoreError(error, OperationType.GET, "threads");
    }
  });

  app.get("/api/threads/:id/posts", async (req, res) => {
    try {
      const postsSnap = await getDocs(collection(db, "posts"));
      const postsData: Post[] = [];
      postsSnap.forEach(snap => {
        postsData.push({ id: snap.id, ...snap.data() } as Post);
      });
      const filtered = postsData.filter(p => p.threadId === req.params.id);
      res.json(filtered);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `threads/${req.params.id}/posts`);
    }
  });

  app.post("/api/threads/bulk", async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid array" });
    
    let added = 0;
    let lastId = "";
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
      handleFirestoreError(error, OperationType.WRITE, "threads");
    }
  });

  app.post("/api/posts/bulk", async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid array" });
    
    let added = 0;
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
      handleFirestoreError(error, OperationType.WRITE, "posts");
    }
  });

  app.post("/api/ai", async (req, res) => {
    const { endpoint, key, model, prompt } = req.body;

    // Resolve API key
    const hasClientKey = !!key;
    const resolvedKey = key || process.env.OPENAI_API_KEY;

    // Fallback to Gemini if no OpenAI API Key is provided
    if (!resolvedKey) {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return res.status(400).json({ error: "No API Key found. Please set OPENAI_API_KEY or configure GEMINI_API_KEY in server secrets." });
      }

      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt
        });
        return res.json({ content: response.text || "" });
      } catch (error: any) {
        return res.status(500).json({ error: `Gemini API Error: ${error.message}` });
      }
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
          "Authorization": `Bearer ${resolvedKey}`
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
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== "production") {
    createViteServer({
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
