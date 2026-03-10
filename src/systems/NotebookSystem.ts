import Phaser from 'phaser';
import { DiscoveredProblem } from '../data/types';

export class NotebookSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private isOpen = false;
  private problems: DiscoveredProblem[] = [];
  private chosenProblem: DiscoveredProblem | null = null;
  private selectedIndex = 0;

  private titleText!: Phaser.GameObjects.Text;
  private itemTexts: Phaser.GameObjects.Text[] = [];
  private detailText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private chosenText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Rectangle;
  private overlay!: Phaser.GameObjects.Rectangle;

  private nKey: Phaser.Input.Keyboard.Key;
  private escKey: Phaser.Input.Keyboard.Key;
  private upKey: Phaser.Input.Keyboard.Key;
  private downKey: Phaser.Input.Keyboard.Key;
  private enterKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const cam = scene.cameras.main;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(200);

    this.overlay = scene.add.rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.6);
    this.container.add(this.overlay);

    const panelW = 600;
    const panelH = 440;
    const panelX = cam.width / 2;
    const panelY = cam.height / 2;

    this.background = scene.add.rectangle(panelX, panelY, panelW, panelH, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0xdaa520);
    this.container.add(this.background);

    this.titleText = scene.add.text(panelX, panelY - panelH / 2 + 20, 'FOUNDER\'S NOTEBOOK', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#daa520',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.container.add(this.titleText);

    this.chosenText = scene.add.text(panelX, panelY - panelH / 2 + 48, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#2ecc71',
    }).setOrigin(0.5, 0);
    this.container.add(this.chosenText);

    // Problem list on the left
    for (let i = 0; i < 10; i++) {
      const t = scene.add.text(panelX - panelW / 2 + 20, panelY - panelH / 2 + 75 + i * 28, '', {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#cccccc',
      });
      this.itemTexts.push(t);
      this.container.add(t);
    }

    // Detail panel at bottom
    this.detailText = scene.add.text(panelX - panelW / 2 + 20, panelY + panelH / 2 - 110, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
      wordWrap: { width: panelW - 40 },
    });
    this.container.add(this.detailText);

    this.instructionText = scene.add.text(panelX, panelY + panelH / 2 - 20, '[Arrow Keys: Navigate] [Enter: Choose Problem] [N / Esc: Close]', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#666666',
    }).setOrigin(0.5, 1);
    this.container.add(this.instructionText);

    this.container.setVisible(false);

    this.nKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.escKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.upKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.enterKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  addProblem(problem: DiscoveredProblem): void {
    if (this.problems.find(p => p.id === problem.id)) return;
    this.problems.push(problem);
  }

  getDiscoveredCount(): number {
    return this.problems.length;
  }

  getChosenProblem(): DiscoveredProblem | null {
    return this.chosenProblem;
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.nKey)) {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
      return;
    }

    if (!this.isOpen) return;

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.close();
      return;
    }

    if (this.problems.length === 0) return;

    if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.render();
    } else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
      this.selectedIndex = Math.min(this.problems.length - 1, this.selectedIndex + 1);
      this.render();
    } else if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.chooseProblem(this.selectedIndex);
    }
  }

  private open(): void {
    this.isOpen = true;
    this.container.setVisible(true);
    this.render();
  }

  private close(): void {
    this.isOpen = false;
    this.container.setVisible(false);
  }

  private chooseProblem(index: number): void {
    if (index < 0 || index >= this.problems.length) return;
    this.chosenProblem = this.problems[index];
    this.chosenText.setText(`Startup Direction: ${this.chosenProblem.title}`);
    this.render();

    // Flash confirmation
    const cam = this.scene.cameras.main;
    const confirmText = this.scene.add.text(cam.width / 2, cam.height / 2 - 40, `You've chosen: ${this.chosenProblem.title}!`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#2ecc71',
      fontStyle: 'bold',
      backgroundColor: '#1a1a2e',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.scene.tweens.add({
      targets: confirmText,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => confirmText.destroy(),
    });
  }

  private render(): void {
    if (this.chosenProblem) {
      this.chosenText.setText(`Startup Direction: ${this.chosenProblem.title}`);
    } else {
      this.chosenText.setText('No startup direction chosen yet');
    }

    for (let i = 0; i < this.itemTexts.length; i++) {
      if (i < this.problems.length) {
        const p = this.problems[i];
        const prefix = i === this.selectedIndex ? '> ' : '  ';
        const chosen = this.chosenProblem?.id === p.id ? ' [CHOSEN]' : '';
        this.itemTexts[i].setText(`${prefix}${p.title}${chosen}`);
        this.itemTexts[i].setColor(i === this.selectedIndex ? '#ffffff' : '#999999');
      } else {
        this.itemTexts[i].setText('');
      }
    }

    if (this.problems.length > 0 && this.selectedIndex < this.problems.length) {
      const p = this.problems[this.selectedIndex];
      this.detailText.setText(
        `From: ${p.npcName}  |  Location: ${p.location}\n${p.summary}`
      );
    } else {
      this.detailText.setText('Talk to NPCs to discover startup problems!');
    }
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }
}
