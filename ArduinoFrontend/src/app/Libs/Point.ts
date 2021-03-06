import { Wire } from './Wire';
import { CircuitElement } from './CircuitElement';
import { isNull } from 'util';

declare var window;

/**
 * Class For Circuit Node ie. Point wires can connect with nodes
 */
export class Point {
  // Hide node on creation
  static defaultAttr: any = {
    fill: 'rgba(0,0,0,0)',
    stroke: 'rgba(0,0,0,0)'
  };
  // Show red color with black stroke on hover
  static nodeAttr: any = {
    fill: 'rgba(255,0,0,1)',
    stroke: 'rgba(0,0,0,1)'
  };
  body: any; // Body of the Circuit Node

  // Stores the reference of wire which is connected to it
  connectedTo: Wire = null;

  // Hover callback called on hover over node
  hoverCallback: any = null;

  // Hover Close Callback called if hover is removed
  hoverCloseCallback: any = null;

  connectCallback: any = null;

  value = -1;
  listener: (val: number, calledby: Point, current: Point) => void = null;
  gid = -1;
  /**
   * Constructor for Circuit Node
   * @param canvas Raphael Canvas / paper
   * @param x x position of node
   * @param y y position of node
   * @param label label to be shown when hover
   * @param half The Half width of Square
   * @param parent parent of the circuit node
   */
  constructor(
    private canvas: any,
    public x: number,
    public y: number,
    public label: string,
    public half: number,
    public parent: CircuitElement
  ) {
    // Create a rectangle of 4x4 and set default color and stroke
    this.body = this.canvas.rect(x, y, 2 * this.half, 2 * this.half);

    this.body.attr(Point.defaultAttr);

    // Set Hover callback
    this.body.hover(() => {
      this.show();
      // Check if callback is present if it is then call it
      if (this.hoverCallback) {
        this.hoverCallback(this.x, this.y);
      }
    }, () => {
      this.hide();
      // Check if close callback is present if present call it
      if (this.hoverCloseCallback) {
        this.hoverCloseCallback(this.x, this.y);
      }
    });

    // Set Mouse over event
    this.body.mouseover((evt: MouseEvent) => {
      this.show();
      window.showBubble(this.label, evt.clientX, evt.clientY);
    });

    // Set mouse out popup
    this.body.mouseout(() => {
      this.hide();
    });
    // TODO: Remove The following code After Development
    // this.body.drag((dx, dy) => {
    //   this.body.attr({
    //     x: this.x + dx,
    //     y: this.y + dy
    //   });
    // }, () => {
    //   this.x = this.body.attr("x");
    //   this.y = this.body.attr("y");
    // }, () => {
    //   this.x = this.body.attr("x");
    //   this.y = this.body.attr("y");
    // });
    // this.body.dblclick(() => {
    //   alert((this.x - this.parent.x) + "," + (this.y - this.parent.y) + "   " + this.label);
    // });
    // return;

    // Set click listener
    this.body.mousedown(() => {
      if (this.connectedTo != null) {
        return;
      }
      if ((window['Selected'] instanceof Wire) && !window.Selected.isConnected()) {
        // if selected item is wire then connect the wire with the node
        // console.log([]);
        if (window.Selected.start === this) { return; }
        this.connectedTo = window.Selected;
        window['Selected'].connect(this, true);
        window.Selected.deselect();
        window['isSelected'] = false; // deselect object
        window['Selected'] = null;
      } else {
        // if nothing is selected create a new wire object
        window.isSelected = true;
        const tmp = new Wire(this.canvas, this);
        this.connectedTo = tmp;
        // select the wire and insert into the scope of circuit
        window.Selected = tmp;
        window['scope']['wires'].push(tmp);
      }
      if (this.connectCallback) {
        this.connectCallback(this);
      }
    });

  }

  /**
   * Set Hover and Hover close Callback
   * @param callback Hover Callback
   * @param closeCallback Hover Close Callback
   */
  setHoverCallback(callback = null, closeCallback = null) {
    this.hoverCallback = callback;
    this.hoverCloseCallback = closeCallback;
  }

  /**
   * Return the center position of the Node
   */
  position() {
    return [this.x + this.half, this.y + this.half];
  }

  /**
   * Change the Position of Node with relative to current position
   * @param dx change in x axis
   * @param dy change in y axis
   */
  relativeMove(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    // update the position
    this.body.attr({
      x: this.x,
      y: this.y
    });
  }

  /**
   * Hide Node
   */
  hide() {
    window.hideBubble();
    this.body.attr(Point.defaultAttr);
  }

  remainHidden() {
    this.body.hide();
  }

  remainShow() {
    this.body.show();
  }

  /**
   * Show Node
   */
  show() {
    if (this.connectedTo) { return; }
    this.body.attr(Point.nodeAttr);
  }

  /**
   * Move Node to x,y
   * @param x new x position of Node
   * @param y new y position of Node
   */
  move(x: number, y: number) {
    this.x = x;
    this.y = y;
    // Update the positon
    this.body.attr({
      x: this.x,
      y: this.y
    });
  }

  /**
   * Remove Node from canvas
   */
  remove() {
    this.body.remove();
    if (this.connectedTo) {
      this.connectedTo.remove();
      this.connectedTo = null;
      this.parent = null;
    }
  }
  addValueListener(listener: (val: number, calledby: Point, parent: Point) => void) {
    this.listener = listener;
  }
  setValue(value: number, calledby: Point) {
    this.value = value;
    if (calledby && this.listener) {
      this.listener(this.value, calledby, this);
    }
    if (isNull(calledby)) {
      calledby = this;
    }
    // console.log(this.connectedTo);
    if (this.connectedTo && this.connectedTo.end) {
      if (this.connectedTo.end.gid !== calledby.gid && this.connectedTo.end.gid !== this.gid) {
        this.connectedTo.end.setValue(this.value, this);
      }
    }
    if (this.connectedTo && this.connectedTo.start) {
      if (this.connectedTo.start.gid !== calledby.gid && this.connectedTo.start.gid !== this.gid) {
        this.connectedTo.start.setValue(this.value, this);
      }
    }
  }
}
