class GameOfLife {
    constructor(canvas, px) {
        this.canvas = document.getElementById(canvas);
        this.ctx = this.canvas.getContext('2d');
        this._px = px;
        this.drawState;
        this._fps = 30;
        this._now;
        this._then = Date.now();
        this._interval = 1000 / this._fps;
        this._delta;
        this.init()
        this.addListeners();

    }

    init() {
        this.cells = []
        this.width = Math.floor(this.canvas.width / this._px) - 1;
        this.height = Math.floor(this.canvas.height / this._px) - 1;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.createCells();
    }

    set fps(value) {
        this._fps = value;
        this._interval = 1000 / this._fps;
        if (this.timer) {
            this.stop();
            this.loop();
        }
    }

    get fps() {
        return this._fps;
    }

    set px(value) {
        this._px = value;
        this.stop();
        this.init();
    }

    get px() {
        return this._px;
    }


    createCells() {
        for (let y = 0; y <= this.height; y++) {
            for (let x = 0; x <= this.width; x++) {
                this.cells.push(new Cell(this.ctx, x, y, this._px));
            }
        }

        // set neighbours
        this.cells.forEach(c => {
            let tl = this.getCellAtIndex(mod(c.x - 1, this.width), mod(c.y - 1, this.height));
            let l = this.getCellAtIndex(mod(c.x - 1, this.width), mod(c.y, this.height));
            let bl = this.getCellAtIndex(mod(c.x - 1, this.width), mod(c.y + 1, this.height));
            let t = this.getCellAtIndex(mod(c.x, this.width), mod(c.y - 1, this.height));
            let b = this.getCellAtIndex(mod(c.x, this.width), mod(c.y + 1, this.height));
            let tr = this.getCellAtIndex(mod(c.x + 1, this.width), mod(c.y - 1, this.height));
            let r = this.getCellAtIndex(mod(c.x + 1, this.width), mod(c.y, this.height));
            let br = this.getCellAtIndex(mod(c.x + 1, this.width), mod(c.y + 1, this.height));

            c.neighbours = [tl, l, bl, t, b, tr, r, br];
        })
    }

    getCellAtPixel(x, y) {
        return this.getCellAtIndex(
            Math.floor(x / this.px),
            Math.floor(y / this.px)
        )
    }

    getCellAtIndex(x, y) {
        if (x > this.width) {
            throw 'x > width'
        } else if (y > this.height) {
            throw 'y > height'
        }
        return this.cells[y * (this.width + 1) + x];
    }

    loop() {
        this.timer = window.requestAnimationFrame(() => this.loop());

        this._now = Date.now();
        this._delta = this._now - this._then;

        if (this._delta > this._interval) {
            this._then = this._now - (this._delta % this._interval);
            this.step();
        }
    }

    stop() {
        if (this.timer) {
            window.cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }
    }

    step() {
        let nextState = this.cells.map(cell => cell.calculateState())
        this.cells.forEach((cell, i) => {
            if (cell.state != nextState[i]) {
                cell.state = nextState[i];
            }
        })
    }
    addListeners() {
        canvas.addEventListener('mousedown', e => {
            let x = e.clientX - canvas.offsetLeft;
            let y = e.clientY - canvas.offsetTop;
            let selectedCell = this.getCellAtPixel(x, y);

            selectedCell.state = selectedCell.state == states.ALIVE ? states.DEAD : states.ALIVE;
            this.drawState = selectedCell.state;
        });

        canvas.addEventListener('mousemove', e => {
            if (this.drawState) {
                let x = e.clientX - canvas.offsetLeft;
                let y = e.clientY - canvas.offsetTop;

                let selectedCell = this.getCellAtPixel(x, y);
                selectedCell.state = this.drawState != selectedCell.state ? this.drawState : selectedCell.state;
            }
        });

        canvas.addEventListener('mouseup', e => {
            if (this.drawState) {
                this.drawState = undefined;
            }
        });
    }
}

class Cell {
    constructor(ctx, x, y, px) {
        this.x = x;
        this.y = y;
        this._px = px;
        this.ctx = ctx;
        this.nextState = states.DEAD;
        this.state = states.DEAD;
        this.neighbours = []

        this.ctx.strokeStyle = "gray";
        this.ctx.lineWidth = 1;
        //this.ctx.strokeRect(this.x*this._px, this.y*this._px, this._px, this._px);

    }

    set state(value) {
        if (value != this._state) {
            this._state = value;
            this.draw();
        }
    }

    get state() {
        return this._state;
    }

    calculateState() {
        let alive = 0;
        this.neighbours.forEach(n => {
            if (n.state == states.ALIVE) {
                alive++;
                if (alive > 3) {
                    return;
                }
            }
        })
        if (this.state == states.DEAD) {
            return alive == 3 ? states.ALIVE : states.DEAD;
        } else {
            return alive == 2 || alive == 3 ? states.ALIVE : states.DEAD;
        }
    }

    draw() {
        this.ctx.fillStyle = this.state == states.DEAD ? 'white' : 'blue';
        this.ctx.fillRect(this.x * this._px + 1, this.y * this._px + 1, this._px - 1, this._px - 1);

    }
}

states = {
    DEAD: 1,
    ALIVE: 2
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

