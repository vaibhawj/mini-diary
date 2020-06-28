import semver from "semver";

import { MiniDiaryJson } from "../../types";
import { v4 } from "uuid";

/**
 * v2.0.0: Migrate plain text entries to Markdown entries (replace \n with \n\n)
 */
function migrateToMarkdown(data: MiniDiaryJson): MiniDiaryJson {
	const { metadata, entries } = data;
	const dataMigrated: MiniDiaryJson = {
		metadata,
		entries: {},
	};

	// Replace \n with \n\n in the text part of all diary entries
	Object.entries(entries).forEach(([indexDate, entries]): void => {
		const entriesUpdated = entries.map(entry => {
			const { text } = entry;
			return {
				...entry,
				text: text.replace(/\n/g, "\n\n"),
			}
		})

		dataMigrated.entries[indexDate] = entriesUpdated;
	});

	return dataMigrated;
}

/**
 * v3.3.1: Migrate single entry per day to multiple
 */
function migrateToMultipleEntriesPerDay(data: MiniDiaryJson): MiniDiaryJson {
	const { metadata, entries } = data
	const dataMigrated: MiniDiaryJson = {
		metadata,
		entries: {},
	}

	// If its not array put the entry in an array
	Object.entries(entries).forEach(([indexDate, entries]): void => {
		if (entries instanceof Array) {
			dataMigrated.entries[indexDate] = entries
		} else {
			dataMigrated.entries[indexDate] = [
				{ id: v4(), title: entries["title"], text: entries["text"], dateUpdated: entries["dateUpdated"] },
			]
		}
	})

	return dataMigrated;
}

/**
 * Compare app version with diary file version, perform data migrations if necessary
 */
export function performMigrations(data: MiniDiaryJson): MiniDiaryJson {
	const diaryFileVersion = data.metadata.version;

	if (semver.lt(diaryFileVersion, "3.3.1")) {
		data = migrateToMultipleEntriesPerDay(data);
	}

	if (semver.lt(diaryFileVersion, "2.0.0")) {
		data = migrateToMarkdown(data);
	}

	return data;
}
