import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService, Item } from './services/item.service';

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

  // Variável para controlar o modal moderno de exclusão
  itemParaExcluir: Item | null = null;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (data) => {
        this.items = data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Erro ao carregar itens:', err);
        this.errorMessage = 'Não foi possível conectar ao servidor backend (Porta 5000). Verifique se ele está rodando e com CORS ativado.';
      }
    });
  }

  saveItem(): void {
    if (!this.newItem.name || this.newItem.name.trim() === '') {
      this.errorMessage = 'O nome do item é obrigatório!';
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      this.itemService.updateItem(this.editingId, this.newItem).subscribe({
        next: () => {
          this.successMessage = 'Item atualizado com sucesso!';
          this.loadItems();
          this.resetForm();
        },
        error: (err) => {
          console.error('Erro ao atualizar item:', err);
          this.errorMessage = 'Erro ao atualizar item. Verifique o console.';
        }
      });
    } else {
      this.itemService.createItem(this.newItem).subscribe({
        next: () => {
          this.successMessage = 'Item cadastrado com sucesso!';
          this.loadItems();
          this.resetForm();
        },
        error: (err) => {
          console.error('Erro ao criar item:', err);
          this.errorMessage = 'Erro ao cadastrar item. Verifique o console.';
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

  // Abre o modal moderno de exclusão
  abrirModalExclusao(item: Item): void {
    this.itemParaExcluir = item;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Fecha o modal sem excluir
  fecharModalExclusao(): void {
    this.itemParaExcluir = null;
  }

  // Executa a exclusão de fato após confirmar no modal
  confirmarExclusao(): void {
    if (!this.itemParaExcluir || !this.itemParaExcluir.id) return;

    const id = this.itemParaExcluir.id;
    this.itemService.deleteItem(id).subscribe({
      next: () => {
        this.successMessage = 'Item excluído com sucesso!';
        this.loadItems();
        this.fecharModalExclusao();
      },
      error: (err) => {
        console.error('Erro ao excluir item:', err);
        this.errorMessage = 'Erro ao excluir item.';
        this.fecharModalExclusao();
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.newItem = { name: '', description: '', quantity: 1, status: 'Disponivel' };
  }
}
