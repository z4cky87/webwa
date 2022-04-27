const { Client, MessageMedia } = require("whatsapp-web.js");
const express = require("express");
const { body, validationResult } = require("express-validator");
const socketIO = require("socket.io");
const qrcode = require("qrcode");
const http = require("http");
//const client = new Client();
const fs = require("fs");
const { phoneNumberFormatter } = require("./helpers/formatter");
//const fileUpload = require ('express-fileupload');
const axios = require("axios");
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload({
//     debug : true
// }));

const SESSION_FILE_PATH = "./whatsapp-session.json";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

app.get("/", (req, res) => {
  // res.status(200).json({
  //    status : true,
  //    message : 'Not Just Hello World!'
  // });
  res.sendFile("index.html", { root: __dirname });
});

const client = new Client({
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // <- this one doesn't works in Windows
      "--disable-gpu",
    ],
  },
  session: sessionCfg,
});

// client.on('qr', (qr) => {
//     // Generate and scan this code with your phone
//     console.log('QR RECEIVED', qr);
//     //qrcode.generate(qr);
// });
//dimasukkan dibawah
// client.on('authenticated', (session) => {
//     console.log('AUTHENTICATED', session);
//     sessionCfg=session;
//     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
//         if (err) {
//             console.error(err);
//         }
//     });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });

client.on("message", (msg) => {
  console.log("========================");
  console.log("message:" + JSON.stringify(msg));
  if (msg.body == "ping") {
    msg.reply("pong");
  } else if (msg.body == "good morning") {
    msg.reply("selamat pagi");
  } else if (msg.body == "jadwal kajian") {
    msg.reply(
      "JADWAL KAJIAN MASJID ABU BAKR ASH-SHIDDIQ PERUMAHAN KAMPUNG ISLAMI THOYIBAH  TAMAN RAHMANI SABTU BADA MAGHRIB SETIAP PEKAN PELAJARAN TAHSIN BERSAMA USTADZ ABU YAZID KHULFANUDDIN AHAD BADA SHUBUH PEKAN KEDUA KITAB FIQH ALWAJIZ BERSAMA USTADZ ABU SYAFIQ ADI KAJIAN UMMAHAT FIQH SUNNAH LIN NISSA SETIAP KAMIS SORE BERSAMA USTADZ ABU SYAFIQ ADI AHAD BADA SHUBUH PEKAN KETIGA KITABUT TAUHID BERSAMA USTADZ ABU ISA ABDULLAH BIN SALAM AHAD BA DA MAGHRIB PEKAN KEEMPAT KAJIAN FIQH MU AMALAH BERSAMA USTADZ ABU AFAF MUSA MULYADI"
    );
  } else if (msg.body == "siapa nama kamu") {
    msg.reply("Rahmat Santoso");
  } else if (msg.body == "jenengmu sopo") {
    msg.reply("Rahmat Santoso");
  } else if (msg.body == "alamat") {
    msg.reply("Perumahan Taman Rahmani Blok G29");
  } else if (msg.body == "makanan favorit") {
    msg.reply("Bakso Mie Ayam Soto");
  } else if (msg.body == "wkwkwk") {
    msg.reply("Wkwkwkwkwkwkwk");
  } else if (msg.body == "syukron") {
    msg.reply("Afwan");
  } else if (msg.body == "barakallah fiik") {
    msg.reply("Wafiikum Barakallah");
  } else if (msg.body == "jazakallah khairan") {
    msg.reply("Waiyyaka");
  } else if (msg.body == "makasih") {
    msg.reply("Waiyyaka");
  }
});

client.initialize();
// app.listen(8000,function() {
//     console.log ('App running on * : '+ 8000);
// });
// Socker IO
io.on("connection", function (socket) {
  socket.emit("message", "Connecting...");

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit("message", "QR Code received,scan please!");
    });
  });

  client.on("ready", () => {
    socket.emit("ready", "Whatsapp is Ready");
    socket.emit("message", "Whatsapp is Ready");
  });

  client.on("authenticated", (session) => {
    socket.emit("authenticated", "Whatsapp is authenticated");
    socket.emit("message", "Whatsapp is authenticated");
    console.log("AUTHENTICATED", session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
});

const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
};

//Send Message
app.post("/send-message", (req, res) => {
  const number = req.body.number;
  const message = req.body.message;

  client
    .sendMessage(number, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        response: response,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        response: err,
      });
    });
});

// //Send Message
// app.post(
//   "/send-message",
//   [body("number").notEmpty(), body("message").notEmpty()],
//   async (req, res) => {
//     const errors = validationResult(req).formatWith(({ msg }) => {
//       return msg;
//     });
//     if (!errors.isEmpty()) {
//       return res.status(422).json({
//         status: false,
//         message: errors.mapped(),
//       });
//     }
//     // const number = req.body.number;
//     const number = phoneNumberFormatter(req.body.number);
//     const message = req.body.message;

//     const isRegisteredNumber = await checkRegisteredNumber(number);

//     if (!isRegisteredNumber) {
//       return res.status(422).json({
//         status: false,
//         message: "The Number Is Not Registered",
//       });
//     }

//     client
//       .sendMessage(number, message)
//       .then((response) => {
//         res.status(200).json({
//           status: true,
//           response: response,
//         });
//       })
//       .catch((err) => {
//         res.status(500).json({
//           status: false,
//           response: err,
//         });
//       });
//   }
// );

// //Send Media
// app.post('/send-media',async (req,res)=>{

//     const number = phoneNumberFormatter(req.body.number);
//     const caption = req.body.caption;
//     const fileUrl = req.body.file;

//     let mimetype;
//     const attachment = await axios.get(fileUrl,{responseType:'arraybuffer'}).then(response => {
//         mimetype = response.headers['content-type'];
//         return response.data.toString('base64');
//     });

//     const media = new MessageMedia(mimetype,attachment,'Media');

//     client.sendMessage(number,media,{caption:caption}).then(response => {
//         res.status(200).json({
//             status:true,
//             response:response
//         });
//     }).catch(err=>{
//         res.status(500).json({
//             status:false,
//             response:err
//         });
//     });
// });

server.listen(port, function () {
  console.log("App running on * : " + 8000);
});
