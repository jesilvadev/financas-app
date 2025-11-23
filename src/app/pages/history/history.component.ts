import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddEntryModalComponent } from '../../shared/components/add-entry-modal/add-entry-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Transacao } from '../../models/transacao.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddEntryModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  transacoes: Transacao[] = [];
  categorias: Categoria[] = [];

  filtroTipo: 'TODOS' | 'RECEITA' | 'DESPESA' = 'TODOS';
  filtroCategoriaId: string = '';
  filtroDataInicio: string = '';
  filtroDataFim: string = '';

  pageSize = 10;
  currentPage = 1;

  isEntryModalOpen = false;
  entryModalMode: 'create' | 'edit' = 'create';
  editingTransacao: Transacao | null = null;

  isConfirmDeleteOpen = false;
  deletingTransacao: Transacao | null = null;
  confirmingDelete = false;

  ngOnInit(): void {
    // SIMULAÇÃO DE DADOS (Sujeito a remoção)
    this.transacoes = [
      {
        id: '1',
        userId: 'usuario-demo',
        tipo: 'RECEITA',
        descricao: 'Salário',
        valor: 2500,
        data: new Date().toISOString(),
        categoriaId: '1',
        categoriaNome: 'Trabalho',
      },
      {
        id: '2',
        userId: 'usuario-demo',
        tipo: 'DESPESA',
        descricao: 'Supermercado',
        valor: 350,
        data: new Date().toISOString(),
        categoriaId: '2',
        categoriaNome: 'Alimentação',
      }
    ];
    this.categorias = [
      { id: '1', nome: 'Trabalho', tipo: 'RECEITA', userId: 'usuario-demo' },
      { id: '2', nome: 'Alimentação', tipo: 'DESPESA', userId: 'usuario-demo' }
    ];

  }

  get filteredTransacoes(): Transacao[] {
    let list = [...this.transacoes];

    if (this.filtroTipo !== 'TODOS') {
      list = list.filter((t) => t.tipo === this.filtroTipo);
    }
    if (this.filtroCategoriaId) {
      list = list.filter((t) => t.categoriaId === this.filtroCategoriaId);
    }
    if (this.filtroDataInicio) {
      const start = new Date(this.filtroDataInicio);
      list = list.filter((t) => new Date(t.data) >= start);
    }
    if (this.filtroDataFim) {
      const end = new Date(this.filtroDataFim);
      end.setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.data) <= end);
    }
    list.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    return list;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredTransacoes.length / this.pageSize)
    );
  }

  get pagedTransacoes(): Transacao[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTransacoes.slice(start, start + this.pageSize);
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  openEdit(t: Transacao): void {
    this.entryModalMode = 'edit';
    this.editingTransacao = t;
    this.isEntryModalOpen = true;
  }

  openDelete(t: Transacao): void {
    this.deletingTransacao = t;
    this.isConfirmDeleteOpen = true;
  }
}