// Graphics and sound assets for the Flappy Bird game

export const ASSETS = {
    background: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
        <rect width="100%" height="100%" fill="#4EC0CA"/>
        <rect y="450" width="100%" height="150" fill="#5EE270"/>
        <!-- Clouds -->
        <g fill="white" opacity="0.8">
          <ellipse cx="80" cy="100" rx="30" ry="20"/>
          <ellipse cx="110" cy="100" rx="30" ry="25"/>
          <ellipse cx="140" cy="100" rx="20" ry="15"/>
          
          <ellipse cx="280" cy="180" rx="30" ry="20"/>
          <ellipse cx="310" cy="180" rx="35" ry="25"/>
          <ellipse cx="340" cy="180" rx="25" ry="15"/>
          
          <ellipse cx="180" cy="250" rx="25" ry="15"/>
          <ellipse cx="210" cy="250" rx="30" ry="20"/>
          <ellipse cx="240" cy="250" rx="20" ry="15"/>
        </g>
      </svg>
    `)}`,
    
    bird: [
      // Frame 1: Wings level
      `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 24">
          <g transform="translate(2 2)">
            <!-- Body -->
            <ellipse cx="16" cy="12" rx="15" ry="10" fill="#FFDE00" stroke="#000" stroke-width="1"/>
            <!-- Eye -->
            <circle cx="25" cy="8" r="3" fill="white" stroke="#000" stroke-width="1"/>
            <circle cx="26" cy="7" r="1" fill="black"/>
            <!-- Wing -->
            <path d="M15 14 Q10 14 8 16 Q7 14 10 12 Q14 10 15 14" fill="#FFBA00" stroke="#000" stroke-width="1"/>
            <!-- Beak -->
            <path d="M30 10 L34 12 L30 14 Z" fill="#FF6B00" stroke="#000" stroke-width="1"/>
          </g>
        </svg>
      `)}`,
      
      // Frame 2: Wings up
      `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 24">
          <g transform="translate(2 2)">
            <!-- Body -->
            <ellipse cx="16" cy="12" rx="15" ry="10" fill="#FFDE00" stroke="#000" stroke-width="1"/>
            <!-- Eye -->
            <circle cx="25" cy="8" r="3" fill="white" stroke="#000" stroke-width="1"/>
            <circle cx="26" cy="7" r="1" fill="black"/>
            <!-- Wing up -->
            <path d="M15 14 Q10 10 8 7 Q10 8 12 10 Q15 12 15 14" fill="#FFBA00" stroke="#000" stroke-width="1"/>
            <!-- Beak -->
            <path d="M30 10 L34 12 L30 14 Z" fill="#FF6B00" stroke="#000" stroke-width="1"/>
          </g>
        </svg>
      `)}`,
      
      // Frame 3: Wings down
      `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 24">
          <g transform="translate(2 2)">
            <!-- Body -->
            <ellipse cx="16" cy="12" rx="15" ry="10" fill="#FFDE00" stroke="#000" stroke-width="1"/>
            <!-- Eye -->
            <circle cx="25" cy="8" r="3" fill="white" stroke="#000" stroke-width="1"/>
            <circle cx="26" cy="7" r="1" fill="black"/>
            <!-- Wing down -->
            <path d="M15 14 Q10 18 8 22 Q10 19 12 17 Q15 15 15 14" fill="#FFBA00" stroke="#000" stroke-width="1"/>
            <!-- Beak -->
            <path d="M30 10 L34 12 L30 14 Z" fill="#FF6B00" stroke="#000" stroke-width="1"/>
          </g>
        </svg>
      `)}`,
    ],
    
    pipe: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 320">
        <rect width="52" height="320" fill="#74BF2E" stroke="#000" stroke-width="2"/>
        <!-- Highlight -->
        <rect x="5" width="10" height="320" fill="#8ED446" opacity="0.7"/>
        <!-- Shadow -->
        <rect x="42" width="10" height="320" fill="#53901D" opacity="0.7"/>
      </svg>
    `)}`,
    
    pipeTop: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 30">
        <rect width="70" height="30" rx="2" ry="2" fill="#74BF2E" stroke="#000" stroke-width="2"/>
        <!-- Highlight -->
        <rect x="5" y="0" width="15" height="30" fill="#8ED446" opacity="0.7"/>
        <!-- Shadow -->
        <rect x="55" y="0" width="15" height="30" fill="#53901D" opacity="0.7"/>
      </svg>
    `)}`,
    
    ground: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 112">
        <rect width="400" height="112" fill="#DED895"/>
        <!-- Grass tufts -->
        <g fill="#90B945">
          <path d="M0 0 L15 0 L10 5 L20 0 L15 8 L25 0 L20 10 L30 0 L25 12 L35 0 L30 10 L40 0 L35 8 L45 0 L40 5 L50 0 L45 10 L55 0 L55 15 L0 15 Z"/>
          <path d="M60 0 L75 0 L70 5 L80 0 L75 8 L85 0 L80 10 L90 0 L85 12 L95 0 L90 10 L100 0 L95 8 L105 0 L100 5 L110 0 L105 10 L115 0 L115 15 L60 15 Z" />
          <path d="M120 0 L135 0 L130 5 L140 0 L135 8 L145 0 L140 10 L150 0 L145 12 L155 0 L150 10 L160 0 L155 8 L165 0 L160 5 L170 0 L165 10 L175 0 L175 15 L120 15 Z" />
          <path d="M180 0 L195 0 L190 5 L200 0 L195 8 L205 0 L200 10 L210 0 L205 12 L215 0 L210 10 L220 0 L215 8 L225 0 L220 5 L230 0 L225 10 L235 0 L235 15 L180 15 Z" />
          <path d="M240 0 L255 0 L250 5 L260 0 L255 8 L265 0 L260 10 L270 0 L265 12 L275 0 L270 10 L280 0 L275 8 L285 0 L280 5 L290 0 L285 10 L295 0 L295 15 L240 15 Z" />
          <path d="M300 0 L315 0 L310 5 L320 0 L315 8 L325 0 L320 10 L330 0 L325 12 L335 0 L330 10 L340 0 L335 8 L345 0 L340 5 L350 0 L345 10 L355 0 L355 15 L300 15 Z" />
          <path d="M360 0 L375 0 L370 5 L380 0 L375 8 L385 0 L380 10 L390 0 L385 12 L395 0 L390 10 L400 0 L400 15 L360 15 Z" />
        </g>
        <!-- Dirt lines -->
        <g stroke="#C4BB80" stroke-width="1.5">
          <line x1="0" y1="25" x2="400" y2="25" />
          <line x1="0" y1="55" x2="400" y2="55" />
          <line x1="0" y1="85" x2="400" y2="85" />
        </g>
        <!-- Small stone patterns -->
        <g fill="#C4BB80">
          <circle cx="20" cy="40" r="3" />
          <circle cx="120" cy="70" r="4" />
          <circle cx="220" cy="30" r="3" />
          <circle cx="320" cy="100" r="4" />
          <circle cx="70" cy="90" r="3" />
          <circle cx="170" cy="40" r="4" />
          <circle cx="270" cy="60" r="3" />
          <circle cx="370" cy="80" r="4" />
        </g>
      </svg>
    `)}`,
  };
  
  export const SOUNDS = {
    jump: '/games/flappy-bird/sounds/jump.mp3',
    score: '/games/flappy-bird/sounds/score.mp3',
    hit: '/games/flappy-bird/sounds/hit.mp3',
    die: '/games/flappy-bird/sounds/die.mp3',
    swoosh: '/games/flappy-bird/sounds/swoosh.mp3'
  };