import { Utils } from './Utils';
import { Wire } from './Wire';
import { ArduinoUno } from './outputs/Arduino';
import { Injector } from '@angular/core';
import { ApiService } from '../api.service';
import { Download, ImageType } from './Download';
import { isNull, isUndefined } from 'util';

declare var window;
declare var $; // For Jquery
export enum ConsoleType { INFO, WARN, ERROR, OUTPUT }

export class Workspace {
  // TODO: Add Comments
  static translateX = 0.0;
  static translateY = 0.0;
  static scale = 1.0;
  static zooomIncrement = 0.01;
  static translateRate = 0.25;
  static moveCanvas = {
    x: 0,
    y: 0,
    start: false
  };
  static copiedItem: any;
  static injector: Injector;
  static simulating = false;
  static zoomIn() {
    Workspace.scale = Math.min(10, Workspace.scale + Workspace.zooomIncrement);
    Workspace.scale = Math.min(10, Workspace.scale + Workspace.zooomIncrement);
    const ele = (window['canvas'].canvas as HTMLElement);
    ele.setAttribute('transform', `scale(
      ${Workspace.scale},
      ${Workspace.scale})
      translate(${Workspace.translateX},
      ${Workspace.translateY})`);
  }

  static zoomOut() {
    Workspace.scale = Math.max(0.1, Workspace.scale - Workspace.zooomIncrement);
    Workspace.scale = Math.max(0.1, Workspace.scale - Workspace.zooomIncrement);
    const ele = (window['canvas'].canvas as HTMLElement);
    ele.setAttribute('transform', `scale(
      ${Workspace.scale},
      ${Workspace.scale})
      translate(${Workspace.translateX},
      ${Workspace.translateY})`);
  }

  static minMax(min: number, max: number, value: number) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  static initalizeGlobalVariables(canvas: any) {
    window['canvas'] = canvas;
    window['test'] = Workspace.zoomIn;
    window['holder'] = document.getElementById('holder').getBoundingClientRect();
    window['holder_svg'] = document.querySelector('#holder > svg');
    window['ArduinoUno_name'] = {};
    // Stores all the Circuit Information
    window['scope'] = {
      wires: []
    };
    for (const key in Utils.components) {
      if (window['scope'][key] === null || window['scope'][key] === undefined) {
        window['scope'][key] = [];
      }
    }
    // True when simulation takes place
    window['isSimulating'] = false;
    // Stores the reference to the selected circuit component
    window['Selected'] = null;
    // True when a component is selected
    window['isSelected'] = false;
    // Intialize a variable for Property Box
    window['property_box'] = {
      x: 0,
      y: 0,
      element: document.getElementById('propertybox'),
      title: document.querySelector('#propertybox .title'),
      body: document.querySelector('#propertybox .body'),
      mousedown: false
    };
  }

  static initProperty(toggle) {
    // Global Function to Show Properties of Circuit Component
    window['showProperty'] = (callback: any) => {
      const data = callback();
      window['property_box'].element.setAttribute('key', data.keyName);
      window['property_box'].title.innerText = data.title;
      window['property_box'].body.innerHTML = '';
      window['property_box'].body.appendChild(data.body);
      toggle(false);
    };
    // Global Function to Hide Properties of Circuit Component
    window['hideProperties'] = () => {
      if (window.Selected && window.Selected.deselect) {
        window.Selected.deselect();
      }
      window['Selected'] = null;
      window['isSelected'] = false;
      window['property_box'].body.innerHTML = '';
      window['property_box'].title.innerText = 'Project Info';
      toggle(true);
    };
  }

