import { DEFAULT_COMPOSITION, SCHEMA_VERSION, type Project } from './types';
import { uid } from './ids';
import { DEFAULT_CODE } from '../animation/codeRuntime';

export function createProject(name = 'Untitled Motion'): Project {
  const now = Date.now();
  return { id: uid('project'), schemaVersion: SCHEMA_VERSION, name, createdAt: now, updatedAt: now, mode: 'code', composition: { ...DEFAULT_COMPOSITION }, code: DEFAULT_CODE, scene: [], assets: [], versions: [], notes: '' };
}

export function serializeProject(project: Project): string {
  return JSON.stringify({ ...project, updatedAt: Date.now() }, null, 2);
}

export function parseProject(raw: string): Project {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Project file must contain a JSON object.');
  const p = value as Partial<Project>;
  if (typeof p.name !== 'string' || !p.composition || typeof p.code !== 'string') throw new Error('Malformed Motion Studio project.');
  return { ...createProject(p.name), ...p, schemaVersion: SCHEMA_VERSION, composition: { ...DEFAULT_COMPOSITION, ...p.composition }, updatedAt: Date.now() } as Project;
}
