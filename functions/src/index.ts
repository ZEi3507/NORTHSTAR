import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

admin.initializeApp({
  projectId: "demo-northstar",
});

const db = admin.firestore();

/**
 * Function 1: onPostStatusChange
 * Trigger: Firestore onUpdate — /archive/{postId}
 * Manages Scholar level and post counts when an archive entry status changes.
 */
export const onPostStatusChange = functions.firestore
  .document("archive/{postId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return null;

    const postId = context.params.postId;
    const authorId = after.authorId;
    const authorRef = db.collection("scholars").doc(authorId);

    // APPROVAL PATH — fires when: before.status === 'pending' AND after.status === 'approved'
    if (before.status === "pending" && after.status === "approved") {
      const authorSnap = await authorRef.get();
      if (!authorSnap.exists) {
        console.error(`Scholar ${authorId} not found`);
        return null;
      }
      const authorData = authorSnap.data() || {};

      const updates: any = {
        postCount: FieldValue.increment(1),
        pendingPostId: null,
        approvedPostIds: FieldValue.arrayUnion(postId),
      };

      // Level-up fires only on the first ever approved entry
      if (after.isFirstApprovedPost === true && (authorData.level || 1) < 2) {
        updates.level = 2;
        updates.scholarGrade = "Archivist";
      }

      console.log(`Approving post ${postId} for author ${authorId}. Leveling up if applicable.`);
      return authorRef.update(updates);
    }

    // REJECTION PATH — fires when: before.status === 'pending' AND after.status === 'rejected'
    if (before.status === "pending" && after.status === "rejected") {
      console.log(`Rejecting post ${postId} for author ${authorId}. Clearing pendingPostId.`);
      return authorRef.update({ pendingPostId: null });
    }

    return null;
  });

/**
 * Function 2: onPostDeleted
 * Trigger: Firestore onDelete — /archive/{postId}
 * Manages Scholar level and post counts when an archive entry is deleted.
 */
export const onPostDeleted = functions.firestore
  .document("archive/{postId}")
  .onDelete(async (snap, context) => {
    const post = snap.data();
    if (!post) return null;

    const postId = context.params.postId;
    const authorId = post.authorId;

    // Only approved entries affect Scholar level
    if (post.status !== "approved") {
      console.log(`Deleted post ${postId} was not approved. No level changes.`);
      return null;
    }

    const authorRef = db.collection("scholars").doc(authorId);
    const authorSnap = await authorRef.get();
    if (!authorSnap.exists) {
      console.error(`Scholar ${authorId} not found during post deletion`);
      return null;
    }
    const authorData = authorSnap.data() || {};

    const approvedPostIds = authorData.approvedPostIds || [];
    const updatedApprovedIds = approvedPostIds.filter((id: string) => id !== postId);

    const updates: any = {
      postCount: Math.max(0, (authorData.postCount || 0) - 1),
      approvedPostIds: updatedApprovedIds,
    };

    // Level-down: no approved entries remaining → demote to Initiate
    if (updatedApprovedIds.length === 0) {
      updates.level = 1;
      updates.scholarGrade = "Initiate";
    }

    console.log(`Deleted approved post ${postId} for author ${authorId}. Leveling down if applicable.`);
    return authorRef.update(updates);
  });

/**
 * Function 3: getPostForUser
 * Trigger: HTTPS Callable
 * 
 * Fetches an archive entry and redacts content based on the requesting Scholar's level.
 * SECURITY: This is the ONLY path to retrieve redactedContent.
 */
export const getPostForUser = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const { postId } = data;
  if (!postId) {
    throw new functions.https.HttpsError("invalid-argument", "Post ID is required.");
  }

  // 2. Parallel Fetch of Post and Scholar
  const [postSnap, scholarSnap] = await Promise.all([
    db.collection("archive").doc(postId).get(),
    db.collection("scholars").doc(context.auth.uid).get(),
  ]);

  // 3. Status and Existence Check
  if (!postSnap.exists || postSnap.data()?.status !== "approved") {
    throw new functions.https.HttpsError("not-found", "Entry not found.");
  }

  if (!scholarSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Scholar profile not found.");
  }

  const post = postSnap.data()!;
  const scholar = scholarSnap.data()!;

  // 4. Build Base Response (Safe for Level 1)
  const response: any = {
    id: postSnap.id,
    title: post.title,
    type: post.type,
    publicContent: post.publicContent,
    authorId: post.authorId,
    publishedAt: post.publishedAt,
    wordCount: post.wordCount,
  };

    // Return redactedContent ONLY if scholar is Lvl 2+ OR is the author
    if ((scholar.level || 1) >= 2 || post.authorId === context.auth.uid) {
      response.redactedContent = post.redactedContent;
    }

    return response;
});

/**
 * Function 4: deletePost
 * Trigger: HTTPS Callable
 * 
 * Securely deletes a pending or rejected entry.
 */
export const deletePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const { postId } = data;
  if (!postId) {
    throw new functions.https.HttpsError("invalid-argument", "Post ID is required.");
  }

  const postRef = db.collection("archive").doc(postId);
  const postSnap = await postRef.get();

  if (!postSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Entry not found.");
  }

  const post = postSnap.data()!;

  // Authorization Check
  if (post.authorId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized deletion attempt.");
  }

  // Only non-approved entries can be deleted via this callable
  if (post.status === "approved") {
    throw new functions.https.HttpsError("failed-precondition", "Approved entries cannot be deleted.");
  }

  await postRef.delete();

  // If it was the current pending post, clear the scholar's pointer
  if (post.status === "pending") {
    await db.collection("scholars").doc(context.auth.uid).update({
      pendingPostId: null,
    });
  }

  return { success: true };
});

