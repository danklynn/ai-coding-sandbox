# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Safari Rescue is a complete 2D platform game built with HTML5 Canvas and vanilla JavaScript. This is a fully functional game featuring realistic physics, sprite animations, particle effects, and a complete level with boss battle.

## Architecture

### **Core Game Classes**
- `Game`: Main game loop, collision detection, level management
- `Player`: Character physics, input handling, sprite rendering
- `Enemy`: AI behavior, platform edge detection, collision
- `Boss`: Two-phase boss battle mechanics with charging
- `Fruit`: Collectible items with bobbing animations
- `Particle`: Customizable particle effects system

### **Key Systems**
- **Physics Engine**: Realistic acceleration, friction, momentum
- **Collision Detection**: AABB collision with Mario-style one-way platforms
- **Sprite System**: Image loading, directional facing, animation states
- **Particle System**: RGB color-based particles for various effects
- **Camera System**: Smooth following with level boundaries

## Development Standards

### **Code Style**
- ES6+ class-based architecture
- Modular design with clear separation of concerns
- 60 FPS game loop with requestAnimationFrame
- Efficient memory management and object lifecycle

### **Asset Management**
- All images load asynchronously with fallback rendering
- Three-sprite composition system for platforms (left-middle-right)
- Organized asset structure in `/images/` directory with subdirectories
- Consistent pixel art style throughout with proper scaling systems

### **Performance Considerations**
- Optimized rendering pipeline
- Efficient collision detection algorithms
- Proper particle cleanup and lifecycle management
- Responsive canvas scaling without performance loss

## File Structure

```
safari-rescue-game/
├── index.html          # Main HTML file with canvas and UI
├── game.js             # Complete game engine (1300+ lines)
├── safari_rescue_spec.md # Detailed game specification
├── images/
│   ├── player/         # Player sprite animations (standing, running A/B)
│   ├── items/          # Collectible sprites (banana, apple, pink heart)
│   ├── environment/    # Platform texture sprites (grass, log, rock)
│   └── *.png          # Background and story element sprites
├── README.md           # User documentation
└── CLAUDE.md          # This file
```

## Key Features Implemented

### ✅ **Core Mechanics**
- Realistic physics with acceleration/deceleration
- Mario-style one-way platform collision
- Variable height jumping with momentum
- Lives system with respawn mechanics
- Three-phase enemy AI with platform edge detection

### ✅ **Visual Systems**
- Player sprite animations (standing/running A&B frames) with directional facing
- Fruit sprites (banana/apple) with floating bob animations and color-coded particles
- Three-sprite platform system (grass/log/rock) with proper left-middle-right composition
- Parallax scrolling background with African savanna theme
- Dynamic victory experience with elephant rescue and gratitude heart animation
- Retro UI styling with fixed-width fonts and pixel-perfect design

### ✅ **Game Content**
- Complete Level 1: "Savanna Sunset" (2200 pixels wide)
- 25 collectible fruits strategically placed across difficulty areas
- 4 enemy types with varied behaviors and patrol patterns
- Boss battle with two phases and health system
- Baby elephant rescue storyline with caged→free transformation and gratitude animation

### ✅ **Polish Features**
- Customizable particle system with RGB color specification
- Full-screen responsive canvas with overlay UI
- Smooth camera following with level boundaries
- Visual feedback for all player interactions
- Dynamic victory state that continues gameplay without pause
- Clean game state management (playing/victory/game_over)

## Development Commands

Currently no build process required - the game runs directly in modern browsers.

### **Testing**
- Open `index.html` in any modern web browser
- Game supports keyboard controls (WASD/Arrow keys + Spacebar)
- Responsive design works on various screen sizes

### **Future Audio Integration**
When ready to add audio, the codebase is structured for easy integration:
- Sound effect triggers already identified in collision detection
- Background music loop points available in game state management
- Audio loading system can follow same pattern as image loading

## Code Quality Notes

### **Strengths**
- Clean object-oriented architecture with proper encapsulation
- Efficient game loop with proper frame timing
- Comprehensive collision detection with forgiving gameplay mechanics
- Excellent sprite and animation system with fallback rendering
- Well-organized particle effects with flexible color system

### **Extension Points**
- Audio system integration ready
- Additional level creation straightforward
- New enemy types can follow existing Enemy class pattern
- Particle effects easily customizable for new features
- Power-up system architecture already supports item collection

## Development History

This game was developed iteratively with continuous refinement:

1. **Phase 1**: Core mechanics and basic collision detection
2. **Phase 2**: Level design and enemy AI implementation  
3. **Phase 3**: Boss battle and game state management
4. **Phase 4**: Sprite system and visual polish
5. **Phase 5**: Particle effects and UI refinement
6. **Phase 6**: Platform texture systems and three-sprite composition
7. **Phase 7**: Player running animations and dynamic victory experience

Each phase built upon the previous work while maintaining code quality and performance standards.

## Best Practices

### **When Making Changes**
- Always test collision detection after physics modifications
- Verify image loading fallbacks when adding new sprites
- Maintain 60 FPS performance during development
- Follow existing naming conventions for consistency
- Update particle colors to match visual theme

### **Adding New Features**
- Follow existing class structure patterns
- Implement proper cleanup for memory management
- Add appropriate particle effects for visual feedback
- Consider mobile compatibility for touch controls
- Maintain pixel art aesthetic consistency

This codebase represents a complete, polished 2D platform game suitable for further development or as a foundation for additional levels and features.