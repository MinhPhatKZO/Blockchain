import React, { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

import { walletText } from '../text';

interface Props {
    walletAddress: string;
}

const NotificationListener: React.FC<Props> = ({ walletAddress }) => {
    useEffect(() => {
        if (!walletAddress) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);

        stompClient.debug = () => {};

        stompClient.connect({}, () => {
            console.log(walletText.notification.connected(walletAddress));

            stompClient.subscribe(`/topic/notifications/${walletAddress}`, (message) => {
                if (message.body) {
                    alert(walletText.notification.newAlertPrefix + message.body);
                }
            });
        }, (error: any) => {
            console.error(walletText.notification.websocketError, error);
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {});
            }
        };
    }, [walletAddress]);

    return null;
};

export default NotificationListener;
