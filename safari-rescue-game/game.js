class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.camera = { x: 0, y: 0 };
        this.levelWidth = 2200;
        
        this.keys = {};
        this.gameState = 'playing';
        
        this.score = 0;
        this.fruitsCollected = 0;
        this.totalFruits = 30;
        this.lives = 3;
        
        this.platforms = [];
        this.enemies = [];
        this.fruits = [];
        this.particles = [];
        
        this.player = new Player(100, 400);
        this.boss = null;
        
        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'images/savannah_background2.png';
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
        };
        
        // Load baby elephant cage image
        this.babyElephantImage = new Image();
        this.babyElephantImage.src = 'images/baby_elephant.png';
        this.babyElephantLoaded = false;
        this.babyElephantImage.onload = () => {
            this.babyElephantLoaded = true;
        };
        
        // Load player sprite images
        this.playerImage = new Image();
        this.playerImage.src = 'images/player/player_forward_left.png';
        this.playerImageLoaded = false;
        this.playerImage.onload = () => {
            this.playerImageLoaded = true;
        };
        
        this.playerRunningImage = new Image();
        this.playerRunningImage.src = 'images/player/player_running_left_A.png';
        this.playerRunningImageLoaded = false;
        this.playerRunningImage.onload = () => {
            this.playerRunningImageLoaded = true;
        };
        
        this.init();
        this.setupLevel();
        
        // Make game instance globally accessible for player death handling
        window.game = this;
        
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
    }
    
    setupLevel() {
        // Create platforms for Level 1
        this.platforms = [
            // Starting area
            {x: 0, y: 550, width: 300, height: 50, type: 'grass'},
            {x: 350, y: 500, width: 100, height: 20, type: 'log'},
            {x: 500, y: 450, width: 150, height: 30, type: 'rock'},
            
            // Mid-section with varied heights
            {x: 700, y: 400, width: 120, height: 25, type: 'grass'},
            {x: 900, y: 350, width: 100, height: 20, type: 'log'},
            {x: 1050, y: 320, width: 80, height: 15, type: 'rock'},
            {x: 1200, y: 380, width: 150, height: 30, type: 'grass'},
            
            // Challenge section - moving platforms over ravine
            {x: 1400, y: 300, width: 80, height: 15, type: 'moving', moveRange: 100, moveSpeed: 1},
            {x: 1550, y: 250, width: 80, height: 15, type: 'moving', moveRange: 80, moveSpeed: -1.5},
            
            // Boss area - extended for baby elephant cage
            {x: 1700, y: 450, width: 400, height: 50, type: 'boss_platform'},
            
            // Small platforms in boss area
            {x: 1750, y: 350, width: 60, height: 15, type: 'rock'},
            {x: 1850, y: 320, width: 60, height: 15, type: 'rock'},
            {x: 1950, y: 350, width: 60, height: 15, type: 'rock'},
            {x: 2050, y: 380, width: 80, height: 20, type: 'rock'}
        ];
        
        // Add fruits
        this.addFruits();
        
        // Add enemies
        this.enemies = [
            new Enemy(400, 450, 'basic'),
            new Enemy(750, 350, 'basic'),
            new Enemy(1100, 270, 'patrol'),
            new Enemy(1250, 330, 'basic')
        ];
        
        // Create boss
        this.boss = new Boss(1800, 350);
    }
    
    addFruits() {
        const fruitPositions = [
            // Easy finds on main path
            {x: 150, y: 520}, {x: 250, y: 520}, {x: 380, y: 470},
            {x: 550, y: 420}, {x: 750, y: 370}, {x: 930, y: 320},
            {x: 1080, y: 290}, {x: 1250, y: 350}, {x: 1300, y: 350},
            
            // Risk/reward positions
            {x: 475, y: 400}, {x: 625, y: 380}, {x: 875, y: 300},
            {x: 1025, y: 270}, {x: 1175, y: 330}, {x: 1325, y: 300},
            
            // Hidden/secret positions
            {x: 50, y: 500}, {x: 200, y: 480}, {x: 525, y: 380},
            {x: 675, y: 350}, {x: 825, y: 280}, {x: 975, y: 250},
            
            // Boss area fruits
            {x: 1780, y: 320}, {x: 1880, y: 290}, {x: 1980, y: 320},
            
            // Additional fruits to reach 30
            {x: 300, y: 500}, {x: 600, y: 400}, {x: 800, y: 350},
            {x: 1000, y: 300}, {x: 1400, y: 270}, {x: 1600, y: 220}
        ];
        
        this.fruits = fruitPositions.map((pos, index) => 
            new Fruit(pos.x, pos.y, index < 5 ? 'golden' : 'regular')
        );
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.player.update(this.keys, this.platforms);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.platforms));
        
        // Update boss
        if (this.boss && !this.boss.defeated) {
            this.boss.update(this.player);
        }
        
        // Update moving platforms
        this.platforms.forEach(platform => {
            if (platform.type === 'moving') {
                if (!platform.originalX) platform.originalX = platform.x;
                platform.x += platform.moveSpeed;
                if (Math.abs(platform.x - platform.originalX) > platform.moveRange) {
                    platform.moveSpeed *= -1;
                }
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update camera
        this.updateCamera();
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
    }
    
    checkCollisions() {
        // Player vs fruits
        this.fruits = this.fruits.filter(fruit => {
            if (this.isColliding(this.player, fruit)) {
                this.collectFruit(fruit);
                return false;
            }
            return true;
        });
        
        // Player vs enemies (more forgiving collision for stomping)
        this.enemies.forEach((enemy, index) => {
            if (this.isColliding(this.player, enemy) && !enemy.defeated) {
                // More generous stomp detection - check if player is falling and above enemy's center
                const playerCenterY = this.player.y + this.player.height;
                const enemyCenterY = enemy.y + (enemy.height * 0.3); // Top 30% of enemy
                
                if (this.player.velocityY > 0 && playerCenterY < enemyCenterY) {
                    // Player jumping on enemy - successful stomp
                    this.defeatEnemy(enemy, index);
                    this.player.velocityY = -8; // Bounce
                    
                    // Ensure player doesn't fall through platform after bounce
                    if (this.player.onGround) {
                        this.player.y = Math.min(this.player.y, enemy.y - this.player.height);
                    }
                } else if (!this.player.invulnerable) {
                    // Player takes damage - but only if not in stomp position
                    const horizontalOverlap = Math.min(this.player.x + this.player.width, enemy.x + enemy.width) - 
                                            Math.max(this.player.x, enemy.x);
                    const verticalOverlap = Math.min(this.player.y + this.player.height, enemy.y + enemy.height) - 
                                          Math.max(this.player.y, enemy.y);
                    
                    // Only damage if significant overlap (not just touching edges)
                    if (horizontalOverlap > 10 && verticalOverlap > 10) {
                        this.player.takeDamage();
                    }
                }
            }
        });
        
        // Player vs boss (more forgiving collision)
        if (this.boss && !this.boss.defeated && this.isColliding(this.player, this.boss)) {
            const playerCenterY = this.player.y + this.player.height;
            const bossCenterY = this.boss.y + (this.boss.height * 0.3); // Top 30% of boss
            
            if (this.player.velocityY > 0 && playerCenterY < bossCenterY) {
                this.boss.takeDamage();
                this.player.velocityY = -8;
                this.score += 300;
                
                // Ensure player doesn't fall through platform after bounce
                if (this.player.onGround) {
                    this.player.y = Math.min(this.player.y, this.boss.y - this.player.height);
                }
                
                if (this.boss.health <= 0) {
                    this.defeatBoss();
                }
            } else if (!this.player.invulnerable) {
                // Only damage if significant overlap
                const horizontalOverlap = Math.min(this.player.x + this.player.width, this.boss.x + this.boss.width) - 
                                        Math.max(this.player.x, this.boss.x);
                const verticalOverlap = Math.min(this.player.y + this.player.height, this.boss.y + this.boss.height) - 
                                      Math.max(this.player.y, this.boss.y);
                
                if (horizontalOverlap > 15 && verticalOverlap > 15) {
                    this.player.takeDamage();
                }
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    collectFruit(fruit) {
        this.fruitsCollected++;
        this.score += fruit.type === 'golden' ? 50 : 10;
        this.updateUI();
        
        // Add particle effect
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(fruit.x + fruit.width/2, fruit.y + fruit.height/2, 'collect'));
        }
    }
    
    defeatEnemy(enemy, index) {
        enemy.defeated = true;
        this.score += enemy.type === 'patrol' ? 200 : 100;
        
        // 50% chance to drop fruit for basic, 100% for patrol
        if (Math.random() < (enemy.type === 'patrol' ? 1 : 0.5)) {
            this.fruits.push(new Fruit(enemy.x, enemy.y - 20, 'regular'));
            this.totalFruits++;
        }
        
        this.updateUI();
        
        // Add defeat particles
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'defeat'));
        }
    }
    
    defeatBoss() {
        this.boss.defeated = true;
        this.score += 1000;
        this.gameState = 'victory';
        this.updateUI();
        
        // Victory sequence handled by drawVictoryScreen
    }
    
    playerDied() {
        this.lives--;
        
        if (this.lives <= 0) {
            // Game over
            this.gameState = 'game_over';
        } else {
            // Respawn player
            this.player.respawn();
        }
        
        this.updateUI();
    }
    
    updateCamera() {
        // Follow player with some offset
        const targetX = this.player.x - this.canvas.width / 3;
        this.camera.x = Math.max(0, Math.min(targetX, this.levelWidth - this.canvas.width));
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('fruitCounter').innerHTML = `🍌 ${this.fruitsCollected}/${this.totalFruits}`;
        document.getElementById('livesCounter').textContent = `Lives: ${this.lives}`;
        
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            heart.style.opacity = index < this.player.health ? '1' : '0.3';
        });
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Save context for camera
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw platforms
        this.platforms.forEach(platform => this.drawPlatform(platform));
        
        // Draw fruits
        this.fruits.forEach(fruit => fruit.draw(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Draw baby elephant cage behind boss
        if (this.boss && this.babyElephantLoaded) {
            this.drawBabyElephantCage();
        }
        
        // Draw boss
        if (this.boss && !this.boss.defeated) {
            this.boss.draw(this.ctx);
        }
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI elements that don't move with camera
        if (this.gameState === 'victory') {
            this.drawVictoryScreen();
        } else if (this.gameState === 'game_over') {
            this.drawGameOverScreen();
        }
    }
    
    drawBackground() {
        if (this.backgroundLoaded) {
            // Calculate how many times to repeat the background image to cover the level width
            const imageWidth = this.backgroundImage.width;
            const imageHeight = this.backgroundImage.height;
            
            // Scale the image to fit the canvas height while maintaining aspect ratio
            const scale = this.canvas.height / imageHeight;
            const scaledWidth = imageWidth * scale;
            
            // Draw multiple copies of the background to create seamless scrolling
            const startX = Math.floor(this.camera.x / scaledWidth) * scaledWidth - this.camera.x;
            const numImages = Math.ceil(this.canvas.width / scaledWidth) + 2;
            
            for (let i = 0; i < numImages; i++) {
                const x = startX + (i * scaledWidth);
                this.ctx.drawImage(
                    this.backgroundImage,
                    x,
                    0,
                    scaledWidth,
                    this.canvas.height
                );
            }
        } else {
            // Fallback gradient background while image loads
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.6, '#FFE4B5');
            gradient.addColorStop(1, '#F4A460');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawPlatform(platform) {
        let color;
        switch (platform.type) {
            case 'grass': color = '#90EE90'; break;
            case 'rock': color = '#A0A0A0'; break;
            case 'log': color = '#8B4513'; break;
            case 'moving': color = '#FFD700'; break;
            case 'boss_platform': color = '#CD853F'; break;
            default: color = '#90EE90';
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add texture
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    drawVictoryScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Baby Elephant Rescued! 🐘', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('The animals need your help! 🦏', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.fillText('Press F5 to try again', this.canvas.width / 2, this.canvas.height / 2 + 80);
    }
    
    drawBabyElephantCage() {
        if (!this.boss) return;
        
        // Position the cage at a fixed location based on boss's original position
        // This keeps the cage stationary even when the boss charges around
        const cageX = this.boss.originalX + this.boss.width + 30;
        const cageY = this.boss.y + 20; // Use current Y position for platform alignment
        
        // Make the image large enough to be clearly visible
        const cageWidth = 120;
        const cageHeight = 120;
        
        this.ctx.drawImage(
            this.babyElephantImage,
            cageX,
            cageY,
            cageWidth,
            cageHeight
        );
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.health = 3;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.4;
        this.friction = 0.8;
        this.jumpPower = 8;
        this.jumpHeld = false;
        this.facingDirection = -1; // -1 for left (default), 1 for right
        this.isMoving = false;
    }
    
    update(keys, platforms) {
        // Handle horizontal input with realistic physics
        let inputDirection = 0;
        if (keys['a'] || keys['arrowleft']) {
            inputDirection = -1;
            this.facingDirection = -1; // Face left
        }
        if (keys['d'] || keys['arrowright']) {
            inputDirection = 1;
            this.facingDirection = 1; // Face right
        }
        
        // Track if player is moving (has significant velocity)
        this.isMoving = Math.abs(this.velocityX) > 0.5;
        
        // Apply acceleration or deceleration
        if (inputDirection !== 0) {
            // Player is pressing a direction
            if (Math.sign(this.velocityX) === inputDirection || this.velocityX === 0) {
                // Accelerating in same direction or starting from rest
                this.velocityX += inputDirection * this.acceleration;
            } else {
                // Changing direction - apply stronger deceleration first
                this.velocityX += inputDirection * this.acceleration * 2;
            }
            
            // Cap at max speed
            this.velocityX = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocityX));
        } else {
            // No input - apply friction
            if (this.onGround) {
                this.velocityX *= this.friction;
                // Stop very small movements to prevent endless sliding
                if (Math.abs(this.velocityX) < 0.1) {
                    this.velocityX = 0;
                }
            }
            // In air, apply much less friction
            else {
                this.velocityX *= 0.98;
            }
        }
        
        // Variable height jumping
        if ((keys['w'] || keys[' '] || keys['space']) && this.onGround) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.jumpHeld = true;
        }
        
        // Continue jump if button held and moving upward
        if (this.jumpHeld && (keys['w'] || keys[' '] || keys['space']) && this.velocityY < 0) {
            this.velocityY -= 0.2; // Additional upward force while held
        }
        
        // Release jump
        if (!(keys['w'] || keys[' '] || keys['space'])) {
            this.jumpHeld = false;
        }
        
        // Apply gravity
        this.velocityY += 0.5;
        if (this.velocityY > 15) this.velocityY = 15; // Terminal velocity
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Platform collision (Mario-style one-way platforms)
        this.onGround = false;
        this.standingOnPlatform = null;
        
        platforms.forEach(platform => {
            // Check horizontal overlap
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x) {
                
                // Only check for landing on top if falling down and coming from above
                const playerBottom = this.y + this.height;
                const playerPreviousBottom = playerBottom - this.velocityY;
                
                if (this.velocityY > 0 && 
                    playerPreviousBottom <= platform.y && 
                    playerBottom >= platform.y &&
                    playerBottom <= platform.y + 15) { // Slightly larger tolerance
                    // Landing on top from above
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                    this.standingOnPlatform = platform;
                }
            }
        });
        
        // Move with moving platform
        if (this.standingOnPlatform && this.standingOnPlatform.type === 'moving') {
            this.x += this.standingOnPlatform.moveSpeed;
        }
        
        // World boundaries
        if (this.x < 0) this.x = 0;
        
        // Get level width from game instance
        const game = window.game;
        if (game && this.x + this.width > game.levelWidth) {
            this.x = game.levelWidth - this.width;
        }
        if (this.y > 700) {
            // Fell off the world - this causes death
            this.die();
        }
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer--;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    takeDamage() {
        if (this.invulnerable) return;
        
        this.health--;
        this.invulnerable = true;
        this.invulnerabilityTimer = 120; // 2 seconds at 60fps
        
        if (this.health <= 0) {
            // Health depleted - player dies
            this.die();
        }
    }
    
    die() {
        // Player dies - lose a life and respawn
        const game = window.game; // Access the game instance
        game.playerDied();
    }
    
    respawn() {
        // Reset player state for respawn
        this.x = 100;
        this.y = 400;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 3;
        this.invulnerable = true;
        this.invulnerabilityTimer = 180; // 3 seconds of invulnerability after respawn
    }
    
    draw(ctx) {
        // Flash when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerabilityTimer / 10) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        this.drawSprite(ctx);
        
        ctx.globalAlpha = 1;
    }
    
    drawSprite(ctx) {
        const game = window.game;
        
        // Determine which sprite to use - running when moving, standing when not
        let currentImage = null;
        let imageLoaded = false;
        
        if (this.isMoving && game && game.playerRunningImageLoaded) {
            currentImage = game.playerRunningImage;
            imageLoaded = true;
        } else if (game && game.playerImageLoaded) {
            currentImage = game.playerImage;
            imageLoaded = true;
        }
        
        // If player image is loaded, use it; otherwise fallback to realistic sprite
        if (imageLoaded && currentImage) {
            ctx.save();
            
            // Handle horizontal flipping for right-facing direction
            if (this.facingDirection === 1) {
                // Flip horizontally for right-facing
                ctx.scale(-1, 1);
                ctx.drawImage(
                    currentImage,
                    -(this.x + this.width), // Flip the x position
                    this.y,
                    this.width,
                    this.height
                );
            } else {
                // Normal left-facing (default)
                ctx.drawImage(
                    currentImage,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            }
            
            ctx.restore();
        } else {
            // Fallback to realistic sprite if image not loaded
            this.drawRealisticSpriteFallback(ctx);
        }
    }
    
    drawRealisticSpriteFallback(ctx) {
        const x = this.x;
        const y = this.y;
        
        // Head (flesh tone)
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 20, y + 4, 24, 20);
        
        // Safari hat
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 16, y, 32, 8);
        ctx.fillRect(x + 12, y + 2, 40, 4);
        
        // Hat band
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 16, y + 4, 32, 2);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 24, y + 10, 2, 2);
        ctx.fillRect(x + 38, y + 10, 2, 2);
        
        // Nose
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(x + 30, y + 14, 4, 2);
        
        // Beard/mustache
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 26, y + 18, 12, 4);
        
        // Neck
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 26, y + 24, 12, 6);
        
        // Safari vest (khaki)
        ctx.fillStyle = '#C8B99C';
        ctx.fillRect(x + 16, y + 30, 32, 24);
        
        // Vest pockets
        ctx.fillStyle = '#B8A982';
        ctx.fillRect(x + 20, y + 34, 8, 6);
        ctx.fillRect(x + 36, y + 34, 8, 6);
        
        // Arms
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 8, y + 32, 8, 16);  // Left arm
        ctx.fillRect(x + 48, y + 32, 8, 16); // Right arm
        
        // Arm sleeves
        ctx.fillStyle = '#C8B99C';
        ctx.fillRect(x + 10, y + 32, 4, 12);
        ctx.fillRect(x + 50, y + 32, 4, 12);
        
        // Hands
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 8, y + 48, 8, 6);
        ctx.fillRect(x + 48, y + 48, 8, 6);
        
        // Belt
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 16, y + 54, 32, 4);
        
        // Belt buckle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 30, y + 54, 4, 4);
        
        // Legs (khaki pants)
        ctx.fillStyle = '#C8B99C';
        ctx.fillRect(x + 20, y + 58, 10, 6);  // Left leg
        ctx.fillRect(x + 34, y + 58, 10, 6);  // Right leg
        
        // Boots
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 18, y + 58, 14, 6);   // Left boot
        ctx.fillRect(x + 32, y + 58, 14, 6);   // Right boot
        
        // Binoculars around neck
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 24, y + 26, 4, 4);
        ctx.fillRect(x + 36, y + 26, 4, 4);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 26, y + 24);
        ctx.lineTo(x + 38, y + 24);
        ctx.stroke();
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 48;
        this.type = type;
        this.velocityX = type === 'patrol' ? 2 : 1;
        this.velocityY = 0;
        this.direction = 1;
        this.defeated = false;
        this.patrolDistance = type === 'patrol' ? 150 : 80;
        this.startX = x;
    }
    
    update(platforms) {
        if (this.defeated) return;
        
        // Find the platform the enemy is currently on
        let currentPlatform = null;
        platforms.forEach(platform => {
            if (this.x + this.width/2 >= platform.x &&
                this.x + this.width/2 <= platform.x + platform.width &&
                this.y + this.height >= platform.y - 5 &&
                this.y + this.height <= platform.y + platform.height + 5) {
                currentPlatform = platform;
            }
        });
        
        // Check if enemy would fall off platform edge
        let wouldFallOff = false;
        if (currentPlatform) {
            const nextX = this.x + (this.velocityX * this.direction);
            if (this.direction > 0) {
                // Moving right - check right edge
                if (nextX + this.width > currentPlatform.x + currentPlatform.width) {
                    wouldFallOff = true;
                }
            } else {
                // Moving left - check left edge
                if (nextX < currentPlatform.x) {
                    wouldFallOff = true;
                }
            }
        }
        
        // Turn around if would fall off or reached patrol distance
        if (wouldFallOff || Math.abs(this.x - this.startX) > this.patrolDistance) {
            this.direction *= -1;
        }
        
        // Move horizontally
        this.x += this.velocityX * this.direction;
        
        // Apply gravity
        this.velocityY += 0.5;
        this.y += this.velocityY;
        
        // Platform collision
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                }
            }
        });
    }
    
    draw(ctx) {
        if (this.defeated) return;
        
        this.drawRealisticSprite(ctx);
    }
    
    drawRealisticSprite(ctx) {
        const x = this.x;
        const y = this.y;
        
        // Head (darker skin tone for villains)
        ctx.fillStyle = '#DDB892';
        ctx.fillRect(x + 12, y + 2, 24, 16);
        
        // Camouflage cap
        ctx.fillStyle = '#2F4F2F';
        ctx.fillRect(x + 8, y, 32, 6);
        ctx.fillRect(x + 10, y + 2, 28, 4);
        
        // Camo pattern on cap
        ctx.fillStyle = '#1A3B1A';
        ctx.fillRect(x + 12, y + 2, 4, 2);
        ctx.fillRect(x + 20, y, 4, 2);
        ctx.fillRect(x + 28, y + 2, 4, 2);
        
        // Eyes (menacing)
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 16, y + 8, 2, 2);
        ctx.fillRect(x + 30, y + 8, 2, 2);
        
        // Scowl/frown
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 20, y + 14, 8, 2);
        
        // Neck
        ctx.fillStyle = '#DDB892';
        ctx.fillRect(x + 18, y + 18, 12, 4);
        
        // Camouflage shirt
        ctx.fillStyle = '#4F6F4F';
        ctx.fillRect(x + 12, y + 22, 24, 16);
        
        // Camo pattern on shirt
        ctx.fillStyle = '#2F4F2F';
        ctx.fillRect(x + 14, y + 24, 4, 4);
        ctx.fillRect(x + 22, y + 26, 6, 4);
        ctx.fillRect(x + 30, y + 24, 4, 4);
        ctx.fillRect(x + 16, y + 32, 4, 4);
        ctx.fillRect(x + 26, y + 34, 4, 2);
        
        // Arms
        ctx.fillStyle = '#DDB892';
        ctx.fillRect(x + 4, y + 24, 6, 12);  // Left arm
        ctx.fillRect(x + 38, y + 24, 6, 12); // Right arm
        
        // Sleeve camo
        ctx.fillStyle = '#4F6F4F';
        ctx.fillRect(x + 4, y + 24, 6, 8);
        ctx.fillRect(x + 38, y + 24, 6, 8);
        
        // Hands (holding weapons/tools)
        ctx.fillStyle = '#DDB892';
        ctx.fillRect(x + 4, y + 36, 6, 4);
        ctx.fillRect(x + 38, y + 36, 6, 4);
        
        // Belt
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 12, y + 38, 24, 2);
        
        // Pants (dark green)
        ctx.fillStyle = '#2F4F2F';
        ctx.fillRect(x + 16, y + 40, 8, 8);  // Left leg
        ctx.fillRect(x + 24, y + 40, 8, 8); // Right leg
        
        // Boots (black)
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 14, y + 44, 10, 4);   // Left boot
        ctx.fillRect(x + 24, y + 44, 10, 4);  // Right boot
        
        // Equipment based on type
        if (this.type === 'patrol') {
            // Net in hand
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 44, y + 28, 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Net handle
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 40, y + 32, 2, 8);
            
            // Larger size for patrol
            this.drawEquipmentBelt(ctx, x, y);
        } else {
            // Basic poacher - simple knife
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(x + 2, y + 32, 2, 6);
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + 2, y + 38, 2, 4);
        }
    }
    
    drawEquipmentBelt(ctx, x, y) {
        // Equipment pouches
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 14, y + 38, 4, 4);
        ctx.fillRect(x + 26, y + 38, 4, 4);
    }
}

