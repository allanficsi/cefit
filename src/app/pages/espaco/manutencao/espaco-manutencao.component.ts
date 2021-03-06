import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AptareCrudController } from '../../../components/shared/crud/aptare-crud-controller';
import { Espaco } from '../../../model/espaco/espaco';
import { EspacoService } from '../../../services/espaco/espaco.service';
import { MensagemService } from '../../../services/shared/mensagem.service';
import { ModalItemManutencaoComponent } from '../../geral/modal-item-manutencao/modal-item-manutencao.component';
import { ResponseApi } from '../../../model/response-api';
import { EspacoFiltro } from '../../../model/espaco/filtro/espaco-filtro';
import { DialogService } from '../../../services/shared/dialog.service';
import { CadastroUnicoService } from 'src/app/services/cadastro-unico/cadastro-unico.service';

@Component({
  selector: 'app-espaco-manutencao',
  templateUrl: './espaco-manutencao.component.html',
  styleUrls: ['./espaco-manutencao.component.css']
})
export class EspacoManutencaoComponent extends AptareCrudController<Espaco, {new(): Espaco}>{

  constructor(router: Router, 
              route: ActivatedRoute,             
              service: EspacoService,
              dialog: MatDialog,
              mensagem: MensagemService,
              dialogService: DialogService) {
    super(router, route, dialog, Espaco, service, mensagem, dialogService);
  }

  iniciarPaginaPesquisar() {
    this.pesquisarItensManutencao();
  }

  pesquisarItensManutencao() {
    this.objetoAtualiza.filtro = new EspacoFiltro();
    this.objetoAtualiza.filtro.qtdItensManutencao = 0;
    
    this.service.pesquisar(this.objetoAtualiza)
                .subscribe((responseApi:ResponseApi) => {
      this.listaResultado = responseApi['data'];
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  preparaManutancaoItem(codigo) {

    let espaco = new Espaco();
    espaco.codigo = codigo;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    //dialogConfig.height = '280px';
    dialogConfig.width = '780px';
    dialogConfig.data = espaco;

    this.dialog.open(ModalItemManutencaoComponent, dialogConfig)
               .afterClosed().subscribe((data) => {

      this.pesquisarItensManutencao();

    });  

  }

}
