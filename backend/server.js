require('dotenv').config();
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const connection = require('./db');

const app = express();
app.use(express.json());

// multer try uploads
const storage = multer.diskStorage({
  //setup uploads
  destination: (req, file, cb) => {
    // destination carpeta
    cb(null, 'backend/uploads/'); //save in uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

//upload file.csv

app.post('/api/procesar-csv', (req, res) => {
  const filePath = 'backend/uploads/file.csv';

  const resultados = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      let insertados = 0;
      let errores = 0;

      for (const fila of resultados) {
        try {
          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT IGNORE INTO customers (customer_name, customer_email, customer_address, customer_phone) VALUES (?, ?, ?, ?)',
              [
                fila.customer_name,
                fila.customer_email,
                fila.customer_address,
                fila.customer_phone,
              ],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT IGNORE INTO category (category_name) VALUES (?)',
              [fila.product_category],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT IGNORE INTO suppliers (supplier_name, supplier_email) VALUES (?, ?)',
              [fila.supplier_name, fila.supplier_email],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT IGNORE INTO products (product_name, product_sku, unit_price) VALUES (?, ?, ?)',
              [fila.product_name, fila.product_sku, fila.unit_price],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT IGNORE INTO transactions (transactions_id, transaction_date, transaction_customer_id) VALUES (?, ?, (SELECT id FROM customers WHERE customer_email = ?))',
              [fila.transaction_id, fila.date, fila.customer_email],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          insertados++;
        } catch (err) {
          console.error('Error insertando fila:', err);
          errores++;
        }
      }

      res.json({
        message: 'CSV procesado',
        total: resultados.length,
        insertados,
        errores,
      });
    });
});

//created database

const crearTablas = () => {
  // Tabla de usuarios
  connection.query(
    `
    CREATE TABLE IF NOT EXISTS products(product_id int not null PRIMARY KEY, 
    product_name varchar (45) not null,
     product_idcategory int not null, 
     products_supplier_id int
not null);
  `,
    (err) => {
      if (err) console.error('Error creando tabla products:', err);
      else console.log('Tabla products lista');
    }
  );
};

// table products
connection.query(
  `
    CREATE TABLE IF NOT EXISTS  customers(
      id INT NOT NULL PRIMARY KEY,
      customer_name VARCHAR(50) NOT NULL,
      customer_email VARCHAR(60),
      customer_address VARCHAR(60),
      customer_phone VARCHAR(20)
    )
  `,
  (err) => {
    if (err) console.error('Error creando tabla products:', err);
    else console.log('Tabla products lista');
  }
);
connection.query(
  `
CREATE TABLE IF NOT EXISTS  transactions(
      transactions_id INT NOT NULL PRIMARY KEY,
      transaction_date DATE,
      transaction_customer_id INT NOT NULL
)     
`,
  (err) => {
    if (err) console.error('Error creando tabla transactions:', err);
    else console.log('Tabla transactions lista');
  }
);

connection.query(
  `
CREATE TABLE IF NOT EXISTS  suppliers(
      id_suppliers INT NOT NULL PRIMARY KEY,
      supplier_name VARCHAR(50) NOT NULL,
      supplier_email VARCHAR(50)
)     
`,
  (err) => {
    if (err) console.error('Error creando tabla suppliers:', err);
    else console.log('Tabla suppliers lista');
  }
);
connection.query(
  `
CREATE TABLE IF NOT EXISTS  category(
      idcategory INT NOT NULL PRIMARY KEY,
      category_name VARCHAR(40) NOT NULL
)     
`,
  (err) => {
    if (err) console.error('Error creando tabla category:', err);
    else console.log('Tabla category lista');
  }
);
connection.query(
  `
CREATE TABLE IF NOT EXISTS  transaction_details(
      idtransaction_details INT NOT NULL PRIMARY KEY,
      transaction_details_products_id INT NOT NULL,
      transaction_details_quantity INT NOT NULL,
      transaction_details_priceunit DECIMAL, 
      transaction_details_total_line_value DECIMAL NOT NULL
)     
`,
  (err) => {
    if (err) console.error('Error creando tabla transaction_details:', err);
    else console.log('Tabla transaction_details lista');
  }
);
crearTablas();

//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
