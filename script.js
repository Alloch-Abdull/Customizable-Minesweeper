var btn = document.getElementById("confirm");
const boardElement = document.querySelector(".board")
const messagetext = document.querySelector(".endmessage")
const minesLeft = document.getElementById("minesleft")
var userBoardSize = document.getElementById("boardinput").value
var userMine = document.getElementById("mineinput").value
var userBoard = [userBoardSize, userMine]
const tiles = document.querySelectorAll(".tile")
var gameStat = 'play'

// declare the tile statuses
const tile_statuses = {
    hidden: "hidden",
    mine: "mine",
    number: "number",
    marked: "marked",
    markedMine: "marked-mine"
}

// at the start of the game mines left will be the nr of mines inputted by the user
minesLeft.textContent = userBoard[1];
boardElement.style.setProperty("--size", userBoard[0])

// create the board using the user input for size and nr of mines
// create the divs for the tiles, give them their classname and sit their status to hidden
let board = createBoard(userBoard[0], userBoard[1])
function createBoard (boardSize, boardMines) {
    const board = [];
    const minePositions = getMinesPositions(boardSize, boardMines)
    for (let x = 0; x < boardSize; x++) {
        const row = [];
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement("div")
            element.dataset.status = tile_statuses.hidden
            element.classList.add("tile")
            const tile = {
                element,
                x,
                y,
                mine: minePositions.some(positionMatch.bind(null, { x, y })),
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                }                     
            }
            row.push(tile)
        }
        board.push(row)
    }
    return board
}

function appendTiles() {
    board.forEach(row => {
        row.forEach(tile => {
            boardElement.append(tile.element)
            // on left click either reveal the tile or announce game lost
            tile.element.addEventListener("click", () => {
                if (gameStat == 'play') {
                    revealTile(board, tile)
                    checkGameEnd()
                }
            })
            // on right click 'contextmenu' mark the tile and update the mines left counter
            tile.element.addEventListener("contextmenu", e => {
                if (gameStat == 'play') {
                    e.preventDefault()
                    markTile(tile)
                    listMinesLeft()
                }
            })
        })
    })
}
appendTiles()
function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === tile_statuses.marked).length
    }, 0)
    minesLeft.textContent = userBoard[1] - markedTilesCount;
}

function markTile(tile) {
    if (tile.status !== tile_statuses.hidden && 
        tile.status !== tile_statuses.marked ) {
        return
    }
    if (tile.status === tile_statuses.marked) {
        tile.status = tile_statuses.hidden
    } 
    // else (it's not marked but hidden)
    else {
        tile.status = tile_statuses.marked
    }
}

function getMinesPositions(boardSize, numberOfMines) {
    const positions = []
    while (positions.length < numberOfMines) {
        const position = {
            x: Math.floor(Math.random() * boardSize),
            y: Math.floor(Math.random() * boardSize)
        }
        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        } 
    }
    return positions
}
// check if 'a' and 'b' have the same position
function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
}

function revealTile(board, tile) {
    if (tile.status !== tile_statuses.hidden) {
        return // do nothing
    }
    if (tile.mine) {
        tile.status = tile_statuses.mine
    }
    else {
        tile.status = tile_statuses.number
        const neartiles = nearByTiles(board, tile)
        const mines = neartiles.filter(t => t.mine)
        if (mines.length === 0) {
            neartiles.forEach(revealTile.bind(null, board))
        }
        else {
            tile.element.textContent = mines.length
        }
    }
}
// chech if there are tiles adjacent to the clicked tile
function nearByTiles(board, {x, y}) {
    const tiles = []
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const tile = board[x + xOffset]?.[y + yOffset]
            if (tile) tiles.push(tile)
        }
    }
    return tiles
}

function checkGameEnd() {
    const  win = checkwin(board) 
    const lose = checklose(board)
    // either win or lose stop allowing the clicking on tiles 
   if (win || lose) {
        gameStat = 'end'
        btn.innerText = 'Restart'
   }
   if (win) {
       messagetext.textContent = "you win"
       board.forEach(row => {
        row.forEach(tile => {
            if (tile.status === tile_statuses.marked && tile.mine) tile.status = tile_statuses.markedMine
            if (tile.mine) revealTile(board, tile)
        })
       })
   }
   if (lose) {
       messagetext.textContent = "you lose"
       board.forEach(row => {
        row.forEach(tile => {
            if (tile.status === tile_statuses.marked && tile.mine) tile.status = tile_statuses.markedMine
            if (tile.mine) revealTile(board, tile)
        })
       })
   }
}

function checkwin (board) {
    return board.every( row => {
        return row.every( tile => {
            return (tile.status === tile_statuses.number || (tile.mine && (tile.status === tile_statuses.hidden || tile.status === tile_statuses.marked)))
        })
    })
}

function checklose (board) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status === tile_statuses.mine
            })
        })
    }

// restart the game
btn.addEventListener('click', () => {
    messagetext.innerText = ''
    gameStat = 'play'
    var userBoardSize = document.getElementById("boardinput").value
    var userMine = document.getElementById("mineinput").value
    var userBoard = [userBoardSize, userMine]
    const tiles = document.querySelectorAll(".tile")

    if ( userBoardSize * userBoardSize < userMine) return alert('Board size (Width X Width) must be bigger than the number of mines') 
    // remove the tiles that are already on the board
    function remove(elme) { elme.forEach( el => el.remove() ) }
    remove (tiles)

    board = createBoard(userBoard[0], userBoard[1])
    createBoard(userBoard[0], userBoard[1])
    boardElement.style.setProperty("--size", userBoard[0])
    appendTiles()
})