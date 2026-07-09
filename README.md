# 수우 술 메뉴 아카이브

이자카야 '수우'의 사케 / 소주 / 전통주 메뉴를 손님이 방문 전에 미리 둘러볼 수 있는 안내 사이트입니다.
**온라인 주문 기능은 없습니다.** Notion DB와 연동해 유지보수합니다.

## 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

`NOTION_TOKEN` / `NOTION_DATABASE_ID` 가 없으면 자동으로 `lib/mock-drinks.ts`의 목 데이터를 사용합니다.

## Notion 연동 설정 (실제 메뉴 데이터 연결하기)

1. https://www.notion.so/my-integrations 에서 새 Integration을 만들고 토큰(Internal Integration Secret)을 복사합니다.
2. 술 메뉴가 있는 Notion 데이터베이스 페이지 우측 상단 `...` 메뉴 → `연결(Connections)` → 방금 만든 integration을 추가해 DB를 공유합니다.
3. 프로젝트 루트에 `.env.local` 파일을 만들고 `.env.local.example`을 참고해 값을 채웁니다.
   - `NOTION_DATABASE_ID`는 DB 페이지 URL의 32자리 문자열입니다.
4. 아래 명령으로 실제 DB의 컬럼명을 확인합니다.

   ```bash
   npm run notion:schema
   ```

5. 출력된 컬럼명이 `lib/notion.ts`의 `FIELD_CANDIDATES`와 다르면, 해당 배열에 실제 컬럼명을 추가/수정합니다.
6. `npm run dev`로 다시 실행하면 실제 Notion 데이터가 반영됩니다. 이후 Notion에서 항목을 수정하면 최대 1시간(`revalidate: 3600`) 내 사이트에 자동 반영됩니다.

## 카테고리 매핑 규칙

- Notion의 카테고리 값에 "소주"가 포함되면(예: 고구마 소주, 보리 소주) 사이트에서는 하나의 **소주** 섹션으로 합쳐집니다.
- "사케" / "전통주" 문자열을 포함하는 카테고리만 노출됩니다. 잔음료, 리큐어 등 다른 카테고리는 자동으로 제외됩니다.
- 세부 구분(고구마/보리, 잔/병 등)은 `종류` 필드로 항목 상세 페이지에 표시됩니다.
