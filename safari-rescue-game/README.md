# Safari Rescue

A 2D pixel art platform game where you play as a safari guide rescuing endangered animals from poachers in the African savanna.

## Game Overview

**Safari Rescue** combines classic Mario-style platforming mechanics with an educational conservation message. Navigate through challenging terrain, collect fruits, defeat enemies, and rescue a baby elephant from the chief poacher.

## Features

### 🎮 **Gameplay**
- **Realistic Physics**: Acceleration, friction, and momentum-based movement
- **Mario-Style Platforms**: One-way platform collision system
- **Variable Jump Height**: Hold jump button for higher jumps
- **Lives System**: 3 lives with respawn mechanics
- **Boss Battle**: Two-phase boss encounter with charging mechanics

### 🎨 **Visual Design**
- **Pixel Art Style**: Authentic 16-bit console game aesthetic
- **Player Animation**: Two-frame running cycle with standing and jumping poses
- **Platform Textures**: Three-sprite composition system for grass, log, and rock platforms
- **Fruit Sprites**: Banana and apple pixel art with floating bob animations
- **Victory Experience**: Dynamic elephant rescue with gratitude heart animation
- **Parallax Background**: African savanna sunset with acacia trees

### 🌟 **Polish Features**
- **Particle Effects**: Color-coded particles for different interactions
- **Full-Screen Canvas**: Responsive design scaling to browser window
- **Retro UI**: Fixed-width fonts with clean console-style interface
- **Dynamic Victory**: Game continues during victory with live elephant rescue animation
- **Sound-Ready**: Structured for easy audio implementation

## Controls

- **Movement**: `A`/`D` or `←`/`→` Arrow Keys
- **Jump**: `W` or `Spacebar`
- **Variable Jump**: Hold jump button for higher jumps

## Scoring System

- **Bananas (Regular Fruits)**: 10 points each
- **Apples (Golden Fruits)**: 50 points each  
- **Basic Enemy Defeat**: 100 points
- **Patrol Enemy Defeat**: 200 points
- **Boss Defeat**: 1000 points

## Level Design

### **Savanna Sunset (Level 1)**
- **Starting Area**: Tutorial zone with basic jumps
- **Mid-Section**: Varied platform heights requiring skill
- **Moving Platform Challenge**: Oscillating platforms over ravines  
- **Boss Arena**: Final confrontation with the Chief Poacher

## Technical Details

### **Built With**
- **HTML5 Canvas**: 2D rendering and game graphics
- **Vanilla JavaScript**: ES6+ game engine with class-based architecture
- **Responsive Design**: Full-screen scaling with overlay UI

### **Performance**
- **60 FPS**: Smooth gameplay with optimized rendering
- **Efficient Collision**: AABB collision detection system
- **Memory Management**: Proper object cleanup and particle lifecycle

### **Asset Requirements**
- **Player Sprites**: `images/player/` - Standing, running A & B frame animations
- **Fruit Sprites**: `images/items/` - Banana, apple, and pink heart collectibles
- **Platform Textures**: `images/environment/` - Left-middle-right sprite sets for all platform types
- **Story Elements**: Caged and free baby elephant sprites
- **Background**: Parallax scrolling savanna landscape

## Installation & Setup

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Enjoy the game!

*No build process required - runs directly in the browser.*

## Game Progression

1. **Learn Controls** - Master movement and jumping in the starting area
2. **Collect Fruits** - Gather bananas (10pts) and apples (50pts) for score
3. **Defeat Enemies** - Jump on poachers to defeat them safely
4. **Navigate Challenges** - Master moving platforms and precise jumps
5. **Boss Battle** - Defeat the Chief Poacher to rescue the baby elephant

## Development Status

### ✅ **Completed Features**
- Core platforming mechanics with realistic physics
- Complete sprite system with player running animations
- Three-sprite platform rendering system (grass, log, rock)
- Level 1 with full gameplay loop
- Boss battle and dynamic victory experience
- Particle effects and visual polish
- Retro fixed-width font UI styling
- Elephant rescue storyline with gratitude animation

### 🔄 **Future Enhancements**
- Sound effects and background music
- Additional levels and environments
- More enemy types and mechanics
- Power-ups and special abilities
- Mobile touch controls

## Contributing

This project was developed as a demonstration of modern web-based game development techniques. Feel free to fork and experiment with additional features!

## License

Open source project - feel free to use and modify.

---

*Rescue the animals, save the savanna! 🦏🐘🦒*