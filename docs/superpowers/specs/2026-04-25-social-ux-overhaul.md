# Design Spec: Messaging Overhaul & Profile UX
**Date**: 2026-04-25
**Status**: Draft

## 1. Overview
This update transforms the Messaging and Profile areas into high-fidelity, living UI spaces.

## 2. Messaging Overhaul (Messenger App Style)
- **Layout**: 2-pane "Master-Detail" layout.
    - **Sidebar**: Scrollable list of active conversations (avatar + display name + last message snippet).
    - **Main Area**: Real-time chat stream with scroll-to-bottom behavior and message input bar.
- **UI/UX**: "Alive" state with typing indicators (simulated) and message timestamps.

## 3. Profile UX Overhaul
- **Hero**: Header with cover-photo area, Avatar, Bio (editable), Username (editable).
- **Body**: 3-column grid/tabs for "Following", "Followers", "Partners".
- **Interaction**: "Edit Bio" mode toggles text fields to input-mode.

## 4. Menu Updates
- Add "Profile" link directly into the `OrbitalMenu` UI.

---

**Does this design plan for the UI/UX overhaul meet your approval?** Once approved, I will present the implementation plan for these specific modules.