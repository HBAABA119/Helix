import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Phaser } from '@types/phaser';
import PhaserGame from '../components/PhaserGame';

function App() {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const gameInstance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: 400,
      height: 600,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    });

    setGame(gameInstance);

    return () => {
      gameInstance.destroy();
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Flappy Bird</title>
      </Head>
      <div id="game"></div>
      {game && (
        <PhaserGame game={game} />
      )}
    </div>
  );
}

export default App;