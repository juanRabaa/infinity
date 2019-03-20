function numbBetweenByPerc(min, max, perc){
    return (perc * (max - min) / 100) + min;
}

function getRGB(str){
    str = str.replace(/\s/g, '');
    var match = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    var alpha = typeof match[4] != typeof undefined ? match[4] : 1;
    return match ? {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: parseInt(alpha),
    } : {};
}

function colorBetween(rgb1, rgb2, percentage, debug){
    var rgb1 = getRGB(rgb1);
    var rgb2 = getRGB(rgb2);
    var newrgb = {};
    for(var key in rgb1){
        var from = rgb1[key];
        var to = rgb2[key];
        var propPercentage = percentage;
        // if(from > to){
        //     propPercentage = Math.abs(percentage - 100);
        // }
        newrgb[key] = parseInt(numbBetweenByPerc(from, to, propPercentage));
    }
    return `rgba(${newrgb.r},${newrgb.g},${newrgb.b},${newrgb.a})`;
}
