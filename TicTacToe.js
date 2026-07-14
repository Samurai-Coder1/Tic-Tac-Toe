// Game State Initialization
let board = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
];
let gameOver = false;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// Converting Python display_board() by rendering interactive DOM buttons
function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');

            // Display empty space if it's just a placeholder digit
            const value = board[r][c];
            cell.innerText = (value === 'X' || value === 'O') ? value : '';

            // Wire up user click tracking
            cell.addEventListener('click', () => handleUserMove(r, c));
            boardElement.appendChild(cell);
        }
    }
}

// Converting Python make_list_of_free_fields()
function makeListOfFreeFields() {
    let freeFields = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] !== 'X' && board[r][c] !== 'O') {
                freeFields.push({ r, c });
            }
        }
    }
    return freeFields;
}

//  User interaction converting Python enter_move)
function handleUserMove(row, col) {
    if (gameOver || board[row][col] === 'X' || board[row][col] === 'O') return;

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

    // Hand over control to computer
    statusElement.innerText = "Computer thinking...";
    setTimeout(drawMove, 500); // 500ms delay mimics artificial thought
}

// Converting Python victory_for()
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

// Converting Python draw_move() with the corrected Python logic workflow
function drawMove() {
    let freeFields = makeListOfFreeFields();
    if (freeFields.length === 0 || gameOver) return;

    // 1. AI checks if Computer ('X') can win immediately
    for (let field of freeFields) {
        let backup = board[field.r][field.c];
        board[field.r][field.c] = 'X';
        if (victoryFor('X')) {
            renderBoard();
            statusElement.innerText = "🤖 Computer won!";
            gameOver = true;
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
}

// Clean initialization & reset script state
function resetGame() {
    board = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ];
    gameOver = false;
    statusElement.innerText = "Your Turn! (O)";

    // Mimic the mandatory Python starting condition: center move (1,1) is 'X'
    board[1][1] = 'X';

    renderBoard();
}

// Boot up game logic right away
resetGame();