  static initializeGlobalFunctions() {
    // Global Function to show Popup Bubble
    window['showBubble'] = (label: string, x: number, y: number) => {
      // id label is empty don't show anything
      if (label === '') { return; }
      const ele = document.getElementById('bubblebox');
      ele.innerText = label;
      ele.style.display = 'block';
      ele.style.top = `${y + 25}px`;
      ele.style.left = `${(x - ele.clientWidth / 2)}px`;
    };
    // Global Function to hide Popub Bubble
    window['hideBubble'] = () => {
      const ele = document.getElementById('bubblebox');
      ele.style.display = 'none';
    };
    // Global Function to show Toast Message
    window['showToast'] = (message: string) => {
      const ele = document.getElementById('ToastMessage');

      ele.style.display = 'block';
      ele.innerText = message;
      ele.style.padding = '15px 25px 15px 25px';
      setTimeout(() => {
        ele.style.display = 'none';
      }, 10000);

    };
    window['printConsole'] = (textmsg: string, type: ConsoleType) => {
      const msg = document.getElementById('msg');
      const container = document.createElement('label');
      container.innerText = textmsg;
      if (type === ConsoleType.ERROR) {
        container.style.color = 'red';
      } else if (type === ConsoleType.WARN) {
        container.style.color = 'yellow';
      } else if (type === ConsoleType.INFO) {
        container.style.color = 'white';
      } else if (type === ConsoleType.OUTPUT) {
        container.style.color = '#03fc6b';
      }
      msg.appendChild(container);
    };
    // window.addEventListener('beforeunload', (event) => {
    //   event.preventDefault();
    //   event.returnValue = 'did you save the stuff?';
    // });

    window['showLoading'] = () => {
      const showloader = document.getElementById('loadanim');
      showloader.style.display = 'flex';
    };

    window['hideLoading'] = () => {
      const hideloader = document.getElementById('loadanim');
      hideloader.style.display = 'none';
    };
  }
  /**
   * Event Listener for mousemove on html body
   * @param event Mouse Event
   */
  static bodyMouseMove(event: MouseEvent) {
    if (Workspace.moveCanvas.start) {
      const dx = (event.clientX - Workspace.moveCanvas.x) * Workspace.translateRate;
      const dy = (event.clientY - Workspace.moveCanvas.y) * Workspace.translateRate;
      const ele = (window['canvas'].canvas as HTMLElement);
      ele.setAttribute('transform', `scale(
        ${Workspace.scale},
        ${Workspace.scale})
        translate(${Workspace.translateX + dx},
        ${Workspace.translateY + dy})`);
    }
    if (window['property_box'].start) {
      const el = window['property_box'].element;
      el.style.left = `${Workspace.minMax(0, window.innerWidth - 220, event.clientX - window['property_box'].x)}px`;
      el.style.top = `${Workspace.minMax(0, window.innerHeight - 50, event.clientY - window['property_box'].y)}px`;
    }
  }
  /**
   * Event Listener for mouseup on html body
   * @param event Mouse Event
   */
  static bodyMouseUp(event: MouseEvent) {
    if (Workspace.moveCanvas.start) {
      const dx = (event.clientX - Workspace.moveCanvas.x) * Workspace.translateRate;
      const dy = (event.clientY - Workspace.moveCanvas.y) * Workspace.translateRate;
      Workspace.translateX += dx;
      Workspace.translateY += dy;
      Workspace.moveCanvas.start = false;
      document.getElementById('holder').classList.remove('grabbing');
    }
    window['property_box'].start = false;
  }

  static mouseDown(event: MouseEvent) {
    Workspace.hideContextMenu();
    if (window['isSelected'] && (window['Selected'] instanceof Wire)) {
      // if selected item is wire and it is not connected then add the point
      if (window.Selected.end == null) {
        const pt = Workspace.svgPoint(event.clientX, event.clientY);
        window.Selected.add(pt.x, pt.y);
        return;
      }
    }
    if ((event.target as HTMLElement).tagName === 'svg') {
      Workspace.moveCanvas = {
        x: event.clientX,
        y: event.clientY,
        start: true
      };
      document.getElementById('holder').classList.add('grabbing');
    }
  }

  static click(event: MouseEvent) {
  }

  static mouseMove(event: MouseEvent) {
    event.preventDefault();
    // if wire is selected then draw temporary lines
    if (window['isSelected'] && (window['Selected'] instanceof Wire)) {
      const pt = Workspace.svgPoint(event.clientX, event.clientY);
      window.Selected.draw(pt.x, pt.y);
    } else {
      // deselect item
      if (window.Selected && window.Selected.deselect) {
        window.Selected.deselect();
      }
    }
    Workspace.updateWires();
  }

  /*
  TODO: Remove if not Required
  static mouseEnter(event: MouseEvent) {

  }
  static mouseLeave(event: MouseEvent) {

  }

  static mouseOver(event: MouseEvent) {

  }

  static mouseOut(event: MouseEvent) {

  }*/

  static mouseUp(event: MouseEvent) {

  }

