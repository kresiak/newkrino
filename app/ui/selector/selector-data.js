"use strict";
var SelectorData = (function () {
    function SelectorData(id, name, selected) {
        this.id = id;
        this.name = name;
        this.selected = selected;
    }
    ;
    SelectorData.prototype.savePresentState = function () {
        this.savedSelect = this.selected;
    };
    SelectorData.prototype.restoreFromSavedState = function () {
        this.selected = this.savedSelect;
    };
    return SelectorData;
}());
exports.SelectorData = SelectorData;
//# sourceMappingURL=selector-data.js.map