var collisionDetector = {
    lineLine: function(lineA, lineB){
        let colliding = false;
        let uA = ((lineB.endX-lineB.x)*(lineA.y-lineB.y) - (lineB.endY-lineB.y)*(lineA.x-lineB.x)) / ((lineB.endY-lineB.y)*(lineA.endX-lineA.x) - (lineB.endX-lineB.x)*(lineA.endY-lineA.y));
        let uB = ((lineA.endX-lineA.x)*(lineA.y-lineB.y) - (lineA.endY-lineA.y)*(lineA.x-lineB.x)) / ((lineB.endY-lineB.y)*(lineA.endX-lineA.x) - (lineB.endX-lineB.x)*(lineA.endY-lineA.y));
        // if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1)
          colliding = true;

        return colliding;
    },
    lineRect: function(line, rect){
        let leftSide =   {x: rect.x, y: rect.y, endX: rect.x, endY: rect.y + rect.height};
        let rightSide =  {x: rect.x + rect.width, y: rect.y, endX: rect.x, endY: rect.y + rect.height};
        let topSide =    {x: rect.x, y: rect.y, endX: rect.x + rect.width, endY: rect.y + rect.height};
        let bottomSide = {x: rect.x, y: rect.y + rect.height, endX: rect.x + rect.width, endY: rect.y};

        if( this.lineLine(line, leftSide) )
            return true;
        if( this.lineLine(line, rightSide) )
            return true;
        if( this.lineLine(line, topSide) )
            return true;
        if( this.lineLine(line, bottomSide) )
            return true;

        return false;
    },
    //Polygon array of vertices
    polygonPoint: function(vertices, point){
        let collision = false;

        // go through each of the vertices, plus
        // the next vertex in the list
        let next = 0;
        for (let current=0; current < vertices.length; current++) {

          // get next vertex in list
          // if we've hit the end, wrap around to 0
          next = current+1;
          if (next == vertices.length) next = 0;

          // get the PVectors at our current position
          // this makes our if statement a little cleaner
          let vc = vertices[current];    // c for "current"
          let vn = vertices[next];       // n for "next"

          // compare position, flip 'collision' variable
          // back and forth
          if (((vc.y >= point.y && vn.y < point.y) || (vc.y < point.y && vn.y >= point.y)) &&
               (point.x < (vn.x-vc.x)*(point.y-vc.y) / (vn.y-vc.y)+vc.x)) {
                  collision = !collision;
          }
        }
        return collision;
    },
    trianglePoint: function(x1, y1, x2, y2, x3, y3, px, py){
        // get the area of the triangle
        let areaOrig = Math.abs( (x2-x1)*(y3-y1) - (x3-x1)*(y2-y1) );

        // get the area of 3 triangles made between the point
        // and the corners of the triangle
        let area1 = Math.abs( (x1-px)*(y2-py) - (x2-px)*(y1-py) );
        let area2 = Math.abs( (x2-px)*(y3-py) - (x3-px)*(y2-py) );
        let area3 = Math.abs( (x3-px)*(y1-py) - (x1-px)*(y3-py) );

        // if the sum of the three areas equals the original,
        // we're inside the triangle!
        if (area1 + area2 + area3 == areaOrig) {
            return true;
        }
        return false;
    },
    rectRect: function(rect1, rect2) {
        // are the sides of one rectangle touching the other?
        if (rect1.x + rect1.width >= rect2.x &&    // r1 right edge past r2 left
          rect1.x <= rect2.x + rect2.width &&    // r1 left edge past r2 right
          rect1.y + rect1.height >= rect2.y &&    // r1 top edge past r2 bottom
          rect1.y <= rect2.y + rect2.height) {    // r1 bottom edge past r2 top
            return true;
        }
        return false;
    }
}

class Particle{
    constructor(x, y, w, h, options){
        this.defaults = {
            sx: 0,
            sy: 0,
            dontUpdate: false,
            dontDraw: false,
            color: 'black',
            reductionRatio: 0,
            reductionActivated: false,
            opacityIncrement: false,
            initialOpacity: 0,
            currentOpacity: 0,
            colorChange: false,
            colorChangePercentage: 0,
        };
        this.options = Object.assign({}, this.defaults, options);
        this.color = this.options.color;
        this.sx = this.options.sx;
        this.sy = this.options.sy;
        this.width = w;
        this.height = h;
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
    }

