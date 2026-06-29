import { Plugin, Notice } from "obsidian";
import { BookVaultSettings, DEFAULT_SETTINGS } from "./types";
import { BookVaultSettingTab } from "./settings-tab";
import { BookSearchModal, SeriesSearchModal } from "./book-search-modal";
import { createBookNote, createSeriesNote } from "./book-note-creator";

export default class BookVaultPlugin extends Plugin {
	settings: BookVaultSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("book-open", "Book Vault: 書籍を検索", () => {
			this.openBookSearch();
		});

		this.addCommand({
			id: "search-book",
			name: "書籍を検索してノートを作成",
			callback: () => {
				this.openBookSearch();
			},
		});

		this.addRibbonIcon("library", "Book Vault: シリーズをまとめて登録", () => {
			this.openSeriesRegister();
		});

		this.addCommand({
			id: "register-series",
			name: "シリーズをまとめて登録",
			callback: () => {
				this.openSeriesRegister();
			},
		});

		this.addSettingTab(new BookVaultSettingTab(this.app, this));
	}

	private openBookSearch() {
		new BookSearchModal(this.app, this.settings.maxSearchResults, this.settings.googleBooksApiKey, async (book) => {
			const file = await createBookNote(this.app, book, this.settings);
			if (this.settings.openAfterCreate) {
				await this.app.workspace.getLeaf().openFile(file);
			}
		}).open();
	}

	private openSeriesRegister() {
		new SeriesSearchModal(this.app, this.settings.googleBooksApiKey, async (seriesName, books) => {
			let successCount = 0;
			for (const book of books) {
				try {
					await createBookNote(this.app, book, this.settings);
					successCount++;
				} catch (e) {
					new Notice(`ノート作成エラー (${book.title}): ${e instanceof Error ? e.message : "不明なエラー"}`);
				}
			}
			const seriesFile = await createSeriesNote(this.app, seriesName, books, this.settings);
			new Notice(`${successCount}冊＋シリーズページを作成しました`);
			if (this.settings.openAfterCreate) {
				await this.app.workspace.getLeaf().openFile(seriesFile);
			}
		}).open();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
