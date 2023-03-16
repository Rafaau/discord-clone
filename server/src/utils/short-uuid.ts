export function generateUID() {
    var firstPart = (Math.random() * 46656) | 0
    var secondPart = (Math.random() * 46656) | 0
    var firstPartStr = ("000" + firstPart.toString(36)).slice(-3)
    var secondPartStr = ("000" + secondPart.toString(36)).slice(-3)
    return (firstPartStr + secondPartStr).toUpperCase()
}