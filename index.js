#!/usr/bin/env node
import 'dotenv/config';
import boxen from 'boxen';
import services from './services.js';
import configureOpenAi from './openai.js';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsFilePath = path.join(__dirname, 'settings.json');

// Create a new Commander program
const program = new Command();

function readSettingsFromFile() {
  let settings = {};
  if (fs.existsSync(settingsFilePath)) {
    const settingsData = fs.readFileSync(settingsFilePath, 'utf8');
    settings = JSON.parse(settingsData);
  } else {
    console.log("No settings file found. Please run `openai set-api-token <token>` to set your API token.");
  }
  return settings;
}

let settings = readSettingsFromFile();
let openai = configureOpenAi(settings?.apiToken);

function saveSettingsToFile() {
  const settingsData = JSON.stringify(settings, null, 2);
  fs.writeFileSync(settingsFilePath, settingsData, 'utf8');
}

function readCodeFromFilePath(file) {
  const currentWorkingDirectory = process.cwd();
  const filePath = path.resolve(currentWorkingDirectory, file);
  if (!fs.existsSync(filePath)) {
    console.error("Error: file path is required");
    return;
  }
  const code = fs.readFileSync(filePath, 'utf8');
  return code;
}

program.version("1.0.0");

program
  .command('set-api-token <token>')
  .description('Set the API token')
  .action((token) => {
    settings.apiToken = token;
    saveSettingsToFile();
    console.log('API token set successfully.');
    openai = configureOpenAi(token);
  });

program
  .command("describe")
  .description("Describes the code in the file at the given path")
  .option("-f, --file <path>", "File path to the code")
  .action(async (options) => {
    if (!settings.apiToken) {
      return console.error("Error: API token is required");
    }
    if (!options.file) {
      return console.error("Error: file path is required");
    }
    const file = readCodeFromFilePath(options.file);
    if (!file) {
      return;
    }
    const description = await services.describeCode(openai, file);
    if (description) {
      console.log(boxen(file, { padding: 1 }));
      console.log(boxen(description, { padding: 1 }));
    }
  });

program.parse(process.argv);
