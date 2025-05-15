import {Server} from 'socket.io';

const SocketHandler = (req, res) => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        io.on('connection', (socket) => {
            /*  console.log('a user connected');*/

            socket.on('joinAuction', (auctionId) => {
                socket.join(auctionId);
                /*   console.log(`User joined auction: ${auctionId}`);*/
            });

            socket.on('currentPriceUpdate', ({auctionId, updatedPrice}) => {
                /* console.log(`currentPriceUpdate received for auction ${auctionId}:`, updatedPrice);*/
                io.to(auctionId).emit('currentPriceUpdate', updatedPrice);
            });

            socket.on('disconnect', () => {
                /*  console.log('user disconnected');*/
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default SocketHandler;
