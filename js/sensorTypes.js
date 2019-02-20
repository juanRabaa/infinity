// =============================================================================
// From the bottom left corner to the top right corner
// =============================================================================
var bottomLeftToTopRight = {
    initialize: function(sensor, ctx){
        let canvas = ctx.canvas;
        sensor.setInfo({
            x: 0,
            y: canvas.height,
            endX: 0,
            endY: canvas.height,
            speed: 0,
        });
    },
    update: function(sensor, ctx, duration){
        let canvas = ctx.canvas;
        let endxIncrement = canvas.width / duration;
        let yIncrement = canvas.height / duration;
        let newEndX = sensor.options.endX + endxIncrement;
        let newY = sensor.options.y - yIncrement;
        //console.log(canvas);
        sensor.changePosition({
            x: 0,
            y: newY,
            endX: newEndX,
            endY: canvas.height,
        });
    },
    isFinished: function(sensor, ctx, duration){
        let canvas = ctx.canvas;
        let endxIncrement = (canvas.width / duration) * 2;
        let yIncrement = (canvas.height / duration) * 2;
        return (sensor.options.y + yIncrement < - canvas.height) && (sensor.options.endX - endxIncrement > canvas.width * 2);
    },
    collisionWithParticle: function(sensor, particle){
        let collision = false;
        if( collisionDetector.trianglePoint(0, sensor.options.y, sensor.options.endX, sensor.options.endY, 0, sensor.options.endY, particle.x, particle.y) )
            collision = true;
        return collision;
    }
}

// =============================================================================
// From left to right
// =============================================================================
var leftToRight = {
    initialize: function(sensor, ctx){
        let canvas = ctx.canvas;
        sensor.setInfo({
            x: 0,
            y: 0,
            endX: 0,
            endY: canvas.height,
            speed: 0,
        });
    },
    update: function(sensor, ctx, duration){
        //console.log(sensor);
        let canvas = ctx.canvas;
        let xIncrement = canvas.width / duration;
        //console.log(canvas);
        sensor.changePosition({
            x: sensor.options.x + xIncrement,
            endX: sensor.options.endX + xIncrement,
        });
    },
    isFinished: function(sensor, ctx, duration){
        let canvas = ctx.canvas;
        let xIncrement = (canvas.width / duration) * 2;
        return (sensor.options.x > canvas.width + xIncrement);
    },
    collisionWithParticle: function(sensor, particle){
        let collision = false;
        let sensorRect = {
            x: 0,
            y: 0,
            width: sensor.options.endX,
            height: sensor.options.endY,
        };
        //console.log(particle, sensorRect);
        if( collisionDetector.rectRect(particle, sensorRect) )
            collision = true;
        return collision;
    }
}

// =============================================================================
// From top left corner to top right corner
// =============================================================================
var topLeftToTopRight = {
    initialize: function(sensor, ctx){
        let canvas = ctx.canvas;
        sensor.setInfo({
            x: 0,
            y: 0,
            endX: 0,
            endY: canvas.height,
            speed: 0,
        });
    },
    update: function(sensor, ctx, duration){
        let canvas = ctx.canvas;
        let endxIncrement = canvas.width / duration;
        let yIncrement = canvas.height / duration;
        let newEndY = canvas.height;
        let newEndX = sensor.options.endX;

        //If the endX reached the end of the canvas width, increase endY
        if( sensor.options.endX >= canvas.width ){
            newEndY = sensor.options.endY - yIncrement;
        }
        //If the endX hasn't reach the canvas width + something (just in case) increase endX
        if( sensor.options.endX < canvas.width * 100 ){
            newEndX = sensor.options.endX + endxIncrement;
        }

        //console.log(newEndY);
        sensor.changePosition({
            x: 0,
            y: 0,
            endX: newEndX,
            endY: newEndY,
        });
    },
    isFinished: function(sensor, ctx, duration){
        let canvas = ctx.canvas;
        let endxIncrement = (canvas.width / duration) * 2;
        let yIncrement = (canvas.height / duration) * 2;
        return (sensor.options.endY < 0) && (sensor.options.endX  > canvas.width);
    },
    collisionWithParticle: function(sensor, particle){
        let collision = false;
        if( collisionDetector.trianglePoint(0, 0, sensor.options.endX, sensor.options.endY, 0, sensor.options.endY, particle.x, particle.y) )
            collision = true;
        if( collisionDetector.trianglePoint(0, 0, sensor.options.endX, sensor.options.endY, 0, sensor.options.endY, particle.x + particle.width, particle.y) )
            collision = true;
        if( collisionDetector.trianglePoint(0, 0, sensor.options.endX, sensor.options.endY, 0, sensor.options.endY, particle.x, particle.y + particle.height) )
            collision = true;
        if( collisionDetector.trianglePoint(0, 0, sensor.options.endX, sensor.options.endY, 0, sensor.options.endY, particle.x + particle.width, particle.y + particle.height) )
            collision = true;
        return collision;
    }
}
