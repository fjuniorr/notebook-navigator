/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, expect, it } from 'vitest';
import type { PropertyTreeNode } from '../../src/types/storage';
import {
    comparePropertyNodesByCustomSortValue,
    comparePropertyValueNodesAlphabetically,
    createPropertyComparator
} from '../../src/hooks/navigationPane/data/navigationComparators';
import { buildPropertyValueNodeId } from '../../src/utils/propertyTree';

function createValueNode(key: string, valuePath: string, name: string, count: number): PropertyTreeNode {
    return {
        id: buildPropertyValueNodeId(key, valuePath),
        kind: 'value',
        key,
        valuePath,
        name,
        displayPath: name,
        children: new Map(),
        notesWithValue: new Set(Array.from({ length: count }, (_, index) => `${name}-${index}.md`))
    };
}

describe('navigationComparators property sort values', () => {
    it('sorts custom numeric values before alphabetical fallback', () => {
        const todo = createValueNode('status', 'todo', 'Todo', 1);
        const waiting = createValueNode('status', 'waiting', 'Waiting', 1);
        const next = createValueNode('status', 'next', 'Next', 1);

        const nodes = [todo, waiting, next];
        nodes.sort((a, b) =>
            comparePropertyNodesByCustomSortValue(
                a,
                b,
                {
                    [waiting.id]: 20,
                    [next.id]: 10
                },
                comparePropertyValueNodesAlphabetically
            )
        );

        expect(nodes.map(node => node.name)).toEqual(['Next', 'Waiting', 'Todo']);
    });

    it('applies custom numeric values before frequency ordering', () => {
        const someday = createValueNode('status', 'someday', 'Someday', 10);
        const now = createValueNode('status', 'now', 'Now', 1);
        const later = createValueNode('status', 'later', 'Later', 5);

        const comparator = createPropertyComparator({
            order: 'frequency-desc',
            compareAlphabetically: comparePropertyValueNodesAlphabetically,
            sortValues: {
                [now.id]: 1,
                [later.id]: 2
            },
            getFrequency: node => node.notesWithValue.size
        });

        const nodes = [someday, now, later];
        nodes.sort(comparator);

        expect(nodes.map(node => node.name)).toEqual(['Now', 'Later', 'Someday']);
    });
});
