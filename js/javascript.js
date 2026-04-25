document.addEventListener("DOMContentLoaded", () => {
    const boardElement= document.getElementById("gameBoard");
    const scoreElement = document.getElementById("score");
    const remainingDotsElement = document.getElementById("remainingDots");
    const statusElement = document.getElementById("gameStatus");
    const restartButton = document.getElementById("reiniciarJuego");
    const inputAlto  = document.getElementById("alto");
    const inputAncho = document.getElementById("ancho");
    const btnGenerar = document.getElementById("btnGenerar");

    if (!boardElement || !scoreElement || !remainingDotsElement ||
        !statusElement || !restartButton || !inputAlto || !inputAncho || !btnGenerar) {
        return;
    }

    class Punto {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    let alto = 0;
    let ancho = 0;
    let map = [];
    let posPersonaje = null;
    let personajeExiste = false;
    let enemies = [];
    let score = 0;
    let dotsRemaining = 0;
    let gameOver = false;
    let gameStarted = false;
    let enemyInterval = null;

    function crearTablero() {
        alto  = Math.max(5, parseInt(inputAlto.value)  || 10);
        ancho = Math.max(5, parseInt(inputAncho.value) || 10);

        if (enemyInterval) clearInterval(enemyInterval);
        personajeExiste = false;
        posPersonaje = null;
        enemies = [];
        score = 0;
        dotsRemaining = 0;
        gameOver = false;
        gameStarted = false;
        statusElement.textContent = "Haz clic en una celda para colocar al jugador";
        scoreElement.textContent  = "0";
        remainingDotsElement.textContent = "0";

        map = [];
        for (let i = 0; i < alto; i++) {
            map[i] = [];
            for (let j = 0; j < ancho; j++) {
                const esBorde = (i === 0 || i === alto - 1 || j === 0 || j === ancho - 1);
                if (esBorde) {
                    map[i][j] = 1;
                } else {
                    map[i][j] = Math.random() < 0.20 ? 1 : 0;
                }
            }
        }

        dotsRemaining = 0;
        for (let i = 0; i < alto; i++)
            for (let j = 0; j < ancho; j++)
                if (map[i][j] === 0) dotsRemaining++;

        actualizarPanel();
        renderBoard();
    }

    function renderBoard() {
        boardElement.innerHTML = "";
        boardElement.style.gridTemplateColumns = `repeat(${ancho}, 34px)`;

        for (let i = 0; i < alto; i++) {
            for (let j = 0; j < ancho; j++) {
                const celda = document.createElement("div");
                celda.classList.add("game-cell");

                if (map[i][j] === 1) {
                    celda.classList.add("wall");
                } else {
                    celda.classList.add("path");

                    if (map[i][j] === 0) {
                        const dot = document.createElement("span");
                        dot.classList.add("dot");
                        celda.appendChild(dot);
                    }

                    if (!personajeExiste && !gameOver) {
                        celda.style.cursor = "pointer";
                        celda.addEventListener("click", () => colocarJugador(i, j));
                    }
                }

                if (posPersonaje && posPersonaje.x === j && posPersonaje.y === i) {
                    celda.classList.add("player");
                    const img = document.createElement("img");
                    img.src = "img/pac-man.png";
                    img.alt = "jugador";
                    img.style.cssText = "width:28px;height:28px;";
                    celda.appendChild(img);
                }

                if (enemies.some(e => e.x === j && e.y === i)) {
                    celda.classList.add("enemy");
                    celda.textContent = "👾";
                }

                boardElement.appendChild(celda);
            }
        }
    }

    function colocarJugador(i, j) {
        if (personajeExiste || map[i][j] === 1 || gameOver) return;

        posPersonaje    = new Punto(j, i);
        personajeExiste = true;

        if (map[i][j] === 0) {
            map[i][j] = 2;
            dotsRemaining--;
        }

        enemies = [];
        const candidatos = [
            { x: 1, y: 1 },
            { x: ancho - 2, y: 1 },
            { x: 1, y: alto - 2 },
            { x: ancho - 2, y: alto - 2 }
        ];
        for (const c of candidatos) {
            if (map[c.y][c.x] !== 1 &&
                !(c.x === posPersonaje.x && c.y === posPersonaje.y)) {
                enemies.push(new Punto(c.x, c.y));
                if (enemies.length === 2) break; // máximo 2 enemigos al inicio
            }
        }

        gameStarted = true;
        gameOver    = false;
        statusElement.textContent = "En juego";
        actualizarPanel();
        renderBoard();
        iniciarEnemigos();
    }

    function actualizarPanel() {
        scoreElement.textContent         = score;
        remainingDotsElement.textContent = dotsRemaining;
    }

    document.addEventListener("keydown", (event) => {
        if (!gameStarted || gameOver || !personajeExiste) return;

        const movimientos = {
            ArrowUp:    { dx: 0,  dy: -1 },
            ArrowDown:  { dx: 0,  dy:  1 },
            ArrowLeft:  { dx: -1, dy:  0 },
            ArrowRight: { dx:  1, dy:  0 }
        };

        const mov = movimientos[event.key];
        if (!mov) return;
        event.preventDefault();

        const nx = posPersonaje.x + mov.dx;
        const ny = posPersonaje.y + mov.dy;

        if (puedeMoverse(ny, nx)) {
            posPersonaje.x = nx;
            posPersonaje.y = ny;
            recogerPunto();
            if (!verificarColision()) renderBoard();
        }
    });

    function puedeMoverse(fila, col) {
        return fila >= 0 && fila < alto && col >= 0 && col < ancho && map[fila][col] !== 1;
    }

    function recogerPunto() {
        const { x, y } = posPersonaje;
        if (map[y][x] === 0) {
            map[y][x] = 2;
            score += 10;
            dotsRemaining--;
            actualizarPanel();
            if (dotsRemaining === 0) terminarJuego(true);
        }
    }

    // ── Enemigos ────────────────────────────────────────────────────────────
    function iniciarEnemigos() {
        if (enemyInterval) clearInterval(enemyInterval);
        enemyInterval = setInterval(moverEnemigos, 600);
    }

    function moverEnemigos() {
        if (gameOver) return;

        enemies = enemies.map(enemy => {
            const vecinos = [
                { x: enemy.x, y: enemy.y - 1 },
                { x: enemy.x, y: enemy.y + 1 },
                { x: enemy.x - 1, y: enemy.y },
                { x: enemy.x + 1, y: enemy.y }
            ].filter(p => puedeMoverse(p.y, p.x));

            if (vecinos.length === 0) return enemy;

            if (Math.random() < 0.6) {
                vecinos.sort((a, b) =>
                    (Math.abs(a.x - posPersonaje.x) + Math.abs(a.y - posPersonaje.y)) -
                    (Math.abs(b.x - posPersonaje.x) + Math.abs(b.y - posPersonaje.y))
                );
                return new Punto(vecinos[0].x, vecinos[0].y);
            }
            return new Punto(...Object.values(vecinos[Math.floor(Math.random() * vecinos.length)]));
        });

        if (!verificarColision()) renderBoard();
    }

    function verificarColision() {
        if (enemies.some(e => e.x === posPersonaje.x && e.y === posPersonaje.y)) {
            terminarJuego(false);
            return true;
        }
        return false;
    }

    function terminarJuego(gano) {
        gameOver = true;
        if (enemyInterval) clearInterval(enemyInterval);
        statusElement.textContent = gano ? "¡Ganaste!" : "¡Perdiste!";
        renderBoard();
    }

    btnGenerar.addEventListener("click", crearTablero);

    restartButton.addEventListener("click", () => {
        if (alto > 0 && ancho > 0) crearTablero();
    });

    crearTablero();
});