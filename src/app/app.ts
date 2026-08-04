import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService, Item } from './services/item.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  items: Item[] = [];
  newItem: Item = {
    name: '',
    description: '',
    quantity: 1,
    status: 'Disponivel'
  };
  errorMessage: string = '';
  successMessage: string = '';

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
        console.error('Erro ao buscar itens:', err);
        this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API Flask está em execução.';
      }
    });
  }

  addItem(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newItem.name || !this.newItem.name.trim()) {
      this.errorMessage = 'Por favor, preencha o nome do item antes de continuar.';
      return;
    }

    if (this.newItem.quantity < 1) {
      this.errorMessage = 'A quantidade mínima deve ser de pelo menos 1 unidade.';
      return;
    }

    this.itemService.createItem(this.newItem).subscribe({
      next: (createdItem) => {
        this.items.push(createdItem);
        this.newItem = { name: '', description: '', quantity: 1, status: 'Disponivel' };
        this.successMessage = 'Item cadastrado com sucesso!';
        setTimeout(() => { this.successMessage = ''; }, 4000);
      },
      error: (err) => {
        console.error('Erro ao criar item:', err);
        this.errorMessage = 'Ocorreu um erro ao salvar o item no banco de dados.';
      }
    });
  }
}
