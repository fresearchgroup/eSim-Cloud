import { CircuitElement } from '../CircuitElement';
import { Point } from '../Point';

declare var Raphael;

export class Motor extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('Motor', x, y, 'Motor.json', canvas);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}


export class L298N extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('L298N', x, y, 'L298N.json', canvas);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    body.innerText = 'If you Don\'t Connect The ENA and ENB Pins it automatically connects to the 5V suppy';
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor Driver (L298N)'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }
}

export class ServoMotor extends CircuitElement {
  constructor(public canvas: any, x: number, y: number) {
    super('ServoMotor', x, y, 'ServoMotor.json', canvas);
  }
  animate(angle: number) {
    const anim = Raphael.animation({ transform: `r${angle}` }, 2500);
    this.elements[1].animate(anim);
  }
  properties(): { keyName: string; id: number; body: HTMLElement; title: string; } {
    const body = document.createElement('div');
    return {
      keyName: this.keyName,
      id: this.id,
      body,
      title: 'Motor'
    };
  }
  initSimulation(): void {
  }
  closeSimulation(): void {
  }
  simulate(): void {
  }

}
