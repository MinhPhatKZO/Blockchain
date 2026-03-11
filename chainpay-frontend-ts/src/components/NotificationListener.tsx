import React, { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface Props {
    walletAddress: string;
}

const NotificationListener: React.FC<Props> = ({ walletAddress }) => {
    useEffect(() => {
        if (!walletAddress) return;

        // 1. Kết nối đến Backend Spring Boot
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);

        // Tắt log debug trong console (bật lại bằng console.log nếu cần fix lỗi)
        stompClient.debug = () => {};

        stompClient.connect({}, () => {
            console.log('✅ WebSocket Connected: ' + walletAddress);

            // 2. Lắng nghe kênh thông báo riêng của User này
            stompClient.subscribe(`/topic/notifications/${walletAddress}`, (message) => {
                if (message.body) {
                    // 3. Hiển thị thông báo (Có thể thay bằng Toastify nếu muốn đẹp hơn)
                    alert("🔔 THÔNG BÁO MỚI:\n" + message.body);
                }
            });
        }, (error: any) => {
            console.error('❌ WebSocket Error:', error);
        });

        // Cleanup khi component unmount
        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {});
            }
        };
    }, [walletAddress]);

    return null; // Component chạy ngầm, không render giao diện
};

export default NotificationListener;