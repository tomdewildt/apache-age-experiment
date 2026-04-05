import { client } from "./index";

const GRAPH_NAME = "network";

function toCypherProps(props: Record<string, unknown>): string {
  const entries = Object.entries(props).map(([key, value]) => {
    if (typeof value === "string") return `${key}: '${value}'`;
    return `${key}: ${value}`;
  });
  return `{${entries.join(", ")}}`;
}

export async function setupAge() {
  await client.unsafe(`LOAD 'age'`);
  await client.unsafe(`SET search_path = ag_catalog, "$user", public`);
}

export async function truncateGraph() {
  await client.unsafe(
    `SELECT * FROM cypher('${GRAPH_NAME}', $$ MATCH (v) DETACH DELETE v $$) AS (v agtype)`,
  );
}

export async function createEntity(
  label: string,
  properties: Record<string, unknown>,
) {
  const result = await client.unsafe(
    `SELECT * FROM cypher('${GRAPH_NAME}', $$
      CREATE (v:${label} ${toCypherProps(properties)})
      RETURN v
    $$) AS (v agtype)`,
  );
  return result;
}

export async function linkEntities(
  fromLabel: string,
  fromMatch: Record<string, unknown>,
  edgeType: string,
  edgeProps: Record<string, unknown>,
  toLabel: string,
  toMatch: Record<string, unknown>,
) {
  const result = await client.unsafe(
    `SELECT * FROM cypher('${GRAPH_NAME}', $$
      MATCH (a:${fromLabel} ${toCypherProps(fromMatch)}), (b:${toLabel} ${toCypherProps(toMatch)})
      CREATE (a)-[e:${edgeType} ${toCypherProps(edgeProps)}]->(b)
      RETURN e
    $$) AS (e agtype)`,
  );
  return result;
}

export async function findConnections(
  label: string,
  match: Record<string, unknown>,
  edgeType?: string,
) {
  const edgePattern = edgeType ? `[:${edgeType}]` : `[]`;
  const result = await client.unsafe(
    `SELECT * FROM cypher('${GRAPH_NAME}', $$
      MATCH (a:${label} ${toCypherProps(match)})-${edgePattern}->(b)
      RETURN b
    $$) AS (b agtype)`,
  );
  return result;
}

export async function queryGraph(
  cypherQuery: string,
  columns: string[] = ["result"],
) {
  const columnDefs = columns.map((c) => `${c} agtype`).join(", ");
  const result = await client.unsafe(
    `SELECT * FROM cypher('${GRAPH_NAME}', $$ ${cypherQuery} $$) AS (${columnDefs})`,
  );
  return result;
}
