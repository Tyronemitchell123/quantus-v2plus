

## Fix /chat Route (WebGL Crash) and Broken Links/Buttons

### Problem
The `/chat` page crashes because the `HolographicAvatar` component uses Three.js (`<Canvas>`), which requires WebGL. When WebGL is unavailable (common in sandboxed iframes, some mobile browsers, or restricted environments), the component throws an unrecoverable error that breaks the entire page.

### Plan

#### 1. Make HolographicAvatar gracefully handle WebGL failure
- Wrap the `<Canvas>` in an error boundary or detect WebGL support before rendering
- Add a **CSS-only fallback avatar** (animated gradient orb with gold glow) when WebGL is unavailable
- This fixes the crash on `/chat` and also protects the `ConciergeWidget` which lazy-loads the same component

**File**: `src/components/HolographicAvatar.tsx`
- Add a `supportsWebGL()` check function
- If WebGL unavailable, render a pure CSS animated avatar (radial gradient sphere with pulse animation)
- Wrap Canvas in a local error boundary as a safety net

#### 2. Audit and fix broken links/buttons across pages
- Review navigation links in Navbar, Sidebar, Footer, and mobile nav for dead routes
- Ensure all buttons with navigation intent actually call `navigate()` or use `<Link>`
- Check mobile components (`MobileAIAssistant`, `MobileMessaging`) where send buttons have no handler

**Files to check/fix**:
- `src/components/mobile/MobileAIAssistant.tsx` — Send button has no `onClick` handler, prompts only set input but don't send
- `src/components/mobile/MobileMessaging.tsx` — Send button has no handler
- `src/components/Footer.tsx` — verify all links resolve to valid routes

### Technical Details
- WebGL detection: `document.createElement('canvas').getContext('webgl')` returns null when unsupported
- CSS fallback avatar uses `radial-gradient` + `@keyframes` pulse for a convincing holographic effect without any GPU dependency
- The fix is non-breaking — when WebGL works, the full 3D avatar still renders

