class Entity {
  constructor( element ) {
    this.element = element;
    this.remove = false;
    this.init();
  }
  
  init() {}
  
  update() {}
  
  draw() {}
}

class GameEngine {
  constructor( fps ) {
    this.fps = fps;
    this.entities = new Map();
    this.paused = false;
    this.config = {};
  }
  
  addEntity( identifier, entity ) {
    this.entities.set( identifier, entity );
  }
  
  pause() {
    this.paused = true;
  }
  
  unpause() {
    this.paused = false;
  }
  
  loop() {
    // save a copy of this object so we can reference it in setInterval function
    var _this = this;
    
    // start the core game loop
    setInterval(
      function() {
        // check if the game is paused
        if( !_this.paused ) {
          // loop through all the entities
          _this.entities.forEach( function( entity, key ) {
            // update information as needed
            entity.update();

            // remove things if they don't need to be there anymore
            if( entity.remove ) {
              entity.element.addClass( 'hidden' );
              _this.entities.delete( key );
            }
            // otherwise, draw them on the page
            else {
              entity.draw();
            }
          });
        }
      },
      1000 / this.fps
    );
  }
}