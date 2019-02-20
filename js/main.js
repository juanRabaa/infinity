$(document).ready(function(){
    var sensorMechanisms = {
        bottomLeftToTopRight: bottomLeftToTopRight,
        leftToRight: leftToRight,
        topLeftToTopRight: topLeftToTopRight,
    };
    var thanosActivated = false;
    function run(options){
        var test = new ThanosEffect('thanosTest', options);
        test.initialize();
        console.log(test);
    }

    function getData(){
        return {
            sensorDuration: parseInt($('#sensorDuration').val()),
            speed: parseInt($('#particlesSpeed').val()),
            precision: parseInt($('#particlesPrecision').val()),
            debug: $('#thanosDebug').is(':checked'),
            resetAvailable: $('#thanosReset').is(':checked'),
            sensorMechanism: sensorMechanisms[$('#sensorMechanism').val()],
        }
    }


    $('.content-box').click(function(){
        let options = getData();
        if( !thanosActivated ){
            run(options);
        }
    });

    $('#thanos-config .trigger-button').click(function(){
        let $config = $('#thanos-config .config-inputs');
        if($config.hasClass('active')){
            $config.removeClass('active');
            $config.stop().slideUp();
        }
        else{
            $config.addClass('active');
            $config.stop().slideDown();
        }
    });

})
