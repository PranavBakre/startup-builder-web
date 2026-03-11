# Phaser 3 Gotchas

Pitfalls encountered during development and their solutions.

## scrollFactor(0) does not prevent zoom

**Problem**: Setting `setScrollFactor(0)` on a UI element keeps it fixed on screen, but it still gets affected by the main camera's zoom. With a 2x zoom, UI text appears double-sized and blurry.

**Solution**: Use a separate UI camera with default zoom (1x) and scroll (0, 0). The main camera renders the zoomed world; the UI camera renders HUD/dialogue/notebook at native resolution. This is how the dual camera system in `GameScene.ts` works.

## JustDown() is unreliable for discrete key presses

**Problem**: `Phaser.Input.Keyboard.JustDown(key)` depends on precise polling timing in the `update()` loop. If update runs at variable frame rates or if the key press happens between frames, JustDown can miss presses or fire multiple times.

**Solution**: Use event-based input with `keyboard.on('keydown-X', callback)` to set a pending flag, then consume the flag in `update()`. This is the pattern used for C (chat) and E (interact) in GameScene, and for Enter/Space in DialogueSystem.

Note: JustDown is still used in NotebookSystem for Up/Down/N/Esc/Enter because the notebook runs its own update loop with consistent frame-by-frame polling. It works acceptably there but should not be relied on for gameplay-critical input.

## camera.ignore() is required for dual camera setups

**Problem**: When two cameras exist, both render all scene objects by default. UI elements appear on the world camera (zoomed and scrolling) and world objects appear on the UI camera (unzoomed overlay).

**Solution**: During `create()`, collect all UI objects and call `cameras.main.ignore(obj)` for each. Then iterate all scene children and call `uiCamera.ignore(child)` for every non-UI object. See `GameScene.ts:create()` lines 58-72 for the full pattern:

```typescript
const uiObjects = [
  ...this.dialogueSystem.getUIObjects(),
  ...this.notebookSystem.getUIObjects(),
  ...this.hud.getUIObjects(),
  ...this.minimap.getUIObjects(),
];
for (const obj of uiObjects) {
  this.cameras.main.ignore(obj);
}
for (const child of this.children.list) {
  if (!uiObjects.includes(child)) {
    this.uiCamera.ignore(child);
  }
}
```

## Dynamic UI objects created after create() need explicit ignore

**Problem**: Objects created after the initial `create()` camera setup (e.g., notification text, confirmation popups) are not in either camera's ignore list. They render on both cameras -- appearing both as zoomed world-space text and as normal UI text.

**Solution**: Call `this.cameras.main.ignore(obj)` immediately after creating any dynamic UI object. Two examples in the codebase:

1. **Discovery notification** in `GameScene.ts:tryChat()` (line 310):
   ```typescript
   const notif = this.add.text(...).setScrollFactor(0).setDepth(150);
   this.cameras.main.ignore(notif);
   ```

2. **Problem chosen confirmation** in `NotebookSystem.ts:chooseProblem()` (line 167):
   ```typescript
   const confirmText = this.scene.add.text(...).setScrollFactor(0).setDepth(300);
   cam.ignore(confirmText);
   ```

## Container children inherit scrollFactor but zoom still applies

**Problem**: When a container has `setScrollFactor(0)`, its children inherit the scroll behavior and stay fixed on screen. However, the main camera's zoom still affects the container and its children. This makes containers with `scrollFactor(0)` unsuitable for UI on a zoomed camera.

**Solution**: All UI containers (DialogueSystem container, NotebookSystem container, Minimap container) are rendered on the separate unzoomed UI camera. They use `setScrollFactor(0)` for safety, but the real fix is camera separation. The `setScrollFactor(0)` is kept as a defense-in-depth measure.
