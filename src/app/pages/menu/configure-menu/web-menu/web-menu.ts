import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { WebMenuModel } from '../../../../core/_state/menu/menu.model';
import { MaterialModule } from '../../../../material.module';
import { MenuService } from '../../../../core/_state/menu/menu.service';

export interface MenuNode extends WebMenuModel {
  children: MenuNode[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-web-menu',
  imports: [DragDropModule, CommonModule, MaterialModule],
  templateUrl: './web-menu.html',
  styleUrl: './web-menu.css',
})
export class WebMenu implements OnInit {
  menuNodes: MenuNode[] = [];
  // Keep track of connected drop lists
  connectedDropLists: string[] = ['root-list'];

  constructor(private menuService: MenuService) { }

  originalMenuItems: WebMenuModel[] = [];

  ngOnInit(): void {
    this.getWebmenu();
  }

  getWebmenu() {
    this.menuService.getWebmenu().subscribe((res) => {
      console.log(res);
      this.originalMenuItems = JSON.parse(JSON.stringify(res)); // Deep copy
      this.menuNodes = this.buildTree(res);
      this.updateConnectedDropLists();
    });
  }

  // Convert flat list to tree
  buildTree(items: WebMenuModel[]): MenuNode[] {
    const map = new Map<number, MenuNode>();
    const roots: MenuNode[] = [];

    // First pass: create nodes
    items.forEach(item => {
      map.set(item.webMenuId, { ...item, children: [], isExpanded: true });
    });

    // Second pass: connect children to parents
    items.forEach(item => {
      // Use webMenuId for map lookup
      const node = map.get(item.webMenuId)!;
      if (item.parentId !== 0 && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by sortOrder
    const sortNodes = (nodes: MenuNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  }

  updateConnectedDropLists() {
    const ids: string[] = ['root-list'];

    const traverse = (nodes: MenuNode[]) => {
      nodes.forEach(node => {
        // Only allow dropping into nodes with no route (containers)
        if (!node.route && node.isExpanded) {
          ids.push(`list-${node.webMenuId}`);
        }
        if (node.children.length > 0 && node.isExpanded) {
          traverse(node.children);
        }
      });
    };

    traverse(this.menuNodes);
    this.connectedDropLists = [...ids];
  }

  drop(event: CdkDragDrop<MenuNode[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateSortOrder(event.container.data);
    } else {
      // Moving between lists (parent change)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const movedItem = event.container.data[event.currentIndex];

      // Update parentId based on the container id
      // Root list id is 'root-list', children lists are 'list-{webMenuId}'
      if (event.container.id === 'root-list') {
        movedItem.parentId = 0;
      } else {
        const parentId = parseInt(event.container.id.replace('list-', ''), 10);
        movedItem.parentId = parentId;
      }

      this.updateSortOrder(event.container.data);
      this.updateSortOrder(event.previousContainer.data);
    }
  }

  updateSortOrder(items: MenuNode[]) {
    items.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
    console.log('Updated Structure:', this.menuNodes);
  }

  toggleExpand(node: MenuNode) {
    node.isExpanded = !node.isExpanded;
  }

  onSave() {
    const currentFlatList = this.flattenTree(this.menuNodes);
    const moveAndReorder: any[] = [];
    const reorders: any[] = [];
    const statusUpdate: any[] = [];

    // 1. Identify Moves: Items where parentId has changed
    currentFlatList.forEach(item => {
      const original = this.originalMenuItems.find(o => o.webMenuId === item.webMenuId);
      if (original && item.parentId !== original.parentId) {
        const siblings = currentFlatList
          .filter(n => n.parentId === item.parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(n => n.webMenuId);

        moveAndReorder.push({
          webMenuId: item.webMenuId,
          parentWebMenuId: item.parentId, // Updated key
          newOrderUnderToParent: siblings
        });
      }
    });

    // 2. Identify Reorders
    const movedToParents = new Set(moveAndReorder.map(m => m.parentWebMenuId)); // Updated key reference

    // Check all parents currently in use
    const allParents = new Set(currentFlatList.map(i => i.parentId));

    allParents.forEach(parentId => {
      if (movedToParents.has(parentId)) return; // Skip if this parent is a move destination

      const currentChildrenIds = currentFlatList
        .filter(n => n.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(n => n.webMenuId);

      const originalChildrenIds = this.originalMenuItems
        .filter(n => n.parentId === parentId)
        .filter(n => currentChildrenIds.includes(n.webMenuId))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(n => n.webMenuId);

      if (JSON.stringify(currentChildrenIds) !== JSON.stringify(originalChildrenIds)) {
        reorders.push({
          parentWebMenuId: parentId,
          orderedIds: currentChildrenIds
        });
      }
    });

    // Construct Payload
    const payload: any = {};
    if (moveAndReorder.length > 0) payload.moveAndReorder = moveAndReorder;
    if (reorders.length > 0) payload.reorders = reorders;
    if (statusUpdate.length > 0) payload.statusUpdate = statusUpdate;

    if (Object.keys(payload).length === 0) {
      console.log('No changes to save');
      return;
    }

    console.log('Save Payload:', payload);
    this.menuService.saveMenuOrder(payload).subscribe({
      next: (res) => {
        console.log('Saved successfully', res);
        this.originalMenuItems = JSON.parse(JSON.stringify(currentFlatList));
      },
      error: (err) => { console.error(err) }
    });
  }

  flattenTree(nodes: MenuNode[]): MenuNode[] {
    let result: MenuNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children.length > 0) {
        result = result.concat(this.flattenTree(node.children));
      }
    });
    return result;
  }
}
