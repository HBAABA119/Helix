document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const bird = document.getElementById('bird');
    const pipesContainer = document.getElementById('pipesContainer');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const gameOverScreen = document.getElementById('gameOver');
    const startScreen = document.getElementById('startScreen');
    const finalScore = document.getElementById('finalScore');
    const restartBtn = document.getElementById('restartBtn');
    const startBtn = document.getElementById('startBtn');
    
    // Game variables
    let birdY = 250;
    let birdVelocity = 0;
    let birdGravity = 0.5;
    let gameRunning = false;
    let score = 0;
    let pipes = [];
    let frameCount = 0;
    let pipeInterval = 150; // frames between pipes
    
    // Initialize clouds
    function createClouds() {
        const sky = document.querySelector('.sky');
        for (let i = 0; i < 3; i++) {
            const cloud = document.createElement('div');
            cloud.classList.add('cloud');
            sky.appendChild(cloud);
        }
    }
    
    // Start game
    function startGame() {
        gameRunning = true;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        birdY = 250;
        birdVelocity = 0;
        score = 0;
        scoreDisplay.textContent = score;
        pipes = [];
        pipesContainer.innerHTML = '';
        frameCount = 0;
        
        // Position bird
        bird.style.top = birdY + 'px';
        bird.style.transform = 'rotate(0deg)';
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        finalScore.textContent = score;
        gameOverScreen.style.display = 'flex';
    }
    
    // Create pipes
    function createPipes() {
        const gap = 200; // Gap between top and bottom pipes
        const pipeHeight = Math.floor(Math.random() * 200) + 50; // Random height for top pipe
        
        // Top pipe
        const topPipe = document.createElement('div');
        topPipe.classList.add('pipe', 'top');
        topPipe.style.height = pipeHeight + 'px';
        topPipe.style.left = '400px';
        topPipe.style.animation = 'pipeMove 4s linear infinite';
        
        // Bottom pipe
        const bottomPipe = document.createElement('div');
        bottomPipe.classList.add('pipe', 'bottom');
        bottomPipe.style.height = (600 - pipeHeight - gap - 120) + 'px'; // 120 is ground height
        bottomPipe.style.left = '400px';
        bottomPipe.style.animation = 'pipeMove 4s linear infinite';
        
        pipesContainer.appendChild(topPipe);
        pipesContainer.appendChild(bottomPipe);
        
        // Store pipe data
        pipes.push({
            top: topPipe,
            bottom: bottomPipe,
            passed: false,
            x: 400
        });
    }
    
    // Update bird position
    function updateBird() {
        birdVelocity += birdGravity;
        birdY += birdVelocity;
        
        // Apply position
        bird.style.top = birdY + 'px';
        
        // Rotate bird based on velocity
        let rotation = birdVelocity * 2;
        if (rotation > 90) rotation = 90;
        if (rotation < -30) rotation = -30;
        bird.style.transform = `rotate(${rotation}deg)`;
        
        // Check collision with ground
        if (birdY > 480) { // Ground starts at 480px (600px total - 120px ground)
            birdY = 480;
            gameOver();
        }
        
        // Check collision with ceiling
        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
        }
    }
    
    // Update pipes
    function updatePipes() {
        // Move existing pipes
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            pipe.x -= 2; // Move pipes to the left
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x < 80) { // Bird is at 80px
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = score;
            }
            
            // Remove pipes that are off screen
            if (pipe.x < -100) {
                pipesContainer.removeChild(pipe.top);
                pipesContainer.removeChild(pipe.bottom);
                pipes.splice(i, 1);
                i--;
            }
        }
        
        // Create new pipes
        frameCount++;
        if (frameCount >= pipeInterval) {
            createPipes();
            frameCount = 0;
            
            // Gradually increase difficulty
            if (pipeInterval > 80) {
                pipeInterval -= 2;
            }
        }
    }
    
    // Check collisions
    function checkCollisions() {
        const birdRect = {
            x: 80,
            y: birdY,
            width: 50,
            height: 35
        };
        
        for (const pipe of pipes) {
            const topPipeRect = {
                x: pipe.x,
                y: 0,
                width: 70,
                height: parseInt(pipe.top.style.height)
            };
            
            const bottomPipeRect = {
                x: pipe.x,
                y: 600 - 120 - parseInt(pipe.bottom.style.height),
                width: 70,
                height: parseInt(pipe.bottom.style.height)
            };
            
            // Collision detection
            if (
                birdRect.x < topPipeRect.x + topPipeRect.width &&
                birdRect.x + birdRect.width > topPipeRect.x &&
                birdRect.y < topPipeRect.y + topPipeRect.height
            ) {
                gameOver();
                return;
            }
            
            if (
                birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
                birdRect.x + birdRect.width > bottomPipeRect.x &&
                birdRect.y + birdRect.height > bottomPipeRect.y
            ) {
                gameOver();
                return;
            }
        }
    }
    
    // Game loop
    function gameLoop() {
        if (gameRunning) {
            updateBird();
            updatePipes();
            checkCollisions();
        }
        requestAnimationFrame(gameLoop);
    }
    
    // Event listeners
    function flap() {
        if (gameRunning) {
            birdVelocity = -10;
            bird.classList.add('flap');
            setTimeout(() => bird.classList.remove('flap'), 100);
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            flap();
        }
    });
    
    document.addEventListener('click', () => {
        if (gameRunning) {
            flap();
        }
    });
    
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    // Initialize game
    createClouds();
    gameLoop();
});