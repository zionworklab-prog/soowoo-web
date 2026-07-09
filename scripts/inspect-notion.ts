import { Client } from "@notionhq/client";

// .env.local에 NOTION_TOKEN, NOTION_DATABASE_ID를 넣은 뒤
// `npm run notion:schema` 로 실행하면 실제 Notion DB의 컬럼명/타입을 출력한다.
// 이 결과를 보고 lib/notion.ts의 FIELD_CANDIDATES를 실제 컬럼명에 맞춰 조정한다.

async function main() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    console.error(
      "NOTION_TOKEN / NOTION_DATABASE_ID 가 없습니다. .env.local을 확인하세요."
    );
    process.exit(1);
  }

  const notion = new Client({ auth: token });
  const database = await notion.databases.retrieve({ database_id: databaseId });

  if (!("data_sources" in database)) {
    console.error("이 database_id에서 data source를 찾을 수 없습니다.");
    process.exit(1);
  }

  const dataSourceId = database.data_sources[0]?.id;
  if (!dataSourceId) {
    console.error("data source id가 비어 있습니다.");
    process.exit(1);
  }

  const dataSource = await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  });

  console.log("=== DB 컬럼 목록 ===");
  if ("properties" in dataSource) {
    for (const [name, prop] of Object.entries(dataSource.properties)) {
      console.log(`- ${name} (${prop.type})`);
    }
  }

  const sample = await notion.dataSources.query({
    data_source_id: dataSourceId,
    page_size: 1,
  });
  console.log("\n=== 샘플 행 1건 ===");
  console.log(JSON.stringify(sample.results[0], null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
