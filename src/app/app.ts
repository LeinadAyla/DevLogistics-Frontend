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

    if (this.searchDebounceTimer) { clearTimeout(this.searchDebounceTimer); }
    this.searchDebounceTimer = setTimeout(() => this.performSearch(), 220);
  }

  performSearch(): void {
    const q = this.itemsSearchQuery;
    if (!q || q.length < 3) {
      // if query is short, show the full list
      this.filteredItems = [...this.items];
      return;
    }

    const lower = q.toLowerCase();
    this.filteredItems = this.items.filter(it => (it.name || '').toLowerCase().includes(lower)).slice(0, this.maxSearchResults);
  }
}
