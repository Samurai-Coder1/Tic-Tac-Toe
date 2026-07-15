// Game State Initialization
let board = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];
let gameOver = false;
let mode = 'ai'; // ai or multiplr option
let currentPlayer = 'X'; // Used in multiplr mode
let inputLocked = false;
let computerMoveTimeout = null;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const modeAiBtn = document.getElementById('mode-ai');
const modeMultiplayerBtn = document.getElementById('mode-multiplayer');
modeAiBtn.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';

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

function drawMove() {
    let freeFields = makeListOfFreeFields();
    if (freeFields.length === 0 || gameOver) {
        inputLocked = false;
        return;
    }

    // 1. AI checks if Computer ('X') can win immediately
    for (let field of freeFields) {
        let backup = board[field.r][field.c];
        board[field.r][field.c] = 'X';
        if (victoryFor('X')) {
            renderBoard();
            statusElement.innerText = "🤖 Computer won!";
            gameOver = true;
            inputLocked = false;
            return; // Valid move secured victory
        }
        board[field.r][field.c] = backup;
    }

    // 2. AI checks if Player ('O') can win and blocks them
    for (let field of freeFields) {
        let backup = board[field.r][field.c];
        board[field.r][field.c] = 'O';
        if (victoryFor('O')) {
            board[field.r][field.c] = 'X'; // Lock block choice
            renderBoard();
            statusElement.innerText = "Your Turn! (O)";
            inputLocked = false;
            return;
        }
        board[field.r][field.c] = backup;
    }

    // 3. Fallback: Select a random remaining index
    let randomIndex = Math.floor(Math.random() * freeFields.length);
    let choice = freeFields[randomIndex];
    board[choice.r][choice.c] = 'X';

    renderBoard();

    if (makeListOfFreeFields().length === 0) {
        statusElement.innerText = "🤝 It's a tie!";
        gameOver = true;
    } else {
        statusElement.innerText = "Your Turn! (O)";
    }
    inputLocked = false;
}

// Clean initialization & reset script state
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

// Boot up game logic right away
resetGame();
