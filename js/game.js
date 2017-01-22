class Ball extends Entity {
  init() {
    this.speed = 3;
    this.diameter = 10;
    this.verticalDirection = 'up';
    this.horizontalDirection = 'right';
  }
  
  hitPlayerPaddle() {
    var player = Game.entities.get( 'player' );
    var oBallOffset = this.element.offset();
    var oPaddleOffset = player.element.offset();
    return oBallOffset.left <= player.width && oBallOffset.top >= oPaddleOffset.top && oBallOffset.top <= oPaddleOffset.top + player.height;
  }
  
  hitAIPaddle() {
    var oBallOffset = this.element.offset();
    var oPaddleOffset = Game.entities.get( 'ai' ).element.offset();
    return oBallOffset.left + Game.entities.get( 'ai' ).width >= $(window).width() - Game.entities.get( 'ai' ).width && oBallOffset.top >= oPaddleOffset.top && oBallOffset.top <= oPaddleOffset.top + Game.entities.get( 'ai' ).height;
  }
  
  update() {
    // setup variables
    var oOffset  = this.element.offset();
    var iNewTop  = oOffset.top;
    var iNewLeft = oOffset.left;

    // check which direction it's currently heading
    if( this.verticalDirection == 'up' ) {
      // assume we're going to go to the next spot
      iNewTop -= this.speed;

      // change direction if needed
      if( iNewTop <= 0 ) {
        iNewTop = 0;
        this.verticalDirection = 'down';
      }
    }
    else {
      // assume we're going to go to the next spot
      iNewTop += this.speed;

      // change direction if needed
      if( iNewTop >= $(window).height() - this.diameter ) {
        iNewTop = $(window).height() - this.diameter;
        this.verticalDirection = 'up';
      }
    }

    // check which direction it's currently heading
    if( this.horizontalDirection == 'left' ) {
      // assume we're going to the next spot
      iNewLeft -= this.speed;

      // check if the ball hit the player paddle,
      // if so change direction
      if( this.hitPlayerPaddle() ) {
        iNewLeft = Game.entities.get( 'player' ).width;
        this.horizontalDirection = 'right';
      }

      // check if the AI scored
      if( iNewLeft <= 0 ) {
        // increment ai score
        var aiScore = Game.entities.get( 'ai-score' );
        aiScore.score++;

        // end game if needed
        if( aiScore.score >= Game.config.scoreToWin ) {
          Game.pause();
          var gameOver = new GameOverMenu( $( '#game-over' ) );
          Game.addEntity( 'gameOver', gameOver );
        }

        // resposition ball
        iNewTop  = Game.entities.get( 'player' ).element.offset().top + ( Game.entities.get( 'player' ).height / 2 );
        iNewLeft = Game.entities.get( 'player' ).width;
        this.horizontalDirection = 'right';
      }
    }
    else {
      // asuume we're going to the next spot
      iNewLeft += this.speed;

      // check if the ball hit the AI paddle
      if( this.hitAIPaddle() ) {
        iNewLeft = $(window).width() - Game.entities.get( 'ai' ).width - this.diameter;
        this.horizontalDirection = 'left';
      }

      // check if the player scored
      if( iNewLeft + this.diameter >= $(window).width() ) {
        // increment player score and update it on the page
        var playerScore = Game.entities.get( 'player-score' );
        playerScore.score++;

        // end game if needed
        if( playerScore.score >= Game.config.scoreToWin ) {
          Game.pause();
          var gameOver = new GameOverMenu( $( '#game-over' ) );
          Game.addEntity( 'gameOver', gameOver );
        }

        // resposition ball
        iNewTop  = Game.entities.get( 'ai' ).element.offset().top + ( Game.entities.get( 'ai' ).height / 2 );
        iNewLeft = $(window).width() - Game.entities.get( 'ai' ).width;
        this.horizontalDirection = 'right';
      }
    }

    // update the positions
    var oNewOffset = { top: iNewTop, left: iNewLeft };
    this.element.offset( oNewOffset );
  }
}

class Score extends Entity {
  init() {
    this.score = 0;
  }
  
  draw() {
    this.element.html( this.score );
  }
}

class Paddle extends Entity {
  init() {
    this.height = 70;
    this.width = 10;
    this.speed = 30;
    this.score = 0;
  }
}

