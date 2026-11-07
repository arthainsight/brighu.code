// What the opening window shows of the latest updates: the changes of the newest version, and the titles of the few before it.

export interface ChangelogLike {
  version: string;
  title?: string;
  changes: readonly string[];
}

export interface WelcomeUpdates {
  version: string;
  title: string;
  /** The changes of the newest version, without the line that only says the version number changed. */
  changes: string[];
  /** The versions before it, newest first. */
  earlier: { version: string; title: string }[];
}

const VERSION_LINE = /^Updated the application version/i;

export function recentUpdates(changelog: readonly ChangelogLike[], earlierCount = 4): WelcomeUpdates | null {
  const [latest, ...rest] = changelog;
  if (!latest) return null;
  return {
    version: latest.version,
    title: latest.title ?? '',
    changes: latest.changes.filter(change => !VERSION_LINE.test(change)),
    earlier: rest.slice(0, earlierCount).map(entry => ({ version: entry.version, title: entry.title ?? '' })),
  };
}

/** Whether the visitor has seen the updates of this version (the key is the one the Updates list of Settings keeps). */
export const LAST_SEEN_VERSION_KEY = 'lastSeenVersion';
