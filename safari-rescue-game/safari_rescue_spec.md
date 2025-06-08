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

### Character Sprites (Implemented)
- **Standing Sprite:** `player_standing_left.png` - Default standing pose facing left
- **Running Animation:** `player_running_left_A.png` - First frame of running animation
- **Directional System:** Sprites automatically flip horizontally when facing right
- **Animation Logic:** Switches between standing and running sprites based on movement
- **Size:** 64x64 pixels scaled from pixel art

### Character Abilities
- **Movement:** Realistic physics with acceleration (0.4), friction (0.8), max speed (5)
- **Jumping:** Variable height jump with momentum conservation
- **Attack:** Mario-style stomp on enemies with bounce effect
- **Lives System:** 3 lives total, respawn on death
- **Health:** 3 health points per life (represented by heart icons)
- **Invincibility:** 2-second invincibility after taking damage

## Level 1 Specification: "Savanna Sunset"

### Environment Design (Implemented)
- **Setting:** African savanna at golden hour
- **Background:** `savannah_background2.png` - Parallax scrolling with acacia trees and sunset
- **Level Width:** 2200 pixels with camera following player
- **Canvas:** Full-screen responsive design (100vw x 100vh)
- **Baby Elephant Cage:** Positioned behind boss as rescue objective

### Platform Layout (Implemented)
- **Starting Area:** Tutorial platforms with safe jumps (x: 0-350)
- **Mid-Section:** Varied height platforms requiring skill (x: 350-1400)
- **Challenge Section:** Moving platforms over ravine with oscillating movement
- **Boss Area:** Extended platform (400px wide) with smaller jumping platforms

### Platform Types and Textures (For AI Image Generation)

