// styling of Board starts
/*This define the width and height of the the game */
let board;
let boardWidth = 550;
let boardHeight = 576;
let context; //-------> this will store the canvas 2D drawing context, which will allow drawing images, shape and text
//styling of Board ends



// Start of Doodler
//This defines the character size
let doodlerWidth = 50;
let doodlerHeight = 50;
let doodlerStartX = boardWidth / 2 - doodlerWidth / 2; //-----> This is used to center the doodler
let doodlerStartY = boardHeight * 7/8 - doodlerHeight; //-----> Thsi is to place the doodler near the bottom of the screen
// eND of Doodler

//This will be the object that will be storing all doolder properties, image, position and size
let doodler = {
    img: null,
    x: doodlerStartX,
    y: doodlerStartY,
    width: doodlerWidth,
    height: doodlerHeight
};
//------------------------


//This are variables that will store the ddoler facing right and left
let doodlerRightImg; //------> this is for the doodler facing right
let doodlerLeftImg;//------> this is for the doolder facing left
//--------------------------------------


// Physics
//This for the horizontal and vertical spped of the doodler
let velocityX = 0;//------> horizontal movement (left <-> right)
let velocityY = 0;//------> vertical movement (up <-> down)
let jumpVelocity = -12; //------> this means it will move upwards but depends on how high you want it
let gravity = 0.4; //------> this determines how fast the doodler will take to come down
//--------------------------------------


// Game state
let score = 0; //-----> This tracks the number of platform bounces
let gameOver = false; //----> this tells us whether the game is finished (its set as false because the game has not ended yet when it begins)
//--------------------------------------


// Platforms
let platformArray = []; //-----> This will store all plateform objects
//platformWidth and platformHeight basically tell us the sizes of the platform
let platformWidth = 75;
let platformHeight = 25;
let platformImg; //-----> this will store the image used for the plateforms
let scrollSpeed = 4; //------> This meant for for scrolling difficulty
//--------------------------------------


// INIT
//Thsi runs after the browser loads the page
window.onload = function() {
    board = document.getElementById("board"); //------> This gets the canvas id element
    //board.width and board.height  this sets the canvas sizes
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //------> this gets the drawing context used to render images

    // Load images
//This basically creates and loads the doodler facing right
    doodlerRightImg = new Image();
    doodlerRightImg.src = "Images/doodlerRight.jpg";
//----------------------

//This basically creates and loads the doodler facing left
    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "Images/doodlerLeft.png";
//----------------------------------

//this loads the platform images
    platformImg = new Image();
    platformImg.src = "Images/PlatForm.png";

    // Wait until all images are loaded
    let imagesLoaded = 0;
    [doodlerRightImg, doodlerLeftImg, platformImg].forEach(img => {
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === 3) startGame();
        };
    });
};


//this only gets called once the images are ready
function startGame() {
    doodler.img = doodlerRightImg; //-------> this the initial direction, which is the doodler facing right
    velocityY = jumpVelocity; // this makes the doodler jump at the start of the game
    placePlatforms(); //this creates the initial platform arrangement

    requestAnimationFrame(update); //this starts the game loop
    document.addEventListener("keydown", moveDoodler); //this listens for players input
}
//--------------------------------------


// GAME LOOP
function update() {
    if (gameOver) return; //this stops updating when the game ends

    requestAnimationFrame(update); //-----> this schedules the next frame
    context.clearRect(0, 0, boardWidth, boardHeight); // tit erases the previous frame before drawing the next one.
//---------------------------


    // Move doodler horizontally
    //---------------------------
    doodler.x += velocityX;//------> this applies a horizontal velocity
    if (doodler.x > boardWidth) doodler.x = -doodler.width; //If velocityX > 0 → doodler moves right
    else if (doodler.x < -doodler.width) doodler.x = boardWidth; // If velocityX < 0 → doodler moves left
    //---------------------------


    // Apply gravity
    //---------------------------
    velocityY += gravity; //VelocityY keeps track of the doodler’s vertical speed at every moment.
    doodler.y += velocityY; //This makes the doodler slow down as it jumps up and speed up as it falls down

    // Game over condition
    //If the doodler falls below screen ----> its game over
    if (doodler.y > boardHeight) {
        gameOver = true;
    }
//---------------------------


    // Platform scrolling
 //This checks if the doodler has moved above 60% of the screen height
//Purpose: Instead of letting the doodler go higher on the screen, we keep it near the middle/top visually and scroll the platforms downward   
    if (doodler.y < boardHeight * 0.5) {
        let diff = boardHeight * 0.5 - doodler.y;
        doodler.y = boardHeight * 0.5;

        platformArray.forEach(platform => {
            platform.y += diff;
        });
    }
 //---------------------------


    // Collision detection
    //---------------------------
    platformArray.forEach(platform => {
        if (
            velocityY > 0 && // falling only
            doodler.x + doodler.width > platform.x &&
            doodler.x < platform.x + platform.width &&
            doodler.y + doodler.height > platform.y &&
            doodler.y + doodler.height < platform.y + platform.height
        ) {
            velocityY = jumpVelocity;
            score++;
        }
//this checks if the doodler lands on top of a platform while falling

        context.drawImage(
            platform.img,
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
    });
//this draws each platform
//---------------------------


    // Remove off-screen platforms
    //so if the first platform moved below the screen:
    //remove it and add a new one at the top
    while (platformArray.length > 0 && platformArray[0].y > boardHeight) {
        platformArray.shift();
        newPlatform();
    }
//---------------------------


    // Draw doodler
    //this basically renders the doodlder 
    context.drawImage(
        doodler.img,
        doodler.x,
        doodler.y,
        doodler.width,
        doodler.height
    );
//---------------------------


    // Draw score
    //this is to display the score at the top left corner of the screen
    context.fillStyle = "black";
    context.font = "20px sans-serif";
    context.fillText("Score: " + score, 10, 25);
    //---------------------------


    // Game Over Message
    if (gameOver) {
        context.font = "22px sans-serif";
        context.fillText(
            "Game Over! Press Space to restart",
            boardWidth / 18,
            boardHeight / 2
        );
    }
}
//--------------------------------------


// CONTROLS
//this handles the player input to move the doodler left and right
function moveDoodler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code === "Space" && gameOver) {
        restartGame();
        requestAnimationFrame(update);
    }
}
//-------------------------------------



// PLATFORM GENERATION
function placePlatforms() {
    platformArray = [];
    platformArray.push({
        img: platformImg,
        x: boardWidth / 2 - platformWidth / 2,
        y: boardHeight - 60,
        width: platformWidth,
        height: platformHeight
    });
//this will help centered the first platform near the bottom

//this creates 7 more platforms spaced upward by 80px width randown x positions
    for (let i = 1; i < 8; i++) {
        let randomX = Math.random() * (boardWidth - platformWidth);
        let platformY = boardHeight - i * 80;
        platformArray.push({
            img: platformImg,
            x: randomX,
            y: platformY,
            width: platformWidth,
            height: platformHeight
        });
    }
}

//new platform when one leaves screen
function newPlatform() {
    let randomX = Math.random() * (boardWidth - platformWidth);
    platformArray.push({
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    });
}
//--------------------------------------


// RESTART GAME
//--------------------------------------
function restartGame() {
    doodler.x = doodlerStartX;
    doodler.y = doodlerStartY;
    velocityX = 0;
    velocityY = jumpVelocity;

    score = 0;
    gameOver = false;
    placePlatforms();
}
