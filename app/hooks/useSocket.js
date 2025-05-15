import {useEffect, useState} from 'react';
import io from 'socket.io-client';

export default function useSocket(url) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketIo = io(url, {
            path: '/api/socket'
        });

        setSocket(socketIo);

        function cleanup() {
            socketIo.disconnect();
        }

        return cleanup;
    }, [url]);

    return socket;
};