class Player extends Paddle {
  init() {
    super.init();

    var _this = this;
    
    $('body').keydown(function(e){
      var oOffset, iNewTop, oNewOffset;
      
      // move player paddle up
      if( e.which == 87 ) {
        oOffset = _this.element.offset();
        iNewTop = oOffset.top - _this.speed;
        if( iNewTop <= 0 ) {
          iNewTop = 0;
        }
        oNewOffset = { top: iNewTop, left: 0 };
        _this.element.offset( oNewOffset );
      }

      // move player paddle down
      if( e.which == 83 ) {
        oOffset = _this.element.offset();
        iNewTop = oOffset.top + _this.speed;
        if( iNewTop >= $(window).height() - _this.height ) {
          iNewTop = $(window).height() - _this.height;
        }
        oNewOffset = { top: iNewTop, left: 0 };
        _this.element.offset( oNewOffset );
      }
    });
  }
}

class AI extends Paddle {
  init() {
    super.init();
    
    this.waiting = false;
  }
  
  update() {
    if( !this.waiting ) {
      var iWaitTime = Math.round( Math.random() * 20 ) + 1 + 150;
      setTimeout( this.calculateAIPaddlePosition, iWaitTime );
      this.waiting = true;
    }
  }
  
  calculateAIPaddlePosition() {
    var ai = Game.entities.get( 'ai' );
    var ball = Game.entities.get( 'ball' );

    var oOffset = ai.element.offset();
    var oBallOffset = ball.element.offset();
   
    // figure out the next position
    var iNewTop = oOffset.top;
    if( ball.horizontalDirection == 'right' ) {
      if( oBallOffset.top < iNewTop ) {
        iNewTop = iNewTop - ai.speed;
      }
      if( oBallOffset.top + ball.diameter > iNewTop + ai.height ) {
        iNewTop = iNewTop + ai.speed;
      }
    }
    
    // make sure it can't go farther up than the baseline
    if( iNewTop < 0 ) {
      iNewTop = 0;
    }
    
    // make sure it can't go farther down than its height
    if( iNewTop >= $(window).height() - ai.height ) {
      iNewTop = $(window).height() - ai.height;
    }
    
    // update the position
    var oNewOffset = { top: iNewTop, left: oOffset.left };
    ai.element.offset( oNewOffset );
    
    // we're no longer waiting
    ai.waiting = false;
  }
}

class GameScreen extends Entity {
  init() {
    // show the screen
    this.element.removeClass( 'hidden' );
    
    // create the ball
    var ball = new Ball( $( '#ball' ) );
    
    // create the player paddle
    var player = new Player( $( '#player-paddle' ) );

    // create the ai paddle
    var ai = new AI( $( '#ai-paddle' ) );
    
    // create the scores
    var playerScore = new Score( $( '#player-score' ) );
    var aiScore = new Score( $( '#ai-score' ) );
    
    // add all entities to the game
    Game.addEntity( 'player', player );
    Game.addEntity( 'ai', ai );
    Game.addEntity( 'ball', ball );
    Game.addEntity( 'player-score', playerScore );
    Game.addEntity( 'ai-score', aiScore );
  }
}

class StartMenu extends Entity {
  init() {
    // save a reference to this entity
    var _this = this;
    
    // set what happens when the start button is clicked
    $( '#start-btn' ).on('click', function(){
      // when the start button is clicked, remove this entity from the game
      _this.remove = true;
      
      // create the game window and add it to the list of entities for the game to manage
      var game = new GameScreen( $( '#game' ) );
      Game.addEntity( 'game-screen', game );
    });
  }
}

class GameOverMenu extends Entity {
  init() {
    // stop the player from moving the paddle
    $( 'body' ).unbind();
    
    // show the menu
    $( '#game-over' ).removeClass( 'hidden' );
    
    // save a reference to this entity
    var _this = this;
    
    // set what happens when the start button is clicked
    $( '#restart' ).on('click', function(){
      // when the start button is clicked, remove this entity from the game
      _this.remove = true;
      
      // remove all the other entities
      Game.entities.forEach(function(entity, key){
        _this.remove = true;
      });
      Game.unpause();
      
      // create the game window and add it to the list of entities for the game to manage
      var game = new GameScreen( $( '#game' ) );
      Game.addEntity( 'game-screen', game );
    });
  }
}

var Game;
$(document).ready(function(){
  // initialize the game
  Game = new GameEngine( 60 );
  Game.config.scoreToWin = 10;

  // add the start menu
  var start = new StartMenu( $( '#menu' ) );
  Game.addEntity( 'start', start );

  // start the game loop
  Game.loop();
});