    draw(ctx){
        if( this.options.dontDraw )
            return;
        ctx.fillStyle = this.color;
        //console.log(this.color);
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.update();
    }

    update(){
        if( this.options.dontUpdate )
            return;

        if( this.options.opacityIncrement && this.options.currentOpacity >= 0 && this.options.currentOpacity <= 1){
            this.options.currentOpacity += 1;
            this.color = `rgba(0,0,0, ${this.options.currentOpacity})`;
        }

        if( this.options.colorChange && (this.options.colorChangePercentage >= 0 || this.options.colorChangePercentage <= 100) ){
            let newColor = colorBetween(this.color, this.options.colorChange, this.options.colorChangePercentage, this.initialX == 0);
            this.options.colorChangePercentage = this.options.colorChangePercentage + 0.2 ;
            this.color = newColor;
        }

        this.updateReductionStatus();
        this.x += this.sx;
        this.y += this.sy;
    }

    updateReductionStatus(){
        if( !this.options.reductionActivated || (this.options.reductionRatio <= 0) )
            return;

        if( this.width > 0 ){
            if( (this.width - this.options.reductionRatio) < 0 )
                this.width = 0;
            else
                this.width -= this.options.reductionRatio ;
        }

        if( this.height > 0 ){
            if( (this.height - this.options.reductionRatio) < 0 )
                this.height = 0;
            else
                this.height -= this.options.reductionRatio;
        }

        if( this.width <= 0 && this.height <= 0 )
            this.reducedCompletely = true;
    }
}

class Sensor{
    constructor(options){
        this.defaults = {
            x: 0,
            y: 0,
            endX: 0,
            endY: 0,
            speed: 1,
            angle: 45,
            length: 10,
            color: 'lime',
            dontUpdate: false,
            dontDraw: false,
            useEndPoint: false,
            drawPolygon: true,
            polygonColor: 'rgba(0, 255, 0, 0.5)',
            mechanism: bottomLeftToTopRight,
        };
        this.options = Object.assign({}, this.defaults, options);
        this.oldPosition = {
            x: this.options.x,
            y: this.options.y,
            endX: this.options.endX,
            endY: this.options.endY,
        }
    }

    getEndPoint(){
        let endpoint = null;
        if ( this.options.useEndPoint ){
            endpoint = {
                x: this.options.endX,
                y: this.options.endY,
            };
        }
        else {
            endpoint = {
                x: Math.sin( this.options.angle ) * this.options.length,
                y: Math.cos( this.options.angle ) * this.options.length,
            };
        }
        return endpoint;
    }

    changePosition(data){
        this.oldPosition = {
            x: this.options.x,
            y: this.options.y,
            endX: this.options.endX,
            endY: this.options.endY,
        }

        if( typeof data.x != "undefined" )
            this.options.x = data.x;
        if( typeof data.y != "undefined" )
            this.options.y = data.y;
        if( typeof data.endY != "undefined" )
            this.options.endY = data.endY;
        if( typeof data.endX != "undefined" )
            this.options.endX = data.endX;
    }

    isFinished(ctx, duration){
        return this.options.mechanism.isFinished(this, ctx, duration);
    }

    checkCollisionBefore(a, b){
        let x1 = 0;
        let y1 = this.options.y;
        let x2 = this.options.endX;
        let y2 = this.options.endY;
        let x3 = 0;
        let y3 = this.options.endY;
        let collision = false;

        if( collisionDetector.trianglePoint(x1, y1, x2, y2, x3, y3, a, b) )
            collision = true;

        return collision;
    }

