class Gomoku {
    constructor() {
        this.board = [];
        this.currentPlayer = 1; // 1 为黑子，2 为白子
        this.gameOver = false;
        this.boardSize = 15;
        this.moveHistory = []; // 存储历史记录
        this.maxHistorySize = 50; // 最大历史记录数量

        this.init();
        this.bindEvents();
    }

    init() {
        // 初始化棋盘数组
        this.board = Array(this.boardSize).fill(null)
            .map(() => Array(this.boardSize).fill(0));

        this.currentPlayer = 1;
        this.gameOver = false;
        this.moveHistory = []; // 清空历史记录
        this.updateStatus();
        this.updateUndoStatus(); // 更新悔棋状态
        this.drawBoard();
    }

    drawBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // 如果该位置有棋子，显示棋子
                if (this.board[row][col] !== 0) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[row][col] === 1 ? 'black' : 'white'}`;
                    cell.appendChild(piece);
                    cell.classList.add('disabled');
                }

                boardElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        // 绑定棋盘点击事件
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !this.gameOver) {
                this.handleCellClick(e.target);
            }
        });

        // 绑定重新开始按钮事件
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.init();
        });

        // 绑定悔棋按钮事件
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });
    }

    handleCellClick(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // 检查该位置是否已经有棋子
        if (this.board[row][col] !== 0) {
            return;
        }

        // 放置棋子
        this.board[row][col] = this.currentPlayer;

        // 重新绘制棋盘
        this.drawBoard();

        // 检查是否获胜
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            // 记录历史（包含游戏结束状态）
            this.recordMove(this.currentPlayer, row, col);
            const winner = this.currentPlayer === 1 ? '黑子' : '白子';
            this.showWinner(winner);
            return;
        }

        // 检查是否平局
        if (this.checkDraw()) {
            this.gameOver = true;
            // 记录历史（包含游戏结束状态）
            this.recordMove(this.currentPlayer, row, col);
            this.showDraw();
            return;
        }

        // 记录历史（正常游戏状态）
        this.recordMove(this.currentPlayer, row, col);

        // 切换玩家
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateStatus();
    }

    checkWin(row, col) {
        const player = this.board[row][col];

        // 检查四个方向：横向、纵向、对角线1、对角线2
        const directions = [
            [[0, 1], [0, -1]],  // 横向
            [[1, 0], [-1, 0]],  // 纵向
            [[1, 1], [-1, -1]], // 对角线1
            [[1, -1], [-1, 1]]  // 对角线2
        ];

        for (const direction of directions) {
            let count = 1; // 包含当前落子

            // 检查两个相反方向
            for (const [dr, dc] of direction) {
                let r = row + dr;
                let c = col + dc;

                while (r >= 0 && r < this.boardSize &&
                       c >= 0 && c < this.boardSize &&
                       this.board[r][c] === player) {
                    count++;
                    r += dr;
                    c += dc;
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    checkDraw() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    return false; // 还有空位，不是平局
                }
            }
        }
        return true; // 棋盘已满，平局
    }

    updateStatus() {
        const currentPlayerElement = document.getElementById('current-player');
        const gameStatusElement = document.getElementById('game-status');

        if (!this.gameOver) {
            currentPlayerElement.textContent = this.currentPlayer === 1 ? '黑子' : '白子';
            gameStatusElement.textContent = '游戏进行中';
            gameStatusElement.className = 'game-status';
        }
    }

    showWinner(winner) {
        const gameStatusElement = document.getElementById('game-status');
        gameStatusElement.textContent = `${winner} 获胜！`;
        gameStatusElement.className = 'game-status winner-message';
    }

    showDraw() {
        const gameStatusElement = document.getElementById('game-status');
        gameStatusElement.textContent = '平局！';
        gameStatusElement.className = 'game-status winner-message';
    }

    // 记录历史
    recordMove(player, row, col) {
        this.moveHistory.push({
            player: player,
            row: row,
            col: col,
            gameOver: this.gameOver,
            timestamp: Date.now()
        });

        // 限制历史记录数量，防止内存泄漏
        if (this.moveHistory.length > this.maxHistorySize) {
            this.moveHistory.shift();
        }

        this.updateUndoStatus();
    }

    // 更新悔棋状态显示
    updateUndoStatus() {
        const undoBtn = document.getElementById('undo-btn');
        const undoInfo = document.getElementById('undo-info');

        if (undoBtn) {
            undoBtn.disabled = this.moveHistory.length === 0;
        }

        if (undoInfo) {
            undoInfo.textContent = `可悔棋步数: ${this.moveHistory.length}`;
        }
    }

    // 执行悔棋
    undoMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop();

        // 恢复棋盘状态
        this.board[lastMove.row][lastMove.col] = 0;

        // 恢复游戏状态
        this.gameOver = lastMove.gameOver;

        // 恢复当前玩家
        this.currentPlayer = lastMove.player;

        // 更新界面
        this.drawBoard();
        this.updateStatus();
        this.updateUndoStatus();

        return true;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});