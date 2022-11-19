(function(exports) {

    exports.colors = [
        parseInt('FFFFFF', 16),
        parseInt('E4E4E4', 16),
        parseInt('888888', 16),
        parseInt('222222', 16),
        parseInt('FFA7D1', 16),
        parseInt('E50000', 16),
        parseInt('E59500', 16),
        parseInt('A06A42', 16),
        parseInt('E5D900', 16),
        parseInt('94E044', 16),
        parseInt('02BE01', 16),
        parseInt('00D3DD', 16),
        parseInt('0083C7', 16),
        parseInt('0000EA', 16),
        parseInt('CF6EE4', 16),
        parseInt('820080', 16)
    ];

    //Number of possible colors
    exports.colorsHeight = exports.colors.length;

    exports.numToHex = function(color) {
        var hex = color.toString(16);
        while (hex.length < 6) {
            hex = '0' + hex;
        }
        return '#' + hex;
    }

    exports.hexToNum = function(color) {
        return parseInt(color, 16);
    }

    exports.size = 512;

}(typeof exports === 'undefined' ? this.common = {} : exports));