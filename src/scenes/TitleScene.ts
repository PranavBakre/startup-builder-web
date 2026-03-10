import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(cx, cy - 80, 'STARTUP SIMULATOR', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#daa520',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 35, 'Build your billion-dollar company', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    // Start prompt
    const startText = this.add.text(cx, cy + 40, 'Press ENTER to start', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#4a90d9',
    }).setOrigin(0.5);

    // Blink effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Instructions
    this.add.text(cx, cy + 110, 'WASD / Arrows: Move\nC: Chat with NPCs\nN: Open Notebook\nE: Interact', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#555555',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 190, 'Phase 1: Problem Discovery', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#444444',
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene');
      });
    });
  }
}