#### Grass Platforms
- **Color Base:** Vibrant spring green (#90EE90)
- **Texture Description:** "Dense African savanna grass platform texture, 32x32 pixels, pixel art style. Show individual grass blades with darker green shadows beneath, lighter yellow-green highlights on top. Include small wildflowers (tiny white and yellow dots) scattered sparsely. Add subtle brown soil visible at the platform edges. Clean pixel art with distinct color blocks, no anti-aliasing."
- **Size Range:** 80-300 pixels wide, 15-50 pixels tall
- **Usage:** Main pathway platforms, safe landing areas

#### Rock Platforms  
- **Color Base:** Medium gray (#A0A0A0)
- **Texture Description:** "African granite rock platform texture, 32x32 pixels, pixel art style. Show weathered stone surface with darker gray cracks and crevices. Include lighter gray highlights on raised areas and darker shadows in recessed spots. Add hints of orange-brown mineral veining typical of African rock formations. Surface should look naturally rough with small chips and wear patterns. Maintain clean pixel art aesthetic with solid color blocks."
- **Size Range:** 60-150 pixels wide, 15-30 pixels tall  
- **Usage:** Mid-level challenges, decorative elements

#### Log Platforms
- **Color Base:** Saddle brown (#8B4513)
- **Texture Description:** "Fallen African tree log platform texture, 32x32 pixels, pixel art style. Show horizontal wood grain with distinct growth rings visible on the end. Include darker brown bark texture on the sides with vertical ridges and some missing bark patches revealing lighter wood underneath. Add moss patches (dark green spots) in shadowed areas. Should look like a naturally weathered acacia or baobab log. Keep pixel art styling with clear color boundaries."
- **Size Range:** 100-150 pixels wide, 20-30 pixels tall
- **Usage:** Natural bridges, rustic platforms

#### Moving Platforms
- **Color Base:** Gold (#FFD700) 
- **Texture Description:** "Magical floating platform texture, 32x32 pixels, pixel art style. Golden metallic base with ancient carved patterns or wildlife motifs (elephant silhouettes, paw prints). Include darker gold shadows and brighter yellow highlights to show dimensionality. Add subtle magical glow effect around edges (lighter yellow border). Surface should appear mystical but still natural, like an ancient African artifact. Maintain pixel art clarity with distinct color blocks."
- **Size Range:** 80 pixels wide, 15 pixels tall
- **Usage:** Moving challenge platforms over ravines

#### Boss Platform
- **Color Base:** Sandy brown (#CD853F)
- **Texture Description:** "Large ceremonial platform texture, 32x32 pixels tileable, pixel art style. Packed earth base with intricate tribal patterns carved or painted in darker browns and burnt orange. Include scattered bone fragments and small animal tracks pressed into the surface. Add areas of disturbed soil where the boss walks. Should convey an ominous gathering place for poaching activities. Include subtle geometric African patterns around the edges. Keep pixel art style with solid color regions."
- **Size Range:** 400 pixels wide, 50 pixels tall
- **Usage:** Final boss battle arena

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

### Enemy Types (Implemented)

#### Poacher Minions
**Basic Poacher**
- **Appearance:** Realistic 48x48 pixel sprite in camouflage clothing with knife
- **Behavior:** Walks back and forth on platforms, edge detection prevents falling
- **AI:** Patrols 80 pixels from spawn point, reverses at platform edges
- **Defeat Method:** Jump on top 30% of enemy sprite (forgiving collision)
- **Reward:** 100 points + fruit drop (50% chance)

**Patrol Poacher**  
- **Appearance:** Larger camouflage sprite with net and equipment belt
- **Behavior:** Faster movement (2 vs 1 speed), longer patrol range (150 pixels)
- **AI:** Advanced platform edge detection, more aggressive movement
- **Defeat Method:** Single stomp (simplified from original 2-hit design)
- **Reward:** 200 points + guaranteed fruit drop

### Boss: Chief Poacher (Implemented)

#### Boss Design
- **Appearance:** Large 96x96 pixel sprite with detailed safari vest, wide hat, scar, and whip
- **Location:** Boss platform with baby elephant cage (`baby_elephant.png`) positioned behind
- **Arena:** Extended 400px platform with small jumping platforms for maneuvering
- **Health Bar:** Visual health display above boss (green bar that decreases)

#### Boss Mechanics (Implemented)
- **Phase 1:** Net throwing phase (3 seconds cooldown, visual telegraph)
- **Phase 2:** Charging phase after 3 hits (speeds up to 120 frame cooldown)
- **Health:** 6 hits total with visual feedback
- **Charging:** Moves 100 pixels left/right from original position at speed 8
- **Attack Pattern:** 180 frame (3 second) cooldown between attacks
- **Defeat Condition:** Jump on boss's head 6 times (top 30% collision area)

#### Victory Sequence (Implemented)
1. Boss defeated state, stops all attacks
2. Game state changes to 'victory'
3. Victory overlay with "Baby Elephant Rescued! 🐘" message
4. Final score display
5. No browser alerts (clean victory screen)

## Core Gameplay Mechanics

### Movement Controls
- **A/D or Arrow Keys:** Left/right movement
- **W or Spacebar:** Jump
- **S or Down Arrow:** Duck/crouch (for future use)

### Physics System (Implemented)
- **Gravity:** 0.5 downward acceleration per frame
- **Terminal Velocity:** Capped at 15 pixels/frame for falling
- **Jump Physics:** Variable height (-8 initial velocity, -0.2 additional while held)
- **Platform Collision:** Mario-style one-way platforms (can jump through from below)
- **Moving Platforms:** Player moves with platforms when standing on them
- **Boundary Detection:** Left boundary at x=0, right boundary at level width (2200px)
- **Death Boundary:** Fall death trigger at y=700

### Combat System (Implemented)
- **Stomp Attack:** Top 30% of enemy sprite triggers defeat (forgiving collision)
- **Bounce Effect:** -8 velocity bounce after successful stomp
- **Damage System:** Requires 10+ pixel overlap for damage (prevents edge cases)
- **Invincibility:** 120 frames (2 seconds) after taking damage with visual flash
- **Lives System:** 3 lives total, respawn at (100, 400) after death
- **Game Over:** Triggered when all lives are lost

## User Interface

### HUD Elements (Implemented)
- **Health:** 3 heart icons (♥) in top-left, opacity changes with health
- **Score:** Running point total in top-right
- **Lives Counter:** Shows remaining lives in HUD
- **Fruit Counter:** Banana emoji with collected/total format (🍌 0/30)
- **Level Name:** "Savanna Sunset" with 3-second fade animation
- **Overlay Design:** HUD positioned absolutely over full-screen canvas

### Visual Feedback (Implemented)
- **Damage:** Hearts fade to 30% opacity when lost, player flashes during invincibility
- **Collection:** Particle effects (5 golden particles) spawn on fruit collection
- **Victory/Game Over:** Full-screen overlays with appropriate messaging
- **Enemy Defeat:** 8 red particles spawn when enemies are defeated

## Technical Requirements

### Performance Targets
- **Frame Rate:** Consistent 60 FPS
- **Load Time:** Under 3 seconds for Level 1 assets
- **Responsive Design:** Scales appropriately for different screen sizes
- **Mobile Compatibility:** Touch controls for mobile devices

### Asset Requirements (Implemented/Updated)
- **Character Sprites:** 64x64 pixels (2x scale), standing and running animations
- **Player Images:** `player_standing_left.png`, `player_running_left_A.png` with directional flipping
- **Enemy Sprites:** 48x48 pixels for minions, 96x96 for boss with realistic detail
- **Background:** `savannah_background2.png` with parallax scrolling support
- **Special Images:** `baby_elephant.png` cage sprite for mission objective
- **Platform Textures:** Needed - 32x32 pixel modular tiles for each platform type
- **Sound Effects:** Not yet implemented - 8-bit style audio planned
- **Music:** Not yet implemented - African-inspired background track planned

### Current Asset Status
- ✅ **Player sprites:** Standing and running (left-facing with flip system)
- ✅ **Background:** Savannah sunset with parallax scrolling
- ✅ **Baby elephant:** Rescue objective visual
- ❌ **Platform textures:** Currently using solid colors, need pixel art textures
- ❌ **Sound effects:** Not implemented
- ❌ **Background music:** Not implemented
- ❌ **Running animation B frame:** Need second running frame for animation

## Success Criteria for Level 1

### Gameplay Polish (Status: ✅ ACHIEVED)
- ✅ Smooth, responsive character movement with realistic physics
- ✅ Satisfying jump mechanics with variable height and momentum
- ✅ Visual feedback through particle effects and UI updates
- ✅ Balanced difficulty curve from tutorial area to boss encounter
- ❌ Audio feedback still needed

### Visual Quality (Status: 🔄 IN PROGRESS)
- ✅ Cohesive pixel art style with safari theme
- ✅ Character animations with standing/running states and directional facing
- ✅ Appealing parallax background that enhances immersion
- ✅ Clear visual hierarchy with HUD overlay system
- ❌ Platform textures needed to replace solid colors
- ❌ Additional running animation frame needed

### Audio Design (Status: ❌ NOT STARTED)
- ❌ Sound effects for jumping, collecting, enemy defeats
- ❌ Background music with African safari theme
- ❌ Audio cues for damage, victory, and other game events

### Player Experience (Status: ✅ ACHIEVED)
- ✅ Intuitive controls with WASD/Arrow keys
- ✅ Progressive difficulty teaching mechanics through level design
- ✅ Satisfying boss encounter with clear rescue objective
- ✅ Conservation message through baby elephant rescue theme

## Future Level Considerations

Once Level 1 meets all success criteria, future levels can introduce:
- New enemy types (helicopter patrols, trap setters)
- Additional mechanics (rope swinging, water sections)
- Different endangered animals (rhinos, giraffes, lions)
- New environments (jungle, desert, mountain regions)
- Power-ups and special abilities
- Multiplayer cooperative mode

## Development Phases

### Phase 1: Core Mechanics (✅ COMPLETED)
- ✅ Realistic character movement with physics (acceleration, friction, momentum)
- ✅ Mario-style one-way platform collision detection
- ✅ Enemy AI with platform edge detection and patrol behaviors
- ✅ Lives system with respawn mechanics

### Phase 2: Level Construction (✅ COMPLETED)
- ✅ Complete Level 1 layout with varied platform challenges
- ✅ Collectible fruit system with scoring (30 total fruits)
- ✅ Full UI implementation with health, score, lives, and fruit counters
- ✅ Moving platforms with player tracking

### Phase 3: Boss and Polish (✅ COMPLETED)
- ✅ Boss battle with two-phase mechanics and health system
- ✅ Baby elephant rescue objective visual
- ✅ Sprite-based character animations with directional facing
- ❌ Sound effects and background music (pending)

### Phase 4: Visual Enhancement (🔄 CURRENT)
- ✅ Player sprite system with standing/running animations
- ❌ Platform texture generation (detailed specifications provided)
- ❌ Second running animation frame (player_running_left_B.png)
- ❌ Audio implementation

### Phase 5: Final Polish (📋 PLANNED)
- Testing and balance adjustments
- Performance optimization
- Mobile compatibility enhancements
- Bug fixes and edge case handling

This specification has evolved to reflect the current highly polished state of the game, with most core features implemented and focus shifting to visual and audio enhancements.