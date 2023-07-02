var socket = io({transports: ['websocket'], upgrade: false});
const keys = {};

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');


setTimeout(() => {
    socket.emit(`metchJoin`)
    socket.emit(`playerMove`,keys)
}, 250);

setTimeout(() => {
    socket.emit(`playerMove`,keys)
}, 300);

socket.on('gameWindowSeting', (canvaData) => {
    canvas.width = canvaData.width;
    canvas.height = canvaData.height;
});

socket.on('draw', (allInfo) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "20px Arial";
    context.fillText(`Online player : ${allInfo.length - 1}`, 10, 50);
    allInfo.forEach(info => {
        const image = new Image();
        image.src = info.image;
        context.drawImage(image, info.pos.x, info.pos.y, info.size, info.size);
        if(info.rank)
            context.fillText(info.rank, info.pos.x, info.pos.y);
    });
});

function updatePosition() {
    if(Object.values(keys).some((elemento) => elemento === true) != 0)
        socket.emit(`playerMove`, keys);
}

setInterval(updatePosition, 15);

document.addEventListener('keydown', (event) => {
    keys[event.key] = true; 
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

document.addEventListener("blur", (event) => {
    Object.entries(keys).forEach(([key])=> {keys[key] = false });
});
  

