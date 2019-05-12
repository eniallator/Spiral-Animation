const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const imgData = ctx.createImageData(canvas.width, canvas.height)

const spirals = [{ scale: 10, colour: [255, 0, 0] }, { scale: 15, colour: [0, 255, 0] }, { scale: 20, colour: [0, 0, 255] }]

function getBearing(diff) {
    const bearing = Math.atan(Math.abs(diff.y / diff.x))

    if (diff.x >= 0 && diff.y >= 0) {
        // top right
        return Math.PI * 0.5 - bearing
    } else if (diff.x >= 0 && diff.y <= 0) {
        // bottom right
        return Math.PI * 0.5 + bearing
    } else if (diff.x <= 0 && diff.y <= 0) {
        // bottom left
        return Math.PI * 1.5 - bearing
    } else if (diff.x <= 0 && diff.y >= 0) {
        // top left
        return Math.PI * 1.5 + bearing
    }
}

function run() {
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const pix = (y * canvas.width + x) * 4
            const diffVector = { x: canvas.width / 2 - x, y: canvas.height / 2 - y }
            const bearing = getBearing(diffVector)
            const magnitude = Math.sqrt(diffVector.x ** 2 + diffVector.y ** 2)

            const colour = new Array(3).fill(0)
            for (let spiral of spirals) {
                for (let i in spiral.colour) {
                    colour[i] += spiral.colour[i] * Math.abs(Math.sin(magnitude / spiral.scale + bearing))
                }
            }

            for (let i of colour) colour[i] = Math.min(colour[i], 255)

            imgData.data[pix] = colour[0]
            imgData.data[pix + 1] = colour[1]
            imgData.data[pix + 2] = colour[2]
            imgData.data[pix + 3] = 255
        }
    }

    ctx.putImageData(imgData, 0, 0)
}

run()
