import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const threadId = "jddfxg0";

async function postUpdate() {
  const postId = "update-status-" + Date.now().toString(36);
  const postRef = doc(collection(db, "posts"), postId);
  
  const nowISO = new Date().toISOString();
  // 管理者トリップ◆SysAdminTripを付与し、最新のタイムスタンプで配信する
  const updateContent = `<update path="/sys/update_status.json">{
  "lastAppliedTimestamp": "${nowISO}"
}</update>`;

  console.log(`Posting update_status.json distribution to thread with timestamp: ${nowISO}`);
  await setDoc(postRef, {
    threadId: threadId,
    author: "System Admin ◆SysAdminTrip",
    content: updateContent,
    timestamp: nowISO,
    userId: "ID:admin001"
  });
  
  console.log("Post created successfully! Post ID:", postId);
  process.exit(0);
}

postUpdate().catch(err => {
  console.error("Error posting update:", err);
  process.exit(1);
});
