import { Pool } from 'pg';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import "dotenv/config"

// Initialize the pool with the environment variable
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
  // ssl: { rejectUnauthorized: false } // Important for cloud-hosted databases
});

function parseDate(dateString: string): string {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  console.warn(`Could not parse date: ${dateString}`);
  throw Error();
}

export async function seed() {
  const db = await pool.connect();

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS unicorns (
      id SERIAL PRIMARY KEY,
      company VARCHAR(255) NOT NULL UNIQUE,
      valuation DECIMAL(10, 2) NOT NULL,
      date_joined DATE,
      country VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      industry VARCHAR(255) NOT NULL,
      select_investors TEXT NOT NULL
    );
  `;

  const createTable = await db.query(createTableSql);

  console.log(`Created "unicorns" table`);

  const results: any[] = [];
  const csvFilePath = path.join(process.cwd(), 'unicorns.csv');

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  for (const row of results) {
    try {
      const formattedDate = parseDate(row['Date Joined']);
      const formattedInvestors = row['Select Inverstors'] as string;

      const insertSql = `
      INSERT INTO unicorns (company, valuation, date_joined, country, city, industry, select_investors)
      VALUES (
        '${row.Company.replace("'", "''")}',
        ${parseFloat(row['Valuation ($B)'].replace('$', '').replace(',', ''))},
        '${formattedDate}',
        '${row.Country.replace("'", "''")}',
        '${row.City.replace("'", "''")}',
        '${row.Industry.replace("'", "''")}',
        '${formattedInvestors.replace("'", "''")}'
      )
      ON CONFLICT (company) DO NOTHING;
    `;
      await db.query(insertSql);
      console.log(`Inserted ${row.Company}`);
    } catch (e) {
      console.log(`Error in inserted ${row.Company}`, e);
      return;
    }
  }

  console.log(`Seeded ${results.length} unicorns`);

  return {
    createTable,
    unicorns: results,
  };
}


seed().catch(console.error);