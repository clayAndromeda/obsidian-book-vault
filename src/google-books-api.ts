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

export async function searchBooks(query: string, maxResults: number): Promise<BookInfo[]> {
	const q = isISBN(query) ? `isbn:${query.replace(/-/g, "")}` : `intitle:${query}`;
	const url = `${API_ENDPOINT}?q=${encodeURIComponent(q)}&maxResults=${maxResults}`;

	let response;
	try {
		response = await requestUrl({ url });
	} catch (e: unknown) {
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
				// JSON parse failed, use raw text
				if (responseText.length <= 200) {
					detail += `: ${responseText}`;
				}
			}
		}
		throw new Error(detail || (e instanceof Error ? e.message : "APIリクエスト失敗"));
	}

	const data = response.json;

	if (!data.items || data.items.length === 0) {
		return [];
	}

	return (data.items as GoogleBooksVolume[]).map(volumeToBookInfo);
}