    checkTransitionCollisionLine(x, y, endX, endY){
        let sideA = {x: this.options.x, y: this.options.y, endX: this.oldPosition.x, endY: this.oldPosition.y};
        let sideB = {x: this.options.x, y: this.options.y, endX: this.options.endX, endY: this.options.endY};
        let sideC = {x: this.oldPosition.x, y: this.oldPosition.y, endX: this.oldPosition.endX, endY: this.oldPosition.endY};
        let sideD = {x: this.oldPosition.endX, y: this.oldPosition.endY, endX: this.options.endX, endY: this.options.endY};
        let line = {
            x: x,
            y: y,
            endX: endX,
            endY: endY,
        };

        if( collisionDetector.lineLine(line,sideA) )
            return true;
        if( collisionDetector.lineLine(line,sideB) )
            return true;
        if( collisionDetector.lineLine(line,sideC) )
            return true;
        if( collisionDetector.lineLine(line,sideD) )
            return true;

        return false;
    }

    checkCollisionWithLine(x, y, endX, endY, checkInTransition){
        let colliding = false;
        colliding = collisionDetector.lineLine({
            x: this.options.x,
            y: this.options.y,
            endX: this.options.endX,
            endY: this.options.endY,
        }, {
            x: x,
            y: y,
            endX: endX,
            endY: endY,
        });

        if( !colliding && checkInTransition )
            colliding = this.checkTransitionCollisionLine(x, y, endX, endY);

        return colliding;
    }

    getTansitionPolygon(){
        return [{
            x: this.options.x,
            y: this.options.y,
        },{
            x: this.options.endX,
            y: this.options.endY,
        },{
            x: this.oldPosition.endX,
            y: this.oldPosition.endY,
        },{
            x: this.oldPosition.x,
            y: this.oldPosition.y,
        }];
    }

    drawTransitionPolygon(ctx){
        let vertices = this.getTansitionPolygon();
        ctx.beginPath();
        ctx.moveTo(vertices[0].x,vertices[0].y);
        ctx.lineTo(vertices[1].x,vertices[1].y);
        ctx.lineTo(vertices[2].x,vertices[2].y);
        ctx.lineTo(vertices[3].x,vertices[3].y);
        if(this.options.drawPolygon){
            ctx.fillStyle = this.options.polygonColor;
            ctx.fill();
        }
    }

    checkCollisionWithRect(particle, checkInTransition){
        return this.options.mechanism.collisionWithParticle(this, particle);
    }

    initialize(ctx){
        this.options.mechanism.initialize(this, ctx);
    }

    draw(ctx){
        if(this.options.dontDraw)
            return;

        let endpoint = this.getEndPoint();
        ctx.strokeStyle = this.options.color;
        ctx.beginPath();
        ctx.moveTo(this.options.x, this.options.y);
        ctx.lineTo(endpoint.x, endpoint.y);
        ctx.stroke();
        this.drawTransitionPolygon(ctx);
    }

    update(ctx, duration){
        if(this.options.dontUpdate)
            return;

        this.options.mechanism.update(this, ctx, duration);
        // this.x += this.sx;
        // this.y += this.sy;
        // if ( this.options.useEndPoint ){
        //     this.endX += this.sx;
        //     this.endY += this.sy;
        // }
    }

    setInfo(newInfo){
        this.options = Object.assign({}, this.options, newInfo);
    }
}

class ParticleCanvas{
    constructor(id, config){
        this.id = id;
        this.particles = [];
        this.destroyedParticles = [];
        this.replacements = [];
        this.setUpCanvas();
        this.options = {
            advanceFramesWithKey: false,//True => advances frame when 'a' key is pressed
            sensorDuration: 50,
            onlyBackground: false,//True => only shows the black cells left behind by the particles
            debug: false,
            stopSensorOnFinish: false,
            sensorMechanism: bottomLeftToTopRight,
        };
        this.options = Object.assign({}, this.options, config);
        this.setUpSensor();
        this.states = {
            advKeyPressed: false,
            advKeyAvailable: true,
        };
        console.log(this.sensor);
    }

    setUpSensor(){
        this.sensor = new Sensor({
            color: 'lime',
            dontUpdate: false,
            dontDraw: !this.options.debug,
            useEndPoint: true,
            mechanism: this.options.sensorMechanism,
        });
        this.sensor.initialize(this.ctx);
    }

