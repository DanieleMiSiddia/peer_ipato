import { v4 as uuidv4 } from 'uuid';

export function generateId(length: number): string {
    return uuidv4().replace(/-/g, '').substring(0, length);
}
