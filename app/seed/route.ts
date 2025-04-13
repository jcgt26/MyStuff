
import bcrypt from 'bcrypt';

//import { db } from '@vercel/postgres';

import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import {Client} from "pg";
import DBClient from "@/app/lib/DBClient";
import {log} from "next/dist/server/typescript/utils";
// Replace '@vercel/postgres' with 'pg'


async function seedUsers(client: DBClient) {
  console.log("seedUsers");
  await client.runQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await client.runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
  console.log("RUNING USERS");
  try {
    return await Promise.all( // TODO user real params instead of injected ones
        users.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return client.runQuery(`
        INSERT INTO users (name, username ,email, password, role)
        VALUES ('${user.name}', '${user.username}','${user.email}', '${hashedPassword}', '${user.role}')
        ON CONFLICT (id) DO NOTHING;
      `);
        }),
    );
  }catch (exception){
    return Promise.reject(exception);
  }
}
/*
async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}*/

export async function GET() {
  try {
    let failed: boolean = false;

    const client =  await DBClient.getInstance();
    seedUsers(client).then(() => {
      console.log("All done!");
    }).catch((error) => {
      console.log(`Error while running query: \n${JSON.stringify(error)}`);
      failed = true;
    });

  //  await seedCustomers();
   // await seedInvoices();
   // await seedRevenue();
    //await client.sql`COMMIT`;
    if(failed){
      return Response.json({message: 'Query failed.'})
    }

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    //await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
