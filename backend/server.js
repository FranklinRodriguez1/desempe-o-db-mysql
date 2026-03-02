const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const connection = require("./db");

const app = express();
const port = 3000;

app.use(express.json());

const upload = multer({
  dest: "uploads/"
}); 

app.post("/upload", upload.single("file"), (req, res) => {

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {

      results.forEach((row) => {
        connection.query("INSERT INTO products SET ?", row, (err) => {
          if (err) console.error(err);
        });
      });

      res.send("Datos insertados correctamente");
    });

}); 

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});