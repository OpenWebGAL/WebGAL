import { WebGAL } from '@/Core/WebGAL';
import { useEffect, useState } from 'react';
import { characters as initCharacters } from '@/character';

interface CharacterProgressProps {
  characters: {
    id: number;
    name: string;
    imageUrl: string;
    progress: number;
    total: number;
  }[];
}

export default function Character() {
  // 响应式尺寸
  const [startGame, setStartGame] = useState(WebGAL.startGame);
  const [characters, setCharacters] = useState<CharacterProgressProps['characters']>(initCharacters);
  // 头像尺寸、进度条高度、字体等都用clamp保证在不同屏幕下自适应
  const avatarSize = 'clamp(32px, 5vw, 48px)';
  const barHeight = 'clamp(12px, 2vw, 18px)';
  const fontSize = 'clamp(12px, 1.5vw, 18px)';
  const containerWidth = 'clamp(180px, 28vw, 340px)';
  const gap = 'clamp(8px, 1vw, 16px)';

  useEffect(() => {
    let lastValue = WebGAL.startGame;
    const timer = setInterval(() => {
      if (WebGAL.startGame !== lastValue) {
        lastValue = WebGAL.startGame;
        setStartGame(WebGAL.startGame);
      }
    }, 50); // 50ms 检查一次

    return () => clearInterval(timer);
  }, []);
  return (
    <div
      style={{
        position: 'absolute',
        top: '2vw',
        left: '2vw',
        width: containerWidth,
        background: 'rgba(0,0,0,0.45)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        padding: gap,
        display: startGame ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'stretch',
        zIndex: 9999,
        gap,
        minWidth: '120px',
        maxWidth: '96vw',
      }}
      id="character"
    >
      {characters.map((character) => (
        <div
          key={character.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap,
            width: '100%',
            marginBottom: gap,
          }}
        >
          <img
            src={character.imageUrl}
            alt={character.name}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #a97c50',
              background: '#fff',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <div
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize,
                lineHeight: 1.1,
                marginBottom: '2px',
                textShadow: '0 1px 2px #0008',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {character.name}
            </div>
            <div
              style={{
                width: '100%',
                height: barHeight,
                background: '#ccc',
                borderRadius: barHeight,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(character.progress / character.total) * 100}%`,
                  background: character.progress === character.total ? '#e53935' : 'red',
                  transition: 'width 0.3s',
                  borderRadius: barHeight,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fff',
                  fontSize,
                  fontWeight: 700,
                  textShadow: '0 1px 2px #0008',
                  pointerEvents: 'none',
                }}
              >
                {`${character.progress}/${character.total}`}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
