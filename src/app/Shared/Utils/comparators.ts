

export function softCopy(target, source) {   // returns true if he copies it; otherwise he says: copy it yourself (because it is primitive type)
    if (JSON.stringify(target) === JSON.stringify(source)) return true;

    if (target instanceof Array) {
        if (source instanceof Array) {
            if (target.length === source.length) {
                for (var i = 0; i < target.length; i++) {
                    if (!this.softCopy(target[i], source[i])) {
                        target[i] = clone(source[i])  //if array items  are primitive, I will copy myself
                    }
                }
            }
            else {
                return false // if you are setting the value of an object or array it is Pass by Value 
            }
        }
        else {
            console.log('strange softCopy source not array: ' + JSON.stringify(source))
            return false
        }
        return true
    }
    else if (target instanceof Object) {
        if (source instanceof Object) {
            Object.keys(source).filter(sourcekey => !Object.keys(target).includes(sourcekey)).forEach(key => target[key]= undefined)
            Object.keys(target).filter(sourcekey => !Object.keys(source).includes(sourcekey)).forEach(key => delete target[key])

            Object.keys(target).forEach(propName => {
                if (!this.softCopy(target[propName], source[propName])) {
                    target[propName] = clone(source[propName])  //if properties are primitive, I will copy myself
                }
            })
        }
        else {
            console.log('strange softCopy source not object: ' + JSON.stringify(source))
            return false
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

export function clone(source) {
    if (!(source instanceof Array) && !(source instanceof Object)) return source
    return JSON.parse(JSON.stringify(source))
}

