// const PARTICLE_COUNT = 200;
// const MAX_SPEED = 0.5;
// const LINE_DISTANCE = 100;
// const GRID_SIZE = LINE_DISTANCE;

// const canvasElement = document.getElementById("canvas");
// const context = canvasElement.getContext("2d");

// let width;
// let height;

// function resize()
// {
//     width = canvasElement.width = window.innerWidth;
//     height = canvasElement.height = window.innerHeight;
// }

// resize();

// window.addEventListener("resize", resize);

// class Particle
// {
//     constructor()
//     {
//         this.x = Math.random() * width;
//         this.y = Math.random() * height;
//         this.z = Math.random() * 10;

//         this.vx = (Math.random() - 0.5) * MAX_SPEED;
//         this.vy = (Math.random() - 0.5) * MAX_SPEED;
//     }

//     update()
//     {
//         this.x += this.vx;
//         this.y += this.vy;

//         if (this.x < 0 || this.x > width) this.vx *= -1;
//         if (this.y < 0 || this.y > height) this.vy *= -1;
//     }

//     draw()
//     {
//         context.beginPath();
//         context.fillStyle = "rgba(255, 255, 255, 1)";
//         context.arc(this.x, this.y, this.z * 0.2, 0, Math.PI * 2);
//         context.fill();
//     }
// }

// // Spatial grid for neighbor search
// class SpatialGrid
// {
//     constructor(cellSize)
//     {
//         this.cellSize = cellSize;
//         this.grid = new Map();
//     }

//     _key(x, y)
//     {
//         return `${x},${y}`;
//     }

//     clear()
//     {
//         this.grid.clear();
//     }

//     add(p)
//     {
//         const gx = Math.floor(p.x / this.cellSize);
//         const gy = Math.floor(p.y / this.cellSize);

//         const key = this._key(gx, gy);

//         if (!this.grid.has(key))
//         {
//             this.grid.set(key, []);
//         }

//         this.grid.get(key).push(p);
//     }
//     neighbors(p)
//     {
//         const gx = Math.floor(p.x / this.cellSize);
//         const gy = Math.floor(p.y / this.cellSize);

//         const neighbors = [];

//         for (let i = gx - 1; i <= gx + 1; i++)
//         {
//             for (let j = gy - 1; j <= gy + 1; j++)
//             {
//                 const cell = this.grid.get(this._key(i, j));

//                 if (cell)
//                 {
//                     neighbors.push(...cell);
//                 }
//             }
//         }

//         return neighbors;
//     }
// }

// const particles = [];

// let lastScrollY = window.scrollY;

// window.addEventListener("scroll", (event) => {
//     const currentScrollY = window.scrollY;
//     const deltaY = currentScrollY - lastScrollY;
//     lastScrollY = currentScrollY;

//     particles.forEach(particle => {
//         particle.y -= deltaY * particle.z * 0.05;
//     });
// });

// for (let i = 0; i < PARTICLE_COUNT; i++)
// {
//     particles.push(new Particle());
// }

// const grid = new SpatialGrid(GRID_SIZE);

// function animate() {
//     context.fillStyle = "rgba(0, 0, 0, 0.4)";
//     context.fillRect(0, 0, width, height);

//     context.fillStyle = "white";
//     context.lineWidth = 0.8;

//     grid.clear();
//     particles.forEach(p => grid.add(p));

//     // Draw lines
//     for (const p of particles)
//     {
//         const neigh = grid.neighbors(p);

//         for (const q of neigh)
//         {
//             if (q === p)
//             {
//                 continue;
//             }

//             const dx = p.x - q.x;
//             const dy = p.y - q.y;

//             const dist2 = dx * dx + dy * dy;

//             if (dist2 < LINE_DISTANCE * LINE_DISTANCE)
//             {
//                 context.beginPath();
//                 context.strokeStyle = `rgba(255, 255, 255, ${1 - (dist2 / (LINE_DISTANCE * LINE_DISTANCE))})`;
//                 context.moveTo(p.x, p.y);
//                 context.lineTo(q.x, q.y);
//                 context.stroke();
//             }
//         }
//     }

//     particles.forEach(p => {
//         p.update();
//         p.draw();
//     });

//     requestAnimationFrame(animate);
// }

// animate();


const canvasElement = document.getElementById("canvas");
const context2D = canvasElement.getContext("2d");

let canvasElementWidth = canvasElement.width = window.innerWidth;
let canvasElementHeight = canvasElement.height = window.innerHeight;

let foregroundColor;
let backgroundColor;