    //Crea el canvas y guarda el context 2d
    setUpCanvas(){
        var w = window.innerWidth;
        var h = window.innerHeight;
        this.$canvas = $(`<canvas id='${this.id}' width='${w}' height='${h}'></canvas`);
        this.canvas = this.$canvas[0];
        this.ctx = this.canvas.getContext('2d');
        this.$canvas = this.$canvas.css({
            position: 'absolute',
            top: 0,
            left: 0,
        });
        //console.log(document.body.clientWidth, window.innerHeight);
    }

    canvasInfo(){
        return {
            y: parseInt(this.$canvas.css('top')),
            x: parseInt(this.$canvas.css('left')),
            height: this.$canvas.height(),
            width: this.$canvas.width(),
        };
    }

    addParticle( data ){
        var particle = new Particle(data.x, data.y, data.w, data.h, data);
        var backgroundData = Object.assign({}, data, {
            sx: 0,
            sy: 0,
            color: 'black',
            colorChange: false,
            opacityIncrement: true,
            dontUpdate: false,
            reductionRatio: 0,
            reductionActivated: false,
        });
        var backgroundParticle = new Particle(data.x, data.y, data.w, data.h, backgroundData);
        particle.replacementParticle = backgroundParticle;
        particle.frontParticle = particle;
        this.particles.push(particle);
        this.replacements.push(backgroundParticle);
    }

    destroyParticle(particle, index){
        this.destroyedParticles.push(this.particles.splice(index, 1));
    }

    clear(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

    isOutOfBoundaries(particle){
        if( (particle.x >= this.canvas.width) || ( (particle.x + particle.width) <= 0 ) )
            return true;
        else if ( (particle.y >= this.canvas.height) || ( (particle.y + particle.height) <= 0 ) )
            return true;
        return false;
    }

    drawBackgroundParticles(){
        var canvas = this;
        this.replacements.forEach(function(particle, index){
            particle.draw(canvas.ctx);
        });
    }

    drawParticles(){
        var canvas = this;
        this.particles.forEach(function(particle, index){
            if( particle.reducedCompletely || canvas.isOutOfBoundaries(particle) ){
                canvas.destroyParticle(particle, index);
                return;
            }

            let collision = canvas.sensorFinished() ? true : canvas.sensor.checkCollisionWithRect({
                x: particle.x,
                y: particle.y,
                width: particle.width,
                height: particle.height,
            }, true);

            if(collision){
                //console.log(collision);
                particle.replacementParticle.options.dontDraw = false;
                if( !canvas.options.onlyBackground ){
                    particle.options.dontDraw = false;
                    particle.options.dontUpdate = false;
                }
            }
            particle.draw(canvas.ctx);
        });
    }

    draw(){
        //Key
        if( this.dontDraw || (this.options.advanceFramesWithKey && !this.states.advKeyPressed) ){
            return;
        }
        this.states.advKeyPressed = false;
        this.states.advKeyAvailable = false;
        //Draw
        this.clear();
        this.drawBackgroundParticles();
        this.drawParticles();

        if( this.options.debug )
            this.sensor.draw(this.ctx);

        if( !this.options.stopSensorOnFinish || !this.sensorFinished() )
            this.sensor.update(this.ctx, this.options.sensorDuration);
    }

    sensorFinished(){
        return this.sensor.isFinished(this.ctx, this.options.sensorDuration);
    }

    update(){
        // var $canvas = this.$canvas;
        //  $canvas.outerHeight($(window).height()-$canvas.offset().top- Math.abs($canvas.outerHeight(true) - $canvas.outerHeight()));
    }

    resize(){}

    destroy(){
        this.particles = [];
        this.destroyedParticles = [];
        this.replacements = [];
        this.$canvas.remove();
        this.dontDraw = true;
    }

    initialize(){
        var canvas = this;
        this.loop();
        $(document).on('resize', function(){
            canvas.resize();
        });
        $(document).on('keydown', function(event){
            if( canvas.states.advKeyAvailable && event.which == 65)
                canvas.states.advKeyPressed = true;
        });
        $(document).on('keyup', function(event){
            if(event.which == 65)
                canvas.states.advKeyAvailable = true;
        });
    }

    loop(){
        //console.log(this);
		requestAnimationFrame(() => { this.loop() });
		this.draw();
    }
}

class Bitmap{
    constructor(x, y, precision){
        this.currentY = y;
        this.currentX = x;
        this.precision = precision;
        this.bitmapCreated = false;
    }

