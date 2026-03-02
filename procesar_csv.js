const mysql = require('mysql2');
const csv = require('csv-parser');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Qwe.123*',
  database: 'LogiTechSolutions',
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    process.exit(1);
  }
  console.log('Conectado a MySQL');

  connection.query(
    'ALTER TABLE customers MODIFY id INT AUTO_INCREMENT',
    (err) => {
      if (err) console.log('customers:', err.message);
      else console.log('customers modificada');
    }
  );

  connection.query(
    'ALTER TABLE products MODIFY product_id INT AUTO_INCREMENT',
    (err) => {
      if (err) console.log('products:', err.message);
      else console.log('products modificada');
    }
  );

  connection.query(
    'ALTER TABLE suppliers MODIFY id_suppliers INT AUTO_INCREMENT',
    (err) => {
      if (err) console.log('suppliers:', err.message);
      else console.log('suppliers modificada');
    }
  );

  connection.query(
    'ALTER TABLE category MODIFY idcategory INT AUTO_INCREMENT',
    (err) => {
      if (err) console.log('category:', err.message);
      else console.log('category modificada');
    }
  );

  connection.query(
    'ALTER TABLE transactions MODIFY transactions_id INT AUTO_INCREMENT',
    (err) => {
      if (err) console.log('transactions:', err.message);
      else console.log('transactions modificada');
    }
  );

  const filePath = 'backend/uploads/file.csv';
  const resultados = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      console.log(`\nTotal filas leídas: ${resultados.length}`);
      console.log('Insertando datos...\n');

      let insertados = 0;
      let errores = 0;

      const clientesInsertados = new Map();
      const categoriasInsertadas = new Map();
      const proveedoresInsertados = new Map();

      for (const fila of resultados) {
        try {
          const emailCliente = fila.customer_email;
          if (!clientesInsertados.has(emailCliente)) {
            await new Promise((resolve, reject) => {
              connection.query(
                'INSERT INTO customers (customer_name, customer_email, customer_address, customer_phone) VALUES (?, ?, ?, ?)',
                [
                  fila.customer_name,
                  emailCliente,
                  fila.customer_address,
                  fila.customer_phone,
                ],
                (err, result) => {
                  if (err) return reject(err);
                  clientesInsertados.set(emailCliente, result.insertId);
                  resolve();
                }
              );
            });
          }

          // 2. Insertar categoría (solo si no existe)
          const nombreCategoria = fila.product_category;
          if (!categoriasInsertadas.has(nombreCategoria)) {
            await new Promise((resolve, reject) => {
              connection.query(
                'INSERT INTO category (category_name) VALUES (?)',
                [nombreCategoria],
                (err, result) => {
                  if (err) return reject(err);
                  categoriasInsertadas.set(nombreCategoria, result.insertId);
                  resolve();
                }
              );
            });
          }

          const nombreProveedor = fila.supplier_name;
          if (!proveedoresInsertados.has(nombreProveedor)) {
            await new Promise((resolve, reject) => {
              connection.query(
                'INSERT INTO suppliers (supplier_name, supplier_email) VALUES (?, ?)',
                [nombreProveedor, fila.supplier_email],
                (err, result) => {
                  if (err) return reject(err);
                  proveedoresInsertados.set(nombreProveedor, result.insertId);
                  resolve();
                }
              );
            });
          }

          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT INTO products (product_name, product_sku, unit_price) VALUES (?, ?, ?)',
              [fila.product_name, fila.product_sku, fila.unit_price],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });

          await new Promise((resolve, reject) => {
            connection.query(
              'INSERT INTO transactions (transaction_date, transaction_customer_id) VALUES (?, ?)',
              [fila.date, clientesInsertados.get(emailCliente)],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });

          insertados++;
          console.log(`✓ ${fila.customer_name} - ${fila.product_name}`);
        } catch (err) {
          console.error(`✗ Error: ${err.message}`);
          errores++;
        }
      }

      console.log(`\n===================`);
      console.log(`Total procesados: ${insertados}`);
      console.log(`Total errores: ${errores}`);
      console.log(`===================\n`);

      console.log(`Clientes únicos: ${clientesInsertados.size}`);
      console.log(`Categorías únicas: ${categoriasInsertadas.size}`);
      console.log(`Proveedores únicos: ${proveedoresInsertados.size}`);

      connection.end();
    });
});
