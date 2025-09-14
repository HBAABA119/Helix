import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProjectFile } from '@/types';

export const downloadProject = async (projectName: string, files: ProjectFile[]) => {
  const zip = new JSZip();

  // Add files to zip
  files.forEach(file => {
    if (file.type === 'file') {
      zip.file(file.path, file.content);
    }
  });

  // Generate zip file
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Download zip file
  saveAs(content, `${projectName}.zip`);
};

export const downloadFile = (file: ProjectFile) => {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, file.name);
};

export const downloadProjectAsJSON = (projectName: string, files: ProjectFile[]) => {
  const projectData = {
    name: projectName,
    files: files,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  
  saveAs(blob, `${projectName}-project.json`);
};