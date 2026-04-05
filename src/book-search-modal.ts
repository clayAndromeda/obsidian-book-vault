import { App, Modal, SuggestModal, Notice, Setting } from "obsidian";
import { BookInfo } from "./types";
import { searchBooks } from "./google-books-api";

export class BookSearchModal extends Modal {
	private query: string = "";
	private maxResults: number;
	private apiKey: string;
	private onSelect: (book: BookInfo) => void;

	constructor(app: App, maxResults: number, apiKey: string, onSelect: (book: BookInfo) => void) {
		super(app);
		this.maxResults = maxResults;
		this.apiKey = apiKey;
		this.onSelect = onSelect;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h3", { text: "書籍を検索" });

		new Setting(contentEl)
			.setName("書名またはISBN")
			.addText((text) => {
				text.setPlaceholder("例: リーダブルコード / 978-4873115658");
				text.inputEl.style.width = "100%";
				text.onChange((value) => {
					this.query = value;
				});
				text.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.performSearch();
					}
				});
				// Auto focus
				setTimeout(() => text.inputEl.focus(), 10);
			});

		new Setting(contentEl)
			.addButton((btn) => {
				btn.setButtonText("検索").setCta().onClick(() => this.performSearch());
			});
	}

	private async performSearch() {
		const query = this.query.trim();
		if (!query) {
			new Notice("検索キーワードを入力してください");
			return;
		}

		new Notice("検索中...");
		try {
			const results = await searchBooks(query, this.maxResults, this.apiKey || undefined);
			this.close();

			if (results.length === 0) {
				new Notice("書籍が見つかりませんでした");
				return;
			}

			new BookSelectModal(this.app, results, this.onSelect).open();
		} catch (e) {
			new Notice(`検索エラー: ${e instanceof Error ? e.message : "不明なエラー"}`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}

class BookSelectModal extends SuggestModal<BookInfo> {
	private books: BookInfo[];
	private onSelect: (book: BookInfo) => void;

	constructor(app: App, books: BookInfo[], onSelect: (book: BookInfo) => void) {
		super(app);
		this.books = books;
		this.onSelect = onSelect;
		this.setPlaceholder("書籍を選択してください");
	}

	getSuggestions(query: string): BookInfo[] {
		if (!query) return this.books;
		const lower = query.toLowerCase();
		return this.books.filter(
			(book) =>
				book.title.toLowerCase().includes(lower) ||
				book.authors.join(", ").toLowerCase().includes(lower)
		);
	}

	renderSuggestion(book: BookInfo, el: HTMLElement) {
		const container = el.createDiv({ cls: "book-vault-suggestion" });

		if (book.thumbnailUrl) {
			const img = container.createEl("img", {
				cls: "book-vault-thumbnail",
			});
			img.src = book.thumbnailUrl;
			img.alt = book.title;
		}

		const textDiv = container.createDiv({ cls: "book-vault-suggestion-text" });
		textDiv.createDiv({ cls: "book-vault-suggestion-title", text: book.title });
		textDiv.createDiv({
			cls: "book-vault-suggestion-author",
			text: book.authors.join(", ") || "著者不明",
		});
		if (book.publisher) {
			textDiv.createDiv({
				cls: "book-vault-suggestion-publisher",
				text: book.publisher,
			});
		}
	}

	onChooseSuggestion(book: BookInfo) {
		this.onSelect(book);
	}
}
