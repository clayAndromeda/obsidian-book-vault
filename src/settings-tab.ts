import { App, PluginSettingTab, Setting } from "obsidian";
import type BookVaultPlugin from "./main";
import { DEFAULT_NOTE_TEMPLATE } from "./types";

export class BookVaultSettingTab extends PluginSettingTab {
	plugin: BookVaultPlugin;

	constructor(app: App, plugin: BookVaultPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Google Books APIキー")
			.setDesc("Google Cloud ConsoleでBooks APIを有効化し、APIキーを作成してください。未設定でも利用できますが、検索回数に制限があります。")
			.addText((text) =>
				text
					.setPlaceholder("AIzaSy...（未設定でも利用可）")
					.setValue(this.plugin.settings.googleBooksApiKey)
					.onChange(async (value) => {
						this.plugin.settings.googleBooksApiKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("ノート保存フォルダ")
			.setDesc("書籍ノートを保存するフォルダ")
			.addText((text) =>
				text.setValue(this.plugin.settings.noteFolder).onChange(async (value) => {
					this.plugin.settings.noteFolder = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("ファイル名テンプレート")
			.setDesc("ファイル名のテンプレート (例: {{title}}, {{authors}} - {{title}})")
			.addText((text) =>
				text.setValue(this.plugin.settings.fileNameTemplate).onChange(async (value) => {
					this.plugin.settings.fileNameTemplate = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("サムネイルをダウンロード")
			.setDesc("書籍のサムネイル画像をダウンロードする")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.downloadThumbnail).onChange(async (value) => {
					this.plugin.settings.downloadThumbnail = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("サムネイル保存フォルダ")
			.setDesc("サムネイル画像を保存するフォルダ")
			.addText((text) =>
				text.setValue(this.plugin.settings.thumbnailFolder).onChange(async (value) => {
					this.plugin.settings.thumbnailFolder = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("作成後にノートを開く")
			.setDesc("ノート作成後に自動で開く")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.openAfterCreate).onChange(async (value) => {
					this.plugin.settings.openAfterCreate = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("最大検索結果数")
			.setDesc("Google Books APIから取得する最大件数")
			.addSlider((slider) =>
				slider
					.setLimits(1, 40, 1)
					.setValue(this.plugin.settings.maxSearchResults)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxSearchResults = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("ノートテンプレート")
			.setDesc("書籍ノートのテンプレート ({{placeholder}} で置換)")
			.addTextArea((text) => {
				text.inputEl.style.width = "100%";
				text.inputEl.style.height = "300px";
				text.inputEl.style.fontFamily = "monospace";
				text.setValue(this.plugin.settings.noteTemplate).onChange(async (value) => {
					this.plugin.settings.noteTemplate = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.addButton((btn) =>
				btn.setButtonText("テンプレートをリセット").onClick(async () => {
					this.plugin.settings.noteTemplate = DEFAULT_NOTE_TEMPLATE;
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
