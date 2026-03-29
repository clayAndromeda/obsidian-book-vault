import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;
if (!VAULT_PATH) {
	console.error("Error: OBSIDIAN_VAULT_PATH is not set in .env");
	process.exit(1);
}

const pluginDir = join(VAULT_PATH, ".obsidian", "plugins", "obsidian-book-vault");
mkdirSync(pluginDir, { recursive: true });

const files = ["main.js", "manifest.json", "styles.css"];
for (const file of files) {
	copyFileSync(file, join(pluginDir, file));
	console.log(`  Copied ${file}`);
}

console.log(`\nDeployed to ${pluginDir}`);
