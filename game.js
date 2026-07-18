// Game State Initialization
let board = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];
let gameOver = false;
let mode = 'ai'; // ai or multiplr option
let difficulty = 'impossible';
let currentPlayer = 'X'; // Used in multiplr mode
let inputLocked = false;
let computerMoveTimeout = null;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

const modeAiBtn = document.getElementById('mode-ai');
const diffEasyBtn = document.getElementById('diff-easy');
const diffImpossibleBtn = document.getElementById('diff-impossible');
const difficultyBar = document.getElementById('difficulty-bar');
const modeMultiplayerBtn = document.getElementById('mode-multiplayer');

modeAiBtn.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
diffImpossibleBtn.style.background = 'linear-gradient(135deg, #ff4b5c, #ff758c)';

function setMode(newMode) {
    mode = newMode;

    const aiActive = mode === 'ai';
    modeAiBtn.classList.toggle('active', aiActive);
    modeAiBtn.style.background = aiActive ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : '';
    modeAiBtn.blur();

    const multiplayerActive = mode === 'multiplayer';
    modeMultiplayerBtn.classList.toggle('active', multiplayerActive);
    modeMultiplayerBtn.style.background = multiplayerActive ? 'linear-gradient(135deg, #ff9966, #ff5e62)' : '';
    modeMultiplayerBtn.blur();

    if (mode == 'multiplayer') {
        difficultyBar.classList.add('hide-difficulty');
    } else {
        difficultyBar.classList.remove('hide-difficulty');
    }
    resetGame();
}

function setDifficulty(newDifficulty) {
    difficulty = newDifficulty;

    const isEasy = difficulty == 'easy';
    diffEasyBtn.classList.toggle('active', isEasy);
    diffEasyBtn.style.background = isEasy ? 'linear-gradient(135, #11998e, #38ef7d)' : '';
    diffEasyBtn.blur();
    
    const isImpossible = difficulty === 'impossible';
    diffImpossibleBtn.classList.toggle('active', isImpossible);
    diffImpossibleBtn.style.background = isImpossible ? 'linear-gradient(135deg, #ff4b5c, #ff758c)' : '';
    diffImpossibleBtn.blur();

    resetGame();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');
            const value = board[r][c];
            cell.innerText = (value === 'X' || value === 'O') ? value : '';
            if (value === 'X' || value === 'O') {
                cell.setAttribute('data-value', value);
            }
            cell.addEventListener('click', () => handleCellClick(r, c));
            boardElement.appendChild(cell);
        }
    }
}

function makeListOfFreeFields() {
    let freeFields = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] !== 'X' && board[r][c] !== 'O') freeFields.push({ r, c });
            }
        }
    return freeFields;
}

function handleCellClick(row, col) {
    if (gameOver || inputLocked || board[row][col] === 'X' || board[row][col] === 'O') return;
    if (mode === 'ai') {
        handleUserMove(row, col);
    } else {
        handleMultiplayerMove(row, col);
    }
}

function handleUserMove(row, col) {
    board[row][col] = 'O';
    renderBoard();

    if (victoryFor('O')) {
        statusElement.innerText = "🎉 You won!";
        gameOver = true;
        return;
    }
    if (makeListOfFreeFields().length === 0) {
        statusElement.innerText = "🤝 It's a tie!";
        gameOver = true;
        return;
    }
    // Control to computer
    statusElement.innerText = "Computer thinking...";
    inputLocked = true;
    computerMoveTimeout = setTimeout(drawMove, 400);
}

function playerLabel(sign) {
    return sign === 'X' ? 'Player 1' : 'Player 2';
}

function setStatusForPlayer(sign, text) {
    statusElement.innerText = text;
    statusElement.style.setProperty('color', sign === 'X' ? '#ff4b5c' : '#00f2fe', 'important');
}

function handleMultiplayerMove(row, col) {
    board[row][col] = currentPlayer;
    renderBoard();

    if (victoryFor(currentPlayer)) {
        setStatusForPlayer(currentPlayer, `🎉 ${playerLabel(currentPlayer)} wins!`);
        gameOver = true;
        return;
    }
    if (makeListOfFreeFields().length === 0) {
        statusElement.innerText = "🤝 It's a tie!";
        statusElement.style.color = '#00f2fe';
        gameOver = true;
        return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setStatusForPlayer(currentPlayer, `${playerLabel(currentPlayer)}'s turn!`);
}

function victoryFor(sign) {
    // Check rows and columns
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === sign && board[i][1] === sign && board[i][2] === sign) return true;
        if (board[0][i] === sign && board[1][i] === sign && board[2][i] === sign) return true;
    }
    // Check diagonals
    if (board[0][0] === sign && board[1][1] === sign && board[2][2] === sign) return true;
    if (board[0][2] === sign && board[1][1] === sign && board[2][0] === sign) return true;

    return false;
}

function minimax(depth, isMaximizing) {
    if (victoryFor('X')) return 10 - depth;
    if (victoryFor('O')) return depth - 10;

    let freeFields = makeListOfFreeFields();
    if (freeFields.length === 0) return 0;

    if (isMaximizing) {
        let best = -1000;

        for (let field of freeFields) {
            let backup = board[field.r][field.c];
            board[field.r][field.c] = 'X';
            best = Math.max(best, minimax(depth + 1, false));
            board[field.r][field.c] = backup;
        }
        return best;
    } else {
        let best = 1000;
        for (let field of freeFields) {
            let backup = board[field.r][field.c];
            board[field.r][field.c] = 'O';
            best = Math.min(best, minimax(depth + 1, true));
            board[field.r][field.c] = backup;
        }
        return best;
    }
}

function drawMove() {
    let freeFields = makeListOfFreeFields();
    if (freeFields.length === 0 || gameOver) {
        inputLocked = false;
        return;
    }

    let chosenMove = { r: -1, c: -1 };

    if (difficulty === 'easy' && Math.random() < 0.90) {
        let randomIndex = Math.floor(Math.random() * freeFields.length);
        chosenMove = freeFields[randomIndex]
    }

    else {
        let bestVal = -1000;
        for (let field of freeFields) {
            let backup = board[field.r][field.c];
            board[field.r][field.c] = 'X';

            let moveVal = minimax(0, false);

            board[field.r][field.c] = backup;

            if (moveVal > bestVal) {
                chosenMove.r = field.r;
                chosenMove.c = field.c;
                bestVal = moveVal;
            }
        }
    }

    if (chosenMove.r !== -1 && chosenMove.c !== -1) {
        board[chosenMove.r][chosenMove.c] = 'X';
    }

    renderBoard();

    if (victoryFor('X')) {
        statusElement.innerText = "🤖 Computer won!";
        gameOver = true;
    } else if (makeListOfFreeFields().length === 0) {
        statusElement.innerText = "🤝 It's a tie!";
        gameOver = true;
    } else {
        statusElement.innerText = "Your Turn! (O)";
    }
    inputLocked = false;
}

function resetGame() {
    board = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ];
    gameOver = false;
    inputLocked = false;

    if(computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
        computerMoveTimeout = null;
    }

    if (mode === 'ai') {
        board[1][1] = 'X';
        statusElement.innerText = "Your Turn! (O)";
        statusElement.style.color = '#00f2fe';
    } else {
        currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        setStatusForPlayer(currentPlayer, `${playerLabel(currentPlayer)}'s turn`);
    }

    renderBoard();
}

resetGame();