class Effect
{
    constructor(maxParticles)
    {
        this.maxParticles = maxParticles;

        this.maxParticleLength = 1;

        this.particleCurrentPositionX = new Float32Array(maxParticles);
        this.particleCurrentPositionY = new Float32Array(maxParticles);

        this.particlePreviousPositionX = new Float32Array(maxParticles * this.maxParticleLength);
        this.particlePreviousPositionY = new Float32Array(maxParticles * this.maxParticleLength);

        this.particleVelocityX = new Float32Array(maxParticles);
        this.particleVelocityY = new Float32Array(maxParticles);

        this.particleAngle = new Float32Array(maxParticles);

        this.particleLength = new Uint8Array(maxParticles);
        this.particleMaxLength = new Uint8Array(maxParticles);

        this.particleTimer = new Int16Array(maxParticles);

        this.cellSize = 10;
        this.rows = Math.floor(canvasElementHeight / this.cellSize);
        this.columns = Math.floor(canvasElementWidth / this.cellSize);
        this.flowField = new Float32Array(this.rows * this.columns);
        this.zoom = 2;
        this.strength = 60;
    }

    initialize()
    {
        for (let i = 0; i < this.maxParticles; ++i)
        {
            this.particleCurrentPositionX[i] = Math.random() * canvasElementWidth;
            this.particleCurrentPositionY[i] = Math.random() * canvasElementHeight;

            this.particleLength[i] = 0;
            this.particleMaxLength[i] = Math.random() * (this.maxParticleLength - 10) + 10;

            this.particleTimer[i] = Math.random() * 100 + 100;
        }

        this.resize();

        // console.log(this.particlePreviousPositionX.slice());
    }

    resize()
    {
        // const pattern = [
        //     (x, y) => {
        //         return (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.strength;
        //     },
        //     (x, y) => {
        //         const angle = Math.atan2(y - this.rows * 0.5, x - this.columns * 0.5);
        //         const distance = Math.hypot(x - this.columns * 0.5, y - this.rows * 0.5);

        //         return Math.sin(angle * 3 + distance * this.zoom) * this.strength;
        //     },
        //     (x, y) => {
        //         return Math.sin(x * this.zoom) * Math.sin(y * this.zoom) * this.strength;
        //     }][Math.floor(Math.random() * 3)];

        const pattern = (x, y) => {
            const strength = 2;
            const centerX = this.columns * 0.5;
            const centerY = this.rows * 0.5;

            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.hypot(dx, dy);

            const side = (y < centerY ? 1 : -1);

            const angle = Math.atan2(dy, dx) + (Math.PI * 0.75) * side;

            return angle * strength;
        }

        let i = 0;

        for (let y = 0; y < this.rows; ++y)
        {
            for (let x = 0; x < this.columns; ++x)
            {
                this.flowField[i] = pattern(x, y);

                i++;
            }
        }

        this.flowFieldMin = Infinity;
        this.flowFieldMax = -Infinity;

        for (let i = 0; i < this.flowField.length; ++i)
        {
            if (this.flowField[i] >= 0)
            {
                if (this.flowField[i] < this.flowFieldMin)
                {
                    this.flowFieldMin = this.flowField[i];
                }

                if (this.flowField[i] > this.flowFieldMax)
                {
                    this.flowFieldMax = this.flowField[i];
                }
            }
        }
    }

    update()
    {
        for (let i = 0; i < this.maxParticles; ++i)
        {
            const cellX = Math.floor(this.particleCurrentPositionX[i] / this.cellSize);
            const cellY = Math.floor(this.particleCurrentPositionY[i] / this.cellSize);
            const cellIndex = cellY * this.columns + cellX;

            if ((cellIndex < this.flowField.length))
            {
                this.particleAngle[i] = this.flowField[cellIndex];
            }

            this.particleVelocityX[i] += Math.cos(this.particleAngle[i]);
            this.particleVelocityY[i] += Math.sin(this.particleAngle[i]);
            this.particleVelocityX[i] *= 0.7;
            this.particleVelocityY[i] *= 0.7;

            this.particleCurrentPositionX[i] += this.particleVelocityX[i];
            this.particleCurrentPositionY[i] += this.particleVelocityY[i];

            if (this.particleTimer[i] > 0)
            {
                // if (this.particleLength[i] == this.particleMaxLength[i])
                // {
                //     for (let index = i * this.maxParticleLength; index < i * this.maxParticleLength + this.particleLength[i]; ++index)
                //     {
                //         this.particlePreviousPositionX[index] = this.particlePreviousPositionX[index + 1];
                //         this.particlePreviousPositionY[index] = this.particlePreviousPositionY[index + 1];
                //     }

                //     this.particlePreviousPositionX[i * this.maxParticleLength + this.particleLength[i] - 1] = this.particleCurrentPositionX[i];
                //     this.particlePreviousPositionY[i * this.maxParticleLength + this.particleLength[i] - 1] = this.particleCurrentPositionY[i];
                // }
                // else
                // {
                //     this.particlePreviousPositionX[i * this.maxParticleLength + this.particleLength[i]] = this.particleCurrentPositionX[i];
                //     this.particlePreviousPositionY[i * this.maxParticleLength + this.particleLength[i]] = this.particleCurrentPositionY[i];

                //     this.particleLength[i]++;
                // }
            }
            else if (this.particleLength[i] > 1)
            {
                // for (let index = i * this.maxParticleLength; index < i * this.maxParticleLength + this.particleLength[i]; ++index)
                // {
                //     this.particlePreviousPositionX[index] = this.particlePreviousPositionX[index + 1];
                //     this.particlePreviousPositionY[index] = this.particlePreviousPositionY[index + 1];
                // }

                // this.particleLength[i]--;
            }
            else
            {
                this.particleCurrentPositionX[i] = Math.random() * canvasElementWidth;
                this.particleCurrentPositionY[i] = Math.random() * canvasElementHeight;
                this.particleVelocityX[i] = 0;
                this.particleVelocityY[i] = 0;

                this.particleLength[i] = 0;
                this.particleTimer[i] = Math.random() * 100 + 100;
            }

            this.particleTimer[i]--;
        }
    }

