function fillObjectFields(fields, obj) {
    if (obj instanceof Array) {
        for (let i = 0; i < obj.length; i++)
            obj[i] = fillObjectFields(fields, obj[i])
        return obj
    }

    if (typeof obj === 'object') {
        for (let key in obj) {
            if (!fields.includes(key))
                delete obj[key]
        }
        for (let key of fields)
            if (!(key in obj))
                obj[key] = null
        
        return obj
    }

    return obj
}

module.exports = { fillObjectFields }