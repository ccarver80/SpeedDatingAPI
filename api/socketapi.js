const io = require("socket.io")({
  cors: {
    origin: "http:localhost:3000",
    methods: ["GET", "POST"],
  },
});
const socketapi = {
  io: io,
};

io.on("connection", (socket) => {
  console.log("A USER CONNECTED!");
});

module.exports = socketapi;
