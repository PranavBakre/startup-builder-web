# Input Map

Complete keyboard input reference for the current build (Phase 1).

## Key Bindings

| Key | Action | Active When | System | Notes |
|-----|--------|------------|--------|-------|
| W / Up Arrow | Move up (north) | No dialogue, no notebook open | MovementSystem | Polled via `isDown`; held key = continuous movement. 150ms tween per tile. |
| A / Left Arrow | Move left (west) | No dialogue, no notebook open | MovementSystem | Same as above. |
| S / Down Arrow | Move down (south) | No dialogue, no notebook open | MovementSystem | Same as above. Down Arrow is also used inside notebook (see below). |
| D / Right Arrow | Move right (east) | No dialogue, no notebook open | MovementSystem | Same as above. |
| C | Chat with adjacent NPC | No dialogue, no notebook open | GameScene (`keydown-C` event) | Sets `chatPending` flag consumed in `update()`. Shows "[C] Chat" indicator when near NPC. |
| N | Toggle notebook | Anytime (except during dialogue) | NotebookSystem | Opens/closes the Founder's Notebook. Uses `JustDown()` polling in notebook update. |
| E | Interact with building door | Standing on a door tile, no dialogue/notebook | GameScene (`keydown-E` event) | Currently shows "Coming in Phase 2" placeholder. Sets `interactPending` flag. |
| Enter | Advance dialogue / Choose problem | During dialogue OR notebook open | DialogueSystem / NotebookSystem | In dialogue: event-based (`keydown-ENTER`), advances to next line or closes. In notebook: `JustDown()` polling, selects highlighted problem as startup direction. |
| Space | Advance dialogue | During dialogue | DialogueSystem | Event-based (`keydown-SPACE`). Same as Enter for dialogue advancement. |
| Esc | Close notebook | Notebook open | NotebookSystem | `JustDown()` polling. Closes the notebook panel. |
| Up Arrow | Navigate notebook list up | Notebook open | NotebookSystem | `JustDown()` polling. Moves selection cursor up in problem list. |
| Down Arrow | Navigate notebook list down | Notebook open | NotebookSystem | `JustDown()` polling. Moves selection cursor down in problem list. |
| Enter (title screen) | Start game | Title screen | TitleScene | One-time `keyboard.once('keydown-ENTER')` event. Fades out and transitions to GameScene. |

## Input Priority

The `update()` loop processes input in this priority order:

1. **Notebook open** -- notebook consumes Up/Down/Enter/N/Esc; all other input blocked
2. **Dialogue active** -- Enter/Space advance dialogue; all other input blocked
3. **Notebook toggle** -- N key checked even when notebook is closed
4. **Chat** -- C key consumed if pending
5. **Interact** -- E key consumed if pending
6. **Movement** -- WASD/arrow keys polled for held state
