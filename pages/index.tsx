import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import styled from 'styled-components';
import GameBoard from '../src/components/GameBoard';
import DifficultySelector from '../src/components/DifficultySelector';

const Container = styled.div`
  min-height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const Title = styled.h1`
  margin: 0;
  margin-top: 5px;
  line-height: 1;
  font-size: 1.8rem;
  text-align: center;
`;

const Home: NextPage = () => {
  const [gameMode, setGameMode] = useState<'human' | 'ai-easy' | 'ai-medium' | 'ai-hard' | null>(null);
  
  return (
    <Container>
      <Head>
        <title>Connect Five</title>
        <meta name="description" content="Connect Five game with infinite canvas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Title>Connect Five</Title>
      
      {!gameMode ? (
        <DifficultySelector onSelect={setGameMode} />
      ) : (
        <GameBoard gameMode={gameMode} onBackToMenu={() => setGameMode(null)} />
      )}
    </Container>
  );
};

export default Home;