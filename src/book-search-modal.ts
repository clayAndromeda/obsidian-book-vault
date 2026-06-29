import { App, Modal, SuggestModal, Notice, Setting } from "obsidian";
import { BookInfo } from "./types";
import { searchBooks, searchBooksForSeries } from "./google-books-api";
import { parseVolumeNumber } from "./book-note-creator";

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

export class SeriesSearchModal extends Modal {
	private query: string = "";
	private apiKey: string;
	private onSelect: (seriesName: string, books: BookInfo[]) => void;

	constructor(app: App, apiKey: string, onSelect: (seriesName: string, books: BookInfo[]) => void) {
		super(app);
		this.apiKey = apiKey;
		this.onSelect = onSelect;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h3", { text: "シリーズをまとめて登録" });

		new Setting(contentEl)
			.setName("シリーズ名")
			.addText((text) => {
				text.setPlaceholder("例: 進撃の巨人");
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
			new Notice("シリーズ名を入力してください");
			return;
		}

		new Notice("検索中...");
		try {
			const results = await searchBooksForSeries(query, this.apiKey || undefined);
			this.close();

			if (results.length === 0) {
				new Notice("書籍が見つかりませんでした");
				return;
			}

			new SeriesSelectModal(this.app, query, results, this.onSelect).open();
		} catch (e) {
			new Notice(`検索エラー: ${e instanceof Error ? e.message : "不明なエラー"}`);
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}

class SeriesSelectModal extends Modal {
	private seriesName: string;
	private books: BookInfo[];
	private onSelect: (seriesName: string, books: BookInfo[]) => void;
	private checked: boolean[];
	private registerBtn: HTMLButtonElement | null = null;

	constructor(app: App, seriesName: string, books: BookInfo[], onSelect: (seriesName: string, books: BookInfo[]) => void) {
		super(app);
		this.seriesName = seriesName;
		const sorted = [...books].sort((a, b) => parseVolumeNumber(a.title) - parseVolumeNumber(b.title));
		this.books = this.deduplicateByVolumeNumber(sorted);
		this.onSelect = onSelect;
		this.checked = new Array(this.books.length).fill(true);
	}

	private deduplicateByVolumeNumber(books: BookInfo[]): BookInfo[] {
		const seen = new Set<number>();
		return books.filter((book) => {
			const vol = parseVolumeNumber(book.title);
			if (vol === Infinity) return true;
			if (seen.has(vol)) return false;
			seen.add(vol);
			return true;
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("book-vault-series-modal");

		contentEl.createEl("h3", { text: `「${this.seriesName}」を登録` });

		const controls = contentEl.createDiv({ cls: "book-vault-series-controls" });
		const selectAllBtn = controls.createEl("button", { text: "全選択", cls: "book-vault-series-ctrl-btn" });
		selectAllBtn.addEventListener("click", () => this.setAll(true));
		const deselectAllBtn = controls.createEl("button", { text: "全解除", cls: "book-vault-series-ctrl-btn" });
		deselectAllBtn.addEventListener("click", () => this.setAll(false));

		const list = contentEl.createDiv({ cls: "book-vault-series-list" });
		this.books.forEach((book, i) => {
			const row = list.createDiv({ cls: "book-vault-series-item" });

			const checkbox = row.createEl("input");
			checkbox.type = "checkbox";
			checkbox.checked = this.checked[i];
			checkbox.addClass("book-vault-series-checkbox");
			checkbox.addEventListener("change", () => {
				this.checked[i] = checkbox.checked;
				this.updateRegisterBtn();
			});

			if (book.thumbnailUrl) {
				const img = row.createEl("img", { cls: "book-vault-thumbnail" });
				img.src = book.thumbnailUrl;
				img.alt = book.title;
			}

			const textDiv = row.createDiv({ cls: "book-vault-suggestion-text" });
			textDiv.createDiv({ cls: "book-vault-suggestion-title", text: book.title });
			textDiv.createDiv({ cls: "book-vault-suggestion-author", text: book.authors.join(", ") || "著者不明" });

			row.addEventListener("click", (e) => {
				if (e.target === checkbox) return;
				checkbox.checked = !checkbox.checked;
				this.checked[i] = checkbox.checked;
				this.updateRegisterBtn();
			});
		});

		const footer = contentEl.createDiv({ cls: "book-vault-series-footer" });
		this.registerBtn = footer.createEl("button", { cls: "mod-cta" });
		this.updateRegisterBtn();
		this.registerBtn.addEventListener("click", () => {
			const selected = this.books.filter((_, i) => this.checked[i]);
			if (selected.length === 0) {
				new Notice("書籍を選択してください");
				return;
			}
			this.close();
			this.onSelect(this.seriesName, selected);
		});
	}

	private setAll(value: boolean) {
		this.checked.fill(value);
		this.contentEl.querySelectorAll<HTMLInputElement>(".book-vault-series-checkbox").forEach((cb) => {
			cb.checked = value;
		});
		this.updateRegisterBtn();
	}

	private updateRegisterBtn() {
		if (!this.registerBtn) return;
		const count = this.checked.filter(Boolean).length;
		this.registerBtn.textContent = `${count}冊を登録`;
		this.registerBtn.disabled = count === 0;
	}

	onClose() {
		this.contentEl.empty();
	}
}
