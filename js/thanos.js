class Particle{
    constructor(x, y, w, h, options){
        this.defaults = {
            sx: 0,
            sy: 0,
            color: 'black',
            reductionRatio: 0,
            reductionActivated: false,
        };
        this.options = Object.assign({}, this.defaults, options);

        this.color = this.options.color;
        this.sx = this.options.sx;
        this.sy = this.options.sy;
        this.width = w;
        this.height = h;
        this.x = x;
        this.y = y;
    }

    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.update();
    }

    update(){
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

// class Sensor{
//     constructor(options){
//         this.defaults = {
//             x: 0,
//             y: 0,
//             speed: 1,
//             angle: 45,
//             length: 10,
//             color: 'lime',
//         };
//         this.info = Object.assign({}, this.defaults, options);
//     }
//
//     draw(ctx){
//         ctx.strokeStyle = this.info.color;
//         ctx.beginPath();
//         ctx.moveTo(this.info.x, this.info.y);
//         ctx.lineTo(this.info.x, this.info.y);
//         ctx.stroke();
//     }
//
//     update(){
//         this.updateReductionStatus();
//         this.x += this.sx;
//         this.y += this.sy;
//     }
//
// }


class ParticleCanvas{
    constructor(id){
        this.id = id;
        this.particles = [];
        this.destroyedParticles = [];
        this.replacements = [];
        this.setUpCanvas();
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
        var backgroundParticle = new Particle(data.x, data.y, data.w, data.h, {
            sx: 0,
            sy: 0,
            color: 'black',
        });
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

            particle.draw(canvas.ctx);
        });
    }

    draw(){
        this.clear();
        this.drawBackgroundParticles();
        this.drawParticles();
    }

    upate(){
        var $canvas = this.$canvas;
         $canvas.outerHeight($(window).height()-$canvas.offset().top- Math.abs($canvas.outerHeight(true) - $canvas.outerHeight()));
    }

    resize(){

    }

    initialize(){
        var canvas = this;
        this.loop();
        $(document).on('resize', function(){
            canvas.resize();
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
        this.speed = 10;
        this.stepsBitmapData = {};
    }

    createBitmap(canvas, zoneData){
        this.bitmap = [];
        var ctx = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        console.log(zoneData);

        //por cada pixel del canvas original, desde (x,y) = (offset canvas x, offset canvas y)
        //guardamos los datos de un cuadrado con tamaño = precision

        var currentRowY = (zoneData.y + zoneData.height);
        var currentColumnsX = zoneData.x;

        for( var y = (zoneData.y + zoneData.height); y >= zoneData.y; y -= this.precision ){
            for( var x = zoneData.x; x <= (zoneData.x + zoneData.width); x += this.precision ){
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
        return bitmap
    }

    stepsBitmapEnded(){
        return this.stepsBitmapData && (this.stepsBitmapData.endX || !this.stepsBitmapData.animatingColumns)
         && (this.stepsBitmapData.endY || !this.stepsBitmapData.animatingRows);
    }

    stepsBitmap(canvas, zoneData, options){
        this.stepsBitmapDefaults = {
            speed: 0,
            animateColumns: true,
            animateRows: true,
            callback: null,
        };
        this.stepsBitmapOptions = Object.assign({}, this.stepsBitmapDefaults, options);

        this.stepsBitmapData = {};
        this.stepsBitmapData.speed = this.stepsBitmapOptions.speed;
        this.stepsBitmapData.iterationRate = 0.5;
        this.stepsBitmapData.bitmap = [];
        var ctx = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;

        this.stepsBitmapData.currentRowY = (zoneData.y + zoneData.height);
        this.stepsBitmapData.currentColumnsX = zoneData.x;

        this.stepsBitmapData.animatingColumns = this.stepsBitmapOptions.animateColumns;
        this.stepsBitmapData.animatingRows = this.stepsBitmapOptions.animateRows;

        if(this.stepsBitmapData.animatingColumns)
            this.stepLineX(this.stepsBitmapData.currentColumnsX, zoneData.width, zoneData.y, this.stepsBitmapData.currentRowY, ctx, zoneData, this.stepsBitmapOptions.callback, true);
        if(this.stepsBitmapData.animatingRows)
            this.stepLineY(this.stepsBitmapData.currentRowY - this.precision, zoneData.y, zoneData.width, 0, ctx, zoneData, this.stepsBitmapOptions.callback, true);
    }

    stepLineX(currentX, maxX, minY, currentIterationY, ctx, zoneData, callback, canCallOther){
        //console.log(currentX, maxX, minY, currentIterationY, zoneData, canCallOther);
        var bitData = {
            x: currentX - zoneData.x,
            y: currentIterationY - zoneData.y,
            precision: this.precision,
            data: ctx.getImageData(currentX, currentIterationY, this.precision, this.precision).data,
        };
        //console.log(bitData);
        this.stepsBitmapData.bitmap.push(bitData);

        if(callback){
            callback(bitData);
        }

        var _this = this;
        //Mientras mas chico sea el numbero por el que se divide zoneData.height, mas rapido ocurren las transiciones en X
        var isHalfWay = ((currentIterationY - zoneData.y) <= zoneData.height/2) || (Math.random() >= this.stepsBitmapData.iterationRate);
        var columnFinished = currentIterationY < minY;
        var isLastColumn = currentX >= maxX;
        var newRowIterationCondition = isHalfWay && canCallOther;

        //Si no se termino de animar las particulas de esta columna, animar la siguiente
        if( !columnFinished ){
            //Quitar otra particula de la misma columna
            setTimeout(function(currentX, maxX, minY, currentIterationY, ctx, zoneData, callback, isHalfWay){
                _this.stepLineX(currentX, maxX, minY, currentIterationY, ctx, zoneData, callback, !isHalfWay);
            }, this.stepsBitmapData.speed, currentX, maxX, minY, currentIterationY - this.precision, ctx, zoneData, callback, isHalfWay);
        }

        //console.log(currentX, maxX)
        //Si no estamos en la ultima columna
        if(!isLastColumn){
            //Si va por la mitad, y esta accion no se realizo en esta iteracion
            //empezar a restar de la siguiente columna
            if( newRowIterationCondition ){
                this.stepsBitmapData.currentColumnsX += this.precision;//console.log(this.currentColumnsY)
                this.stepLineX(this.stepsBitmapData.currentColumnsX, maxX, minY, this.stepsBitmapData.currentRowY, ctx, zoneData, callback, true);
            }
        }

        //Si se animaron todas las particulas de la columna, y no fue posible animar otra columna
        //Terminamos el X
        if( columnFinished && !newRowIterationCondition ){
            this.stepsBitmapData.endX = true;
        }
    }

    stepLineY(currentRowY, minY, maxX, currentIterationX, ctx, zoneData, callback, canCallOther){
        //console.log(currentRowY, minY, maxX, currentIterationX, zoneData, canCallOther);
        var bitData = {
            x: currentIterationX - zoneData.x,
            y: currentRowY - zoneData.y,
            precision: this.precision,
            data: ctx.getImageData(currentIterationX, currentRowY, this.precision, this.precision).data,
        };

        //console.log(bitData);
        this.stepsBitmapData.bitmap.push(bitData);
        if(callback){
            callback(bitData);
        }

        var _this = this;
        //Mientras mas grande sea el numbero por el que se divide zoneData.width, mas rapido ocurren las transiciones en Y
        var isHalfWay = ((currentIterationX + zoneData.x) >= zoneData.width/2) || (Math.random() >= this.stepsBitmapData.iterationRate);
        var rowFinished = currentIterationX > maxX;
        var isLastRow = currentRowY < minY;
        var newRowIterationCondition = isHalfWay && canCallOther;

        //Si no se termino de animar las particulas de esta columna, animar la siguiente
        if(!rowFinished){
            //Quitar otra particula de la misma fila
            setTimeout(function(currentRowY, minY, maxX, currentIterationX, ctx, zoneData, callback, isHalfWay){
                _this.stepLineY(currentRowY, minY, maxX, currentIterationX, ctx, zoneData, callback, !isHalfWay);
            }, this.speed, currentRowY, minY, maxX, currentIterationX + this.precision, ctx, zoneData, callback, isHalfWay);
        }

        //console.log(isLastRow, newRowIterationCondition)
        //Si no estamos en la ultima fila
        if(!isLastRow){
            //Si va por la mitad, y esta accion no se realizo en esta iteracion
            //empezar a restar de la siguiente fila
            if( newRowIterationCondition ){
                this.stepsBitmapData.currentRowY -= this.precision;
                this.stepLineY(this.stepsBitmapData.currentRowY, minY, maxX, this.stepsBitmapData.currentColumnsX, ctx, zoneData, callback, true);
            }
        }
        //console.log(this.endY, this.endX);
        //Si se animaron todas las particulas de la fila, y no fue posible animar otra fila
        //Terminamos el Y
        //console.log(rowFinished, !newRowIterationCondition);
        if( rowFinished && !newRowIterationCondition ){
            this.stepsBitmapData.endY = true;
        }
    }
}

class ThanosEffect{
    constructor(id, options){
        this.defaults = {
            speed: 0,
            precision: 20,
            animateColumns: true,
            animateRows: true,
            reductionActivated: true,
        };
        this.options = Object.assign({}, this.defaults, options);

        this.id = id;
        this.particles = [];
        this.precision = this.options.precision;
        this.particleCanvas = new ParticleCanvas(id);
        this.speed = this.options.speed;
        this.messages = ['Your page will return', 'Your page will return cuando la pagues'];
        this.$thanosGuantletHtml = $(`<div id="thanos-guantlet">
            	<img src="https://www.vetorial.net/~centurion/Thanos.gif">
            </div>`);
        this.$thanosMessageHtml = $(`<div id="thanos-message">
                <div class="text">${this.getRandomMessage()}</div>
                <img class="thanos-end-image" src="https://vignette.wikia.nocookie.net/marvelvscapcom/images/f/fa/Thanos-wins.gif/revision/latest?cb=20150409050450">
            </div>`);
        this.$portalHtml = $(`<div id="portal-image">
        	<img class="img-fluid portal-img" src="https://steamusercontent-a.akamaihd.net/ugc/915794937505568927/8BC71D6A226D3448CCE1733335F526CD72BDA998/?interpolation=lanczos-none&amp;output-format=jpeg&amp;output-quality=95&amp;fit=inside%7C1024%3A1024&amp;composite-to=*,*%7C1024%3A1024&amp;background-color=black">
        </div>`);

        console.log(this.particleCanvas);
    }

    getRandomMessage(){
        var message = this.messages[Math.floor( Math.random() * this.messages.length )];
        console.log(message);
        return message;
    }

    createStepsBitmap(callback){
        this.bitmap = new Bitmap(0,0,this.precision);
        console.log(this.options)
        this.bitmap.stepsBitmap(this.screenshotCanvas, this.particleCanvas.canvasInfo(),{
            speed: this.speed,
            callback: callback,
            animateColumns: this.options.animateColumns,
            animateRows: this.options.animateRows,
        });
    }

    bodyToCanvas(){
        var thanoseffect = this;
        return html2canvas(document.body).then(function(canvas) {
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
        var $canvas = this.particleCanvas.$canvas;
        $canvas.css({
            top: top,
            left: left,
            // backgroundColor: 'rgba(0,0,0,0.2)',
        });
        $canvas.appendTo('body');
        console.log($canvas);
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
        this.thanosPortalOut();
        this.$thanosMessageHtml.appendTo('body');
        var _this = this;
        setTimeout(function(){
            _this.$thanosMessageHtml.addClass('active');
        }, 500);
    }

    initialize(){
        var thanoseffect = this;
        this.portalStep();

        setTimeout(function(){
            $('html').css('overflow', 'hidden');
            var promise = thanoseffect.bodyToCanvas();
            promise.then(function(){
                thanoseffect.appendCanvas();
                thanoseffect.particleCanvas.initialize();
                thanoseffect.createStepsBitmap( function(bitData){
                    //console.log(bitData)
                    var speedX = Math.random() * 5 + 2;
                    var speedY = -1 * (Math.random() * 10 + 2);
                    var reductionRatio = Math.random() * bitData.precision/10 + 0.5;
                    //console.log(reductionRatio);
                    thanoseffect.particleCanvas.addParticle({
                        x: bitData.x,
                        y: bitData.y,
                        w: bitData.precision,
                        h: bitData.precision,
                        sx: speedX,
                        sy: speedY,
                        reductionRatio: reductionRatio,
                        reductionActivated: true,
                        color: `rgb(${bitData.data[0]},${bitData.data[1]},${bitData.data[2]})`,
                    });
                });
            });
        }, 2000);

        //Checkeamos en un intervalo si termino la animacion del bitmap
        this.thanosMessageInterval = setInterval(function(){
            if(thanoseffect.bitmap && thanoseffect.bitmap.stepsBitmapEnded()){
                //Si termino, limpiamos el intervalo
                clearInterval(thanoseffect.thanosMessageInterval);
                setTimeout(function(){//Y pasamos al step del mensaje
                    thanoseffect.thanosMessageStep();
                }, 1000);
            }

        }, 100);
    }
}


function run(options){
    var test = new ThanosEffect('thanosTest', options);
    test.initialize();
    console.log(test);
}

$(document).ready(function(){
    var thanosActivated = false;
    $('.content-box').click(function(){
        if( !thanosActivated ){
            run({
                speed: 0,
                precision: 20,
            });
        }
    });
});
