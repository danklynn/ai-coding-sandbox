# Safari Rescue - Platform Game Specification

## Game Overview

**Title:** Safari Rescue  
**Genre:** 2D Side-scrolling Platform Game  
**Platform:** Web Browser (HTML5/JavaScript)  
**Theme:** Wildlife Conservation Adventure

### Core Concept
Players control a brave zookeeper/safari guide on a mission to rescue endangered animals from poachers across various African savanna environments. The gameplay combines classic platforming mechanics with an educational conservation message.

## Main Character

### Character Design
- **Name:** Alex Safari (customizable)
- **Appearance:** Khaki safari outfit, wide-brimmed hat, binoculars around neck
- **Role:** Experienced wildlife conservationist and zookeeper

### Character Abilities
- **Movement:** Left/right movement with smooth acceleration/deceleration
- **Jumping:** Variable height jump (hold for higher jump, tap for smaller hop)
- **Attack:** Primary attack is jumping on enemies (Mario-style stomp)
- **Special:** Brief invincibility frames after taking damage
- **Health:** 3 health points (represented by heart icons)

## Level 1 Specification: "Savanna Sunset"

### Environment Design
- **Setting:** African savanna at golden hour
- **Background:** Layered parallax scrolling with acacia trees, distant mountains, and gradient sunset sky
- **Foreground:** Grass platforms, rocky outcrops, fallen logs, and small watering holes
- **Length:** Approximately 2-3 minutes of gameplay (1500-2000 pixels wide)

### Platform Layout
- **Starting Area:** Safe tutorial zone with simple jumps and first enemy
- **Mid-Section:** Varied platform heights requiring different jump combinations
- **Challenge Section:** Moving platforms over a ravine
- **Boss Area:** Larger open space for boss encounter

### Collectibles: Animal Feed

#### Visual Design
- Small fruit icons (bananas, apples, berries)
- Animated with gentle bobbing motion
- Sparkle effect when collected

#### Placement Strategy
- **Easy Finds:** 60% placed on main path platforms
- **Risk/Reward:** 25% require small jumps or slight detours
- **Hidden:** 15% in secret areas or after defeating enemies

#### Point Values
- Regular fruit: 10 points each
- Special golden fruit (rare): 50 points each
- Target: 30-40 total collectibles in Level 1

### Enemy Types

#### Poacher Minions
**Basic Poacher**
- **Appearance:** Simple sprite in camouflage clothing
- **Behavior:** Walks back and forth on platforms, turns at edges
- **Defeat Method:** Jump on head (disappears with puff animation)
- **Reward:** 100 points + fruit drop (50% chance)

**Patrol Poacher**
- **Appearance:** Slightly larger, carries a net
- **Behavior:** Patrols longer distances, moves faster
- **Defeat Method:** Jump on head twice
- **Reward:** 200 points + guaranteed fruit drop

### Boss: Chief Poacher

#### Boss Design
- **Appearance:** Large sprite with safari vest, hat, and intimidating stance
- **Location:** In front of a large cage containing a baby elephant
- **Arena:** Flat ground with 2-3 small platforms for maneuvering

#### Boss Mechanics
- **Phase 1:** Throws nets in predictable arc patterns (jump to avoid)
- **Phase 2:** (after 3 hits) Charges across screen (jump over or hide behind platforms)
- **Health:** 6 hits total
- **Attack Pattern:** 3 seconds between attacks, clearly telegraphed
- **Defeat Condition:** Jump on boss's head 6 times

#### Victory Sequence
1. Boss disappears with defeat animation
2. Cage opens automatically
3. Baby elephant trumpets happily and runs off-screen
4. Victory message: "Baby Elephant Rescued!"
5. Level completion stats display

## Core Gameplay Mechanics

### Movement Controls
- **A/D or Arrow Keys:** Left/right movement
- **W or Spacebar:** Jump
- **S or Down Arrow:** Duck/crouch (for future use)

### Physics System
- **Gravity:** Consistent downward force
- **Jump Physics:** Responsive with variable height based on button hold duration
- **Collision:** Precise pixel-perfect collision detection
- **Terminal Velocity:** Cap falling speed to maintain control

### Combat System
- **Stomp Attack:** Landing on enemy's head defeats them
- **Timing Window:** Brief invincibility after stomping (0.5 seconds)
- **Miss Penalty:** Landing beside enemies causes damage to player
- **Feedback:** Screen shake and sound effect on successful hits

## User Interface

### HUD Elements
- **Health:** 3 heart icons in top-left corner
- **Score:** Running point total in top-center
- **Fruit Counter:** Shows collected vs total available
- **Level Name:** "Savanna Sunset" displayed briefly at start

### Visual Feedback
- **Damage:** Hearts flash red and decrease
- **Collection:** Fruit counter increases with small animation
- **Score:** Points float upward when earned

## Technical Requirements

### Performance Targets
- **Frame Rate:** Consistent 60 FPS
- **Load Time:** Under 3 seconds for Level 1 assets
- **Responsive Design:** Scales appropriately for different screen sizes
- **Mobile Compatibility:** Touch controls for mobile devices

### Asset Requirements
- **Character Sprites:** 32x32 pixels, 4-6 animation frames per action
- **Enemy Sprites:** 24x24 pixels for minions, 48x48 for boss
- **Environment Tiles:** 32x32 pixel modular tiles
- **Background:** 1920x1080 layered background art
- **Sound Effects:** 8-bit style audio for jumps, collections, defeats
- **Music:** Upbeat African-inspired background track (2-3 minute loop)

## Success Criteria for Level 1

### Gameplay Polish
- Smooth, responsive character movement
- Satisfying jump mechanics with good "game feel"
- Clear visual and audio feedback for all actions
- Balanced difficulty curve from start to boss

### Visual Quality
- Cohesive art style that's colorful and engaging
- Smooth animations for character and enemies
- Appealing parallax background that enhances immersion
- Clear visual hierarchy so gameplay elements stand out

### Audio Design
- Distinct sound effects for different actions
- Background music that loops seamlessly
- Audio cues that provide gameplay feedback

### Player Experience
- Intuitive controls that feel natural within 30 seconds
- Progressive difficulty that teaches mechanics through play
- Satisfying boss encounter that feels like an achievement
- Clear conservation message without being preachy

## Future Level Considerations

Once Level 1 meets all success criteria, future levels can introduce:
- New enemy types (helicopter patrols, trap setters)
- Additional mechanics (rope swinging, water sections)
- Different endangered animals (rhinos, giraffes, lions)
- New environments (jungle, desert, mountain regions)
- Power-ups and special abilities
- Multiplayer cooperative mode

## Development Phases

### Phase 1: Core Mechanics (Week 1-2)
- Basic character movement and jumping
- Simple collision detection
- Basic enemy AI and defeat mechanics

### Phase 2: Level Construction (Week 3)
- Design and implement Level 1 layout
- Add collectibles and point system
- Basic UI implementation

### Phase 3: Boss and Polish (Week 4)
- Implement boss battle mechanics
- Add sound effects and background music
- Visual polish and animations

### Phase 4: Testing and Refinement (Week 5)
- Playtesting with focus groups
- Balance adjustments
- Bug fixes and optimization

This specification prioritizes creating a single, highly polished level that demonstrates all core mechanics and serves as a strong foundation for expanding the game with additional levels and features.