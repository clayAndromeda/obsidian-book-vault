import { Plugin } from "obsidian";
import { BookVaultSettings, DEFAULT_SETTINGS } from "./types";
import { BookVaultSettingTab } from "./settings-tab";
import { BookSearchModal } from "./book-search-modal";
import { createBookNote } from "./book-note-creator";

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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
