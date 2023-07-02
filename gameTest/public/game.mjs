document.addEventListener('DOMContentLoaded', () => {
    const socket = io({transports: ['websocket'], upgrade: false});
    const keys = {};

    const canvas = document.getElementById('game-window');
    const context = canvas.getContext('2d');

    socket.on('gameWindowSeting', (canvaData) => {//set canvas dimension
        canvas.width = canvaData.width;
        canvas.height = canvaData.height;
        socket.emit(`metchJoin`);
    });

    socket.on('draw', (allInfo) => {//all draw game coin , player
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "20px Arial";
        context.fillText(`Online player : ${allInfo.length - 1}`, 10, 50);
        allInfo.forEach(info => {
            const image = new Image();
            image.onload = () => {
                context.drawImage(image, info.pos.x, info.pos.y, info.size, info.size);
                if (info.rank)
                  context.fillText(info.rank, info.pos.x, info.pos.y);
              };
              image.src = info.image;
        });
    });

    function updatePosition() {//check moving if moving send to server key to calculate your position
        if(Object.values(keys).some((elemento) => elemento === true) != 0)
            socket.emit(`playerMove`, keys);
        requestAnimationFrame(updatePosition);
    }

    updatePosition()

    document.addEventListener('keydown', (event) => {
        keys[event.key] = true; 
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    document.addEventListener("blur", (event) => {//force stop moving change window
        Object.entries(keys).forEach(([key])=> {keys[key] = false });
    });
})
