import { client, db } from "./db";
import {
  createEntity,
  findConnections,
  linkEntities,
  queryGraph,
  setupAge,
  truncateGraph,
} from "./db/age";
import { entities } from "./db/schema";

async function main() {
  console.log("Setting up Apache AGE...\n");
  await setupAge();

  await truncateGraph();

  // --- Relational: track entities in Drizzle ---
  console.log("--- Drizzle ORM (Relational Registry) ---");
  const inserted = await db
    .insert(entities)
    .values([
      {
        label: "Person",
        properties: { firstName: "Alice", lastName: "de Vries", age: 30 },
      },
      {
        label: "Person",
        properties: { firstName: "Bob", lastName: "Jansen", age: 25 },
      },
      {
        label: "Person",
        properties: { firstName: "Charlie", lastName: "Bakker", age: 40 },
      },
      { label: "Company", properties: { name: "Acme Corp", industry: "Tech" } },
      { label: "Company", properties: { name: "Globex", industry: "Finance" } },
      {
        label: "Address",
        properties: { street: "123 Main St", city: "Amsterdam", zip: "1011AB" },
      },
      {
        label: "Address",
        properties: { street: "456 Oak Ave", city: "Rotterdam", zip: "3011AA" },
      },
    ])
    .returning();
  console.log("Registered entities:", inserted);

  // --- Graph: create vertices ---
  console.log("\n--- Apache AGE (Graph Network) ---");
  await createEntity("Person", {
    firstName: "Alice",
    lastName: "de Vries",
    age: 30,
  });
  await createEntity("Person", {
    firstName: "Bob",
    lastName: "Jansen",
    age: 25,
  });
  await createEntity("Person", {
    firstName: "Charlie",
    lastName: "Bakker",
    age: 40,
  });
  await createEntity("Company", { name: "Acme Corp", industry: "Tech" });
  await createEntity("Company", { name: "Globex", industry: "Finance" });
  await createEntity("Address", {
    street: "123 Main St",
    city: "Amsterdam",
    zip: "1011AB",
  });
  await createEntity("Address", {
    street: "456 Oak Ave",
    city: "Rotterdam",
    zip: "3011AA",
  });
  console.log("Created 7 entities (3 persons, 2 companies, 2 addresses)");

  // --- Graph: create typed edges ---
  console.log("\nLinking entities...");

  // Alice and Acme Corp both at 123 Main St (shared address)
  await linkEntities(
    "Person",
    { firstName: "Alice" },
    "LIVES_AT",
    {},
    "Address",
    { street: "123 Main St" },
  );
  await linkEntities(
    "Company",
    { name: "Acme Corp" },
    "LOCATED_AT",
    {},
    "Address",
    { street: "123 Main St" },
  );

  // Bob lives at 456 Oak Ave, and Globex is also there
  await linkEntities(
    "Person",
    { firstName: "Bob" },
    "LIVES_AT",
    {},
    "Address",
    { street: "456 Oak Ave" },
  );
  await linkEntities(
    "Company",
    { name: "Globex" },
    "LOCATED_AT",
    {},
    "Address",
    { street: "456 Oak Ave" },
  );

  // Charlie also lives at 123 Main St (same address as Alice)
  await linkEntities(
    "Person",
    { firstName: "Charlie" },
    "LIVES_AT",
    {},
    "Address",
    { street: "123 Main St" },
  );

  // Employment
  await linkEntities(
    "Person",
    { firstName: "Alice" },
    "WORKS_AT",
    { role: "Engineer", since: 2022 },
    "Company",
    { name: "Acme Corp" },
  );
  await linkEntities(
    "Person",
    { firstName: "Bob" },
    "WORKS_AT",
    { role: "Analyst", since: 2023 },
    "Company",
    { name: "Globex" },
  );
  await linkEntities(
    "Person",
    { firstName: "Charlie" },
    "WORKS_AT",
    { role: "Manager", since: 2020 },
    "Company",
    { name: "Acme Corp" },
  );

  // Personal connections
  await linkEntities(
    "Person",
    { firstName: "Alice" },
    "KNOWS",
    { since: 2021 },
    "Person",
    { firstName: "Bob" },
  );
  await linkEntities(
    "Person",
    { firstName: "Alice" },
    "KNOWS",
    { since: 2019 },
    "Person",
    { firstName: "Charlie" },
  );

  console.log("Created 10 edges");

  // --- Queries ---
  console.log("\n--- Queries ---");

  console.log("\nAll of Alice's connections:");
  const aliceConnections = await findConnections("Person", {
    firstName: "Alice",
  });
  console.log(aliceConnections);

  console.log("\nWho lives at 123 Main St?");
  const sameAddress = await queryGraph(
    "MATCH (n)-[]->(a:Address {street: '123 Main St'}) RETURN n",
  );
  console.log(sameAddress);

  console.log("\nWho shares an address with a company?");
  const sharedAddress = await queryGraph(
    "MATCH (p:Person)-[:LIVES_AT]->(a:Address)<-[:LOCATED_AT]-(c:Company) RETURN p, a, c",
    ["p", "a", "c"],
  );
  console.log(sharedAddress);

  console.log("\nAll colleagues (people at the same company):");
  const colleagues = await queryGraph(
    "MATCH (p1:Person)-[:WORKS_AT]->(c:Company)<-[:WORKS_AT]-(p2:Person) WHERE p1 <> p2 RETURN p1, c, p2",
    ["p1", "c", "p2"],
  );
  console.log(colleagues);

  console.log("\nFull network:");
  const fullNetwork = await queryGraph("MATCH (a)-[e]->(b) RETURN a, e, b", [
    "a",
    "e",
    "b",
  ]);
  console.log(fullNetwork);

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