class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 96;
        this.height = 96;
        this.health = 6;
        this.maxHealth = 6;
        this.defeated = false;
        this.attackTimer = 0;
        this.attackCooldown = 180; // 3 seconds
        this.phase = 1;
        this.chargeSpeed = 8;
        this.isCharging = false;
        this.chargeDirection = 1;
        this.originalX = x;
    }
    
    update(player) {
        if (this.defeated) return;
        
        this.attackTimer++;
        
        if (this.health <= 3 && this.phase === 1) {
            this.phase = 2;
            this.attackCooldown = 120; // Faster attacks in phase 2
        }
        
        if (this.attackTimer >= this.attackCooldown) {
            if (this.phase === 1) {
                this.throwNet(player);
            } else {
                this.charge();
            }
            this.attackTimer = 0;
        }
        
        if (this.isCharging) {
            this.x += this.chargeSpeed * this.chargeDirection;
            if (this.x < this.originalX - 100 || this.x > this.originalX + 100) {
                this.chargeDirection *= -1;
            }
            if (Math.abs(this.x - this.originalX) < 10) {
                this.isCharging = false;
            }
        }
    }
    
    throwNet(player) {
        // Simple net throwing animation (visual only for now)
        console.log('Boss throws net!');
    }
    
    charge() {
        this.isCharging = true;
        this.chargeDirection = this.x < this.originalX ? 1 : -1;
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.defeated = true;
        }
    }
    
    draw(ctx) {
        if (this.defeated) return;
        
        // Flash when hit
        if (this.attackTimer < 10) {
            ctx.globalAlpha = 0.7;
        }
        
        this.drawRealisticSprite(ctx);
        
        // Health bar
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y - 15, this.width, 5);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x, this.y - 15, (this.width * this.health) / this.maxHealth, 5);
        
        ctx.globalAlpha = 1;
    }
    
    drawRealisticSprite(ctx) {
        const x = this.x;
        const y = this.y;
        
        // Head (tanned, weathered skin)
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x + 24, y + 6, 48, 32);
        
        // Safari hat (wide brim)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 16, y, 64, 12);
        ctx.fillRect(x + 12, y + 4, 72, 8);
        
        // Hat band
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 20, y + 6, 56, 4);
        
        // Feather in hat
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 76, y + 2, 4, 16);
        
        // Eyes (intimidating)
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 32, y + 16, 4, 4);
        ctx.fillRect(x + 56, y + 16, 4, 4);
        
        // Eyebrows (thick, menacing)
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 30, y + 14, 8, 2);
        ctx.fillRect(x + 54, y + 14, 8, 2);
        
        // Mustache (large)
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 36, y + 24, 24, 6);
        
        // Scar on face
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x + 28, y + 12, 2, 16);
        
        // Neck
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x + 36, y + 38, 24, 8);
        
        // Safari vest (dirty khaki)
        ctx.fillStyle = '#B8A982';
        ctx.fillRect(x + 20, y + 46, 56, 36);
        
        // Vest details
        ctx.fillStyle = '#A0906C';
        ctx.fillRect(x + 24, y + 50, 12, 8);  // Left pocket
        ctx.fillRect(x + 60, y + 50, 12, 8);  // Right pocket
        ctx.fillRect(x + 40, y + 50, 16, 28); // Center opening
        
        // Arms (muscular)
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x + 4, y + 48, 12, 24);  // Left arm
        ctx.fillRect(x + 80, y + 48, 12, 24); // Right arm
        
        // Sleeves
        ctx.fillStyle = '#B8A982';
        ctx.fillRect(x + 6, y + 48, 8, 16);
        ctx.fillRect(x + 82, y + 48, 8, 16);
        
        // Hands (large, intimidating)
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x + 4, y + 72, 12, 8);
        ctx.fillRect(x + 80, y + 72, 12, 8);
        
        // Weapon in hand (whip)
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 76);
        ctx.lineTo(x - 10, y + 90);
        ctx.stroke();
        
        // Belt (thick leather)
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 20, y + 82, 56, 6);
        
        // Belt buckle (large)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 44, y + 80, 8, 10);
        
        // Pants (dark safari)
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 28, y + 88, 16, 8);  // Left leg
        ctx.fillRect(x + 52, y + 88, 16, 8);  // Right leg
        
        // Boots (tall, leather)
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 24, y + 88, 24, 8);  // Left boot
        ctx.fillRect(x + 48, y + 88, 24, 8);  // Right boot
        
        // Boot buckles
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 28, y + 90, 4, 2);
        ctx.fillRect(x + 36, y + 90, 4, 2);
        ctx.fillRect(x + 52, y + 90, 4, 2);
        ctx.fillRect(x + 60, y + 90, 4, 2);
        
        // Equipment pouches
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 16, y + 70, 8, 12);   // Left pouch
        ctx.fillRect(x + 72, y + 70, 8, 12);  // Right pouch
    }
}

class Fruit {
    constructor(x, y, type = 'regular') {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobAmount = 3;
    }
    
    draw(ctx) {
        const bobY = this.y + Math.sin(Date.now() * 0.005 + this.bobOffset) * this.bobAmount;
        
        if (this.type === 'golden') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x, bobY, this.width, this.height);
            // Add sparkle effect
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 2, bobY + 2, 2, 2);
            ctx.fillRect(this.x + 12, bobY + 6, 2, 2);
            ctx.fillRect(this.x + 6, bobY + 12, 2, 2);
        } else {
            // Regular fruit - banana
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, bobY + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 6;
        this.velocityY = (Math.random() - 0.5) * 6;
        this.life = 60;
        this.maxLife = 60;
        this.type = type;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.1; // Gravity
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        
        if (this.type === 'collect') {
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        } else {
            ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
        }
        
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Start the game
const game = new Game();