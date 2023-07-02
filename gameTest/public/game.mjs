document.addEventListener('DOMContentLoaded', () => {
    const socket = io({transports: ['websocket'], upgrade: false});
    const keys = {};

    const imageNpc = new Image();
    const imageCoin = new Image();

    const canvas = document.getElementById('game-window');
    const context = canvas.getContext('2d');
    let textSpace = 30;


    imageCoin.onload = () => {
        socket.emit('metchJoin');
    };

    socket.on('gameWindowSeting', (Data) => {//set canvas dimension
        canvas.width = Data.width;
        canvas.height = Data.height;
        imageNpc.src = Data.npc;
        imageCoin.src = Data.coin;
        textSpace = Data.textSpace
    });

    socket.on('statisticGame', (stat) => {//all draw game coin , player
        context.clearRect(0, 0, canvas.width, textSpace);
        context.font = "20px Arial";
        if(stat.nPlayer)
            context.fillText(`Online player : ${stat.nPlayer}`, 0, textSpace/2);
        if(stat.rank)
            context.fillText(`your rank : ${stat.rank}` , canvas.width/2, textSpace/2);
        if(stat.score)
            context.fillText(`your score : ${stat.score}` , canvas.width-100, textSpace/2);
    });

    socket.on('draw', (allInfo) => {//all draw game coin , player
        context.clearRect(0, textSpace, canvas.width, canvas.height);
        allInfo.forEach(info => {
            if(info.image == `./src/npc.png`)
                context.drawImage(imageNpc, info.pos.x, info.pos.y, info.size, info.size);
            else
                context.drawImage(imageCoin, info.pos.x, info.pos.y, info.size, info.size);
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
