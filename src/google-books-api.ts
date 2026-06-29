import { requestUrl } from "obsidian";
import { BookInfo } from "./types";

const API_ENDPOINT = "https://www.googleapis.com/books/v1/volumes";

function isISBN(query: string): boolean {
	return /^[0-9-]{10,17}$/.test(query.trim());
}

interface GoogleBooksVolume {
	id: string;
	volumeInfo: {
		title?: string;
		subtitle?: string;
		authors?: string[];
		publisher?: string;
		publishedDate?: string;
		description?: string;
		pageCount?: number;
		categories?: string[];
		imageLinks?: {
			thumbnail?: string;
			smallThumbnail?: string;
		};
		industryIdentifiers?: Array<{
			type: string;
			identifier: string;
		}>;
		infoLink?: string;
	};
}

function extractISBN(identifiers: GoogleBooksVolume["volumeInfo"]["industryIdentifiers"], type: string): string {
	if (!identifiers) return "";
	const found = identifiers.find((id) => id.type === type);
	return found ? found.identifier : "";
}

function volumeToBookInfo(volume: GoogleBooksVolume): BookInfo {
	const info = volume.volumeInfo;
	let thumbnailUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
	if (thumbnailUrl.startsWith("http://")) {
		thumbnailUrl = thumbnailUrl.replace("http://", "https://");
	}

	return {
		title: info.title || "Unknown Title",
		subtitle: info.subtitle || "",
		authors: info.authors || [],
		publisher: info.publisher || "",
		publishedDate: info.publishedDate || "",
		description: info.description || "",
		pageCount: info.pageCount || 0,
		categories: info.categories || [],
		isbn10: extractISBN(info.industryIdentifiers, "ISBN_10"),
		isbn13: extractISBN(info.industryIdentifiers, "ISBN_13"),
		thumbnailUrl: thumbnailUrl,
		googleBooksUrl: info.infoLink || "",
	};
}

function parseApiError(e: unknown): { status?: number; message: string } {
	const status = (e as { status?: number }).status;
	const responseText = (e as { responseText?: string }).responseText;
	let detail = "";
	if (status) {
		detail += `HTTP ${status}`;
	}
	if (responseText) {
		try {
			const body = JSON.parse(responseText);
			const apiMessage = body?.error?.message || body?.error?.errors?.[0]?.message;
			if (apiMessage) {
				detail += `: ${apiMessage}`;
			}
		} catch {
			if (responseText.length <= 200) {
				detail += `: ${responseText}`;
			}
		}
	}
	return { status, message: detail || (e instanceof Error ? e.message : "APIリクエスト失敗") };
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PageResult {
	items: BookInfo[];
	totalItems: number;
}

async function fetchBooksPage(query: string, startIndex: number, maxResults: number, apiKey?: string): Promise<PageResult> {
	const q = isISBN(query) ? `isbn:${query.replace(/-/g, "")}` : `intitle:${query}`;
	let url = `${API_ENDPOINT}?q=${encodeURIComponent(q)}&maxResults=${maxResults}&startIndex=${startIndex}`;
	if (apiKey) {
		url += `&key=${encodeURIComponent(apiKey)}`;
	}

	const MAX_RETRIES = 2;
	let lastError: { status?: number; message: string } | undefined;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			const response = await requestUrl({ url });
			const data = response.json;
			return {
				items: data.items ? (data.items as GoogleBooksVolume[]).map(volumeToBookInfo) : [],
				totalItems: data.totalItems ?? 0,
			};
		} catch (e: unknown) {
			lastError = parseApiError(e);
			if (lastError.status === 429 && attempt < MAX_RETRIES) {
				await sleep(1000 * Math.pow(2, attempt));
				continue;
			}
			break;
		}
	}

	throw new Error(lastError?.message || "APIリクエスト失敗");
}

export async function searchBooksForSeries(query: string, apiKey?: string): Promise<BookInfo[]> {
	const pageSize = 40;
	const maxTotal = 120;
	const all: BookInfo[] = [];

	for (let startIndex = 0; startIndex < maxTotal; startIndex += pageSize) {
		const { items, totalItems } = await fetchBooksPage(query, startIndex, pageSize, apiKey);
		all.push(...items);
		if (items.length === 0 || all.length >= Math.min(totalItems, maxTotal)) break;
		await sleep(300);
	}

	return all;
}

export async function searchBooks(query: string, maxResults: number, apiKey?: string, startIndex = 0): Promise<BookInfo[]> {
	const { items } = await fetchBooksPage(query, startIndex, maxResults, apiKey);
	return items;
}
