const http = require("http");
const express = require('express');
const socketIo = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const PORT = 3000;
app.use(cors());
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const users = [];
const io = socketIo(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
    console.log('A user connected:', socket.id);

    socket.on("message", (data) => {
        const user = findUser(data.name);

        switch(data.type) {
            case "store_user":
                if (user !== undefined) {
                    socket.emit("user_already_exists", { type: "user_already_exists" });
                    return;
                }
                const newUser = {
                    name: data.name,
                    socket: socket
                };
                users.push(newUser);
                break;

            case "start_call":
                const userToCall = findUser(data.target);
                console.log(`user: ${socket.id}`);

                if (userToCall) {
                    console.log("call");
                    socket.emit("call_response", { type: "call_response", data: "user is ready for call" });
                } else {
                    console.log("not online");
                    socket.emit("call_response", {type: "call_response", data: "user is not online"});
                }
                break;

            case "create_offer":
                console.log("entered to create an offer");
                const userToReceiveOffer = findUser(data.target);
                if (userToReceiveOffer) {
                    io.to(userToReceiveOffer.socket.id).emit("offer_received", { type: "offer_received", name: data.name, data: data.data.sdp });
                }
                break;

            case "create_answer":
                const userToReceiveAnswer = findUser(data.target);
                if (userToReceiveAnswer) {
                   io.to(userToReceiveAnswer.socket.id).emit("answer_received", { type: "answer_received", name: data.name, data: data.data.sdp });
                }
                break;

            case "ice_candidate":
                const userToReceiveIceCandidate = findUser(data.target);
                if (userToReceiveIceCandidate) {
                    io.to(userToReceiveIceCandidate.socket.id).emit("ice_candidate", {
                        type: "ice_candidate",
                        name: data.name,
                        data: {
                            sdpMLineIndex: data.data.sdpMLineIndex,
                            sdpMid: data.data.sdpMid,
                            sdpCandidate: data.data.sdpCandidate
                        }
                    });
                }
                break;
        }
    });

    socket.on("disconnect", () => {
        console.log('User disconnected:', socket.id);
        const index = users.findIndex(user => user.socket === socket);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});

const findUser = (username) => {
    return users.find(user => user.name === username);
};
