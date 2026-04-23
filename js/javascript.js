document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById("gameBoard");
    const scoreElement = document.getElementById("score");
    const remainingDotsElement = document.getElementById("remainingDots");
    const statusElement = document.getElementById("gameStatus");
    const restartButton = document.getElementById("reiniciarJuego");

    if (!boardElement || !scoreElement || !remainingDotsElement || !statusElement || !restartButton) {
        return;
    }

    const TILE = {
        WALL: 1,
        DOT: 0,
        EMPTY: 2
    };

    const baseMap = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1],
        [1,0,1,1,0,0,1,0,1,1,1,0,1,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,1,1],
        [1,1,0,1,1,0,1,1,1,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1],
        [1,0,1,0,1,0,1,1,1,1,0,1,1,0,1,1],
        [1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1],
        [1,1,0,1,1,0,1,0,1,1,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,1],
        [1,0,1,0,0,0,1,1,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let map = [];
    let player = { row: 1, col: 1 };
    let enemies = [];
    let score = 0;
    let dotsRemaining = 0;
    let gameOver = false;
    let enemyInterval = null;

    function cloneMap() {
        return baseMap.map(row => [...row]);
    }

    function countDots() {
        let total = 0;
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                if (map[row][col] === TILE.DOT) {
                    total++;
                }
            }
        }
        return total;
    }

    function initializeGame() {
        map = cloneMap();
        player = { row: 1, col: 1 };
        enemies = [
            { row: 1, col: 14 },
            { row: 5, col: 14 },
            { row: 11, col: 10 },
            { row: 14, col: 14 }
        ];
        score = 0;
        gameOver = false;
        statusElement.textContent = "En juego";

        if (map[player.row][player.col] === TILE.DOT) {
            map[player.row][player.col] = TILE.EMPTY;
        }

        dotsRemaining = countDots();
        updatePanel();
        renderBoard();
        startEnemyMovement();
    }

    function updatePanel() {
        scoreElement.textContent = score;
        remainingDotsElement.textContent = dotsRemaining;
    }

    function isEnemyAt(row, col) {
        return enemies.some(enemy => enemy.row === row && enemy.col === col);
    }

    function renderBoard() {
        boardElement.innerHTML = "";
        boardElement.style.gridTemplateColumns = `repeat(${map[0].length}, 34px)`;

        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                const cell = document.createElement("div");
                cell.classList.add("game-cell");

                if (map[row][col] === TILE.WALL) {
                    cell.classList.add("wall");
                } else {
                    cell.classList.add("path");
                }

                if (map[row][col] === TILE.DOT) {
                    const dot = document.createElement("span");
                    dot.classList.add("dot");
                    cell.appendChild(dot);
                }

                if (player.row === row && player.col === col) {
                    cell.classList.add("player");
                    const pacImg = document.createElement("img");
                    pacImg.src = "img/pac-man.png";
                    pacImg.alt = "pacman";
                    pacImg.style.width = "28px";
                    pacImg.style.height = "28px";
                    cell.appendChild(pacImg);
                } else if (isEnemyAt(row, col)) {
                    cell.classList.add("enemy");
                    cell.textContent = "👾";
                }

                boardElement.appendChild(cell);
            }
        }
    }

    function canMoveTo(row, col) {
        return map[row] && map[row][col] !== undefined && map[row][col] !== TILE.WALL;
    }

    function collectDot() {
        if (map[player.row][player.col] === TILE.DOT) {
            map[player.row][player.col] = TILE.EMPTY;
            score += 10;
            dotsRemaining--;
            updatePanel();

            if (dotsRemaining === 0) {
                finishGame(true);
            }
        }
    }

    function checkEnemyCollision() {
        if (isEnemyAt(player.row, player.col)) {
            finishGame(false);
            return true;
        }
        return false;
    }

    function finishGame(playerWon) {
        gameOver = true;
        if (enemyInterval) {
            clearInterval(enemyInterval);
        }
        statusElement.textContent = playerWon ? "Ganaste" : "Perdiste";
        renderBoard();
    }

    function movePlayer(direction) {
        if (gameOver) return;

        const moves = {
            ArrowUp: { row: -1, col: 0 },
            ArrowDown: { row: 1, col: 0 },
            ArrowLeft: { row: 0, col: -1 },
            ArrowRight: { row: 0, col: 1 }
        };

        const movement = moves[direction];
        if (!movement) return;

        const nextRow = player.row + movement.row;
        const nextCol = player.col + movement.col;

        if (canMoveTo(nextRow, nextCol)) {
            player.row = nextRow;
            player.col = nextCol;
            collectDot();
            if (!checkEnemyCollision()) {
                renderBoard();
            }
        }
    }

    function getValidMoves(row, col) {
        const candidates = [
            { row: row - 1, col },
            { row: row + 1, col },
            { row, col: col - 1 },
            { row, col: col + 1 }
        ];

        return candidates.filter(position => canMoveTo(position.row, position.col));
    }

    function moveEnemies() {
        if (gameOver) return;

        enemies = enemies.map(enemy => {
            const moves = getValidMoves(enemy.row, enemy.col);
            if (moves.length === 0) {
                return enemy;
            }

            const sortedMoves = moves.sort((a, b) => {
                const distanceA = Math.abs(a.row - player.row) + Math.abs(a.col - player.col);
                const distanceB = Math.abs(b.row - player.row) + Math.abs(b.col - player.col);
                return distanceA - distanceB;
            });

            const useChase = Math.random() < 0.6;
            return useChase
                ? sortedMoves[0]
                : moves[Math.floor(Math.random() * moves.length)];
        });

        if (!checkEnemyCollision()) {
            renderBoard();
        }
    }

    function startEnemyMovement() {
        if (enemyInterval) {
            clearInterval(enemyInterval);
        }
        enemyInterval = setInterval(moveEnemies, 550);
    }

    document.addEventListener("keydown", event => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            movePlayer(event.key);
        }
    });

    restartButton.addEventListener("click", initializeGame);

    initializeGame();
});
