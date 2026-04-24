"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostForUser = exports.onPostDeleted = exports.onPostStatusChange = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
admin.initializeApp({
    projectId: "demo-northstar",
});
const db = admin.firestore();
/**
 * Function 1: onPostStatusChange
 * Trigger: Firestore onUpdate — /archive/{postId}
 * Manages Scholar level and post counts when an archive entry status changes.
 */
exports.onPostStatusChange = functions.firestore
    .document("archive/{postId}")
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after)
        return null;
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
        const updates = {
            postCount: firestore_1.FieldValue.increment(1),
            pendingPostId: null,
            approvedPostIds: firestore_1.FieldValue.arrayUnion(postId),
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
exports.onPostDeleted = functions.firestore
    .document("archive/{postId}")
    .onDelete(async (snap, context) => {
    const post = snap.data();
    if (!post)
        return null;
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
    const updatedApprovedIds = approvedPostIds.filter((id) => id !== postId);
    const updates = {
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
exports.getPostForUser = functions.https.onCall(async (data, context) => {
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
    const post = postSnap.data();
    const scholar = scholarSnap.data();
    // 4. Build Base Response (Safe for Level 1)
    const response = {
        id: postSnap.id,
        title: post.title,
        type: post.type,
        publicContent: post.publicContent,
        authorId: post.authorId,
        publishedAt: post.publishedAt,
        wordCount: post.wordCount,
    };
    // 5. Append redactedContent ONLY for Archivists (Level 2+)
    if ((scholar.level || 1) >= 2) {
        response.redactedContent = post.redactedContent;
    }
    return response;
});
//# sourceMappingURL=index.js.map