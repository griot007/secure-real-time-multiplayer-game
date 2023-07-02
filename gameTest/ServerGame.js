let npcEnv = require('dotenv').config({ path: './env/npcOption.env' })
let canvaEnv = require('dotenv').config({ path: './env/canvaSetting.env' })

module.exports = function (io) {
    const clients = {};
    const players = {};
    let coin = {};

    io.on('connection', async (socket) => {
        console.log("New client connected. ID: ", socket.id);
        socket.emit(`gameWindowSeting`, {width: parseInt(canvaEnv.parsed.WIDTH) , height:parseInt(canvaEnv.parsed.HEIGHT) ,textSpace:parseInt(canvaEnv.parsed.TEXTSPACE), npc: npcEnv.parsed.NPCIMAGE , coin: npcEnv.parsed.COINIMAGE});//canvas dimension

        socket.on('metchJoin', async() => {
            if(!clients[socket.id]){
                clients[socket.id] = socket;
                newCoin();
                newPlayer(socket);
                Object.values(players).map(player => player.info.score = 0) //if ypu like restart game on join new player
                socket.emit("draw", Object.values(players).map(player => player.info).concat(Object.values(coin)))//fisrt position join
                io.emit("statisticGame", {nPlayer : Object.values(players).length , rank : `` , score : players[socket.id].info.score});//event to draw in client
            }
        });

        socket.on('playerMove', async (keys) => {
            if(clients[socket.id] && players[socket.id]){
                moveCheker(socket , keys);
                io.emit("draw", Object.values(players).map(player => player.info).concat(Object.values(coin)));//event to draw in client
            }
        });

        socket.on("disconnect", async (reason) => {
            console.log("Client disconnected. ID: ", socket.id);
            disconnect(socket)
          });
    });

    async function newPlayer(socket){//object player
        players[socket.id] = {
            socket: socket,
            info: {//only data game to not sent ip addres
                id : socket.id,
                image: npcEnv.parsed.NPCIMAGE,
                size : parseInt(npcEnv.parsed.NPCSIZE),
                npcStep : parseInt(npcEnv.parsed.NPCSTEP),
                rank: null,
                score : 0,
                pos : {
                    x : randomPos().x,
                    y : randomPos().y
                }
            }
        }
    }

    async function newCoin(){//create object coin 
        coin = {
            info: {
                image: npcEnv.parsed.COINIMAGE,
                size : parseInt(npcEnv.parsed.COINSIZE),
                pos : {
                    x : randomPos().x,
                    y : randomPos().y
                }
            }
        }
        return coin
    }

    async function moveCheker(socket , keys){// move player and check is on coin
        if ((keys['w'] || keys['W']) && players[socket.id].info.pos.y > parseInt(canvaEnv.parsed.TEXTSPACE)+(parseInt(npcEnv.parsed.NPCSIZE)/2)) 
            players[socket.id].info.pos.y -= players[socket.id].info.npcStep;

        if ((keys['s'] || keys['S'] )&& players[socket.id].info.pos.y < parseInt(canvaEnv.parsed.HEIGHT) - parseInt(npcEnv.parsed.NPCSIZE)) 
            players[socket.id].info.pos.y += players[socket.id].info.npcStep;

        if ((keys['a'] || keys['A'])&& players[socket.id].info.pos.x > 0) 
            players[socket.id].info.pos.x -= players[socket.id].info.npcStep;

        if ((keys['d'] || keys['D'])&& players[socket.id].info.pos.x < parseInt(canvaEnv.parsed.WIDTH) - parseInt(npcEnv.parsed.NPCSIZE)) 
            players[socket.id].info.pos.x += players[socket.id].info.npcStep;
        
        if(Math.abs(players[socket.id].info.pos.x - coin.info.pos.x) <= npcEnv.parsed.NPCSIZE  && Math.abs(players[socket.id].info.pos.y - coin.info.pos.y) <= npcEnv.parsed.NPCSIZE)//player above coin
        {
            newCoin()
            players[socket.id].info.score  += 1
            Object.values(players).sort((player1, player2) => player1.info.score - player2.info.score).reverse().forEach((player,index) => {player.info.rank = index + 1}); //calculate ranck to sort score and reverse arr to use index to get rank
            Object.values(players).forEach((player) => {player.socket.emit(`statisticGame`,{nPlayer : Object.values(players).length , rank : player.info.rank , score : player.info.score})})
        }
    }   
    
    async function disconnect(socket){
        if (clients[socket.id] && players[socket.id]){//check for disconect socket and delete to the list
            delete clients[socket.id];
            delete players[socket.id];
        }
    }

    function randomPos(){
        let pos = {}
        pos.x = Math.floor(Math.random() * (parseInt(canvaEnv.parsed.WIDTH ) - parseInt(canvaEnv.parsed.TEXTSPACE) - parseInt(npcEnv.parsed.NPCSIZE)) + parseInt(canvaEnv.parsed.TEXTSPACE));
        pos.y = Math.floor(Math.random() * (parseInt(canvaEnv.parsed.HEIGHT) - parseInt(canvaEnv.parsed.TEXTSPACE) - parseInt(npcEnv.parsed.NPCSIZE)) + parseInt(canvaEnv.parsed.TEXTSPACE));
        return pos;
    }
}
