# UX Polish Walkthrough — Blueprint Advisor

## Summary of Accomplishments

### P0 Priority: Essential Polish
1. **OTP Autofocus**: Focus shifts dynamically onto the first input cell in `Login.jsx` upon transitioning to `OTP_SENT`.
2. **Drag & Drop Vault Zone**: Select file buttons in `Documents.jsx` now toggle to `#10b981` (success green) dashed borders and active transparency backgrounds when dragging files over, staging dropped elements instantly.
3. **Metallic Sliding Shimmer**: Swapped basic opacity pulses with a premium sliding `linear-gradient` shimmer (`linear-gradient(90deg, ...)`) animating continuously across cards during data fetch.

### P1 Priority: Typography & Tokens
1. **Cubic-Bezier Timelines**: Status node changes fade and line expansion tracks using a `0.4s cubic-bezier(0.4, 0, 0.2, 1)` transition curve.
2. **Standard Scale Tokens**: Integrated typography and spacing variables (`--space-md`, `--weight-bold`, etc.) within `index.css`.

### P2 Priority: Delight Features
1. **Glassmorphism & Springs**: Backdrop blurs (`blur(12px)`) and scale spring hover curves (`scale(1.02)`) applied on default `.card` styles.
2. **Swipe Sheets**: Swiping down on `ChatBox` header triggers a haptic tick and dismisses the active thread.
3. **Action Vibration**: Success haptic ticks trigger on successful CA booking.