  static contextMenu(event: MouseEvent) {
    event.preventDefault();
    const element = document.getElementById('contextMenu');
    element.style.display = 'block';
    element.style.left = `${event.clientX}px`;
    element.style.top = `${event.clientY}px`;
    return true;
  }
  static hideContextMenu() {
    const element = document.getElementById('contextMenu');
    element.style.display = 'none';

  }
  static copy(event: ClipboardEvent) {
  }

  static cut(event: ClipboardEvent) {

  }

  static doubleClick(event: MouseEvent) {
    if (window['isSelected'] && (window['Selected'] instanceof Wire) && !window.Selected.isConnected()) {
      return;
    }
    if ((event.target as HTMLElement).tagName !== 'svg') {
      return;
    }
    // deselect item
    window.hideProperties();
  }

  static dragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  static dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  static drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const className = event.dataTransfer.getData('text'); // get the event data
    const pt = Workspace.svgPoint(event.clientX, event.clientY);
    Workspace.addComponent(className, pt.x, pt.y, 0, 0);
  }

  static keyDown(event: KeyboardEvent) {
    // event.preventDefault();
  }
  static keyPress(event: KeyboardEvent) {
    // event.preventDefault();
  }
  static keyUp(event: KeyboardEvent) {
    // event.preventDefault();
    // console.log([event.ctrlKey, event.key]);
    if (event.key === 'Delete') {
      // Backspace or Delete
      Workspace.DeleteComponent();
    }
    if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
      // Copy
      Workspace.copyComponent();
    }
    if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
      // paste
      Workspace.pasteComponent();
    }
    if (event.ctrlKey && (event.key === '+')) {
      // CTRL + +
      Workspace.zoomIn();
    }
    if (event.ctrlKey && (event.key === '-')) {
      // CTRL + -
      Workspace.zoomIn();
    }
    if (event.ctrlKey && (event.key === 'k' || event.key === 'K')) {
      // TODO: Open Code Editor
    }
    if (event.key === 'F5') {
      // TODO: Start Simulation
    }
  }
  static mouseWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      Workspace.zoomIn();
    } else {
      Workspace.zoomOut();
    }
  }
  static paste(event: ClipboardEvent) {

  }

  static addComponent(classString: string, x: number, y: number, offsetX: number, offsetY: number) {
    const myClass = Utils.components[classString].className;
    const obj = new myClass(
      window['canvas'],
      x - offsetX,
      y - offsetY
    );
    window['scope'][classString].push(obj);
  }

  static updateWires() {
    for (const z of window['scope']['wires']) {
      z.update();
    }
  }

  static svgPoint(x, y) {
    const pt = window['holder_svg'].createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(window.canvas.canvas.getScreenCTM().inverse());
  }
  static removeMeta(obj) {
    for (const prop in obj) {
      if (typeof obj[prop] === 'object') {
        obj[prop] = null;
      } else {
        delete obj[prop];
      }
    }
  }

  static SaveCircuit(name: string = '', description: string = '', id: number = null) {
    let toUpdate = false;
    if (isNull(id)) {
      id = Date.now();
    } else {
      toUpdate = true;
    }
    const saveObj = {
      id,
      canvas: {
        x: Workspace.translateX,
        y: Workspace.translateY,
        scale: Workspace.scale
      },
      project: {
        name,
        description,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    };
    for (const key in window.scope) {
      if (window.scope[key] && window.scope[key].length > 0) {
        saveObj[key] = [];
        for (const item of window.scope[key]) {
          if (item.save) {
            saveObj[key].push(item.save());
          }
        }
      }
    }
    Download.ExportImage(ImageType.PNG).then(v => {
      saveObj.project['image'] = v;
      console.log(saveObj);
      if (toUpdate) {
        Workspace.UpdateIDB(saveObj);
      } else {
        Workspace.SaveIDB(saveObj);
      }
    });
  }

  static SaveIDB(mydata, callback: any = null) {
    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    // window.IDBTransaction = window.IDBTransaction ||
    //   window.webkitIDBTransaction || window.msIDBTransaction;
    // window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = () => {
      console.log('error: ');
    };

    request.onsuccess = () => {
      db = request.result;
      db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .add(mydata);
      if (callback) {
        callback(mydata);
      }
      alert('Done Saved');
    };
  }

  static readAll(callback: any = null) {
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = () => {
      console.log('error: ');
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('success: ' + db);
      const objectStore = db.transaction('project').objectStore('project');
      const data = [];
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          data.push(cursor.value);
          cursor.continue();
        } else {
          if (callback) {
            callback(data);
          }
        }
      };
    };
  }

  static DeleteIDB(id, callback: any = null) {
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = (_) => {
      console.log('error: ');
    };

    request.onsuccess = (__) => {
      db = request.result;

      const ok = db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .delete(id);

      ok.onsuccess = (_) => {
        alert('Done Deleting');
        if (callback) {
          callback();
        }
      };

    };
  }
  static UpdateIDB(mydata, callback: any = null) {
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = (_) => {
      console.log('error: ');
    };

    request.onsuccess = (__) => {
      db = request.result;

      const ok = db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .put(mydata);

      ok.onsuccess = (_) => {
        alert('Done Updating');
        if (callback) {
          callback();
        }
      };

    };
  }

  static readIDB(id, callback: any = null) {
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = () => {
      console.log('error: ');
    };

    request.onsuccess = () => {
      db = request.result;

      const transaction = db.transaction(['project']);
      const objectStore = transaction.objectStore('project');
      const ok = objectStore.get(parseInt(id, 10));

      ok.onerror = () => {
        alert('Unable to retrieve daa from database!');
      };

      ok.onsuccess = () => {
        callback(ok.result);
      };

    };
  }

  static Load(data) {
    Workspace.translateX = data.canvas.x;
    Workspace.translateY = data.canvas.y;
    Workspace.scale = data.canvas.scale;
    window.queue = 0;
    const ele = (window['canvas'].canvas as HTMLElement);
    ele.setAttribute('transform', `scale(
      ${Workspace.scale},
      ${Workspace.scale})
      translate(${Workspace.translateX},
      ${Workspace.translateY})`);
    for (const key in data) {
      if (key !== 'id' && key !== 'canvas' && key !== 'project' && key !== 'wires') {
        // console.log(key);
        const components = data[key];
        for (const comp of components) {
          const myClass = Utils.components[key].className;
          const obj = new myClass(
            window['canvas'],
            comp.x,
            comp.y
          );
          window.queue += 1;
          window['scope'][key].push(obj);
          if (obj.load) {
            obj.load(comp);
          }
        }
      }
    }
    const interval = setInterval(() => {
      if (window.queue === 0) {
        clearInterval(interval);
        Workspace.LoadWires(data.wires);
      }
    }, 100);
  }

  static LoadWires(wires: any[]) {
    console.log(wires);
    if (isNull(wires) || isUndefined(wires)) {
      return;
    }
    for (const w of wires) {
      const points = w.points;
      // console.log(points[0]);
      // console.log(points[0][0]);
      // console.log(points[0][1]);
      let start = null;
      let end = null;
      // console.log(w.start.keyName);
      // console.log(window.scope[w.start.keyName]);
      // Use Linear search to find the start circuit node
      for (const st of window.scope[w.start.keyName]) {
        // console.log(st.id,w.start.id);
        if (st.id === w.start.id) {
          start = st.getNode(points[0][0], points[0][1]);
          break;
        }
      }
      // console.log(start);
      // Use Linear Search to find the end circuit node
      for (const en of window.scope[w.end.keyName]) {
        if (en.id === w.end.id) {
          const p = points[points.length - 1];
          end = en.getNode(p[0], p[1]);
          break;
        }
      }
      // console.log([start, end]);
      if (start && end) {
        const tmp = new Wire(window.canvas, start);
        tmp.load(w);
        start.connectedTo = tmp;
        end.connectedTo = tmp;
        tmp.connect(end, true, true);
        window['scope']['wires'].push(tmp);
        tmp.update();
      } else {
        alert('something went wrong');
      }
    }
  }

  static DeleteComponent() {
    if (window['Selected']) {
      if (window['Selected'] instanceof ArduinoUno) {
        const ans = confirm('The Respective code will also be lost!');
        if (!ans) {
          return;
        }
      }
      const uid = window.Selected.id;
      // console.log(window.)
      const items = window.scope[window.Selected.keyName];
      for (let i = 0; i < items.length; ++i) {
        if (items[i].id === uid) {
          window.Selected.remove();
          window.Selected = null;
          window.isSelected = false;
          const k = items.splice(i, 1);
          Workspace.removeMeta(k[0]);
          break;
        }
      }
      window.hideProperties();
    } else {
      window['showToast']('No Element Selected');
    }
  }
  static copyComponent() {
    if (window['Selected']) {
      if (window['Selected'] instanceof Wire) {
        window['showToast']('You Can\'t Copy Wire');
        return;
      }
      Workspace.copiedItem = window.Selected;
    } else {
      Workspace.copiedItem = null;
    }
  }
  static pasteComponent() {
    // console.log(Workspace.copiedItem);
    if (Workspace.copiedItem) {
      const ele = document.getElementById('contextMenu');
      let x = +ele.style.left.replace('px', '');
      let y = +ele.style.top.replace('px', '');
      // console.log([x, y]);
      const key = Workspace.copiedItem.keyName;
      if (x === 0 && y === 0) {
        x = Workspace.copiedItem.x + 100;
        y = Workspace.copiedItem.y + 100;
      }
      const pt = Workspace.svgPoint(x, y);
      // Workspace.addComponent(Workspace.copiedItem, pt.x, pt.y, 0, 0);
      const myClass = Utils.components[key].className;
      const obj = new myClass(window['canvas'], pt.x, pt.y);
      window['scope'][key].push(obj);
      // obj.copy(Workspace.copiedItem)
    }
  }
  static ClearConsole() {
    const clear = document.getElementById('msg');
    clear.innerHTML = '';
  }


  static CompileCode() {
    const toSend = {};
    const nameMap = {};
    const isProgrammable = window.scope.ArduinoUno.length > 0;
    if (!isProgrammable) {
      window.printConsole('No Programmable Device Found', ConsoleType.INFO);
      Workspace.startArduino();
      return;
    }
    for (const arduino of window.scope.ArduinoUno) {
      toSend[arduino.id] = arduino.code;
      nameMap[arduino.id] = arduino;
    }
    // console.log(JSON.stringify(toSend));

    if (Workspace.injector) {
      window.printConsole('Compiling Source Code', ConsoleType.INFO);
      const api = Workspace.injector.get(ApiService);
      api.compileCode(toSend).subscribe(v => {
        // console.log(v)
        //     'state': 'SUCCESS',
        const taskid = v.uuid;
        const temp = setInterval(() => {
          api.getHex(taskid).subscribe(hex => {
            console.log(hex);
            if (hex.state === 'SUCCESS') {
              clearInterval(temp);
              for (const k in hex.details) {
                if (hex.details[k]) {
                  const d = hex.details[k];
                  window.printConsole('For Arduino ' + nameMap[k].name, ConsoleType.INFO);
                  if (d.output) {
                    window.printConsole(d.output, ConsoleType.OUTPUT);
                    nameMap[k].hex = d.data;
                  }
                  if (d.error) {
                    window.printConsole(d.error, ConsoleType.ERROR);
                  }
                }
              }
              Workspace.startArduino();
            } else if (hex.state === 'FAILED') {
              clearInterval(temp);
              window.printConsole('Failed To Compile: Server Error', ConsoleType.ERROR);
            }
          });
        }, 2000);
      });
    } else {
      window.showToast('Something Went Wrong! Please Refresh Browser');
    }
    // Workspace.startArduino();
  }

  static startArduino() {
    Workspace.simulating = true;
    // Assign id
    let gid = 0;
    for (const wire of window.scope.wires) {
      wire.start.gid = gid++;
      wire.end.gid = gid++;
    }
    // Call init simulation
    for (const key in window.scope) {
      if (window.scope[key] && key !== 'ArduinoUno') {
        for (const ele of window.scope[key]) {
          if (ele.initSimulation) {
            ele.initSimulation();
          }
        }
      }
    }

    for (const comp of window.scope.ArduinoUno) {
      // comp.runner.execute();
      // console.log('s')
      comp.initSimulation();
    }
  }

  static stopSimulation() {
    // TODO: Show Loading Animation
    Workspace.simulating = false;
    for (const key in window.scope) {
      if (window.scope[key]) {
        for (const ele of window.scope[key]) {
          if (ele.closeSimulation) {
            ele.closeSimulation();
          }
        }
      }
    }
  }
}
