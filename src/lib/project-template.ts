
import type { Person, Folder } from '@/types';

export function createDefaultFolders(owners: Person[], oldFolders: Folder[] = []): Folder[] {
  const findOldFolder = (path: string[]) => {
      let currentLevel = oldFolders;
      let found: Folder | null = null;
      for (const name of path) {
          found = currentLevel.find(f => f.name === name) ?? null;
          if (found) {
              currentLevel = found.children;
          } else {
              return null;
          }
      }
      return found;
  };
    
  return owners.map((owner, ownerIndex) => {
    const oldOwnerFolder = findOldFolder([owner.name]);
    const oldRevenueFolder = findOldFolder([owner.name, 'Revenue Records']);
    const oldSroFolder = findOldFolder([owner.name, 'SRO Documents']);

    return {
      id: `head-${owner.id}-${ownerIndex}`,
      name: owner.name,
      files: oldOwnerFolder?.files || [],
      children: [
        { id: `revenue-${owner.id}`, name: 'Revenue Records', children: oldRevenueFolder?.children || [], files: oldRevenueFolder?.files || [] },
        { id: `sro-${owner.id}`, name: 'SRO Documents', children: oldSroFolder?.children || [], files: oldSroFolder?.files || [] },
      ],
    };
  });
}

export function initializeNewProjectData(projectId: string) {
    if(!projectId) return;
    localStorage.setItem(`lineage-data-${projectId}`, JSON.stringify([]));
    localStorage.setItem(`acquisition-status-${projectId}`, JSON.stringify([]));
    localStorage.setItem(`document-folders-${projectId}`, JSON.stringify([]));
    localStorage.setItem(`transactions-${projectId}`, JSON.stringify([]));
    localStorage.setItem(`financial-transactions-${projectId}`, JSON.stringify([]));
    localStorage.removeItem(`site-sketch-${projectId}`);
}