    createBitmap(canvas, zoneData, callback){
        this.bitmapCreated = false;
        this.bitmap = [];
        var ctx = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        console.log(zoneData);

        //por cada pixel del canvas original, desde (x,y) = (offset canvas x, offset canvas y)
        //guardamos los datos de un cuadrado con tamaño = precision

        var currentRowY = (zoneData.y + zoneData.height);
        var currentColumnsX = zoneData.x;

        for( var y = (zoneData.y + zoneData.height); y >= (zoneData.y - this.precision); y -= this.precision ){
            for( var x = zoneData.x; x <= (zoneData.x + zoneData.width); x += this.precision ){
                //console.log(y);
                var bitData = {
                    x: x - zoneData.x,
                    y: y - zoneData.y,
                    precision: this.precision,
                    data: ctx.getImageData(x, y, this.precision, this.precision).data,
                };

                this.bitmap.push(bitData);
                // ctx.fillStyle = `rgb(${bitData.data[0]},${bitData.data[1]},${bitData.data[2]})`;
                // ctx.fillRect(x, y, this.precision, this.precision);
                if(callback){
                    callback(bitData);
                }
            }
        }

        console.log(this.bitmap);
        this.bitmapCreated = true;
        return this.bitmap;
    }

    bitmapEnded(){
        return this.bitmapCreated;
    }
}

class ThanosEffect{
    constructor(id, options){
        this.defaults = {
            speed: 0,
            precision: 20,
            reductionActivated: true,
            resetAvailable: false,
        };
        this.options = Object.assign({}, this.defaults, options);

        this.id = id;
        this.particles = [];
        this.precision = this.options.precision;
        this.particleCanvas = new ParticleCanvas(id, this.options);
        this.speed = this.options.speed;
        this.messages = ['Your page will return'];
        this.$thanosGuantletHtml = $(`<div id="thanos-guantlet">
            	<img src="assets/img/thanos-attacks.gif">
            </div>`);
        this.$thanosMessageHtml = $(`<div id="thanos-message">
                <div class="text">${this.getRandomMessage()}</div>
                <img class="thanos-end-image" src="assets/img/thanos-wins.gif">
            </div>`);
        this.$resetButton = $('<div id="reset-button">BACK</div>');
        this.$portalHtml = $(`<div id="portal-image">
        	<img class="img-fluid portal-img" src="assets/img/portal.gif">
        </div>`);

        console.log(this.particleCanvas);
    }

    static preloadAssets() {
        let assets = ['assets/img/thanos-wins.gif', 'assets/img/thanos-attacks.gif', 'assets/img/portal.gif'];
        assets.forEach(function(src){
            let img = new Image();
            console.log('Asset cargado', img);
            img.src = src;
        });
    }

    getRandomMessage(){
        var message = this.messages[Math.floor( Math.random() * this.messages.length )];
        console.log(message);
        return message;
    }

    createBitmap(callback){
        this.bitmap = new Bitmap(0,0,this.precision);
        this.bitmap.createBitmap(this.screenshotCanvas, this.particleCanvas.canvasInfo(), callback);
    }

    bodyToCanvas(){
        var thanoseffect = this;
        return html2canvas(document.body).then(function(canvas) {
            thanoseffect.photoCanvas = canvas;
            document.body.appendChild(canvas);
            $(canvas).css({
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: 0,
            });
            thanoseffect.screenshotCanvas = canvas;
            console.log(thanoseffect.screenshotCanvas);
        });
    }

