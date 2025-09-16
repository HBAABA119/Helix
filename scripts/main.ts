import Game from '../pages/game';

function main() {
    const root = document.getElementById('root');
    const game = new Game();
    root.appendChild(game.canvas);
}

main();