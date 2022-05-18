import { App, Plugin, PluginSettingTab, Setting, TAbstractFile } from 'obsidian';
//@ts-ignore
import { requirejs as _requirejs, define as _define, require as _require } from 'require';
// @ts-ignore
import compareVersions from 'compare-versions';

interface RequireJSPluginSettings {
  scriptsFolder: string;
}

const DEFAULT_SETTINGS: RequireJSPluginSettings = {
  scriptsFolder: 'default'
}

export default class RequireJSPlugin extends Plugin {
  settings: RequireJSPluginSettings;
  loadedModules: string[] = [];

  async onload() {
    await this.loadSettings();

    this.registerEvent(this.app.vault.on('modify', this.reloadIfNeeded, this))

    // ensure these variables are available when we call eval
    //@ts-ignore
    let requirejs = _requirejs;
    //@ts-ignore
    let require = _require;
    //@ts-ignore
    let define = _define;

    // configure base url
    requirejs.config({
      baseUrl: this.settings.scriptsFolder
    });

    // configure the load function; we use the Obsidian Vault API,
    // whereas browsers would make HTTP requests
    //@ts-ignore
    requirejs.load = async function (context, moduleName, url) {
      const file = await app.vault.adapter.read(url);
      eval(file);
      context.completeLoad(moduleName);
    }

    // track loaded modules so we can wipe the cache when a file changes
    //@ts-ignore
    requirejs.onResourceLoad = (context, map) => {
      this.loadedModules.push(map.name);
    }

    // globals
    //@ts-ignore
    window.requirejs = requirejs;
    //@ts-ignore
    window.define = define;

    this.addSettingTab(new RequireJSSettingTab(this.app, this));
  }

  onunload() {
    // @ts-ignore
    this.loadedModules.forEach(_requirejs.undef);
    this.loadedModules.length = 0;
    // @ts-ignore
    delete window.requirejs;
    // @ts-ignore
    delete window.define;
  }

  async reloadIfNeeded(f: TAbstractFile) {
    // TODO: check containing folder name
    if (f.path.endsWith('.js')) {
      // force modules to be reloaded on next requirejs(...) call
      console.log("UNLOADING", this.loadedModules);
      //@ts-ignore
      this.loadedModules.forEach(_requirejs.undef);
      this.loadedModules.length = 0;

      // reload dataviewjs blocks if installed & version >= 0.4.11
      //@ts-ignore
      if (this.app.plugins.enabledPlugins.has("dataview")) {
        // @ts-ignore
        const version = this.app.plugins.plugins?.dataview?.manifest.version;
        if (compareVersions(version, '0.4.11') < 0) return;
        // @ts-ignore
        this.app.plugins.plugins.dataview?.api?.index?.touch();
      }
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class RequireJSSettingTab extends PluginSettingTab {
  plugin: RequireJSPlugin;

  constructor(app: App, plugin: RequireJSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Requirejs' });

    new Setting(containerEl)
      .setName('Scripts Folder')
      .setDesc('Path to folder containing JS files')
      .addText(text => text
        .setPlaceholder('js/scripts')
        .setValue(this.plugin.settings.scriptsFolder)
        .onChange(async (value) => {
          this.plugin.settings.scriptsFolder = value;
          await this.plugin.saveSettings();
          // @ts-ignore
          _requirejs.config({
            baseUrl: value
          });
        }));
  }
}