    appendCanvas(){
        var doc = document.documentElement;
        var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        console.log(this.particleCanvas);
        this.particleCanvas.$canvas.css({
            top: top,
            left: left,
            // backgroundColor: 'rgba(0,0,0,0.2)',
        });
        this.particleCanvas.$canvas.appendTo('body');
        console.log(this.particleCanvas.$canvas);
    }

    portalStep(){
        var _this = this;
        this.$portalHtml.appendTo('body');
        setTimeout(function(){
            _this.$portalHtml.find(".portal-img").addClass('active');
            setTimeout(function(){
                _this.showThanosGuantlet();
            }, 500);
        }, 10);
    }

    showThanosGuantlet(){
        this.$thanosGuantletHtml.appendTo('body');
        var _this = this;
        setTimeout(function(){
            _this.$thanosGuantletHtml.find('img').addClass('active');
        }, 10);
    }

    thanosPortalOut(){
        var _this = this;
        this.$thanosGuantletHtml.find('img').removeClass('active');
        setTimeout(function(){
            _this.closePortal();
        }, 500);
    }

    closePortal(){
        this.$portalHtml.find('img').removeClass('active');
    }

    thanosMessageStep(){
        var thanoseffect = this;
        this.thanosPortalOut();
        this.$thanosMessageHtml.appendTo('body');
        //Append reset button if available
        if( this.options.resetAvailable ){
            this.$resetButton.appendTo(this.$thanosMessageHtml);
            this.$resetButton.click(function(){
                thanoseffect.reset();
            });
        }
        this.$thanosMessageHtml.find('#reset-button');
        setTimeout(function(){
            thanoseffect.$thanosMessageHtml.addClass('active');
        }, 500);
    }

    manageSensorBitdata(bitData){
        //console.log(bitData)
        var speedMultiplier = this.options.speed / 1000;
        var speedX = (Math.random() * 5 + 2) * speedMultiplier;
        var speedY = (-1 * (Math.random() * 1 + 2)) * speedMultiplier;
        var reductionRatio = Math.random() * (bitData.precision/1) + (bitData.precision / 1000);

        //console.log(reductionRatio);
        this.particleCanvas.addParticle({
            x: bitData.x,
            y: bitData.y,
            w: bitData.precision,
            h: bitData.precision,
            sx: speedX,
            sy: speedY,
            reductionRatio: reductionRatio,
            reductionActivated: true,
            color: `rgb(${bitData.data[0]},${bitData.data[1]},${bitData.data[2]})`,
            colorChange: 'rgb(68, 68, 68)',
            dontUpdate: true,
            dontDraw: true,
        });
    }

    initialize(){
        var thanoseffect = this;
        this.htmlOldOverflow = $('html').css('overflow');
        $('html').css('overflow', 'hidden');
        this.portalStep();

        this.beginningTimeout = setTimeout(function(){
            var promise = thanoseffect.bodyToCanvas();
            promise.then(function(){
                thanoseffect.appendCanvas();
                thanoseffect.particleCanvas.initialize();
                thanoseffect.createBitmap( function(bitData){
                    thanoseffect.manageSensorBitdata(bitData);
                });
            });
        }, 2000);

        //Checkeamos en un intervalo si termino la animacion del bitmap
        this.thanosMessageInterval = setInterval(function(){
            if(thanoseffect.particleCanvas && thanoseffect.particleCanvas.sensorFinished()){
                //Si termino, limpiamos el intervalo
                clearInterval(thanoseffect.thanosMessageInterval);
                this.thanosMessageTimeout = setTimeout(function(){//Y pasamos al step del mensaje
                    thanoseffect.thanosMessageStep();
                }, 200);
            }

        }, 100);
    }

    reset(){
        clearInterval(this.thanosMessageInterval);
        clearTimeout(this.thanosMessageTimeout);
        clearTimeout(this.beginningTimeout);
        $(this.photoCanvas).remove();
        this.photoCanvas = null;
        this.particleCanvas.destroy();
        this.particleCanvas = null;
        this.$thanosGuantletHtml.remove();
        this.$thanosMessageHtml.remove();
        this.$portalHtml.remove();
        $('html').css('overflow', this.htmlOldOverflow);
    }
}
