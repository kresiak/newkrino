

export function softCopy(target, source) {   // returns true if he copies it; otherwise he says: copy it yourself (because it is primitive type)
    if (JSON.stringify(target) === JSON.stringify(source)) return true;

    if (target instanceof Array) {
        if (source instanceof Array) {
            if (target.length === source.length) {
                for (var i = 0; i < target.length; i++) {
                    if (!this.softCopy(target[i], source[i])) {
                        target[i] = source[i]  //if array items  are primitive, I will copy myself
                    }
                }
            }
            else {
                console.log('strange softCopy source array of different length. Expected length was ' + target.length + '. Source: ' + JSON.stringify(source))
            }
        }
        else {
            console.log('strange softCopy source not array: ' + JSON.stringify(source))
        }
        return true
    }
    else if (target instanceof Object) {
        if (source instanceof Object) {
            Object.keys(target).forEach(propName => {
                if (!this.softCopy(target[propName], source[propName])) {
                    target[propName] = source[propName]  //if properties are primitive, I will copy myself
                }
            })
        }
        else {
            console.log('strange softCopy source not object: ' + JSON.stringify(source))
        }
        return true
    }
    else {  // primitive type: sorry cannot copy it copy for you because passed by value
        if (target && (source instanceof Object || source instanceof Array)) {   // if target is null or undefined, it is ok that source is of different type
            console.log('strange softCopy source not primitive but is array or object: ' + JSON.stringify(source))
        }
        return false
    }
}

