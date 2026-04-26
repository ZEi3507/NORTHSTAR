Task: Update Profile Page to display Social Counts.
File to modify: src/pages/Profile.tsx

Instructions:
1. Implement social count logic in Profile.tsx.
2. Use useConnections hook from src/hooks/useSocial.ts.
3. Use useParams from react-router-dom to get target user ID.
4. If ID is present in URL, fetch connections/profile for that ID. Otherwise, use current user ID from store.
5. Calculate:
    - Followers: connection type 'follower' where toId == targetId.
    - Following: connection type 'follower' where fromId == targetId.
    - Partners: connection type 'study_partner' or 'business_partner' where participant includes targetId and status is 'accepted'.
6. Render counts UI below bio.
7. Perform self-review and commit.
