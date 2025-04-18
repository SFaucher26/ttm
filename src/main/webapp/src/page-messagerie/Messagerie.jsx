// import React, {useState, useMemo, useEffect, useContext, useRef} from "react";
// import { useParams } from "react-router-dom";
// import { Stomp } from '@stomp/stompjs';
// import { AuthContext } from "../context/AuthContext.jsx";
//
//
// export default function Messagerie(){
//     const { id: destId } = useParams();
//     const {auth } = useContext(AuthContext);
//     const senderId = auth?.id;
//     const [loadMessage, setLoadMessages ] = useState(false);
//     const [loader, setLoader] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [content, setContent] = useState("");
//     const [isConnected, setIsConnected] = useState(false);
//
//     //connexion au websocket
//     const client = useMemo(()=>{
//         return Stomp.client("ws://localhost:8080/ws")
//     }, []);
//
//     /**
//      * Récupérer les messages entre deux interlocuteurs
//      */
//
//     useEffect(() => {
//         // permet de vérifier si la connexion est déjà établie pour ne pas la répéter
//         if (!isConnected) {
//             setLoader(true);
//             client.connect({}, () => {
//                 setIsConnected(true); // défini la connexion établie
//
//                 client.subscribe('/getMessages', (e) => {
//                     console.log('Receive Message', e.body);
//                     setMessages(JSON.parse(e.body));
//                     setLoader(false);
//                 });
//
//                 client.subscribe('/newMessage', (e) => {
//                     console.log('New Message', e.body);
//                     setMessages((prev) => [...prev, JSON.parse(e.body)]);
//                 });
//
//                 client.send('/requestMessages', {}, JSON.stringify({
//                     senderId: senderId,
//                     destId: parseInt(destId)
//                 }));
//             });
//         }
//     }, [client, destId, senderId, isConnected]);
//
//
//     /**
//      * Envoyer un message qui est persisté en base mongodb pour l'utilisateur récupéré dans l'url
//      */
//     const sendMessage = () => {
//         if (!content.trim()) return;
//         client.send("/send", {}, JSON.stringify({
//             destId: parseInt(destId),
//             content: content.trim()
//         }));
//         setContent("");
//     };
//
//     return (
//         <>
//             <h1>Page Messagerie</h1>
//
//             <div className="message-card">
//                 <div className="messages-box">
//                     <ul>
//                         {messages.map((message, index) => {
//                             return (
//                                 <li
//                                     key={`${message._id.timestamp}-${index}`}
//                                 >
//                                     <p className="username">{message.sender}</p>
//                                     <p className="content">{message.content}</p>
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </div>
//
//                 <div className="input-area">
//                     <input
//                         type="text"
//                         value={content}
//                         onChange={(e) => setContent(e.target.value)}
//                         placeholder="Écris ton message ici..."
//                     />
//                     <button onClick={sendMessage} >Envoyer</button>
//                 </div>
//             </div>
//         </>
//     )
//
// }

import { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Stomp } from "@stomp/stompjs";
import { AuthContext } from "../context/AuthContext";


export default function Messagerie() {
    const { id: destId } = useParams();
    const { auth } = useContext(AuthContext);
    const senderId = auth?.id;

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loader, setLoader] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const clientRef = useRef(null);
    const subscriptionsRef = useRef({});

    // --- Setup WebSocket ---
    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = Stomp.client("ws://localhost:8080/ws");
        }

        const client = clientRef.current;

        if (!client.connected && !isConnected) {
            setLoader(true);

            client.connect({}, () => {
                setIsConnected(true);

                // Souscrit à getMessages si non existant
                if (!subscriptionsRef.current.getMessages) {
                    const sub = client.subscribe("/getMessages", (e) => {
                        console.log("Receive Message", e.body);
                        setMessages(JSON.parse(e.body));
                        setLoader(false);
                    });
                    subscriptionsRef.current.getMessages = sub;
                }

                // Souscrit à newMessage si non existant
                if (!subscriptionsRef.current.newMessage) {
                    const sub = client.subscribe("/newMessage", (e) => {
                        console.log("New Message", e.body);
                        setMessages((prev) => [...prev, JSON.parse(e.body)]);
                    });
                    subscriptionsRef.current.newMessage = sub;
                }

                // Souscrit à updateMessage si non existant

                // Souscrit à deleteMessage si non existant
                if (!subscriptionsRef.current.deleteMessage) {
                    const sub = clientRef.current.subscribe("/deleteMessage", (e) => {
                        const deletedId = e.body;
                        console.log("Message supprimé reçu :", deletedId);

                        setMessages((prev) =>
                            prev.filter((msg) =>
                                msg._id !== deletedId && msg._id?.$oid !== deletedId
                            )
                        );
                    });
                    subscriptionsRef.current.deleteMessage = sub;
                }

                // Request initial messages
                client.send(
                    "/requestMessages",
                    {},
                    JSON.stringify({
                        senderId,
                        destId: parseInt(destId),
                    })
                );
            });
        }

        // Optional cleanup if component unmounts
        return () => {
            if (client.connected) {
                Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
                client.disconnect(() => {
                    console.log("WebSocket disconnected");
                    setIsConnected(false);
                });
            }
        };
    }, [senderId, destId]);

    // --- Send Message ---
    const sendMessage = () => {
        if (!content.trim()) return;

        const client = clientRef.current;
        if (client && client.connected) {
            client.send(
                "/send",
                {},
                JSON.stringify({
                    destId: parseInt(destId),
                    content: content.trim(),
                })
            );
            setContent("");
        } else {
            console.warn("WebSocket non connecté !");
        }
    };

    //--- Delete Message ---
    const handleDelete = (id) => {
        console.log("Message ID à supprimer :", id);
        const client = clientRef.current;
        if (client && client.connected) {
            client.send(
                "/delete",
                {},
                JSON.stringify({ _id: id })
            );
        } else {
            console.warn("WebSocket non connecté !");
        }
    };
    return (
        <>
            <h1>Page Messagerie</h1>

            <div className="message-card">
                <div className="messages-box">
                    {loader && <p>Chargement des messages...</p>}
                    <ul>
                        {messages.map((message) => {
                            const messageId = message._id;
                            return (
                                <li key={messageId}>
                                    <p className="username">{message.sender}</p>
                                    <p className="content">{message.content}</p>
                                    <button onClick={() => handleDelete(messageId)}>Supprimer</button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="input-area">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Écris ton message ici..."
                    />
                    <button onClick={sendMessage}>Envoyer</button>

                </div>
            </div>
        </>
    );
}
