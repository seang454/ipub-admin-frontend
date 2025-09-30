/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";
import { Pool } from "pg";

const pool = new Pool({
   user: "postgres",
  host: "db.docuhub.me",
  database: "db_docuhub",
  password: "qwer",
  port: 5400,
});

async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

async function seed() {
  try {
    // --- USERS ---
    const userUUIDs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const uuid = faker.string.uuid();
      userUUIDs.push(uuid);
      await query(
        `INSERT INTO users (id, full_name, contact_number, create_date, uuid, is_admin, is_advisor, is_student, is_user)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          i + 1,
          faker.person.fullName(),
          faker.phone.number({ style: "national" }),
          faker.date.past({ years: 2 }).toISOString().split("T")[0],
          uuid,
          faker.datatype.boolean(),
          faker.datatype.boolean(),
          faker.datatype.boolean(),
          true,
        ]
      );
    }

    // --- CATEGORIES ---
    const categoryUUIDs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const uuid = faker.string.uuid();
      categoryUUIDs.push(uuid);
      const name = faker.commerce.department();
      await query(
        `INSERT INTO categories (id, name, slug, uuid, created_date)
         VALUES ($1,$2,$3,$4,$5)`,
        [i + 1, name, faker.helpers.slugify(name), uuid, faker.date.past({ years: 2 }).toISOString().split("T")[0]]
      );
    }

    // --- SPECIALIZES ---
    const specializeUUIDs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const uuid = faker.string.uuid();
      specializeUUIDs.push(uuid);
      const name = faker.word.noun();
      await query(
        `INSERT INTO specializes (id, name, slug, uuid) VALUES ($1,$2,$3,$4)`,
        [i + 1, name, faker.helpers.slugify(name), uuid]
      );
    }

    // --- PAPERS ---
    const paperUUIDs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const uuid = faker.string.uuid();
      paperUUIDs.push(uuid);
      await query(
        `INSERT INTO papers (id, title, uuid, author_uuid, category_uuid, created_at, submitted_at, status, is_approved, is_deleted, is_published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          i + 1,
          faker.lorem.sentence(),
          uuid,
          userUUIDs[i % userUUIDs.length],
          categoryUUIDs[i % categoryUUIDs.length],
          faker.date.past({ years: 2 }).toISOString().split("T")[0],
          faker.date.past({ years: 1 }).toISOString().split("T")[0],
          "SUBMITTED",
          true,
          false,
          true,
        ]
      );
    }

    // --- ADVISER ASSIGNMENTS ---
    const assignmentUUIDs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const uuid = faker.string.uuid();
      assignmentUUIDs.push(uuid);
      await query(
        `INSERT INTO adviser_assignments (id, assigned_date, deadline, status, uuid, admin_uuid, advisor_uuid, paper_uuid)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          i + 1,
          faker.date.past({ years: 2 }).toISOString().split("T")[0],
          faker.date.future({ years: 1 }).toISOString().split("T")[0],
          "PENDING",
          uuid,
          userUUIDs[i % userUUIDs.length],
          userUUIDs[(i + 1) % userUUIDs.length],
          paperUUIDs[i % paperUUIDs.length],
        ]
      );
    }

    // --- ADVISER SPECIALIZES ---
    for (let i = 0; i < 3; i++) {
      await query(
        `INSERT INTO adviser_specializes (adviser_uuid, specialize_uuid) VALUES ($1,$2)`,
        [userUUIDs[i % userUUIDs.length], specializeUUIDs[i % specializeUUIDs.length]]
      );
    }

    console.log("✅ Seeded all tables with 3 rows each.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
