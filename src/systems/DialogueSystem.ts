import Phaser from 'phaser';

export class DialogueSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private nameText: Phaser.GameObjects.Text;
  private dialogueText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Rectangle;

  private currentDialogue: string[] = [];
  private currentIndex = 0;
  private isActive = false;
  private onCompleteCallback?: () => void;

  private boundAdvance: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const cam = scene.cameras.main;
    const boxWidth = cam.width - 40;
    const boxHeight = 120;
    const boxX = cam.width / 2;
    const boxY = cam.height - boxHeight / 2 - 10;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    this.background = scene.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x1a1a2e, 0.92)
      .setStrokeStyle(2, 0x4a90d9);
    this.container.add(this.background);

    this.nameText = scene.add.text(boxX - boxWidth / 2 + 16, boxY - boxHeight / 2 + 10, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#4a90d9',
      fontStyle: 'bold',
    });
    this.container.add(this.nameText);

    this.dialogueText = scene.add.text(boxX - boxWidth / 2 + 16, boxY - boxHeight / 2 + 32, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      wordWrap: { width: boxWidth - 32 },
    });
    this.container.add(this.dialogueText);

    this.promptText = scene.add.text(boxX + boxWidth / 2 - 16, boxY + boxHeight / 2 - 20, '[Enter / Space]', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(1, 1);
    this.container.add(this.promptText);

    this.container.setVisible(false);

    // Use a bound method for event listeners so we can add/remove cleanly
    this.boundAdvance = this.advance.bind(this);
  }

  startDialogue(npcName: string, dialogue: string[], onComplete?: () => void): void {
    this.currentDialogue = dialogue;
    this.currentIndex = 0;
    this.isActive = true;
    this.onCompleteCallback = onComplete;

    this.nameText.setText(npcName);
    this.dialogueText.setText(dialogue[0]);
    this.container.setVisible(true);
    this.updatePromptText();

    // Register event listeners only while dialogue is active
    this.scene.input.keyboard!.on('keydown-ENTER', this.boundAdvance);
    this.scene.input.keyboard!.on('keydown-SPACE', this.boundAdvance);
  }

  private advance(): void {
    if (!this.isActive) return;

    this.currentIndex++;
    if (this.currentIndex >= this.currentDialogue.length) {
      this.close();
    } else {
      this.dialogueText.setText(this.currentDialogue[this.currentIndex]);
      this.updatePromptText();
    }
  }

  private updatePromptText(): void {
    if (this.currentIndex >= this.currentDialogue.length - 1) {
      this.promptText.setText('[Enter / Space to close]');
    } else {
      this.promptText.setText(`[Enter / Space] (${this.currentIndex + 1}/${this.currentDialogue.length})`);
    }
  }

  update(): void {
    // No longer polling — handled by event listeners
  }

  private close(): void {
    this.isActive = false;
    this.container.setVisible(false);

    // Remove event listeners when dialogue closes
    this.scene.input.keyboard!.off('keydown-ENTER', this.boundAdvance);
    this.scene.input.keyboard!.off('keydown-SPACE', this.boundAdvance);

    this.onCompleteCallback?.();
  }

  getIsActive(): boolean {
    return this.isActive;
  }
}
