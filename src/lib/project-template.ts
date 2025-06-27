
// src/lib/project-template.ts
import type { Person, AcquisitionStatus, Folder, Task, Transaction, DocumentFile, SurveyRecord } from '@/types';
import { siteSketchData, type SiteSketchPlot } from '@/lib/site-sketch-data';
import { initialTasks, initialTransactions, initialFiles } from '@/lib/initial-data';


// --- Owner and Folder Creation Logic ---

export const createOwnersMap = () => {
  return siteSketchData.reduce((acc, plot) => {
    if (plot.ownerName !== "N/A") {
      if (!acc[plot.ownerName]) {
        acc[plot.ownerName] = [];
      }
      acc[plot.ownerName].push({
        id: `lr-${plot.surveyNumber}-${plot.ownerName.replace(/\s+/g, '-')}-${Math.random()}`,
        surveyNumber: plot.surveyNumber,
        acres: plot.acres,
        cents: plot.cents,
        landClassification: plot.classification,
      });
    }
    return acc;
  }, {} as Record<string, SurveyRecord[]>);
};

export const createInitialOwners = (ownersMap: Record<string, SurveyRecord[]>): Person[] => {
  return Object.keys(ownersMap).map((ownerName, index) => ({
    id: `owner-${ownerName.replace(/\s+/g, '-')}-${index}`,
    name: ownerName,
    relation: "Family Head",
    gender: 'Male', 
    age: 40 + index * 2,
    maritalStatus: 'Married',
    status: 'Alive',
    sourceOfLand: 'Purchase',
    holdingPattern: 'Individual',
    landRecords: ownersMap[ownerName],
    heirs: [],
  }));
};

export function createDefaultAcquisitionStatus(projectId: string, plot: SiteSketchPlot, index: number): AcquisitionStatus {
    const status: AcquisitionStatus = {
        id: `${projectId}-${plot.surveyNumber}-${index}`,
        projectId: projectId,
        surveyNumber: plot.surveyNumber,
        familyHeadName: plot.ownerName,
        extent: { acres: plot.acres, cents: plot.cents },
        landClassification: plot.classification,
        financials: { advancePayment: 'Pending', agreementStatus: 'Pending' },
        operations: { meetingDate: null, documentCollection: 'Pending' },
        legal: { queryStatus: 'Not Started' },
    };
    switch (plot.status.toLowerCase()) {
        case 'sale advance':
            status.financials.advancePayment = 'Paid';
            status.operations.documentCollection = 'Partially Collected';
            status.legal.queryStatus = 'On-Progress';
            break;
        case 'agreement':
            status.financials.advancePayment = 'Paid';
            status.financials.agreementStatus = 'Signed';
            status.operations.documentCollection = 'Fully Collected';
            status.operations.meetingDate = new Date().toISOString();
            status.legal.queryStatus = 'Cleared';
            break;
    }
    return status;
}

// Pass oldFolders = [] for new projects
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
    const allSurveyNumbers = new Set<string>();
    const collectSurveyNumbers = (person: Person) => {
        (person.landRecords || []).forEach(lr => allSurveyNumbers.add(lr.surveyNumber));
        (person.heirs || []).forEach(collectSurveyNumbers);
    };
    collectSurveyNumbers(owner);
    const surveyNumbersForFamily = Array.from(allSurveyNumbers);

    const revenueSurveyFolders = surveyNumbersForFamily.map((sn, snIndex) => {
        const oldSubFolder = findOldFolder([owner.name, 'Revenue Records', sn]);
        return {
            id: `revenue-survey-${sn.replace(/[^a-zA-Z0-9]/g, '-')}-${owner.id}-${snIndex}`,
            name: sn,
            children: oldSubFolder?.children || [],
            files: oldSubFolder?.files || [],
        };
    });
    const sroSurveyFolders = surveyNumbersForFamily.map((sn, snIndex) => {
        const oldSubFolder = findOldFolder([owner.name, 'SRO Documents', sn]);
        return {
            id: `sro-survey-${sn.replace(/[^a-zA-Z0-9]/g, '-')}-${owner.id}-${snIndex}`,
            name: sn,
            children: oldSubFolder?.children || [],
            files: oldSubFolder?.files || [],
        };
    });
    
    const oldOwnerFolder = findOldFolder([owner.name]);

    return {
      id: `head-${owner.id}-${ownerIndex}`,
      name: owner.name,
      files: oldOwnerFolder?.files || [],
      children: [
        { id: `revenue-${owner.id}`, name: 'Revenue Records', children: revenueSurveyFolders, files: findOldFolder([owner.name, 'Revenue Records'])?.files || [] },
        { id: `sro-${owner.id}`, name: 'SRO Documents', children: sroSurveyFolders, files: findOldFolder([owner.name, 'SRO Documents'])?.files || [] },
      ],
    };
  });
}

// --- Main Initializer Function ---

export function initializeNewProjectData(projectId: string) {
    if(!projectId) return;

    // Lineage Data
    const ownersMap = createOwnersMap();
    const initialHeads = createInitialOwners(ownersMap);
    localStorage.setItem(`lineage-data-${projectId}`, JSON.stringify(initialHeads));

    // Acquisition Status Data
    const demoStatuses = siteSketchData.map((plot, index) => createDefaultAcquisitionStatus(projectId, plot, index));
    localStorage.setItem(`acquisition-status-${projectId}`, JSON.stringify(demoStatuses));

    // Folder Structure for Title Documents
    const defaultFolders = createDefaultFolders(initialHeads);
    localStorage.setItem(`document-folders-${projectId}`, JSON.stringify(defaultFolders));

    // Initial Tasks
    const tasksWithIds: Task[] = initialTasks.map((task, i) => ({ ...task, id: `task-${Date.now()}-${i}`}));
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(tasksWithIds));

    // Initial Transactions
    const transactionsWithIds: Transaction[] = initialTransactions.map((tx, i) => ({ ...tx, id: `tx-${Date.now()}-${i}`}));
    localStorage.setItem(`transactions-${projectId}`, JSON.stringify(transactionsWithIds));

    // Initial Files
    const filesWithIds: DocumentFile[] = initialFiles.map((file, i) => {
        const dummyContent = `This is a dummy file named ${file.name}.`;
        const url = typeof window !== 'undefined' ? `data:text/plain;base64,${btoa(dummyContent)}` : undefined;
        return {
            ...file,
            id: `file-${Date.now()}-${i}`,
            url,
        };
    });
    localStorage.setItem(`files-${projectId}`, JSON.stringify(filesWithIds));

    // We don't initialize notes or legal notes, they should start empty.
}
