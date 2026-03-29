import { App, Notice, TFile, requestUrl, normalizePath } from "obsidian";
import { BookInfo, BookVaultSettings } from "./types";

function formatDate(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function replacePlaceholders(template: string, book: BookInfo, thumbnailEmbed: string): string {
	const replacements: Record<string, string> = {
		title: book.title,
		subtitle: book.subtitle,
		authors: book.authors.join(", "),
		publisher: book.publisher,
		publishedDate: book.publishedDate,
		description: book.description,
		pageCount: String(book.pageCount),
		categories: book.categories.join(", "),
		isbn10: book.isbn10,
		isbn13: book.isbn13,
		thumbnailUrl: book.thumbnailUrl,
		thumbnail: thumbnailEmbed,
		googleBooksUrl: book.googleBooksUrl,
		date: formatDate(),
	};

	return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
		return replacements[key] ?? "";
	});
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
	const normalized = normalizePath(folderPath);
	if (normalized === "" || normalized === ".") return;
	const existing = app.vault.getAbstractFileByPath(normalized);
	if (!existing) {
		await app.vault.createFolder(normalized);
	}
}

async function downloadThumbnail(app: App, book: BookInfo, settings: BookVaultSettings): Promise<string> {
	if (!book.thumbnailUrl || !settings.downloadThumbnail) return "";

	const safeName = book.title.replace(/[\\/:*?"<>|]/g, "_");
	const fileName = `${safeName}.jpg`;
	const filePath = normalizePath(`${settings.thumbnailFolder}/${fileName}`);

	await ensureFolder(app, settings.thumbnailFolder);

	const existing = app.vault.getAbstractFileByPath(filePath);
	if (!existing) {
		const response = await requestUrl({ url: book.thumbnailUrl });
		await app.vault.createBinary(filePath, response.arrayBuffer);
	}

	return `![[${filePath}]]`;
}

export async function createBookNote(app: App, book: BookInfo, settings: BookVaultSettings): Promise<TFile> {
	let thumbnailEmbed = "";
	try {
		thumbnailEmbed = await downloadThumbnail(app, book, settings);
	} catch (e) {
		new Notice(`サムネイルのダウンロードに失敗しました: ${e instanceof Error ? e.message : "不明なエラー"}`);
	}

	const content = replacePlaceholders(settings.noteTemplate, book, thumbnailEmbed);

	const fileNameTemplate = settings.fileNameTemplate || "{{title}}";
	const fileName = replacePlaceholders(fileNameTemplate, book, thumbnailEmbed).replace(/[\\/:*?"<>|]/g, "_");
	const filePath = normalizePath(`${settings.noteFolder}/${fileName}.md`);

	await ensureFolder(app, settings.noteFolder);

	const existing = app.vault.getAbstractFileByPath(filePath);
	if (existing instanceof TFile) {
		new Notice(`ノートは既に存在します: ${filePath}`);
		return existing;
	}

	const file = await app.vault.create(filePath, content);
	new Notice(`ノートを作成しました: ${filePath}`);
	return file;
}
