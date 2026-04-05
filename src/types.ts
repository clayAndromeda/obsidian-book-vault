export interface BookInfo {
	title: string;
	subtitle: string;
	authors: string[];
	publisher: string;
	publishedDate: string;
	description: string;
	pageCount: number;
	categories: string[];
	isbn10: string;
	isbn13: string;
	thumbnailUrl: string;
	googleBooksUrl: string;
}

export interface BookVaultSettings {
	noteFolder: string;
	fileNameTemplate: string;
	noteTemplate: string;
	downloadThumbnail: boolean;
	thumbnailFolder: string;
	openAfterCreate: boolean;
	maxSearchResults: number;
	googleBooksApiKey: string;
}

export const DEFAULT_NOTE_TEMPLATE = `---
title: "{{title}}"
subtitle: "{{subtitle}}"
authors: [{{authors}}]
publisher: "{{publisher}}"
publishedDate: "{{publishedDate}}"
pageCount: {{pageCount}}
isbn10: "{{isbn10}}"
isbn13: "{{isbn13}}"
categories: [{{categories}}]
status: unread
rating:
date: "{{date}}"
---

# {{title}}

{{thumbnail}}

## 書籍情報
- **著者**: {{authors}}
- **出版社**: {{publisher}}
- **出版日**: {{publishedDate}}
- **ページ数**: {{pageCount}}
- **ISBN**: {{isbn13}}
- **Google Books**: [リンク]({{googleBooksUrl}})

## 概要
{{description}}

## メモ


## 引用


## 感想

`;

export const DEFAULT_SETTINGS: BookVaultSettings = {
	noteFolder: "Books",
	fileNameTemplate: "{{title}}",
	noteTemplate: DEFAULT_NOTE_TEMPLATE,
	downloadThumbnail: true,
	thumbnailFolder: "Books/thumbnails",
	openAfterCreate: true,
	maxSearchResults: 10,
	googleBooksApiKey: "",
};