    draw()
    {
        // context2D.strokeStyle = "blue";
        // context2D.lineWidth = 1;

        // for (let column = 0; column < this.columns; ++column)
        // {
        //     context2D.beginPath();
        //     context2D.moveTo(this.cellSize * column, 0);
        //     context2D.lineTo(this.cellSize * column, canvasElementHeight);
        //     context2D.stroke();
        // }

        // for (let row = 0; row < this.rows; ++row)
        // {
        //     context2D.beginPath();
        //     context2D.moveTo(0, this.cellSize * row);
        //     context2D.lineTo(canvasElementWidth, this.cellSize * row);
        //     context2D.stroke();
        // }

        // for (let y = 0; y < this.rows; ++y)
        // {
        //     for (let x = 0; x < this.columns; ++x)
        //     {
        //         context2D.fillStyle = `hsl(120, 100%, ${(Math.abs(this.flowField[y * this.columns + x]) - this.flowFieldMin) / (this.flowFieldMax - this.flowFieldMin) * 100}%)`;
        //         context2D.fillRect(x * this.cellSize + 2, y * this.cellSize + 2, this.cellSize - 1, this.cellSize - 1);
        //     }
        // }

        context2D.fillStyle = foregroundColor;
        context2D.strokeStyle = foregroundColor;
        context2D.lineWidth = 0.5;

        for (let i = 0; i < this.maxParticles; ++i)
        {
            context2D.beginPath();
            // context2D.fillStyle = `hwb(198 10% ${(Math.abs(this.flowField[Math.floor(this.particleCurrentPositionX[i] / this.cellSize) * this.columns + Math.floor(this.particleCurrentPositionY[i] / this.cellSize)]) - this.flowFieldMin) / (this.flowFieldMax - this.flowFieldMin) * 80}%)`;
            context2D.arc(this.particleCurrentPositionX[i], this.particleCurrentPositionY[i], 3, 0, Math.PI * 2);
            context2D.fill();
            context2D.closePath();

            // context2D.beginPath();
            // context2D.moveTo(this.particlePreviousPositionX[i * this.maxParticleLength], this.particlePreviousPositionY[i * this.maxParticleLength]);

            // for (let index = i * this.maxParticleLength; index < i * this.maxParticleLength + this.particleLength[i]; ++index)
            // {
            //     const cellX = Math.floor(this.particlePreviousPositionX[i] / this.cellSize);
            //     const cellY = Math.floor(this.particlePreviousPositionY[i] / this.cellSize);
            //     const cellIndex = cellY * this.columns + cellX;

            //     context2D.strokeStyle = `hwb(198 10% ${(Math.abs(this.flowField[cellIndex]) - this.flowFieldMin) / (this.flowFieldMax - this.flowFieldMin) * 80}%)`;
            //     context2D.lineTo(this.particlePreviousPositionX[index], this.particlePreviousPositionY[index]);
            // }

            // context2D.stroke();
            // context2D.closePath();
        }
    }
};

const effect = new Effect(1000);

function resizeCanvasElement()
{
    canvasElementWidth = canvasElement.width = window.innerWidth;
    canvasElementHeight = canvasElement.height = window.innerHeight;

    effect.resize();
}

resizeCanvasElement();

window.addEventListener("resize", resizeCanvasElement);
window.addEventListener("themeChanged", (event) => {
    if (event.detail.theme == "dark")
    {
        foregroundColor = "rgb(0, 120, 200)";
        backgroundColor = "rgba(0, 0, 0, 0.05)";
    }
    else
    {
        foregroundColor = "rgba(0, 120, 200, 0.5)";
        backgroundColor = "rgba(255, 255, 255, 0.05)";
    }
});

effect.initialize();

function animate()
{
    context2D.fillStyle = backgroundColor;
    context2D.fillRect(0, 0, canvasElementWidth, canvasElementHeight);

    effect.update();
    effect.draw();

    requestAnimationFrame(animate);
}

animate();
