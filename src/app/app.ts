import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService, Item } from './services/item.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  items: Item[] = [];
  newItem: Item = { name: '', description: '', quantity: 1, status: 'Disponivel' };
  
  isEditing: boolean = false;
  editingId: number | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  isDarkMode: boolean = false;

  // Items search/filter for the list view
  itemsSearchQuery: string = '';
  filteredItems: Item[] = [];
  maxSearchResults: number = 500; // cap to avoid rendering extremely large lists
  private searchDebounceTimer: any = null;

  constructor(private itemService: ItemService, private destroyRef: DestroyRef) {
    // Read persisted theme preference early
    const saved = localStorage.getItem('devlogistics_theme');
    this.isDarkMode = saved === 'dark';
    this.applyTheme();
  }

  ngOnInit(): void {
    this.loadItems();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('devlogistics_theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    const root = document.documentElement;
    if (this.isDarkMode) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }

  loadItems(): void {
    this.itemService.getItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.items = data;
        // initialize the filtered view to the full list
        this.filteredItems = Array.isArray(data) ? [...data] : [];
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Erro ao carregar itens:', err);
        this.errorMessage = err?.userMessage ?? 'Não foi possível conectar ao servidor backend. Verifique se ele está rodando e se o CORS está ativo.';
      }
    });
  }

  saveItem(): void {
    if (!this.newItem.name || this.newItem.name.trim() === '') {
      this.errorMessage = 'O nome do item é obrigatório!';
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      this.itemService.updateItem(this.editingId, this.newItem).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.successMessage = 'Item atualizado com sucesso!';
          this.loadItems();
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Erro ao atualizar item:', err);
          this.errorMessage = err?.userMessage ?? 'Erro ao atualizar item. Veja o console para detalhes.';
        }
      });
    } else {
      this.itemService.createItem(this.newItem).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.successMessage = 'Item cadastrado com sucesso!';
          this.loadItems();
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Erro ao criar item:', err);
          this.errorMessage = err?.userMessage ?? 'Erro ao cadastrar item. Veja o console para detalhes.';
        }
      });
    }
  }

  editItem(item: Item): void {
    this.isEditing = true;
    this.editingId = item.id || null;
    this.newItem = { ...item };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Modal-driven delete flow: stores the item pending deletion and shows a custom modal in the template
  itemToDelete: Item | null = null;

  promptDelete(item: Item): void {
    this.itemToDelete = item;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirmDelete(): void {
    if (!this.itemToDelete || this.itemToDelete.id == null) {
      this.errorMessage = 'Item inválido para exclusão.';
      this.itemToDelete = null;
      return;
    }

    const id = this.itemToDelete.id;
    this.itemService.deleteItem(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.successMessage = `Item #${id} excluído com sucesso!`;
        this.itemToDelete = null;
        this.loadItems();
      },
      error: (err: any) => {
        console.error('Erro ao excluir item:', err);
        this.errorMessage = err?.userMessage ?? 'Erro ao excluir item.';
        this.itemToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.itemToDelete = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.newItem = { name: '', description: '', quantity: 1, status: 'Disponivel' };
  }

  /* ---------------- Items search (list filter) ---------------- */
  onItemsSearchInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value.trim();
    this.itemsSearchQuery = q;

    // If the input was cleared, immediately clear the filtered list and cancel any pending debounce search.
    if (q === '') {
      if (this.searchDebounceTimer) { clearTimeout(this.searchDebounceTimer); }
      this.filteredItems = [];
      return;
    }

    if (this.searchDebounceTimer) { clearTimeout(this.searchDebounceTimer); }
    this.searchDebounceTimer = setTimeout(() => this.performSearch(), 220);
  }

    // Normalize string: remove diacritics, lower-case, collapse repeated characters
  private normalizeForSearch(s: string): string {
    if (!s) return '';
    // remove diacritics (accents)
    let out = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    out = out.toLowerCase();
    // collapse repeating characters (e.g., '\u006dateriall' -> 'material')
    out = out.replace(/([a-z0-9])\1{1,}/g, '$1');
    // trim and collapse spaces
    out = out.replace(/\s+/g, ' ').trim();
    return out;
  }

  // Simple Levenshtein distance (optimized iterative version)
  private levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    const al = a.length, bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;
    let v0 = new Array(bl + 1).fill(0).map((_, i) => i);
    let v1 = new Array(bl + 1).fill(0);
    for (let i = 0; i < al; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < bl; j++) {
        const cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      const tmp = v0; v0 = v1; v1 = tmp;
    }
    return v0[bl];
  }

  performSearch(): void {
    const q = this.itemsSearchQuery;
    // Enforce minimum length of 3 characters for dynamic filtering.
    // Until then, keep the filtered list empty (user must type >=3 to see results).
    if (!q || q.length < 3) {
      this.filteredItems = [];
      return;
    }

    const normalizedQuery = this.normalizeForSearch(q);
    // limit results as a protection against extremely large lists
    const results: Item[] = [];
    for (const it of this.items) {
      const name = (it.name || '').toString();
      const desc = (it.description || '').toString();
      const normalizedName = this.normalizeForSearch(name);
      const normalizedDesc = this.normalizeForSearch(desc);

      // direct contains check (fast) against name and description
      if ((normalizedName && normalizedName.includes(normalizedQuery)) || (normalizedDesc && normalizedDesc.includes(normalizedQuery))) {
        results.push(it);
        if (results.length >= this.maxSearchResults) break;
        continue;
      }

      // fallback: fuzzy match using Levenshtein with adaptive threshold against name only (cheaper)
      const target = normalizedName || normalizedDesc;
      if (!target) continue;
      const threshold = Math.max(1, Math.floor(Math.min(normalizedQuery.length, target.length) * 0.25));
      const dist = this.levenshtein(normalizedQuery, target);
      if (dist <= threshold) {
        results.push(it);
        if (results.length >= this.maxSearchResults) break;
      }
    }

    this.filteredItems = results;
  }
}

