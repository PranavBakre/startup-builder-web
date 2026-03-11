import Phaser from 'phaser';

export class HUD {
  private founderText: Phaser.GameObjects.Text;
  private problemCountText: Phaser.GameObjects.Text;
  private hintsText: Phaser.GameObjects.Text;
  private interactionText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, totalProblems: number) {
    const cam = scene.cameras.main;

    // Top-left: Player name
    this.founderText = scene.add.text(12, 10, 'Founder', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#1a1a2e99',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(50);

    // Top-right: Problem count
    this.problemCountText = scene.add.text(cam.width - 12, 10, `Problems: 0/${totalProblems}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#daa520',
      backgroundColor: '#1a1a2e99',
      padding: { x: 8, y: 4 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);

    // Bottom-left: Keyboard hints
    this.hintsText = scene.add.text(12, cam.height - 32, 'WASD: Move | C: Chat | N: Notebook', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#666666',
    }).setScrollFactor(0).setDepth(50);

    // Center bottom area: interaction text
    this.interactionText = scene.add.text(cam.width / 2, cam.height - 150, '', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#daa520',
      backgroundColor: '#1a1a2ecc',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setVisible(false);
  }

  updateProblemCount(discovered: number, total: number): void {
    this.problemCountText.setText(`Problems: ${discovered}/${total}`);
  }

  showInteraction(text: string): void {
    this.interactionText.setText(text).setVisible(true);
  }

  hideInteraction(): void {
    this.interactionText.setVisible(false);
  }

  getUIObjects(): Phaser.GameObjects.GameObject[] {
    return [this.founderText, this.problemCountText, this.hintsText, this.interactionText];
  }

  destroy(): void {
    this.founderText.destroy();
    this.problemCountText.destroy();
    this.hintsText.destroy();
    this.interactionText.destroy();
  }
}
