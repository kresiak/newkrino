
     export function hashMapFactory(list)  {         
        return hashMapFactoryHelper(list, element => element._id)
    }

     export function hashMapFactoryForAnnotated(list)  {         
        return hashMapFactoryHelper(list, element => element.data._id)
    }

    export function hashMapFactoryHelper(list, fnIdSelector) {
        return list.reduce((map, element) => {
            map.set(fnIdSelector(element), element)
            return map
        }, new Map())        
    }